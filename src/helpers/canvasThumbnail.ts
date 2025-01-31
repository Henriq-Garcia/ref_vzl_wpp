import { createCanvas } from "canvas";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import { getDocument } from "pdfjs-dist";
import { createReadStream } from "streamifier";

ffmpeg.setFfmpegPath(ffmpegPath);

export async function thumbnailBase64(fileBase64: string, type: string, mimeType?: string): Promise<string> {
    const tamanho = 250;

    // Verificação de entrada
    if (!fileBase64 || fileBase64.length === 0) {
        throw new Error("O arquivo Base64 está vazio ou inválido.");
    }

    const fileBuffer = Buffer.from(fileBase64, "base64");
    if (fileBuffer.length === 0) {
        throw new Error("Erro ao converter Base64 para Buffer: O Buffer está vazio.");
    }

    switch (type) {
        case "image":
            const thumbnailBuffer = await sharp(fileBuffer)
                .resize({ width: tamanho })
                .jpeg()
                .toBuffer();
            return thumbnailBuffer.toString("base64");

        case "video":
            return new Promise((resolve, reject) => {
                const videoStream = createReadStream(Buffer.from(fileBase64, "base64"));
                let imageBuffer: Buffer[] = [];

                ffmpeg(videoStream)
                    .inputFormat("mp4")
                    .outputOptions("-vcodec", "png")
                    .frames(1)
                    .format("image2")
                    .pipe()
                    .on("start", (commandLine) => {
                    })
                    .on("error", (err, stdout, stderr) => {
                        reject(err);
                    })
                    .on("data", (chunk) => imageBuffer.push(chunk))
                    .on("end", async () => {
                        try {
                            const frameBuffer = Buffer.concat(imageBuffer);
                            if (frameBuffer.length === 0) {
                                throw new Error("FFmpeg não conseguiu capturar um frame do vídeo.");
                            }

                            const thumbnailBuffer = await sharp(frameBuffer)
                                .resize({ width: tamanho })
                                .jpeg()
                                .toBuffer();

                            resolve(thumbnailBuffer.toString("base64"));
                        } catch (error) {
                            reject(error);
                        }
                    })
                    .on("error", (error) => {
                        reject(new Error("Erro ao processar o vídeo com ffmpeg."));
                    });
            });

        case "document":
            if (mimeType === "application/pdf") {
                const pdf = await getDocument({ data: fileBuffer }).promise;
                const page = await pdf.getPage(1);
                const scale = 0.5;
                const viewport = page.getViewport({ scale });

                const canvas = createCanvas(viewport.width, viewport.height);
                const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;

                await page.render({ canvasContext: ctx, viewport }).promise;
                const imageBuffer = canvas.toBuffer("image/jpeg");

                const thumbnailBuffer = await sharp(imageBuffer)
                    .resize({ width: tamanho })
                    .jpeg()
                    .toBuffer();

                return thumbnailBuffer.toString("base64");
            }
            throw new Error("Tipo de documento não suportado.");
    }

    throw new Error("Tipo de arquivo não suportado.");
}
