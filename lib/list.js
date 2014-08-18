"use strict"

var path = require('path');
var fs = require('fs');

var lib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib/');

var Kosher = require(lib+'kosher.js').kosher;
var config = Kosher.config.config();

function getFeature(data, withSpec) {
    var features = withSpec?data.match(/Feature:[\s\S]*?#/):data.match(/.*Feature:.*/);

    if(!!features && features.length > 0)
        return withSpec?features[0].substr(0,features[0].length-1):features[0];
    else
        return ['** [WARN]: NO FEATURE FOUND **'];
};

function getScenarios(data, withSpec) {
    var scenarios = withSpec?data.match(/.*Scenario:[\s\S]*?#/g):data.match(/.*Scenario:.*/g);

    if(!!scenarios && scenarios.length > 0){
        if(withSpec) {
            for(var i = 0; i < scenarios.length; i++) {
                scenarios[i] = scenarios[i].substr(0,scenarios[i].length-1);
            }
            return scenarios;
        } else {
            return scenarios;
        }
    } else {
        return ['** [WARN]: NO SCENARIOS FOUND **'];
    }
}

function listFeatures(callback) {
    if(!config){
        callback(1);
    } else {
        var path = config.featuresPath;

        console.log('--------------------------------------');
        console.log('Feature Specs path: '+path);
        
        var features = fs.readdirSync(path);

        for(var i = 0; i < features.length; i++){
            var file = path+features[i];
            var withSpec = process.env.VERBOSE;

            var stat = fs.statSync(file);
            if(stat.isFile()){
                console.log('\n['+file+']');

                var data = fs.readFileSync(file, 'utf8');
    
                console.log(getFeature(data, withSpec));

                var scenarios = getScenarios(data, withSpec).join('\n');
                console.log(scenarios.substr(0,scenarios.length-1));

            }
        }
        console.log('--------------------------------------');

        callback(0);   
    }
}

exports.listFeatures = listFeatures;