const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const dbfn = require('../modules/dbfn.js');
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
             .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	async execute(interaction) {
		await interaction.deferReply().catch(err => console.error(err));
        if (interaction.client.guildInfos.has(interaction.guildId)) {
            let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
            guildInfo.setRoles(interaction.options.getRole('waterrole'), interaction.options.getRole('fruitrole'));
            await dbfn.setGuildInfo(guildInfo.queryBuilder("setRoles"));
            await fn.collectionBuilders.guildInfos(interaction.client);
            await interaction.editReply(fn.builders.embeds.treeRoleMenu(guildInfo)).catch(err => console.error(err));
        } else {
            await interaction.editReply(fn.builders.errorEmbed("No information is known about your server yet, please run /setup or /compare")).catch(err => console.error(err));
        }
	},
};