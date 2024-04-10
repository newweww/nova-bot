const { Client } = require('discord.js');
const { CommandKit } = require('commandkit');
const autoRole = require('./events/guildMemberAdd/autoRole')
const mongoose = require('mongoose');
require('dotenv/config'); 

const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'],
});

new CommandKit({
    client,
    commandsPath: `${__dirname}/commands`,
    eventsPath: `${__dirname}/events`,
    bulkRegister: true,
});

client.on('guildMemberAdd', async (member) => {
    try {
        await autoRole(client, member);
    } catch (error) {
        console.error('Error in guildMemberAdd event:', error);
    }
});

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('connected to database')

    client.login(process.env.TOKEN);
})