import { PrismaClient } from "@prisma/client";
import { config } from "dotenv"
config();

const { BASE_URL_COBCO } = process.env
if (!BASE_URL_COBCO)  throw new Error("Ambiente não configurado corretamente");

global.cobcoUrl = BASE_URL_COBCO;
global.prisma = new PrismaClient();