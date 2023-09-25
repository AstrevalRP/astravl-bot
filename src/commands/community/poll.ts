import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Channel, ChannelType, CommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel, channelMention, roleMention } from "discord.js";
import { GlobalUI } from "../../global/UI";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Crée un message permettant de configurer un sondage dans le chat')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option =>
            option.setName('title')
            .setDescription('Titre du sondage')
            .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('channel')
            .setDescription('Séléctionne le salon dans lequel tu veux envoyer le sondage')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('mention')
            .setDescription('Rôle à mentionner')
            .setRequired(false)
        )
        .addStringOption(option => 
            option.setName('description')
            .setDescription('Description du sondages')
            .setRequired(false)
        ),
    
    async execute(interaction : CommandInteraction) {
        const title = interaction.options.get('title').value.toString();
        const channel = interaction.options.get('channel').value.toString();
        
        let roleToMention : string;
        if (interaction.options.get('mention')) { roleToMention = roleMention(interaction.options.get('mention').value.toString()); }
        let description : string;
        if (interaction.options.get('description')) { description = interaction.options.get('description').value.toString(); }
        
        const addChoiceButton = new ButtonBuilder()
            .setCustomId('add-poll-choice-button')
            .setEmoji('➕')
            .setStyle(ButtonStyle.Primary);
        const removeChoiceButton = new ButtonBuilder()
            .setCustomId('remove-poll-choice-button')
            .setEmoji('➖')
            .setStyle(ButtonStyle.Danger);
        const createPollButton = new ButtonBuilder()
            .setCustomId('create-poll-button')
            .setLabel('Créer')
            .setEmoji('📊')
            .setStyle(ButtonStyle.Success)
            .setDisabled(true);

        const embed = new EmbedBuilder()
            .setTitle(`__**${title}**__`)
            .setColor('Purple')
            .addFields({ name : 'Salon', value : channelMention(channel), inline: true });
        
        if (description) { embed.addFields({ name: '*Sondage*', value: description, inline: false }); }
        if (roleToMention) { embed.addFields({ name: 'Mentionne', value: roleToMention, inline: true }); }

        await interaction.reply({
            embeds: [embed],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(addChoiceButton, removeChoiceButton, GlobalUI.cancelButton), 
                new ActionRowBuilder<ButtonBuilder>().addComponents(createPollButton)]
        });
    }
}