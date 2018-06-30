# cupping
Yet another javascript testing library. This module was inspired by [this article](https://medium.com/javascript-scene/why-i-use-tape-instead-of-mocha-so-should-you-6aa105d8eaf4) and [node-tap](http://www.node-tap.org/only/). This library has a few subtle differences though based on these tenets.
1. Asynchronicity should be supported by default.
1. It should run correctly (I'm looking at you [blue-tape](https://github.com/spion/blue-tape/issues/31)).
1. You shouldn't need a library to test if two things aren't equal. `assert(1 !== 2, 'something is wrong');` will work just fine. If you need to do deep comparisons or things of that nature, there are great utility [libraries](http://ramdajs.com/) out there to help you with that.
1. You shouldn't have to tell the test framework how many tests or asserts you plan on running, and you shouldn't have to tell it when you are finished.

## Getting Started
Installation: `npm i --save-dev cupping`

Say for example, you had the file test.js:

```javascript
const cup = require('cupping');

// Syncrhonous test case
cup.test('One and one is two', () => {
    console.assert(1 + 1 === 2);
});

// Asynchronous test cases
function delay() {
    return new Promise(function (resolve) {
        setTimeout(resolve, 1000);
    });
}

cup.test('Should pass after 1 second', () => delay());

cup.test('Should fail after 1 second', () => (
    delay().then(() => {
        throw Error('Failed!');
    })
));
```

Then simply call `node test.js`. For more examples checkout out [test/pass.js](https://github.com/feus4177/cupping/blob/master/test/pass.js) and [test/fail.js](https://github.com/feus4177/cupping/blob/master/test/fail.js).

## API
### test(name, promise)
Creates a new test case. Will not be run if `process.env.CUP_ONLY` is set to a truthy value.
- `name`: {String}, The name or label for this test case.
- `promise`: {Promise|function}, The code to be tested. The test case will be marked as succeeded or failed if `promise` resolves or rejects, respectively. If `promise` is a function and it throws an error, the test case will be marked as failed. If the function is synchronous and no errors are thrown, the test case is marked as succeeded. If `promise` is an [async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function), it will only be marked as succeeded once it finishes. If `promise` is a function that returns a promise, the test case will be marked as succeeded or failed if the promise resolves or rejects, respectively.
- returns: A `Promise` that is resolved with an object describing the result of the test case. The object will have the following keys:
  - `name`: {String}, The same as above.
  - `succeeded`: {Bool}, Whether or not the test case passed.
  - `reason`: {Any}, The reason the test case failed. Usually an `Error` or string. If the test case passed, it will be `undefined`.

### testOnly(name, promise)
Same as `test` but will still be run even if `process.env.CUP_ONLY` is set to a truthy value.

### serial(name, promise, key = 'default')
Creates a new serial test case. Same as `test` except that serial test cases with the same `key` are run, one after the other, in the order that they are created. Series of test cases with different keys will be run in parallel with one another.
- `key`: {String}, A key to specify which series of test cases this test case belongs to.

### serialOnly(name, promise, key = 'default')
Same as `serial` but will still be run if `process.env.CUP_ONLY` is set to a truthy value.

### shouldThrow(fn, regex)
Decorator that is designed to wrap test functions that should throw an error synchronously. If `fn` does not throw an error or a regex was provided and the error message does not match the provided regex then the test case will be marked as failed. Example Usage:
```javascript
cup.test('Should pass', cup.shouldThrow(() => {
    throw Error();
}));

cup.test('Should fail', cup.shouldThrow(() => null));
```
- `fn`: {function}, The test function to be wrapped.
- `regex`: {regex}, Optional regex to ensure the correct error message is thrown.

### shouldReject(fn, regex)
Similiar to `shouldThrow` except that it expects `promise` to either be a `Promise` or return a `Promise` that will be rejected. `shouldReject` also has the added caveat that the rejection reason should either be falsey or an instance of `Error`.
- `promise`: {Promise}, The test function to be wrapped.
- `regex`: {regex}, Optional regex to ensure the correct error message is thrown.

### emitter
An instance of the [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter) class. It can be used to listen to cupping events using the `emitter.on` method. All cupping events are passed the name of the test case as the only argument. The events are:
- start
- end
- success
- failure

## Environmental Variables
There are also two environmental variables that can be set to control cupping behavior. Truthy values for environmental variables are considered to be as follows: `['1', 'true', 'True', 'TRUE', true]`. The last value is to allow for `process.env.VAR = true;` within the test code.

### CUP_ONLY
If this value is truthy then only test cases created with `testOnly` or `serialOnly` will be run.

### CUP_BAIL
If this value is truthy then the process will exit after the first test failure.
