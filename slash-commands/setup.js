const { SlashCommandBuilder } = require('discord.js');
const fn = require('../functions.js');
const messageIds = require('../messageIds.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Attempt automatic configuration of the bot.'),
	execute(interaction) {
		if (messageIds[interaction.guildId] == undefined) {
			messageIds[interaction.guildId] = {
				"treeMessageId": "",
				"treeChannelId": "",
				"rankMessageId": "",
				"rankChannelId": "",
				"rankings": [],
				"treeHeight": 0
			};
		}
		interaction.channel.messages.fetch({ limit: 20 }).then(msgs => {
			let treeFound = false;
			let rankFound = false;
			msgs.forEach(msg => {
				if (msg.embeds.length > 0) {
					if (msg.embeds[0].data.description.includes("Your tree is")) {
						treeFound = true;
						messageIds[interaction.guildId].treeChannelId = msg.channelId;
						messageIds[interaction.guildId].treeMessageId = msg.id;
						fn.tree.parse(msg);
					} else if (msg.embeds[0].data.title == "Tallest Trees") {
						rankFound = true;
						messageIds[interaction.guildId].rankChannelId = msg.channelId;
						messageIds[interaction.guildId].rankMessageId = msg.id;
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