const fn = require('../modules/functions.js');

module.exports = {
	name: "ping",
	description: "pong",
	usage: "ping pong",
	permission: "devTeam",
	async execute(message, commandData) {
		if (fn.dotCommands.checkPermissions(this.permission, message.author.id)) {
			try {
				await message.reply("Pong!");
			} catch (err) {
				console.error(err);
				await message.reply(fn.builders.errorEmbed("There was an error running the command."));
			}
		}
	}
}