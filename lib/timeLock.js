var async = require('async');

module.exports = function (timeout) {

	var mapToQueue = {};

	return function (key, callback) {
		var doWork = function () {
			callback();
		};

		var queue = mapToQueue[key];
		if (!queue) {
			mapToQueue[key] = [doWork];
		}

		if (!queue) {
			queue = async.queue(function (queueDoWork, queueCallback) {
				queueDoWork(function () {
					queueCallback();
				});
			}, 1);
			mapToQueue[key] = queue;
			queue.drain = function () {
				delete mapToQueue[key];
			};
		}
		queue.push({ doWork: doWork, workOptions: options });
	};
};