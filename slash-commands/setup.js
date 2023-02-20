const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fn = require('../modules/functions.js');
const strings = require('../data/strings.json');
const dbfn = require('../modules/dbfn.js');
const { GuildInfo } = require('../modules/CustomClasses.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Attempt automatic configuration of the bot.')
		.addSubcommand(sc =>
			sc.setName('compare')
				.setDescription('Set up the channels to be used with /compare')
				.addChannelOption(o =>
					o.setName('treechannel')
						.setDescription('What channel is your tree in?')
						.setRequired(true)
				)
				.addChannelOption(o =>
					o.setName('leaderboardchannel')
						.setDescription('If your leaderboard isn\'t in the same channel, where is it?')
						.setRequired(false)
				)
		)
		.addSubcommand(sc =>
			sc.setName('rolemenu')
				.setDescription('Setup the roles to be used with /rolemenu')
				.addRoleOption(o =>
					o.setName('waterrole')
						.setDescription('The role for water reminder pings')
						.setRequired(true)
				)
				.addRoleOption(o =>
					o.setName('fruitrole')
						.setDescription('The role for fruit alert pings')
						.setRequired(false)
				)
		)
		.addSubcommand(sc =>
			sc.setName('view')
				.setDescription('View your server\'s configuration'))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const subcommand = interaction.options.getSubcommand();
		switch (subcommand) {
			case "compare":
				if (interaction.client.guildInfos.has(interaction.guildId)) {
					let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
					const findMessagesResponse = await fn.messages.find(interaction, guildInfo);
					await interaction.editReply(findMessagesResponse.status).catch(e => console.error(e));
				} else {
					let guildInfo = new GuildInfo()
						.setId(interaction.guildId);
					const findMessagesResponse = await fn.messages.find(interaction, guildInfo);
					await interaction.editReply(findMessagesResponse.status).catch(e => console.error(e));
				}
				break;
			case "rolemenu":
				let waterRoleId = interaction.options.getRole('waterrole').id;
				let fruitRoleId = interaction.options.getRole('fruitrole') ? interaction.options.getRole('fruitrole').id : undefined;
				if (interaction.client.guildInfos.has(interaction.guildId)) {
					let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
					guildInfo.setRoles(waterRoleId, fruitRoleId);
					await dbfn.setGuildInfo(guildInfo.queryBuilder("setRoles"));
					await fn.collectionBuilders.guildInfos(interaction.client);
					await interaction.editReply(fn.builders.embeds.treeRoleMenu(guildInfo)).catch(e => console.error(e));
				} else {
					let guildInfo = new GuildInfo()
						.setId(interaction.guildId);
					guildInfo.setRoles(waterRoleId, fruitRoleId);
					await dbfn.setGuildInfo(guildInfo.queryBuilder("setRoles"));
					await fn.collectionBuilders.guildInfos(interaction.client);
					await interaction.editReply(fn.builders.embeds.treeRoleMenu(guildInfo)).catch(e => console.error(e));
				}
				break;
			case "view":
				try {
					if (interaction.client.guildInfos.has(interaction.guildId)) {
						let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
						await interaction.editReply(fn.builders.embed(guildInfo.generateSetupInfo()));
					} else {
						await interaction.editReply(fn.builders.errorEmbed("Guild doesn't exist in database!"));
					}
				} catch (err) {
					console.error(err);
					await interaction.editReply(fn.builders.errorEmbed("There was an error running the command."));
				}
				break;
			default:
				break;
		}
	},
};