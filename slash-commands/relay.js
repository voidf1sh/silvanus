const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GuildInfo } = require('../modules/CustomClasses.js');
const dbfn = require('../modules/dbfn.js');
const fn = require('../modules/functions.js');
const strings = require('../data/strings.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('relay')
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
				.addBooleanOption(o =>
					o.setName('enabled')
						.setDescription("Enable the relay?")
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
				// Set all components for the first time
				case "set":
					// If there is already a guildInfo object for this server
					if (interaction.client.guildInfos.has(interaction.guildId)) {
						let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
						// Get options from the interaction
						const watchChannel = interaction.options.getChannel('watchchannel');
						const waterMessage = interaction.options.getString('watermessage');
						// If the fruit message is set, use it, otherwise default to the water message.
						const fruitMessage = interaction.options.getString('fruitmessage') ? interaction.options.getString('fruitmessage') : interaction.options.getString('watermessage');
						const reminderChannel = interaction.options.getChannel('pingchannel');
						// Set the reminder configuration in the GuildInfo object
						guildInfo.setReminders(waterMessage, fruitMessage, reminderChannel.id, watchChannel.id, true);
						// Update the guildInfos Collection
						interaction.client.guildInfos.set(interaction.guildId, guildInfo);
						// Build a query to update the database
						let query = guildInfo.queryBuilder("setReminders");
						// Run the query
						await dbfn.setGuildInfo(query);
						// Set up a collector on the watch channel
						fn.collectors.create(interaction.client, guildInfo);
						// Compose a reply
						const reply = [
							`I'll watch <#${watchChannel.id}> for Grow A Tree Notifications and relay them to <#${reminderChannel.id}>.`,
							`Water Message: ${waterMessage}`,
							`Fruit Message: ${fruitMessage}`
						].join("\n");
						// Send the reply
						await interaction.editReply(fn.builders.embed(reply)).catch(e => console.error(e));
					} else {
						// Get options from the interaction
						const watchChannel = interaction.options.getChannel('watchchannel');
						const waterMessage = interaction.options.getString('watermessage');
						// If the fruit message is set, use it. Otherwise default to the water message
						const fruitMessage = interaction.options.getString('fruitmessage') ? interaction.options.getString('fruitmessage') : interaction.options.getString('watermessage');
						const reminderChannel = interaction.options.getChannel('pingchannel');
						// Create a new GuildInfo object
						let guildInfo = new GuildInfo()
							.setId(interaction.guildId)
							// Set the reminder configuration
							.setReminders(waterMessage, fruitMessage, reminderChannel.id, watchChannel.id, true);
						// Update the guildInfos Collection
						interaction.client.guildInfos.set(interaction.guildId, guildInfo);
						// Build a query to update the database
						let query = guildInfo.queryBuilder("setReminders");
						// Run the query
						await dbfn.setGuildInfo(query);
						// Refresh the collection
						await fn.collectionBuilders.guildInfos(interaction.client);
						// Create a messageCollector on the watch channel
						fn.collectors.create(interaction.client, guildInfo);
						// Compose a reply
						const reply = [
							`I'll watch <#${watchChannel.id}> for Grow A Tree Notifications and relay them to <#${reminderChannel.id}>.`,
							`Water Message: ${waterMessage}`,
							`Fruit Message: ${fruitMessage}`
						].join("\n");
						// Send the reply
						await interaction.editReply(reply).catch(e => console.error(e));
					}
					break;
				case "update": // Update the relay configuration piecemeal
					if (interaction.client.guildInfos.has(interaction.guildId)) {
						let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
						
						// Get all possible options from the interaction
						const inWatchChannel = interaction.options.getChannel('watchchannel');
						const inWaterMessage = interaction.options.getString('watermessage');
						const inFruitMessage = interaction.options.getString('fruitmessage');
						const inReminderChannel = interaction.options.getChannel('pingchannel');
						const inEnabled = interaction.options.getBoolean('enabled');
						
						// Check if each option is set, if it is, use it. Otherwise use what was already set
						const outWatchChannelId = inWatchChannel ? inWatchChannel.id : guildInfo.watchChannelId;
						const outWaterMessage = inWaterMessage ? inWaterMessage : guildInfo.waterMessage;
						const outFruitMessage = inFruitMessage ? inFruitMessage : guildInfo.fruitMessage;
						const outReminderChannelId = inReminderChannel ? inReminderChannel.id : guildInfo.reminderChannelId;
						const outEnabled = inEnabled === undefined ? guildInfo.notificationsEnabled : inEnabled;
						
						// Update the relay configuration
						guildInfo.setReminders(outWaterMessage, outFruitMessage, outReminderChannelId, outWatchChannelId, outEnabled);
						// Update the guildInfos Collection
						interaction.client.guildInfos.set(interaction.guildId, guildInfo);
						// Build a query to update the database
						let query = guildInfo.queryBuilder("setReminders");
						// Run the query
						await dbfn.setGuildInfo(query);
						// Refresh the collection
						await fn.collectionBuilders.guildInfos(interaction.client);
						// Create a messageCollector on the watch channel
						fn.collectors.create(interaction.client, guildInfo);
						// Compose a reply
						const reply = [
							`I'll watch <#${outWatchChannelId}> for Grow A Tree Notifications and relay them to <#${outReminderChannelId}>.`,
							`Water Message: ${outWaterMessage}`,
							`Fruit Message: ${outFruitMessage}`
						].join("\n");
						// Send the reply
						await interaction.editReply(reply).catch(e => console.error(e));
					} else {
						await interaction.editReply(fn.builders.errorEmbed("There is no existing notification relay to update!")).catch(e => console.error(e));
					}
					break;
				case 'disable': // Disable the relay
					if (interaction.client.guildInfos.has(interaction.guildId)) {
						let guildInfo = interaction.client.guildInfos.get(interaction.guildId);
						// Update the relay config with all undefined except for `enabled` which is false
						guildInfo.setReminders(undefined, undefined, undefined, undefined, false);
						// Update the guildInfos Collection
						interaction.client.guildInfos.set(interaction.guildId, guildInfo);
						// Update the database
						await dbfn.setGuildInfo(guildInfo.queryBuilder("setReminders")).catch(e => console.error(e));
						// Refresh the collection
						await fn.collectionBuilders.guildInfos(interaction.client);
						// Close the collector
						await fn.collectors.end(interaction.client, guildInfo).catch(e => console.error(e));
						// Reply confirming disabling of relay
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