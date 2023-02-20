const { SlashCommandBuilder } = require('discord.js');
const fn = require('../modules/functions.js');
const strings = require('../data/strings.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rolemenu')
		.setDescription('Send a self-assignable role selection menu'),
	async execute(interaction) {
		await interaction.deferReply().catch(e => console.error(e));
        if (interaction.client.guildInfos.has(interaction.guildId)) {
            let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
            await interaction.editReply(fn.builders.embeds.treeRoleMenu(guildInfo)).catch(e => console.error(e));
        } else {
            await interaction.editReply(fn.builders.errorEmbed(strings.status.noRoleMenu)).catch(e => console.error(e));
        }
	},
};