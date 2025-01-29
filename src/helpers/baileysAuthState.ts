import { proto } from "@whiskeysockets/baileys";
import { createChaveDeAutenticacao, findChaveDeAutenticacao, removeChaveDeAutenticacao } from "../prisma/chaveDeAutenticacao.worker";
import { BufferJSON } from "./bufferJson";
import { initAuthenticationCreds } from "./initAuthenticationCreds";

export async function baileysAuthState(numero: string) {
    const resultCreds = await findChaveDeAutenticacao(`creds.${numero}`);
    const creds = resultCreds ? JSON.parse(resultCreds, BufferJSON.reviver) : initAuthenticationCreds();

    return {
        state: {
            creds,
            keys: {
                get: async (type: string, ids: any) => {
                    const data: {[keys: string]: any} = {};
                    await Promise.all(ids.map(async (id: any) => {
                        const result = await findChaveDeAutenticacao(`${type}-${id}.${numero}`);
                        let value = result ? JSON.parse(result, BufferJSON.reviver): undefined;
                        if (type === "app-state-sync-key") {
                            value = proto.Message.AppStateSyncKeyData.fromObject(data);
                        }
                        data[id] = value;
                    }))
                    return data;
                },
                set: async (data: any) => {
                    const tasks = [];
                    for (const category of Object.keys(data)) {
                        for (const id of Object.keys(data[category])) {
                            const value = JSON.parse(JSON.stringify(data[category][id], BufferJSON.replacer));
                            const key = `${category}-${id}.${numero}`;
                            tasks.push(value ? createChaveDeAutenticacao(key, value) : removeChaveDeAutenticacao(key))
                        }
                    }
                    await Promise.all(tasks)
                }
            }
        },
        saveCreds: () => {
            return createChaveDeAutenticacao(`creds.${numero}`, JSON.parse(JSON.stringify(creds, BufferJSON.replacer)))
        }
    }
}