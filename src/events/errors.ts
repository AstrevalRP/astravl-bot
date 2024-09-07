import { Events } from "discord.js";
import * as dotenv from 'dotenv';

module.exports = {
	name: Events.Error,
	async execute(error: Error) {
		dotenv.config();
		if (process.env.DEBUG_MODE !== 'true') {
			console.error(
				`Encountered error "${error.name}" caused by "${error.cause}" :\n`
				+`${error.message}`
				+`Continuing the porgram like nothing ever happend. Don't tell!`
			);
			return false;
		} else  {
			return true;
		}
	}
};