"use strict";

const express = require('express');
const pg = require('pg');
const moment = require('moment');
const marked = require('marked');
const shortid = require('shortid');
const router = express.Router();

// Because node-postgres is FUCKING STUPID when working with timestamps!!!
const TIMESTAMPTZ_OID = 1184;
const TIMESTAMP_OID = 1114;
const parseFn = (val) => {
   return val === null ? null : moment(val);
};
pg.types.setTypeParser(TIMESTAMPTZ_OID, parseFn);
pg.types.setTypeParser(TIMESTAMP_OID, parseFn);

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

router.get('/:timestamp', (req, res, next) => {
    pg.connect(req.app.get('pg-connection'), (err, client, done) => {
        if (!!err) {
            done();
            console.log(err);
            return next(new Error(err));
        }
        client.query({
            text: 'SELECT * FROM messages WHERE (timestamp) < to_timestamp($1)::TIMESTAMP ORDER BY timestamp DESC LIMIT 30',
            name: 'select-messages-before-' + req.timestamp + '-' + shortid.generate(),
            values: [
                req.timestamp
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
                    after: last.timestamp.unix(),
                    messages: out
                });
            });
        });
    });
});

module.exports = router;
