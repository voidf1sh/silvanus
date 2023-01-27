const { SlashCommandBuilder } = require('discord.js');
const dbfn = require('../modules/dbfn.js');
const fn = require('../modules/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dumptree')
		.setDescription('Dump the contents of the tree message to console'),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const getGuildInfoResponse = await dbfn.getGuildInfo(interaction.guildId);
		const { treeMessageId, treeChannelId } = getGuildInfoResponse.data;
		interaction.guild.channels.fetch(treeChannelId).then(treeChannel => {
			treeChannel.messages.fetch(treeMessageId).then(treeMessage => {
				interaction.editReply("done");
				console.log(JSON.stringify(treeMessage.embeds[0]));
			});
		});
	},
};