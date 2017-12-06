const assert = require('assert');

const cup = require('../index.js');


function rejectPromise(seconds = 1, reason = 'rejected') {
    return new Promise((resolve, reject) => (
        setTimeout(() => reject(reason), 1000 * seconds)
    ));
}

cup.test('SHOULD FAIL: Catches asserts', () => {
    assert(false);
});

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

for (let i = 1; i <= 3; i++) {
    cup.serial(
        `SHOULD FAIL: Handles serial rejections tests (${i})`,
        () => rejectPromise(0.25, `rejected ${i}`),
    );
}
