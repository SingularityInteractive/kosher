"use strict"

var path = require('path');
var fs = require('fs');
var rest = require('rest');
var mime = require('rest/interceptor/mime');
var basicAuth = require('rest/interceptor/basicAuth');

var lib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib/');

var Kosher = require(lib+'kosher.js').kosher;

var client = rest.wrap(basicAuth, { 
    username: process.env.JIRA_USERNAME, 
    password: process.env.JIRA_PASSWORD 
}).wrap(mime, { mime: 'application/json' });

var config = Kosher.config.config();

var api = config.jiraUrl+"/rest/api/2/";

var fields = {};

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

function getFieldIds(fieldNames, callback) {
    console.log("Getting field IDs for fields: "+fieldNames+" ...");

    client({ 'path': api+'field' }).then(
        function(response){
            for(var i = 0; i < response.entity.length; i++) {
                var field = response.entity[i];

                if(fieldNames.contains(field.name)){
                    // console.log('response: ', response.entity);
                    console.log(' - '+field.name+': fieldId = '+field.id);
                    fields[field.name] = field.id;
                }
            }

            callback(0);
        },
        function(response){
            console.error('response error: ', response.entity);

            callback(1);
        }
    );
}

function printTags(issue) {
    // Print issuekey as tag
    var tags = "@"+issue.key;

    // Print label tags
    if(!!config.useLabelsAsTags){
        for(var idx = 0; idx < issue.fields.labels.length; idx++){
            tags += " @"+issue.fields.labels[idx];
        }
    }

    // Print component tags
    if(!!config.useComponentsAsTags){
        for(var idx = 0; idx < issue.fields.components.length; idx++){
            tags += " @"+issue.fields.components[idx].name;
        }

    }

    // Print version tags
    if(!!config.useVersionsAsTags){
        for(var idx = 0; idx < issue.fields.fixVersions.length; idx++){
            tags += " @"+issue.fields.fixVersions[idx].name;
        }
    }

    return tags;
}

function generateFeature(featureIssue){
    if(!!featureIssue.fields[fields[config.featuresField]]){
        console.log("Creating feature from: "+featureIssue.key);

        var feature = printTags(featureIssue);

        // Print feature
        feature += "\r\n"+featureIssue.fields[fields[config.featuresField]]+"\r\n";
        
        // Save
        var filepath = config.featuresPath+featureIssue.key+".feature";

        fs.writeFileSync(filepath, feature);
    }
}

function generateScenario(scenarioIssue) {
    if(!!scenarioIssue.fields[fields[config.scenarioField]]){
        console.log("  Creating scenario from: "+scenarioIssue.key);

        var scenario = "  "+printTags(scenarioIssue);

        scenario += "\r\n"+scenarioIssue.fields[fields[config.scenarioField]];

        scenario = scenario.split("\r\n").join("\r\n  ");

        var filepath = config.featuresPath+scenarioIssue.fields[fields[config.scenarioRelationshipField]]+".feature";

        fs.appendFileSync(filepath, "\r\n"+scenario+"\r\n");
    }
}

function sync(callback) {
    console.log("Syncing with: "+Kosher.config.config().jiraUrl+" ...");

    if(!fs.existsSync(config.featuresPath)) fs.mkdirSync(config.featuresPath);

    var fieldNames = [config.scenarioRelationshipField, config.featuresField];
    if(!fieldNames.contains(config.scenarioField)) fieldNames.push(config.scenarioField);

    var requests = 0;

    getFieldIds(fieldNames, function(result){
        if(!result){
            requests++;
            var jql = "project in ("+config.jiraProject+")";
            jql += " AND issueType in ("+config.featuresIssueType+")";
            if(process.env.ISSUE_KEY) jql += " AND issuekey = "+process.env.ISSUE_KEY;
            client({ 'method': 'POST', 'path': api+'search', entity:{
              "jql": jql,
              "startAt": 0,
              "maxResults": 1000,
              "fields": [
                "summary",
                "status",
                "labels",
                "components",
                "fixVersions",
                "assignee",
                fields[config.featuresField]
              ]
            } }).then(
                function(response) {
                    requests--;
                    var max_i = response.entity.issues.length;
                    for(var i = 0; i < max_i; i++){
                        var featureIssue = response.entity.issues[i];

                        generateFeature(featureIssue);

                        requests++;

                        client({ 'method': 'POST', 'path': api+'search', entity:{
                          "jql": 'project in ('+config.jiraProject+') AND \''+config.scenarioRelationshipField+'\' = '+featureIssue.key,
                          "startAt": 0,
                          "maxResults": 1000,
                          "fields": [
                            "summary",
                            "status",
                            "labels",
                            "components",
                            "fixVersions",
                            "assignee",
                            fields[config.scenarioRelationshipField],
                            fields[config.scenarioField]
                          ]
                        } }).then(
                            function(response) {
                                requests--;
                                var max_j = response.entity.issues.length
                                for(var j = 0; j < max_j; j++){
                                    var scenarioIssue = response.entity.issues[j];

                                    generateScenario(scenarioIssue);
                                }

                                if(requests == 0) callback(0);
                            },
                            function(response) {
                                console.error('response error: ', response.entity);

                                callback(1);
                            }
                        );
                    }
                },
                function(response) {
                    console.error('response error: ', response.entity);

                    callback(1);
                }
            );
        } else {
            callback(1);
        }
    });
}

exports.sync = sync;