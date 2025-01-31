import { Router } from "express";
import { getMessagesController } from "../controllers/mensagem.controller";

export const mensagemRouter = Router()

mensagemRouter.get("/", getMessagesController)