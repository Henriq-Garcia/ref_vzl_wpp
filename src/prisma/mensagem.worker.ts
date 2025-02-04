import { Sql } from "@prisma/client/runtime/library"
import { findLojaNumeros } from "./numero.worker"
import { mensagem, Prisma } from "@prisma/client"
import { findMensagemCrua } from "./mensagemCrua.worker"

export async function createMensagem(data: { de: string, para: string, data: Date }) {
    try {
        const result = await prisma.mensagem.create({
            data
        })
        return result
    } catch (error) {
        return undefined
    }
}

export async function updateMessageContent(id: number, data: { mensagem?: string, anexo?: string, thumbnail?: string, hash?: string }) {
    try {
        return await prisma.mensagem.update({
            where: { id },
            data
        })
    } catch (error) {
        return undefined
    }
}

export async function deleteMessage(id: number) {
    return await prisma.mensagem.delete({
        where: { id }
    })
}

export async function findMessagesLoja(codigoloja: number, conversa: string, pagina: number) {
    const numerosDaLoja = await findLojaNumeros(codigoloja)

    if (numerosDaLoja.length === 0) {
        return undefined
    }

    const limit = 50 / numerosDaLoja.length
    const offset = (pagina - 1) * limit

    let messagesReturn: any[] = []
    for (const numero of numerosDaLoja) {
        let result = await prisma.mensagem.findMany({
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
        result = await Promise.all(result.map(async (mensagem) => {
            const fromMe = await getMessageFromMe(mensagem.id)
            return {
                ...mensagem,
                fromMe,
                aliasde: numero.alias && fromMe ? numero.alias : undefined
            }
        }))
        messagesReturn.push(...result)
    }
    return messagesReturn
}

async function getMessageFromMe(messageid: number): Promise<boolean> {
    const res = await findMensagemCrua(messageid);
    const conteudo = res?.conteudo as Prisma.JsonObject | undefined;

    return (conteudo?.key as { fromMe?: boolean })?.fromMe ?? false;
}


