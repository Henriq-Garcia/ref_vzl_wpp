import { PrismaClient } from "@prisma/client";
import { config } from "dotenv"
config();

const { BASE_URL_COBCO, FFMPEG_PATH, COBCO_USER, COBCO_PASS, COBCO_PROJETO, COBCO_CLIENTE } = process.env
if (!BASE_URL_COBCO || !FFMPEG_PATH || !COBCO_USER || !COBCO_PASS || !COBCO_PROJETO || !COBCO_CLIENTE)  throw new Error("Ambiente não configurado corretamente");

global.cobcoUrl = BASE_URL_COBCO;
global.cobcoUser = COBCO_USER;
global.cobcoPass = COBCO_PASS;
global.cobcoProjeto = COBCO_PROJETO;
global.cobcoCliente = COBCO_CLIENTE;
global.ffmpegPath = FFMPEG_PATH
global.prisma = new PrismaClient();