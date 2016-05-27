"use strict";

const express = require('express');
const pg = require('pg');
const Autolinker = require('autolinker');
const moment = require('moment');
const router = express.Router();

router.get('/', (req, res, next) => {
    let limit = 30;
    if (req.query.limit && !isNaN(req.query.limit)) {
        limit = parseInt(req.query.limit, 10);
        if (limit >= 100) limit = 100;
        if (limit <= 10) limit = 10;
    }
    let before = false;
    if (req.query.before && !isNaN(req.query.before)) {
        before = parseInt(req.query.before, 10);
    }

    pg.connect(req.app.get('pg-connection'), (err, client, done) => {
        let query = {
            text: 'SELECT * FROM messages ORDER BY timestamp DESC LIMIT $1',
            name: 'select-messages',
            values: [
                limit
            ]
        };
        if (before) {
            query = {
                text: 'SELECT * FROM messages WHERE (timestamp) < to_timestamp($1) ORDER BY timestamp DESC LIMIT $2',
                name: 'select-messages-before',
                values: [
                    before / 1000,
                    limit
                ]
            };
        }
        client.query(query,
        (err, result) => {
            done();
            let first = result.rows[0];
            let last = result.rows[result.rowCount-1];
            res.format({
                text: () => {
                    // Plaintext formatted
                },
                html: () => {
                    res.render('index', {
                        messages: result.rows,
                        autolinker: new Autolinker({
                            newWindow: true,
                            stripPrefix: true,
                            truncate: {
                                length: 48,
                                location: 'smart'
                            },
                            twitter: false
                        }),
                        moment: moment,
                        first: first,
                        last: last
                    });
                },
                json: () => {
                    res.json(result.rows);
                }
            });
        });
    });
});

module.exports = router;
