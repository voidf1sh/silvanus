const fn = require('../modules/functions.js');

module.exports = {
	name: "servers",
	description: "Get a list of servers the bot is in",
	usage: ".servers",
	async execute(message, commandData) {
		let servers = [];
		const count = JSON.stringify(message.client.guilds.cache.size);
		servers.push("I'm currently in " + count + " servers.");
		const guilds = await message.client.guilds.cache;
		// await guilds.each(g => {
		// 	servers.push(g.name + "," + g.ownerId);
		// });
		await message.reply(servers.join("\n"));
	}
}