const fn = require('../modules/functions.js');

module.exports = {
	name: "permissions",
	description: "",
	usage: ".permissions",
	permission: "devTeam", // "devTeam" or "owner"
	async execute(message, commandData) {
		if (fn.dotCommands.checkPermissions(this.permission, message.author.id)) {
			try {
				const me = message.guild.members.me;
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
				await message.reply(replyEmbed);
			} catch (err) {
				console.error(err);
				await message.reply(fn.builders.errorEmbed("There was an error running the command."));
			}
		}
	}
}