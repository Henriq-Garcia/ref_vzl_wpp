import { Router } from "express";
import { createInstanciaController, getInstanciaQRCodeController, getLojasNumeroController, setNumeroAliasController } from "../controllers/instancia.controller";

export const instanciaRouter = Router()

instanciaRouter.post("/", createInstanciaController)
instanciaRouter.get("/qrcode", getInstanciaQRCodeController)
instanciaRouter.get("/", getLojasNumeroController)
instanciaRouter.patch("/", setNumeroAliasController)