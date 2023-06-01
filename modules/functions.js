/* eslint-disable comma-dangle */
// dotenv for handling environment variables
const dotenv = require('dotenv');
dotenv.config();
const isDev = process.env.DEBUG === "true";
const package = require('../package.json');

// filesystem
const fs = require('fs');

// Discord.js
const Discord = require('discord.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = Discord;
const { GuildInfo } = require('./CustomClasses');

// Various imports from other files
const config = require('../data/config.json');
const strings = require('../data/strings.json');
const slashCommandFiles = fs.readdirSync('./slash-commands/').filter(file => file.endsWith('.js'));
const dotCommandFiles = fs.readdirSync('./dot-commands/').filter(file => file.endsWith('.js'));
const dbfn = require('./dbfn.js');
const { finished } = require('stream');

const functions = {
	// Functions for managing and creating Collections
	collectionBuilders: {
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
		},
		dotCommands(client) {
			// If the dotCommands collection doesn't exist already, create it
			if (!client.dotCommands) client.dotCommands = new Discord.Collection();
			// Empty the dotcommands collection
			client.dotCommands.clear();
			// Iterate over each file within ./dot-commands that ends with .js
			for (const file of dotCommandFiles) {
				// Pull the file into a temporary variable
				const dotCommand = require(`../dot-commands/${file}`);
				// Create a new entry in the collection with the key of the command name, value of the command itself
				client.dotCommands.set(dotCommand.name, dotCommand);
				// Old code from NodBot to implement aliases for dot commands. Unused as of 5/16/23
				// if (Array.isArray(dotCommand.alias)) {
				// 	dotCommand.alias.forEach(element => {
				// 		client.dotCommands.set(element, dotCommand);
				// 	});
				// } else if (dotCommand.alias != undefined) {
				// 	client.dotCommands.set(dotCommand.alias, dotCommand);
				// }
			}
			if (isDev) console.log('Dot Commands Collection Built');
		},
		setvalidCommands(client) {
			// Iterate over every entry in the dotCommands collection
			for (const entry of client.dotCommands.map(command => command)) {
				// Add the command's name to the valid commands list for validation later
				config.validCommands.push(entry.name);
				// Old code from NodBot to implement aliases for dot commands. Unused as of 5/16/23
				// if (Array.isArray(entry.alias)) {
				// 	entry.alias.forEach(element => {
				// 		config.validCommands.push(element);
				// 	});
				// } else if (entry.alias != undefined) {
				// 	config.validCommands.push(entry.alias);
				// }
			}
			if (isDev) console.log(`Valid Commands Added to Config\n${config.validCommands}`);
		},
		async guildInfos(client) {
			const guildInfos = await dbfn.getAllGuildInfos();
			if (!client.guildInfos) client.guildInfos = new Discord.Collection();
			client.guildInfos.clear();
			for (const guildInfo of guildInfos) {
				client.guildInfos.set(guildInfo.guildId, guildInfo);
			}
			return 'guildInfos Collection Built';
		},
		async messageCollectors(client) {
			// Create an empty collection for MessageCollectors
			if (!client.messageCollectors) client.messageCollectors = new Discord.Collection();
			client.messageCollectors.clear();
			// Get all of the guild infos from the client
			const { guildInfos, messageCollectors } = client;
			// Iterate over each guild info
			await guildInfos.forEach(async guildInfo => {
				await functions.collectors.create(client, guildInfo);
			});
		}
	},
	builders: {
		actionRows: {
			reminderActionRow() {
				const deleteButton = new ButtonBuilder()
					.setCustomId('deleteping')
					.setEmoji('♻️')
					.setStyle(ButtonStyle.Danger);
				const actionRow = new ActionRowBuilder()
					.addComponents(deleteButton);
				return actionRow;
			},
			comparisonActionRow(guildInfo) {
				// console.log(guildInfo);
				// Create the button to go in the Action Row
				const refreshButton = new ButtonBuilder()
					.setCustomId('refresh')
					.setEmoji('🔄')
					.setStyle(ButtonStyle.Primary);
				// Create the Action Row with the Button in it, to be sent with the Embed
				let refreshActionRow = new ActionRowBuilder()
					.addComponents(
						refreshButton
					);
				return refreshActionRow;
			},
			treeRoleMenu(fruit) {
				let actionRow = new ActionRowBuilder().addComponents(this.buttons.waterPing());
				if (fruit) {
					actionRow.addComponents(this.buttons.fruitPing());
				}
				return actionRow;
			},
			buttons: {
				acceptRules() {
					return new ButtonBuilder()
						.setCustomId('acceptrules')
						.setLabel(`${strings.emoji.confirm} Accept Rules`)
						.setStyle(ButtonStyle.Primary);
				},
				waterPing() {
					return new ButtonBuilder()
						.setCustomId('waterpingrole')
						.setLabel(strings.emoji.water)
						.setStyle(ButtonStyle.Primary);
				},
				fruitPing() {
					return new ButtonBuilder()
						.setCustomId('fruitpingrole')
						.setLabel(strings.emoji.fruit)
						.setStyle(ButtonStyle.Primary);
				}
			}
		},
		embeds: {
			treeRoleMenu(guildInfo) {
				const actionRow = functions.builders.actionRows.treeRoleMenu(guildInfo.fruitRoleId == "" ? false : true);
				let tempStrings = strings.embeds.treeRoleMenu;
				let description = tempStrings[0] + tempStrings[1] + `<@&${guildInfo.waterRoleId}>` + tempStrings[2];
				if (guildInfo.fruitRoleId != "") {
					description += tempStrings[3] + `<@&${guildInfo.fruitRoleId}>` + tempStrings[4];
				}
				const embed = new EmbedBuilder()
					.setColor(strings.embeds.color)
					.setTitle(strings.embeds.roleMenuTitle)
					.setDescription(description)
					.setFooter({ text: strings.embeds.roleMenuFooter });
				return { embeds: [embed], components: [actionRow] };
			},
			information(content, fields) {
				const embed = new EmbedBuilder()
					.setColor(strings.embeds.color)
					.setTitle('Information')
					.setDescription(content)
					.setFooter({ text: `v${package.version} - ${strings.embeds.footer}` });
				if (fields) embed.addFields(fields);
				const messageContents = { embeds: [embed], ephemeral: true };
				return messageContents;
			}
		},
		comparisonEmbed(content, guildInfo) {
			// Create the embed using the content passed to this function
			const embed = new EmbedBuilder()
				.setColor(strings.embeds.color)
				.setTitle('Tallest Trees Comparison')
				.setDescription(content)
				.setFooter({ text: `v${package.version} - ${strings.embeds.footer}` });
			const messageContents = { embeds: [embed], components: [this.actionRows.comparisonActionRow(guildInfo)] };
			return messageContents;
		},
		waterReminderEmbed(content, guildInfo) {
			// Create the embed using the content passed to this function
			const embed = new EmbedBuilder()
				.setColor(strings.embeds.waterColor)
				.setTitle(strings.embeds.waterTitle)
				.setDescription(`[Click here to go to your Tree](https://discord.com/channels/${guildInfo.guildId}/${guildInfo.treeChannelId}/${guildInfo.treeMessageId})`)
				.setFooter({ text: `Click ♻️ to delete this message` });
			const messageContents = { content: content, embeds: [embed], components: [this.actionRows.reminderActionRow()] };
			return messageContents;
		},
		fruitReminderEmbed(content, guildInfo) {
			// Create the embed using the content passed to this function
			const embed = new EmbedBuilder()
				.setColor(strings.embeds.fruitColor)
				.setTitle(strings.embeds.fruitTitle)
				.setDescription(`[Click here to go to your Tree](https://discord.com/channels/${guildInfo.guildId}/${guildInfo.treeChannelId}/${guildInfo.treeMessageId})`)
				.setFooter({ text: `Click ♻️ to delete this message` });
			const messageContents = { content: content, embeds: [embed], components: [this.actionRows.reminderActionRow()] };
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
				.setTitle(strings.embeds.errorTitle)
				.setDescription(`${strings.embeds.errorPrefix}\n${content}`)
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
	dotCommands: {
		getCommandData(message) {
			const commandData = {};
			// Split the message content at the final instance of a period
			const finalPeriod = message.content.lastIndexOf('.');
			if(isDev) console.log(message.content);
			// If the final period is the last character, or doesn't exist
			if (finalPeriod < 0) {
				if (isDev) console.log(finalPeriod);
				commandData.isCommand = false;
				return commandData;
			}
			commandData.isCommand = true;
			// Get the first part of the message, everything leading up to the final period
			commandData.args = message.content.slice(0,finalPeriod).toLowerCase();
			// Get the last part of the message, everything after the final period
			commandData.command = message.content.slice(finalPeriod).replace('.','').toLowerCase();
			commandData.author = `${message.author.username}#${message.author.discriminator}`;
			return this.checkCommand(commandData);
		},
		checkCommand(commandData) {
			if (commandData.isCommand) {
				const validCommands = require('../data/config.json').validCommands;
				commandData.isValid = validCommands.includes(commandData.command);
				// Add exceptions for messages that contain only a link
				if (commandData.args.startsWith('http')) commandData.isValid = false;
			}
			else {
				commandData.isValid = false;
				console.error('Somehow a non-command made it to checkCommands()');
			}
			return commandData;
		}
	},
	rankings: {
		parse(interaction, guildInfo) {
			return new Promise((resolve, reject) => {
				if (guildInfo.guildId == "") {
					reject(strings.error.noGuild);
					return;
				}
				if (guildInfo.leaderboardMessageId != undefined) {
					interaction.guild.channels.fetch(guildInfo.leaderboardChannelId).then(c => {
						c.messages.fetch(guildInfo.leaderboardMessageId).then(leaderboardMessage => {
							if ((leaderboardMessage.embeds.length == 0) || (leaderboardMessage.embeds[0].data.title != 'Tallest Trees')) {
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
								resolve(res.status);
							}).catch(err => {
								console.error(err);
								reject(err);
								return;
							});
						}).catch(err => {
							reject(strings.status.missingLeaderboardMessage);
							// console.error(err);
							return;
						});
					}).catch(err => {
						reject(strings.status.missingLeaderboardChannel);
						console.error(err);
						return;
					});
				} else {
					reject("The leaderboardMessageId is undefined somehow");
					return;
				}
			});

		},
		async compare(guildInfo) {
			try {
				const getLeaderboardResponse = await dbfn.getLeaderboard(guildInfo.guildId);
				const leaderboard = getLeaderboardResponse.data; // [ { treeName: "Name", treeHeight: 1234.5, treeRank: 67 }, {...}, {...} ]

				// Prepare the beginning of the comparison message
				let comparisonReplyString = `Here\'s how your tree compares: \nCurrent Tree Height: ${guildInfo.treeHeight}ft\n\n`;
				// Iterate over the leaderboard entries, backwards
				for (let i = leaderboard.length - 1; i >= 0; i--) {
					const leaderboardEntry = leaderboard[i];
					// Setup the status indicator, default to blank, we'll change it later
					let statusIndicator = "";
					if ((leaderboardEntry.treeHeight % 1).toFixed(1) > 0) statusIndicator += "``[💧]``";

					// Get the data for this tree from 24 hours ago
					// const get24hTreeResponse = await dbfn.get24hTree(interaction.guildId, leaderboardEntry.treeName);
					// const dayAgoTree = get24hTreeResponse.data;
					// const hist24hDifference = (leaderboardEntry.treeHeight - dayAgoTree.treeHeight).toFixed(1);
					// statusIndicator += `+${hist24hDifference}ft|`

					// Get the 24h watering time for this tree
					// const totalWaterTime = await functions.timeToHeight(dayAgoTree.treeHeight, leaderboardEntry.treeHeight);
					// statusIndicator += `${totalWaterTime}]\`\``;

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
					comparisonReplyString += `${statusIndicator}\n`;
					// if (process.env.isDev == 'true') comparisonReplyString += `Current Height: ${leaderboardEntry.treeHeight} 24h Ago Height: ${dayAgoTree.treeHeight}\n`;
				}
				return comparisonReplyString;
			} catch (err) {
				throw err;
			}
		}
	},
	tree: {
		parse(interaction, guildInfo) {
			return new Promise((resolve, reject) => {
				if (guildInfo == undefined) {
					reject(`The guild entry hasn't been created yet. [${interaction.guildId || interaction.commandGuildId}]`);
					return;
				}
				if (guildInfo.treeMessageId != "Run /setup where your tree is.") {
					interaction.guild.channels.fetch(guildInfo.treeChannelId).then(c => {
						c.messages.fetch(guildInfo.treeMessageId).then(m => {
							if ((m.embeds.length == 0) || !(m.embeds[0].data.description.includes('Your tree is'))) {
								reject("This doesn't appear to be a valid ``/tree`` message.");
								return;
							}
							let input;
							input = m.embeds[0].data.description;
							let treeName = m.embeds[0].data.title;
							let lines = input.split('\n');
							guildInfo.treeHeight = parseFloat(lines[0].slice(lines[0].indexOf('is') + 3, lines[0].indexOf('ft'))).toFixed(1);
							guildInfo.treeName = treeName;
							dbfn.setTreeInfo(guildInfo).then(res => {
								resolve("The reference tree message has been saved/updated.");
							});
						}).catch(err => {
							reject(strings.status.missingTreeMessage);
							// console.error(err);
							return;
						});
					}).catch(err => {
						reject(strings.status.missingTreeChannel);
						console.error(err);
						return;
					});
				} else {
					console.error('treeMessageId undefined');
					reject("There was an unknown error while setting the tree message.");
					return;
				}
			});
		}
	},
	messages: {
		async find(interaction, guildInfo) {
			try {
				let response = { status: "Incomplete", data: undefined, code: 0 };
				// If the tree channel ID and leaderboard channel ID are both set
				if (guildInfo.treeChannelId != "" || guildInfo.leaderboardChannelId != "") {
					// If one us unset, we'll set it to the current channel just to check
					if (guildInfo.treeChannelId == "") {
						guildInfo.treeChannelId = `${guildInfo.leaderboardChannelId}`;
					} else if (guildInfo.leaderboardChannelId == "") {
						guildInfo.leaderboardChannelId = `${guildInfo.treeChannelId}`;
					}
					let treeFound, leaderboardFound = false;
					// If these values have already been set in the database, we don't want to report that they weren't found
					// they'll still get updated later if applicable.
					treeFound = (guildInfo.treeMessageId != "");
					leaderboardFound = (guildInfo.leaderboardMessageId != "");
					// If the Tree and Leaderboard messages are in the same channel
					if (guildInfo.treeChannelId == guildInfo.leaderboardChannelId) {
						// Fetch the tree channel so we can get the most recent messages
						const treeChannel = await interaction.guild.channels.fetch(guildInfo.treeChannelId);
						// Fetch the last 20 messages in the channel
						const treeChannelMessageCollection = await treeChannel.messages.fetch({ limit: 20 });
						// Create a basic array of [Message, Message, ...] from the Collection
						const treeChannelMessages = Array.from(treeChannelMessageCollection.values());
						// Iterate over the Messages in reverse order (newest messages first)
						for (let i = treeChannelMessages.length - 1; i >= 0; i--) {
							let treeChannelMessage = treeChannelMessages[i];

							if (this.isTree(treeChannelMessage)) { // This is a tree message
								// Set the tree message ID
								guildInfo.treeMessageId = treeChannelMessage.id;
								// Parse out the tree name
								input = treeChannelMessage.embeds[0].data.description;
								let treeName = treeChannelMessage.embeds[0].data.title;
								// And tree height
								let lines = input.split('\n');
								guildInfo.treeHeight = parseFloat(lines[0].slice(lines[0].indexOf('is') + 3, lines[0].indexOf('ft'))).toFixed(1);
								guildInfo.treeName = treeName;
								// Upload the found messages to the database
								await dbfn.setTreeInfo(guildInfo);
								// Let the end of the function know we found a tree message and successfully uploaded it
								treeFound = true;
							} else if (this.isLeaderboard(treeChannelMessage)) { // This is a leaderboard message
								// Set the leaderboard message ID
								guildInfo.leaderboardMessageId = treeChannelMessage.id;
								// Upload it to the database
								await dbfn.setLeaderboardInfo(guildInfo);
								// Let the end of the function know we found a leaderboard message and successfully uploaded it
								leaderboardFound = true;
							}
						}
					} else { // If the tree and leaderboard are in different channels
						// Fetch the tree channel so we can get the most recent messages
						const treeChannel = await interaction.guild.channels.fetch(guildInfo.treeChannelId);
						// Fetch the last 20 messages in the tree channel
						const treeChannelMessageCollection = await treeChannel.messages.fetch({ limit: 20 });
						// Create an Array like [Message, Message, ...] from the Collection
						const treeChannelMessages = Array.from(treeChannelMessageCollection.values());
						// Iterate over the Array of Messages in reverse order (newest messages first)
						for (let i = treeChannelMessages.length - 1; i >= 0; i--) {
							let treeChannelMessage = treeChannelMessages[i];

							if (this.isTree(treeChannelMessage)) { // This is a tree message
								// Set the tree message ID
								guildInfo.treeMessageId = treeChannelMessage.id;
								// Parse out the tree name
								input = treeChannelMessage.embeds[0].data.description;
								let treeName = treeChannelMessage.embeds[0].data.title;
								// And tree height
								let lines = input.split('\n');
								guildInfo.treeHeight = parseFloat(lines[0].slice(lines[0].indexOf('is') + 3, lines[0].indexOf('ft'))).toFixed(1);
								guildInfo.treeName = treeName;
								// Upload the found messages to the database
								await dbfn.setTreeInfo(guildInfo);
								// Let the end of the function know we found a tree message and successfully uploaded it
								treeFound = true;
							}
						}

						// Fetch the tree channel so we can get the most recent messages
						const leaderboardChannel = await interaction.guild.channels.fetch(guildInfo.leaderboardChannelId);
						// Fetch the last 20 messages in the leaderboard channel
						const leaderboardChannelMessageCollection = await leaderboardChannel.messages.fetch({ limit: 20 });
						// Create an Array like [Message, Message, ...] from the Collection
						const leaderboardChannelMessages = Array.from(leaderboardChannelMessageCollection.values());
						// Iterate over the Array of Messages in reverse order (newest messages first)
						for (let i = leaderboardChannelMessages.length - 1; i >= 0; i--) {
							let leaderboardChannelMessage = leaderboardChannelMessages[i];

							if (this.isLeaderboard(leaderboardChannelMessage)) { // This is a leaderboard message
								// Set the leaderboard message ID
								guildInfo.leaderboardMessageId = leaderboardChannelMessage.id;
								// Upload it to the database
								await dbfn.setLeaderboardInfo(guildInfo);
								// Let the end of the function know we've found a leaderboard
								leaderboardFound = true;
							}
						}
					}

					// await dbfn.setGuildInfo(guildInfo);
					// Bundle guildInfo into the response
					// const getGuildInfoResponse = await dbfn.getGuildInfo(guildInfo.guildId);
					await functions.collectionBuilders.guildInfos(interaction.client);
					response.data = interaction.client.guildInfos.get(guildInfo.guildId);

					// Set the response status, this is only used as a response to /setup
					if (treeFound && leaderboardFound) { // we found both the tree and leaderboard
						response.status = strings.status.treeAndLeaderboard;
						response.code = 1;
					} else if (treeFound || leaderboardFound) { // Only found the tree
						response.status = strings.status.missingMessage;
						response.code = 2;
					} else { // Didn't find any
						response.status = strings.status.noneFound;
						response.code = 3;
					}
					return response;
				} else { // This should only ever occur if some weird database stuff happens
					response.status = "It looks like this channel doesn't contain both your ``/tree`` and ``/top trees`` messages, please run ``/setup``";
					return response;
				}

			} catch (err) {
				throw "Problem checking messages: " + err;
			}
		},
		isTree(message) {
			if (message.embeds.length > 0) {
				// Grab the description and title
				const { description, title } = message.embeds[0].data;
				// Make sure it's a tree message
				if (description.includes("Your tree is")) {
					// Grab the name
					const treeName = title;
					// Grab the tree's height
					const indices = [description.indexOf("Your tree is ") + 13, description.indexOf("ft")];
					const treeHeightStr = description.slice(indices[0], indices[1]);
					const treeHeightFloat = parseFloat(treeHeightStr).toFixed(1);

					// Return the info gathered
					return {
						treeName: treeName,
						treeHeight: treeHeightFloat
					};
				} else {
					return false;
				}
			} else {
				return false;
			}
		},
		// Checks if a message is a leaderboard message, and returns the entries if it is
		isLeaderboard(message) {
			if (message.embeds.length > 0) {
				// Grab the description and title from the embed
				const { title, description } = message.embeds[0].data;
				// Check that it's a Top Trees message
				if (title == "Tallest Trees") {
					// Break the description into an array of each line
					const lines = description.split("\n");
					const leaderboard = {
						guildId: message.guildId,
						entries: []
					};

					lines.forEach(line => {
						// Skeleton entry:
						const entry = {
							treeRank: 0,
							treeName: "",
							treeHeight: 0,
							hasPin: 0
						}
						// Break the line into parts separated by a hyphen -
						// DO NOT USE this, it breaks when any tree name contains " - " which
						// isn't uncommon apparently
						// const parts = line.split(" - ");

						// Instead, find the indices of the first and last instances of " - "
						const hyphenIndices = [line.indexOf(" - "), line.lastIndexOf(" - ")];
						const parts = [
							line.slice(0, hyphenIndices[0]),
							line.slice(hyphenIndices[0] + 3, hyphenIndices[1]),
							line.slice(hyphenIndices[1] + 3, line.length)
						];

						// 
						// Grab the rank

						// Preset the indices to split the lines to get the data
						const rankIndices = [parts[0].indexOf("#") + 1, parts[0].lastIndexOf("``")];
						const nameIndices = [parts[1].indexOf("``") + 2, parts[1].lastIndexOf("``")];
						const heightIndices = [0, parts[2].lastIndexOf("ft")];

						// Set the data from the parts using the indices
						entry.treeRank = parts[0].slice(...rankIndices);
						entry.treeName = parts[1].slice(...nameIndices);
						entry.treeHeight = parts[2].slice(...heightIndices);

						// Go back and check for the first 3 as they use emojis instead of numbers, this will overwrite above
						if (line.includes("🥇")) entry.treeRank = 1;
						if (line.includes("🥈")) entry.treeRank = 2;
						if (line.includes("🥉")) entry.treeRank = 3;

						// Check for the pin showing ownership
						if (line.includes("📍")) entry.hasPin = 1;

						// Add the entry to the array
						leaderboard.entries.push(entry);
					});
					return leaderboard;
				} else {
					return false;
				}
			} else {
				return false;
			}
		},
		async updateHandler(message) {
			if (message.partial) {
				message = await message.fetch().catch(e => {
					throw e;
				});
			}
			// Make sure the message is from Grow A Tree
			if (message.author.id != strings.ids.growATree) return;
			// Check and store the message types
			const isLeaderboard = this.isLeaderboard(message);
			const isTree = this.isTree(message);
			// Check if the message is a leaderboard
			if (isLeaderboard) {
				if (isDev) console.log(`LU: ${message.guild.name}`);
				let guildInfo;
				let doDbUpdate = false;
				if (message.client.guildInfos.has(message.guildId)) {
					guildInfo = message.client.guildInfos.get(message.guildId);
					if ((guildInfo.leaderboardChannelId != message.channel.id) || (guildInfo.leaderboardMessageId != message.id)) {
						guildInfo.setLeaderboardMessage(message.id, message.channel.id);
						doDbUpdate = true;
					}
				} else {
					guildInfo = new GuildInfo().setId(message.guildId)
						.setLeaderboardMessage(message.id, message.channel.id);
					doDbUpdate = true;
				}
				if (doDbUpdate) {
					const query = guildInfo.queryBuilder("setLeaderboardMessage");
					await dbfn.setGuildInfo(query);
				}
				await dbfn.uploadLeaderboard(isLeaderboard);
				// Update the comparison message
				// Check for valid message IDs
				if (guildInfo.treeMessageId === "") throw strings.error.noTreeMessage;
				if (guildInfo.leaderboardMessageId === "") throw strings.error.noLeaderboardMessage;
				if (guildInfo.compareMessageId === "") throw strings.error.noCompareMessage;

				// Fetch the messages
				const { guild } = message;
				// Tree
				const treeChannel = await guild.channels.fetch(guildInfo.treeChannelId);
				const treeMessage = await treeChannel.messages.fetch(guildInfo.treeMessageId);
				// Leaderboard
				const leaderboardChannel = await guild.channels.fetch(guildInfo.leaderboardChannelId);
				const leaderboardMessage = await leaderboardChannel.messages.fetch(guildInfo.leaderboardMessageId);
				// Comparison
				const compareChannel = await guild.channels.fetch(guildInfo.compareChannelId);
				const compareMessage = await compareChannel.messages.fetch(guildInfo.compareMessageId);

				// Update the tree information
				// Make sure we have a tree message and parse it
				const isTree = this.isTree(treeMessage);
				if (!isTree) throw "Tree message isn't actually a tree message!";
				guildInfo.setTreeInfo(isTree.treeName, isTree.treeHeight);

				// Grab the leaderboard
				// Make sure it's a leaderboard and parse it
				// const isLeaderboard = this.messages.isLeaderboard(leaderboardMessage);
				// if (!isLeaderboard) throw "Leaderboard message isn't actually a leaderboard message!";
				// Upload the leaderboard
				// await dbfn.uploadLeaderboard(isLeaderboard);
				// Build the string that shows the comparison // TODO Move the string building section to fn.builders?
				const comparedRankings = await functions.rankings.compare(guildInfo);
				const embed = functions.builders.comparisonEmbed(comparedRankings, guildInfo);
				await compareMessage.edit(embed).catch(e => console.error(e));
			} else if (isTree) {
				// Check if the message is a tree
				if (isDev) console.log(`TU: ${isTree.treeName}: ${isTree.treeHeight}ft`);
				let guildInfo;
				let doDbUpdate = false;
				if (message.client.guildInfos.has(message.guildId)) {
					guildInfo = message.client.guildInfos.get(message.guildId);
					if ((guildInfo.treeName != isTree.treeName) || (guildInfo.treeHeight != isTree.treeHeight)) {
						guildInfo.setTreeInfo(isTree.treeName, isTree.treeHeight, message.channel.id, message.id);
						doDbUpdate = true;
					}
				} else {
					guildInfo = new GuildInfo().setId(message.guildId)
						.setTreeInfo(isTree.treeName, isTree.treeHeight, message.channel.id, message.id);
					doDbUpdate = true;
				}
				if (doDbUpdate) {
					const query = guildInfo.queryBuilder("setTreeInfo");
					await dbfn.setGuildInfo(query);
				}
			}
		}
	},
	buttonHandlers: {
		async fruitPing(interaction) {
			if (interaction.client.guildInfos.has(interaction.guildId)) {
				let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
				const role = await functions.roles.fetchRole(interaction.guild, guildInfo.fruitRoleId);
				let status = "No Changes Made";
				if (interaction.member.roles.cache.some(role => role.id == guildInfo.fruitRoleId)) {
					await functions.roles.takeRole(interaction.member, role);
					status = "Removed the fruit role.";
				} else {
					await functions.roles.giveRole(interaction.member, role).catch(e => {
						const errorId = functions.generateErrorId();
						console.error(errorId + " " + e);
						status = `Error adding the fruit role: ${errorId}`;
					});
					status = "Added the fruit role.";
				}
				return functions.builders.embed(status);
			} else {
				throw "Guild doesn't exist in database!";
			}
		},
		async waterPing(interaction) {
			if (interaction.client.guildInfos.has(interaction.guildId)) {
				let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
				let status = "No Changes Made";
				const role = await functions.roles.fetchRole(interaction.guild, guildInfo.waterRoleId);
				if (interaction.member.roles.cache.some(role => role.id == guildInfo.waterRoleId)) {
					await functions.roles.takeRole(interaction.member, role);
					status = "Removed the water role.";
				} else {
					await functions.roles.giveRole(interaction.member, role);
					status = "Added the water role.";
				}
				return functions.builders.embed(status);
			} else {
				throw "Guild doesn't exist in database!";
			}
		}
	},
	roles: {
		async fetchRole(guild, roleId) {
			return await guild.roles.fetch(roleId).catch(err => console.error("Error fetching the role: " + err + "\n" + roleId));
		},
		async giveRole(member, role) {
			await member.roles.add(role).catch(err => console.error(`Error giving role: ${err}\nRole Info: ${role.name} (${role.guild}: ${member.guild.name})`));
		},
		async takeRole(member, role) {
			await member.roles.remove(role).catch(err => console.error(`Error removing role: ${err}\nRole Info: ${role.name} (${role.guild}: ${member.guild.name})`));
		}
	},
	collectors: {
		async create(client, guildInfo) {
			// If a collector is already setup
			if (client.messageCollectors.has(guildInfo.guildId)) {
				// Close the collector
				await this.end(client, guildInfo);
			}
			// Make sure guildInfo is what we expect, the watch channel isnt blank, and notifications are enabled
			if (guildInfo instanceof GuildInfo && guildInfo.watchChannelId != "" && guildInfo.notificationsEnabled) {
				// Fetch the Guild
				const guild = await client.guilds.fetch(guildInfo.guildId).catch(e => {throw "Attempted to fetch guild I'm no longer in."});
				// Fetch the Channel
				const channel = await guild.channels.fetch(guildInfo.watchChannelId);
				// Create the filter function
				const filter = message => {
					// Discard any messages sent by Silvanus
					return message.author.id != process.env.BOTID;
				}
				// Create the collector
				const collector = channel.createMessageCollector({ filter });
				// Add the collector to the messageCollectors Collection
				client.messageCollectors.set(guildInfo.guildId, collector);
				collector.on('collect', message => {
					// Check for manual relay use with "water ping" and "fruit ping"
					if (message.content.toLowerCase().includes("water ping")) {
						functions.sendWaterReminder(guildInfo, guildInfo.waterMessage, guildInfo.reminderChannelId, guild);
						return;
					} else if (message.content.toLowerCase().includes("fruit ping")) {
						functions.sendFruitReminder(guildInfo, guildInfo.fruitMessage, guildInfo.reminderChannelId, guild);
						return;
					}
					// If the message doesn't contain an embed, we can ignore it
					if (message.embeds == undefined) return;
					if (message.embeds.length == 0) return;
					// Check the description field of the embed to determine if it matches Grow A Tree's notification texts
					if (message.embeds[0].data.description.includes(strings.notifications.water)) {
						functions.sendWaterReminder(guildInfo, guildInfo.waterMessage, guildInfo.reminderChannelId, guild);
					} else if (message.embeds[0].data.description.includes(strings.notifications.fruit)) {
						functions.sendFruitReminder(guildInfo, guildInfo.fruitMessage, guildInfo.reminderChannelId, guild);
					}
				});
			}
		},
		async end(client, guildInfo) {
			if (!client.messageCollectors) throw "No Message Collectors";
			if (!client.messageCollectors.has(guildInfo.guildId)) throw "Guild doesn't have a Message Collector";
			const collector = client.messageCollectors.get(guildInfo.guildId);
			// Close the collector
			await collector.stop();
			// Remove the collector from the messageCollectors Collection
			client.messageCollectors.delete(guildInfo.guildId);
		}
	},
	async refresh(interaction) {

		if (interaction.client.guildInfos.has(interaction.guildId)) {
			let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
			// Check for valid message IDs
			if (guildInfo.treeMessageId === "") throw strings.error.noTreeMessage;
			if (guildInfo.leaderboardMessageId === "") throw strings.error.noLeaderboardMessage;

			// Fetch the messages
			const { guild } = interaction;
			// Tree
			const treeChannel = await guild.channels.fetch(guildInfo.treeChannelId);
			const treeMessage = await treeChannel.messages.fetch(guildInfo.treeMessageId);
			// Leaderboard
			const leaderboardChannel = await guild.channels.fetch(guildInfo.leaderboardChannelId);
			const leaderboardMessage = await leaderboardChannel.messages.fetch(guildInfo.leaderboardMessageId);

			// Update the comparison message information
			guildInfo.setCompareMessage(interaction.channel.id, interaction.message.id);
			const query = guildInfo.queryBuilder("setCompareMessage");
			await dbfn.setGuildInfo(query);

			// Update the tree information
			// Make sure we have a tree message and parse it
			const isTree = this.messages.isTree(treeMessage);
			if (!isTree) throw "Tree message isn't actually a tree message!";
			guildInfo.setTreeInfo(isTree.treeName, isTree.treeHeight);

			// Grab the leaderboard
			// Make sure it's a leaderboard and parse it
			const isLeaderboard = this.messages.isLeaderboard(leaderboardMessage);
			if (!isLeaderboard) throw "Leaderboard message isn't actually a leaderboard message!";
			// Upload the leaderboard
			await dbfn.uploadLeaderboard(isLeaderboard);
			// Build the string that shows the comparison // TODO Move the string building section to fn.builders?
			const comparedRankings = await this.rankings.compare(guildInfo);
			const embed = this.builders.comparisonEmbed(comparedRankings, guildInfo);
			await interaction.update(embed).catch(e => console.error(e));
		} else {
			throw "Guild doesn't exist in database!";
		}
	},
	reset(interaction) {
		return new Promise((resolve, reject) => {
			dbfn.deleteGuildInfo(interaction.guildId).then(res => {
				functions.collectionBuilders.guildInfos(interaction.client);
				resolve(res);
			}).catch(err => {
				console.error(err);
				reject(err);
				return;
			});
		});
	},
	getWaterTime(size) {
		return Math.floor(Math.pow(size * 0.07 + 5, 1.1)); // Seconds
	},
	parseWaterTime(seconds) {
		// 60 secs in min
		// 3600 secs in hr
		// 86400 sec in day

		let waterParts = {
			value: seconds,
			units: "secs"
		};

		if (60 < seconds && seconds <= 3600) { // Minutes
			waterParts.value = parseFloat(seconds / 60).toFixed(1);
			waterParts.units = "mins";
		} else if (3600 < seconds && seconds <= 86400) {
			waterParts.value = parseFloat(seconds / 3600).toFixed(1);
			waterParts.units = "hrs";
		} else if (86400 < seconds) {
			waterParts.value = parseFloat(seconds / 86400).toFixed(1);
			waterParts.units = "days";
		}
		return `${waterParts.value} ${waterParts.units}`;
	},
	timeToHeight(beginHeight, destHeight, efficiency, quality) {
		return new Promise((resolve, reject) => {
			let time = 0;
			let oldTime = 0;
			let compostAppliedCount = 0;
			let totalWaterCount = 0;
			if ((efficiency) && (quality)) {
				for (let i = beginHeight; i < destHeight; i++) {
					const randNum = Math.floor(Math.random() * 100);
					const compostApplied = randNum <= efficiency;
					if (compostApplied) {
						let qualityPercent = quality / 100;
						let waterTime = functions.getWaterTime(i);
						let reductionTime = waterTime * qualityPercent;
						let finalTime = waterTime - reductionTime;
						compostAppliedCount++;
						totalWaterCount++;
						time += parseFloat(finalTime);
						oldTime += waterTime;
					} else {
						totalWaterCount++;
						let waterTime = parseFloat(functions.getWaterTime(i));
						time += waterTime;
						oldTime += waterTime;
					}
				}
			} else {
				for (let i = beginHeight; i < destHeight; i++) {
					const waterTime = parseFloat(functions.getWaterTime(i));
					// console.log("Height: " + i + "Time: " + waterTime);
					time += waterTime;
				}
			}
			const readableWaterTime = this.parseWaterTime(time);
			const savedTime = this.parseWaterTime(oldTime - time);
			resolve({
				time: readableWaterTime,
				totalWaterCount: totalWaterCount ? totalWaterCount : undefined,
				compostAppliedCount: compostAppliedCount ? compostAppliedCount : undefined,
				average: totalWaterCount ? parseFloat((compostAppliedCount / totalWaterCount) * 100).toFixed(1) : undefined,
				savedTime: savedTime
			});
		});
	},
	sleep(ms) {
		// console.log(`Begin Sleep: ${new Date(Date.now()).getSeconds()}`);
		return new Promise(resolve => {
			setTimeout(function () {
				resolve();
				// console.log(`End Sleep: ${new Date(Date.now()).getSeconds()}`);
			}, ms);
		});
	},
	async sendWaterReminder(guildInfo, message, channelId, guild) {
		const reminderChannel = await guild.channels.fetch(channelId);
		const reminderEmbed = functions.builders.waterReminderEmbed(message, guildInfo);
		if (isDev) console.log(`WR: ${guild.name}: ${guildInfo.treeName}`);
		await reminderChannel.send(reminderEmbed).then(async m => {
			if (!m.deletable) return;
			await this.sleep(500).then(async () => {
				await m.delete().catch(e => console.error(e));
			});
		}).catch(err => {
			console.error(err);
		});
	},
	async sendFruitReminder(guildInfo, message, channelId, guild) {
		const reminderChannel = await guild.channels.fetch(channelId);
		const reminderEmbed = functions.builders.fruitReminderEmbed(message, guildInfo);
		if (isDev) console.log(`FR: ${guild.name}: ${guildInfo.treeName}`);
		await reminderChannel.send(reminderEmbed).then(async m => {
			if (!m.deletable) return;
			await this.sleep(500).then(async () => {
				await m.delete().catch(e => console.error(e));
			});
		}).catch(err => {
			console.error(err);
		});
	},
	async setupCollectors(client) {
		let guildInfos = client.guildInfos;
		let collectorsArray = [];
		await guildInfos.forEach(async guildInfo => {
			if (guildInfo instanceof GuildInfo && guildInfo.watchChannelId != "" && guildInfo.notificationsEnabled) {
				const guild = await client.guilds.fetch(guildInfo.guildId);
				// console.log(guildInfo instanceof GuildInfo);
				const channel = await guild.channels.fetch(guildInfo.watchChannelId);
				const filter = message => {
					return message.author.id != process.env.BOTID;
				}
				const collector = channel.createMessageCollector({ filter });
				collector.on('collect', message => {
					if (message.content.toLowerCase().includes("water ping")) {
						this.sendWaterReminder(guildInfo, guildInfo.waterMessage, guildInfo.reminderChannelId, guild);
						return;
					} else if (message.content.toLowerCase().includes("fruit ping")) {
						this.sendFruitReminder(guildInfo, guildInfo.fruitMessage, guildInfo.reminderChannelId, guild);
						return;
					}
					if (message.embeds == undefined) return;
					if (message.embeds.length == 0) return;
					guildInfo = client.guildInfos.get(guild.id);
					if (message.embeds[0].data.description.includes(strings.notifications.water)) {
						this.sendWaterReminder(guildInfo, guildInfo.waterMessage, guildInfo.reminderChannelId, guild);
					} else if (message.embeds[0].data.description.includes(strings.notifications.fruit)) {
						this.sendFruitReminder(guildInfo, guildInfo.fruitMessage, guildInfo.reminderChannelId, guild);
					}
				});
			}
		});
		guildInfos.set("collectors", collectorsArray);
	},
	async setupCollector(channel, interaction) {
		if (interaction.client.guildInfos.has(interaction.guildId)) {
			let collectors = interaction.client.guildInfos.get('collectors');
			let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
			const filter = message => {
				return message.author.id != process.env.BOTID;
			}
			const collector = channel.createMessageCollector({ filter });
			collectors.push(collector);
			collector.on('collect', message => {
				if (message.content.toLowerCase().includes("water ping")) {
					this.sendWaterReminder(guildInfo, guildInfo.waterMessage, guildInfo.reminderChannelId, guild);
					return;
				} else if (message.content.toLowerCase().includes("fruit ping")) {
					this.sendFruitReminder(guildInfo, guildInfo.fruitMessage, guildInfo.reminderChannelId, guild);
					return;
				}
				if (message.embeds == undefined) return;
				if (message.embeds.length == 0) return;
				if (message.embeds[0].data.description.includes(strings.notifications.water)) {
					this.sendWaterReminder(guildInfo, guildInfo.waterMessage, guildInfo.reminderChannelId, guild);
				} else if (message.embeds[0].data.description.includes(strings.notifications.fruit)) {
					this.sendFruitReminder(guildInfo, guildInfo.fruitMessage, guildInfo.reminderChannelId, guild);
				}
			});
		} else {
			throw "Guild doesn't exist in database!";
		}
	},
	generateErrorId() {
		const digitCount = 10;
		const digits = [];
		for (let i = 0; i < digitCount; i++) {
			const randBase = Math.random();
			const randNumRaw = randBase * 10;
			const randNumRound = Math.floor(randNumRaw);
			digits.push(randNumRound);
		}
		const errorId = digits.join("");
		return errorId;
	}
};

module.exports = functions;