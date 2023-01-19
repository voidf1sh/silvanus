const { SlashCommandBuilder } = require('discord.js');
const fn = require('../functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('compare')
		.setDescription('See how your tree compares to other trees!'),
	async execute(interaction) {
		const embed = fn.builders.comparisonEmbed(fn.rankings.compare(interaction), fn.builders.refreshAction());
		interaction.reply(embed);
	},
};