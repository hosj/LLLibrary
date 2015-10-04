/**
 * models/index.js
 * All models are here to import all of them just with one command
 * in the main app.js, and by the way we connect to MongoDB
 * Better to use an external config.. I know.
 * https://github.com/pello-io/simple-express-mongoose
 * Pello Altadill - http://pello.info
 */
var mongoose = require('mongoose');
var db = require('../db')
mongoose.connect(db.url);
// optionally:
//mongoose.set('debug', true);

//exports.Person = require('./person');
