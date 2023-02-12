const GuildInfo = class {
    constructor() {
        this.guildId = "";
        this.treeName = "";
        this.treeHeight = 0;
        this.treeMessageId = "";
        this.treeChannelId = "";
        this.leaderboardMessageId = "";
        this.leaderboardChannelId = "";
        this.waterMessage = "";
        this.fruitMessage = "";
        this.reminderChannelId = "";
        this.watchChannelId = "";
    }

    setId(id) {
        this.guildId = id;
        return this;
    }
    setName(name) {
        this.treeName = name;
        return this;
    }
    setHeight(height) {
        this.treeHeight = height;
        return this;
    }
    setTreeMessage(messageId, channelId) {
        this.treeMessageId = messageId;
        this.treeChannelId = channelId;
        return this;
    }
    setLeaderboardMessage(messageId, channelId) {
        this.leaderboardMessageId = messageId;
        this.leaderboardChannelId = channelId;
        return this;
    }
    setReminders(waterMessage, fruitMessage, reminderChannelId, watchChannelId) {
        this.waterMessage = waterMessage;
        this.fruitMessage = fruitMessage;
        this.reminderChannelId = reminderChannelId;
        this.watchChannelId = watchChannelId;
        return this;
    }
    queryBuilder(query) {
        let queryParts = [];
        switch (query) {
            case "setAll":
                queryParts = [
                    `INSERT INTO guild_info `,
                    `(guild_id, `,
                    `tree_name, `,
                    `tree_height, `,
                    `tree_message_id, `,
                    `tree_channel_id, `,
                    `leaderboard_message_id, `,
                    `leaderboard_channel_id, `,
                    `water_message, `,
                    `fruit_message, `,
                    `reminder_channel_id, `,
                    `watch_channel_id) `,
                    `VALUES (${db.escape(this.guildId)}, `,
                    `${db.escape(this.treeName)}, `,
                    `${db.escape(this.treeHeight)}, `,
                    `${db.escape(this.treeMessageId)}, `,
                    `${db.escape(this.treeChannelId)}, `,
                    `${db.escape(this.leaderboardMessageId)}, `,
                    `${db.escape(this.leaderboardChannelId)}, `,
                    `${db.escape(this.waterMessage)}, `,
                    `${db.escape(this.fruitMessage)}, `,
                    `${db.escape(this.reminderChannelId)}, `,
                    `${db.escape(this.watchChannelId)}) `,
                    `ON DUPLICATE KEY UPDATE tree_name = ${db.escape(this.treeName)}, `,
                    `tree_height = ${db.escape(this.treeHeight)}, `,
                    `tree_message_id = ${db.escape(this.treeMessageId)}, `,
                    `tree_channel_id = ${db.escape(this.treeChannelId)}, `,
                    `leaderboard_message_id = ${db.escape(this.leaderboardMessageId)}, `,
                    `leaderboard_channel_id = ${db.escape(this.leaderboardChannelId)}, `,
                    `water_message = ${db.escape(this.waterMessage)}, `,
                    `fruit_message = ${db.escape(this.fruitMessage)}, `,
                    `reminder_channel_id = ${db.escape(this.reminderChannelId)}, `,
                    `watch_channel_id = ${db.escape(this.watchChannelId)})`
                ];
                return queryParts.join();
                break;
            case "setReminders":
                queryParts = [
                    `UPDATE guildInfo SET water_message = ${db.escape(this.waterMessage)}, `,
                    `fruit_message = ${db.escape(this.fruitMessage)}, `,
                    `reminder_channel_id = ${db.escape(this.reminderChannelId)}, `,
                    `watch_channel_id = ${db.escape(this.watchChannelId)} `,
                    `WHERE guild_id = ${db.escape(this.guildId)}`
                ];
                return queryParts.join();
                break;
            case "setTreeMessage":
                queryParts = [
                    `UPDATE guildInfo SET tree_message_id = ${db.escape(this.treeMessageId)}, `,
                    `tree_channel_id = ${db.escape(this.treeChannelId)}, `,
                    `WHERE guild_id = ${db.escape(this.guildId)}`
                ];
                return queryParts.join();
                break;
            case "setLeaderboardMessage":
                queryParts = [
                    `UPDATE guildInfo SET leaderboard_message_id = ${db.escape(this.leaderboardMessageId)}, `,
                    `leaderboard_channel_id = ${db.escape(this.leaderboardChannelId)}, `,
                    `WHERE guild_id = ${db.escape(this.guildId)}`
                ];
                return queryParts.join();
                break;
            default:
                break;
        }
    }
}

new GuildInfo()
    .setId(row.guild_id)
    .setName(row.tree_name)
    .setHeight(row.tree_height)
    .setTreeMessage(row.tree_message_id, row.tree_channel_id)
    .setLeaderboardMessage(row.leaderboard_message_id, row.leaderboard_channel_id)
    .setReminders(row.water_message, row.fruit_message, row.reminder_channel_id);