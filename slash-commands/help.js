const { SlashCommandBuilder, messageLink } = require('discord.js');
const fn = require('../functions.js');
const strings = require('../strings.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Get help using the bot')
		.addSubcommand(subcommand =>
			subcommand
				.setName('info')
				.setDescription('Learn about the bot')
				.addStringOption(o => 
					o.setName('private')
					 .setDescription('Should the response be sent privately?')
					 .setRequired(true)
					 .addChoices(
						{ name: "True", value: "true" },
						{ name: "False", value: "false" }
					 )))
		.addSubcommand(subcommand =>
			subcommand
				.setName('setup')
				.setDescription('Learn how to setup the bot')
				.addStringOption(o => 
					o.setName('private')
					 .setDescription('Should the response be sent privately?')
					 .setRequired(true)
					 .addChoices(
						{ name: "True", value: "true" },
						{ name: "False", value: "false" }
					 )))
		.addSubcommand(subcommand =>
			subcommand
				.setName('permissions')
				.setDescription('Learn about the bot\'s permissions')
				.addStringOption(o => 
					o.setName('private')
					 .setDescription('Should the response be sent privately?')
					 .setRequired(true)
					 .addChoices(
						{ name: "True", value: "true" },
						{ name: "False", value: "false" }
					 ))),
	execute(interaction) {
		const helpEmbed = fn.builders.helpEmbed(strings.help[interaction.options.getSubcommand()], interaction.options.getString('private'));
		interaction.reply(helpEmbed);
	},
};