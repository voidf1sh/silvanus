const { SlashCommandBuilder } = require('discord.js');
const fn = require('../modules/functions.js');
const guildInfo = require('../data/guildInfo.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Attempt automatic configuration of the bot.'),
	execute(interaction) {
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
		interaction.channel.messages.fetch({ limit: 20 }).then(msgs => {
			let treeFound = false;
			let rankFound = false;
			msgs.forEach(msg => {
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
				interaction.reply(fn.builders.embed("A tree message was found, but a leaderboard message was not. Please run this command again in the channel containing the leaderboard if you haven't done so already.  Run ``/setupinfo`` to see if the message is set."));
			} else if (!(treeFound) && rankFound) {
				interaction.reply(fn.builders.embed("A leaderboard message was found, but a tree message was not. Please run this command again in the channel containing the tree if you haven't done so already. Run ``/setupinfo`` to see if the message is set."));
			} else if (treeFound && rankFound) {
				interaction.reply(fn.builders.embed("Tree and leaderboard messages were both found, setup is complete. Run ``/setupinfo`` to verify."));
			}
		});
	},
};