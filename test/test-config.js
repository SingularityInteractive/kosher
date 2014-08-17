process.env.NODE_ENV = 'test';

var should = require('should');
var path = require('path');
var fs = require('fs');

var testConfigPath = 'test/fixtures/kosher.json';

var lib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib/');

var Kosher = require(lib + 'kosher').kosher;

describe('Config Tests', function(){

    // before(function(done){
    //     done();
    // });

    after(function(done){
        delete process.env.jiraUrl;
        delete process.env.jiraProject;
        delete process.env.featuresPath;

        done();
    });

    describe('#env', function() {
        it('should have booted into the test env', function(){
            process.env.NODE_ENV.should.equal('test');
        });
    });

    describe('#loadConfig()', function() {
        it('should load variables from kosher.js if it exists', function(){
            if(Kosher.config.loadConfig(testConfigPath)){
                for(var prop in Kosher.config.schema().properties) {
                    Kosher.config.config().should.have.property(prop);
                }
            }
        });

        it('should not load variables from kosher.js if they are already set in the process environment', function(){
            process.env.jiraUrl = 'http://localhost';
            process.env.jiraProject = 'TEST';
            process.env.featuresPath = 'foo/features/';

            if(Kosher.config.loadConfig(testConfigPath)){
                var config = Kosher.config.config();

                for(var prop in Kosher.config.schema().properties) {
                    config.should.have.property(prop);
                }

                config.jiraUrl.should.equal(process.env.jiraUrl);
                config.jiraProject.should.equal(process.env.jiraProject);
                config.featuresPath.should.equal(process.env.featuresPath);
            };
        });
    });

    describe('#configure', function() {
        it.skip('should allow the user to complete interactive configuration', function(done){
            Kosher.config.configure(testConfigPath, function(){
                console.log('Kosher configuration written to: '+testConfigPath);
                for(var prop in Kosher.config.schema().properties) {
                    Kosher.config.config().should.have.property(prop);
                }
                done();
            });
        });
    });
});