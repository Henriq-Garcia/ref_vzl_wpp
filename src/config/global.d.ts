import { PrismaClient } from "@prisma/client";
import { WAMessage } from "@whiskeysockets/baileys";

declare global {
    var cobcoUrl: string
    var prisma: PrismaClient;
    var cobcoToken: string;
    // var ffmpegPath: string;
    var cobcoUser: string;
    var cobcoPass: string;
    var cobcoProjeto: string;
    var cobcoCliente: string;
}