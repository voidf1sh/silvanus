const { SlashCommandBuilder, Guild } = require('discord.js');
const dbfn = require('../modules/dbfn.js');
const fn = require('../modules/functions.js');
const { GuildInfo } = require('../modules/CustomClasses.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('compare')
		.setDescription('See how your tree compares to other trees!'),
	async execute(interaction) {
		try {
			await interaction.deferReply();
			// Get the guildInfo from the database

			if (interaction.client.guildInfos.has(interaction.guildId)) {
				let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
				const findMessagesResponse = await fn.messages.find(interaction, guildInfo);
				if (findMessagesResponse.code == 1) {
					let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
					// Parse the leaderboard message
					await fn.rankings.parse(interaction, guildInfo);
					// Build the string that shows the comparison // TODO Move the string building section to fn.builders?
					const comparedRankings = await fn.rankings.compare(interaction, guildInfo);

					const embed = fn.builders.comparisonEmbed(comparedRankings, guildInfo);
					await interaction.editReply(embed).catch(e => console.error(e));
				} else {
					await interaction.editReply(fn.builders.errorEmbed(findMessagesResponse.status));
				}
			} else {
				// Create a basic guildInfo with blank data
				let guildInfo = new GuildInfo()
					.setId(interaction.guildId)
					.setTreeMessage("", interaction.channelId)
					.setLeaderboardMessage("", interaction.channelId)
				// Using the above guildInfo, try to find the Grow A Tree messages
				const findMessagesResponse = await fn.messages.find(interaction, guildInfo);
				guildInfo = findMessagesResponse.data;
				if (findMessagesResponse.code == 1) {
					// Build the string that shows the comparison // TODO Move the string building section to fn.builders?
					const comparedRankings = await fn.rankings.compare(interaction, guildInfo);
					const embed = fn.builders.comparisonEmbed(comparedRankings, guildInfo);
					await interaction.editReply(embed).catch(e => console.error(e));
				} else {
					await interaction.editReply(fn.builders.errorEmbed(findMessagesResponse.status));
				}
			}
		} catch (err) {
			interaction.editReply(fn.builders.errorEmbed(err)).catch(err => {
				console.error(err);
			});
			console.error(err);
		}
	},
};