import { instancia } from "@prisma/client"

export async function createInstancia(data: { codigoloja: number, conectado: boolean, numeroid: number }) {
    return await prisma.instancia.create({
        data
    });
};

export async function updateInstancia(id: number, data: { conectado?: boolean, qrcode?: string }) {
    return await prisma.instancia.update({
        where: {
            id
        },
        data 
    });
};

export async function findInstancia(id: number) {
    return await prisma.instancia.findUnique({
        where: {
            id
        }
    });
};

export async function findInstanciaByNumeroId(numeroid: number) {
    return await prisma.instancia.findUnique({
        where: {
            numeroid
        }
    });
};

export async function findManyInstancias(filter?: Partial<instancia>) {
    return await prisma.instancia.findMany({
        where: filter,
        omit: { qrcode: true}
    });
};