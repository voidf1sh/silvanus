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
			.setRequired(true)
		)
		.addIntegerOption(o => 
			o.setName('beginheight')
			.setDescription('Beginning tree height in feet')
			.setRequired(false)
		)
		.addIntegerOption(o => 
			o.setName('efficiency')
			.setDescription('Composter efficiency percentage, rounded')
			.setRequired(false)
		)
		.addIntegerOption(o => 
			o.setName('quality')
			.setDescription('Compost quality percentage, rounded')
			.setRequired(false)
		)
		.addBooleanOption(o =>
			o.setName('private')
			.setDescription('Should the reply be visible only to you?')
			.setRequired(false)
		),
	async execute(interaction) {
		const private = interaction.options.getBoolean('private') != undefined ? interaction.options.getBoolean('private') : true;
		await interaction.deferReply({ ephemeral: private });
		const inBeginHeight = interaction.options.getInteger('beginheight');
		const endHeight = interaction.options.getInteger('endheight');
		const efficiency = interaction.options.getInteger('efficiency');
		const quality = interaction.options.getInteger('quality');
		let beginHeight, replyContent;

		if ((efficiency && !quality) || (quality && !efficiency)) {
			const reply = fn.builders.embed("You must include **both** efficiency *and* quality, I only received one.");
			await interaction.editReply(reply).catch(e => console.error(e));
			return;
		}

		if (!inBeginHeight) {
			const guildInfo = interaction.client.guildInfos.get(interaction.guild.id);
			beginHeight = guildInfo.treeHeight;
		} else {
			beginHeight = inBeginHeight;
		}
		
		const timeString = await fn.timeToHeight(beginHeight, endHeight, efficiency, quality);
		if (efficiency && quality) {
			replyContent = `I estimate that a tree with ${efficiency}% Composter Efficiency and ${quality}% Compost Quality growing from ${beginHeight}ft to ${endHeight}ft will take ${timeString}`;
		} else {
			replyContent = `I estimate that a tree growing from ${beginHeight}ft to ${endHeight}ft will take ${timeString}`;
		}

		const reply = fn.builders.embed(replyContent)
		await interaction.editReply(reply);
	}
};