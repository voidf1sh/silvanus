/* eslint-disable comma-dangle */
// dotenv for handling environment variables
const dotenv = require('dotenv');
dotenv.config();
const isDev = process.env.isDev;
const package = require('../package.json');

// filesystem
const fs = require('fs');

// Discord.js
const Discord = require('discord.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = Discord;

// Various imports from other files
const config = require('../data/config.json');
const strings = require('../data/strings.json');
const slashCommandFiles = fs.readdirSync('./slash-commands/').filter(file => file.endsWith('.js'));
const dbfn = require('./dbfn.js');
const { finished } = require('stream');

dbfn.createGuildTables().then(res => {
	console.log(res.status);
}).catch(err => {
	console.error(err);
});

const functions = {
	// Functions for managing and creating Collections
	collections: {
		// Create the collection of slash commands
		slashCommands(client) {
			if (!client.slashCommands) client.slashCommands = new Discord.Collection();
			client.slashCommands.clear();
			for (const file of slashCommandFiles) {
				const slashCommand = require(`../slash-commands/${file}`);
				if (slashCommand.data != undefined) {
					client.slashCommands.set(slashCommand.data.name, slashCommand);
				}
			}
			if (isDev) console.log('Slash Commands Collection Built');
		}
	},
	builders: {
		refreshAction() {
			// Create the button to go in the Action Row
			const refreshButton = new ButtonBuilder()
				.setCustomId('refresh')
				.setLabel('Refresh')
				.setStyle(ButtonStyle.Primary);
			// Create the Action Row with the Button in it, to be sent with the Embed
			const refreshActionRow = new ActionRowBuilder()
				.addComponents(
					refreshButton
				);
			return refreshActionRow;
		},
		comparisonEmbed(content, refreshActionRow) {
			// Create the embed using the content passed to this function
			const embed = new EmbedBuilder()
				.setColor(strings.embeds.color)
				.setTitle('Tree Growth Comparison')
				.setDescription(content)
				.setFooter({text: `v${package.version} - ${strings.embeds.footer}`});
			const messageContents = { embeds: [embed], components: [refreshActionRow] };
			return messageContents;
		},
		helpEmbed(content, private) {
			const embed = new EmbedBuilder()
				.setColor(strings.embeds.color)
				.setTitle(strings.help.title)
				.setDescription(content)
				.setFooter({ text: `v${package.version} - ${strings.embeds.footer}` });
			const privateBool = private == 'true';
			const messageContents = { embeds: [embed], ephemeral: privateBool };
			return messageContents;
		},
		errorEmbed(content) {
			const embed = new EmbedBuilder()
				.setColor(0xFF0000)
				.setTitle('Error!')
				.setDescription("Error: " + content)
				.setFooter({ text: `v${package.version} - ${strings.embeds.footer}` });
			const messageContents = { embeds: [embed], ephemeral: true };
			return messageContents;
		},
		embed(content) {
			const embed = new EmbedBuilder()
				.setColor(0x8888FF)
				.setTitle('Information')
				.setDescription(content)
				.setFooter({ text: `v${package.version} - ${strings.embeds.footer}` });
			const messageContents = { embeds: [embed], ephemeral: true };
			return messageContents;
		}
	},
	rankings: {
		parse(interaction) {
			return new Promise ((resolve, reject) => {
				dbfn.getGuildInfo(interaction.guildId).then(res => {
					const guildInfo = res.data;
					if (guildInfo.guildId == "") {
						reject(strings.error.noGuild);
						return;
					}
					if (guildInfo.leaderboardMessageId != undefined) {
						interaction.guild.channels.fetch(guildInfo.leaderboardChannelId).then(c => {
							c.messages.fetch(guildInfo.leaderboardMessageId).then(leaderboardMessage => {
								if ((leaderboardMessage.embeds.length == 0) || (leaderboardMessage.embeds[0].data.title != 'Tallest Trees' )) {
									reject("This doesn't appear to be a valid ``/top trees`` message.");
									return;
								}
								let lines = leaderboardMessage.embeds[0].data.description.split('\n');
								let leaderboard = {
									"guildId": interaction.guildId,
									"entries": []
								};
								for (let i = 0; i < 10; i++) {
									// Breakdown each line separating it on each -
									let breakdown = lines[i].split(' - ');

									// Check if the first part, the ranking, has these emojis to detect first second and third place
									if (breakdown[0].includes('🥇')) {
										breakdown[0] = '``#1 ``'
									} else if (breakdown[0].includes('🥈')) {
										breakdown[0] = '``#2 ``'
									} else if (breakdown[0].includes('🥉')) {
										breakdown[0] = '``#3 ``'
									}
									
									// Clean off the excess and get just the number from the rank, make sure it's an int not string
									let trimmedRank = parseInt(breakdown[0].slice(breakdown[0].indexOf('#') + 1, breakdown[0].lastIndexOf('``')));
									
									// Clean off the excess and get just the tree name
									let trimmedName = breakdown[1].slice(breakdown[1].indexOf('``') + 2);
									trimmedName = trimmedName.slice(0, trimmedName.indexOf('``'));
									
									// Clean off the excess and get just the tree height, make sure it's a 1 decimal float
									let trimmedHeight = parseFloat(breakdown[2].slice(0, breakdown[2].indexOf('ft'))).toFixed(1);
									let isMyTree = false;
									let isMaybeMyTree = false;
									if (breakdown[2].includes('📍')) isMyTree = true;
									if (breakdown[1].includes(guildInfo.treeName)) maybeMyTree = true;

									// "entries": [ { "treeHeight": 12, "treeRank": 34, "treeName": "name" }, ] }
									
									
									leaderboard.entries.push({
										treeRank: trimmedRank,
										treeName: trimmedName,
										treeHeight: trimmedHeight,
										hasPin: isMyTree
									});
								}
			
								dbfn.uploadLeaderboard(leaderboard).then(res => {
									console.log(res.status);
									resolve(res.status);
								}).catch(err => {
									console.error(err);
									reject(err);
									return;
								});
							});
						});
					} else {
						reject("The leaderboardMessageId is undefined somehow");
						return;
					}
				}).catch(err => {
					reject(err);
					return;
				});
			});
			
		},
		async compare(interaction) {
			try {
				// fetch the guild's settings from the database
				const guildInfoResponse = await dbfn.getGuildInfo(interaction.guildId);
				const guildInfo = guildInfoResponse.data; // { "guildId": "123","treeName": "name","treeHeight": 123,"treeMessageId": "123","treeChannelId": "123","leaderboardMessageId": "123","leaderboardChannelId": "123"};
				// Get the most recent leaderboard listing from the database
				const getLeaderboardResponse = await dbfn.getLeaderboard(interaction.guildId);
				const leaderboard = getLeaderboardResponse.data; // [ { treeName: "Name", treeHeight: 1234.5, treeRank: 67 }, {...}, {...} ]
		
				// Prepare the beginning of the comparison message
				let comparisonReplyString = `Here\'s how your tree compares: \nCurrent Tree Height: ${guildInfo.treeHeight}ft\n\n`;
				// Iterate over the leaderboard entries, backwards
				for (let i = leaderboard.length - 1; i >= 0; i--) {
					const leaderboardEntry = leaderboard[i];
					// Setup the status indicator, default to blank, we'll change it later
					let statusIndicator = "``[";
					if ((leaderboardEntry.treeHeight % 1).toFixed(1) > 0) statusIndicator += "💧|";
					
					// Get the data for this tree from 24 hours ago
					const get24hTreeResponse = await dbfn.get24hTree(interaction.guildId, leaderboardEntry.treeName);
					const dayAgoTree = get24hTreeResponse.data;
					const hist24hDifference = (leaderboardEntry.treeHeight - dayAgoTree.treeHeight).toFixed(1);
					statusIndicator += `+${hist24hDifference}ft|`

					// Get the 24h watering time for this tree
					const totalWaterTime = await functions.timeToHeight(dayAgoTree.treeHeight, leaderboardEntry.treeHeight);
					statusIndicator += `${totalWaterTime}]\`\``;
		
					// Determine if this tree is the guild's tree
					if (leaderboardEntry.hasPin) {
						comparisonReplyString += `#${leaderboardEntry.treeRank} - This is your tree`;
					} else { // If it's another guild's tree
						// Calculate the current height difference
						const currentHeightDifference = guildInfo.treeHeight - leaderboardEntry.treeHeight;
		
						if (currentHeightDifference > 0) { // Guild Tree is taller than the leaderboard tree
							comparisonReplyString += `#${leaderboardEntry.treeRank} - ${currentHeightDifference.toFixed(1)}ft taller`;
						} else {
							comparisonReplyString += `#${leaderboardEntry.treeRank} - ${Math.abs(currentHeightDifference).toFixed(1)}ft shorter`;
						}
					}
					// Build a string using the current leaderboard entry and the historic entry from 24 hours ago
					comparisonReplyString += `\n${statusIndicator}\n`;
					if (process.env.isDev == 'true') comparisonReplyString += `Current Height: ${leaderboardEntry.treeHeight} 24h Ago Height: ${dayAgoTree.treeHeight}\n`;
				}
				return comparisonReplyString;
			} catch (err) {
				console.error(err);
				return 'An error occurred while comparing the trees.';
			}
		}
	},
	tree: {
		parse(interaction) {
			let input;
			return new Promise((resolve, reject) => {
				dbfn.getGuildInfo(interaction.guildId).then(res => {
					const guildInfo = res.data;
					guildInfo.guildId = interaction.guildId;
					if (guildInfo == undefined) {
						reject(`The guild entry hasn't been created yet. [${interaction.guildId || interaction.commandGuildId}]`);
						return;
					}
					if (guildInfo.treeMessageId != "Run /setup where your tree is.") {
						interaction.guild.channels.fetch(guildInfo.treeChannelId).then(c => {
							c.messages.fetch(guildInfo.treeMessageId).then(m => {
								if ( (m.embeds.length == 0) || !(m.embeds[0].data.description.includes('Your tree is')) ) {
									reject("This doesn't appear to be a valid ``/tree`` message.");
									return;
								}
								input = m.embeds[0].data.description;
								let treeName = m.embeds[0].data.title;
								let lines = input.split('\n');
								guildInfo.treeHeight = parseFloat(lines[0].slice(lines[0].indexOf('is') + 3, lines[0].indexOf('ft'))).toFixed(1);
								guildInfo.treeName = treeName;
								dbfn.setTreeInfo(guildInfo).then(res => {
									resolve("The reference tree message has been saved/updated.");
								});
							});
						})
					} else {
						console.error('treeMessageId undefined');
						reject("There was an unknown error while setting the tree message.");
						return;
					}
				}).catch(err => {
					reject(err);
					console.error(err);
					return;
				});
			});
		}
	},
	refresh(interaction) {
		functions.rankings.parse(interaction).then(r1 => {
			functions.tree.parse(interaction).then(r2 => {
				functions.rankings.compare(interaction).then(res => {
					const embed = functions.builders.comparisonEmbed(res, functions.builders.refreshAction())
					interaction.update(embed);
				}).catch(err => {
					console.error(err);
				});
			}).catch(e => {
				console.error(e);
				interaction.reply(functions.builders.errorEmbed(e));
			});
		}).catch(e => {
			console.error(e);
			interaction.reply(functions.builders.errorEmbed(e));
		});
	},
	reset(guildId) {
		return new Promise((resolve, reject) => {
			dbfn.deleteGuildInfo(guildId).then(res => {
				resolve(res);
			}).catch(err => {
				console.error(err);
				reject(err);
				return;
			});
		});
	},
	getInfo(guildId) {
		return new Promise((resolve, reject) => {
			dbfn.getGuildInfo(guildId).then(res => {
				let guildInfo = res.data;
				let guildInfoString = "";
				guildInfoString += `Tree Message: https://discord.com/channels/${guildId}/${guildInfo.treeChannelId}/${guildInfo.treeMessageId}\n`;
				guildInfoString += `Rank Message: https://discord.com/channels/${guildId}/${guildInfo.leaderboardChannelId}/${guildInfo.leaderboardMessageId}\n`;
				resolve(`Here is your servers setup info:\n${guildInfoString}`);
			}).catch(err => {
				console.error(err);
				reject(err);
				return;
			})
		});
	},
	getWaterTime(size) {
		return Math.floor(Math.pow(size * 0.07 + 5, 1.1)); // Seconds
	},
	timeToHeight(beginHeight, destHeight) {
		return new Promise((resolve, reject) => {
			let time = 0;
			for (let i = beginHeight; i < destHeight; i++) {
				const waterTime = parseFloat(functions.getWaterTime(i));
				// console.log("Height: " + i + "Time: " + waterTime);
				time += waterTime;
			}

			// 60 secs in min
			// 3600 secs in hr
			// 86400 sec in day

			let units = " secs";
			if ( 60 < time && time <= 3600 ) { // Minutes
				time = parseFloat(time / 60).toFixed(1);
				units = " mins";
			} else if ( 3600 < time && time <= 86400 ) {
				time = parseFloat(time / 3600).toFixed(1);
				units = " hrs";
			} else if ( 86400 < time ) {
				time = parseFloat(time / 86400).toFixed(1);
				units = " days";
			}
			resolve(time + units);
		});
	},
	setReminder(interaction, time, pingRoleId) {
		const reminderChannel = interaction.channel;
		setTimeout(function () {
			reminderChannel.send(`<@&${pingRoleId}>`).then(m => {
				if (m.deletable) {
					setTimeout(function() {
						m.delete();
					}, 60000);
				}
			});
		}, time);
	}
};

module.exports = functions;