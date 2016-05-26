"use strict";

const SQL = require('sql-template-strings');

var Discord = require("discord.js");
var pg = require('pg');
var cli = require('./cli');

var connectionString = "postgres://lurkdis:password@localhost/lurkdis";

var discord = new Discord.Client({
    autoReconnect: true,
    maxCachedMessages: 5
});

pg.connect(connectionString, (err, client, done) => {
    client.query('CREATE TABLE IF NOT EXISTS messages (' +
                 '  id varchar(64) NOT NULL,' +
                 '  content text NOT NULL,' +
                 '  author text NOT NULL,' +
                 '  authorid varchar(64) NOT NULL,' +
                 '  avatar text,' +
                 '  channel text NOT NULL,' +
                 '  channelid varchar(64) NOT NULL,' +
                 '  attachments text NOT NULL,' +
                 '  timestamp timestamp NOT NULL,' +
                 '  PRIMARY KEY (id)' +
                 ')',
    (err, result) => {
        done();
    });
});

function log(message) {
    let roles = message.channel.server.rolesOf(message.author);
    // Is the role hoisted? Probably a CIG staff member.
    if (!roles.some(v => v.hoist)) return;

    pg.connect(connectionString, (err, client, done) => {
        if (!!err) {
            console.error(err);
            return;
        }
        client.query({
            text: 'INSERT INTO messages (id, content, avatar, author, authorid, channel, channelid, attachments, timestamp) ' +
                  'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, to_timestamp($9)) ON CONFLICT (id) DO UPDATE SET content = $2',
            name: 'upsert-message',
            values: [
                message.id,
                message.cleanContent,
                message.author.avatar,
                message.author.name,
                message.author.id,
                message.channel.name,
                message.channel.id,
                message.attachments,
                message.timestamp / 1000
            ]
        }, (err, result) => {
            if (!!err) {
                console.error(err);
                return;
            }
            done();
        });
    });
    console.log(message.timestamp, message.author.name, message.author.id, message.id, message.cleanContent, JSON.stringify(message.attachments));
}

discord.on('message', log);
discord.on('messageUpdated', (old, updated) =>{
    log(updated);
});

discord.fetch_history = (channel, before, iter) =>{
    // Normally an ID. Hoorah loose typing
    before = before || false;
    iter = iter || 0;
    iter++;

    console.log(`Fetching "${channel.name}" ${iter}`);
    // Ain't ES6 nice?
    discord.getChannelLogs(channel, 100, {before: before}, (err, messages) =>{
        for (let i = 0; i < messages.length; i++) {
            before = messages[i];
            log(before);
        }
        if (messages.length >= 1) discord.fetch_history(channel, before, iter);
    });
};

discord.on('ready', () => {
    console.log('Ready.');
    cli.setupRepl(discord);
});

discord.login("email", "password");
console.log('Logging in...');
