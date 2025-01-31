import { instancia } from "@prisma/client";
import makeWASocket, { assertMediaContent, ConnectionState, WAMessage, WASocket } from "@whiskeysockets/baileys";
import pino from "pino";
import { findNumero } from "../prisma/numero.worker";
import { createInstancia, findInstancia, findInstanciaByNumeroId, updateInstancia } from "../prisma/instancia.worker";
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
        logger: pino({
            level: "silent"
        })
    };
    instancia?: instancia|null;
    authState?: { state: any, saveCreds: () => Promise<any> };
    socket?: WASocket;
    alias?: string;
    numero: string;

    constructor (numero: string) {
        this.numero = numero;
    }

    async init(newInstance: boolean) {
        const num = await findNumero(this.numero);
        if (!num) throw new Error("Numero não encontrado");
        if (newInstance) {
            const instancia = await createInstancia({
                codigoloja: num.codigoloja,
                conectado: false,
                numeroid: num.id
            });
            this.instancia = instancia;
        } else {
            const instancia = await findInstanciaByNumeroId(num.id);
            this.instancia = instancia;
        }
        this.alias = num.alias;
        this.authState = await baileysAuthState(this.numero);
        this.baileysConfiguration.auth = this.authState.state;
        this.socket = makeWASocket(this.baileysConfiguration);
        await this.setSocketHandlers();
    }

    async setSocketHandlers() {
        if (!this.socket|| !this.authState) {
            return await this.init(false);
        }
        this.socket.ev.on("creds.update", this.authState.saveCreds);
        this.socket.ev.on("connection.update", this.onConnectionUpdate.bind(this))
        this.socket.ev.on("messages.upsert", this.onMessagesUpsert.bind(this))
        this.socket.ev.on("messaging-history.set", this.onMessagesUpsert.bind(this))
    }

    async onConnectionUpdate(data: Partial<ConnectionState>) {
    if (!this.instancia) throw new Error("Instância não iniciada");

    try {
        const { qr, lastDisconnect, connection } = data;

        if (connection === "close" && lastDisconnect?.error) {
            const statusCode = (lastDisconnect.error as Boom)?.output?.statusCode;
            
            if (statusCode === 401) {
                await this.socket?.ws.close();
                await updateInstancia(this.instancia.id, { conectado: false });
                await removeChavesDeAutenticacaoDaInstancia(this.numero)
                return;
            }

            await this.init(false);
        }

        if (connection === "open") {
            await updateInstancia(this.instancia.id, { conectado: true });

            const userId = this.socket?.user?.id;
            if (userId && !userId.includes(this.numero)) {
                await this.socket.logout();
            }
        }

        if (qr) {
            const url = await toDataURL(qr);
            await updateInstancia(this.instancia.id, { qrcode: url });
        }
    } catch (error) {
        
    }
}


    async onMessagesUpsert(data: { messages: WAMessage[] }) {
        if (!this.socket?.user?.id || !this.alias) throw new Error("Usuário não autenticado");
        
        const socketNum = this.socket.user.id.split("@")[0]?.split(":")[0];
        
        for (const message of data.messages) {
            try {
                const remoteJid = message.key.remoteJid?.split("@")[0];
                const baseMensagem: any = {
                    de: message.key.fromMe ? socketNum : remoteJid,
                    para: !message.key.fromMe ? socketNum : remoteJid,
                    timestamp: new Date((message.messageTimestamp as number) * 1000)
                };
                
                const msg = await createMensagem(baseMensagem);
                if (!msg) continue;
                let messageContent;
                
                try{
                    messageContent = await getMessageContent(message, msg.id);
                    if (!messageContent) {
                        await deleteMessage(msg.id);
                        continue;
                    }
                } catch(error) {
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
                await createMensagemCrua(dataRaw)
            } catch (error) {
                continue
            }
        }
    }
}