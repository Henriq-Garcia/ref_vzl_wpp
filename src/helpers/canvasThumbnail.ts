import { createCanvas, loadImage } from "canvas";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg"
import { getDocument } from "pdfjs-dist"
import { createReadStream } from "streamifier";

ffmpeg.setFfmpegPath(ffmpegPath)

export async function thumbnailBase64(fileBase64: string, type: string, mimeType?: string): Promise<string> {
    const tamanho = 250
    const fileBuffer = Buffer.from(fileBase64, "base64")
    switch (type) {
        case "image":
            const thumbnailBuffer = await sharp(fileBuffer)
                .resize({width: tamanho})
                .jpeg()
                .toBuffer()
            return thumbnailBuffer.toString("base64")
        case "video":
            return new Promise((resolve, reject) => {
                // cria uma stream de leitura
                const videoStream = createReadStream(fileBuffer)
                let imageBuffer = []

                // usa o ffmpeg para selecionar um frame e transformar em imagem
                ffmpeg(videoStream)
                    .inputFormat("mp4")
                    .seekInput(0)
                    .frames(1)
                    .format("image2")
                    .pipe()
                    .on("data", (chunk) => imageBuffer.push(chunk))
                    .on("end", async () => {
                        try {
                            const frameBuffer = Buffer.concat(imageBuffer)

                            const thumbnailBuffer = await sharp(frameBuffer)
                                .resize({width: tamanho})
                                .jpeg()
                                .toBuffer()

                            resolve(thumbnailBuffer.toString("base64"))
                        } catch (error) {
                            reject(error)
                        }
                    })
            })
        case "document":
            switch (mimeType) {
                case "application/pdf":
                    // carrega o pdf e seleciona a primeira pagina
                    const pdf = await getDocument({data: fileBuffer}).promise
                    const page = await pdf.getPage(1)

                    // escala da imagem e qualidade
                    const scale = 1.5
                    const viewport = page.getViewport({scale})

                    const canvas = createCanvas(viewport.width, viewport.height)
                    const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D

                    await page.render({canvasContext: ctx, viewport}).promise
                    const imageBuffer = canvas.toBuffer("image/jpeg")

                    const thumbnailBuffer = await sharp(imageBuffer)
                        .resize({width: tamanho})
                        .jpeg()
                        .toBuffer()

                    return thumbnailBuffer.toString("base64")
            }
    }
}