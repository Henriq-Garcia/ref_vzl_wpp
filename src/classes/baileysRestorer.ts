import { findManyInstancias } from "../prisma/instancia.worker";
import { findNumeroById } from "../prisma/numero.worker";
import { BaileysConnector } from "./baileysConnector";

export class BaileysRestorer {
    async restore() {
        const instancias = await findManyInstancias()
        for (const instancia of instancias) {
            const numero = await findNumeroById(instancia.numeroid)
            new BaileysConnector(numero.numero).init(false)
        }
    }
}