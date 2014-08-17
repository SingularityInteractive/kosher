process.env.NODE_ENV = 'test';

var should = require('should');
var path = require('path');
var fs = require('fs');

var dotenv = require('dotenv');
dotenv.load();

var testConfigPath = 'test/fixtures/kosher.json';

var lib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib/');

var Kosher = require(lib + 'kosher').kosher;

describe('Sync Tests', function(){

    // before(function(done){
    //     done();
    // });

    // after(function(done){
    //     done();
    // });

    describe('#env', function() {
        it('should have booted into the test env', function(){
            process.env.NODE_ENV.should.equal('test');
        });
    });

    describe('#sync()', function() {
        it.skip('should sync features from JIRA', function(done){
            Kosher.sync(testConfigPath, function(result){
                result.should.equal(0);

                done();
            });
        });

        it.skip('should sync only a single feature', function(done){
            process.env.FEATURE_KEY = 'KOSH-1';

            Kosher.sync(testConfigPath, function(result){
                result.should.equal(0);

                done();
            });
        });

        it.skip('should fail to sync with a bad url', function(done){
            process.env.jiraUrl = 'http://localhost';

            Kosher.sync(testConfigPath, function(result){
                delete process.env.jiraUrl;

                result.should.not.equal(0);

                done();
            });
        });

        it.skip('should sync only a single scenario', function(done){
            process.env.SCENARIO_KEY = 'KOSH-3';

            Kosher.sync(testConfigPath, function(result){
                result.should.equal(0);

                done();
            });
        });

        it.skip('should sync only a single scenario and create a branch for it', function(done){
            process.env.SCENARIO_KEY = 'KOSH-4';
            process.env.CREATE_BRANCH = true;

            Kosher.sync(testConfigPath, function(result){
                result.should.equal(0);

                done();
            }); 
        });

        it('should sync only a single scenario and create a branch for it from a specified remote', function(done){
            process.env.SCENARIO_KEY = 'KOSH-4';
            process.env.CREATE_BRANCH = true;
            process.env.defaultSourceBranch = 'origin/develop';

            Kosher.sync(testConfigPath, function(result){
                result.should.equal(0);

                done();
            }); 
        });
    });
});