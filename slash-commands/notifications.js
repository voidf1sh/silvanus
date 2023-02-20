const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GuildInfo } = require('../modules/CustomClasses.js');
const dbfn = require('../modules/dbfn.js');
const fn = require('../modules/functions.js');
const strings = require('../data/strings.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('notifications')
		.setDescription('A notification relay for improved water and fruit notifications')
		.addSubcommand(sc =>
			sc.setName('set')
				.setDescription('Set up the notification relay for the first time')
				.addChannelOption(o =>
					o.setName('watchchannel')
						.setDescription('The channel Grow A Tree sends your notifications in')
						.setRequired(true)
				)
				.addStringOption(o =>
					o.setName('watermessage')
						.setDescription('Message to send for water reminders')
						.setRequired(true)
				)
				.addChannelOption(o =>
					o.setName('pingchannel')
						.setDescription('The channel to send the water reminder in')
						.setRequired(true)
				)
				.addStringOption(o =>
					o.setName('fruitmessage')
						.setDescription("Message to send for fruit reminders")
						.setRequired(false)
				)
		)
		.addSubcommand(sc =>
			sc.setName('update')
				.setDescription('Update an already setup notification relay')
				.addChannelOption(o =>
					o.setName('watchchannel')
						.setDescription('The channel Grow A Tree sends your notifications in')
						.setRequired(false)
				)
				.addStringOption(o =>
					o.setName('watermessage')
						.setDescription('Message to send for water reminders')
						.setRequired(false)
				)
				.addChannelOption(o =>
					o.setName('pingchannel')
						.setDescription('The channel to send the water reminder in')
						.setRequired(false)
				)
				.addStringOption(o =>
					o.setName('fruitmessage')
						.setDescription("Message to send for fruit reminders")
						.setRequired(false)
				)
		)
		.addSubcommand(sc =>
			sc.setName('disable')
			.setDescription('Disable the notification relay')
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	async execute(interaction) {
		try {
			await interaction.deferReply({ ephemeral: true });
			const subcommand = interaction.options.getSubcommand();
			// if (process.env.DEBUG) console.log(`${typeof subcommand}: ${subcommand}`);
			switch (subcommand) {
				case "set":
					if (interaction.client.guildInfos.has(interaction.guildId)) {
						const watchChannel = interaction.options.getChannel('watchchannel');
						const waterMessage = interaction.options.getString('watermessage');
						const fruitMessage = interaction.options.getString('fruitmessage') ? interaction.options.getString('fruitmessage') : interaction.options.getString('watermessage');
						const reminderChannel = interaction.options.getChannel('pingchannel');
						let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
						guildInfo.setReminders(waterMessage, fruitMessage, reminderChannel.id, watchChannel.id, true);
						let query = guildInfo.queryBuilder("setReminders");
						await dbfn.setGuildInfo(query);
						const replyParts = [
							`I'll watch <#${watchChannel.id}> for Grow A Tree Notifications and relay them to <#${reminderChannel.id}>.`,
							`Water Message: ${waterMessage}`
						];
						if (fruitMessage != "") replyParts.push(`Fruit Message: ${fruitMessage}`);
						await interaction.editReply(replyParts.join("\n")).catch(e => console.error(e));
						fn.collectionBuilders.guildInfos(interaction.client);
					} else {
						const watchChannel = interaction.options.getChannel('watchchannel');
						const waterMessage = interaction.options.getString('watermessage');
						const fruitMessage = interaction.options.getString('fruitmessage') ? interaction.options.getString('fruitmessage') : interaction.options.getString('watermessage');
						const reminderChannel = interaction.options.getChannel('pingchannel');
						let guildInfo = new GuildInfo()
							.setId(interaction.guildId)
							.setReminders(waterMessage, fruitMessage, reminderChannel.id, watchChannel.id, true);
						let query = guildInfo.queryBuilder("setReminders");
						await dbfn.setGuildInfo(query);
						const replyParts = [
							`I'll watch <#${watchChannel.id}> for Grow A Tree Notifications and relay them to <#${reminderChannel.id}>.`,
							`Water Message: ${waterMessage}`
						];
						if (fruitMessage != "") replyParts.push(`Fruit Message: ${fruitMessage}`);
						await interaction.editReply(replyParts.join("\n")).catch(e => console.error(e));
						fn.collectionBuilders.guildInfos(interaction.client);
					}
					break;
				case "update":
					if (interaction.client.guildInfos.has(interaction.guildId)) {
						let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
						const inWatchChannel = interaction.options.getChannel('watchchannel');
						const inWaterMessage = interaction.options.getString('watermessage');
						const inFruitMessage = interaction.options.getString('fruitmessage');
						const inReminderChannel = interaction.options.getChannel('pingchannel');
						
						const outWatchChannelId = inWatchChannel ? inWatchChannel.id : guildInfo.watchChannelId;
						const outWaterMessage = inWaterMessage ? inWaterMessage : guildInfo.waterMessage;
						const outFruitMessage = inFruitMessage ? inFruitMessage : guildInfo.fruitMessage;
						const outReminderChannelId = inReminderChannel ? inReminderChannel.id : guildInfo.reminderChannelId;

						guildInfo.setReminders(outWaterMessage, outFruitMessage, outReminderChannelId, outWatchChannelId, true);
						let query = guildInfo.queryBuilder("setReminders");
						await dbfn.setGuildInfo(query);
						const replyParts = [
							`I'll watch <#${outWatchChannelId}> for Grow A Tree Notifications and relay them to <#${outReminderChannelId}>.`,
							`Water Message: ${outWaterMessage}`
						];
						if (outFruitMessage != "") replyParts.push(`Fruit Message: ${outFruitMessage}`);
						await interaction.editReply(replyParts.join("\n")).catch(e => console.error(e));
						fn.collectionBuilders.guildInfos(interaction.client);
					} else {
						await interaction.editReply(fn.builders.errorEmbed("There is no existing notification relay to update!")).catch(e => console.error(e));
					}
					break;
				case 'disable':
					if (interaction.client.guildInfos.has(interaction.guildId)) {
						let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
						guildInfo.setReminders(undefined, undefined, undefined, undefined, false);
						await dbfn.setGuildInfo(guildInfo.queryBuilder("setReminders")).catch(e => console.error(e));
						await fn.collectionBuilders.guildInfos(interaction.client);
						await interaction.editReply(fn.builders.embed(strings.status.optout)).catch(e => console.error(e));
					} else {
						await interaction.editReply(fn.builders.errorEmbed("A notification relay has not been set up yet!")).catch(e => console.error(e));
					}
					break;
				default:
					await interaction.editReply(fn.builders.errorEmbed("Invalid subcommand detected.")).catch(e => console.error(e));
					break;
			}
		} catch (err) {
			console.error("Error occurred while setting up a notification relay: " + err);
		}
	},
};