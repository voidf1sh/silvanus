const { SlashCommandBuilder } = require('discord.js');
const dbfn = require('../modules/dbfn.js');
const fn = require('../modules/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timetoheight')
		.setDescription('Calculate how long it would take to reach a given height')
		.addIntegerOption(o => 
			o.setName('endheight')
			 .setDescription('Ending tree height in feet')
			 .setRequired(true))
		.addIntegerOption(o => 
			o.setName('beginheight')
			 .setDescription('Beginning tree height in feet')
			 .setRequired(false)),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		let beginHeight = interaction.options.getInteger('beginheight');
		const endHeight = interaction.options.getInteger('endheight');
		if (!beginHeight) {
			const guildInfo = interaction.client.guildInfos.get(interaction.guild.id);
			beginHeight = guildInfo.treeHeight;
		}
        fn.timeToHeight(beginHeight, endHeight).then(res => {
            interaction.editReply(`It will take a tree that is ${beginHeight}ft tall ${res} to reach ${endHeight}ft.`);
        }).catch(err => {
            interaction.editReply("Error: " + err);
            console.error(err);
            return;
        }); 
	},
};