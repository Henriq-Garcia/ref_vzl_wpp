import { WAMessage, assertMediaContent } from "@whiskeysockets/baileys";
import { extension } from "mime-types";
import { fileToBase64 } from "./convertFileToBase64";
import { thumbnailBase64 } from "./canvasThumbnail";

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
                return { 
                    mensagem: messageContent.conversation 
                }

            case "extendedTextMessage":
                return { 
                    mensagem: messageContent.extendedTextMessage?.text 
                }

            case "imageMessage":
                content = assertMediaContent(messageContent)
                fileExtension = extension(content.mimetype)
                base64Anexo = await fileToBase64(content, "image")
                base64Thumbnail = await thumbnailBase64(base64Anexo, "image")
                return { 
                    mensagem: messageContent.imageMessage.caption, 
                    anexo: base64Anexo, 
                    thumbnail: base64Thumbnail 
                }

            case "videoMessage":
                content = assertMediaContent(messageContent)
                fileExtension = extension(content.mimetype)
                base64Anexo = await fileToBase64(content, "video")
                base64Thumbnail = await thumbnailBase64(base64Anexo, "video")
                return { 
                    mensagem: messageContent.videoMessage.caption,
                    anexo: base64Anexo, 
                    thumbnail: base64Thumbnail 
                }

            case "stickerMessage":
                content = assertMediaContent(messageContent)
                fileExtension = extension(content.mimetype)
                base64Anexo = await fileToBase64(content, "sticker")
                return { 
                    anexo: base64Anexo
                }

            case "documentMessage":
                content = assertMediaContent(messageContent)
                fileExtension = extension(content.mimetype)
                base64Anexo = await fileToBase64(content, "document")
                base64Thumbnail = await thumbnailBase64(base64Anexo, "document", content.mimetype)
                return { 
                    mensagem: messageContent.documentMessage.caption, 
                    anexo: base64Anexo,
                    thumbnail: base64Thumbnail
                }
            
            case "audioMessage":
                content = assertMediaContent(messageContent)
                fileExtension = extension(content.mimetype)
                base64Anexo = await fileToBase64(content, "audio")
                return { 
                    anexo: base64Anexo
                }
        }
    } catch (error) {
        console.error(error)
        return
    }    
}