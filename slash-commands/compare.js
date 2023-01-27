const { SlashCommandBuilder } = require('discord.js');
const fn = require('../modules/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('compare')
		.setDescription('See how your tree compares to other trees!'),
	async execute(interaction) {
		interaction.deferReply().then(() => {
			fn.rankings.compare(interaction).then(async res => {
				const refreshActionRow = await fn.builders.refreshAction(interaction.guildId);
				const embed = fn.builders.comparisonEmbed(res, refreshActionRow);
				interaction.editReply(embed).catch(err => {
					console.error(err);
				});
			}).catch(err => {
				interaction.editReply(fn.builders.errorEmbed(err)).catch(err => {
					console.error(err);
				});
				console.error(err);
			});
		})
	},
};