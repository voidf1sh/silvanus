const fn = require('../modules/functions.js');

module.exports = {
	name: "leave",
	description: "Leave a server",
	usage: "<serverID> [<serverID>]".leave,
	permission: "owner",
	async execute(message, commandData) {
		if (fn.dotCommands.checkPermissions(this.permission, message.author.id)) {
			try {
				// Code Here
				const serverIds = commandData.args.split(" ");
                for (let i = 0; i < serverIds.length; i++) {
                    const id = serverIds[i];
                    const guild = await message.client.guilds.fetch(id).catch(e => {
						if (!(e.status === 404)) throw e;
					});
                    await guild.leave();
                    await message.channel.send("Left Guild: " + id);
                }
			} catch (err) {
				console.error(err);
				await message.reply(fn.builders.errorEmbed("There was an error running the command: " + err));
			}
		}
	}
}