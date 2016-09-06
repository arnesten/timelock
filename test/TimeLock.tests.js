'use strict';
let bocha = require('bocha');
let sinon = bocha.sinon;
let testCase = bocha.testCase;
let assert = bocha.assert;
let refute = bocha.refute;
let TimeLock = require('../lib/TimeLock.js');

module.exports = testCase('TimeLock', {
	'when locked on key no other access are called': function () {
		let stub1 = sinon.stub();
		let stub2 = sinon.stub();
		let stub3 = sinon.stub();
		let lock = TimeLock();
		lock('A', stub1);
		lock('A', stub2);
		lock('A', stub3);

		assert.calledOnce(stub1);
		refute.called(stub2);
		refute.called(stub3);
	},
	'when locked on different keys, all access are called directly': function () {
		let stub1 = sinon.stub();
		let stub2 = sinon.stub();
		let stub3 = sinon.stub();
		let lock = TimeLock();
		lock('A', stub1);
		lock('B', stub2);
		lock('C', stub3);

		assert.calledOnce(stub1);
		assert.calledOnce(stub2);
		assert.calledOnce(stub3);
	},
	'when locked on key and then released synchronously, new access can be made directly': function () {
		let stub1 = sinon.spy();
		let stub2 = sinon.stub();
		let lock = TimeLock();
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
	},
	'can be created with new keyword': function () {
		let stub1 = sinon.stub();
		let stub2 = sinon.stub();
		let lock = new TimeLock();
		lock('A', stub1);
		lock('A', stub2);

		assert.calledOnce(stub1);
		refute.called(stub2);
	},
	'when released should not run until callback has finished': function (done) {
		// Rationale: Sometimes the lock is released before all operations in callback are finished
		let lock = new TimeLock();
		lock('A', function (release) {
			let stub = sinon.stub();
			lock('A', stub);

			release();
			refute.called(stub);
			setTimeout(function () {
				assert.called(stub);
				done();
			}, 1);
		});
	}
});