import axios from "axios";

async function authenticateCobCo() {
    const payload = {
        cpf: cobcoUser,
        senha: cobcoPass,
        projeto: cobcoProjeto,
        at_cliente: cobcoCliente
    };

    try {
        const response = await axios.post(`https://${cobcoUrl}:10740/api/dados-usuario`, payload);
        global.cobcoToken = response.data.token;
    } catch (error) {
    }
}

export async function postFileToBucket(fileName: string, fileBase64: string, folder: string) {
    const payload = {
        nome_arquivo: fileName,
        bucket: "corban-vazoli",
        diretorio_arquivo: folder,
        conteudo_arquivo_b64: fileBase64
    };

    try {
        const response = await axios.post(`https://${cobcoUrl}:10740/api/s3/arquivos`, payload, {
            headers: {
                Authorization: cobcoToken,
                "Content-Type": "application/json"
            }
        });
        return { error: false, content: response.data };
    } catch (error: any) {
        if (error.response && error.response.status === 401 || error instanceof ReferenceError) {
            await authenticateCobCo();

            try {
                const retryResponse = await axios.post(`https://${cobcoUrl}:10740/api/s3/arquivos`, payload, {
                    headers: {
                        Authorization: cobcoToken,
                        "Content-Type": "application/json"
                    }
                });
                return { error: false, content: retryResponse.data };
            } catch (retryError) {
                return { error: true, message: retryError };
            }
        }

        return { error: true, message: error };
    }
}
