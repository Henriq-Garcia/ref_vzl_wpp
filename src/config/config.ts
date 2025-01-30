import { PrismaClient } from "@prisma/client";
import { config } from "dotenv"
config();

const { BASE_URL_COBCO, FFMPEG_PATH } = process.env
if (!BASE_URL_COBCO || !FFMPEG_PATH)  throw new Error("Ambiente não configurado corretamente");

global.cobcoUrl = BASE_URL_COBCO;
global.ffmpegPath = FFMPEG_PATH
global.prisma = new PrismaClient();