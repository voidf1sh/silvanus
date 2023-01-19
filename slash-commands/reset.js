const { SlashCommandBuilder } = require('discord.js');
const fn = require('../functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset')
		.setDescription('Reset all message assignments in your server'),
	execute(interaction) {
		fn.reset(interaction.guildId);
		interaction.reply(fn.builders.embed("Assignments Reset"));
	},
};