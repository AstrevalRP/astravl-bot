import { ActionRowBuilder, ButtonBuilder, ButtonComponent, ButtonStyle, CategoryChannel, Channel, ChannelType, EmbedBuilder, Events, GuildMember, Interaction, Message, ModalBuilder, Role, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextChannel, TextInputBuilder, TextInputStyle, channelMention, roleMention, userMention } from "discord.js";
import fs = require('fs');
import path = require("path");
import { ArrayUtils, mentionToId } from "../global/utils";
import { GlobalUI } from "../global/UI";
const settings = require('../../data/settings.json');
const ticketCountPath : string = '../../data/tickets_count.json'
const settingsPath : string = '../../data/settings.json'

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction : Interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            
            if (!command) return;
                
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                const reply = { content: 'Une erreur est survenue !', ephemeral: true };
                interaction.replied || interaction.deferred ?  await interaction.followUp(reply) : await interaction.reply(reply);
            }
        }

        else if (interaction.isAnySelectMenu()) {
            if (interaction.customId === 'service-string-select') {
                const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, ticketCountPath), {encoding: 'utf8'}));
                const format = { "count" : jsonData.count + 1 };
                fs.writeFileSync(path.join(__dirname, ticketCountPath), JSON.stringify(format, null, "\t"));
                await interaction.channel.setName(`ticket-n°${jsonData.count}-${interaction.user.username.toLowerCase()}`)
                await interaction.message.delete();

                // Alert admins and candidate        
                const adminRole: Role = await interaction.guild.roles.fetch(settings.roles.administrator);
                const embed = new EmbedBuilder()
                    .setTitle(`**@${interaction.user.displayName} candidate pour le pôle __${interaction.values[0]}__**`)
                    .setDescription(`**${interaction.user.tag}**, tu vas entrer en contacte avec les admins dans ce salon pour discuter de ta candidature.\nLa décision sera prise une fois le ticket fermé.`)
                    .setColor('DarkGreen')
                    .setFields(
                        {name : 'Candidat', value: userMention(interaction.user.id), inline: true}, 
                        {name : 'A candidaté le', value: `<t:${Math.floor(Date.now()/1000)}:D>`, inline: true},
                        {name : 'À', value: `<t:${Math.floor(Date.now()/1000)}:t>`, inline: true}
                    );
                
                await interaction.channel.send({ content: `**## Oyé oyé ${roleMention(adminRole.id)}, un ticket a été créé.**`, 
                    embeds: [embed], 
                    components: [new ActionRowBuilder<ButtonBuilder>().addComponents(GlobalUI.closeTicketButton, GlobalUI.archiveTicketButton)] 
                });
            } else if(['moderation-channel-select-menu', 
                    'tickets-category-select-menu', 
                    'archives-category-select-menu', 
                    'moderator-role-select-menu', 
                    'administrator-role-select-menu'].some(id => id === interaction.customId)) {
                    const configMessage = require('../commands/configuration/config');
                    
                    const confirmConfigureBot = new ButtonBuilder()
                        .setCustomId('confirm-configure-bot')
                        .setLabel('Oui')
                        .setStyle(ButtonStyle.Danger);
                    const cancelConfigureBot = new ButtonBuilder()
                        .setCustomId('cancel-configure-bot')
                        .setLabel('Annuler')
                        .setStyle(ButtonStyle.Primary);
                    if (configMessage.getSelectionComplete()) {
                        await interaction.reply({ content: '### Es-tu sûr de tes choix ?' , 
                            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(confirmConfigureBot, cancelConfigureBot)],
                        });
                    } else {
                        await interaction.deferUpdate();
                    }
            } else {
                // Let the components as is
                await interaction.update({ components: interaction.message.components });
            }
        }

        else if (interaction.isButton()) {
            if (interaction.customId === 'confirm-button-ticket-init') {
                const initTicketMessage = require('../commands/configuration/initialize-tickets');
                
                if (initTicketMessage.getSelectionComplete()) {
                    await interaction.update({
                        embeds: [new EmbedBuilder()
                            .setTitle('Tickets envoyés ! Tu peux aller vérifier par toi même :eyes:')
                            .setDescription(`${channelMention(initTicketMessage.getReportAndHelpChannelId())} **/** ${channelMention(initTicketMessage.getRecruitmentChannelId())}`)], 
                        components : [new ActionRowBuilder<ButtonBuilder>().addComponents(GlobalUI.okButton)]
                    });
                    
                    const ReportAndHelpChannel : Channel = await interaction.client.channels.fetch(initTicketMessage.getReportAndHelpChannelId());
                    const RecruitmentChannel : Channel = await interaction.client.channels.fetch(initTicketMessage.getRecruitmentChannelId());
                    
                    const createHelpTicketButton = new ButtonBuilder()
                        .setCustomId('create-help-ticket-button')
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel('Créer un ticket')
                        .setEmoji('🎫');
                    const createRecruitmentTicketButton = new ButtonBuilder()
                        .setCustomId('create-recruitment-ticket-button')
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel('Canditater')
                        .setEmoji('🙋');

                    await (ReportAndHelpChannel as TextChannel).send({ embeds : [new EmbedBuilder()
                            .setTitle('Clic sur le boutton ci-dessous pour envoyer ton ticket')
                            .setColor('Blue')],
                        components : [new ActionRowBuilder<ButtonBuilder>().addComponents(createHelpTicketButton)] 
                    });
                    await (RecruitmentChannel as TextChannel).send({ embeds: [new EmbedBuilder()
                            .setTitle('Clic sur le boutton ci-dessous pour choisir tes options')
                            .setColor('Gold')],
                        components : [new ActionRowBuilder<ButtonBuilder>().addComponents(createRecruitmentTicketButton)] 
                    });
                    
                } else {
                    await interaction.update({ content: interaction.message.content,
                        embeds: [new EmbedBuilder()
                            .setTitle('Rempli tous les champs !')
                            .setColor('Red')],
                        components: interaction.message.components
                    });
                }
            }
            else if (interaction.customId === 'create-help-ticket-button') {
                const title = new TextInputBuilder()
                    .setCustomId('title-text-input')
                    .setLabel('Titre')
                    .setRequired(true)
                    .setPlaceholder('Indique le titre de ta requête ici')
                    .setStyle(TextInputStyle.Short)
                    .setMinLength(4)
                    .setMaxLength(60)
                const motive = new TextInputBuilder()
                    .setCustomId('motive-text-input')
                    .setLabel('Motif')
                    .setRequired(true)
                    .setPlaceholder('Explique ta plainte/question ici')
                    .setStyle(TextInputStyle.Paragraph)
                    .setMaxLength(1000)
                
                const modal = new ModalBuilder()
                    .setCustomId('help-ticket-modal')
                    .setTitle('Rempli les champs ci-dessous')
                    .setComponents(new ActionRowBuilder<TextInputBuilder>().setComponents(title), new ActionRowBuilder<TextInputBuilder>().setComponents(motive));
                
                await interaction.showModal(modal);
            }
            else if (interaction.customId === 'create-recruitment-ticket-button') {
                const serviceStringSelect = new StringSelectMenuBuilder()
                    .setCustomId('service-string-select')
                    .setPlaceholder('Choisi le pôle dans lequel tu veux candidater')
                    .setOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Modération')
                            .setValue('Modération'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Développement')
                            .setValue('Développement'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Modélisation')
                            .setValue('Modélisation'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Construction')
                            .setValue('Construction'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Communication')
                            .setValue('Communication'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Scénarisme')
                            .setValue('Scénarisme'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Animation')
                            .setValue('Animation'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Graphisme')
                            .setValue('Graphisme'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Sound Design')
                            .setValue('Sound Design'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Video Design')
                            .setValue('Video Design')
                    )
                
                const ticketCategory = (await interaction.guild.channels.fetch(settings.categories.tickets) as CategoryChannel)

                if (ticketCategory.children.cache.some(channel => channel.name === `candidature-${interaction.user.username.toLowerCase()}`)) {
                    await interaction.reply({ content: `Tu as déjà ouvert un ticket! Rends-toi ici :point_right: ${channelMention(ticketCategory.children.cache.find(channel => channel.name === `candidature-${interaction.user.username.toLowerCase()}`).id)}`,
                        ephemeral: true 
                    });
                } else {
                    const ticketChannel = await interaction.guild.channels.create({
                        name: `candidature-${interaction.user.username.toLowerCase()}`,
                        type: ChannelType.GuildText,
                        parent: settings.categories.tickets,
                        permissionOverwrites : [
                            { id: interaction.guild.roles.everyone.id, deny: ['ViewChannel'] },
                            { id: settings.roles.administrator, allow: ['ViewChannel'] },
                            { id: interaction.client.user.id, allow: ['ViewChannel'] },
                            { id: interaction.user.id, allow: ['ViewChannel'] }
                        ]
                    });

                    await interaction.reply({ embeds: [new EmbedBuilder()
                            .setTitle('Tu peux désormais candidater')
                            .setDescription(`Rends-toi par-là :point_right: ${channelMention(ticketChannel.id)}`)], 
                        ephemeral: true 
                    });

                    const cancelApplicationButton = new ButtonBuilder().
                        setCustomId('cancel-application-button')
                        .setLabel('Annuler')
                        .setStyle(ButtonStyle.Danger);

                    await ticketChannel.send( {embeds: [new EmbedBuilder()
                            .setTitle('Choisie le pôle dans lequel tu veux candidater, ta demande sera ensuite automatiquement envoyée')
                            .setDescription('*Tu peux annuler ta candidature inconito en cliquant sur le bouton "Annuler" juste en dessous*')
                            .setColor('DarkGreen')],
                        components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(serviceStringSelect), 
                            new ActionRowBuilder<ButtonBuilder>().addComponents(cancelApplicationButton)] 
                    });
                }
            }
            else if (interaction.customId === 'cancel-button-ticket-init') {
                await interaction.message.delete();
            }
            else if (interaction.customId === 'ok-button') {
                await interaction.message.delete();
            }
            else if (interaction.customId === 'close-ticket-button') {
                if ((interaction.member as GuildMember).roles.cache.get(settings.roles.moderator) || ((interaction.member as GuildMember).roles.cache.get(settings.roles.administrator))) {
                    await interaction.reply({ content: 'Es-tu sûr de vouloir supprimer ce ticket (supprimer le salon) ?',
                        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(GlobalUI.confirmButtonDeleteTicket, GlobalUI.moderationCancelButton)],
                        ephemeral: false 
                    });
                } else {
                    await interaction.reply({ content: 'Tu n\'as pas la permission de faire ça !', ephemeral: true });
                }
            }
            else if (interaction.customId === 'archive-ticket-button') {
                if ((interaction.member as GuildMember).roles.cache.get(settings.roles.moderator) || ((interaction.member as GuildMember).roles.cache.get(settings.roles.administrator))) {
                    await interaction.reply({ content: 'Es-tu sûr de vouloir archiver ce ticket ?',
                        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(GlobalUI.confirmButtonArchiveTicket, GlobalUI.moderationCancelButton)],
                        ephemeral: false
                    }); 
                } else {
                    await interaction.reply({ content: 'Tu n\'as pas la permission de faire ça !', ephemeral: true });
                }
            }
            else if (interaction.customId === 'confirm-button-archive-ticket') {
                if ((interaction.member as GuildMember).roles.cache.get(settings.roles.moderator)) {
                    await interaction.message.delete();
                    interaction.channel.messages.cache.each(async mesage => {
                        if (mesage.author === interaction.client.user) { mesage.edit({ components:[] }); }
                    });
                    await interaction.channel.send({ embeds: [new EmbedBuilder()
                        .setTitle(`Coversation archivée`)
                        .setDescription(`Cette conversation a été archivée **le <t:${Math.floor(Date.now()/1000)}:D> à <t:${Math.floor(Date.now()/1000)}:t>**`)
                        .setColor('Red')] 
                    });
                    
                    await (interaction.channel as TextChannel).setParent(settings.categories.archives, {reason: 'Archived'});
                } else {
                    await interaction.reply( {content: 'Tu n\'as pas la permission de faire ça !', ephemeral: true} )
                }
            }
            else if (interaction.customId === 'confirm-button-delete-ticket') {
                if ((interaction.member as GuildMember).roles.cache.get(settings.roles.moderator)) {
                    await interaction.channel.delete('Ticket closed')
                } else {
                    await interaction.reply( {content: 'Tu n\'as pas la permission de faire ça !', ephemeral: true} )
                }
            }
            else if (interaction.customId === 'moderation-cancel-button') {
                if ((interaction.member as GuildMember).roles.cache.get(settings.roles.moderator)) {
                    await interaction.message.delete();
                } else {
                    await interaction.reply({ content: 'Tu n\'as pas la permission de faire ça !', ephemeral: true })
                }
            } 
            else if (interaction.customId === 'cancel-button') {
                await interaction.message.delete();
            }
            else if (interaction.customId === 'cancel-application-button') {
                await interaction.channel.delete();
            }
            else if (interaction.customId === 'let-as-is-button') {
                const mutedMember = interaction.guild.members.cache.get(interaction.message.embeds[0].fields[0].value.replace(/[\\<>@#&!]/g, ""))
                await interaction.message.edit({ components:[] });
                await interaction.reply({ embeds : [new EmbedBuilder()
                        .setTitle('✅')
                        .setDescription(`${userMention(interaction.user.id)} a laissé ${userMention(mutedMember.id)} muté`)
                    .   setColor('Grey')] 
                });
            }
            else if (interaction.customId === 'cancel-time-out-button') {
                const mutedMember = interaction.guild.members.cache.get(interaction.message.embeds[0].fields[0].value.replace(/[\\<>@#&!]/g, ""))
                await interaction.message.edit({ components:[] });
                await mutedMember.timeout(null);
                interaction.reply({ embeds : [new EmbedBuilder()
                        .setTitle('✅')
                        .setDescription(`${userMention(interaction.user.id)} a unmuté ${userMention(mutedMember.id)}`)
                        .setColor('Yellow')] 
                });
            }
            else if (interaction.customId === 'add-poll-choice-button') {
                interaction.showModal(GlobalUI.addPollOptionModal);
            }
            else if (interaction.customId === 'remove-poll-choice-button') {
                const originalMessage : Message = interaction.message;
                let splitDescription:string[] = [];
                try { splitDescription = originalMessage.embeds[0].description.split('\n'); } catch (error) {}

                if (splitDescription.length === 2) {
                    const oldCreateButton = originalMessage.components[1].components[0] as ButtonComponent;
                    const newCreateButton = new ButtonBuilder()
                        .setCustomId(oldCreateButton.customId)
                        .setLabel(oldCreateButton.label)
                        .setStyle(oldCreateButton.style)
                        .setEmoji(oldCreateButton.emoji)
                        .setDisabled(true);
                    await originalMessage.edit({ content: originalMessage.content, 
                        components: [originalMessage.components[0], new ActionRowBuilder<ButtonBuilder>().addComponents(newCreateButton)] 
                    })
                }
                if (splitDescription.length === 0) {
                    interaction.reply({ content: '**Rien à supprimer**', ephemeral: true });
                }
                if (splitDescription.length > 0) {
                    if (splitDescription.length === 1) {
                        const newEmbed = new EmbedBuilder()
                            .setTitle(originalMessage.embeds[0].title)
                            .setFields(originalMessage.embeds[0].fields)
                            .setColor(originalMessage.embeds[0].color);
                        await originalMessage.edit({ embeds : [newEmbed] });
                        await interaction.deferUpdate();
                    } else {
                        const newDescription = (ArrayUtils.removeElement(splitDescription, splitDescription[splitDescription.length-1])).join('\n');
                        const newEmbed = new EmbedBuilder()
                            .setTitle(originalMessage.embeds[0].title)
                            .setDescription(newDescription)
                            .setFields(originalMessage.embeds[0].fields)
                            .setColor(originalMessage.embeds[0].color);
                        await originalMessage.edit({ embeds : [newEmbed] });
                        await interaction.deferUpdate();
                    }
                }
            }
            else if (interaction.customId === 'create-poll-button') {
                // Dirty!!! Gotta find a solution
                const channel = await interaction.guild.channels.fetch(mentionToId(interaction.message.embeds[0].fields[0].value));
                const title = interaction.message.embeds[0].title;
                const items = interaction.message.embeds[0].description;
                
                let description: string;
                try { description = interaction.message.embeds[0].fields[1].value; } catch (error) { console.log('No "description" field'); }
                let roleToMention: string;
                try { roleToMention = interaction.message.embeds[0].fields[2].value; } catch (error) { console.log('No "role to mention" field'); }

                const emojiRegHex = /\p{Emoji}/u;
                const specialeCharactersRegHex = /[$&+,:;=?@#|'<>.^*()%!-]/;

                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(items)
                    .setColor('Purple')
                if (description) { embed.addFields({ name: '*Description*', value: description }); }
                let options = {};
                roleToMention !== undefined ? options = {content: roleToMention, embeds : [embed]} : options = {embeds : [embed]}

                let reactions : string[] = [];
                [...items].forEach(character => {
                    if (specialeCharactersRegHex.test(character) === false) {
                        if (emojiRegHex.test(character)) { reactions.push(character); }
                    }
                })

                const poll : Message = await (channel as TextChannel).send(options);
                reactions.forEach(reaction => { poll.react(reaction); });              
                
                await interaction.update({embeds : [new EmbedBuilder()
                        .setTitle('**Sondage envoyé !**')
                        .setDescription(`:point_right: ${channelMention(channel.id)} :eyes:`)
                        .setColor('Green')],
                    components : [new ActionRowBuilder<ButtonBuilder>().addComponents(GlobalUI.okButton)]
                })
            }
            else if (interaction.customId === 'cancel-configure-bot') {
                const reply = await interaction.message.fetchReference();
                reply.delete();
                await interaction.message.delete();
            }
            else if (interaction.customId === 'confirm-configure-bot') {
                const configMessage = require('../commands/configuration/config');

                const jsonData = {
                    channels : {
                        moderation : configMessage.getModerationChannelId()
                    },
                    categories : {
                        tickets : configMessage.getTicketsCategoryId(),
                        archives : configMessage.getArchivesCategoryId()
                    },
                    roles : {
                        moderator : configMessage.getModeratorRoleId(),
                        administrator : configMessage.getAdministratorRoleId()
                    }
                }

                fs.writeFileSync(path.join(__dirname, settingsPath), JSON.stringify(jsonData, null, "\t"));
                const reply = await interaction.message.fetchReference();
                reply.delete();
                await interaction.reply({ embeds: [new EmbedBuilder()
                        .setTitle('Paramètres modifiés :thumbsup:')
                        .setColor('LuminousVividPink')] 
                });
                await interaction.message.delete();
            }
        }

        else if (interaction.isModalSubmit()) {
            if (interaction.customId === 'help-ticket-modal') {
                const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, ticketCountPath), {encoding: 'utf8'}));
                const format = { "count" : jsonData.count + 1 };
                fs.writeFileSync(path.join(__dirname, ticketCountPath), JSON.stringify(format, null, "\t"));

                const moderatorRole: Role = await interaction.guild.roles.fetch(settings.roles.moderator);
                const ticketChannel = await interaction.guild.channels.create({
                    name: `ticket-n°${jsonData.count}-${interaction.user.username.toLowerCase()}`,
                    type: ChannelType.GuildText,
                    parent: settings.categories.tickets,
                    permissionOverwrites : [
                        { id: interaction.guild.roles.everyone.id, deny: ['ViewChannel'] },
                        { id: settings.roles.moderator, allow: ['ViewChannel'] },
                        { id: interaction.client.user.id, allow: ['ViewChannel'] },
                        { id: interaction.user.id, allow: ['ViewChannel'] }
                    ]
                });

                const embed = new EmbedBuilder()
                    .setTitle(`**__${interaction.fields.getTextInputValue('title-text-input').toUpperCase()}__**`)
                    .setDescription(`**${interaction.fields.getTextInputValue('motive-text-input')}**`)
                    .setColor('Orange')
                    .setFields(
                        {name : 'Écrit par', value: userMention(interaction.user.id), inline: true}, 
                        {name : 'Le', value: `<t:${Math.floor(Date.now()/1000)}:D>`, inline: true},
                        {name : 'À', value: `<t:${Math.floor(Date.now()/1000)}:t>`, inline: true});

                await (ticketChannel as TextChannel).send({ content: `**## Oyé oyé ${roleMention(moderatorRole.id)}, un ticket a été créé.**`, 
                    embeds: [embed], 
                    components: [new ActionRowBuilder<ButtonBuilder>().addComponents(GlobalUI.closeTicketButton, GlobalUI.archiveTicketButton)] 
                });
                await interaction.reply({ embeds: [new EmbedBuilder()
                        .setTitle('Ton ticket a bien été envoyé')
                        .setDescription(`Ta requête a été envoyé, tu devrais recevoir une réponse d\'ici là\n:point_right: ${channelMention(ticketChannel.id)}`)
                        .setColor('DarkGreen')], 
                    ephemeral: true } 
                );
            }
            else if (interaction.customId === 'add-poll-option-modal') {
                const optionName = interaction.fields.getTextInputValue('poll-option-name');
                const optionEmoji = interaction.fields.getTextInputValue('poll-option-emoji')
                const originalMessage = interaction.message;
                
                let splitDescription:string[];
                try { splitDescription = originalMessage.embeds[0].description.split('\n'); } catch { splitDescription = []; }

                const emojiRegHex = /\p{Emoji}/u;
                const specialeCharactersRegHex = /[$&+,:;=?@#|'<>.^*()%!-]/;
                
                if ([...optionEmoji].length > 1) {
                    interaction.reply({ content: '**Pas plus d\'un émojis**', ephemeral: true });
                    return;
                }

                if (emojiRegHex.test(optionEmoji) === false || specialeCharactersRegHex.test(optionEmoji)) {
                    interaction.reply({ content: `**"${optionEmoji}" n'est pas un émoji !**\n(seules les émojis peuvent être utilisés pour les réactions)`,
                        ephemeral: true
                    });
                } else {
                    const newDescription = ():string => {
                        if (originalMessage.embeds[0].description !== null) { return originalMessage.embeds[0].description+`\n**${optionName}** : \`${optionEmoji}\``; } 
                        else { return `\n**${optionName}** : \`${optionEmoji}\``; }
                    }
                    const newEmbed = new EmbedBuilder()
                        .setTitle(originalMessage.embeds[0].title)
                        .setDescription(newDescription())
                        .setFields(originalMessage.embeds[0].fields);
                    
                        const oldCreateButton = originalMessage.components[1].components[0] as ButtonComponent;
                        const newCreateButton = new ButtonBuilder()
                            .setCustomId(oldCreateButton.customId)
                            .setLabel(oldCreateButton.label)
                            .setStyle(oldCreateButton.style)
                            .setEmoji(oldCreateButton.emoji)
                            .setDisabled(false);
                    
                    let options = {}
                    if (splitDescription.length === 1) {
                        options = { content: originalMessage.content, embeds: [newEmbed], 
                            components: [originalMessage.components[0], new ActionRowBuilder<ButtonBuilder>().addComponents(newCreateButton)] 
                        };
                    } else {
                        options = { content: originalMessage.content, embeds: [newEmbed] };
                    }

                    await originalMessage.edit(options);
                    await interaction.deferUpdate();
                }
            }
        }
	},
};