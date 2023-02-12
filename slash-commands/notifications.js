const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const dbfn = require('../modules/dbfn.js');
const fn = require('../modules/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('notifications')
		.setDescription('Setup a notification relay for improved water and fruit notifications')
		.addChannelOption(o =>
			o
				.setName('watchchannel')
				.setDescription('The channel Grow A Tree sends your notifications in')
				.setRequired(true))
		.addStringOption(o =>
			o
				.setName('watermessage')
				.setDescription('Message to send for water reminders')
				.setRequired(true))
		.addChannelOption(o =>
			o
				.setName('pingchannel')
				.setDescription('The channel to send the water reminder in')
				.setRequired(true))
		.addStringOption(o =>
			o
				.setName('fruitmessage')
				.setDescription("Message to send for fruit reminders")
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	async execute(interaction) {
		try {
			await interaction.deferReply({ ephemeral: true });
			if (interaction.client.guildInfos.has(interaction.guildId)) {
				const watchChannel = interaction.options.getChannel('watchchannel');
				const waterMessage = interaction.options.getString('watermessage');
				const fruitMessage = interaction.options.getString('fruitmessage') ? interaction.options.getString('fruitmessage') : interaction.options.getString('watermessage');
				const reminderChannel = interaction.options.getChannel('pingchannel');
				let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
				guildInfo.setReminders(waterMessage, fruitMessage, reminderChannel.id, watchChannel.id);
				let query = guildInfo.queryBuilder("setReminders");
				console.log(query);
				await dbfn.setGuildInfo(query);
				await interaction.editReply(`I'll watch <#${watchChannel.id}> for Grow A Tree Notifications and relay them to <#${reminderChannel.id}>.`).catch(e => console.error(e));
				fn.collectionBuilders.guildInfos(interaction.client);
			}
		} catch (err) {
			console.error("Error occurred while setting up a notification relay: " + err);
		}
	},
};