import { deleteInstancia, findManyInstancias } from "../prisma/instancia.worker";
import { findNumeroById } from "../prisma/numero.worker";
import { BaileysConnector } from "./baileysConnector";

export class BaileysRestorer {
    async restore() {
        const instancias = await findManyInstancias()
        for (const instancia of instancias) {
            const numero = await findNumeroById(instancia.numeroid)
            if (instancia.conectado == false) {
                await deleteInstancia(instancia.id)
                new BaileysConnector(numero.numero).init(true)
            } else {
                new BaileysConnector(numero.numero).init(false)
            } 
        }
    }
}