import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, Colors, CommandInteraction, EmbedBuilder, PermissionFlagsBits, RoleSelectMenuBuilder, SlashCommandBuilder } from "discord.js"
import { GlobalUI } from "../../global/UI";
import { JsonUtils } from "../../global/utils";
import { RoleMessageObject } from "../../global/json-formats";
const SAVED_MESSAGES_PATH = '../../data/saved_messages.json'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('config-role-select')
		.setDescription("Permet d'envoyer un message permettant de s'attribuer des rôles dans le salon donné.")
		.addStringOption(option => option.setName('message').setDescription('Une note supplémentaire incluse dans le message').setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	
	async execute(interaction : CommandInteraction) {
		const additionalNote = (interaction.options.get('message') !== null) ? `__**Note à ajouter :**__\n"**${interaction.options.get('message')!.value}**"` : '';
		
		const reply = await interaction.reply({
			embeds:[
				new EmbedBuilder()
					.setTitle('Configuration des réactions/rôles.')
					.setColor(Colors.Red)
					.setDescription(
						`Séléctionne tes rôles à l'aide du menu déroulant ci-dessous puis réagit avec les émojis correspondants. `
						+'Séléctionne enuite le salon dans lequel envoyer le message.\n'
						+'Aussi simple que ça !\n\n'
						+additionalNote
					)
					.setFields({ name: 'Dans:', value: '-' })
			], components: [
				new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
					new RoleSelectMenuBuilder()
						.setCustomId('role-config-role-select')
						.setPlaceholder('Séléctionne les rôles à ajouter ici')
						.setMinValues(1)
						.setMaxValues(10)),
				new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
					new ChannelSelectMenuBuilder()
						.setChannelTypes(ChannelType.GuildText)
						.setCustomId('role-config-channel-select')
						.setPlaceholder('Choisis le salon dans lequel envoyer le message ici') 
						.setMaxValues(1)),
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId('create-role-select-message')
						.setLabel(`Envoyer`)
						.setStyle(ButtonStyle.Danger)
						.setDisabled(true),
					GlobalUI.cancelButton
				)
			],
			ephemeral: false // Can't react otherwise
		});

		const savedMessages = JsonUtils.getJsonContent(SAVED_MESSAGES_PATH) as RoleMessageObject[];
		savedMessages.push({ 
			roleMessage: {
				id: (await reply.awaitMessageComponent()).message.id,
				roles: []
			}
		});
		JsonUtils.writeJsonContent(SAVED_MESSAGES_PATH, savedMessages, '\t');
	}
};