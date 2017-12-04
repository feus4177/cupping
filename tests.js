const assert = require('assert');

const cup = require('./index');

function resolvePromise(seconds = 1) {
    return new Promise((resolve) => setTimeout(resolve, 1000 * seconds));
}

function rejectPromise(seconds = 1, reason = 'rejected') {
    return new Promise((resolve, reject) => (
        setTimeout(() => reject(reason), 1000 * seconds)
    ));
}

cup.test('Assertions work', () => {
    assert(true);
});

cup.test('Promise resolution works', resolvePromise);

cup.test('Async resolution works', async () => {
    const result = await resolvePromise();
    return result;
});

cup.test('Catches asserts', () => {
    assert(false);
});

cup.test('Promise rejection works', rejectPromise);

cup.test('Async rejection works', async () => {
    const result = await rejectPromise();
    return result;
});

cup.test('Handles hanging test', () => new Promise(() => null));

setTimeout(() => {
    cup.test('Handles dynamic tests', () => null);
}, 1000);

for (let i = 1; i <= 5; i++) {
    cup.serial(`Handles serial tests (${i})`, () => resolvePromise(0.5));
}

for (let i = 1; i <= 5; i++) {
    cup.serial(
        `Handles serial rejections tests (${i})`,
        () => rejectPromise(0.25, `rejected ${i}`),
    );
}

