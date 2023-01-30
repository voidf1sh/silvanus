const { SlashCommandBuilder, messageLink } = require('discord.js');
const fn = require('../modules/functions.js');
const strings = require('../data/strings.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('commands')
		.setDescription('Get a list of all my commands')
		.addStringOption(o => 
			o.setName('private')
			 .setDescription('Should the response be sent privately?')
			 .setRequired(true)
			 .addChoices(
				{ name: "True", value: "true" },
				{ name: "False", value: "false" })),
	execute(interaction) {
		const helpEmbed = fn.builders.helpEmbed(`**All Commands**\n${strings.help.allCommands}`, interaction.options.getString('private'));
		interaction.reply(helpEmbed);
	},
};