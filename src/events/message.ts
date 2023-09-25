import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, Message, TextChannel, channelMention, roleMention, userMention } from "discord.js";
import fs = require('fs');
import path = require('path');
const settings = require('../../data/settings.json');

const blackListPath : string = '../../data/blacklist.json'
const deletMessagesListPath : string = '../../data/deleted_messages.json'

function splitMessage(message : Message):string[] {
	let wordList = []
	const specialCharactersRegex = /[.\-_, ;:?!^]/;
	message.content.split(specialCharactersRegex).forEach(word => { if (word !== '' && word !== null) { wordList.push(word) } });
	return wordList;
}
function containsSwearword(message:string[], blackList):boolean {
	let containsSwearword = false;
	message.forEach(word => {
		if (blackList.some((item: string) => item === word)) { containsSwearword = true; }
	});
	return containsSwearword;
} 
function getSwearWord(message:string[], blackList):string[] {
	let swearWords:string[] = [];
	message.forEach(word => {
		if (blackList.some((item: string) => item === word)) { swearWords.push(word); }
	});
	return swearWords;
}

module.exports = {
	name: Events.MessageCreate,
	async execute(message : Message) {
		if (message.author === message.client.user) { return; }

		const letAsIsButton = new ButtonBuilder().setLabel('Laisser').setCustomId('let-as-is-button').setStyle(ButtonStyle.Secondary);
		const cancelTimeOutButton = new ButtonBuilder().setLabel('Annuler').setCustomId('cancel-time-out-button').setStyle(ButtonStyle.Danger);
		const moderationChannel = message.guild.channels.cache.get(settings.channels.moderation);

		// Obscene language
        const blackList = JSON.parse(fs.readFileSync(path.join(__dirname, blackListPath), {encoding: 'utf8'}));
        const deletMessagesList = JSON.parse(fs.readFileSync(path.join(__dirname, deletMessagesListPath), {encoding: 'utf8'}));

		if (containsSwearword(splitMessage(message), blackList)) {
			const jsonLogs = {
				userId: message.author.id,
				terms: getSwearWord(splitMessage(message), blackList),
				message: message.content,
				channelId: message.channelId,
				at: message.createdAt
			};
			deletMessagesList.push(jsonLogs);
			fs.writeFileSync(path.join(__dirname, deletMessagesListPath), JSON.stringify(deletMessagesList, null, "\t"), {encoding: 'utf8'});

			await message.member.timeout(5 * 60 * 1000, 'Obscene language'); // <-- corresponds to 5 minutes (1000 being the miliseconds)
			await message.reply({ content : '# Surveille ton langage !' });
			await message.delete();

			const embed = new EmbedBuilder()
				.setTitle('__**Langage obscène utilisé**__')
				.setDescription(`**${userMention(message.author.id)} a dit :**\n\n||***"${message.content}"***||\n\n**${message.author.username}** a été timeout pour 5 minutes à <t:${Math.floor(Date.now()/1000)}:t>. Si vous voulez unmute cet utilisateur ou le laisser telquel, utilisez les bouttons ci-dessous.`)
				.setColor('Red')
				.setFields(
					{name : 'Membre muté', value: userMention(message.author.id), inline: true}, 
					{name : 'Le', value: `<t:${Math.floor(Date.now()/1000)}:D> à <t:${Math.floor(Date.now()/1000)}:t>`, inline: true},
					{name : 'Dans', value: `${channelMention(message.channelId)}`, inline: true})
				.setFooter({ text: 'Le timeout peut toujours être géré via clique droit sur le membre en question' });
			
			(moderationChannel as TextChannel).send({ content: `## Votre attention est requise ${roleMention(settings.roles.moderator)}`, 
				embeds: [embed],
				components: [new ActionRowBuilder<ButtonBuilder>().addComponents(letAsIsButton, cancelTimeOutButton)]
			});
		}
	
		// Anti Flooding
		const floodLimit : number = 6;
		
		splitMessage(message).forEach(async word => {
			let counter = 0;
			const wordChars:string[] = [...word];
			
			const embed = new EmbedBuilder()
				.setTitle('__**Flooding**__')
				.setDescription(`**Pas d'inquiétude, ce membre a été sanctionné :**\n\n${userMention(message.author.id)} a floodé **\`${message.content}\`**.`)
				.setColor('Orange')
				.setFields(
					{name : 'Date', value: `<t:${Math.floor(Date.now()/1000)}:D> à <t:${Math.floor(Date.now()/1000)}:t>`, inline: true},
					{name : 'Salon', value: `${channelMention(message.channelId)}`, inline: true},
				);
			
			for (let i = 0; i < wordChars.length; i++) {
				if (counter === floodLimit - 1) {
					(moderationChannel as TextChannel).send({ embeds: [embed] });
					await message.member.timeout(15 * 1000, 'Flooding'); // <-- corresponds to 30 seconds (1000 being the miliseconds)
					await message.reply({ content: '## Évite de flood s\'il te plait'} )
					await message.delete();
					return;
				} else {
					if (wordChars[i+1] !== undefined) { wordChars[i].toLowerCase() === wordChars[i+1].toLowerCase() ? counter += 1 : counter = 0; }
				}
			}
		});
	}
};