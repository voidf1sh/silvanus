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
const dbfn = require('./modules/dbfn.js');
const isDev = process.env.isDev;

client.once('ready', async () => {
	await fn.collectionBuilders.slashCommands(client);
	await fn.collectionBuilders.guildInfos(client);
	await fn.setupCollectors(client);
	console.log('Ready!');
	client.user.setActivity({ name: strings.activity.name, type: ActivityType.Watching });
	if (isDev == 'false') {
		client.channels.fetch(statusChannelId).then(channel => {
			channel.send(`${new Date().toISOString()} -- \nStartup Sequence Complete <@481933290912350209>`);
		});
	}
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

	if (interaction.isButton()) {
		switch (interaction.component.customId) {
			case 'refresh':
				// console.log(JSON.stringify(interaction));
				await fn.refresh(interaction).catch(err => {
					interaction.channel.send(fn.builders.errorEmbed(err));
				});
				break;
			case 'deleteping':
				if (interaction.message.deletable) {
					await interaction.message.delete().catch(err => {
						console.error(err);
					});
				}
				break;
			case 'waterpingrole':
				await interaction.reply(fn.buttonHandlers.waterPing(interaction)).catch(err => console.error(err));
				break;
			case 'fruitpingrole':
				await interaction.reply(fn.buttonHandlers.fruitPing(interaction)).catch(err => console.error(err));
				break;
			default:
				break;
		}
	}
});

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

client.login(token);