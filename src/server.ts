import "./config/config"
import express from "express"
import { configServer } from "./api/config/configExpress"
import { BaileysRestorer } from "./classes/baileysRestorer"

const app = express()
const restorer = new BaileysRestorer()

configServer(app);

app.listen(5555, async () => {
    await restorer.restore()
    console.log("servidor iniciado na porta 5555")
})