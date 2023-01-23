const { SlashCommandBuilder } = require('discord.js');
const { tree } = require('../modules/functions.js');
const fn = require('../modules/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('watertime')
		.setDescription('Calculate the watering time for a given tree height')
		.addStringOption(o => 
			o.setName('height')
			 .setDescription('Tree height in feet, numbers ONLY')
			 .setRequired(true)),
	execute(interaction) {
		interaction.deferReply();
		const treeHeight = interaction.options.getString('height');
		const waterTime = Math.floor(Math.floor(Math.pow(treeHeight * 0.07 + 5, 1.1)) / 60);
		interaction.reply(`A tree that is ${treeHeight}ft tall will have a watering time of ${waterTime} minutes.`);
	},
};