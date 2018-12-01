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
const request = require('request');
//const slip = 'Slip';
const cargo = 'Cargo';
const app = express();
var jwt = require('express-jwt');
var jwks = require('jwks-rsa');
var atob=require('atob');

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

//app.use('/login', login);



function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(atob(base64));
};


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
router.get('/:userid/ships', jwtCheck,(req, res, next) => {

    var owner = req.user.sub.slice(6)
    console.log(owner+"   "+req.params.userid);
    if(owner===req.params.userid)
{

    getModel().list(owner,10, req.query.pageToken, (err, entities, cursor) => {
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
    });
}
else {
    (console.log("not a match"));
     }
});


router.post('/login', function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    console.log(username+password);
    var options = { method: 'POST',
        url: 'https://week7osu.auth0.com/oauth/token',
    headers: { 'content-type': 'application/json' },
    body:
{ scope: 'openid',
    grant_type: 'password',
    username: username,
    password: password,
    client_id: 'sopaoXfA3rMgSTXlD64yKHFFZ6shYReD',
    client_secret: 'kFzUvXrHvMqoOSMhp7TlfDJ82KCZfCtbXeaxXQTQoUWI6p0qlLIoAY4AOqhtLheR'},
    json: true };
    request(options, (error, response, body) => {
        if (error){
            res.status(500).send(error);
        } else {
            var decoded = parseJwt (body.id_token) ;
            console.log(decoded);
            res.send(body);
        }
    });

});
router.post('/', function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    console.log(username+password);
    var options = { method: 'POST',
        url: 'https://week7osu.auth0.com/oauth/token',
    headers: { 'content-type': 'application/json' },
    body:
{ grant_type: 'client_credentials',
    audience: 'https://week7osu.auth0.com/api/v2/',
    client_id: 'sopaoXfA3rMgSTXlD64yKHFFZ6shYReD',
    client_secret: 'kFzUvXrHvMqoOSMhp7TlfDJ82KCZfCtbXeaxXQTQoUWI6p0qlLIoAY4AOqhtLheR'},
    json: true };
    request(options, (error, response, body) => {
        if (error){
            res.status(500).send(error);
        } else {

//            var decoded = parseJwt (response.body.id_token) ;
  //          console.log(decoded);
            //            res.send(body);
            console.log(response.body.access_token);
            var access_token = 'Bearer '+ response.body.access_token;
            console.log(access_token);
            var option = { method: 'POST',
                url: 'https://week7osu.auth0.com/api/v2/users',
        headers: { 'content-type': 'application/json',
            'Authorization': access_token },
        body:
    {
        "user_id": req.body.user_id,
        "connection": "Username-Password-Authentication",
        "email": req.body.email,
        "username": req.body.username,
        "password": req.body.password,
        "user_metadata": {},
        "email_verified": false,
        "verify_email": false,
        "app_metadata": {}},
        json: true };
            request(option, (error, response, body) => {
                if (error){
                    res.status(500).send(error);
                } else {
                    res.send(body);
                    console.log(response);
                    var access_token = response.body.access_token;
                }
            });
        }
    });

});























/**
 * POST /api/ships
 *
 * Create a new ship.
 */

/**
 * PUT /api/ships/:id
 *
 * Update a ship.
 */

/**
 * DELETE /api/ships/:id
 *
 * Delete a ship.
 */
router.delete('/:ship', jwtCheck, (req, res, next) => {
    getModel().read(req.params.ship, (err, entity) => {
        if (err) {
            next(err);
            return;
        }
    var owner = req.user.sub.slice(6)
    console.log(owner);
    console.log(entity.owner);
    if(owner===entity.owner)
    {
        res.status(403).json({ message: 'Cannot delete another user\'s ship!' });
    }
    else
    {



        getModel().delete(req.params.ship, (err) => {
            if (err) {
                next(err);
                return;
            }
        });
        res.json(entity);
    }
    });
});

/**
 * Errors on "/api/ships/*" routes.
 */
router.use((err, req, res, next) => {

    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ message: 'Unauthorized. Invalid token!' });
    }
    else {
        err.response = {
            message: err.message,
    internalCode: err.code
        };
        next(err);
    }
});
/*
   router.use((err, req, res, next) => {
// Format error and forward to generic error handler for logging and
// responding to the request
err.response = {
message: err.message,
internalCode: err.code
};
next(err);
});*/

module.exports = router;
