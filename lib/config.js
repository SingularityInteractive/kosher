"use strict"

var fs = require('fs');
var prompt = require('prompt');

var configFile = 'kosher.json';
var config = null;

var schema = {
    properties: {
        jiraUrl: {
            description: 'JIRA URL',
            type: 'string',
            format: 'url',
            required: true
        },
        jiraProject: {
            description: 'JIRA Project(s)',
            type: 'string',
            required: true
        },
        featuresPath: {
            description: 'Feature files path',
            default: 'features/',
            type: 'string',
            required: true
        },
        featuresIssueType: {
            description: 'Feature Issue Type(s)',
            default: 'Epic',
            type: 'string',
            required: true
        },
        featuresField: {
            description: 'Feature Issue Gherkin Field',
            default: 'Description',
            type: 'string',
            required: true
        },
        scenarioRelationshipField: {
            description: 'Scenario Relationship Field',
            default: 'Epic Link',
            type: 'string',
            required: true
        },
        scenarioField: {
            description: 'Scenario Issue Gherkin Field',
            default: 'Description',
            type: 'string',
            required: true
        },
        useLabelsAsTags: {
            description: 'Use Labels as Tags',
            default: true,
            type: 'boolean',
            required: true
        },
        useComponentsAsTags: {
            description: 'Use Components as Tags',
            default: true,
            type: 'boolean',
            required: true
        },
        useVersionAsTags: {
            description: 'Use Fix Versions as Tags',
            default: false,
            type: 'boolean',
            required: true
        },
        useAssigneeAsTag: {
            description: 'Use Assignee as Tag',
            default: true,
            type: 'boolean',
            required: true
        }
    }
};

// Checks if kosher.js already exists and load config if it does
function loadConfig(file) {
    if (!file) file = configFile;

    if(fs.existsSync(file)) {
        try{
            config = JSON.parse(fs.readFileSync(file, 'utf8'));
            for(var prop in config){
                schema.properties[prop].default = config[prop];
            }
            for(var prop in schema.properties){
                if(!config[prop]) config[prop] = schema.properties[prop].default;
            }
        } catch(e) {
            throw("Error parsing config file - " + file);
        }
        // console.log("Config loaded from " + file);
        return true;
    } else {
        // console.log("Config file does not exist: " + file);
        return false;
    }
}

function configure(file, callback) {
    prompt.get(schema, function (err, result) {
        if(!result) {
            if(!!callback) callback(1);
        } else {
            config = result;

            // var saveFile = {};
            // for(var prop in config){
            //     saveFile[prop] = config[prop];
            // }
            // if(!!saveFile.jiraUser) delete saveFile.jiraUser;
            // if(!!saveFile.jiraPassword) delete saveFile.jiraPassword;
            
            fs.writeFileSync(file, JSON.stringify(config, null, 4));

            if(!!callback) callback(0);
        }
    });
}

function getConfig() {
    return config;
}

function getSchema() {
    return schema;
}

exports.loadConfig = loadConfig;
exports.configure = configure;
exports.config = getConfig;
exports.schema = getSchema;