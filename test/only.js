const assert = require('assert');

const cup = require('../index.js');


cup.test('Should not run', () => {
    assert(false);
});

cup.serial('Should not run', () => {
    assert(false);
});

cup.testOnly('Runs testOnly', () => null);

cup.serialOnly('Runs serialOnly', () => null);
