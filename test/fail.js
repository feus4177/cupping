const assert = require('assert');

const cup = require('../index.js');


function rejectPromise(seconds = 1, reason = 'rejected') {
    return new Promise((resolve, reject) => (
        setTimeout(() => reject(new Error(reason)), 1000 * seconds)
    ));
}

cup.test('SHOULD FAIL: Catches asserts', () => {
    assert(false);
});

cup.test(
    'SHOULD FAIL: Promise object works',
    new Promise((resolve, reject) => reject()),
);

cup.test('SHOULD FAIL: Promise rejection works', rejectPromise);

cup.test('SHOULD FAIL: Promise error works', () => (
    rejectPromise().catch(() => {
        throw Error('Promise error');
    })
));

cup.test('SHOULD FAIL: Async error works', async () => {
    throw Error('Async error');
});

cup.test('SHOULD FAIL: Async rejection works', async () => {
    await rejectPromise();
});

cup.test('SHOULD FAIL: Handles hanging test', () => new Promise(() => null));

cup.test('SHOULD FAIL: Handles non-Error reasons', () => (
    Promise.reject('reason')  // eslint-disable-line prefer-promise-reject-errors
));

cup.test('SHOULD FAIL: then works', new Promise((resolve, reject) => {
    cup.test(
        'SHOULD FAIL: then trial',
        Promise.reject,
    ).then(resolve).catch(reject);
}));

cup.test('SHOULD FAIL: shouldThrow works', cup.shouldThrow(() => null));

cup.test('SHOULD FAIL: shouldThrow regex works', cup.shouldThrow(() => {
    throw Error('');
}, /e11e28f1/));

cup.test('SHOULD FAIL: shouldReject works', cup.shouldReject(
    () => Promise.resolve(),
));

cup.test('SHOULD FAIL: shouldReject requires Error', cup.shouldReject(
    () => Promise.reject('reason'),  // eslint-disable-line prefer-promise-reject-errors
));

cup.test('SHOULD FAIL: shouldReject regex works', cup.shouldReject(
    () => Promise.reject(Error('')),
    /e11e28f1/,
));

for (let i = 1; i <= 3; i++) {
    cup.serial(
        `SHOULD FAIL: Handles serial rejections tests (${i})`,
        () => rejectPromise(0.25, `rejected ${i}`),
    );
}
