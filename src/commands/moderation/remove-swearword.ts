import { EmbedBuilder, SlashCommandBuilder, CommandInteraction, PermissionFlagsBits } from 'discord.js';
import { ArrayUtils, WordVariants } from '../../global/utils';
import fs = require('fs');
import path = require('path');

const blackListPath : string = '../../../data/blacklist.json'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-swear-word')
        .setDescription('Supprime un mot ainsi que ses déclinaisons de la blacklist')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option =>
            option.setName('word')
            .setDescription('Mot à retirer')
            .setRequired(true)
        ),

    async execute(interaction : CommandInteraction) {
        const blackList : string[] = JSON.parse(fs.readFileSync(path.join(__dirname, blackListPath), {encoding: 'utf8'}));
        const word : string = interaction.options.get('word')!.value!.toString().toLowerCase();
        
        if (blackList.some(item => item === word)) {
            let deletedWords = [];
            const variants = WordVariants.generateVariants(word);
            deletedWords = variants;
            fs.writeFileSync(path.join(__dirname, blackListPath), JSON.stringify(ArrayUtils.removeElements(blackList, variants)));
            await interaction.reply({ embeds: [new EmbedBuilder()
                    .setTitle('Mot(s) supprimé(s) de la blacklist:')
                    .setDescription(`**\`${deletedWords}\`**`)
                    .setColor('Aqua')],
                ephemeral: true
            });
        } else {
            await interaction.reply({ embeds: [new EmbedBuilder()
                    .setTitle('Ce mot n\'existe pas dans la blacklist')
                    .setColor('DarkOrange')],
                ephemeral: true
            });
        }
    }
};