import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import path = require('path');
import fs = require('fs');

dotenv.config()

const client = new Client({
    intents : [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates
    ]
});


// -------------------------------setup the commands-------------------------------
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
// fetch commands
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
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

// Read event files
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	event.once ? client.once(event.name, (...args) => event.execute(...args)) : client.on(event.name, (...args) => event.execute(...args));
}

client.once(Events.ClientReady, c => {
	console.log(`Ready! logged in as ${c.user.tag}`);
});

client.login(process.env.TOKEN);