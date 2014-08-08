process.env.NODE_ENV = 'test';

var should = require('should');
var path = require('path');
var fs = require('fs');

var testConfigPath = 'test/fixtures/kosher.json';

var lib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib/');

var Kosher = require(lib + 'kosher').kosher;

describe('Sync Tests', function(){

    // before(function(done){
    //     done();
    // });

    // after(function(done){
    //     done();
    // })

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

        it.skip('should sync features from JIRA without prompting for credentials', function(done){
            process.env.JIRA_USERNAME = '***REMOVED***';
            process.env.JIRA_PASSWORD = '***REMOVED***';

            Kosher.sync(testConfigPath, function(result){
                result.should.equal(0);

                done();
            });
        });

        it.skip('should sync only a single feature', function(done){
            process.env.JIRA_USERNAME = '***REMOVED***';
            process.env.JIRA_PASSWORD = '***REMOVED***';
            process.env.FEATURE_KEY = 'KOSH-1';

            Kosher.sync(testConfigPath, function(result){
                result.should.equal(0);

                done();
            });
        });

        it.skip('should sync only a single scenario', function(done){
            process.env.JIRA_USERNAME = '***REMOVED***';
            process.env.JIRA_PASSWORD = '***REMOVED***';
            process.env.SCENARIO_KEY = 'KOSH-3';

            Kosher.sync(testConfigPath, function(result){
                result.should.equal(0);

                done();
            });
        });
    });
});