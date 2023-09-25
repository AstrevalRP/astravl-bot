import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export abstract class GlobalUI {
    public static okButton = new ButtonBuilder()
        .setCustomId('ok-button')
        .setLabel('Ok')
        .setStyle(ButtonStyle.Success);
    public static cancelButton = new ButtonBuilder()
        .setCustomId('cancel-button')
        .setLabel('Annuler')
        .setStyle(ButtonStyle.Secondary);
    public static moderationCancelButton = new ButtonBuilder()
        .setCustomId('moderation-cancel-button')
        .setLabel('Annuler')
        .setStyle(ButtonStyle.Secondary);
    
    public static confirmButtonDeleteTicket = new ButtonBuilder()
        .setCustomId('confirm-button-delete-ticket')
        .setLabel('Oui')
        .setStyle(ButtonStyle.Danger);
    public static confirmButtonArchiveTicket = new ButtonBuilder()
        .setCustomId('confirm-button-archive-ticket')
        .setLabel('Oui')
        .setStyle(ButtonStyle.Danger);
    
    
    public static closeTicketButton = new ButtonBuilder()
        .setCustomId('close-ticket-button')
        .setLabel('Fermer')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔒');
    public static archiveTicketButton = new ButtonBuilder()
        .setCustomId('archive-ticket-button')
        .setLabel('Archiver')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📜');

    public static addPollOptionModal = new ModalBuilder()
        .setCustomId('add-poll-option-modal')
        .setTitle('Ajoute une option')
        .addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder()
                .setCustomId('poll-option-name')
                .setLabel('Nom')
                .setMaxLength(40)
                .setPlaceholder('Entre la proposition ici')
                .setRequired(true)
                .setStyle(TextInputStyle.Short)),
            new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder()
                .setCustomId('poll-option-emoji')
                .setLabel('Émoji')
                .setMaxLength(2)
                .setPlaceholder("Entre l'émoji réaction ici")
                .setRequired(true)
                .setStyle(TextInputStyle.Short)));
}