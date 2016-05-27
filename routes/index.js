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

router.get('/', (req, res, next) => {
    pg.connect(req.app.get('pg-connection'), (err, client, done) => {
        if (!!err) {
            done();
            console.log(err);
            return next(new Error(err));
        }
        client.query({
            text: 'SELECT * FROM messages ORDER BY timestamp DESC LIMIT 30',
            name: 'select-messages-' + shortid.generate()
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

module.exports = router;
