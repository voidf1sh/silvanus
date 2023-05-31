const fn = require('../modules/functions.js');

module.exports = {
	name: "message",
	description: "Send a message to a server owner or server",
	usage: ".message <serverID> <content>",
	async execute(message, commandData) {
		args = commandData.args.split(" ");
		if (message.client.guildInfos.has(args[0])) {
			let guildInfo = message.client.guildInfos.get(args[0]);
			const guild = await message.client.guilds.fetch(args[0]).catch(async e => {
				await message.reply("I was unable to fetch the guild.");
				console.error(`Error fetching guild to send message: ${e}`);
			});
			const guildOwner = await message.client.users.fetch(guild.ownerId).catch(async e => {
				await message.reply("I was unable to fetch the guild owner.");
				console.error(`Error fetching guild owner to send message: ${e}`);
			});
			await guildOwner.createDM().then(async dm => {
				await dm.send(args.join(" ")).catch(async e => {
					await message.reply("I was unable to send the DM.");
					console.error(`Error sending DM message: ${e}`);
				});
			}).catch(async e => {
				await message.reply("I was unable to create the DM.");
				console.error(`Error creating DM to send message: ${e}`);
				const channel = await guild.channels.fetch(guildInfo.reminderChannelId).catch(async e => {
					await message.reply("I was unable to fetch the channel.");
					console.error(`Error fetching channel to send message: ${e}`);
				});
				await channel.send(args.join(" ")).catch(async e => {
					await message.reply("I was unable to send the message.");
					console.error(`Error sending message: ${e}`);
				});
			});
		} else {
			throw "Guild doesn't exist in database!";
		}
	}
}