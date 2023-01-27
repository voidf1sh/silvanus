const { SlashCommandBuilder } = require('discord.js');
const dbfn = require('../modules/dbfn.js');
const fn = require('../modules/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setping')
		.setDescription('Run this command when you water your tree to have a reminder sent.'),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const getGuildInfoResponse = await dbfn.getGuildInfo(interaction.guildId);
		const guildInfo = getGuildInfoResponse.data;
		const reminderTimeS = fn.getWaterTime(guildInfo.treeHeight);
		const reminderTimeMs = reminderTimeS * 1000;
		fn.setReminder(interaction, reminderTimeMs, guildInfo.pingRoleId);
		interaction.editReply("A reminder has been set.");
	},
};