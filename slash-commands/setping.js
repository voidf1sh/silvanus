const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const dbfn = require('../modules/dbfn.js');
const fn = require('../modules/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setping')
		.setDescription('Opt-in to automatic water reminders')
		.addStringOption(o =>
			o.setName('pingmsg')
			 .setDescription('The message to send for a water reminder')
			 .setRequired(true))
		.addChannelOption(o =>
			o.setName('pingchannel')
			 .setDescription('The channel to send the water reminder in')
			 .setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	async execute(interaction) {
		try {
			await interaction.deferReply({ ephemeral: true });
			const reminderMessage = interaction.options.getString('pingmsg');
			const reminderChannel = interaction.options.getChannel('pingchannel');
			const setPingRoleResponse = await dbfn.setReminderInfo(interaction.guildId, reminderMessage, reminderChannel.id);
			await dbfn.setReminderOptIn(interaction.guildId, 1);
			interaction.editReply(setPingRoleResponse.status);
		} catch(err) {
			console.error(err);
			await interaction.editReply(fn.builders.errorEmbed(err));
		}
	},
};