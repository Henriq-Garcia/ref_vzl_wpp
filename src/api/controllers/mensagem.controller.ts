import { Request, Response } from "express";
import { findMessagesLoja } from "../../prisma/mensagem.worker";

const sendResponse = (res: Response, status: number, error: boolean, message: string, data: any = null) => {
    const response = { error, message, ...(data && { data }) };
    return res.status(status).send(response);
};

export async function getMessagesController(req: Request, res: Response) {
    try {
        const pagina = Number(req.query.pagina) || 1;
        const codigoloja = Number(req.query.codigoloja);
        const numero = String(req.query.numero).trim();

        if (isNaN(codigoloja) || !numero) {
            return sendResponse(res, 400, true, "Parâmetros inválidos. Verifique codigoloja e número.");
        }

        const messages = await findMessagesLoja(codigoloja, numero, pagina);
        if (!messages || messages.length === 0) {
            return res.status(204).send();
        }

        return sendResponse(res, 200, false, "Mensagens encontradas", { messages });

    } catch (error) {
        return sendResponse(res, 500, true, "Erro no servidor ao buscar mensagens");
    }
}
