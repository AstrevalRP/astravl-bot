import { EmbedBuilder, SlashCommandBuilder, CommandInteraction, PermissionFlagsBits } from 'discord.js';
import { WordVariants } from '../../global/utils';
import fs = require('fs');
import path = require('path');

const blackListPath : string = '../../../data/blacklist.json'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-swear-word')
        .setDescription('Ajoute un mot ainsi que ses déclinaisons à la blacklist')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option =>
            option.setName('word')
            .setDescription('Mot à bannir')
            .setRequired(true)
        ),

    async execute(interaction : CommandInteraction) {
        const blackList = JSON.parse(fs.readFileSync(path.join(__dirname, blackListPath), {encoding: 'utf8'}));
        const word : string = interaction.options.get('word').value.toString().toLowerCase();
        
        let newBlacklist: string[] = blackList;
        let addedWords: string[] = [];
        
        if (blackList.some((item: string) => item === word) === false) {
            WordVariants.generateVariants(word).forEach(variant => {
                newBlacklist.push(variant);
                addedWords.push(variant);
            });
            fs.writeFileSync(path.join(__dirname, blackListPath), JSON.stringify(newBlacklist));
            await interaction.reply({ embeds: [new EmbedBuilder()
                    .setTitle('Mot(s) ajouté(s) à la blacklist:')
                    .setDescription(`**\`${addedWords}\`**`)
                    .setColor('Aqua')],
                ephemeral: true
            });
        } else {
            await interaction.reply({ embeds: [new EmbedBuilder()
                    .setTitle('Ce mot appartient déjà à la blacklist')
                    .setColor('Red')],
                ephemeral: true
            });
        }
    }
};