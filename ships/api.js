// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const ship = 'Ship';
const slip = 'Slip';

function getModel () {
    return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

function sortObject(entities) {
    var sorted = {},
        key, a = [];

    for (key in entities) {
        if (entities.hasOwnProperty(key)) {
            a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = entities[a[key]];
    }
    return sorted;
}

function sorting(o) {
    var a = [], i;
    for(i in o) {
        if(o.hasOwnProperty(i)) {
            a.push([i, o[i]]);
        }
    }
    a.sort(function(a,b){return a[0]>b[0]?1:-1; })
        return a;
}











const router = express.Router();

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * GET /api/ships
 *
 * Retrieve a page of ships (up to ten at a time).
 */
router.get('/', (req, res, next) => {
    getModel().list(3, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        //    console.log(entities[0].name);

        //  var sort = sortObject(entities);
//        var sort = sorting(entities);
        JSON.stringify(entities);
//        console.log(req.query.cursor);
        if(cursor) {
            cursor=encodeURIComponent(cursor);
//        cursor = cursor.slice(0, -1);
        //console.log(cursor2);
        console.log(req.get("host"));
        console.log(req.baseUrl);
        console.log("yeah you already know!!");
        var next = "?pageToken=";
      //  console.log(req.get("host"));
 //       console.log(entities[1].endCursor);
        cursor = req.protocol + "://"+req.get("host") + req.baseUrl + next + cursor;
        }
        res.json({
            items: entities,
            nextPageToken: cursor
        });
    });
});

/**
 * POST /api/ships
 *
 * Create a new ship.
 */
router.post('/', (req, res, next) => {
    let name = req.body.name;
    let type = req.body.type;
    let length = req.body.length;
    const new_ship = {"name": req.body.name, "type": req.body.type, "length": req.body.length};
    new_ship.cargo= [];
    for(var x=0;x<5;x++) {
        new_ship.cargo.push(x);
    }
    console.log(new_ship);
    //  console.log(req.body.length);
    if (!name || !type || !length) {
        return res.status(400).end('request must include name type and length');
    }


    getModel().create(new_ship, (err, entity) => {
        if (err) {
            next(err);
            return;
        }
        entity.location = {"status":"out to sea"};
        res.json(entity);
    });
});
/**
 * GET /api/ships/:id
 *
 * Retrieve a ship.
 */
router.get('/:ship', (req, res, next) => {
    getModel().read(req.params.ship, (err, entity) => {
        if (err) {
            next(err);
            return;
        }
        res.json(entity);
    });
});

/**
 * PUT /api/ships/:id
 *
 * Update a ship.
 */
router.put('/:ship', (req, res, next) => {
    let name = req.body.name;
    let type = req.body.type;
    let length = req.body.length;
    const new_ship = {"name": req.body.name, "type": req.body.type, "length": req.body.length};
    console.log(new_ship);
      console.log(req.body.name);
      console.log(req.body.length);
      console.log(req.body.type);
    if (!name || !type || !length) {
        return res.status(400).end('put request must include name type and length');
    }

    getModel().update(req.params.ship, new_ship, (err, entity) => {
        if (err) {
            next(err);
            return;
        }
        res.json(entity);
    });
});

/**
 * DELETE /api/ships/:id
 *
 * Delete a ship.
 */
router.delete('/:ship', (req, res, next) => {
    getModel().delete(req.params.ship, (err) => {
        if (err) {
            next(err);
            return;
        }
        getModel().listing(req.params.ship, slip, 10, req.query.pageToken, (err, entities, cursor) => {
            if (err) {
                next(err);
                return;
            }
            console.log(Object.keys(entities).length) ;
            if(Object.keys(entities).length!=0) {
                var testing = (JSON.stringify(entities));
                var obj = JSON.parse(testing);
                console.log(obj[0].current_boat);
                console.log(obj[0].id);
                const new_slip = {"number": obj[0].number, "arrival_date": null, "current_boat": null};
                getModel().updates(slip, obj[0].id, new_slip, (err, entity) => {
                    if (err) {
                        next (err);
                        return ;
                    }

                });

                }
                res.status(200).send('OK');
                });
    });
});

/**
 * Errors on "/api/ships/*" routes.
 */
router.use((err, req, res, next) => {
    // Format error and forward to generic error handler for logging and
    // responding to the request
    err.response = {
        message: err.message,
    internalCode: err.code
    };
    next(err);
});

module.exports = router;
