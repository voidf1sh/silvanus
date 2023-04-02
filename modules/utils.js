/* eslint-disable no-case-declarations */
/* eslint-disable indent */
// dotenv for handling environment variables
const dotenv = require('dotenv');
dotenv.config();
const token = process.env.TOKEN;

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
	console.log('Ready!');
    const count = JSON.stringify(client.guilds.cache.size);
    console.log("I'm currently in " + count + " servers.");
    const guilds = client.guilds.cache;
    guilds.each(g => {
        console.log(g.name);
    });
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
    await fn.sleep(500).then(async () =>{
        await watchRequestRates();
    });
}