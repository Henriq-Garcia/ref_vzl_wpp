import { Request, Response } from "express";
import { createNumero, findNumero } from "../../prisma/numero.worker";
import { BaileysConnector } from "../../classes/baileysConnector";

export async function createInstanciaController(req: Request, res: Response): Promise<any> {
    const { numero, codigoloja, alias } = req.body
    if (!numero || !codigoloja) {
        return res.status(400).send({
            error: true,
            message: "Parametros invalidos"
        })
    }
    try {
        const numExists = await findNumero(numero)
        if (numExists !== null) {
            new BaileysConnector(numExists.numero).init(true)
        } else {
            const num = await createNumero({codigoloja, numero, alias})
            new BaileysConnector(num.numero).init(true)
        }
        return res.status(201).send({
            error: false,
            message: "Instacia iniciada"
        })
    } catch (error) {
        res.status(500).send({
            error: true,
            message: "Erro no servidor durante criação da Instancia"
        })
    }
}