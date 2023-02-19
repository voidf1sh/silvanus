const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const dbfn = require('../modules/dbfn.js');
const fn = require('../modules/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('optout')
		.setDescription('Opt-out of automatic water reminders')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	async execute(interaction) {
		try {
			await interaction.deferReply({ ephemeral: true });
			const setReminderOptInResponse = await dbfn.setReminderOptIn(interaction.guildId, 0);
			interaction.editReply(setReminderOptInResponse.status);
		} catch(err) {
			console.error(err);
			await interaction.editReply(fn.builders.errorEmbed(err));
		}
	},
};