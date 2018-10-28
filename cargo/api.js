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
var cargo = "Cargo";
var ship = "Ship";
var ships;
var cargo;


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
 * GET /api/cargos
 *
 * Retrieve a page of cargos (up to ten at a time).
 */
router.get('/', (req, res, next) => {
    //  const ship =getModel().shipQuery(kind);
    //  removed the => and replaced with async and it worked.
    getModel().list(cargo,3, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        ships=entities;
        console.log(entities);
        JSON.stringify(entities);
        if(cursor) {
            cursor=encodeURIComponent(cursor);
            console.log(req.get("host"));
            console.log(req.baseUrl);
            console.log("yeah you already know!!");
            var next = "?pageToken=";
            cursor = req.protocol + "://"+req.get("host") + req.baseUrl + next + cursor;
        }

        res.json({
            items: entities,
            nextPageToken: cursor
        });
        /*
           getModel().list(cargo,10, req.query.pageToken, (err, entities, cursor) => {
           console.log(entities);
           getModel().list(cargo,10, req.query.pageToken, (err, entities, cursor) => {
           console.log(entities);
           });
           });*/
    });
});

/**
 * POST /api/cargos
 *
 * Create a new cargo.
 */
router.post('/', (req, res, next) => {
    let weight=req.body.weight;
    let content=req.body.content;
    //let arrival_date=req.body.arrival;
    const new_cargo = {"weight": req.body.weight, "delivery_date": null, "content": req.body.content}
    //const new_cargo = {"number": req.body.number, "arrival_date": null, "current_boat": null}
    if (!weight || isNaN(weight)||!content ) {
        return res.status(400).end("request must include weight (a number) and content");
    }
    else {
        new_cargo.carrier={"id": null, "name": null, "self": null};

        getModel().create(cargo, new_cargo, (err, entity) => {
            if (err) {
                next(err);
                return;
            }
            res.json(entity);
        });
    }
});
/*router.post('/', (req, res, next) => {
  let number=req.body.number;
  let arrival_date=req.body.arrival;
  const new_cargo = {"number": req.body.number, "arrival_date": null, "current_boat": null}
//    var parsed = JSON.parse(new_cargo);
//    console.log(number);
//   var parsed=parseInt(number, 10);
//   console.log(isNaN(parsed));
if (!number || isNaN(number) ) {
return res.status(400).end("request must include number");
}

//current_boat
//    console.log("here in the " + req.body);
getModel().create(cargo, new_cargo, (err, entity) => {
if (err) {
next(err);
return;
}
res.json(entity);
});
});*/
/**
 * GET /api/cargos/:id
 *
 * Retrieve a cargo.
 */
router.get('/:cargo', (req, res, next) => {

    getModel().read(cargo, req.params.cargo, (err, entity) => {
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
router.put('/:cargo/ship/:ship', (req, res, next) => {
    console.log(req.params.cargo);
    console.log(req.params.ship);
    let date = req.body.arrival_date
    console.log(date);
    console.log(isValidDate(date));
    if(isValidDate(date))
    console.log('Valid date');
    else return res.status(403).end("Invalid date:  DD/MM/YYYY");
    getModel().read(cargo, req.params.cargo, (err, entity) => {
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
        const new_cargo = {"number": obj.number, "arrival_date": date, "current_boat": req.params.ship}
        getModel().lists(req.params.ship, cargo,10, req.query.pageToken, (err, entities, cursor) => {
            if (err) {
                next(err);
                return;
            }
            console.log(Object.keys(entities));
            if(Object.keys(entities).length===0){
                console.log("looks like we can proceed");
                getModel().update(cargo, req.params.cargo, new_cargo, (err, entity) => {
                    if (err) {
                        next(err);
                        return;
                    }
                    res.json(entity);
                });
            }
            else
            return res.status(400).end("Ship is already in cargo");
        //res.json(entity);
        });
    }
    else
        return res.status(403).end("Slip currently occupied");
});
});

/**
 * PUT /api/cargos/:id
 *
 * Update a cargo.
 */
router.delete('/:cargo/ship/:ship', (req, res, next) => {
    console.log(req.params.cargo);
    console.log(req.body);
    let number=req.body.number;

    getModel().read(cargo, req.params.cargo, (err, entity) => {
        if (err) {
            next(err);
            return;
        }
        //    res.json(entity);
        var testing = (JSON.stringify(entity));
        var obj = JSON.parse(testing);
        console.log(obj.number);
        number=obj.number;
        const new_cargo = {"number": obj.number, "arrival_date": null, "current_boat": null}
        if (!number || isNaN(number) ) {
            return res.status(400).end("request must include number");
        }
        else {
            getModel().lists(number, cargo,10, req.query.pageToken, (err, entities, cursor) => {
                if (err) {
                    next(err);
                    return;
                }
                console.log(Object.keys(entities));
                if(Object.keys(entities).length>0){
                    getModel().update(cargo, req.params.cargo, new_cargo, (err, entity) => {
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
router.put('/:cargo', (req, res, next) => {
    console.log(req.params.cargo);
    console.log(req.body);
    //let number=req.body.number;
    let weight = req.body.weight;
    let content = req.body.content

    getModel().read(cargo, req.params.cargo, (err, entity) => {
        if (err) {
            next(err);
            return;
        }
        //    res.json(entity);
        var testing = (JSON.stringify(entity));
        var obj = JSON.parse(testing);
        //const new_cargo = {"number": req.body.number, "arrival_date": obj.arrival_date, "current_boat": obj.current_boat}
        const new_cargo = {"self": obj.self, "weight": req.body.weight, "delivery_date": obj.delivery_date, "content": req.body.content, "carrier": obj.carrier}
        if (!weight || !content)  {
            return res.status(400).end("request must include updated weight and updated content");
        }
        else {
           // getModel().lists(number, cargo,10, req.query.pageToken, (err, entities, cursor) => {
             //   if (err) {
               //     next(err);
                 //   return;
              //  }
              //  console.log(Object.keys(entities));
              //  if(Object.keys(entities).length===0){
                    getModel().update(cargo, req.params.cargo, new_cargo, (err, entity) => {
                        if (err) {
                            next(err);
                            return;
                        }
                        res.json(entity);
                    });
                }
                //else
                //return res.status(400).end("Slip number already created");
            });
       // }

   // });
});
/*
   router.put('/:cargo', (req, res, next) => {
   console.log(req.params.cargo);
   console.log(req.body);
   getModel().update(cargo, req.params.cargo, req.body, (err, entity) => {
   if (err) {
   next(err);
   return;
   }
   res.json(entity);
   });
   });*/
/**
 * DELETE /api/cargos/:id
 *
 * Delete a cargo.
 */
router.delete('/:cargo', (req, res, next) => {
    
    getModel().delete(cargo, req.params.cargo, (err) => {
        if (err) {
            next(err);
            return;
        }
        getModel().lists(req.params.cargo,ship , 50, req.query.pageToken, (err, entities, cursor) => {
            if (err) {
                next(err);
                return;
            }
            console.log(Object.keys(entities).length) ;
            if(Object.keys(entities).length!=0) {
                var testing = (JSON.stringify(entities));
                var obj = JSON.parse(testing);
                    const new_ship = {"name": obj[0].name, "type": obj[0].type, "length": obj[0].length, "cargo": obj[0].cargo, "self": obj[0].self};
                    //var cargoship = {"id": obj.id, "self": obj.self};
                    for (var i = new_ship.cargo.length-1; i >= 0; i--) {
                        if (new_ship.cargo[i].id==req.params.cargo) {
                            new_ship.cargo.splice(i,1);
                        }
                    }
                getModel().update(ship, obj[0].id, new_ship, (err, entity) => {
                    if (err) {
                        next (err);
                        return ;
                    }

                });
                    //new_ship.cargo.push(cargoship);
        res.status(200).send('OK');
            }

        });
    });
});

router.delete('/:ship', (req, res, next) => {
    getModel().delete(req.params.ship, (err) => {
        if (err) {
            next(err);
            return;
        }
        getModel().lists(cargo, req.params.ship , 50, req.query.pageToken, (err, entities, cursor) => {
            if (err) {
                next(err);
                return;
            }
            console.log(Object.keys(entities).length) ;
            if(Object.keys(entities).length!=0) {
              for (var x=0; x<Object.keys(entities).length; x++) {
                var testing = (JSON.stringify(entities));
                var obj = JSON.parse(testing);
                console.log(obj[0].current_boat);
                console.log(obj[0].id);
               // const new_cargo = {"number": obj[0].number, "arrival_date": null, "current_boat": null};
               // getModel().updates(slip, obj[0].id, new_slip, (err, entity) => {
                const new_cargo = {"carrier": {"id": null, "self":null, "name": null},"weight": obj[x].weight, "delivery_date": null, "content": obj[x].content, "self": obj[x].self}
        //const new_cargo = {"weight": obj.weight, "delivery_date": obj.delivery_date, "current_boat": req.params.ship}
                getModel().updates(cargo, obj[x].id, new_cargo, (err, entity) => {
                    if (err) {
                        next (err);
                        return ;
                    }

                });

                }
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
