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
   return val === null ? null : moment.utc(val);
};
pg.types.setTypeParser(TIMESTAMPTZ_OID, parseFn);
pg.types.setTypeParser(TIMESTAMP_OID, parseFn);

router.param('id', (req, res, next, id) => {
    pg.connect(req.app.get('pg-connection'), (err, client, done) => {
        if (!!err) {
            done();
            console.log(err);
            return next(new Error(err));
        }
        client.query({
            text: 'SELECT * FROM messages WHERE id = $1 ORDER BY timestamp DESC LIMIT 3',
            name: 'select-messages-' + req.id + '-' + shortid.generate(),
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

router.get('/:id', (req, res, next) => {
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
                after: last.timestamp.unix(),
                messages: req.messages
            });
        }
    });
});

module.exports = router;
