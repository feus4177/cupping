const cup = require('../index.js');

cup.test(
    'SHOULD PASS: Serial tests continue even after failure',
    new Promise((resolve) => {
        cup.serial('SHOULD FAIL: Serial continuation trial 1', Promise.reject());
        cup.serial('SHOULD PASS: Serial continuation trial 2', resolve);
    }),
);
