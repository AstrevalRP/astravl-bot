import { APIEmbedField, ButtonBuilder, EmbedBuilder, Message, MessageReaction, TextChannel } from 'discord.js';
import fs = require('fs');
import path = require('path');

export abstract class WordVariants {
	private static frenchVowels = ['a', 'e', 'i', 'o', 'u', 'y'];
    
	public static generateVariants(word: string): string[] {
        let variants: string[] = [word, `${word}s`];
        
        if (this.endsWithVowel(word)) {
			this.frenchVowels.forEach(vowel => {
				if (word.endsWith(vowel)) variants.push(word.slice(0, word.length - 1));
			});
        }
        return variants;
    }
    private static endsWithVowel(word : string): boolean {
		for (const vowel of this.frenchVowels)
			if (word.endsWith(vowel)) return true;
        return false;
    }
}
export abstract class JsonUtils {
	public static getJsonContent(pathToJson: string): Object[] {
		return JSON.parse(fs.readFileSync(path.join(__dirname, pathToJson), { encoding: 'utf-8' }))
	}
	public static writeJsonContent(pathToJson: string, data: any, charFormat: string): void {
		fs.writeFileSync(path.join(__dirname, pathToJson), JSON.stringify(data, null, charFormat), { encoding: 'utf-8' });
	}
}
export abstract class ReactionUtils {
	public static async updatedReactionMessageConfigEmojis(message: Message): Promise<void> {
		const messageReactions: MessageReaction[] = []; message.reactions.cache.forEach(reaction => messageReactions.push(reaction));
		const updatedFields: APIEmbedField[] = message.embeds[0].fields;

		for (let i = 0; i < updatedFields.length -1; i++) {
			// We start from 1 since index 0 is used for the channel.
			updatedFields[i+1].name = messageReactions[i] ? messageReactions[i].emoji.toString() : '-';
		}

		await message.edit({ 
			embeds: [EmbedBuilder.from(message.embeds[0]).setFields(updatedFields)], 
			components: message.components 
		});

		// Remove surplus reactions
		messageReactions.forEach(messageReaction => {
			if (!updatedFields.some(field => field.name === messageReaction.emoji.toString())) {
				messageReaction.users.cache.forEach(user => {
					messageReaction.users.remove(user);
				});
			}
		});

		if (message.embeds[0].fields[0]) { // False during reset phase
			let isReady = true;
			if (message.embeds[0].fields[0].value === '-') isReady = false;
			for (let i = 1; i < message.embeds[0].fields.length; i++) {
				if (message.embeds[0].fields[i].name === '-') {
					isReady = false;
					break;
				}
			}
	
			const updatedComponents = message.components;
			(updatedComponents[2].components[0] as unknown as ButtonBuilder) = ButtonBuilder.from(updatedComponents[2].components[0] as unknown as ButtonBuilder).setDisabled(!isReady);
			
			await message.edit({ embeds: message.embeds, components : updatedComponents });
		}
	}

	// public static async updateReactionMessageConfigRoles(message: Message): Promise<void> {

	// }
}
export abstract class ArrayUtils {
    public static removeElement<T>(array : Array<T>, element : T | undefined): Array<T> {
        if (element) {
			const index = array.indexOf(element);
			if (index > -1) array.splice(index, 1);
		}
		return array;
    }
    public static removeElements<T>(array : Array<T>, elements : Array<T>): Array<T> {
        elements.forEach(element => {
            const index = array.indexOf(element);
            if (index > -1) array.splice(index, 1);
        });
        return array;
    }
	public static getRandomIndex<T>(array: Array<T>): T {
		return array[MathUtils.randomIntExclusive(0, array.length)];
	}
	// From https://medium.com/@oarthurnardi/list-comprehensions-in-typescript-2a32dbea1405
	public static listComprehension<T>(list: T[], callback: (item: T) => boolean): T[] {
		return list.filter(callback).map((item) => item);
	}
}
export abstract class MathUtils {
	/**
	 * @param min The minimum integer value the function can return
	 * @param max The maximum integer value the function can return (inclusive)
	 * @returns A random integer between the given bounds.
	 */
	public static randomIntInclusive(min: number, max: number):number {
		return Math.floor(Math.random() * (max - min + 1)) + min
	}
	/**
	 * @param min The minimum integer value the function can return
	 * @param max The maximum integer value the function can return (exclusive)
	 * @returns A random integer between the given bounds.
	 */
	public static randomIntExclusive(min: number, max: number):number {
		return Math.floor(Math.random() * (max - min)) + min
	}
}
export abstract class TimingUtils {
	public static milisecondsFromSeconds(seconds: number): number {
		return seconds * 1000;
	}
	public static milisecondsFromMinutes(minutes: number): number {
		return minutes * 60 * 1000;
	}
}
export abstract class MessageUtils {
	public static blackList = JsonUtils.getJsonContent('../../data/blacklist.json') as string[];
	
	/**
	 * The time it takes for the bot to write a sigle character.  
	 * In other words, how long it would take for it to press a key on its non-existent keyboard
	 */
	public static botTypingSpeed: number = TimingUtils.milisecondsFromSeconds(0.25);

	// static async sendMessage(channel: TextChannel, message: string, replyTo: Message, deletionDelay: number, typingDelay: number): Promise<void>;
	// static async sendMessage(channel: TextChannel, message: string, replyTo: Message, deletionDelay: number): Promise<void>;
	// static async sendMessage(channel: TextChannel, message: string, replyTo: Message): Promise<void>;
	// static async sendMessage(channel: TextChannel, message: string, typingDelay: number, deletionDelay: number): Promise<void>;
	// static async sendMessage(channel: TextChannel, message: string, deletionDelay: number): Promise<void>;
	// static async sendMessage(channel: TextChannel, message: string): Promise<void>;
	/**
	 * Uses a realistic typing speed and a convinient way to send and delete messages asyncronously with a given delay.
	 * @param The channel the message should be sent in.
	 * @param messageContent The message that should be sent.
	 * @param replyTo The message the bot should reply to.
	 * @param typingDelay The duration between now and the typing of the message
	 * @param deletionDelay The duration between the delivery of the message and its deletion.
	 */
	static async sendMessage(channel: TextChannel, messageContent: string, typingDelay?: number, deletionDelay?: number, replyTo?: Message): Promise<void> {
		if (typingDelay) setTimeout(async () => { await channel.sendTyping(); }, typingDelay);
		else await channel.sendTyping();
	
		setTimeout(async () => {
			let sentMessage: Message;
			if (replyTo) sentMessage = await replyTo.reply({ content : messageContent });
			else sentMessage = await channel.send({ content : messageContent });
			
			if (deletionDelay) setTimeout(() => { sentMessage!.delete(); }, deletionDelay);
			return sentMessage;
		}, messageContent.length * this.botTypingSpeed);
	}

	/**
	 * @param millisecondsPerCharWritten The amount in milliseconds it should take the bot for typing one character.
	 */
	public static setBotTypingSpeed(millisecondsPerCharWritten: number): void {
		this.botTypingSpeed = millisecondsPerCharWritten;
	}
	/**
	 * @param messageContent 
	 * @returns Whether or not the given string contains a fishing link.
	 */
	public static containsBanedLink(messageContent: string): boolean {
		const bannedLinkRegExp : RegExp = new RegExp(fs.readFileSync(path.join(__dirname, '../../data/banned_link_regexp.txt').replace('\n', ''), {encoding: 'utf8'}));
		return bannedLinkRegExp.test(messageContent);
	}
	/**
	 * 
	 * @param messageContent 
	 * @returns Whether or not the given message content (as a single string) contains a fishing link.
	 */
	public static containsCurseWord(messageContent: string): boolean {
		for (const curseWord of MessageUtils.blackList) {
			if (messageContent.includes(curseWord)) {
				return true;
			}
		};
		return false;
	}
	/**
	 * @param messageContent 
	 * @param floodLimit The minimum amount of similar characters for the detection to be taken into account.
	 * @returns Whether or not the given message (as a single string) contains flooding.
	 */
	public static containsFlooding(messageContent: string, floodLimit: number): boolean {
		let counter = 0;
		for (let i = 0; i < messageContent.length; i++) {
			if (counter === floodLimit)
				return true;
			else if (messageContent[i+1] !== undefined)		
				messageContent[i].toLowerCase() === messageContent[i+1].toLowerCase() ? counter++ : counter = 0; 
		}
		return false;
	}
	/**
	 * @param messageContent 
	 * @returns The list of curse words found inside the given message (as a single string).
	 */
	public static getCurseWords(messageContent: string): string[] {
		let swearWords:string[] = [];
		MessageUtils.blackList.forEach((curseWord: string) => {
			if (messageContent.includes(curseWord)) swearWords.push(curseWord);
		})
		return swearWords;
	}

}

export function mentionToId(mention: string): string {
    return mention.replaceAll(/[\\<>@#&!]/g, '');
}

