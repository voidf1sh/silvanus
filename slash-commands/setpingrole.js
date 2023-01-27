const { SlashCommandBuilder } = require('discord.js');
const dbfn = require('../modules/dbfn.js');
const fn = require('../modules/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setpingrole')
		.setDescription('Set the role to ping when you run /setping')
		.addRoleOption(o =>
			o.setName('pingrole')
			 .setDescription('The role to ping')
			 .setRequired(true)),
	async execute(interaction) {
		try {
			await interaction.deferReply({ ephemeral: true });
			const pingRole = interaction.options.getRole('pingrole');
			const setPingRoleResponse = await dbfn.setPingRole(interaction.guildId, pingRole.id);
			interaction.editReply(setPingRoleResponse.status);
		} catch(err) {
			console.error(err);
			await interaction.editReply(fn.builders.errorEmbed(err));
		}
	},
};