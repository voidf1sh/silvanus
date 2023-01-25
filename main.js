/* eslint-disable no-case-declarations */
/* eslint-disable indent */
// dotenv for handling environment variables
const dotenv = require('dotenv');
dotenv.config();
const token = process.env.TOKEN;
const statusChannelId = process.env.statusChannelId;

// Discord.JS
const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
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
	client.user.setActivity({ name: strings.activity.name, type: ActivityType.Watching });
	client.channels.fetch(statusChannelId).then(channel => {
		channel.send(`${new Date().toISOString()} -- \nStartup Sequence Complete`);
	});
});

// slash-commands
client.on('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
		// if (isDev) {
		// 	console.log(interaction);
		// }
		const { commandName } = interaction;

		if (client.slashCommands.has(commandName)) {
			client.slashCommands.get(commandName).execute(interaction);
		} else {
			interaction.reply('Sorry, I don\'t have access to that command.');
			console.error('Slash command attempted to run but not found: ' + commandName);
		}
	}

	if (interaction.isButton() && interaction.component.customId == 'refresh') {
		fn.refresh(interaction);
	}
});

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

client.login(token);