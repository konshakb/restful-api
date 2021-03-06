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

const Datastore = require('@google-cloud/datastore');
const config = require('../config');

// [START config]
const ds = Datastore({
    projectId: config.get('GCLOUD_PROJECT')
});
//const kind = 'Slip';
//const kind2 = 'Slip';
// [END config]

// Translates from Datastore's entity format to
// the format expected by the application.
//
// Datastore format:
//   {
//     key: [kind, id],
//     data: {
//       property: value
//     }
//   }
//
// Application format:
//   {
//     id: id,
//     property: value
//   }
function fromDatastore (obj) {
    obj.id = obj[Datastore.KEY].id;
    return obj;
}

// Translates from the application's format to the datastore's
// extended entity property format. It also handles marking any
// specified properties as non-indexed. Does not translate the key.
//
// Application format:
//   {
//     id: id,
//     property: value,
//     unindexedProperty: value
//   }
//
// Datastore extended format:
//   [
//     {
//       name: property,
//       value: value
//     },
//     {
//       name: unindexedProperty,
//       value: value,
//       excludeFromIndexes: true
//     }
//   ]
function toDatastore (obj, nonIndexed) {
    nonIndexed = nonIndexed || [];
    const results = [];
    Object.keys(obj).forEach((k) => {
        if (obj[k] === undefined) {
            return;
        }
        results.push({
            name: k,
            value: obj[k],
            excludeFromIndexes: nonIndexed.indexOf(k) !== -1
        });
    });
    return results;
}
function shipQuery(ships) {
    console.log(ships);
    console.log([ships]);
    const q = ds.createQuery(ships);
    ds.runQuery(q, (err, entities, nextQuery) => {
        if (err) {
            cb(err);
            return;
        }
        const ship = entities.filter('name', 'new boats 2');
        console.log(entities);
        cb(null, entities.map(fromDatastore));
    });
    // return ship;
}

// Lists all ships in the Datastore sorted alphabetically by title.
// The ``limit`` argument determines the maximum amount of results to
// return per page. The ``token`` argument allows requesting additional
// pages. The callback is invoked with ``(err, ships, nextPageToken)``.
// [START list]
function list (kind,limit, token, cb) {
    console.log(kind);
    //    console.log([kind]);
    if (kind == "Cargo")
        var test= "5114353707646976";
 //       var q = ds.createQuery([kind]).limit(limit).filter('carrier.id', '=', test);
       var q = ds.createQuery([kind]).limit(limit).order('content').start(token);
    if (kind == "Ship")
        var q = ds.createQuery([kind]).limit(limit).order('name').start(token);

    ds.runQuery(q, (err, entities, nextQuery) => {
        if (err) {
            console.log("there was an error");
            cb(err);
            return;
        }
        const hasMore = nextQuery.moreResults !== Datastore.NO_MORE_RESULTS ? nextQuery.endCursor : false;
        //  console.log(entities);
        cb(null, entities.map(fromDatastore), hasMore);
    });
}
// [END list]

function lists (number, kind,limit, token, cb) {
    console.log(kind);
    //    console.log([kind]);
    if (kind == "Cargo"){
        console.log("testing with Cargo");
        //  var q = ds.createQuery([kind]).limit(limit).order('number').start(token);
        var q = ds.createQuery([kind]).limit(limit).filter('id', '=', number);
        console.log(q);
    }
    // var q = ds.createQuery([kind]).limit(limit).filter('current_boat', '=', number);
    else if (kind == "Ship") {

        //var q = ds.createQuery([kind]).limit(limit).order('name').start(token);
        var q = ds.createQuery([kind]).limit(limit).filter('cargo.id', '=', number);
    }
    if(!q)
        console.log("testing");

    ds.runQuery(q, (err, entities, nextQuery) => {
        if (err) {
            cb(err);
            return;
        }
        const hasMore = nextQuery.moreResults !== Datastore.NO_MORE_RESULTS ? nextQuery.endCursor : false;
        //  console.log(entities);
        cb(null, entities.map(fromDatastore), hasMore);
    });
}
function putlist (number, kind,limit, token, cb) {
    console.log(kind);
    //    console.log([kind]);
    if (kind == "Slip")
        //  var q = ds.createQuery([kind]).limit(limit).order('number').start(token);
        var q = ds.createQuery([kind]).limit(limit).filter('number', '=', number);
    // var q = ds.createQuery([kind]).limit(limit).filter('current_boat', '=', number);
    else if (kind == "Ship") {

        //var q = ds.createQuery([kind]).limit(limit).order('name').start(token);
        var q = ds.createQuery([kind]).limit(limit).filter('length', '=', '18');
    }
    if(!q)
        console.log("winning");

    ds.runQuery(q, (err, entities, nextQuery) => {
        if (err) {
            cb(err);
            return;
        }
        const hasMore = nextQuery.moreResults !== Datastore.NO_MORE_RESULTS ? nextQuery.endCursor : false;
        //  console.log(entities);
        cb(null, entities.map(fromDatastore), hasMore);
    });
}
// Creates a new ship or updates an existing ship with new data. The provided
// data is automatically translated into Datastore format. The ship will be
// queued for background processing.
// [START update]
function update (kind, id, data, cb) {
    let key;
    if (id) {
        key = ds.key([kind, parseInt(id, 10)]);
    } else {
        key = ds.key(kind);
    }
    console.log(key);

    var entity = {
        key: key,
        data: toDatastore(data, ['description'])
    };
    console.log(key);
    //data.self = "http://localhost:8080/api/cargo/"+entity.key.id;
    entity = {
        key: key,
        data: toDatastore(data, ['description'])
    };
    console.log(entity.key.id);
    //data.self = "http://localhost:8080/api/cargo/"+entity.key.id;
    key = ds.key([kind, parseInt(entity.key.id, 10)]);

    ds.save(
            entity,
            (err) => {
//                data.id = entity.key.id;
                console.log(data.id);
                //data.self = "http://localhost:8080/api/cargo/"+entity.key.id;
                data.self = "https://cargoships-220516.appspot.com/api/cargo/"+entity.key.id;
                console.log(key);
                key = ds.key([kind, parseInt(entity.key.id, 10)]);
                entity = {
                    key: key,
        data: toDatastore(data, ['description'])
                };
                //           entity.key.self = "http://localhost:8080/api/cargo/"+entity.key.id;
                //                cb(err, err ? null : data);
                ds.save(
                    entity,
                    (err) => {
                        data.id = entity.key.id;
                        console.log(data.id);
                        cb(err, err ? null : data);
                    }
                    );
            }
    );
}
// [END update]

function create (kind, data, cb) {
    console.log(data);
    //    console.log("In the create function: cb = " +cb);
    update(kind, null, data, cb);
}

function read (kind, id, cb) {
    const key = ds.key([kind, parseInt(id, 10)]);
    ds.get(key, (err, entity) => {
        if (!err && !entity) {
            err = {
                code: 404,
        message: 'Not found'
            };
        }
        if (err) {
            cb(err);
            return;
        }
        cb(null, fromDatastore(entity));
    });
}

function _delete (kind, id, cb) {
    const key = ds.key([kind, parseInt(id, 10)]);
    ds.delete(key, cb);
}

// [START exports]
module.exports = {
    shipQuery,
    create,
    read,
    update,
    delete: _delete,
    list,
    lists
};
// [END exports]
