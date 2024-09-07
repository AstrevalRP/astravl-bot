import { ActionRowBuilder, ButtonBuilder, ButtonStyle, channelMention, ChannelType, Colors, CommandInteraction, EmbedBuilder, PermissionFlagsBits, roleMention, SlashCommandBuilder } from "discord.js";

let staffRoleId : string 		 = "id-goes-here";
let moderatorRoleId : string 	 = "id-goes-here";
let adminRoleId : string 		 = "id-goes-here";
let moderationChannelId : string = "id-goes-here";
let welcomeChannelId : string 	 = "id-goes-here";
let goodbyeChannelId : string 	 = "id-goes-here";
let ticketCategoryId : string 	 = "id-goes-here";
let archivesCategoryId : string  = "id-goes-here";

export function getStaffRoleId() : string { return staffRoleId; }
export function getModeratorRoleId() : string { return moderatorRoleId; }
export function getAdminRoleId() : string { return adminRoleId; }
export function getModerationChannelId() : string { return moderationChannelId; }
export function getWelcomeChannelId() : string { return welcomeChannelId; }
export function getGoodbyeChannelId() : string { return goodbyeChannelId; }
export function getTicketCategoryId() : string { return ticketCategoryId; }
export function getArchivesCategoryId() : string { return archivesCategoryId; }

module.exports = {
	// Getters
	getStaffRoleId, getModeratorRoleId, getAdminRoleId, getModerationChannelId, getWelcomeChannelId, getGoodbyeChannelId, getTicketCategoryId, getArchivesCategoryId,

	data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Permet de configurer les paramètres généraux du bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addRoleOption(roleOption => roleOption.setName('staff-role').setDescription('Le rôle correspondant au staff').setRequired(true))
		.addRoleOption(roleOption => roleOption.setName('moderator-role').setDescription('Le rôle correspondant à la modération').setRequired(true))
		.addRoleOption(roleOption => roleOption.setName('admin-role').setDescription("Le rôle correspondant à l'administration").setRequired(true))
		.addChannelOption(channelOption => channelOption.setName('moderation-channel').setDescription("Le salon dans lequel seront envoyées les informations relatives à la modération").addChannelTypes(ChannelType.GuildText).setRequired(true))
		.addChannelOption(channelOption => channelOption.setName('welcome-channel').setDescription("Le salon dans lequel les membres seront acceuillis").addChannelTypes(ChannelType.GuildText).setRequired(true))
		.addChannelOption(channelOption => channelOption.setName('goodbye-channel').setDescription("Le salon dans lequel les les staffs setont notifié du départ d'un membre").addChannelTypes(ChannelType.GuildText).setRequired(true))
		.addChannelOption(channelOption => channelOption.setName('ticket-category').setDescription("La catégorie dans laquelle seront créés les tickets").addChannelTypes(ChannelType.GuildCategory).setRequired(true))
		.addChannelOption(channelOption => channelOption.setName('archives-category').setDescription("La catégorie dans laquelle les tickets seront déplacés après avoir été archivés").addChannelTypes(ChannelType.GuildCategory).setRequired(true)),

    async execute(interaction : CommandInteraction) {
		staffRoleId = interaction.options.get('staff-role')!.value!.toString();
		moderatorRoleId = interaction.options.get('moderator-role')!.value!.toString();
		adminRoleId = interaction.options.get('admin-role')!.value!.toString();
		moderationChannelId = interaction.options.get('moderation-channel')!.value!.toString();
		welcomeChannelId = interaction.options.get('welcome-channel')!.value!.toString();
		goodbyeChannelId = interaction.options.get('goodbye-channel')!.value!.toString();
		ticketCategoryId = interaction.options.get('ticket-category')!.value!.toString();
		archivesCategoryId = interaction.options.get('archives-category')!.value!.toString();
		
		interaction.reply({ 
			embeds: [new EmbedBuilder()
				.setTitle('Voici les paramètres séléctionnés.')
				.setColor(Colors.Green)
				.setFields(
					{ name : 'Rôle Staff', value : roleMention(staffRoleId), inline: true },
					{ name : 'Rôle Modération', value : roleMention(moderatorRoleId), inline: true },
					{ name : 'Rôle Admin', value : roleMention(adminRoleId), inline: true },
					{ name : 'Catégorie Ticket', value : channelMention(ticketCategoryId), inline: true },
					{ name : 'Catégorie Archives', value : channelMention(archivesCategoryId), inline: true },
					{ name : 'Salon Modération', value : channelMention(moderationChannelId), inline: true },
					{ name : 'Salon de Bienvenue', value : channelMention(welcomeChannelId), inline: true },
					{ name : `Salon Bybye :'(`, value : channelMention(goodbyeChannelId), inline: true }
				)],
			components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setLabel('Confirmer')
						.setCustomId('confirm-configure-bot')
						.setStyle(ButtonStyle.Danger), 
					new ButtonBuilder()
						.setLabel('Annuler')
						.setCustomId('cancel-configure-bot')
						.setStyle(ButtonStyle.Secondary)
				)]
		});
    }
};