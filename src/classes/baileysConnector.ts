import { instancia } from "@prisma/client";
import makeWASocket, { ConnectionState, WAMessage, WASocket } from "@whiskeysockets/baileys";
import pino from "pino";
import { findNumero } from "../prisma/numero.worker";
import { createInstancia, findInstancia, updateInstancia } from "../prisma/instancia.worker";
import { baileysAuthState } from "../helpers/baileysAuthState";
import { Boom } from "@hapi/boom";
import { toDataURL } from "qrcode";
import { createMensagem, deleteMessage, updateMessageContent } from "../prisma/mensagem.worker";
import { getMessageContent } from "../helpers/getMessageContent";
import { generateMd5Hash } from "../helpers/generateMd5Hash";
import { removeChavesDeAutenticacaoDaInstancia } from "../prisma/chaveDeAutenticacao.worker";
import { createMensagemCrua } from "../prisma/mensagemCrua.worker";

export class BaileysConnector {
    private baileysConfiguration: any = {
        logger: pino({ level: "silent" })
    };
    instancia?: instancia | null;
    authState?: { state: any; saveCreds: () => Promise<any> };
    socket?: WASocket;
    alias?: string;
    numero: string;

    constructor(numero: string) {
        this.numero = numero;
    }

    async init(newInstance: boolean) {
        try {
            const num = await findNumero({ numero: this.numero });
            if (!num) throw new Error("Número não encontrado");

            if (newInstance) {
                this.instancia = await createInstancia({
                    codigoloja: num.codigoloja,
                    conectado: false,
                    numeroid: num.id
                });
            } else {
                this.instancia = await findInstancia({ numeroid: num.id });
            }

            this.alias = num.alias;
            this.authState = await baileysAuthState(this.numero);
            this.baileysConfiguration.auth = this.authState.state;
            this.socket = makeWASocket(this.baileysConfiguration);
            await this.setSocketHandlers();
        } catch (error) {
            console.error(`Erro ao inicializar BaileysConnector para ${this.numero}:`, error);
        }
    }

    async setSocketHandlers() {
        if (!this.socket || !this.authState) {
            console.warn("Socket ou authState não inicializados corretamente, tentando novamente...");
            return this.init(false);
        }

        this.socket.ev.on("creds.update", this.authState.saveCreds);
        this.socket.ev.on("connection.update", this.onConnectionUpdate.bind(this));
        this.socket.ev.on("messages.upsert", this.onMessagesUpsert.bind(this));
        this.socket.ev.on("messaging-history.set", this.onMessagesUpsert.bind(this));
    }

    async onConnectionUpdate(data: Partial<ConnectionState>) {
        if (!this.instancia) {
            console.warn("Instância não iniciada, tentando reiniciar...");
            return this.init(false);
        }

        try {
            const { qr, lastDisconnect, connection } = data;

            if (connection === "close" && lastDisconnect?.error) {
                const statusCode = (lastDisconnect.error as Boom)?.output?.statusCode;

                if ([401, 428, 408].includes(statusCode)) {
                    console.warn(`Conexão encerrada para ${this.numero} - Código ${statusCode}`);
                    await updateInstancia({ id: this.instancia.id }, { conectado: false });
                    await this.socket?.ws.close();
                    await removeChavesDeAutenticacaoDaInstancia(this.numero);
                }

                console.log(`Reiniciando instância para ${this.numero}...`);
                await this.init(false);
            }

            if (connection === "open") {
                console.log(`Conexão estabelecida para ${this.numero}`);
                await updateInstancia({ id: this.instancia.id }, { conectado: true });

                const userId = this.socket?.user?.id;
                if (userId && !userId.includes(this.numero)) {
                    console.warn(`Usuário logado não corresponde ao número esperado (${userId} vs ${this.numero}), deslogando...`);
                    await this.socket.logout();
                }
            }

            if (qr) {
                const url = await toDataURL(qr);
                await updateInstancia({ id: this.instancia.id }, { qrcode: url });
            }
        } catch (error) {
            console.error(`Erro no onConnectionUpdate para ${this.numero}:`, error);
        }
    }

    async onMessagesUpsert(data: { messages: WAMessage[] }) {
        if (!this.socket?.user?.id || !this.alias) {
            console.warn(`Usuário não autenticado ou alias ausente para ${this.numero}, reiniciando conexão...`);
            return this.init(false);
        }

        const socketNum = this.socket.user.id.split("@")[0]?.split(":")[0];

        for (const message of data.messages) {
            try {
                const remoteJid = message.key.remoteJid?.split("@")[0];

                const baseMensagem: any = {
                    de: message.key.fromMe ? socketNum : remoteJid,
                    para: !message.key.fromMe ? socketNum : remoteJid,
                    data: new Date((message.messageTimestamp as number) * 1000)
                };

                const msg = await createMensagem(baseMensagem);
                if (!msg) {
                    console.warn(`Falha ao criar mensagem para ${this.numero}`);
                    continue;
                }

                let messageContent;
                try {
                    messageContent = await getMessageContent(message, msg.id);
                    if (!messageContent) {
                        console.warn(`Conteúdo da mensagem ausente, removendo mensagem ID ${msg.id}`);
                        await deleteMessage(msg.id);
                        continue;
                    }
                } catch (error) {
                    console.warn(`Erro ao obter conteúdo da mensagem, removendo mensagem ID ${msg.id}`);
                    await deleteMessage(msg.id);
                    continue;
                }

                const msgHash = generateMd5Hash(JSON.stringify({ ...baseMensagem, ...messageContent }));
                await updateMessageContent(msg.id, { ...messageContent, hash: msgHash });

                const dataRaw = {
                    mensagemid: msg.id,
                    conteudo: message,
                    hash: generateMd5Hash(JSON.stringify(message))
                };

                await createMensagemCrua(dataRaw);
            } catch (error) {
                console.error(`Erro ao processar mensagem para ${this.numero}:`, error);
            }
        }
    }
}
