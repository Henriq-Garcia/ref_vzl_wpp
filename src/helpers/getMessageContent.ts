import { WAMessage, assertMediaContent } from "@whiskeysockets/baileys";
import { extension } from "mime-types";
import { fileToBase64 } from "./convertFileToBase64";

export async function getMessageContent(message: WAMessage, messageId: number): Promise<any> {
    try {
        if (!message.message) return;
        if (!message.key.id) return;

        const messageType = Object.keys(message.message)[0]
        let messageContent = message.message
        let content;
        let fileExtension;
        let base64Anexo;
        let base64Thumbnail

        switch (messageType) {
            case "conversation":
                return { mensagem: messageContent.conversation }

            case "extendedTextMessage":
                return { mensagem: messageContent.extendedTextMessage?.text }

            case "imageMessage":
                content = assertMediaContent(messageContent)
                fileExtension = extension(content.mimetype)
                base64Anexo = await fileToBase64(content, "image")
                base64Thumbnail = await fileToBase64(content, "thumbnail-image")
                return { mensagem: messageContent.imageMessage.caption, anexo: base64Anexo, thumbnail: base64Thumbnail }

            case "videoMessage":
                content = assertMediaContent(messageContent)
                fileExtension = extension(content.mimetype)
                base64Anexo = await fileToBase64(content, "video")
                base64Thumbnail = await fileToBase64(content, "thumbnail-video")
                return { mensagem: messageContent.videoMessage.caption, anexo: base64Anexo, thumbnail: base64Thumbnail }

            case "stickerMessage":
                content = assertMediaContent(messageContent)
                fileExtension = extension(content.mimetype)
                base64Anexo = await fileToBase64(content, "sticker")
                base64Thumbnail = await fileToBase64(content, "thumbnail-image")
                return { anexo: base64Anexo, thumbnail: base64Thumbnail}

            case "documentMessage":
                content = assertMediaContent(messageContent)
                fileExtension = extension(content.mimetype)
                base64Anexo = await fileToBase64(content, "document")
                base64Thumbnail = await fileToBase64(content, "thumbnail-document")
                return { mensagem: messageContent.documentMessage.caption, anexo: base64Anexo, thumbnail: base64Thumbnail }
            
            case "audioMessage":
                content = assertMediaContent(messageContent)
                fileExtension = extension(content.mimetype)
                base64Anexo = await fileToBase64(content, "audio")
                return { anexo: base64Anexo }
        }
    } catch (error) {
        return
    }    
}