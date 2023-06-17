/* eslint-disable no-case-declarations */
/* eslint-disable indent */
// dotenv for handling environment variables
const dotenv = require('dotenv');
dotenv.config();
const token = process.env.TOKEN;
const dbfn = require('./dbfn.js');

// Discord.JS
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.Message
    ],
});

// Various imports
const fn = require('../modules/functions.js');

client.once('ready', async () => {
    // watchRequestRates();
    await fn.collectionBuilders.guildInfos(client);
    const guilds = client.guilds.cache;
    console.log("I'm in " + guilds.size + " guilds with " + client.guildInfos.size + " guildInfos");
    // guilds.each(g => {
    //     console.log(g.name + "," + g.id + "," + g.ownerId);
    // });
    await setAllGuildOwners();
    process.exit();
});

client.login(token);


async function watchRequestRates() {
    const axios = require('axios');

    // Make a GET request to the Discord API
    await axios.get('https://discord.com/api/v10/users/@me', {
        headers: {
            'Authorization': `Bot ${token}`
        }
    }).then(response => {
        // Get the rate limit headers
        const remaining = response.headers['x-ratelimit-remaining'];
        const reset = response.headers['x-ratelimit-reset'];

        // Log the rate limit headers
        console.log(`Remaining requests: ${remaining}`);
        console.log(`Reset time (Unix epoch seconds): ${reset}`);
    }).catch(error => {
        console.error(error);
    });
    await fn.sleep(500).then(async () => {
        await watchRequestRates();
    });
}

async function setAllGuildOwners() {
    try {
        let guildInfosArray = new Array();
        let guildUpdateCount = 0;
        let guildMissingCount = 0;
        client.guildInfos.forEach((guildInfo) => {
            guildInfosArray.push(guildInfo);
        });
        // console.log(guildInfosArray);
        for (let i = 0; i < guildInfosArray.length; i++) {
            const guildInfo = guildInfosArray[i];
            let eFlag = 0;
            const guild = await client.guilds.fetch(guildInfo.guildId).catch(e => {
                eFlag = 1;
                if (e.status === 404) {
                    console.log("Missing guild: " + guildInfo.guildId);
                    guildMissingCount++;
                } else {
                    throw e;
                }
            });
            if (eFlag === 1) continue;
            guildInfo.setIds(guildInfo.guildId, guild.ownerId);
            const query = guildInfo.queryBuilder("setIds");
            console.log(query);
            await dbfn.setGuildInfo(query);
            guildUpdateCount++;
        }
        console.log(`Updated ${guildUpdateCount} guilds with ${guildMissingCount} missing guilds.`);
    } catch(err) {
        console.error(err);
    }
}