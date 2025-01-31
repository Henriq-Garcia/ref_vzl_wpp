import { Request, Response } from "express";
import { findMessagesLoja } from "../../prisma/mensagem.worker";

// TODO: getMessagesController() => input: pagina, codigoloja, numero/conversa; output: mensagens da conversa
export async function getMessagesController(req: Request, res: Response): Promise<any> {
    let pagina = Number(req.query.pagina)
    let codigoloja = Number(req.query.codigoloja)
    let numero = String(req.query.numero)

    if (!codigoloja || !numero) {
        return res.status(400).send({
            error: true,
            message: "Parametros invalidos"
        })
    }
    try {
        const messages = await findMessagesLoja(codigoloja, numero, pagina ? pagina : 1)
        if (messages.length == 0) {
            return res.status(204).send()
        }
        return res.status(200).send({
            error: false,
            messages
        })
    } catch (error) {
        return res.status(500).send({
            error: true,
            message: "Erro no servidor ao buscar mensagens"
        })
    }
    
}