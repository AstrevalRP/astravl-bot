import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, CommandInteraction, ComponentType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

let selectionComplete : boolean = false;
let reportAndHelpChannelId : string;
let recruitmentChannelId : string;

export function setSelectionComplete(boolean: boolean) { selectionComplete = boolean; }
export function getSelectionComplete(): boolean { return selectionComplete; } 
export function getReportAndHelpChannelId(): string { return reportAndHelpChannelId; } 
export function getRecruitmentChannelId(): string { return recruitmentChannelId; }

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config-tickets')
        .setDescription("Envoie un message permettant d'initialiser les différents tickets dans les salons donnés.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    getSelectionComplete,
    getReportAndHelpChannelId,
    getRecruitmentChannelId,

    async execute(interaction : CommandInteraction) {        
        const channelSelectMenuReportHelp = new ChannelSelectMenuBuilder()
            .setChannelTypes(ChannelType.GuildText)
            .setCustomId('channel-select-report-and-help')
            .setPlaceholder('Reports et Aide');
        const channelSelectMenuRecruitment = new ChannelSelectMenuBuilder()
            .setChannelTypes(ChannelType.GuildText)
            .setCustomId('channel-select-recruitment')
            .setPlaceholder('Recrutement');

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm-button-ticket-init')
            .setLabel('Confirmer')
            .setStyle(ButtonStyle.Primary);
        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel-button-ticket-init')
            .setLabel('Annuler')
            .setStyle(ButtonStyle.Secondary);
        
        const rowChannelSelectReportHelp = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelectMenuReportHelp);
        const rowChannelSelectRecruitment = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelectMenuRecruitment);
        const rowButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, cancelButton);
        
        const reply = await interaction.reply({ embeds: [new EmbedBuilder()
                .setColor('Blue')
                .setTitle('Choisie les salons dans lesquelles tu veux envoyer un bouton permettant de créer des tickets.')],
            components: [rowChannelSelectReportHelp, rowChannelSelectRecruitment, rowButtons],
            fetchReply: true 
        });
        
        // get the value of both channel select menus and check if one of them is empty
        const ChannelSelcetMenuInteractionCollector = reply.createMessageComponentCollector({ componentType: ComponentType.ChannelSelect });
        ChannelSelcetMenuInteractionCollector.on('collect', collected => {
            if (collected.values !== null) {
                if (collected.customId === 'channel-select-report-and-help') { reportAndHelpChannelId = collected.values[0]; } 
                else if (collected.customId === 'channel-select-recruitment') { recruitmentChannelId = collected.values[0]; }
                
                if (reportAndHelpChannelId !== undefined && recruitmentChannelId !== undefined) { setSelectionComplete(true); }
            }
        });
    },
};