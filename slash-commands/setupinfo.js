const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fn = require('../modules/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setupinfo')
		.setDescription('View information about how the bot is set up in your server')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true }).catch(err => console.error(err));
		try {
			if (interaction.client.guildInfos.has(interaction.guildId)) {
				let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
				await interaction.editReply(fn.builders.embed(guildInfo.generateSetupInfo()));
			} else {
				await interaction.editReply(fn.builders.errorEmbed("Guild doesn't exist in database!"));
			}
		} catch (err) {
			console.error(err);
			await interaction.editReply(fn.builders.errorEmbed("There was an error running the command."));
		}
	},
};