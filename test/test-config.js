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

    describe('#loadConfig()', function() {
        it('should load variables from kosher.js if it exists', function(){
            if(Kosher.config.loadConfig(testConfigPath)){
                for(var prop in Kosher.config.schema().properties) {
                    Kosher.config.config().should.have.property(prop);
                }
            }
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