"use strict"

var path = require('path');
var fs = require('fs');
// var request = require('request');
// var Client = require('node-rest-client').Client;
var rest = require('rest');
var mime = require('rest/interceptor/mime');
var basicAuth = require('rest/interceptor/basicAuth');

var lib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib/');

var Kosher = require(lib+'kosher.js').kosher;

// var options_auth={
//     user:process.env.JIRA_USERNAME,
//     password:process.env.JIRA_PASSWORD,
//     mimetypes: {
//         json:["application/json","application/json;charset=utf-8"]
//     }
// };

// var client = new Client(options_auth);

// client.on('error',function(err){
//     console.error('Something went wrong on the client', err);
// });

var client = rest.wrap(basicAuth, { 
    username: process.env.JIRA_USERNAME, 
    password: process.env.JIRA_PASSWORD 
}).wrap(mime, { mime: 'application/json' });

function sync(callback) {
    console.log("Syncing with: "+Kosher.config.config().jiraUrl+" ...");

    var uri = Kosher.config.config().jiraUrl+"/rest/api/2/";

    client({ 'path': uri+'serverInfo' }).then(
        function(response) {
        
            console.log('response: ', response.entity);

            callback(0);
        },
        function(response) {
        
            console.error('response error: ', response.entity);

            callback(1);
        }
    );
}

exports.sync = sync;