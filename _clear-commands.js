// dotenv for handling environment variables
const dotenv = require('dotenv');
dotenv.config();

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const clientId = process.env.clientId;
const { guildId } = require('../config.json');
const token = process.env.TOKEN;

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: '' },
		);

		console.log('Successfully reloaded application (/) commands.');
		process.exit();
	} catch (error) {
		console.error(error);
	}
})();