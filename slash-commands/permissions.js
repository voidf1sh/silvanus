const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits } = require('discord.js');
const fn = require('../modules/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('permissions')
		.setDescription('Check my permissions here')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const me = interaction.guild.members.me;
		const guildPerms =  me.permissions;
		const manageRoles = guildPerms.has(PermissionsBitField.Flags.ManageRoles);
		const mentionEveryone = guildPerms.has(PermissionsBitField.Flags.MentionEveryone);
		const channelPerms = me.permissionsIn(interaction.channel);
		const viewChannel = channelPerms.has(PermissionsBitField.Flags.ViewChannel);
		const sendMessages = channelPerms.has(PermissionsBitField.Flags.SendMessages);
		const responseParts = [
			`This is the status of my permissions in this server and this channel (<#${interaction.channel.id}>)`,
			`**Guild Permissions**`,
			`Manage Roles: ${manageRoles}`,
			`Mention All Roles: ${mentionEveryone}`,
			`**Channel Permissions**`,
			`View Channel: ${viewChannel}`,
			`Send Messages: ${sendMessages}`
		];
		const replyEmbed = fn.builders.embed(responseParts.join("\n"));
		await interaction.editReply(replyEmbed);
	}
};