import { Sql } from "@prisma/client/runtime/library";
import { findNumerosDaLoja } from "./numero.worker";
import { mensagem, Prisma } from "@prisma/client";
import { findMensagemCrua } from "./mensagemCrua.worker";

export async function createMensagem(data: { de: string; para: string; data: Date }) {
    try {
        return await prisma.mensagem.create({ data });
    } catch (error) {
        return null;
    }
}

export async function updateMessageContent(
    id: number,
    data: { mensagem?: string; anexo?: string; thumbnail?: string; hash?: string }
) {
    try {
        return await prisma.mensagem.update({
            where: { id },
            data
        });
    } catch (error) {
        return null;
    }
}

export async function deleteMessage(id: number) {
    try {
        return await prisma.mensagem.delete({ where: { id } });
    } catch (error) {
        return null;
    }
}

export async function findMessagesLoja(codigoloja: number, conversa: string, pagina: number) {
    try {
        const numerosDaLoja = await findNumerosDaLoja(codigoloja);

        if (numerosDaLoja.length === 0) {
            return [];
        }

        const limit = Math.floor(50 / numerosDaLoja.length);
        const offset = (pagina - 1) * limit;

        const queries = numerosDaLoja.map((numero) =>
            prisma.mensagem.findMany({
                orderBy: { data: "desc" },
                where: {
                    OR: [
                        { de: { contains: numero.numero }, para: { contains: conversa } },
                        { de: { contains: conversa }, para: { contains: numero.numero } }
                    ]
                },
                take: limit,
                skip: offset
            })
        );
        const results = await prisma.$transaction(queries);
        let messagesReturn: any[] = results.flat();
        messagesReturn = await Promise.all(
            messagesReturn.map(async (mensagem) => {
                const fromMe = await getMessageFromMe(mensagem.id);
                const numeroInfo = numerosDaLoja.find((n) => mensagem.de.includes(n.numero) || mensagem.para.includes(n.numero));
                return {
                    ...mensagem,
                    fromMe,
                    aliasde: numeroInfo?.alias && fromMe ? numeroInfo.alias : undefined
                };
            })
        );

        return messagesReturn;
    } catch (error) {
        return [];
    }
}

async function getMessageFromMe(messageid: number): Promise<boolean> {
    try {
        const res = await findMensagemCrua(messageid);
        const conteudo = res?.conteudo as Prisma.JsonObject | undefined;
        return (conteudo?.key as { fromMe?: boolean })?.fromMe ?? false;
    } catch (error) {
        return false;
    }
}
