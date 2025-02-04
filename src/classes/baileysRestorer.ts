import { deleteInstancia, findManyInstancias } from "../prisma/instancia.worker";
import { findNumero } from "../prisma/numero.worker";
import { BaileysConnector } from "./baileysConnector";

export class BaileysRestorer {
    async restore() {
        const instancias = await findManyInstancias()
        if (instancias.length == 0) return;
        for (const instancia of instancias) {
            const numero = await findNumero({ id: instancia.numeroid })
            if (instancia.conectado == false) {
                await deleteInstancia(instancia.id)
                new BaileysConnector(numero.numero).init(true)
            } else {
                new BaileysConnector(numero.numero).init(false)
            } 
        }
    }
}