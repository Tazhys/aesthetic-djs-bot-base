require('dotenv').config();

// loads .env into cache

const { Client, GatewayIntentBits } = require('discord.js');
const { loadEvents, loadCommands } = require('./loaders');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

loadCommands(client);
loadEvents(client);

client.login(process.env.TOKEN).then(() => {
    console.log("ready . . .");
})