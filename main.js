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
const fn = require('./modules/functions.js');
const strings = require('./data/strings.json');
const isDev = process.env.isDev;

client.once('ready', () => {
	fn.collections.slashCommands(client);
	console.log('Ready!');
	client.channels.fetch(statusChannelId).then(channel => {
		channel.send(`${new Date().toISOString()} -- Ready`);
	});
});

// slash-commands
client.on('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
		const { commandName } = interaction;

		if (client.slashCommands.has(commandName)) {
			client.slashCommands.get(commandName).execute(interaction);
		} else {
			interaction.reply('Sorry, I don\'t have access to that command.');
			console.error('Slash command attempted to run but not found: /' + commandName);
		}
	}

	if (interaction.isButton() && interaction.component.customId == 'refresh') {
		fn.refresh(interaction);
	}
});

client.login(token);