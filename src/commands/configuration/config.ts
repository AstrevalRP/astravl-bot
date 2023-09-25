import { ActionRowBuilder, CacheType, ChannelSelectMenuBuilder, ChannelSelectMenuInteraction, ChannelType, CommandInteraction, ComponentType, EmbedBuilder, PermissionFlagsBits, RoleSelectMenuBuilder, RoleSelectMenuInteraction, SlashCommandBuilder, channelMention, roleMention } from "discord.js";

let selectionComplete : boolean = false;
let moderationChannelId : string;
let ticketsCategoryId : string;
let archivesCategoryId : string;
let moderatorRoleId: string;
let administratorRoleId: string;

function setSelectionComplete(boolean: boolean) { selectionComplete = boolean; }
function getSelectionComplete(): boolean { return selectionComplete; } 

function getModerationChannelId(): string { return moderationChannelId; } 
function getTicketsCategoryId(): string { return ticketsCategoryId; }
function getArchivesCategoryId(): string { return archivesCategoryId; }
function getModeratorRoleId(): string { return moderatorRoleId; }
function getAdministratorRoleId(): string { return administratorRoleId; }

function collectData(collected: ChannelSelectMenuInteraction<CacheType> | RoleSelectMenuInteraction<CacheType>) {
    if (collected.values !== null) {
        const originalEmbed = collected.message.embeds[0];
        const originalMessage = collected.message;
        
        /**
         * originalEmbed.fields[0] --> moderationChannelField
         * originalEmbed.fields[1] --> ticketsCategoryField
         * originalEmbed.fields[2] --> archivesCategoryField
         * originalEmbed.fields[3] --> moderatorRoleField
         * originalEmbed.fields[4] --> administratorRoleField
        */

        if (collected.customId === 'moderation-channel-select-menu') { 
            moderationChannelId = collected.values[0];
            originalEmbed.fields[0].value = channelMention(collected.values[0]); 
            originalMessage.edit({ embeds: [originalEmbed] });
        } else if (collected.customId === 'tickets-category-select-menu') { 
            ticketsCategoryId = collected.values[0];
            originalEmbed.fields[1].value = channelMention(collected.values[0]); 
            originalMessage.edit({ embeds: [originalEmbed] });        
        } else if (collected.customId === 'archives-category-select-menu') { 
            archivesCategoryId = collected.values[0];
            originalEmbed.fields[2].value = channelMention(collected.values[0]); 
            originalMessage.edit({ embeds: [originalEmbed] });   
        } else if (collected.customId === 'moderator-role-select-menu') { 
            moderatorRoleId = collected.values[0];
            originalEmbed.fields[3].value = roleMention(collected.values[0]); 
            originalMessage.edit({ embeds: [originalEmbed] }); 
        } else if (collected.customId === 'administrator-role-select-menu') { 
            administratorRoleId = collected.values[0];
            originalEmbed.fields[4].value = roleMention(collected.values[0]);
            originalMessage.edit({ embeds: [originalEmbed] }); 
        }

        const complete = [moderationChannelId !== undefined,
            ticketsCategoryId !== undefined,
            archivesCategoryId !== undefined,
            moderatorRoleId !== undefined,
            administratorRoleId !== undefined].filter(el => el).length === 4

        if (complete) { setSelectionComplete(true); }
        else {setSelectionComplete(false); }
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Permet de configurer les paramètres généraux du bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    getSelectionComplete,
    getModerationChannelId,
    getTicketsCategoryId,
    getArchivesCategoryId,
    getModeratorRoleId,
    getAdministratorRoleId,
    
    async execute(interaction : CommandInteraction) {
        const embed = new EmbedBuilder()
            .setTitle('**__Configure le bot en remplissant les paramètres ci-dessous__**')
            .setColor('Red')
            .setFields(
                {name: 'Salon modération', value: '-', inline: false}, 
                {name: 'Catégorie tickets', value: '-', inline: false},
                {name: 'Catégorie archives', value: '-', inline: false},
                {name: 'Role modération', value: '-', inline: true},
                {name: 'Role administration', value: '-', inline: true},
            );
        const moderationChannelSelectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('moderation-channel-select-menu')
            .setChannelTypes(ChannelType.GuildText)
            .setPlaceholder('Salon de la modération');
        const ticketsCategorySelectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('tickets-category-select-menu')
            .setChannelTypes(ChannelType.GuildCategory)
            .setPlaceholder('Catégorie dans laquelle se trouveront les tickets');
        const archivesCategorySelectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('archives-category-select-menu')
            .setChannelTypes(ChannelType.GuildCategory)
            .setPlaceholder('Catégorie des tickets archivés');
        const moderatorRoleSelectMenu = new RoleSelectMenuBuilder()
            .setCustomId('moderator-role-select-menu')
            .setPlaceholder('Rôle des modérateurs');
        const administratorRoleSelectMenu = new RoleSelectMenuBuilder()
            .setCustomId('administrator-role-select-menu')
            .setPlaceholder('Rôle des administrateurs');

        const reply = await interaction.reply({ embeds: [embed], 
            components: [
                new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(moderationChannelSelectMenu),
                new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(ticketsCategorySelectMenu),
                new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(archivesCategorySelectMenu),
                new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(moderatorRoleSelectMenu),
                new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(administratorRoleSelectMenu),
            ]
        });

        // Collect every select menu, store their value and check if one of them is empty
        const moderationChannelSelectMenuCollector = reply.createMessageComponentCollector({ componentType: ComponentType.ChannelSelect });
        const ticketsCategorySelectMenuCollector = reply.createMessageComponentCollector({ componentType: ComponentType.ChannelSelect });
        const archivesCategorySelectMenuCollector = reply.createMessageComponentCollector({ componentType: ComponentType.ChannelSelect });
        const moderatorRoleSelectMenuCollector = reply.createMessageComponentCollector({ componentType: ComponentType.RoleSelect });
        const administratorRoleSelectMenuCollector = reply.createMessageComponentCollector({ componentType: ComponentType.RoleSelect });

        moderationChannelSelectMenuCollector.on('collect', collected => { collectData(collected); });
        ticketsCategorySelectMenuCollector.on('collect', collected => { collectData(collected); });
        archivesCategorySelectMenuCollector.on('collect', collected => { collectData(collected); });
        moderatorRoleSelectMenuCollector.on('collect', collected => { collectData(collected); });
        administratorRoleSelectMenuCollector.on('collect', collected => { collectData(collected); });
    }
};