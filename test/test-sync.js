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

    // after(function(done){
    //     done();
    // })

    describe('#env', function() {
        it('should have booted into the test env', function(){
            process.env.NODE_ENV.should.equal('test');
        });
    });

    describe('#sync()', function() {
        it('should sync features from JIRA', function(done){
            Kosher.sync(testConfigPath, function(result){
                result.should.equal(0);

                done();
            });
        });
    });
});