import { Router } from "express";
import { createInstanciaController, getInstanciaQRCodeController, getLojasNumeroController } from "../controllers/instancia.controller";

export const instanciaRouter = Router()

instanciaRouter.post("/create", createInstanciaController)
instanciaRouter.get("/qrcode", getInstanciaQRCodeController)
instanciaRouter.get("/", getLojasNumeroController)