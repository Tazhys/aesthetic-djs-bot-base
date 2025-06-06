const Command = require('../class/Command');

module.exports = new Command({
    name: 'ping',
    triggers: ['p', 'pong'],
}, async function (message) {
    const start = Date.now();
    const sentMessage = await message.channel.send('Pinging...');

    const latency = Date.now() - start;
    const apiLatency = Math.round(message.client.ws.ping);

    await sentMessage.edit(`🏓 Pong! Latency: ${latency}ms. API Latency: ${apiLatency}ms.`);
});