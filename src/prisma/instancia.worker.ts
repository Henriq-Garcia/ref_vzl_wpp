import { instancia } from "@prisma/client"

export async function createInstancia(data: { codigoloja: number, conectado: boolean, numeroid: number }) {
    try {
        return prisma.instancia.create({ data });
    } catch (error) {
        return undefined;
    }
}

export async function updateInstancia(where: { id: number }, data: { conectado?: boolean, qrcode?: string }) {
    try {
        const existingInstancia = await prisma.instancia.findUnique({ where });
        if (!existingInstancia) throw new Error("Instancia não encontrada");
        return await prisma.instancia.update({
            where,
            data
        });
    } catch (error) {
        return undefined;
    }
}

export async function findInstancia(where: { id?: number, numeroid: number}) {
    try {
        if (!where.id && !where.numeroid) throw new Error("ID ou número devem ser fornecidos.");
        const uniqueWhere = where.id ? { id: where.id } : { numeroid: where.numeroid };
        return await prisma.instancia.findUnique({
            where: uniqueWhere
        });
    } catch (error) {
        return undefined;
    }
}

export async function findManyInstancias(filter?: Partial<instancia>) {
    try {
        return await prisma.instancia.findMany({
            where: filter,
            omit: { qrcode: true }
        });
    } catch (error){
        return undefined
    }
    
};

export async function deleteInstancia(id: number) {
    try {
        return await prisma.instancia.delete({
            where: { id }
        })
    }catch (error) {
        return undefined
    }
}