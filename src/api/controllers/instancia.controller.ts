import { Request, Response } from "express";
import { createNumero, findLojaNumeros, findNumero, updateNumero } from "../../prisma/numero.worker";
import { BaileysConnector } from "../../classes/baileysConnector";
import { findInstancia, findInstanciaByNumeroId } from "../../prisma/instancia.worker";

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
        return res.status(500).send({
            error: true,
            message: "Erro no servidor durante criação da Instancia"
        })
    }
}

// TODO: getInstanciaQRCodeController() => input:numero; output: QrCode // DONE
export async function getInstanciaQRCodeController(req: Request, res: Response): Promise<any> {
    let { numero } = req.query;
    if (!numero) {
        return res.status(400).send({
            error: true,
            message: "Informe um numero"
        })
    }
    try {
        const num = await findNumero(String(numero))
        let instancia = await findInstanciaByNumeroId(num.id)
        while (!instancia.qrcode) {
            instancia = await findInstanciaByNumeroId(num.id)
        }
        return res.status(200).send({
            error: false,
            message: "QrCode encontrado",
            qrcode: instancia.qrcode
        })
    } catch (error) {
        res.status(500).send({
            error: true,
            message: "Erro no servidor durante a busca do QrCode"
        })
    }
}

// TODO: getLojasNumeroController() => input: codigoloja; output: todos os numeros da loja e o status de suas instancias // DONE
export async function getLojasNumeroController(req: Request, res: Response): Promise<any> {
    let { codigoloja }: any = req.query;
    if (!codigoloja) {
        return res.status(400).send({
            error: true,
            message: "Informe um codigo de loja"
        })
    }
    codigoloja = Number(codigoloja)
    if (!(typeof codigoloja === "number")) {
        return res.status(400).send({
            error: true,
            message: "O codigo da loja deve ser um numero"
        })
    }
    try {
        const numeros = await findLojaNumeros(codigoloja)
        if (numeros.length === 0) {
            return res.status(204).send()
        }
        return res.status(200).send({
            error: false,
            message: "Numeros encontrados",
            numeros
        })
    } catch (error) {
        res.status(500).send({
            error: true,
            message: "Erro no servidor durante a busca dos numeros"
        })
    }

}

// TODO: setNumeroAliasController() => input: numero, alias; // DONE
export async function setNumeroAliasController(req: Request, res: Response): Promise<any> {
    let { numero, alias }: any = req.body
    if (!numero && alias) {
        return res.status(400).send({
            error: true,
            message: "Parametros invalidos"
        })
    }
    try {
        await updateNumero(numero, alias)
        return res.status(200).send({
            error: false,
            message: "Alias criado"
        })
    } catch (error) {
        return res.status(500).send({
            error: true,
            message: "Erro no servidor durante a criação do alias"
        })
    }
}