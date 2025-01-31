import cors from "cors"
import {Express, json} from "express";
import { instanciaRouter } from "../routes/instancia.routes";
import { mensagemRouter } from "../routes/mensagem.routes";

export function configServer(app: Express) {
    app.use(json())
    app.use(cors())
    app.use("/instancia", instanciaRouter)
    app.use("/mensagem", mensagemRouter)
}