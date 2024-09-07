import { Colors, EmbedBuilder, Events, GuildMember, TextChannel, userMention } from "discord.js";
import { ArrayUtils } from "../global/utils";
import settings from '../../data/settings.json'

module.exports = {
	name: Events.GuildMemberAdd,
	async execute(member: GuildMember) {
		const welcomeChannel = member.guild.channels.cache.get(settings.channels.welcome) as TextChannel;
		
		const hours = new Date().getHours();
		const isEarlyMorning = hours >= 5 && hours < 9.5;
		const isDay = hours >= 9.5 && hours < 19;
		const isEvening = hours >= 19 && hours < 23;
		const isLateNight = hours >= 22 || hours < 5;

		const earlyMorningMessages = ["Plutôt matinal(e) :eyes:", "Matinale :face_with_monocle:", "Déjà debout ?... Enchanté !"];
		const dayMessages = ["Salut :slight_smile:", "Bienvenue !", "Bien le bonjour.", "Un nouvel arrivant :o", "Bien le bonjour :slight_smile:"];
		const eveningMessages = ["Bonsoir.", "Un arrivant en cette belle soirée", "Coucou :slight_smile:"];
		const lateNightMessages = ["Plutôt tardif, bienvenue !", "Pas trop fatigué(e) ? Toujours le/la bienvenu(e) sur Astreval", "Un revenant"];

		const descriptions = [
			`Accueillez chaleureusement ${userMention(member.id)}.`, 
			`Tâchez d'acceuillir ${userMention(member.id)} comme il se doit.`,
			`Entre en scène ${userMention(member.id)} :eyes:`,
			`Un voyageur débarque. Bienvenue ${userMention(member.id)} :oignon:`
		];

		let message = '';
		if (isEarlyMorning) message = ArrayUtils.getRandomIndex(earlyMorningMessages);
		else if (isDay) message = ArrayUtils.getRandomIndex(dayMessages);
		else if (isEvening) message = ArrayUtils.getRandomIndex(eveningMessages);
		else if (isLateNight) message = ArrayUtils.getRandomIndex(lateNightMessages);

		await welcomeChannel.send({ embeds: [new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle(message)
			.setDescription(ArrayUtils.getRandomIndex(descriptions))
			.setThumbnail(member.displayAvatarURL())
			.setFooter({ text: `Nous somme désormais ${member.guild.memberCount} !`})] 
		});
	}
};