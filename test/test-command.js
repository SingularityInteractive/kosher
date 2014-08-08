process.env.NODE_ENV = 'test';

// var util  = require('util')
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var should = require('should');
var path = require('path');
var fs = require('fs');

var testConfigPath = 'test/fixtures/kosher.json';

var bin = path.join(path.dirname(fs.realpathSync(__filename)), '../bin/');

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

    describe('#command', function() {
        it('should not allow --feature and --scenario to both be specified', function(done){
            child = exec(bin+'jira-kosher --feature KOSH-1 --scenario KOSH-3', function (error, stdout, stderr) {
                (error != null).should.be.ok;

                done();
            });
        });

        it('should not allow --feature and --createBranch to both be specified', function(done){
            child = exec(bin+'jira-kosher --feature KOSH-1 --createBranch', function (error, stdout, stderr) {
                (error != null).should.be.ok;

                done();
            });
        });

        it('should not allow --createBranch without <scenario_key>', function(done){
            child = exec(bin+'jira-kosher --createBranch', function (error, stdout, stderr) {
                (error != null).should.be.ok;

                done();
            });
        });
    });

    describe('#sync', function() {
        it('should sync features from JIRA', function(done){
            var kosher = spawn(bin+'jira-kosher', [
                '--username', '***REMOVED***',
                '--password', '***REMOVED***'
            ]);

            kosher.stdout.on('data', function (data) {
                console.log(data.toString());
            });

            kosher.stderr.on('data', function (data) {
                console.log('stderr: ' + data);
            });

            kosher.on('exit', function (code) {
                console.log('child process exited with code ' + code);
                code.should.equal(0);

                done();
            });

            // child = exec(bin+'jira-kosher --username ***REMOVED*** --password ***REMOVED***', function (error, stdout, stderr) {
            //     (error == null).should.be.ok;

            //     done();
            // });
        });

        it('should sync a single feature from JIRA', function(done){
            var kosher = spawn(bin+'jira-kosher', [
                '--username', '***REMOVED***',
                '--password', '***REMOVED***',
                '--feature', 'KOSH-1'
            ]);

            kosher.stdout.on('data', function (data) {
                console.log(data.toString());
            });

            kosher.stderr.on('data', function (data) {
                console.log('stderr: ' + data);
            });

            kosher.on('exit', function (code) {
                console.log('child process exited with code ' + code);
                code.should.equal(0);

                done();
            });

            // child = exec(bin+'jira-kosher --username ***REMOVED*** --password ***REMOVED***', function (error, stdout, stderr) {
            //     (error == null).should.be.ok;

            //     done();
            // });
        });

        it.skip('should sync a single scenario from JIRA', function(done){
            var kosher = spawn(bin+'jira-kosher', [
                '--username', '***REMOVED***',
                '--password', '***REMOVED***',
                '--scenario', 'KOSH-3'
            ]);

            kosher.stdout.on('data', function (data) {
                console.log(data.toString());
            });

            kosher.stderr.on('data', function (data) {
                console.log('stderr: ' + data);
            });

            kosher.on('exit', function (code) {
                console.log('child process exited with code ' + code);
                code.should.equal(0);

                done();
            });

            // child = exec(bin+'jira-kosher --username ***REMOVED*** --password ***REMOVED***', function (error, stdout, stderr) {
            //     (error == null).should.be.ok;

            //     done();
            // });
        });
    });
});