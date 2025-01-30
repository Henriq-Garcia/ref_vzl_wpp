import "./config/config"
import express from "express"
import { configServer } from "./api/config/configExpress"

const app = express()

configServer(app);

app.listen(5555, () => {
    console.log("servidor iniciado na porta 5555")
})