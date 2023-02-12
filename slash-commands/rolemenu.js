const { SlashCommandBuilder } = require('discord.js');
const fn = require('../modules/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rolemenu')
		.setDescription('Send a self-assignable role selection menu')
        .addRoleOption(o =>
            o.setName('waterrole')
             .setDescription('The role for water reminder pings')
             .setRequired(true))
        .addRoleOption(o =>
            o.setName('fruitrole')
             .setDescription('The role for fruit alert pings')
             .setRequired(false)),
	async execute(interaction) {
		await interaction.deferReply().catch(err => console.error(err));
		await interaction.editReply(fn.builders.embeds.treeRoleMenu()).catch(err => console.error(err));
	},
};