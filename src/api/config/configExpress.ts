import cors from "cors"
import {Express, json} from "express";
import { instanciaRouter } from "../routes/instancia.routes";

export function configServer(app: Express) {
    app.use(json())
    app.use(cors())
    app.use("/instancia", instanciaRouter)
}