const { SlashCommandBuilder } = require('discord.js');
const dbfn = require('../modules/dbfn.js');
const fn = require('../modules/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('compare')
		.setDescription('See how your tree compares to other trees!'),
	async execute(interaction) {
		try {
			await interaction.deferReply();
			// Get the guildInfo from the database
			dbfn.getGuildInfo(interaction.guildId).then(async getGuildInfoResponse => {
				let guildInfo = getGuildInfoResponse.data;
				// Find the most recent tree and leaderboard messages in their respective channels
				const findMessagesResponse = await fn.messages.find(interaction, guildInfo);
				if (findMessagesResponse.code == 1) {
					guildInfo = findMessagesResponse.data;
					// Parse the leaderboard message
					await fn.rankings.parse(interaction, guildInfo);
					// Build the string that shows the comparison // TODO Move the string building section to fn.builders?
					const comparedRankings = await fn.rankings.compare(interaction, guildInfo);

					const embed = fn.builders.comparisonEmbed(comparedRankings, guildInfo);
					await interaction.editReply(embed).then(async message => {
						await dbfn.setComparisonMessage(message, interaction.guildId);
					});
				} else {
					await interaction.editReply(fn.builders.errorEmbed(findMessagesResponse.status));
				}

			}).catch(async err => { // If we fail to fetch the guild's info from the database
				// If the error is because the guild hasn't been setup yet, set it up
				if (err === "There is no database entry for your guild yet. Try running /setup") {
					// Create a basic guildInfo with blank data
					let guildInfo = {
						guildId: `${interaction.guildId}`,
						treeName: "",
						treeHeight: 0,
						treeMessageId: "",
						treeChannelId: `${interaction.channelId}`, // Use this interaction channel for the initial channel IDs
						leaderboardMessageId: "",
						leaderboardChannelId: `${interaction.channelId}`,
						reminderMessage: "",
						reminderChannelId: "",
						remindedStatus: 0,
						reminderOptIn: 0,
					}
					// Using the above guildInfo, try to find the Grow A Tree messages
					const findMessagesResponse = await fn.messages.find(interaction, guildInfo);
					guildInfo = findMessagesResponse.data;
					if (findMessagesResponse.code == 1) {
						// Build the string that shows the comparison // TODO Move the string building section to fn.builders?
						const comparedRankings = await fn.rankings.compare(interaction, guildInfo);
						const embed = fn.builders.comparisonEmbed(comparedRankings, guildInfo);
						await interaction.editReply(embed).then(async message => {
							await dbfn.setComparisonMessage(message.id, interaction.guildId);
						});
					} else {
						await interaction.editReply(fn.builders.errorEmbed(findMessagesResponse.status));
					}

				} else {
					await interaction.editReply(fn.builders.errorEmbed("An unknown error occurred while running the compare command."));
					console.error(err);
				}
			});
		} catch (err) {
			interaction.editReply(fn.builders.errorEmbed(err)).catch(err => {
				console.error(err);
			});
			console.error(err);
		}
	},
};