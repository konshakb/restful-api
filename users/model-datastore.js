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
const kind = 'User';
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

// Lists all ships in the Datastore sorted alphabetically by title.
// The ``limit`` argument determines the maximum amount of results to
// return per page. The ``token`` argument allows requesting additional
// pages. The callback is invoked with ``(err, ships, nextPageToken)``.
// [START list]
function list (limit, token, cb) {
    const q = ds.createQuery([kind]).limit(limit).order('owner').start(token);
    //const q = ds.createQuery([kind]).limit(limit).filter('owner', '=', owner);
    //  console.log(q);
    //  console.log(q);

    const tasks = ds.runQuery(q, (err, entities, nextQuery) => {
        if (err) {
            cb(err);
            return;
        }
        const hasMore = nextQuery.moreResults !== Datastore.NO_MORE_RESULTS ? nextQuery.endCursor : false;
        cb(null, entities.map(fromDatastore), hasMore);
    });
}
// [END list]

function listing (number, kind, limit, token, cb) {
    const q = ds.createQuery([kind]).limit(limit).filter('current_boat', '=', number);
    console.log(q);

    ds.runQuery(q, (err, entities, nextQuery) => {
        if (err) {
            cb(err);
            return;
        }
        const hasMore = nextQuery.moreResults !== Datastore.NO_MORE_RESULTS ? nextQuery.endCursor : false;
        cb(null, entities.map(fromDatastore), hasMore);
    });
}
function lists (kind, id, limit, token, cb) {
    const q = ds.createQuery([kind]).limit(limit).filter('carrier.id', '=', id);
    console.log(q);

    ds.runQuery(q, (err, entities, nextQuery) => {
        if (err) {
            cb(err);
            return;
        }
        const hasMore = nextQuery.moreResults !== Datastore.NO_MORE_RESULTS ? nextQuery.endCursor : false;
        cb(null, entities.map(fromDatastore), hasMore);
    });
}
// Creates a new ship or updates an existing ship with new data. The provided
// data is automatically translated into Datastore format. The ship will be
// queued for background processing.
// [START update]
function update (id, data, cb) {
    //console.log(req.protocol);
    let key;
    if (id) {
        key = ds.key([kind, parseInt(id, 10)]);
    } else {
        key = ds.key(kind);
    }

    var entity = {
        key: key,
        data: toDatastore(data, ['description'])
    };

    ds.save(
            entity,
            (err) => {
        //        data.id = entity.key.id;
        //cursor = req.protocol + "://"+req.get("host") + req.baseUrl + next + cursor;
        
                data.self = "https://wishlistfinal.appspot.com/api/users/"+entity.key.id;
                    //cargoships-220516.appspot.com/api/shipsor (var i = new_ship.cargo.length-1; i >= 0; i--) {
                key = ds.key([kind, parseInt(entity.key.id, 10)]);
                entity = {
                    key: key,
                    data: toDatastore(data, ['description'])
                };
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
function updates (kind2, id, data, cb) {
    let key;
    console.log(kind2);
    if (id) {
        key = ds.key([kind2, parseInt(id, 10)]);
    } else {
        key = ds.key(kind2);
    }

    var entity = {
        key: key,
        data: toDatastore(data, ['description'])
    };

    ds.save(
            entity,
            (err) => {
          //      data.id = entity.key.id;
          //      data.self = "http://localhost:8080/api/ships/"+entity.key.id;
           //     key = ds.key([kind, parseInt(entity.key.id, 10)]);
                        cb(err, err ? null : data);
            }
           );
}
// [END update]

function create (data, cb) {
    console.log(data);
    //    console.log("In the create function: cb = " +cb);
    update(null, data, cb);
}
function creates (data, cb) {
    console.log(data);
    //    console.log("In the create function: cb = " +cb);
    updates(null, data, cb);
}

function read (id, cb) {
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
function reads (kind, id, cb) {
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

function _delete (id, cb) {
    const key = ds.key([kind, parseInt(id, 10)]);
    ds.delete(key, cb);
}
function _deletes (id, cb) {
    const key = ds.key([kind2, parseInt(id, 10)]);
    ds.delete(key, cb);
}

// [START exports]
module.exports = {
    lists,
    listing,
    reads,
    create,
    read,
    update,
    updates,
    delete: _delete,
    list
};
// [END exports]
