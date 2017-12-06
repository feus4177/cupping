const assert = require('assert');

const cup = require('../index.js');


cup.test('SHOULD FAIL: Catches asserts', () => {
    assert(false);
});

cup.test('SHOULD FAIL: Bailed test is unfinished', () => null);
