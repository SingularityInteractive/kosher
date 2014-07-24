"use strict"

var path = require('path');
var fs = require('fs');

var lib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib/');

var Kosher = require(lib+'kosher.js').kosher;

function sync(callback) {
    console.log("Syncing with: "+Kosher.config.config().jiraUrl+" ...");

    callback(0);
}

exports.sync = sync;