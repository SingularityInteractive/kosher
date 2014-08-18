process.env.NODE_ENV = 'test';

var should = require('should');
var path = require('path');
var fs = require('fs');

var testConfigPath = 'test/fixtures/kosher.json';

var lib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib/');

var Kosher = require(lib + 'kosher').kosher;

describe('List Tests', function(){

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

    describe('#listFeatures()', function() {
        it('should list all feeatures', function(done){
            Kosher.list(testConfigPath, function(result){
                result.should.equal(0);

                done();
            });
        });

        it('should list all features with spec', function(done){
            process.env.VERBOSE = true;
            Kosher.list(testConfigPath, function(result){
                delete process.env.VERBOSE;
                
                result.should.equal(0);

                done();
            });
        });
    });
});