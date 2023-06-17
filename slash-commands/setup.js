const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fn = require('../modules/functions.js');
const strings = require('../data/strings.json');
const dbfn = require('../modules/dbfn.js');
const { GuildInfo } = require('../modules/CustomClasses.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Configure some feature settings.')
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
		.addSubcommand(sc =>
			sc.setName('reset')
				.setDescription('Remove all server configuration from the database')
				.addBooleanOption(o =>
					o.setName('confirm')
						.setDescription('WARNING THIS IS IRREVERSIBLE')
						.setRequired(true)
				)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const subcommand = interaction.options.getSubcommand();
		switch (subcommand) {
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
						.setIds(interaction.guildId, interaction.guild.ownerId);
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
			case "reset":
				if (interaction.client.guildInfos.has(interaction.guildId)) {
					let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
					if (interaction.options.getBoolean('confirm')) {
						fn.reset(interaction).then(res => {
							interaction.editReply(fn.builders.embed(strings.status.reset)).catch(err => {
								console.error(err);
							});
						}).catch(err => {
							console.error(err);
							interaction.editReply(strings.status.resetError).catch(err => {
								console.error(err);
							});
						});
					} else {
						await interaction.editReply(fn.builders.embed("You must select 'true' to confirm setup reset. No changes have been made.")).catch(e => console.error(e));
					}
				} else {
					await interaction.editReply(fn.builders.errorEmbed("There is no configuration to delete.")).catch(e => console.error(e));
				}
				break;
			default:
				await interaction.editReply(fn.builders.errorEmbed(strings.error.invalidSubcommand)).catch(e => console.error(e));
				break;
		}
	},
};