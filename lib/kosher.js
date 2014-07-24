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

function doSync(callback){
    if(!Kosher.config.config()){
        callback(1);
    }

    prompt.get(credSchema, function (err, result) {
        if(!result) {
            callback(1);
        } else {
            process.env.JIRA_USERNAME = result.jiraUser;
            process.env.JIRA_PASSWORD = result.jiraPassword;

            var result = require(lib + "sync.js").sync(function(syncResult){
                console.log('Finished sync.');
                if(!!callback) callback(syncResult); 
            });
        }
    });
}

var Kosher = {
    config: require(lib + "config.js"),
    sync: function(configFilePath, callback) {
        if(!Kosher.config.loadConfig(configFilePath)) {
            prompt.get({
                properties:{
                    create:{
                        description:'No config file found at: '+configFilePath+". Create now? [yes/no]",
                        default: 'y',
                        required: true
                    }
                }
            }, function (err, result) {
                if(result.create.toLowerCase().lastIndexOf('y', 0) == 0){
                    Kosher.config.configure(configFilePath, function(result){
                        if(result == 0)
                            doSync(callback);
                        else 
                            callback(1);
                    });
                }
            });
        } else {
            doSync(callback);
        }
    }
};

exports.kosher = Kosher;