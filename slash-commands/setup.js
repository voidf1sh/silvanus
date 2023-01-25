const { SlashCommandBuilder } = require('discord.js');
const fn = require('../modules/functions.js');
const strings = require('../data/strings.json');
const dbfn = require('../modules/dbfn.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Attempt automatic configuration of the bot.'),
	execute(interaction) {
		interaction.deferReply({ ephemeral: true }).then(function () {
			/*const guildInfo = { "guildId": "123",
				"treeName": "name",
				"treeHeight": 123,
				"treeMessageId": "123",
				"treeChannelId": "123",
				"leaderboardMessageId": "123",
				"leaderboardChannelId": "123"
			};*/
			const guildInfo = { "guildId": interaction.guildId,
				"treeName": "name",
				"treeHeight": 123,
				"treeMessageId": "123",
				"treeChannelId": "123",
				"leaderboardMessageId": "123",
				"leaderboardChannelId": "123"
			};
			interaction.channel.messages.fetch({ limit: 20 }).then(function (msgs) {
				let treeFound = false;
				let leaderboardFound = false;
				msgs.reverse().forEach(msg => {
					if (msg.embeds.length > 0) {
						if (msg.embeds[0].data.description.includes("Your tree is")) {
							treeFound = true;
							guildInfo.treeName = msg.embeds[0].title;
							guildInfo.treeChannelId = msg.channelId;
							guildInfo.treeMessageId = msg.id;
						} else if (msg.embeds[0].data.title == "Tallest Trees") {
							leaderboardFound = true;
							guildInfo.leaderboardChannelId = msg.channelId;
							guildInfo.leaderboardMessageId = msg.id;
						}
					}
				});
				if (treeFound && !(leaderboardFound)) {
					dbfn.setTreeInfo(guildInfo).then(res => {
						interaction.editReply(fn.builders.embed(strings.status.treeNoLeaderboard));
					}).catch(err => {
						console.error(err);
					});
				} else if (!(treeFound) && leaderboardFound) {
					dbfn.setLeaderboardInfo(guildInfo).then(res => {
						interaction.editReply(fn.builders.embed(strings.status.leaderboardNoTree));
					}).catch(err => {
						console.error(err);
					});
				} else if (treeFound && leaderboardFound) {
					dbfn.setGuildInfo(guildInfo).then(res => {
						interaction.editReply(fn.builders.embed(strings.status.treeAndLeaderboard));
					}).catch(err => {
						console.error(err);
					});
				}
			});
		});
	},
};