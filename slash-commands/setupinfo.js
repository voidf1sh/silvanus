const { SlashCommandBuilder } = require('discord.js');
const fn = require('../modules/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setupinfo')
		.setDescription('View information about how the bot is set up in your server'),
	execute(interaction) {
		const embed = fn.builders.embed(fn.getInfo(interaction.guildId));
		interaction.reply(embed);
	},
};