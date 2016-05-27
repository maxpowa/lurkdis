"use strict";

const express = require('express');
const pg = require('pg');
const Feed = require('feed');
const router = express.Router();

router.get('/', (req, res, next) => {
    pg.connect(req.app.get('pg-connection'), (err, client, done) => {
        let query = {
            text: 'SELECT * FROM messages ORDER BY timestamp DESC LIMIT 30',
            name: 'select-messages'
        };
        client.query(query,
        (err, result) => {
            done();
            if (!!err) {
                console.log(err);
                return next(new Error(err));
            }
            let first = result.rows[0];
            //let last = result.rows[result.rowCount-1];
            var feed = new Feed({
                title: 'Lurkdis 2.0',
                description: "Lurkin' CIG messages since 2015",
                // Something that looks like a fucking tag URI.
                id: 'tag:lurkdis.maxpowa.us,' + new Date().toISOString() + ':lurkdis',
                link: 'https://lurkdis.maxpowa.us/',
                updated: first.timestamp
            });
            for (let message of result.rows) {
                feed.addItem({
                    title: message.author + ' in #' + message.channel,
                    link: 'https://lurkdis.maxpowa.us/m/' + message.id,
                    description: message.content,
                    date: message.timestamp
                });
            }
            res.header('Content-Type', 'application/rss+xml');
            if (req.originalUrl.endsWith('.atom')) {
                res.send(feed.render('atom-1.0'));
            } else {
                res.send(feed.render('rss-2.0'));
            }
        });
    });
});

module.exports = router;
