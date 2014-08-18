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
        jiraPassword: {
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
        return;
    }

    if(!!process.env.JIRA_USERNAME && !!process.env.JIRA_PASSWORD){
        var result = require(lib + "sync.js").sync(function(syncResult){
            console.log('Finished sync.');
            if(!!callback) callback(syncResult); 
        });
    } else {
        if(!!process.env.JIRA_USERNAME)
            credSchema.properties.jiraUser.default = process.env.JIRA_USERNAME;

        if(!!process.env.JIRA_PASSWORD)
            credSchema.properties.jiraPassword.default = process.env.JIRA_PASSWORD;
        
        prompt.get(credSchema, function (err, result) {
            if(!result) {
                callback(1);
            } else {
                process.env.JIRA_USERNAME = result.jiraUser;
                process.env.JIRA_PASSWORD = result.jiraPassword;

                fs.writeFileSync(".env", "JIRA_USERNAME="+process.env.JIRA_USERNAME+"\r\n"+"JIRA_PASSWORD="+process.env.JIRA_PASSWORD+"\r\n");

                require(lib + "sync.js").sync(function(syncResult){
                    console.log('Finished sync.');
                    if(!!callback) callback(syncResult); 
                });
            }
        });
    }
}

function doList(callback) {
    if(!Kosher.config.config()){
        callback(1);
        return;
    }

    require(lib + "list.js").listFeatures(function(result){
        if(!!callback) callback(result);
    });
}

var Kosher = {
    config: require(lib + "config.js"),
    list: function(configFilePath, callback) {
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
                            doList(callback);
                        else 
                            callback(1);
                    });
                }
            });
        } else {
            doList(callback);
        }
    },
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