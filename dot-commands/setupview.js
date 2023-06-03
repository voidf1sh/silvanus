const fn = require('../modules/functions.js');

module.exports = {
	name: "setupview",
	description: "",
	usage: "",
	permission: "devTeam",
	async execute(message, commandData) {
		// Code here...
		if (fn.dotCommands.checkPermissions(this.permission, message.author.id)) {
			try {
				if (message.client.guildInfos.has(message.guildId)) {
					let guildInfo = message.client.guildInfos.get(message.guildId);
					await message.reply(fn.builders.embed(guildInfo.generateSetupInfo()));
				} else {
					await message.reply(fn.builders.errorEmbed("Guild doesn't exist in database!"));
				}
			} catch (err) {
				console.error(err);
				await message.reply(fn.builders.errorEmbed("There was an error running the command."));
			}
		}
	}
}