const { SlashCommandBuilder } = require('discord.js');
const fn = require('../modules/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timetoheight')
		.setDescription('Calculate how long it would take to reach a given height')
		.addStringOption(o => 
			o.setName('height')
			 .setDescription('Tree height in feet, numbers ONLY')
			 .setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		const destTreeHeight = interaction.options.getString('height');
        fn.timeToHeight(interaction, destTreeHeight).then(res => {
            interaction.editReply(`It will take you ${res} minutes to reach ${destTreeHeight}ft.`);
        }).catch(err => {
            interaction.editReply("Error: " + err);
            console.error(err);
            return;
        }); 
	},
};