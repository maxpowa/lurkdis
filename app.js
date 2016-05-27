"use strict";

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const repl = require('repl');
const prettyms = require('pretty-ms');

const Discord = require("discord.js");
const pg = require('pg');

const routes = require('./routes/index');
const feed = require('./routes/feed');

const connectionString = "postgres://lurkdis:password@localhost/lurkdis";

// messages table creation
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

// Discord client creation
const discord = new Discord.Client({
    autoReconnect: true,
    maxCachedMessages: 5
});

const log_message = (message) => {
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
                  'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, to_timestamp($9)) ON CONFLICT (id) DO UPDATE SET content = $2, attachments = $8',
            name: 'upsert-message',
            values: [
                message.id,
                message.cleanContent,
                message.author.avatar,
                message.author.name,
                message.author.id,
                message.channel.name,
                message.channel.id,
                JSON.stringify(Array.from(message.attachments)),
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
};

discord.on('message', log_message);
discord.on('messageUpdated', (old, updated) =>{
    log_message(updated);
});

discord.on('ready', () => {
    console.log('Listening for messages.');
    let replServer = repl.start("lurk> ");

    replServer.context.discord = discord;
    replServer.defineCommand('game', {
        help: 'Set the current game',
        action: (game) => {
            discord.setPlayingGame(game);
            replServer.displayPrompt();
        }
    });
    replServer.defineCommand('uptime', {
        help: 'Show uptime',
        action: () => {
            console.log('Uptime: ' + prettyms(discord.uptime));
            replServer.displayPrompt();
        }
    });
    replServer.defineCommand('fetch_history', {
        help: 'Get historic messages from active channels',
        action: (iters) => {
            iters = iters || Number.MAX_VALUE;
            if (!isNaN(iters)) iters = parseInt(iters, 10);
            //console.log(iters);

            let fetch_history = (channel, max_iter, before, iter) =>{
                // Normally an ID. Hoorah loose typing
                before = before || false;
                iter = iter || 0;
                max_iter = max_iter || Number.MAX_VALUE;
                iter++;

                if (iter > max_iter) return;

                console.log(`Fetching "${channel.name}" ${iter}`);
                // Ain't ES6 nice?
                discord.getChannelLogs(channel, 100, {before: before}, (err, messages) =>{
                    for (let i = 0; i < messages.length; i++) {
                        before = messages[i];
                        log_message(before);
                    }
                    if (messages.length >= 1) fetch_history(channel, max_iter, before, iter);
                });
            };

            discord.servers.forEach((server) => {
                server.channels.forEach((channel) => {
                    if (channel.type !== "text") return;
                    fetch_history(channel, iters);
                });
            });
            replServer.displayPrompt();
        }
    });

    replServer.on("exit", () => {
        discord.logout(() => {
            console.log('Logged out');
            process.exit();
        });
    });
});

discord.login('email', 'password');
console.log('Logging in & starting webserver');

const app = express();

app.set('pg-connection', connectionString);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/feed.atom', feed);
app.use('/feed', feed);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
