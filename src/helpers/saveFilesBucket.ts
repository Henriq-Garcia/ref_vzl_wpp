import axios from "axios"

export async function postFileToBucket(fileName: string, fileBase64: string, folder: string) {
    const payload = {
        nome_arquivo: fileName,
        bucket: "corban-vazoli",
        diretorio_arquivo: folder,
        conteudo_arquivo_b64: fileBase64
    }

    try {
        const response = await axios.post(`https://${cobcoUrl}:10740/api/s3/arquivos`, payload, {
            headers: {
                Authorization: cobcoToken,
                "Content-Type": "application/json"
            }
        })
        return { error: false, content: response.data }
    } catch (error) {
        return { error: true, message: error };
    }
}