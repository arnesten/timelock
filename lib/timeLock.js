var _ = require('underscore');
var async = require('async');

module.exports = function (timeout) {

    var keyToQueueMap = {};

    return function (key, callback) {
        var queue = keyToQueueMap[key];
        if (!queue) {
            queue = async.queue(function (work, next) {
                var timeoutId;
                var nextOnce = _.once(function () {
                    clearTimeout(timeoutId);
                    next();
                });
                if (timeout) {
                    timeoutId = setTimeout(function () {
                        nextOnce();
                    }, timeout);
                }
                work(nextOnce);
            }, 1);
            keyToQueueMap[key] = queue;
            queue.drain = function () {
                delete keyToQueueMap[key];
            };
        }
        queue.push(callback);
        queue.process();
    };
};