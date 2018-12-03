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
var item = "Item";
var list = "List";
var lists;
var item;


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



//const listQuery = ds.createQuery('Ship');

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * GET /api/items
 *
 * Retrieve a page of items (up to ten at a time).
 */
router.get('/', (req, res, next) => {
    //  const list =getModel().listQuery(kind);
    //  removed the => and replaced with async and it worked.
    var contype = req.headers['content-type'];
    if (contype==='application/json') {
        getModel().list(item,5, req.query.pageToken, (err, entities, cursor) => {
            if (err) {
                next(err);
                return;
            }
            lists=entities;
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
               getModel().list(item,10, req.query.pageToken, (err, entities, cursor) => {
               console.log(entities);
               getModel().list(item,10, req.query.pageToken, (err, entities, cursor) => {
               console.log(entities);
               });
               });*/
        });
    } else { res.status(406).send('content-type must be application/json'); }
});

/**
 * POST /api/items
 *
 * Create a new item.
 */
router.post('/', (req, res, next) => {
    var contype = req.headers['content-type'];
    if (contype==='application/json') {
        let weight=req.body.weight;
        let content=req.body.content;
        //let arrival_date=req.body.arrival;
        const new_item = {"weight": req.body.weight, "delivery_date": null, "content": req.body.content}
        //const new_item = {"number": req.body.number, "arrival_date": null, "current_boat": null}
        if (!weight || isNaN(weight)||!content ) {
            return res.status(400).end("request must include weight (a number) and content");
        }
        else {
            new_item.carrier={"id": null, "name": null, "self": null};

            getModel().create(item, new_item, (err, entity) => {
                if (err) {
                    next(err);
                    return;
                }
                res.json(entity);
            });
        }
    } else { res.status(406).send('content-type must be application/json'); }
});
/*router.post('/', (req, res, next) => {
  let number=req.body.number;
  let arrival_date=req.body.arrival;
  const new_item = {"number": req.body.number, "arrival_date": null, "current_boat": null}
//    var parsed = JSON.parse(new_item);
//    console.log(number);
//   var parsed=parseInt(number, 10);
//   console.log(isNaN(parsed));
if (!number || isNaN(number) ) {
return res.status(400).end("request must include number");
}

//current_boat
//    console.log("here in the " + req.body);
getModel().create(item, new_item, (err, entity) => {
if (err) {
next(err);
return;
}
res.json(entity);
});
});*/
/**
 * GET /api/items/:id
 *
 * Retrieve a item.
 */
router.get('/:item', (req, res, next) => {

    var contype = req.headers['content-type'];
    if (contype==='application/json') {
        getModel().read(item, req.params.item, (err, entity) => {
            if (err) {
                next(err);
                return;
            }
            // var obj = JSON.parse(entity);
            // console.log(obj);
            var testing = (JSON.stringify(entity));
            var obj = JSON.parse(testing);
            // console.log(data.date)
            console.log(obj.number);//number of the list
            if(obj.arrival_date===null&&obj.current_boat==null)
            console.log("looks like we can proceed");
        var url = "https://my-project-bookstore.appspot.com/api/lists/"+obj.current_boat;
        if(obj.current_boat)
            entity.url = {"url":url};
        res.json(entity);
        });
    } else { res.status(406).send('content-type must be application/json'); }
});
/*
   router.put('/:item/list/:list', (req, res, next) => {
   console.log(req.params.item);
   console.log(req.params.list);
   let date = req.body.arrival_date
   console.log(date);
   console.log(isValidDate(date));
   if(isValidDate(date))
   console.log('Valid date');
   else return res.status(403).end("Invalid date:  DD/MM/YYYY");
   getModel().read(item, req.params.item, (err, entity) => {
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
//console.log(obj.number);//number of the list
if(obj.arrival_date===null&&obj.current_boat==null){
const new_item = {"number": obj.number, "arrival_date": date, "current_boat": req.params.list}
getModel().lists(req.params.list, item,10, req.query.pageToken, (err, entities, cursor) => {
if (err) {
next(err);
return;
}
console.log(Object.keys(entities));
if(Object.keys(entities).length===0){
console.log("looks like we can proceed");
getModel().update(item, req.params.item, new_item, (err, entity) => {
if (err) {
next(err);
return;
}
res.json(entity);
});
}
else
return res.status(400).end("Ship is already in item");
//res.json(entity);
});
}
else
return res.status(403).end("Slip currently occupied");
});
});

*/
/*
 * delete /api/items/:id
 *
 * Update a item.

 router.delete('/:item/list/:list', (req, res, next) => {
 console.log(req.params.item);
 console.log(req.body);
 let number=req.body.number;

 getModel().read(item, req.params.item, (err, entity) => {
 if (err) {
 next(err);
 return;
 }
//    res.json(entity);
var testing = (JSON.stringify(entity));
var obj = JSON.parse(testing);
console.log(obj.number);
number=obj.number;
const new_item = {"number": obj.number, "arrival_date": null, "current_boat": null}
if (!number || isNaN(number) ) {
return res.status(400).end("request must include number");
}
else {
getModel().lists(number, item,10, req.query.pageToken, (err, entities, cursor) => {
if (err) {
next(err);
return;
}
console.log(Object.keys(entities));
if(Object.keys(entities).length>0){
getModel().update(item, req.params.item, new_item, (err, entity) => {
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
*/
router.put('/:item', (req, res, next) => {
    var contype = req.headers['content-type'];
    if (contype==='application/json') {
        console.log(req.params.item);
        console.log(req.body);
        //let number=req.body.number;
        let weight = req.body.weight;
        let content = req.body.content

    getModel().read(item, req.params.item, (err, entity) => {
        if (err) {
            next(err);
            return;
        }
        //    res.json(entity);
        var testing = (JSON.stringify(entity));
        var obj = JSON.parse(testing);
        //const new_item = {"number": req.body.number, "arrival_date": obj.arrival_date, "current_boat": obj.current_boat}
        const new_item = {"self": obj.self, "weight": req.body.weight, "delivery_date": obj.delivery_date, "content": req.body.content, "carrier": obj.carrier}
        if (!weight || !content)  {
            return res.status(400).end("request must include updated weight and updated content");
        }
        else {
            // getModel().lists(number, item,10, req.query.pageToken, (err, entities, cursor) => {
            //   if (err) {
            //     next(err);
            //   return;
            //  }
            //  console.log(Object.keys(entities));
            //  if(Object.keys(entities).length===0){
            getModel().update(item, req.params.item, new_item, (err, entity) => {
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
        } else { res.status(406).send('content-type must be application/json'); }
    });
/*
   router.put('/:item', (req, res, next) => {
   console.log(req.params.item);
   console.log(req.body);
   getModel().update(item, req.params.item, req.body, (err, entity) => {
   if (err) {
   next(err);
   return;
   }
   res.json(entity);
   });
   });*/
/**
 * DELETE /api/items/:id
 *
 * Delete a item.
 */
router.delete('/:item', (req, res, next) => {

    var contype = req.headers['content-type'];
    if (contype==='application/json') {
        getModel().delete(item, req.params.item, (err) => {
            if (err) {
                next(err);
                return;
            }
            getModel().lists(req.params.item,list , 50, req.query.pageToken, (err, entities, cursor) => {
                if (err) {
                    next(err);
                    return;
                }
                console.log(Object.keys(entities).length) ;
                if(Object.keys(entities).length!=0) {
                    var testing = (JSON.stringify(entities));
                    var obj = JSON.parse(testing);
                    const new_list = {"name": obj[0].name, "type": obj[0].type, "length": obj[0].length, "item": obj[0].item, "self": obj[0].self};
                    //var itemlist = {"id": obj.id, "self": obj.self};
                    for (var i = new_list.item.length-1; i >= 0; i--) {
                        if (new_list.item[i].id==req.params.item) {
                            new_list.item.splice(i,1);
                        }
                    }
                    getModel().update(list, obj[0].id, new_list, (err, entity) => {
                        if (err) {
                            next (err);
                            return ;
                        }

                    });
                    //new_list.item.push(itemlist);
                }
                res.status(200).send('OK');

            });
        });
    } else { res.status(406).send('content-type must be application/json'); }
});
/*
   router.delete('/:list', (req, res, next) => {
   getModel().delete(req.params.list, (err) => {
   if (err) {
   next(err);
   return;
   }
   getModel().lists(item, req.params.list , 50, req.query.pageToken, (err, entities, cursor) => {
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
// const new_item = {"number": obj[0].number, "arrival_date": null, "current_boat": null};
// getModel().updates(slip, obj[0].id, new_slip, (err, entity) => {
const new_item = {"carrier": {"id": null, "self":null, "name": null},"weight": obj[x].weight, "delivery_date": null, "content": obj[x].content, "self": obj[x].self}
//const new_item = {"weight": obj.weight, "delivery_date": obj.delivery_date, "current_boat": req.params.list}
getModel().updates(item, obj[x].id, new_item, (err, entity) => {
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
 * Errors on "/api/lists/*" routes.
 */
router.use((err, req, res, next) => {
    // Format error and forward to generic error handler for logging and
    // responding to the request
    if (err.code===404) {
        res.status(404).json({message: "Not Found"});
    }
    else{

    err.response = {
        message: err.message,
    internalCode: err.code
    };
    next(err);
    }
});

module.exports = router;
