import { instancia } from "@prisma/client";
import makeWASocket, { WASocket } from "@whiskeysockets/baileys";
import pino from "pino";
import { findNumero } from "../prisma/numero.worker";
import { createInstancia, findInstancia, findInstanciaByNumeroId } from "../prisma/instancia.worker";
import { baileysAuthState } from "../helpers/baileysAuthState";

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
    }
}