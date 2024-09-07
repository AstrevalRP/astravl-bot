/**
 * @fileoverview This file handles the @link Events.MessageCreate event that is fired by @link discord.js
 */

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, Events, Message, MessageCreateOptions, TextChannel, channelMention, roleMention, userMention } from 'discord.js';
import { ArrayUtils, MathUtils, TimingUtils, MessageUtils, JsonUtils } from '../global/utils';
import fs = require('fs');
import path = require('path');
import settings from '../../data/settings.json';
import specialUsers from '../../data/special_users.json'
import { objToMap } from '../global/json-formats';
// import lastWelcomeMessage from '../../data/last_welcome_message.json'

const LAST_WELCOME_MESSAGE_PATH = '../../data/last_welcome_message.json'

const JOKE_MESSAGE_PROBABILITY: number = 1/200;
const WELCOME_MESSAGE_PROBABILITY: number = 1/2;
const WELCOME_MESSAGE_TIME_INTERVAL: number = TimingUtils.milisecondsFromMinutes(60);
// Fishing Image Example
const FISHING_EMBED_IMAGE_EXAMPLE: string = (path.join(__dirname, '../../assets/images/disconnecting_from_all_devices_example.png'));
// Obscene language
const DELETED_MESSAGE_LIST_PATH = '../../data/deleted_messages.json';
const deletedMessageList : Object[] = JSON.parse(fs.readFileSync(path.join(__dirname, DELETED_MESSAGE_LIST_PATH), { encoding: 'utf8' }));

module.exports = {
	name: Events.MessageCreate,
	async execute(message : Message) {
		if (message.author === message.client.user) return; // Don't process messages sent by the bot itself from now on

		const letAsIsButton = new ButtonBuilder().setLabel('Laisser tel quel').setCustomId('let-as-is-button').setStyle(ButtonStyle.Secondary);
		const cancelTimeOutButton = new ButtonBuilder().setLabel(`Unmuter l'utilisateur`).setCustomId('cancel-time-out-button').setStyle(ButtonStyle.Danger);		
		const moderationChannel = message.guild!.channels.cache.get(settings.channels.moderation) as TextChannel;

		/**
		 * The original message that have been sent.  
		 * This constant must be prefered over {@link message} when accessing the message's data because the initial message could be deleted.
		 */
		const originalMessage: Message = message;
		
		if (MessageUtils.containsBanedLink(message.content)) {
			await message.delete();
			
			/**
			 * #### Indicates whether or not the message's author can be timed out.  
			 * 
			 * ---
			 * - **true** only if it is not a staff member. 
			 * - (staff shouldn't be able to be timed-out due to higher permissions).
			 */
			let canTimeout: boolean = true;
			try {
				await message.member!.timeout(TimingUtils.milisecondsFromMinutes(30), 'Fishing');
			} catch (error) {
				canTimeout = false;
			}

			const moderationMessage: MessageCreateOptions = canTimeout ? { 
				content: '# Un lien froduleux a été bloqué, __votre attention est toutefois requise__.',
				embeds: [new EmbedBuilder()
					.setColor(Colors.Red)
					.setTitle('__Lien potentiellement froduleux__')
					.setDescription(`Le lien en question envoyé par ${originalMessage.author.id}`)
					.setFields(
						{ name : 'Membre muté', value: userMention(originalMessage.author.id), inline: true }, 
						{ name : 'Le', value: `<t:${Math.floor(Date.now()/1000)}:D> à <t:${Math.floor(Date.now()/1000)}:t>`, inline: true },
						{ name : 'Dans', value: `${channelMention(originalMessage.channelId)}`, inline: true })
				], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(letAsIsButton, cancelTimeOutButton)]
			} : {
				content: `# ${roleMention(settings.roles.staff)}...`, 
				embeds: [new EmbedBuilder()
					.setColor(Colors.DarkRed)
					.setTitle('Fishing ???')
					.setDescription(
						`${userMention(message.author.id)} a envoyé un lien supra chelou dans ${channelMention(originalMessage.channelId)}.\n`
						+`Soit il a pété un câble soit il a été hacké (bien plus probable à mon humble avis d'algorithme dénué de raison)\n`
						+'Faites quelque chose !')
					.setFields(
						{name : 'Membre muté', value: userMention(originalMessage.author.id), inline: true}, 
						{name : 'Le', value: `<t:${Math.floor(Date.now()/1000)}:D> à <t:${Math.floor(Date.now()/1000)}:t>`, inline: true},
						{name : 'Dans', value: `${channelMention(originalMessage.channelId)}`, inline: true})
				]
			};
			const dmMessage: MessageCreateOptions = canTimeout ? { 
				embeds : [new EmbedBuilder()
					.setColor(Colors.NotQuiteBlack)
					.setTitle('Ton message a été supprimé car considéré comme tentative de fishing ou obscène.')
					.setDescription(
						'**Ton message semblait contenir un lien froduleux. Pour rappel, le voici:**\n'
						+`Le <t:${Math.floor(originalMessage.createdAt.getTime()/1000)}:D> à <t:${Math.floor(originalMessage.createdAt.getTime()/1000)}:t> dans ${channelMention(originalMessage.channelId)} : ${originalMessage.content}\n\n`
						+`Si la suppression de ton message est une erreur, je te demande pardon pour la gêne occasionée et t'incite à contacter ${userMention(specialUsers.dev)} (le développeur du bot) pour le prévenir de cette erreur au plus vite.\n`
						+'**Si ce lien a été envoyé à ton insu, tu as sûrement été toi-même victime de fishing, __change ton mot de passe au plus vite et déconnecte toi de partout de ton conte discord__**')
					.setImage(`attachment://${FISHING_EMBED_IMAGE_EXAMPLE}`)
					.setFooter({ text: `Tu m'excuseras pour le screenshot foireux` })
				]
			} : {
				content : '## Mec...',
				embeds : [new EmbedBuilder()
					.setColor(Colors.DarkRed)
					.setTitle(originalMessage.author.id === specialUsers.sparta ? `Alors comme ça on se fait hack le bougre ? :face_with_raised_eyebrow:` : `Alors soit t'as pété un câble soit tu t'es fait hack...`)
					.setDescription(
						'**.ce message a été envoyé à ton nom:**\n'
						+`Le <t:${Math.floor(originalMessage.createdAt.getTime()/1000)}:D> à <t:${Math.floor(originalMessage.createdAt.getTime()/1000)}:t> dans ${channelMention(originalMessage.channelId)} : ${originalMessage.content}\n\n`
						+ (originalMessage.author.id === specialUsers.sparta) ? `Si je fais erreur, préviens le p'tit vite souley (clique directement là dessus ça ira plus vite :point_right: ${userMention(specialUsers.dev)})\n` : `Si c'est une erreur, préviens ${userMention(specialUsers.dev)}\n`
						+'**Si ce lien a été envoyé à ton insu, __change ton mot de passe au plus vite et déconnecte toi de partout de ton conte discord__ (et préviens accessoirement les autres staffs).**')
					.setImage(`attachment://${FISHING_EMBED_IMAGE_EXAMPLE}`)
					.setFooter({ text: `Tu m'excuseras pour le screenshot foireux` })
				]
			}

			await moderationChannel.send(moderationMessage);
			try { // Some users cannot recieve DM's because of their account settings.
				await originalMessage.author.send(dmMessage);
			} catch (error) { 
				// There's nothing we can do... (* Vidéo club intesifies *)
				console.log(`Couldn't send DM message to @${originalMessage.author.username} because of user settings.`); 
			}

		} else if (MessageUtils.containsCurseWord(message.content)) {
			await message.delete();
			
			// Update deleted_messages.json
			deletedMessageList.push(
				{
					userId: originalMessage.author.id,
					terms: MessageUtils.getCurseWords(originalMessage.content),
					message: originalMessage.content,
					channelId: originalMessage.channelId,
					at: originalMessage.createdAt
				}
			);
			JsonUtils.writeJsonContent(DELETED_MESSAGE_LIST_PATH, deletedMessageList, '\t');

			/**
			 * #### Indicates whether or not the message's author can be timed out.  
			 * 
			 * ---
			 * - **true** only if it is not a staff member. 
			 * - (staff shouldn't be able to be timed-out due to higher permissions).
			 */
			let canTimeout: boolean = true;
			try {
				await originalMessage.member!.timeout(TimingUtils.milisecondsFromMinutes(5), 'Obscene language');
			} catch (error) {
				canTimeout = false;
			}

			if (canTimeout) {
				await moderationChannel.send({ 
					content: `## Votre attention est requise ${roleMention(settings.roles.moderator)}.`, 
					embeds: [new EmbedBuilder()
						.setTitle('__**Langage obscène utilisé**__')
						.setDescription(
							`**${userMention(originalMessage.author.id)} a dit :**\n\n`
							+`"||***${originalMessage.content}***||"\n\n`
							+`**${originalMessage.author.username}** a été timeout pour 5 minutes à <t:${Math.floor(Date.now()/1000)}:t>.\n`
							+'Si vous voulez unmute cet utilisateur ou le laisser tel quel, utilisez les bouttons ci-dessous.')
						.setColor('Red')
						.setFields(
							{name : 'Membre muté', value: userMention(originalMessage.author.id), inline: true}, 
							{name : 'Le', value: `<t:${Math.floor(Date.now()/1000)}:D> à <t:${Math.floor(Date.now()/1000)}:t>`, inline: true},
							{name : 'Dans', value: `${channelMention(originalMessage.channelId)}`, inline: true})
						.setFooter({ text: 'Le timeout peut toujours être géré via clique droit sur le membre en question' })],
					components: [new ActionRowBuilder<ButtonBuilder>().addComponents(letAsIsButton, cancelTimeOutButton)]
				});
			} else {
				try { // Some users cannot recieve DM's because of their account settings.
					await originalMessage.author.send({ embeds: [new EmbedBuilder()
						.setTitle(`Les règles s'appliquent aussi aux staffs.`)
						.setColor(Colors.Red)
						.setDescription(`**||${MessageUtils.getCurseWords(originalMessage.content)[0]}||** ? Comment ça mon reuf :face_with_raised_eyebrow:`)] 
					});
				} catch (error) {
					// Still... there's nothing we can do... (* Vidéo club intesifies even more *)
					console.log(`Couldn't send DM message to @${originalMessage.author.username} because of user settings.`); 
				}
			}
		} else if (MessageUtils.containsFlooding(message.content, 10)) {
			await message.delete();
			
			/**
			 * #### Indicates whether or not the message's author can be timed out.  
			 * 
			 * ---
			 * - **true** only if it is not a staff member. 
			 * - (staff shouldn't be able to be timed-out due to higher permissions).
			 */
			let canTimeout: boolean = true;
			try {
				await originalMessage.member!.timeout(TimingUtils.milisecondsFromSeconds(30), 'Flooding');
			} catch (error) {
				canTimeout = false;
			}

			if (canTimeout) {
				const description_messages: string[] = [
					`${userMention(originalMessage.author.id)} a innondé le chat ||(désolé mais ~~floodé~~ c'est vraiment moche)||`,
					`${userMention(originalMessage.author.id)} a ~~floodé~~ innondé le chat`,
					`${userMention(originalMessage.author.id)} a... *floodé*||**??**||... le chat`,
					`${userMention(originalMessage.author.id)} a... *floodé* (pas très français tout ça) le chat`,
					`${userMention(originalMessage.author.id)} a ***f̵͖̜̉ͅl̙͖̑̾ͣo̯̱̊͊͢o̯̱̊͊͢ḑ̴̞͛̒é*** (???)... le chat`
				];
				await moderationChannel.send({ embeds: [new EmbedBuilder()
					.setTitle('__**Flooding**__')
					.setDescription(`**Pas d'inquiétude, cet utilisateur a été sanctionné :**\n\n ${ArrayUtils.getRandomIndex(description_messages)} : **\`${originalMessage.content}\`**.`)
					.setColor('Orange')
					.setFields(
						{ name : 'Date', value: `<t:${Math.floor(Date.now()/1000)}:D> à <t:${Math.floor(Date.now()/1000)}:t>`, inline: true },
						{ name : 'Salon', value: `${channelMention(originalMessage.channelId)}`, inline: true }
					)] 
				});
				await originalMessage.author.send({ content: `Évite de flood s'il te plaît! (la répétition abusive de caractères)\nça peut vite tourner au drame si tout le monde s'y met :eyes:`})
			} else {
				console.log(`@${message.author.username} cannot be timed out because of higher permissions`);
				try { // Some users cannot recieve DM's because of their account settings.
					await originalMessage.author.send({ embeds: [new EmbedBuilder()
						.setTitle(`Les règles s'appliquent aussi aux staffs.`)
						.setDescription(originalMessage.author.id !== specialUsers.sparta ? 'Évite de flood dans le chat.' : `Évite de flood mon petit sparta (t'sais quand tu répètes excessivement un caractère à la chaîne)`)
						.setColor(Colors.Red)] 
					});
				} catch (error) { // Dans mon esprit tout l'hiver...
					console.log(`couldn't send DM message to @${originalMessage.author.username} because of user settings.`); 
				}
			}
		} else { // No issue has been found
			if (message.content.toLocaleLowerCase().trimStart().startsWith('bienvenu') /* Always use the minimum required, typos are a thing */) {
				const welcomeMessages = [
					'Bienvenue!',
					'Bienvenue!!',
					'Bienvenue !',
					'Bienvenue',
					'Bienvenue :wave:',
					'Bienvenue :v:',
					'Bienvenue :)',
					'Bienvenue :D'
				];

				const lastSentMessageDate: number = Date.parse(objToMap(JsonUtils.getJsonContent(LAST_WELCOME_MESSAGE_PATH)).get('sentAt'));
				
				if ((await message.guild!.members.fetch(message.author)).roles.cache.some(role => role.id === settings.roles.staff)
					&& (Date.now() - lastSentMessageDate >= WELCOME_MESSAGE_TIME_INTERVAL || lastSentMessageDate === -1)
					&& MathUtils.randomIntExclusive(0, 1/WELCOME_MESSAGE_PROBABILITY) === 0) {

					await MessageUtils.sendMessage(message.channel as TextChannel, ArrayUtils.getRandomIndex(welcomeMessages), TimingUtils.milisecondsFromSeconds(1));
					JsonUtils.writeJsonContent(LAST_WELCOME_MESSAGE_PATH, { sentAt : new Date().toISOString() }, '');
				}
			} else if (message.author.id === specialUsers.sparta) {				
				if (MathUtils.randomIntExclusive(0, 1/JOKE_MESSAGE_PROBABILITY) === 0) {
					const joke_messages = [
						'||On te croit.|',
						'||On te croit||',
						'On te croit.',
						'On te croit',
						'On te croit sparta',
						`On te croit ${userMention(specialUsers.sparta)}`,
						`C'est ce qu'ils disent tous`,
						`C'est ce qu'ils disent tous.`,
						`||C'est ce qu'ils disent tous||`,
						`||C'est ce qu'ils disent tous.||`
					]
					
					setTimeout(async() => {
						await message.channel.sendTyping();
					}, TimingUtils.milisecondsFromSeconds(1));
					setTimeout(async () => { 
						await message.reply(ArrayUtils.getRandomIndex(joke_messages)); 
					}, TimingUtils.milisecondsFromSeconds(2));
				}
			}
		}

	}
};