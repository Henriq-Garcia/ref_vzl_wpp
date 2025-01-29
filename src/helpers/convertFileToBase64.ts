import { DownloadableMessage, downloadContentFromMessage } from "@whiskeysockets/baileys"
import internal from "stream"

export async function fileToBase64(content: DownloadableMessage, messageType: "image" | "video" | "document" | "audio" | "sticker" | "thumbnail-document" | "thumbnail-image" | "thumbnail-video") {
    const media = await downloadContentFromMessage(content, messageType)
    return new Promise((resolve, reject) => {
        if (!media) reject(null);
        const chunks: Buffer[] = []
        let stream: Buffer
        media.on("readable", () => {
            let chunk;
            while (null !== (chunk = media.read())) {
                chunks.push(chunk)
            }
        })
        media.on("end", () => {
            stream = Buffer.concat(chunks)
            resolve(stream.toString("base64"))
        })
        media.on("error", () => {
            reject(null)
        })
    })
}