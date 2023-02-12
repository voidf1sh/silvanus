const { SlashCommandBuilder } = require('discord.js');
const fn = require('../modules/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setupinfo')
		.setDescription('View information about how the bot is set up in your server'),
	execute(interaction) {
		interaction.deferReply({ephemeral: true}).then(() => {
			fn.getInfo(interaction).then(res => {
				const embed = fn.builders.embed(res);
				interaction.editReply(embed);
			}).catch(err => {
				interaction.editReply(err);
				console.error(err);
			});
		}).catch(err => {
			console.error(err);
		});
	},
};