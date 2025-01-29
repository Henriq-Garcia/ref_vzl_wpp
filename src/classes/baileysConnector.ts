import { instancia } from "@prisma/client";
import makeWASocket, { ConnectionState, WASocket } from "@whiskeysockets/baileys";
import pino from "pino";
import { findNumero } from "../prisma/numero.worker";
import { createInstancia, findInstancia, findInstanciaByNumeroId, updateInstancia } from "../prisma/instancia.worker";
import { baileysAuthState } from "../helpers/baileysAuthState";
import { Boom } from "@hapi/boom";
import { toDataURL } from "qrcode";

export class BaileysConnector {
    private baileysConfiguration: any = {
        logger: pino({
            level: "silent"
        })
    };
    instancia?: instancia|null;
    authState?: { state: any, saveCreds: () => Promise<any> };
    socket?: WASocket;
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
    }

    async onConnectionUpdate(data: Partial<ConnectionState>) {
        if (!this.instancia) throw new Error("Instancia não iniciada")
        const { qr, lastDisconnect, connection } = data
        if (connection === "close") {
            if ((lastDisconnect?.error as Boom).output.statusCode === 401) {
                await this.socket?.ws.close()
                await updateInstancia(this.instancia.id, { conectado: false })
            };
            this.init(false)
        } else if (connection === "open") {
            await updateInstancia(this.instancia.id, { conectado: true })
            if (this.socket?.user?.id) {
                if (!this.socket.user.id.includes(this.numero)) {
                    await this.socket.logout()
                }
            }
        }
        if (qr) {
            const url = await toDataURL(qr)
            await updateInstancia(this.instancia.id, { qrcode: url })
        }
    }
}