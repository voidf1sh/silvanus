const fn = require('../modules/functions.js');

module.exports = {
	name: "message",
	description: "Send a message to a server owner or server",
	usage: "<serverID> <content>".message,
	permission: "owner",
	async execute(message, commandData) {
		if (fn.dotCommands.checkPermissions(this.permission, message.author.id)) {
			try {
				// Code Here
				args = commandData.args.split(" ");
				const guildOwnerId = args.shift();
				const content = args.join(" ");
				const dmChannel = await message.client.users.createDM(guildOwnerId);
				await dmChannel.send(content);
			} catch (err) {
				console.error(err);
				await message.reply(fn.builders.errorEmbed("There was an error running the command: " + err));
			}
		}
	}
}