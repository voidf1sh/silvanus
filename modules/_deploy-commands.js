// dotenv for handling environment variables
const dotenv = require('dotenv');
dotenv.config();

const { REST, Routes } = require('discord.js');
const { guildId } = require('../data/config.json');
const clientId = process.env.clientId;
const token = process.env.TOKEN;
const fs = require('fs');

const commands = [];
const commandFiles = fs.readdirSync('../slash-commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`../slash-commands/${file}`);
	if (command.data != undefined) {
		commands.push(command.data.toJSON());
	}
}

console.log(commands);

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
		process.exit();
	} catch (error) {
		console.error(error);
	}
})();