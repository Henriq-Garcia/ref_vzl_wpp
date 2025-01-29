import { PrismaClient } from "@prisma/client";
import { WAMessage } from "@whiskeysockets/baileys";

declare global {
    var pendingMessages: WAMessage[]
    var cobcoUrl: string
    var prisma: PrismaClient;
    var cobcoToken: string;
}