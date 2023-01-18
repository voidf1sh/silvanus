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
		GatewayIntentBits.DirectMessages
	],
	partials: [
		Partials.Channel,
		Partials.Message,
	],
});
const { MessageActionRow, MessageButton } = require('discord.js');

// Various imports
const fn = require('./functions.js');
const config = require('./config.json');
const strings = require('./strings.json');
const isDev = process.env.isDev;

client.once('ready', () => {
	fn.collections.slashCommands(client);
	fn.collections.dotCommands(client);
	fn.collections.setvalidCommands(client);
	fn.download.gifs(client);
	fn.download.pastas(client);
	fn.download.joints(client);
	fn.download.requests(client);
	fn.download.strains(client);
	fn.download.medicalAdvice(client);
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

	if (interaction.isButton()) {
		if (interaction.user.id != strings.temp.gifUserId) return;
		// Get some meta info from strings
		const index = strings.temp.gifIndex;
		const limit = strings.temp.gifLimit;
		let newIndex;
		const buttonId = interaction.component.customId;
		switch (buttonId) {
			case 'prevGif':
				newIndex = index - 1;
				strings.temp.gifIndex = newIndex;
				// If we're leaving the last GIF, enable the Next GIF button
				if (index == limit) {
					// Re-Send Previous GIF button
					const prevButton = new MessageButton().setCustomId('prevGif').setLabel('Previous GIF').setStyle('SECONDARY');
					// Re-Send Confirm GIF Button
					const confirmButton = new MessageButton().setCustomId('confirmGif').setLabel('Confirm').setStyle('PRIMARY');
					// Enable Next GIF Button
					const nextButton = new MessageButton().setCustomId('nextGif').setLabel('Next GIF').setStyle('SECONDARY');
					// Re-Send Cancel Button
					const cancelButton = new MessageButton().setCustomId('cancelGif').setLabel('Cancel').setStyle('DANGER');
					// Put all the above into an ActionRow to be sent as a component of the reply
					const row = new MessageActionRow().addComponents(prevButton, confirmButton, nextButton, cancelButton);

					interaction.update({ content: strings.temp.gifs[newIndex].embed_url, components: [row] });
					break;
				}
				// If we're going into the first GIF, disable the Previous GIF button
				if (newIndex == 0) {
					// Disable Previous GIF button
					const prevButton = new MessageButton().setCustomId('prevGif').setLabel('Previous GIF').setStyle('SECONDARY').setDisabled();
					// Re-Send Confirm GIF Button
					const confirmButton = new MessageButton().setCustomId('confirmGif').setLabel('Confirm').setStyle('PRIMARY');
					// Re-Send  Next GIF Button
					const nextButton = new MessageButton().setCustomId('nextGif').setLabel('Next GIF').setStyle('SECONDARY');
					// Re-Send Cancel Button
					const cancelButton = new MessageButton().setCustomId('cancelGif').setLabel('Canceled').setStyle('DANGER');
					// Put all the above into an ActionRow to be sent as a component of the reply
					const row = new MessageActionRow().addComponents(prevButton, confirmButton, nextButton, cancelButton);

					interaction.update({ content: strings.temp.gifs[newIndex].embed_url, components: [row] });
					break;
				}

				interaction.update(strings.temp.gifs[newIndex].embed_url);
				break;
			case 'confirmGif':
				const gifData = {
					name: strings.temp.gifName,
					embed_url: strings.temp.gifs[strings.temp.gifIndex].embed_url,
				};
				fn.upload.gif(gifData, client);
				interaction.update({ content: `I've saved the GIF as ${gifData.name}.gif`, components: [] });
				fn.download.gifs(interaction.client);
				break;
			case 'nextGif':
				newIndex = index + 1;
				strings.temp.gifIndex = newIndex;
				// If we're leaving the first GIF, enable the Previous GIF button
				if (index == 0) {
					// Enable Previous GIF button
					const prevButton = new MessageButton().setCustomId('prevGif').setLabel('Previous GIF').setStyle('SECONDARY').setDisabled(false);
					// Re-Send Confirm GIF Button
					const confirmButton = new MessageButton().setCustomId('confirmGif').setLabel('Confirm').setStyle('PRIMARY');
					// Re-Send Next GIF Button
					const nextButton = new MessageButton().setCustomId('nextGif').setLabel('Next GIF').setStyle('SECONDARY');
					// Re-Send Cancel Button
					const cancelButton = new MessageButton().setCustomId('cancelGif').setLabel('Cancel').setStyle('DANGER');
					// Put all the above into an ActionRow to be sent as a component of the reply
					const row = new MessageActionRow().addComponents(prevButton, confirmButton, nextButton, cancelButton);

					interaction.update({ content: strings.temp.gifs[newIndex].embed_url, components: [row] });
					break;
				}
				// If we're going into the last GIF, disable the Next GIF button
				if (newIndex == strings.temp.gifLimit) {
					// Re-Send Previous GIF button
					const prevButton = new MessageButton().setCustomId('prevGif').setLabel('Previous GIF').setStyle('SECONDARY');
					// Re-Send Confirm GIF Button
					const confirmButton = new MessageButton().setCustomId('confirmGif').setLabel('Confirm').setStyle('PRIMARY');
					// Disable  Next GIF Button
					const nextButton = new MessageButton().setCustomId('nextGif').setLabel('Next GIF').setStyle('SECONDARY').setDisabled();
					// Re-Send Cancel Button
					const cancelButton = new MessageButton().setCustomId('cancelGif').setLabel('Canceled').setStyle('DANGER');
					// Put all the above into an ActionRow to be sent as a component of the reply
					const row = new MessageActionRow().addComponents(prevButton, confirmButton, nextButton, cancelButton);

					interaction.update({ content: strings.temp.gifs[newIndex].embed_url, components: [row] });
					break;
				}

				interaction.update(strings.temp.gifs[newIndex].embed_url);
				break;
			case 'cancelGif':
				// Previous GIF button
				const prevButton = new MessageButton().setCustomId('prevGif').setLabel('Previous GIF').setStyle('SECONDARY').setDisabled();
				// Confirm GIF Button
				const confirmButton = new MessageButton().setCustomId('confirmGif').setLabel('Confirm').setStyle('PRIMARY').setDisabled();
				// Next GIF Button
				const nextButton = new MessageButton().setCustomId('nextGif').setLabel('Next GIF').setStyle('SECONDARY').setDisabled();
				// Cancel Button
				const cancelButton = new MessageButton().setCustomId('cancelGif').setLabel('Canceled').setStyle('DANGER');
				// Put all the above into an ActionRow to be sent as a component of the reply
				const row = new MessageActionRow().addComponents(prevButton, confirmButton, nextButton, cancelButton);
				interaction.component.setDisabled(true);

				interaction.update({ content: 'Canceled.', components: [row] });
				break;
			default:
				break;
		}
	}

	// Handle autocomplete requests
	if (interaction.isAutocomplete()) {
		if (interaction.commandName == 'strain') {
			const searchString = interaction.options.getFocused();
			const choices = fn.weed.strain.lookup(searchString, interaction.client);
			await interaction.respond(
				choices.map(choice => ({ name: choice, value: choice }))
			)
		} else {
			return;
		}
	}
});

// dot-commands
client.on('messageCreate', message => {
	// Some basic checking to prevent running unnecessary code
	if (message.author.bot) return;

	// Wildcard Responses, will respond if any message contains the trigger word(s), excluding self-messages
	const lowerContent = message.content.toLowerCase();
	if (lowerContent.includes('big') && lowerContent.includes('doinks')) message.reply('gang.');
	if (lowerContent.includes('ligma')) message.reply('ligma balls, goteem');
	if (lowerContent.includes('frfr') || lowerContent.includes('fr fr') || lowerContent.includes('bussin') || lowerContent.includes(' ong') || lowerContent.startsWith('ong')) message.reply('ongggg no :billed_cap: fr fr str8 bussin'); 

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