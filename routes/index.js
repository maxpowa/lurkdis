"use strict";

const express = require('express');
const pg = require('pg');
const moment = require('moment');
const marked = require('marked');
const router = express.Router();

router.get('/', (req, res, next) => {
    pg.connect(req.app.get('pg-connection'), (err, client, done) => {
        client.query({
            text: 'SELECT * FROM messages ORDER BY timestamp DESC LIMIT 15',
            name: 'select-messages'
        },
        (err, result) => {
            done();
            if (!!err) {
                console.log(err);
                return next(new Error(err));
            }
            let first = result.rows[0];
            let last = result.rows[result.rowCount - 1];
            res.render('index', {
                title: 'Lurkdis 2.0',
                messages: result.rows,
                moment: moment,
                marked: marked,
                first: first,
                last: last
            });
        });
    });
});

router.param('id', (req, res, next, id) => {
    pg.connect(req.app.get('pg-connection'), (err, client, done) => {
        client.query({
            text: 'SELECT * FROM messages WHERE id = $1 ORDER BY timestamp DESC LIMIT 3',
            name: 'select-messages-' + req.id,
            values: [
                id
            ]
        },
        (err, result) => {
            done();
            if (!!err) {
                console.log(err);
                return next(new Error(err));
            }
            req.messages = result.rows;
            next();
        });
    });
});

router.get('/m/:id', (req, res, next) => {
    let last = null;
    res.format({
        html: () => {
            res.render('index', {
                title: 'Lurkdis 2.0',
                messages: req.messages,
                moment: moment,
                marked: marked,
                last: last
            });
        },
        json: () => {
            res.json({
                last: last,
                after: last.timestamp.getTime(),
                messages: req.messages
            });
        }
    });
});

router.param('timestamp', (req, res, next, timestamp) => {
    let isInt = (n) => {
        return n % 1 === 0;
    };

    if (!isNaN(timestamp)) {
        let val = parseInt(timestamp, 10);
        if (isInt(val)) {
            req.timestamp = val;
            return next();
        }
    }

    next(new Error('Invalid timestamp passed!'));
});

router.get('/before/:timestamp', (req, res, next) => {
    pg.connect(req.app.get('pg-connection'), (err, client, done) => {
        client.query({
            text: 'SELECT * FROM messages WHERE (timestamp) < to_timestamp($1) ORDER BY timestamp DESC LIMIT 15',
            name: 'select-messages-before-' + req.timestamp,
            values: [
                req.timestamp / 1000
            ]
        },
        (err, result) => {
            done();
            if (!!err) {
                console.log(err);
                return next(new Error(err));
            }
            if (result.rowCount < 1) {
                return res.status(400).json({
                    error: 'too few rows returned (probably invalid timestamp)'
                });
            }
            let last = result.rows[result.rowCount - 1];

            res.render('includes/messages', {
                title: 'Lurkdis 2.0',
                messages: result.rows,
                moment: moment,
                marked: marked,
                last: last
            }, (err, out) => {
                res.json({
                    last: last,
                    after: last.timestamp.getTime(),
                    messages: out
                });
            });
        });
    });
});

module.exports = router;
