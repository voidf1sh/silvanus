const { SlashCommandBuilder } = require('discord.js');
const fn = require('../modules/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset')
		.setDescription('Reset all message assignments in your server'),
	execute(interaction) {
		interaction.deferReply({ ephemeral: true }).then(() => {
			fn.reset(interaction.guildId).then(res => {
				interaction.editReply(fn.builders.embed("Assignments Reset")).catch(err => {
					console.error(err);
				});
			}).catch(err => {
				console.error(err);
				interaction.editReply("There was a problem deleting your guild information, contact @voidf1sh#0420 for help.").catch(err => {
					console.error(err);
				});
			});
		}).catch(err => {
			console.error(err);
		});
	},
};