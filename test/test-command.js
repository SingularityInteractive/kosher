process.env.NODE_ENV = 'test';

// var util  = require('util')
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var should = require('should');
var path = require('path');
var fs = require('fs');

var testConfigPath = 'test/fixtures/kosher.json';

var bin = path.join(path.dirname(fs.realpathSync(__filename)), '../bin/');

function cmd(command, callback, streamOutput){
    if(streamOutput){
        var procs = command.split(' ');
        var proc = spawn(procs[0], (procs.length > 1)?procs.slice(1, 1+procs.length-1):[]);

        proc.stdout.on('data', function (data) {
            console.log(data.toString());
        });

        proc.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });

        proc.on('exit', function (code) {
            console.log('child process exited with code ' + code);

            callback(code);
        });

        
    } else {
        exec(command, function (error, stdout, stderr) {
            callback(error?error.code:0);
        });
    }
}

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
            cmd(bin+'jira-kosher --feature KOSH-1 --scenario KOSH-3', function(result){
                result.should.not.equal(0);

                done();
            });
        });

        it('should not allow --feature and --createBranch to both be specified', function(done){
            cmd(bin+'jira-kosher --feature KOSH-1 --createBranch', function(result){
                result.should.not.equal(0);

                done();
            });
        });

        it('should not allow --createBranch without <scenario_key>', function(done){
            cmd(bin+'jira-kosher --createBranch', function(result){
                result.should.not.equal(0);

                done();
            });
        });
    });

    describe('#sync', function() {
        it('should sync features from JIRA', function(done){
            cmd(bin+'jira-kosher', function(result){
                result.should.equal(0);

                done();
            });
        });

        it.skip('should sync a single feature from JIRA', function(done){
            cmd(bin+'jira-kosher --feature KOSH-1', function(result){
                result.should.equal(0);

                done();
            });
        });

        it.skip('should sync a single scenario from JIRA', function(done){
            cmd(bin+'jira-kosher --scenario KOSH-3', function(result){
                result.should.equal(0);

                done();
            });
        });
    });
});