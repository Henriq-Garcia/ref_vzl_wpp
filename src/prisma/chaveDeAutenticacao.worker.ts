import { sleep } from "../helpers/sleep"

export async function createChaveDeAutenticacao(nomechave: string, chaveautenticacao: string) {
    try {
        return await prisma.chavedeautenticacao.upsert({
            where: { nomechave },
            create: { nomechave, chaveautenticacao },
            update: { chaveautenticacao }
        });
    } catch (error) {
        return null;
    }
}

export async function findChaveDeAutenticacao(nomechave: string) {
    try {
        for (let tentativa = 0; tentativa < 5; tentativa++) {
            const result = await prisma.chavedeautenticacao.findUnique({
                where: { nomechave }
            });

            if (result) {
                return JSON.stringify(result.chaveautenticacao);
            }

            await sleep(500);
        }
        return null;
    } catch (error) {
        return null;
    }
}

export async function removeChaveDeAutenticacao(nomechave: string) {
    try {
        return await prisma.chavedeautenticacao.delete({
            where: { nomechave }
        });
    } catch (error) {
        return null;
    }
}

export async function removeChavesDeAutenticacaoDaInstancia(numero: string) {
    try {
        return await prisma.chavedeautenticacao.deleteMany({
            where: { nomechave: { contains: numero } }
        });
    } catch (error) {
        return null;
    }
}
