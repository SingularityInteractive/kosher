"use strict"

var path = require('path');
var fs = require('fs');
var prompt = require('prompt');

var lib = path.join(path.dirname(fs.realpathSync(__filename)), './');

var credSchema = {
    properties: {
        jiraUser: {
            description: 'JIRA Username',
            type: 'string',
            required: true
        },
        jiraProject: {
            description: 'JIRA Password',
            type: 'string',
            required: true,
            hidden: true
        }
    }
};

var Kosher = {
    config: require(lib + "config.js"),
    sync: function(configFilePath, callback) {
        if(!Kosher.config.loadConfig(configFilePath)) {
            throw('Missing or invalid config file: '+configFilePath);
        }

        if(!Kosher.config.config()){
            throw('Invalid configuration.');
        }

        prompt.get(credSchema, function (err, result) {
            process.env.JIRA_USERNAME = result.jiraUser;
            process.env.JIRA_PASSWORD = result.jiraPassword;

            var result = require(lib + "sync.js").sync(function(syncResult){
                console.log('Finished sync.');
                if(!!callback) callback(syncResult); 
            });
        });
    }
};

exports.kosher = Kosher;