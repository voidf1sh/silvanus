const { SlashCommandBuilder, messageLink } = require('discord.js');
const fn = require('../modules/functions.js');
const strings = require('../data/strings.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Get help using the bot')
		.addStringOption(o => 
			o.setName('private')
			 .setDescription('Should the response be sent privately?')
			 .setRequired(true)
			 .addChoices(
				{ name: "True", value: "true" },
				{ name: "False", value: "false" })),
	execute(interaction) {
		const helpEmbed = fn.builders.helpEmbed(`${strings.help.info}\n\n**Setup**\n${strings.help.setup}`, interaction.options.getString('private'));
		interaction.reply(helpEmbed);
	},
};