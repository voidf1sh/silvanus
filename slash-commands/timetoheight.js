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
		const efficiency = interaction.options.getInteger('efficiency') != undefined ? interaction.options.getInteger('efficiency') : 10;
		const quality = interaction.options.getInteger('quality') != undefined ? interaction.options.getInteger('quality') : 5;
		let beginHeight, replyContent;

		if (!inBeginHeight) {
			const guildInfo = interaction.client.guildInfos.get(interaction.guild.id);
			beginHeight = guildInfo.treeHeight;
		} else {
			beginHeight = inBeginHeight;
		}

		const timeToHeightResults = await fn.timeToHeight(beginHeight, endHeight, efficiency, quality);
		const { time, totalWaterCount, compostAppliedCount, average, savedTime } = timeToHeightResults;
		let replyFields = undefined;
		if (efficiency && quality) {
			replyContent = `I estimate that a tree with ${efficiency}% Composter Efficiency and ${quality}% Compost Quality growing from ${beginHeight}ft to ${endHeight}ft will take ${time}`;
			replyFields = [
				{ name: `Height Gained:`, value: `${endHeight - beginHeight}ft`, inline: true},
				{ name: `E/Q:`, value: `${efficiency}%/${quality}%`, inline: true},
				{ name: `Compost Applied`, value: `${compostAppliedCount} times`, inline: true },
				{ name: `Compost Average`, value: `${average}%`, inline: true },
				{ name: `Saved Time`, value: savedTime, inline: true }
			];
		} else {
			replyContent = `I estimate that a tree growing from ${beginHeight}ft to ${endHeight}ft will take ${time}`;
		}

		const reply = fn.builders.embeds.information(replyContent, replyFields)
		await interaction.editReply(reply);
	}
};