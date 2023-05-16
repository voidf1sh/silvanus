const fn = require('../modules/functions.js');

module.exports = {
	name: "ping",
	description: "pong",
	usage: "ping pong",
	async execute(message, commandData) {
		// Code here...
		await message.reply("Pong!");
	}
}