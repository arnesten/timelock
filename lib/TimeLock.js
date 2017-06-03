let async = require('async');

module.exports = TimeLock;

function TimeLock(timeout) {

    let keyToQueueMap = {};

    return (key, callback) => {
        let promise = new Promise(resolve => {
            let queue = keyToQueueMap[key];
            if (!queue) {
                queue = async.queue((work, next) => {
                    let timeoutId;
                    let workEnded = false;
                    let nextOnce = once(() => {
                        clearTimeout(timeoutId);
                        if (workEnded) {
                            next();
                        }
                        else {
                            process.nextTick(() => {
                                next();
                            });
                        }
                    });
                    if (timeout) {
                        timeoutId = setTimeout(() => {
                            nextOnce();
                        }, timeout);
                    }
                    work(nextOnce);
                    workEnded = true;
                }, 1);
                keyToQueueMap[key] = queue;
                queue.drain = () => {
                    delete keyToQueueMap[key];
                };
            }
            queue.push(callback || resolve);
            queue.process();
        });
        if (!callback) {
            return promise;
        }
    };
}

function once(fn) {
    let called = false;
    let value;
    return function () {
        if (called) return value;

        called = true;
        value = fn.apply(null, arguments);
        return value;
    };
}