import { Colors, EmbedBuilder, Events, GuildMember, TextChannel, userMention } from "discord.js";
import settings from '../../data/settings.json'
import specialUser from '../../data/special_users.json'

module.exports = {
	name: Events.GuildMemberRemove,
	async execute(member: GuildMember) {
		const goodbyeChannel = member.guild.channels.cache.get(settings.channels.goodbye) as TextChannel;
		
		const description = member.id === specialUser.lexiolty ? '**Le caribou a pris la fuite**' : `${userMention(member.id)} a pris la fuite.`;
		await goodbyeChannel.send({ embeds: [new EmbedBuilder()
			.setColor(Colors.DarkOrange)
			.setDescription(description)
			.setThumbnail(member.displayAvatarURL())
			.setFooter({ text: `Nous somme désormais ${member.guild.memberCount}.`})] 
		});
	}
};