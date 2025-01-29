import { sleep } from "../helpers/sleep"

export async function createChaveDeAutenticacao(nomechave: string, chaveautenticacao: string) {
    return await prisma.chavedeautenticacao.upsert({
        where: {
            nomechave
        },
        create: {
            nomechave,
            chaveautenticacao
        },
        update: {
            chaveautenticacao
        }
    });
};

export async function findChaveDeAutenticacao(nomechave: string) {
    return await prisma.$transaction(async (transaction) => {
        for (let tentativa = 0; tentativa < 5; tentativa++) {
            const result = await transaction.chavedeautenticacao.findUnique({
                where: {
                    nomechave
                }
            })
            if (result) {
                return JSON.stringify(result.chaveautenticacao)
            }
            await sleep(500)
        };
        return undefined
    });
};

export async function removeChaveDeAutenticacao(nomechave: string) {
    return await prisma.chavedeautenticacao.delete({
        where: {
            nomechave
        }
    });
};