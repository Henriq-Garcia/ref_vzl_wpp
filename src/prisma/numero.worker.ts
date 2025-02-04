import { findInstanciaByNumeroId } from "./instancia.worker";

export async function createNumero(data: { codigoloja: number; numero: string; alias?: string }) {
    try {
        return await prisma.numero.create({ data });
    } catch (error) {
        return undefined;
    }
}

export async function findNumero(where: { numero?: string; id?: number }) {
    try {
        if (!where.id && !where.numero) throw new Error("ID ou número devem ser fornecidos.");
        const uniqueWhere = where.id ? { id: where.id } : { numero: where.numero };
        return await prisma.numero.findUnique({ where: uniqueWhere }) || null;
    } catch (error) {
        return null;
    }
}

export async function updateNumero(where: { numero?: string; id?: number }, data: { alias?: string; numero?: string }) {
    try {
        if (!where.id && !where.numero) throw new Error("ID ou número devem ser fornecidos.");
        const uniqueWhere = where.id ? { id: where.id } : { numero: where.numero };
        const existingNumero = await prisma.numero.findUnique({ where: uniqueWhere });
        if (!existingNumero) {
            throw new Error("Número não encontrado");
        }
        return await prisma.numero.update({ where: uniqueWhere, data });
    } catch (error) {
        return null;
    }
}

export async function findNumerosDaLoja(codigoloja: number) {
    try {
        const numeros = await prisma.numero.findMany({ where: { codigoloja } });
        const instancias = await Promise.all(
            numeros.map(async (numero) => ({
                ...numero,
                instanciaconectada: (await findInstanciaByNumeroId(numero.id))?.conectado ?? false
            }))
        );
        return instancias;
    } catch (error) {
        return [];
    }
}
