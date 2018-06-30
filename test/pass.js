const assert = require('assert');

const cup = require('../index.js');


function resolvePromise(seconds = 1) {
    return new Promise((resolve) => setTimeout(resolve, 1000 * seconds));
}

cup.test('Assertions work', () => {
    assert(true);
});

cup.test('Promise object works', new Promise((resolve) => resolve()));

cup.test('Promise resolution works', resolvePromise);

cup.test('Async finish works', async () => {
    await resolvePromise();
});

cup.test('Async resolution works', async () => {
    const result = await resolvePromise();
    return result;
});

cup.test('shouldThrow works', cup.shouldThrow(() => {
    throw Error();
}));

cup.test('shouldThrow regex works', cup.shouldThrow(() => {
    throw Error('e11e28f1');
}, /e11e28f1/));

cup.test('shouldReject works', cup.shouldReject(() => Promise.reject()));

cup.test('shouldReject regex works', cup.shouldReject(
    () => Promise.reject(new Error('e11e28f1')),
    /e11e28f1/,
));

setTimeout(() => {
    cup.test('Handles dynamic tests', () => null);
}, 1000);

for (let i = 1; i <= 3; i++) {
    cup.serial(`Handles serial tests (${i})`, () => resolvePromise(0.5));
}
