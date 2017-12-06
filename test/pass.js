const assert = require('assert');

const cup = require('../index.js');


function resolvePromise(seconds = 1) {
    return new Promise((resolve) => setTimeout(resolve, 1000 * seconds));
}

cup.test('Assertions work', () => {
    assert(true);
});

cup.test('Promise resolution works', resolvePromise);

cup.test('Async finish works', async () => {
    await resolvePromise();
});

cup.test('Async resolution works', async () => {
    const result = await resolvePromise();
    return result;
});

setTimeout(() => {
    cup.test('Handles dynamic tests', () => null);
}, 1000);

for (let i = 1; i <= 3; i++) {
    cup.serial(`Handles serial tests (${i})`, () => resolvePromise(0.5));
}
