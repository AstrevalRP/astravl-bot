// see discord.js doc
import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
const prompt = require("prompt-sync")({sigint:true});

dotenv.config();

const rest = new REST().setToken(process.env.TOKEN);
console.log('Enter command info : "commandName commandID"')
const commandInfo: string = prompt();
const commandName = commandInfo.split(' ')[0];
const commandID = commandInfo.split(' ')[1];

rest.delete(Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, commandID))
	.then(() => console.log(`Successfully deleted guild command "/${commandName}"`))
	.catch(error => {
		console.error(`Cannot find command "/${commandName}".`);
	});