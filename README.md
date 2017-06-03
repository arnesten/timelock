# timelock

Lock a resource with optional timeout.

## Example with promises

```javascript
var TimeLock = require('timelock');

var lock = TimeLock(2000);

// Lock on the key 'A'
let release = await lock('A');
doSomethingAsync(() => {
    release();
});

lock('A').then(release2 => {;
    // Will not be called until first lock released or 2000 ms have passed
});
```

## Example with callback

```javascript
var TimeLock = require('timelock');

var lock = TimeLock(2000);

// Lock on the key 'A'
lock('A', function (release) {
    // Called directly since no other have locked on 'A'
    doSomethingAsync(function () {
        release();
    });
});

lock('A', function (release) {
    // Will not be called until lock released or 2000 ms have passed
});
```

## Create lock

Signature for creating a lock is `TimeLock(timeout)`.
If no timeout is given, the lock will remain until released.

## Lock on key

Signature for locking on a key is `lock(key, callback)`, where `key` could be any string.
As soon as `key` is available (or timed out), the `callback` is called.
The callback signature is `(release)`, and `release` should be called to release the lock and allow
other queued callbacks to be called.

## License

(The MIT License)

Copyright (c) 2013-2017 Calle Arnesten

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
