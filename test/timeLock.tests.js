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
    },
    'when locked on key with timeout = 1000ms': {
        setUp: function () {
            this.clock = sinon.useFakeTimers(Date.UTC(2000, 0, 1));
            this.lock = TimeLock(1000);
            this.stub1 = sinon.stub();
            this.stub2 = sinon.stub();
            this.lock('A', this.stub1);
            this.lock('A', this.stub2);
        },
        tearDown: function () {
            this.clock.restore();
        },
        'and first in queue is done': {
            setUp: function () {
                this.stub1.firstCall.args[0]();
            },
            'should access the next in queue': function () {
                assert.calledOnce(this.stub2);
            },
            'and >1000ms goes should NOT call it again': function () {
                this.clock.tick(3000);
                assert.calledOnce(this.stub1);
                assert.calledOnce(this.stub2);
            }
        },
        'and 999ms goes should NOT call next in queue': function () {
            this.clock.tick(999);
            assert.calledOnce(this.stub1);
            refute.called(this.stub2);
        },
        'and 1000ms goes': {
            setUp: function () {
                this.clock.tick(1000);
            },
            'should call next in queue': function () {
                assert.calledOnce(this.stub1);
                assert.calledOnce(this.stub2);
            },
            'and first in queue is done should NOT call the next in queue again': function () {
                this.stub1.firstCall.args[0]();
                assert.calledOnce(this.stub1);
                assert.calledOnce(this.stub2);
            }
        }
    }
});