import { findInstanciaByNumeroId } from "./instancia.worker";

export async function createNumero(data: { codigoloja: number, numero: string }) {
    try {
        const result = await prisma.numero.create({
            data
        });
        return result;
    } catch (error) {
        return undefined;
    };
};

export async function findNumero(numero: string) {
    return prisma.numero.findUnique({
        where: {
            numero
        }
    });
};

export async function findNumeroById(id: number) {
    return prisma.numero.findUnique({
        where: {
            id
        }
    });
}

export async function findLojaNumeros(codigoloja: number) {
    const result = await prisma.numero.findMany({
        where: {
            codigoloja
        }
    })
    const formatedResult = await Promise.all(result.map(async (numero) => ({
        ...numero,
        instanciaConectada: (await findInstanciaByNumeroId(numero.id))?.conectado
    })))
    return formatedResult
}