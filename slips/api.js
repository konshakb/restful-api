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

function getModel () {
    return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();
var slip = "Slip";
var ship = "Ship";
var ships;


function isValidDate(dateString)
{
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var month = parseInt(parts[1], 10);
    var day = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12){
        console.log("wrong right off");
        return false;
    }

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};



//const shipQuery = ds.createQuery('Ship');

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * GET /api/slips
 *
 * Retrieve a page of slips (up to ten at a time).
 */
router.get('/', (req, res, next) => {
    //  const ship =getModel().shipQuery(kind);
    //  removed the => and replaced with async and it worked.
    getModel().list(slip,10, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        ships=entities;
        console.log(entities);
        JSON.stringify(entities);

        res.json({
            items: entities,
            nextPageToken: cursor
        });
        /*
           getModel().list(slip,10, req.query.pageToken, (err, entities, cursor) => {
           console.log(entities);
           getModel().list(slip,10, req.query.pageToken, (err, entities, cursor) => {
           console.log(entities);
           });
           });*/
    });
});

/**
 * POST /api/slips
 *
 * Create a new slip.
 */
router.post('/', (req, res, next) => {
    let number=req.body.number;
    //let arrival_date=req.body.arrival;
    const new_slip = {"number": req.body.number, "arrival_date": null, "current_boat": null}
    if (!number || isNaN(number) ) {
        return res.status(400).end("request must include number");
    }
    else {
        getModel().lists(number, slip,10, req.query.pageToken, (err, entities, cursor) => {
            if (err) {
                next(err);
                return;
            }
            console.log(Object.keys(entities));
            if(Object.keys(entities).length===0){

                //current_boat
                //    console.log("here in the " + req.body);
                getModel().create(slip, new_slip, (err, entity) => {
                    if (err) {
                        next(err);
                        return;
                    }
                    res.json(entity);
                });
            }
            else
            return res.status(400).end("Slip number already created");
        });
    }
});
/*router.post('/', (req, res, next) => {
  let number=req.body.number;
  let arrival_date=req.body.arrival;
  const new_slip = {"number": req.body.number, "arrival_date": null, "current_boat": null}
//    var parsed = JSON.parse(new_slip);
//    console.log(number);
//   var parsed=parseInt(number, 10);
//   console.log(isNaN(parsed));
if (!number || isNaN(number) ) {
return res.status(400).end("request must include number");
}

//current_boat
//    console.log("here in the " + req.body);
getModel().create(slip, new_slip, (err, entity) => {
if (err) {
next(err);
return;
}
res.json(entity);
});
});*/
/**
 * GET /api/slips/:id
 *
 * Retrieve a slip.
 */
router.get('/:slip', (req, res, next) => {

    getModel().read(slip, req.params.slip, (err, entity) => {
        if (err) {
            next(err);
            return;
        }
        // var obj = JSON.parse(entity);
        // console.log(obj);
        var testing = (JSON.stringify(entity));
        var obj = JSON.parse(testing);
        // console.log(data.date)
        console.log(obj.number);//number of the ship
        if(obj.arrival_date===null&&obj.current_boat==null)
        console.log("looks like we can proceed");
    var url = "https://my-project-bookstore.appspot.com/api/ships/"+obj.current_boat;
    if(obj.current_boat)
        entity.url = {"url":url};
    res.json(entity);
    });
});
router.put('/:slip/ship/:ship', (req, res, next) => {
    console.log(req.params.slip);
    console.log(req.params.ship);
    let date = req.body.arrival_date
    console.log(date);
    console.log(isValidDate(date));
    if(isValidDate(date))
    console.log('Valid date');
    else return res.status(403).end("Invalid date:  DD/MM/YYYY");
    //isValidDate(dateString)
    getModel().read(slip, req.params.slip, (err, entity) => {
        if (err) {
            next(err);
            return;
        }
        // var obj = JSON.parse(entity);
        // console.log(obj);
        var testing = (JSON.stringify(entity));
        var obj = JSON.parse(testing);
        // console.log(data.date)
        console.log(obj.number);
        console.log(obj.name);
        //console.log(obj.number);//number of the ship
        if(obj.arrival_date===null&&obj.current_boat==null){
            const new_slip = {"number": obj.number, "arrival_date": date, "current_boat": req.params.ship}
            getModel().lists(req.params.ship, slip,10, req.query.pageToken, (err, entities, cursor) => {
                if (err) {
                    next(err);
                    return;
                }
                console.log(Object.keys(entities));
                if(Object.keys(entities).length===0){
                    console.log("looks like we can proceed");
                    getModel().update(slip, req.params.slip, new_slip, (err, entity) => {
                        if (err) {
                            next(err);
                            return;
                        }
                        res.json(entity);
                    });
                }
                else
                return res.status(400).end("Ship is already in slip");
            //res.json(entity);
            });
        }
        else
            return res.status(403).end("Slip currently occupied");
    });
});

/**
 * PUT /api/slips/:id
 *
 * Update a slip.
 */
router.delete('/:slip/ship/:ship', (req, res, next) => {
    console.log(req.params.slip);
    console.log(req.body);
    let number=req.body.number;

    getModel().read(slip, req.params.slip, (err, entity) => {
        if (err) {
            next(err);
            return;
        }
        //    res.json(entity);
        var testing = (JSON.stringify(entity));
        var obj = JSON.parse(testing);
        console.log(obj.number);
        number=obj.number;
        const new_slip = {"number": obj.number, "arrival_date": null, "current_boat": null}
        if (!number || isNaN(number) ) {
            return res.status(400).end("request must include number");
        }
        else {
            getModel().lists(number, slip,10, req.query.pageToken, (err, entities, cursor) => {
                if (err) {
                    next(err);
                    return;
                }
                console.log(Object.keys(entities));
                if(Object.keys(entities).length>0){
                    getModel().update(slip, req.params.slip, new_slip, (err, entity) => {
                        if (err) {
                            next(err);
                            return;
                        }
                        res.json(entity);
                    });
                }
                else
                return res.status(400).end("Slip number already created");
            });
        }

    });
});
router.put('/:slip', (req, res, next) => {
    console.log(req.params.slip);
    console.log(req.body);
    let number=req.body.number;

    getModel().read(slip, req.params.slip, (err, entity) => {
        if (err) {
            next(err);
            return;
        }
        //    res.json(entity);
        var testing = (JSON.stringify(entity));
        var obj = JSON.parse(testing);
        const new_slip = {"number": req.body.number, "arrival_date": obj.arrival_date, "current_boat": obj.current_boat}
        if (!number || isNaN(number) ) {
            return res.status(400).end("request must include number");
        }
        else {
            getModel().lists(number, slip,10, req.query.pageToken, (err, entities, cursor) => {
                if (err) {
                    next(err);
                    return;
                }
                console.log(Object.keys(entities));
                if(Object.keys(entities).length===0){
                    getModel().update(slip, req.params.slip, new_slip, (err, entity) => {
                        if (err) {
                            next(err);
                            return;
                        }
                        res.json(entity);
                    });
                }
                else
                return res.status(400).end("Slip number already created");
            });
        }

    });
});
/*
   router.put('/:slip', (req, res, next) => {
   console.log(req.params.slip);
   console.log(req.body);
   getModel().update(slip, req.params.slip, req.body, (err, entity) => {
   if (err) {
   next(err);
   return;
   }
   res.json(entity);
   });
   });*/
/**
 * DELETE /api/slips/:id
 *
 * Delete a slip.
 */
router.delete('/:slip', (req, res, next) => {
    getModel().delete(slip, req.params.slip, (err) => {
        if (err) {
            next(err);
            return;
        }
        res.status(200).send('OK');
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
