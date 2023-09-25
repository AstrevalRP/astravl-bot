// see discord.js doc
import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
const prompt = require("prompt-sync")({sigint:true});

dotenv.config();

const rest = new REST().setToken(process.env.TOKEN);
console.log('Delete all guild commands? Y/n')
const confirm: string = prompt();

if (confirm === 'Y') {
    rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: [] })
        .then(() => console.log('Successfully deleted all guild commands.'))
        .catch(error => console.error(`Please enter a "Y" or "n"`));
} else if (confirm === 'n') {
    console.log('Cancelled');
}