import { Request, Response } from "express";
import { createNumero, findNumerosDaLoja, findNumero, updateNumero } from "../../prisma/numero.worker";
import { BaileysConnector } from "../../classes/baileysConnector";
import { findInstancia } from "../../prisma/instancia.worker";


const sendResponse = (res: Response, status: number, error: boolean, message: string, data: any = null) => {
    const response = { error, message, ...(data && { data }) };
    return res.status(status).send(response);
};

export async function createInstanciaController(req: Request, res: Response): Promise<any> {
    try {
        const { numero, codigoloja, alias } = req.body;
        if (!numero || !codigoloja) {
            return sendResponse(res, 400, true, "Parâmetros inválidos");
        }

        let num = await findNumero({ numero });
        if (!num) {
            num = await createNumero({ codigoloja, numero, alias });
        }

        new BaileysConnector(num.numero).init(true);
        return sendResponse(res, 201, false, "Instância iniciada");

    } catch (error) {
        return sendResponse(res, 500, true, "Erro no servidor ao criar a instância");
    }
}

export async function getInstanciaQRCodeController(req: Request, res: Response): Promise<any> {
    try {
        const { numero } = req.query;
        if (!numero) {
            return sendResponse(res, 400, true, "Informe um número");
        }

        const num = await findNumero({ numero: String(numero) });
        if (!num) {
            return sendResponse(res, 404, true, "Número não encontrado");
        }

        let instancia = await findInstancia({ numeroid: num.id });
        if (!instancia) {
            return sendResponse(res, 404, true, "Instância não encontrada");
        }

        while (!instancia.qrcode) {
            instancia = await findInstancia({ numeroid: num.id });
        }

        return sendResponse(res, 200, false, "QR Code encontrado", { qrcode: instancia.qrcode });

    } catch (error) {
        return sendResponse(res, 500, true, "Erro no servidor ao buscar o QR Code");
    }
}

export async function getLojasNumeroController(req: Request, res: Response): Promise<any> {
    try {
        let { codigoloja }: any = req.query;
        if (!codigoloja) {
            return sendResponse(res, 400, true, "Informe um código de loja");
        }

        codigoloja = Number(codigoloja);
        if (isNaN(codigoloja)) {
            return sendResponse(res, 400, true, "O código da loja deve ser um número válido");
        }

        const numeros = await findNumerosDaLoja(codigoloja);
        if (!numeros || numeros.length === 0) {
            return res.status(204).send(); // No Content
        }

        return sendResponse(res, 200, false, "Números encontrados", { numeros });

    } catch (error) {
        return sendResponse(res, 500, true, "Erro no servidor ao buscar os números");
    }
}

export async function setNumeroAliasController(req: Request, res: Response): Promise<any> {
    try {
        const { numero, alias } = req.body;
        if (!numero || !alias) {
            return sendResponse(res, 400, true, "Parâmetros inválidos");
        }

        await updateNumero({ numero }, { alias });
        return sendResponse(res, 200, false, "Alias atualizado com sucesso");

    } catch (error) {
        return sendResponse(res, 500, true, "Erro no servidor ao atualizar o alias");
    }
}
