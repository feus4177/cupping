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

cup.test('Async finish works', async () => {
    await resolvePromise();
});

cup.test('Async resolution works', async () => {
    const result = await resolvePromise();
    return result;
});

cup.test('SHOULD FAIL: Catches asserts', () => {
    assert(false);
});

cup.test('SHOULD FAIL: Promise rejection works', rejectPromise);

cup.test('SHOULD FAIL: Promise error works', () => (
    resolvePromise.then(() => {
        throw new Error('Promise error');
    })
));

cup.test('SHOULD FAIL: Async error works', async () => {
    throw new Error('Async error');
});

cup.test('SHOULD FAIL: Async rejection works', async () => {
    const result = await rejectPromise();
    return result;
});

cup.test('SHOULD FAIL: Handles hanging test', () => new Promise(() => null));

setTimeout(() => {
    cup.test('Handles dynamic tests', () => null);
}, 1000);

for (let i = 1; i <= 3; i++) {
    cup.serial(`Handles serial tests (${i})`, () => resolvePromise(0.5));
}

for (let i = 1; i <= 3; i++) {
    cup.serial(
        `SHOULD FAIL: Handles serial rejections tests (${i})`,
        () => rejectPromise(0.25, `rejected ${i}`),
    );
}

['start', 'end', 'success', 'failure'].map((name) => (
    cup.test(`Emits ${name}`, () => new Promise((resolve) => {
        cup.emitter.on(name, resolve);
    }))
));
