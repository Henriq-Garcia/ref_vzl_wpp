import { Sql } from "@prisma/client/runtime/library"
import { findLojaNumeros } from "./numero.worker"
import { mensagem, Prisma } from "@prisma/client"
import { findMensagemCrua } from "./mensagemCrua.worker"

export async function createMensagem(data: { de: string, para: string, timestamp: Date }) {
    try {
        const result = await prisma.mensagem.create({
            data
        })
        return result
    } catch (error) {
        return undefined
    }
}

export async function updateMessageContent(id: number, data: { mensagem?: string, anexo?: string, thumbnail: string, hash?: string }) {
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

    const queries = numerosDaLoja.map(numero => {
        return prisma.mensagem.findMany({
            orderBy: { timestamp: "desc" },
            where: {
                OR: [
                    { de: { contains: numero.numero }, para: { contains: conversa } },
                    { de: { contains: conversa }, para: { contains: numero.numero } }
                ]
            },
            take: limit,
            skip: offset
        })}
    )
    let mensagens: any[] = (await Promise.all(queries)).flat()
    mensagens = mensagens.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    mensagens = await Promise.all(mensagens.map(async (mensagem) => ({
        ...mensagem,
        fromMe: await getMessageFromMe(mensagem.id)
    })))

    return mensagens
}

async function getMessageFromMe(messageid: number): Promise<boolean> {
    const res = await findMensagemCrua(messageid);
    const conteudo = res?.conteudo as Prisma.JsonObject | undefined;

    return (conteudo?.key as { fromMe?: boolean })?.fromMe ?? false;
}


