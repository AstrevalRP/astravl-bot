import { CommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Supprime un nombre de message donné')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option =>
        option.setName('amount')
        .setDescription('Nombre de messages à supprimer')
        .setMinValue(2)
        .setRequired(true)
    ),
    
    async execute(interaction : CommandInteraction) {
        await interaction.deferReply({ ephemeral: true })
            .then(async () => {
                await interaction.channel.bulkDelete(interaction.options.get('amount').value as number);
            }).then(async () => {
                await interaction.editReply({ content: `${interaction.options.get('amount').value} messages ont été supprimés :white_check_mark:` });
            });
    }
};