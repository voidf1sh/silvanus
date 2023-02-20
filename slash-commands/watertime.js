const { SlashCommandBuilder } = require('discord.js');
const { tree } = require('../modules/functions.js');
const fn = require('../modules/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('watertime')
		.setDescription('Calculate the watering time for a given tree height')
		.addIntegerOption(o => 
			o.setName('height')
			 .setDescription('Tree height')
			 .setRequired(true))
		.addBooleanOption(o =>
			o.setName('private')
			.setDescription('Should the response be private? Default: true')
			.setRequired(false)),
	async execute(interaction) {
		const treeHeight = interaction.options.getInteger('height');
		const privateOpt = interaction.options.getBoolean('private');
		const private = privateOpt != undefined ? privateOpt : true;
		await interaction.deferReply( {ephemeral: private });
		const waterSeconds = fn.getWaterTime(treeHeight);
		const waterTime = fn.parseWaterTime(waterSeconds);
		await interaction.editReply(`A tree that is ${treeHeight}ft tall will have a watering time of ${waterTime}.`);
	},
};