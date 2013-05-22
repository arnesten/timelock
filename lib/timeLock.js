var async = require('async');

module.exports = function (timeout) {

	var mapToQueue = {};

	return function (key, callback) {
		var queue = mapToQueue[key];
		if (!queue) {
			queue = async.queue(function (work, next) {
				work(next);
			}, 1);
			mapToQueue[key] = queue;
			queue.drain = function () {
				delete mapToQueue[key];
			};
		}
		queue.push(callback);
        queue.process();
	};
};