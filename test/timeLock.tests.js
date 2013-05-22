var buster = require('buster');
var sinon = require('sinon');
var testCase = buster.testCase;
var assert = buster.assertions.assert;
var refute = buster.assertions.refute;
var TimeLock = require('../lib/timeLock.js');

module.exports = testCase('TimeLock', {
    'when locked on key no other access are called': function () {
        var stub1 = sinon.stub();
        var stub2 = sinon.stub();
        var stub3 = sinon.stub();
        var lock = TimeLock();
        lock('A', stub1);
        lock('A', stub2);
        lock('A', stub3);

        assert.calledOnce(stub1);
        refute.called(stub2);
        refute.called(stub3);
    },
    'when locked on different keys, all access are called directly': function () {
        var stub1 = sinon.stub();
        var stub2 = sinon.stub();
        var stub3 = sinon.stub();
        var lock = TimeLock();
        lock('A', stub1);
        lock('B', stub2);
        lock('C', stub3);

        assert.calledOnce(stub1);
        assert.calledOnce(stub2);
        assert.calledOnce(stub3);
    },
    'when locked on key and then released synchronously, new access can be made directly': function () {
        var stub1 = sinon.spy();
        var stub2 = sinon.stub();
        var lock = TimeLock();
        lock('A', stub1);
        stub1.firstCall.args[0](); // release
        lock('A', stub2);

        assert.calledOnce(stub2);
    }
});