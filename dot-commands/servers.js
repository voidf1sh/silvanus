const fn = require('../modules/functions.js');

module.exports = {
	name: "servers",
	description: "Get a list of servers the bot is in",
	usage: ".servers",
	permission: "owner",
	async execute(message, commandData) {
		if (fn.dotCommands.checkPermissions(this.permission, message.author.id)) {
			try {
				let servers = [];
				const count = JSON.stringify(message.client.guilds.cache.size);
				servers.push("I'm currently in " + count + " servers.");
				const guilds = await message.client.guilds.cache;
				await message.reply(servers.join("\n"));
			} catch (err) {
				console.error(err);
				await message.reply(fn.builders.errorEmbed("There was an error running the command."));
			}
		}
	}
}