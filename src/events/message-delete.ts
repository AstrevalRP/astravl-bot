import { Events, Message } from "discord.js";
import { ArrayUtils, JsonUtils } from "../global/utils";
import { RoleMessageObject } from "../global/json-formats";
const SAVED_MESSAGES_PATH = '../../data/saved_messages.json'

module.exports = {
	name: Events.MessageDelete,
	async execute(message : Message) {
		// Remove registered message from disk
		const savedMessages = JsonUtils.getJsonContent(SAVED_MESSAGES_PATH) as RoleMessageObject[];
		const correspondingRoleMessage = savedMessages.find(roleMessage => roleMessage.roleMessage.id === message.id);
		if (correspondingRoleMessage) {
			JsonUtils.writeJsonContent(SAVED_MESSAGES_PATH, ArrayUtils.removeElement(savedMessages, correspondingRoleMessage), '\t');
		}
	}
};