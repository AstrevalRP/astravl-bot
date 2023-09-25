import { Collection } from 'discord.js'

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string
            CLIENT_ID: string
            GUILD_ID : string
        }
    }
}

declare module "discord.js" {
    export interface Client {
        commands: Collection<unknown, any>
    }
}

export {}