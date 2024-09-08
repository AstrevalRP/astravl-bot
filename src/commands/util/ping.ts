import { EmbedBuilder, SlashCommandBuilder, CommandInteraction } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Indique la latence du bot'),

    async execute(interaction : CommandInteraction) {
        const sentTime = new Date();
		await interaction.deferReply({ ephemeral: true });
        await interaction.followUp({ embeds: [new EmbedBuilder()
				.setColor('#1a1a1a')
				.setTitle(`Pong! ${new Date().getTime() - sentTime.getTime()}ms`)],
        });
    },
};