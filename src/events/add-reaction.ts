import { Events, Message, MessageReaction, Role, User } from 'discord.js';
import { JsonUtils, ReactionUtils } from '../global/utils';
import { objToMap, RoleMessageObject } from '../global/json-formats';
const SAVED_MESSAGES_PATH = '../../data/saved_messages.json'

module.exports = {
	name: Events.MessageReactionAdd,
	async execute(reaction : MessageReaction, user: User) {
		if (user.bot) return

		const message = reaction.message;
		const savedMessages: RoleMessageObject[] = JsonUtils.getJsonContent(SAVED_MESSAGES_PATH) as RoleMessageObject[];

		const isRoleConfigMessage = message.embeds[0].title?.startsWith('Configuration des réactions');
		const isRoleMessage = message.embeds[0].footer?.text.startsWith('Tu peux aussi retirer ta réaction');

		if (savedMessages.some(savedMessage => savedMessage.roleMessage.id === message.id)) {
			if (isRoleConfigMessage) {
				ReactionUtils.updatedReactionMessageConfigEmojis(message as Message);
			} else if (isRoleMessage) {
				const correspondingJsonObject = savedMessages.find(obj => obj.roleMessage.id === message.id);
				
				if (correspondingJsonObject) {
					const correspondingRole = await message.guild!.roles.fetch(objToMap(correspondingJsonObject.roleMessage.roles).get(reaction.emoji.toString()));					
					const member = await message.guild!.members.fetch(user);
					
					try {
						await member.roles.add(correspondingRole!);
					} catch (error) {
						console.warn(
							`The bot was not able to add @${correspondingRole!.name} to roles for @${user.username}.\n`
							+`Ensure that the bot's role is high enough is the hierchy.`
						);
					}
				}
			}
		}
	}
};