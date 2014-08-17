"use strict"

var exec = require('child_process').exec;
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

var requests = 0;

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

    // Print assignee tags
    if(!!config.useAssigneeAsTag){
        if(!!issue.fields.assignee){
            tags += " @"+issue.fields.assignee.name;
        }
    }

    return tags;
}

function generateFeature(featureIssue){
    if(!!featureIssue.fields[fields[config.featuresField]]){
        console.log("Creating feature from: "+featureIssue.key);

        var feature = "# +["+featureIssue.key+"]+\r\n";

        feature += printTags(featureIssue);

        // Print feature
        feature += "\r\n"+featureIssue.fields[fields[config.featuresField]]+"\r\n";
        
        feature += "# -["+featureIssue.key+"]-\r\n";

        // Save
        var filepath = config.featuresPath+featureIssue.key+".feature";

        fs.writeFileSync(filepath, feature);
    }
}

function generateScenario(scenarioIssue, createBranch) {
    if(!!scenarioIssue.fields[fields[config.scenarioField]]) {
        console.log("  Creating scenario from: "+scenarioIssue.key);

        var scenario = "# +["+scenarioIssue.key+"]+\r\n";
        var featureKey = scenarioIssue.fields[fields[config.scenarioRelationshipField]];

        scenario += printTags(scenarioIssue);

        scenario += "\r\n"+scenarioIssue.fields[fields[config.scenarioField]];

        scenario = scenario.split("\r\n").join("\r\n  ");

        scenario += "\r\n# -["+scenarioIssue.key+"]-\r\n";

        var filepath = config.featuresPath+featureKey+".feature";

        replaceScenarioInFile(filepath, scenarioIssue.key, scenario);
    }
}

function replaceScenarioInFile(filepath, scenarioKey, newScenario) {
    var data = fs.readFileSync(filepath, 'utf8');

    if (data.indexOf("# +["+scenarioKey+"]+") != -1){
        var regEx = new RegExp('# \\+\\['+scenarioKey+'\\]\\+[.\\s\\S]*?# \\-\\['+scenarioKey+'\\]\\-', 'g');
        var result = data.replace(regEx, newScenario);
        fs.writeFileSync(filepath, result);
    } else {
        fs.appendFileSync(filepath, "\r\n"+newScenario+"\r\n");
    }
}

function syncFromFeature(callback, syncScenarios, featureKey) {
    requests++;
    
    var jql = "project in ("+config.jiraProject+")";
    
    jql += " AND issueType in ("+config.featuresIssueType+")";
    
    if(process.env.FEATURE_KEY) jql += " AND issuekey = "+process.env.FEATURE_KEY;
    else if(!!featureKey) jql += " AND issuekey = "+featureKey;

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
    } }).then(function(response) {
        requests--;
        if(response.status.code != 200 || !response.entity.issues) {
            console.error('response error: ', response.entity);
            callback(1);
            return;
        }
        var max_i = response.entity.issues.length;
        for(var i = 0; i < max_i; i++){

            var featureIssue = response.entity.issues[i];

            generateFeature(featureIssue);

            if(!!syncScenarios){

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
                } }).then(function(response) {
                    requests--;
                    if(response.status.code != 200 || !response.entity.issues) {
                        console.error('response error: ', response.entity);
                        callback(1);
                        return;
                    }
                    var max_j = response.entity.issues.length;
                    for(var j = 0; j < max_j; j++){
                        var scenarioIssue = response.entity.issues[j];

                        generateScenario(scenarioIssue);
                    }

                    if(requests == 0) callback(0);
                },
                function(response) {
                    console.error('response error: ', response.entity);

                    callback(1);
                });
            } else {
                callback(0);
            }
        }
    },
    function(response) {
        console.error('response error: ', response.entity);

        callback(1);
    });
}

function syncFromScenario(callback, createBranch){
    requests++;
    if(!process.env.SCENARIO_KEY) {
        console.error('no scenario key defined');
        callback(1);
        return;
    }

    var jql = "project in ("+config.jiraProject+")";
    jql += " AND issuekey = "+process.env.SCENARIO_KEY;
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
        fields[config.scenarioRelationshipField],
        fields[config.scenarioField]
      ]
    } }).then(function(response) {
        requests--;
        if(response.status.code != 200 || !response.entity.issues) {
            console.error('response error: ', response.entity);
            callback(1);
            return;
        }
        var max_i = response.entity.issues.length;
        for(var i = 0; i < max_i; i++){
            var scenarioIssue = response.entity.issues[i];
            var featureKey = scenarioIssue.fields[fields[config.scenarioRelationshipField]];
            var filepath = config.featuresPath+featureKey+".feature";

            if(!fs.existsSync(filepath)){
                syncFromFeature(function(){
                    generateScenario(scenarioIssue, createBranch);
                    
                    if(!!createBranch) {
                        createBranchFromScenario(scenarioIssue, function(result){
                            if(requests == 0) callback(result);
                        });
                    } else {
                        if(requests == 0) callback(0);   
                    }
                }, false, featureKey);
            } else {
                generateScenario(scenarioIssue, createBranch);

                if(!!createBranch) {
                    createBranchFromScenario(scenarioIssue, function(result){
                        if(requests == 0) callback(result);
                    });
                }
            }
        }

        if(requests == 0) callback(0);
    },
    function(response) {
        console.error('response error: ', response.entity);

        callback(1);
    });
}

function createBranchFromScenario(scenarioIssue, callback) {
    var branchName = scenarioIssue.key + "__" + scenarioIssue.fields.summary.replace(/\s/g, '-').toLowerCase();
    console.log('new branch name: '+branchName);

    requests++;
    exec('git fetch --all --prune', function (error, stdout, stderr) {
        requests--;

        requests++;
        exec('git show-branch -r'+branchName, function (error, stdout, stderr) {
            requests--;

            if(error){
                // console.log('branch does not exist on the remote');
                requests++;
                exec('git show-branch '+branchName, function (error, stdout, stderr) {
                    requests--;

                    if(error){
                        // console.log('branch does not exist locally');
                        requests++;
                        exec('git branch --no-track '+branchName+' '+config.defaultSourceBranch, function (error, stdout, stderr) {
                            requests--;

                            if(error){
                                console.error('branch could not be created');
                                throw(error);
                                callback(1);
                            } else {
                                console.log('branch "'+branchName+'" created');
                                requests++;
                                exec('git push -u origin '+branchName+':'+branchName, function (error, stdout, stderr) {
                                    requests--;

                                    if(error){
                                        console.error('branch could not be pushed');
                                        throw(error);
                                        callback(1);
                                    } else {
                                        // console.log('branch upstream set to "origin/'+branchName+'"');
                                        requests++;
                                        // git diff --exit-code
                                        exec('git diff --exit-code', function (error, stdout, stderr) {
                                            requests--;
                                            if(error){
                                                console.log('could not checkout new branch: working directory not clean');
                                                callback(0);
                                            } else {
                                                exec('git checkout '+branchName, function (error, stdout, stderr) {
                                                    requests--;

                                                    if(error){
                                                        console.error('branch could not be checked out');
                                                        throw(error);
                                                        callback(1);
                                                    } else {
                                                        // console.log('branch upstream set to "origin/'+branchName+'"');
                                                        callback(0);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        console.error('branch already exists locally');
                        throw(new Error('branch already exists locally'));
                        callback(1);
                    }
                });
            } else {
                console.error('branch already exists on the remote');
                throw(new Error('branch already exists on the remote'));
                callback(1);
            }
        });
    });
}

function sync(callback) {
    console.log("Syncing with: "+Kosher.config.config().jiraUrl+" ...");

    if(!fs.existsSync(config.featuresPath)) fs.mkdirSync(config.featuresPath);

    var fieldNames = [config.scenarioRelationshipField, config.featuresField];
    if(!fieldNames.contains(config.scenarioField)) fieldNames.push(config.scenarioField);

    requests = 0;

    getFieldIds(fieldNames, function(result){
        if(!result){
            if(process.env.CREATE_BRANCH){
                syncFromScenario(function(result){
                    callback(result);
                }, true);
            } else if(process.env.SCENARIO_KEY){
                syncFromScenario(function(result){
                    callback(result);
                });
            } else {
                syncFromFeature(function(result){
                    callback(result);
                }, true);
            }
        } else {
            callback(1);
        }
    });
}

exports.sync = sync;