import "./config/config"
import { BaileysConnector } from "./classes/baileysConnector"

(async () => {
    const baileys = new BaileysConnector("17997819563")
    await baileys.init(false)
})()