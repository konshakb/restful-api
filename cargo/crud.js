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

// Automatically parse request body as form data
router.use(bodyParser.urlencoded({ extended: false }));

// Set Content-Type for all responses for these routes
router.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});

/**
 * GET /ships
 *
 * Display a page of ships (up to ten at a time).
 */
router.get('/', (req, res, next) => {
    
  const data2 = req.body;
//  console.log(req.query.pageToken);
  getModel().list(10, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.render('ships/lists.pug', {
      ships: entities,
      nextPageToken: cursor
    });
  });
});

/**
 * GET /ships/add
 *
 * Display a form for creating a ship.
 */
// [START add_get]
router.get('/add', (req, res) => {
  res.render('ships/forms.pug', {
    ship: {},
    action: 'Add'
  });
});
// [END add_get]

/**
 * POST /ships/add
 *
 * Create a ship.
 */
// [START add_post]
router.post('/add', (req, res, next) => {
  const data = req.body;
  console.log(data);

  // Save the data to the database.
  getModel().create(data, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(`${req.baseUrl}/${savedData.id}`);
  });
});
// [END add_post]

/**
 * GET /ships/:id/edit
 *
 * Display a ship for editing.
 */
router.get('/:ship/edit', (req, res, next) => {
  getModel().read(req.params.ship, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('ships/forms.pug', {
      ship: entity,
      action: 'Edit'
    });
  });
});

/**
 * POST /ships/:id/edit
 *
 * Update a ship.
 */
router.post('/:ship/edit', (req, res, next) => {
  const data = req.body;

  getModel().update(req.params.ship, data, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(`${req.baseUrl}/${savedData.id}`);
  });
});

/**
 * GET /ships/:id
 *
 * Display a ship.
 */
router.get('/:ship', (req, res, next) => {
  getModel().read(req.params.ship, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('ships/view.pug', {
      ship: entity
    });
  });
});

/**
 * GET /ships/:id/delete
 *
 * Delete a ship.
 */
router.get('/:ship/delete', (req, res, next) => {
  getModel().delete(req.params.ship, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(req.baseUrl);
  });
});

/**
 * Errors on "/ships/*" routes.
 */
router.use((err, req, res, next) => {
  // Format error and forward to generic error handler for logging and
  // responding to the request
  err.response = err.message;
  next(err);
});

module.exports = router;
