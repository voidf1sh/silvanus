/* eslint-disable comma-dangle */
// dotenv for handling environment variables
const dotenv = require('dotenv');
dotenv.config();
const isDev = process.env.isDev;

// filesystem
const fs = require('fs');

// Discord.js
const Discord = require('discord.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = Discord;

// Various imports from other files
const config = require('../data/config.json');
let guildInfo = require('../data/guildInfo.json');
const strings = require('../data/strings.json');
const slashCommandFiles = fs.readdirSync('./slash-commands/').filter(file => file.endsWith('.js'));

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
				.setFooter({text: strings.embeds.footer});
			const messageContents = { embeds: [embed], components: [refreshActionRow] };
			return messageContents;
		},
		helpEmbed(content, private) {
			const embed = new EmbedBuilder()
				.setColor(strings.embeds.color)
				.setTitle('Grow A Tree Analyzer Help')
				.setDescription(content)
				.setFooter({ text: strings.embeds.footer });
			const privateBool = private == 'true';
			const messageContents = { embeds: [embed], ephemeral: privateBool };
			return messageContents;
		},
		errorEmbed(content) {
			const embed = new EmbedBuilder()
				.setColor(0xFF0000)
				.setTitle('Error!')
				.setDescription("Error: " + content)
				.setFooter({ text: strings.embeds.footer });
			const messageContents = { embeds: [embed], ephemeral: true };
			return messageContents;
		},
		embed(content) {
			const embed = new EmbedBuilder()
				.setColor(0x8888FF)
				.setTitle('Information')
				.setDescription(content)
				.setFooter({ text: strings.embeds.footer });
			const messageContents = { embeds: [embed], ephemeral: true };
			return messageContents;
		}
	},
	rankings: {
		parse(interaction) {
			return new Promise ((resolve, reject) => {
				if (guildInfo[interaction.guildId] == undefined) {
					reject("The guild entry hasn't been created yet.");
					return;
				}
				if (guildInfo[interaction.guildId].rankMessageId != undefined) {
					interaction.guild.channels.fetch(guildInfo[interaction.guildId].rankChannelId).then(c => {
						c.messages.fetch(guildInfo[interaction.guildId].rankMessageId).then(rankMessage => {
							if ((rankMessage.embeds.length == 0) || (rankMessage.embeds[0].data.title != 'Tallest Trees' )) {
								reject("This doesn't appear to be a valid ``/top trees`` message.");
								return;
							}
							let lines = rankMessage.embeds[0].data.description.split('\n');
							let rankings = [];
							for (let i = 0; i < 10; i++) {
								let breakdown = lines[i].split(' - ');
								if (breakdown[0].includes('🥇')) {
									breakdown[0] = '``#1 ``'
								} else if (breakdown[0].includes('🥈')) {
									breakdown[0] = '``#2 ``'
								} else if (breakdown[0].includes('🥉')) {
									breakdown[0] = '``#3 ``'
								}
		
								let trimmedRank = breakdown[0].slice(breakdown[0].indexOf('#') + 1, breakdown[0].lastIndexOf('``'));
		
								let trimmedName = breakdown[1].slice(breakdown[1].indexOf('``') + 2);
								trimmedName = trimmedName.slice(0, trimmedName.indexOf('``'));
		
								let trimmedHeight = parseFloat(breakdown[2].slice(0, breakdown[2].indexOf('ft'))).toFixed(1);
								let isMyTree = false;
								let isMaybeMyTree = false;
								if (breakdown[2].includes('📍')) isMyTree = true;
								if (breakdown[1].includes(guildInfo[interaction.guildId].treeName)) maybeMyTree = true;
		
								rankings.push({
									rank: trimmedRank,
									name: trimmedName,
									height: trimmedHeight,
									myTree: isMyTree,
									maybeMyTree: isMaybeMyTree
								});
							}
		
							guildInfo[interaction.guildId].rankings = rankings;
							fs.writeFileSync('./data/guildInfo.json', JSON.stringify(guildInfo));
							guildInfo = require('../data/guildInfo.json');
							resolve(rankings);
						});
					});
				} else {
					reject("The rankMessageId is undefined somehow");
					return;
				}
			});
			
		},
		compare(interaction) {
			if (guildInfo[interaction.guildId] == undefined) {
				return `Please reset the reference messages! (${interaction.guildId})`;
			}
			let treeHeight = parseFloat(guildInfo[interaction.guildId].treeHeight).toFixed(1);
			if ((guildInfo[interaction.guildId].rankings.length > 0) && (treeHeight > 0)) {
				let replyString = 'Current Tree Height: ' + treeHeight + 'ft\n\n';
				guildInfo[interaction.guildId].rankings.forEach(treeRanking => {
					let difference = parseFloat(treeRanking.height).toFixed(1) - treeHeight;
					let decimal = (treeRanking.height % 1).toFixed(1);
					let growthIndicator = "";
					if (decimal > 0) {
						growthIndicator += "[+]";
					}
					const absDifference = parseFloat(Math.abs(difference)).toFixed(1);
					if (treeRanking.myTree) {
						replyString += "This is your tree. ";
					} else if (treeRanking.maybeMyTree) {
						replyString += "This might be your tree. Same height, same name. ";
					} else {
						if (difference > 0) {
							replyString += `#${treeRanking.rank} - ${absDifference}ft${growthIndicator} shorter `;
						} else if (difference < 0) {
							replyString += `#${treeRanking.rank} - ${absDifference}ft${growthIndicator} taller `;
						} else if (difference == 0) {
							replyString += `#${treeRanking.rank} - Same Height${growthIndicator} `;
						}
					}
					replyString += `[${functions.getWaterTime(treeRanking.height)} mins]\n`;
				});
				return 'Here\'s how your tree compares: \n' + replyString;
			} else {
				console.error('Not configured correctly\n' + 'Guild ID: ' + interaction.guildId + '\nGuild Info: ' + JSON.stringify(guildInfo[interaction.guildId]));
				return 'Not configured correctly';
			}
		}
	},
	tree: {
		parse(interaction) {
			let input;
			return new Promise((resolve, reject) => {
				if (guildInfo[interaction.guildId] == undefined) {
					reject(`The guild entry hasn't been created yet. [${interaction.guildId || interaction.commandGuildId}]`);
					return;
				}
				if (guildInfo[interaction.guildId].treeMessageId != "") {
					interaction.guild.channels.fetch(guildInfo[interaction.guildId].treeChannelId).then(c => {
						c.messages.fetch(guildInfo[interaction.guildId].treeMessageId).then(m => {
							if ( (m.embeds.length == 0) || !(m.embeds[0].data.description.includes('Your tree is')) ) {
								reject("This doesn't appear to be a valid ``/tree`` message.");
								return;
							}
							input = m.embeds[0].data.description;
							let treeName = m.embeds[0].data.title;
							let lines = input.split('\n');
							guildInfo[interaction.guildId].treeHeight = parseFloat(lines[0].slice(lines[0].indexOf('is') + 3, lines[0].indexOf('ft'))).toFixed(1);
							guildInfo[interaction.guildId].treeName = treeName;
							fs.writeFileSync('./data/guildInfo.json', JSON.stringify(guildInfo));
							guildInfo = require('../data/guildInfo.json');
							resolve("The reference tree message has been saved/updated.");
						});
					})
				} else {
					console.error('treeMessageId undefined');
					reject("There was an unknown error while setting the tree message.");
					return;
				}
			});
		}
	},
	refresh(interaction) {
		functions.rankings.parse(interaction).then(r1 => {
			functions.tree.parse(interaction).then(r2 => {
				const embed = functions.builders.comparisonEmbed(functions.rankings.compare(interaction), functions.builders.refreshAction())
				interaction.update(embed);
			}).catch(e => {
				interaction.reply(functions.builders.errorEmbed(e));
			});
		}).catch(e => {
			interaction.reply(functions.builders.errorEmbed(e));
		});
	},
	reset(guildId) {
		delete guildInfo[guildId];
		fs.writeFileSync('./data/guildInfo.json', JSON.stringify(guildInfo));
		guildInfo = require('../data/guildInfo.json');
		return;
	},
	getInfo(guildId) {
		const thisGuildInfo = guildInfo[guildId];
		if (thisGuildInfo != undefined) {
			let thisGuildInfoString = "";
			if (thisGuildInfo.treeMessageId != "") {
				thisGuildInfoString += `Tree Message ID: ${thisGuildInfo.treeMessageId}\n`;
			}
			if (thisGuildInfo.treeChannelId != "") {
				thisGuildInfoString += `Tree Channel ID: ${thisGuildInfo.treeChannelId}\n`;
			}
			if (thisGuildInfo.rankMessageId != "") {
				thisGuildInfoString += `Rank Message ID: ${thisGuildInfo.rankMessageId}\n`;
			}
			if (thisGuildInfo.rankChannelId != "") {
				thisGuildInfoString += `Rank Channel ID: ${thisGuildInfo.rankChannelId}\n`;
			}
			if (thisGuildInfo.treeHeight != "") {
				thisGuildInfoString += `Tree Height: ${thisGuildInfo.treeHeight}\n`;
			}
			return `Here if your servers setup info:\n${thisGuildInfoString}`;
		} else {
			return "Your guild hasn't been set up yet.";
		}
	},
	getWaterTime(size) {
		return Math.floor((Math.pow(size * 0.07 + 5, 1.1) / 60));
	}
};

module.exports = functions;