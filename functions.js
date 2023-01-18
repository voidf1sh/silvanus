/* eslint-disable comma-dangle */
// dotenv for handling environment variables
const dotenv = require('dotenv');
dotenv.config();
const isDev = process.env.isDev;
const ownerId = process.env.ownerId;

// filesystem
const fs = require('fs');

// Discord.js
const Discord = require('discord.js');

// Various imports from other files
const config = require('./config.json');
const strings = require('./strings.json');
const slashCommandFiles = fs.readdirSync('./slash-commands/').filter(file => file.endsWith('.js'));
const dotCommandFiles = fs.readdirSync('./dot-commands/').filter(file => file.endsWith('.js'));

const functions = {
	// Functions for managing and creating Collections
	collections: {
		// Create the collection of slash commands
		slashCommands(client) {
			if (!client.slashCommands) client.slashCommands = new Discord.Collection();
			client.slashCommands.clear();
			for (const file of slashCommandFiles) {
				const slashCommand = require(`./slash-commands/${file}`);
				if (slashCommand.data != undefined) {
					client.slashCommands.set(slashCommand.data.name, slashCommand);
				}
			}
			if (isDev) console.log('Slash Commands Collection Built');
		},
		setvalidCommands(client) {
			for (const entry of client.dotCommands.map(command => command)) {
				config.validCommands.push(entry.name);
				if (Array.isArray(entry.alias)) {
					entry.alias.forEach(element => {
						config.validCommands.push(element);
					});
				} else if (entry.alias != undefined) {
					config.validCommands.push(entry.alias);
				}
			}
			if (isDev) console.log(`Valid Commands Added to Config\n${config.validCommands}`);
		},
		dotCommands(client) {
			if (!client.dotCommands) client.dotCommands = new Discord.Collection();
			client.dotCommands.clear();
			for (const file of dotCommandFiles) {
				const dotCommand = require(`./dot-commands/${file}`);
				client.dotCommands.set(dotCommand.name, dotCommand);
				if (Array.isArray(dotCommand.alias)) {
					dotCommand.alias.forEach(element => {
						client.dotCommands.set(element, dotCommand);
					});
				} else if (dotCommand.alias != undefined) {
					client.dotCommands.set(dotCommand.alias, dotCommand);
				}
			}
			if (isDev) console.log('Dot Commands Collection Built');
		},
	},
	dot: {
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
				const validCommands = require('./config.json').validCommands;
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
	embeds: {
		help(interaction) {
			// Construct the Help Embed
			const helpEmbed = new Discord.MessageEmbed()
				.setColor('BLUE')
				.setAuthor('Help Page')
				.setDescription(strings.help.description)
				.setThumbnail(strings.urls.avatar);

			// Construct the Slash Commands help

			let slashCommandsFields = [];

			const slashCommandsMap = interaction.client.slashCommands.map(e => {
				return {
					name: e.data.name,
					description: e.data.description
				};
			})

			for (const e of slashCommandsMap) {
				slashCommandsFields.push({
					name: `- /${e.name}`,
					value: e.description,
					inline: false,
				});
			}

			// Construct the Dot Commands Help
			let dotCommandsFields = [];

			const dotCommandsMap = interaction.client.dotCommands.map(e => {
				return {
					name: e.name,
					description: e.description,
					usage: e.usage
				};
			});

			for (const e of dotCommandsMap) {
				dotCommandsFields.push({
					name: `- .${e.name}`,
					value: `${e.description}\nUsage: ${e.usage}`,
					inline: false,
				});
			}

			helpEmbed.addField('Slash Commands', strings.help.slash);
			helpEmbed.addFields(slashCommandsFields);
			helpEmbed.addField('Dot Commands', strings.help.dot);
			helpEmbed.addFields(dotCommandsFields);

			return { embeds: [
				helpEmbed
			], ephemeral: true };
		},
		text(commandData) {
			return { embeds: [new Discord.MessageEmbed()
				.setAuthor(commandData.command)
				.setDescription(commandData.content)
				.setTimestamp()
				.setFooter(commandData.author)]};
		},
	},
};

module.exports = functions;