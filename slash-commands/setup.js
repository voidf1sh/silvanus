const { SlashCommandBuilder } = require('discord.js');
const fn = require('../modules/functions.js');
const guildInfo = require('../data/guildInfo.json');
const strings = require('../data/strings.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Attempt automatic configuration of the bot.'),
	execute(interaction) {
		interaction.deferReply({ ephemeral: true }).then(function () {
			if (guildInfo[interaction.guildId] == undefined) {
				guildInfo[interaction.guildId] = {
					"treeMessageId": "",
					"treeChannelId": "",
					"rankMessageId": "",
					"rankChannelId": "",
					"treeName": "",
					"treeHeight": 0,
					"rankings": []
				};
			}
			interaction.channel.messages.fetch({ limit: 20 }).then(function (msgs) {
				let treeFound = false;
				let rankFound = false;
				msgs.reverse().forEach(msg => {
					if (msg.embeds.length > 0) {
						if (msg.embeds[0].data.description.includes("Your tree is")) {
							treeFound = true;
							guildInfo[interaction.guildId].treeChannelId = msg.channelId;
							guildInfo[interaction.guildId].treeMessageId = msg.id;
							fn.tree.parse(msg);
						} else if (msg.embeds[0].data.title == "Tallest Trees") {
							rankFound = true;
							guildInfo[interaction.guildId].rankChannelId = msg.channelId;
							guildInfo[interaction.guildId].rankMessageId = msg.id;
							fn.rankings.parse(msg);
						}
					}
				});
				if (treeFound && !(rankFound)) {
					interaction.editReply(fn.builders.embed(strings.status.treeNoLeaderboard));
				} else if (!(treeFound) && rankFound) {
					interaction.editReply(fn.builders.embed(strings.status.leaderboardNoTree));
				} else if (treeFound && rankFound) {
					interaction.editReply(fn.builders.embed(strings.status.treeAndLeaderboard));
				}
			});
		});
	},
};