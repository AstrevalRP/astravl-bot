import { Client, Collection, Events, GatewayIntentBits, Partials } from 'discord.js';
import * as commandRegister from './register-all-commands'
import * as dotenv from 'dotenv';
import path = require('path');
import fs = require('fs');

const client = new Client({
	intents : [ 
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.MessageContent, 
		GatewayIntentBits.GuildVoiceStates, 
		GatewayIntentBits.GuildMessageReactions,
	],
	partials: [ Partials.Message, Partials.Channel, Partials.Reaction ],
});

function registerCommands() {
	client.commands = new Collection();
	const foldersPath = path.join(__dirname, 'commands');
	const commandFolders = fs.readdirSync(foldersPath);
	// fetch commands
	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			if ('data' in command && 'execute' in command) {
				client.commands.set(command.data.name, command);
			} else {
				console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		}
	}
}

function registerEvents() {
	// Read event files
	const eventsPath = path.join(__dirname, 'events');
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));

	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		event.once ? client.once(event.name, (...args) => event.execute(...args)) : client.on(event.name, (...args) => event.execute(...args));
	}
}

registerCommands();
registerEvents();
commandRegister.deployCommands;

client.once(Events.ClientReady, c => {
	console.log(`Ready! logged in as ${c.user.tag}`);
});

dotenv.config();
client.login(process.env.TOKEN);
