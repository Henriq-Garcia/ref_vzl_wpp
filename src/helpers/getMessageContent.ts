import { WAMessage, assertMediaContent } from "@whiskeysockets/baileys";
import { extension } from "mime-types";
import { fileToBase64 } from "./convertFileToBase64";
import { thumbnailBase64 } from "./canvasThumbnail";
import { postFileToBucket } from "./saveFilesBucket";

export async function getMessageContent(message: WAMessage, messageId: number): Promise<any> {
    try {
        if (!message?.message || !message.key?.id) return;
        
        const messageType = Object.keys(message.message)[0];
        const messageContent = message.message;
        
        if (["conversation", "extendedTextMessage"].includes(messageType)) {
            return { mensagem: messageContent[messageType]?.text || messageContent.conversation };
        }

        if (["imageMessage", "videoMessage", "documentMessage", "stickerMessage"].includes(messageType)) {
            const content = assertMediaContent(messageContent);
            const fileExtension = extension(content.mimetype);
            const base64Anexo = await fileToBase64(content, messageType.replace("Message", ""));
            let base64Thumbnail, thumbnailUrl, anexoUrl;
            if (["imageMessage", "videoMessage", "documentMessage"].includes(messageType)) {
                thumbnailUrl = await thumbnailBase64(base64Anexo, messageType.replace("Message", ""), content.mimetype);
            }
            
            anexoUrl = (await postFileToBucket(`${messageId}.${fileExtension}`, base64Anexo, `whatsapp/anexos/${messageId}`))["content"]["link_arquivo"];
            
            return {
                mensagem: messageContent[messageType]?.caption,
                anexo: anexoUrl,
                ...(thumbnailUrl && { thumbnail: thumbnailUrl })
            };
        }
    } catch (error) {
        return null;
    }
}
