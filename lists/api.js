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
const app = express();
var jwt = require('express-jwt');
var jwks = require('jwks-rsa');
var jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://week7osu.auth0.com/.well-known/jwks.json"
    }),
        //        audience: 'https://week7osu/',
        aud: 'https://week7osu/',
    issuer: "https://week7osu.auth0.com/",
    algorithms: ['RS256']
});
app.use(jwtCheck);
const login = express.Router();

const list = 'List';
//const slip = 'Slip';
const item = 'Item';

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
 * GET /api/lists
 *
 * Retrieve a page of lists (up to ten at a time).
 */
router.get('/', (req, res, next) => {
    getModel().list(5, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        const accepts = req.accepts(['application/json']);
        //        console.log(req.headers.content-type);
        var contype = req.headers['content-type'];
        console.log(contype);
        var content = "content-type";
        if (!accepts) {
            res.status(406).send('Not Acceptable');
        } else if(accepts === 'application/json' && contype==='application/json') {
            JSON.stringify(entities);
            if(cursor) {
                cursor=encodeURIComponent(cursor);
                console.log(req.get("host"));
                console.log(req.baseUrl);
                console.log("yeah you already know!!");
                var next = "?pageToken=";
                cursor = req.protocol + "://"+req.get("host") + req.baseUrl + next + cursor;
            }
            res.status(200).json({
                items: entities,
                nextPageToken: cursor
            });
        } else if(accepts != 'application/json') {
            res.status(406).send("Header must be application/json");
        } else { res.status(406).send('Header must be application/json'); }
        /*
           res.json({
           items: entities,
           nextPageToken: cursor
           });*/
    });
});
//get item from list
router.get('/:list/items', (req, res, next) => {

    var contype = req.headers['content-type'];
    if (contype==='application/json') {

        getModel().lists(item, req.params.list, 3, req.query.pageToken, (err, entities, cursor) => {
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
                console.log(cursor);
                cursor=encodeURIComponent(cursor);
                console.log(req.get("host"));
                console.log(req.baseUrl);
                var root = "/" + req.params.list+"/item"
            //var root = "/item/"+req.params.list+"/"
            var next = "?pageToken=";
        cursor = req.protocol + "://"+req.get("host") + req.baseUrl +root+ next + cursor;
            }
            res.json({
                items: entities,
                nextPageToken: cursor
            });
        });
    } else { res.status(406).send('Header must be application/json'); }
});


router.put('/:list/items/:item', (req, res, next) => {

    var contype = req.headers['content-type'];
    if (contype==='application/json') {
        console.log(req.params.item);
        console.log(req.params.list);
        getModel().reads(item, req.params.item, (err, entity) => {
            if (err) {
                next(err);
                return;
            }
            console.log(req.params.item);
            // console.log(obj);
            var testing = (JSON.stringify(entity));
            var obj = JSON.parse(testing);
            // console.log(data.date)
            console.log(obj.weight);
            console.log(obj);
            //console.log(obj.number);//number of the list
            if(obj){
                getModel().reads(list, req.params.list, (err, entity) => {
                    if (err) {
                        next(err);
                        return;
                    }
                    //    res.json(entity);
                    var listping = (JSON.stringify(entity));
                    var listobj = JSON.parse(listping);
                    const new_list = {"owner": listobj.owner, "name": listobj.name, "type": listobj.type, "store": listobj.store, "item": listobj.item, "self": listobj.self};
                    var itemlist = {"id": obj.id, "self": obj.self};
                    new_list.item.push(itemlist);
                    getModel().updates(list, req.params.list, new_list, (err, entity) => {
                        if (err) {
                            next(err);
                            return;
                        }
                        res.json(entity);
                    });
                });
            }
            else
                return res.status(403).end("Item does not exist");
        });

    } else { res.status(406).send('Header must be application/json'); }
});
/*
   router.put('/:list/items/:item', (req, res, next) => {

   var contype = req.headers['content-type'];
   if (contype==='application/json') {
   console.log(req.params.item);
   console.log(req.params.list);
   let delivery_date = req.body.delivery_date
// console.log(date);
// console.log(isValidDate(date));
getModel().reads(item, req.params.item, (err, entity) => {
if (err) {
next(err);
return;
}
console.log(req.params.item);
// console.log(obj);
var testing = (JSON.stringify(entity));
var obj = JSON.parse(testing);
// console.log(data.date)
console.log(obj.weight);
console.log(obj.content);
//console.log(obj.number);//number of the list
if(obj.delivery_date===null){
getModel().reads(list, req.params.list, (err, entity) => {
if (err) {
next(err);
return;
}
//    res.json(entity);
var listping = (JSON.stringify(entity));
var listobj = JSON.parse(listping);
const new_item = {"carrier": {"id": listobj.id, "self":listobj.self, "name": listobj.name},"weight": obj.weight, "delivery_date": delivery_date, "content": obj.content, "self": obj.self}
//const new_item = {"weight": obj.weight, "delivery_date": obj.delivery_date, "current_boat": req.params.list}
getModel().updates(item, req.params.item, new_item, (err, entity) => {
if (err) {
next(err);
return;
}
res.json(entity);
const new_list = {"owner": listobj.owner, "name": listobj.name, "type": listobj.type, "store": listobj.store, "item": listobj.item, "self": listobj.self};
var itemlist = {"id": obj.id, "self": obj.self};
new_list.item.push(itemlist);
getModel().updates(list, req.params.list, new_list, (err, entity) => {
if (err) {
next(err);
return;
}
});
});
//res.json(entity);
});
}
else
return res.status(403).end("Item already on list");
});

} else { res.status(406).send('Header must be application/json'); }
});
*/


//remove item from list
router.delete('/:list/items/:item', (req, res, next) => {
    var contype = req.headers['content-type'];
    if (contype==='application/json') {
        console.log(req.params.item);
        console.log(req.params.list);
        let delivery_date = req.body.delivery_date
    // console.log(date);
    // console.log(isValidDate(date));
    getModel().reads(item, req.params.item, (err, entity) => {
        if (err) {
            next(err);
            return;
        }
        console.log(req.params.item);
        // console.log(obj);
        var testing = (JSON.stringify(entity));
        var obj = JSON.parse(testing);
        // console.log(data.date)
        console.log(obj.weight);
        console.log(obj.content);
        //console.log(obj.number);//number of the list
        if(!obj.delivery_date){
            getModel().reads(list, req.params.list, (err, entity) => {
                if (err) {
                    next(err);
                    return;
                }
                //    res.json(entity);
                var listping = (JSON.stringify(entity));
                var listobj = JSON.parse(listping);
                const new_item = {"carrier": {"id": null, "self":null, "name": null},"weight": obj.weight, "delivery_date": null, "content": obj.content, "self": obj.self}
                //const new_item = {"weight": obj.weight, "delivery_date": obj.delivery_date, "current_boat": req.params.list}
                getModel().updates(item, req.params.item, new_item, (err, entity) => {
                    if (err) {
                        next(err);
                        return;
                    }
                    res.json(entity);
                    const new_list = {"owner": listobj.owner,"name": listobj.name, "type": listobj.type, "store": listobj.store, "item": listobj.item, "self": listobj.self};
                    //var itemlist = {"id": obj.id, "self": obj.self};
                    for (var i = new_list.item.length-1; i >= 0; i--) {
                        if (new_list.item[i].id==req.params.item) {
                            new_list.item.splice(i,1);
                        }
                    }
                    //new_list.item.push(itemlist);
                    getModel().updates(list, req.params.list, new_list, (err, entity) => {
                        if (err) {
                            next(err);
                            return;
                        }
                    });
                });
                //res.json(entity);
            });
        }
        else
            return res.status(403).end("Item already on list");
    });
    } else { res.status(406).send('Header must be application/json'); }
});
/**
 * POST /api/lists
 *
 * Create a new list.
 */
router.post('/', jwtCheck, (req, res, next) => {
    var contype = req.headers['content-type'];
    if (contype==='application/json') {
        console.log(req.user.sub);
        var owner = req.user.sub.slice(6)
    console.log(owner);
let name = req.body.name;
let type = req.body.type;
let store = req.body.store;
const new_list = {"owner": owner, "name": req.body.name, "type": req.body.type, "store": req.body.store};
new_list.item= [];
//    for(var x=0;x<5;x++) i{
//        new_list.item.push(x);
//  }
console.log(new_list);
//  console.log(req.body.store);
if (!name || !type || !store) {
    return res.status(400).end('request must include name type and store');
}


getModel().create(new_list, (err, entity) => {
    if (err) {
        next(err);
        return;
    }
    //entity.location = {"status":"out to sea"};
    //res.json(entity);
    res.status(201).json(entity);
});
} else { res.status(406).send('Header must be application/json'); }
});
/*
   router.post('/', jwtCheck, (req, res, next) => {

   console.log(req.user.sub);
   var owner = req.user.sub.slice(6)
   console.log(owner);
   let name = req.body.name;
   let type = req.body.type;
   let store = req.body.store;
   const new_ship = {"owner": owner, "name": req.body.name, "type": req.body.type, "store": req.body.store};
// new_ship.cargo= [];
//    for(var x=0;x<5;x++) {
//        new_ship.cargo.push(x);
//  }
console.log(new_ship);
//  console.log(req.body.store);
if (!name || !type || !store) {
return res.status(400).end('request must include name type and store');
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
*/
/**
 * GET /api/lists/:id
 *
 * Retrieve a list.
 */
router.get('/:list', (req, res, next) => {
    var contype = req.headers['content-type'];
    if (contype==='application/json') {
        getModel().read(req.params.list, (err, entity) => {
            if (err) {
                next(err);
                return;
            }
            res.json(entity);
        });
    } else { res.status(406).send('Header must be application/json'); }
});

/**
 * PUT /api/lists/:id
 *
 * Update a list.
 */
router.put('/:list', (req, res, next) => {
    var contype = req.headers['content-type'];
    if (contype==='application/json') {
        let name = req.body.name;
        let type = req.body.type;
        let store = req.body.store;
        getModel().reads(list, req.params.list, (err, entity) => {
            if (err) {
                next(err);
                return;
            }
            var listing = (JSON.stringify(entity));
            var listobj = JSON.parse(listing);

            const new_list = {"owner": listobj.owner, "item": listobj.item,"name": req.body.name, "type": req.body.type, "store": req.body.store};
            console.log(new_list);
            console.log(req.body.name);
            console.log(req.body.store);
            console.log(req.body.type);
            if (!name || !type || !store) {
                return res.status(400).end('put request must include name type and store');
            }

            getModel().update(req.params.list, new_list, (err, entity) => {
                if (err) {
                    next(err);
                    return;
                }
                res.json(entity);
            });
        });
    } else { res.status(406).send('Header must be application/json'); }
});

/**
 * DELETE /api/lists/:id
 *
 * Delete a list.
 */
router.delete('/:list', jwtCheck, (req, res, next) => {
    var contype = req.headers['content-type'];
    if (contype==='application/json') {
        getModel().read(req.params.list, (err, entity) => {
            if (err) {
                next(err);
                return;
            }
            var owner = req.user.sub.slice(6)
            console.log(owner);
        console.log(entity.owner);
        if(owner!=entity.owner)
        {
            res.status(403).json({ message: 'Cannot delete another user\'s list!' });
        }
        else
        {



            getModel().delete(req.params.list, (err) => {
                if (err) {
                    next(err);
                    return;
                }
            });
            //res.json(entity);
            res.status(204).json({ message: 'No Content' });
            //res.status(204).end();
        }
        });
    } else { res.status(406).send('Header must be application/json'); }
});
/*
   router.delete('/:list', jwtCheck, (req, res, next) => {
   var contype = req.headers['content-type'];
   if (contype==='application/json') {
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
} else { res.status(406).send('Header must be application/json'); }
});
*/

/**
 * Errors on "/api/lists/*" routes.
 */
router.use((err, req, res, next) => {
    // Format error and forward to generic error handler for logging and
    // responding to the request
    console.log(err.code);
    if (err.code===404) {
        res.status(404).json({message: "Not Found"});
    }
    else if (err.name === 'UnauthorizedError') {
        res.status(401).json({ message: 'Unauthorized. Invalid token!' });
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
