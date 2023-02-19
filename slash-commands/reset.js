const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fn = require('../modules/functions.js');
const strings = require('../data/strings.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset')
		.setDescription('Reset all message assignments in your server')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	execute(interaction) {
		interaction.deferReply({ ephemeral: true }).then(() => {
			fn.reset(interaction).then(res => {
				interaction.editReply(fn.builders.embed(strings.status.reset)).catch(err => {
					console.error(err);
				});
			}).catch(err => {
				console.error(err);
				interaction.editReply(strings.status.resetError).catch(err => {
					console.error(err);
				});
			});
		}).catch(err => {
			console.error(err);
		});
	},
};