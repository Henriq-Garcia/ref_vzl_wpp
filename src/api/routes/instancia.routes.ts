import { Router } from "express";
import { createInstanciaController, getInstanciaQRCodeController } from "../controllers/instancia.controller";

export const instanciaRouter = Router()

instanciaRouter.post("/create", createInstanciaController)
instanciaRouter.get("/qrcode", getInstanciaQRCodeController)