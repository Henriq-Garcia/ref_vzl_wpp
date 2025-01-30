import "./config/config"
import { BaileysConnector } from "./classes/baileysConnector"

(async () => {
    const baileys = new BaileysConnector("17982107650")
    await baileys.init(false)
})()