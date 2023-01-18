/* eslint-disable no-case-declarations */
/* eslint-disable indent */
// dotenv for handling environment variables
const dotenv = require('dotenv');
dotenv.config();
const token = process.env.TOKEN;
const statusChannelId = process.env.statusChannelId;

// Discord.JS
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent
	],
	partials: [
		Partials.Channel,
		Partials.Message
	],
});

// Various imports
const fn = require('./functions.js');
const strings = require('./strings.json');
const isDev = process.env.isDev;

client.once('ready', () => {
	fn.collections.slashCommands(client);
	fn.collections.dotCommands(client);
	fn.collections.setvalidCommands(client);
	console.log('Ready!');
	client.channels.fetch(statusChannelId).then(channel => {
		channel.send(`${new Date().toISOString()} -- <@${process.env.ownerId}>\nStartup Sequence Complete`);
	});
});

// slash-commands
client.on('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
		if (isDev) {
			console.log(interaction);
		}
		const { commandName } = interaction;

		if (client.slashCommands.has(commandName)) {
			client.slashCommands.get(commandName).execute(interaction);
		} else {
			interaction.reply('Sorry, I don\'t have access to that command.');
			console.error('Slash command attempted to run but not found: ' + commandName);
		}
	}
});

// dot-commands
client.on('messageCreate', message => {
	// Some basic checking to prevent running unnecessary code
	if (message.author.bot) return;

	// Break the message down into its components and analyze it
	const commandData = fn.dot.getCommandData(message);
	console.log(commandData);

	if (commandData.isValid && commandData.isCommand) {
		try {
			client.dotCommands.get(commandData.command).execute(message, commandData);
		}
		catch (error) {
			console.error(error);
			message.reply('There was an error trying to execute that command.');
		}
	}
	return;
});

client.login(token);