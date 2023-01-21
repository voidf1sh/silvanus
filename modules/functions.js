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
				.setDescription(content)
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
	}
};

module.exports = functions;