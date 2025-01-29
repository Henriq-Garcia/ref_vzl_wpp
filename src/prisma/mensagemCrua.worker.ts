export async function createMensagemCrua(data: { conteudo: any, mensagemid: number, hash: string }) {
    try {
        const result = await prisma.mensagemcrua.create({
            data
        });
        return result;
    } catch (error) {
        return undefined;
    };
};

export async function findMensagemCrua(mensagemid: number) { 
    return await prisma.mensagemcrua.findFirst({
        where: {
            mensagemid
        }
    });
}