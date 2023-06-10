const { SlashCommandBuilder, messageLink } = require('discord.js');
const fn = require('../modules/functions.js');
const strings = require('../data/strings.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('Get info about the bot')
		.addStringOption(o => 
			o.setName('private')
			 .setDescription('Should the response be sent privately?')
			 .setRequired(true)
			 .addChoices(
				{ name: "True", value: "true" },
				{ name: "False", value: "false" })),
	async execute(interaction) {
		const aboutEmbed = fn.builders.aboutEmbed(interaction.options.getString('private'));
		await interaction.reply(aboutEmbed);
	},
};