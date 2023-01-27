const { SlashCommandBuilder } = require('discord.js');
const dbfn = require('../modules/dbfn.js');
const fn = require('../modules/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timetoheight')
		.setDescription('Calculate how long it would take to reach a given height')
		.addStringOption(o => 
			o.setName('beginheight')
			 .setDescription('Begining tree height in feet, numbers ONLY')
			 .setRequired(true))
		.addStringOption(o => 
			o.setName('endheight')
			 .setDescription('Ending tree height in feet, numbers ONLY')
			 .setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		const beginHeight = interaction.options.getString('beginheight');
		const endHeight = interaction.options.getString('endheight');
        fn.timeToHeight(beginHeight, endHeight).then(res => {
            interaction.editReply(`It will take a tree that is ${beginHeight}ft tall ${res} to reach ${endHeight}ft.`);
        }).catch(err => {
            interaction.editReply("Error: " + err);
            console.error(err);
            return;
        }); 
	},
};