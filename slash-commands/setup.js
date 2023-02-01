const { SlashCommandBuilder } = require('discord.js');
const fn = require('../modules/functions.js');
const strings = require('../data/strings.json');
const dbfn = require('../modules/dbfn.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Attempt automatic configuration of the bot.')
		.addChannelOption(o =>
			o.setName('treechannel')
			 .setDescription('What channel is your tree in?')
			 .setRequired(true))
		.addChannelOption(o =>
			o.setName('leaderboardchannel')
			 .setDescription('If your leaderboard isn\'t in the same channel, where is it?')
			 .setRequired(false)),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		/**/
		let guildInfo = {
			"guildId": interaction.guildId,
			"treeName": "",
			"treeHeight": 0,
			"treeMessageId": "",
			"treeChannelId": `${interaction.options.getChannel('treechannel').id }`,
			"leaderboardMessageId": "",
			"leaderboardChannelId": `${interaction.options.getChannel('leaderboardchannel').id || interaction.options.getChannel('treechannel').id }`,
			"reminderMessage": "",
			"reminderChannelId": "",
			"remindedStatus": 0,
			"reminderOptIn": 0,
		};
		const findMessagesResponse = await fn.messages.find(interaction, guildInfo);
		interaction.editReply(findMessagesResponse.status);
	},
};