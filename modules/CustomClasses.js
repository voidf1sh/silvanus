const mysql = require('mysql');
const db = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME,
    port: process.env.DBPORT
});

module.exports = {
    GuildInfo: class {
        constructor() {
            this.guildId = "";
            this.treeName = "";
            this.treeHeight = 0;
            this.treeMessageId = "";
            this.treeChannelId = "";
            this.leaderboardMessageId = "";
            this.leaderboardChannelId = "";
            this.waterMessage = "";
            this.waterRoleId = "";
            this.fruitMessage = "";
            this.fruitRoleId = "";
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
        setRoles(waterRoleId, fruitRoleId) {
            this.waterRoleId = waterRoleId;
            if (fruitRoleId) this.fruitRoleId = fruitRoleId;
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
                    return queryParts.join('');
                    break;
                case "setReminders":
                    queryParts = [
                        `INSERT INTO guild_info (guild_id, water_message, fruit_message, reminder_channel_id, watch_channel_id) VALUES (`,
                        `${db.escape(this.guildId)},`,
                        `${db.escape(this.waterMessage)},`,
                        `${db.escape(this.fruitMessage)},`,
                        `${db.escape(this.reminderChannelId)},`,
                        `${db.escape(this.watchChannelId)}`,
                        `) ON DUPLICATE KEY UPDATE water_message = ${db.escape(this.waterMessage)}, `,
                        `fruit_message = ${db.escape(this.fruitMessage)}, `,
                        `reminder_channel_id = ${db.escape(this.reminderChannelId)}, `,
                        `watch_channel_id = ${db.escape(this.watchChannelId)}`
                    ];
                    return queryParts.join('');
                    break;
                case "setTreeMessage":
                    queryParts = [
                        `UPDATE guild_info SET tree_message_id = ${db.escape(this.treeMessageId)}, `,
                        `tree_channel_id = ${db.escape(this.treeChannelId)}, `,
                        `WHERE guild_id = ${db.escape(this.guildId)}`
                    ];
                    return queryParts.join('');
                    break;
                case "setLeaderboardMessage":
                    queryParts = [
                        `UPDATE guild_info SET leaderboard_message_id = ${db.escape(this.leaderboardMessageId)}, `,
                        `leaderboard_channel_id = ${db.escape(this.leaderboardChannelId)}, `,
                        `WHERE guild_id = ${db.escape(this.guildId)}`
                    ];
                    return queryParts.join('');
                    break;
                case "setRoles":
                    if (this.fruitRoleId != "") {
                        queryParts = [
                            `INSERT INTO guild_info (`,
                            `guild_id, water_role_id, fruit_role_id`,
                            `) VALUES (`,
                            `${db.escape(this.guildId)}, ${db.escape(this.waterRoleId)}, ${db.escape(this.fruitRoleId)}`,
                            `) ON DUPLICATE KEY UPDATE water_role_id = ${db.escape(this.waterRoleId)}, `,
                            `fruit_role_id = ${db.escape(this.fruitRoleId)}`
                        ];
                    } else {
                        queryParts = [
                            `UPDATE guild_info SET water_role_id = ${db.escape(this.waterRoleId)} `,
                            `WHERE guild_id = ${db.escape(this.guildId)}`
                        ];
                    }
                    return queryParts.join('');
                    break;
                    default:
                    break;
            }
        }
        generateSetupInfo() {
            let setupInfoParts = [
                `Here is your server's configuration:`,
                `Tree Name: ${this.treeName}`,
                `Tree Height: ${this.treeHeight}`,
                `Tree Channel: <#${this.treeChannelId}>`,
                `[Tree Link](https://discord.com/channels/${this.guildId}/${this.treeChannelId}/${this.treeMessageId})`,
                `Leaderboard Channel: <#${this.leaderboardChannelId}>`,
                `[Leaderboard Link](https://discord.com/channels/${this.guildId}/${this.leaderboardChannelId}/${this.leaderboardMessageId})`,
                `Notification Watch Channel: <#${this.watchChannelId}>`,
                `Notification Relay Channel: <#${this.reminderChannelId}>`,
                `Water Message: ${this.waterMessage}`,
                `Fruit Message: ${this.fruitMessage}`,
                `Water Role: <@&${this.waterRoleId}>`,
                `Fruit Role: <@&${this.fruitRoleId}>`
            ]
            return setupInfoParts.join('\n');
        }
    }
}