const { SlashCommandBuilder, Guild } = require('discord.js');
const dbfn = require('../modules/dbfn.js');
const fn = require('../modules/functions.js');
const strings = require('../data/strings.json');
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
				// Handle a missing tree or leaderboard
				let errors = [];
				if (guildInfo.treeMessageId === "") {
					errors.push(strings.error.noTreeMessage);
				} else if (guildInfo.leaderboardMessageId === "") {
					errors.push(strings.error.noLeaderboardMessage);
				}
				if (errors.length > 0) {
					const embed = fn.builders.errorEmbed(`Unable to complete comparison, unable to find message(s):\n${errors.join("\n")}`);
					await interaction.editReply(embed);
					return;
				}
				// Build the string that shows the comparison // TODO Move the string building section to fn.builders?
				const comparedRankings = await fn.rankings.compare(guildInfo);

				const embed = fn.builders.comparisonEmbed(comparedRankings, guildInfo);
				await interaction.editReply(embed).then(async m => {
					guildInfo.setCompareMessage(m.channel.id, m.id);
					const query = guildInfo.queryBuilder("setCompareMessage");
					await dbfn.setGuildInfo(query);
				}).catch(e => console.error(e));
			} else {
				let errors = [];
				errors.push(strings.error.noTreeMessage);
				errors.push(strings.error.noLeaderboardMessage);
				const embed = fn.builders.errorEmbed(`Unable to complete comparison, unable to find message(s):\n${errors.join("\n")}`);
				await interaction.editReply(embed);
			}
		} catch (err) {
			interaction.editReply(fn.builders.errorEmbed(err)).catch(err => {
				console.error(err);
			});
			console.error(err);
		}
	},
};