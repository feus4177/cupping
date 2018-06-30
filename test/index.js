const {spawn} = require('child_process');
const readline = require('readline');

const cup = require('../index.js');

cup.test('Tests will pass correctly', () => (
    new Promise((resolve, reject) => {
        const child = spawn('node', ['./test/pass.js']);
        child.on('close', (exitCode) => {
            if (exitCode) {
                return reject(Error('Non-zero exit code.'));
            }

            return resolve();
        });

        const reader = readline.createInterface({input: child.stdout});
        reader.on('line', (line) => {
            if (line.startsWith('not ok')) {
                reject(Error(`Unexpected test failure: ${line}`));
            }
        });
    })
));

cup.test('Tests will fail correctly', () => (
    new Promise((resolve, reject) => {
        const child = spawn('node', ['./test/fail.js']);
        child.on('close', (exitCode) => {
            if (exitCode !== 1) {
                return reject(Error('Expected exit code to be 1.'));
            }

            return resolve();
        });

        const reader = readline.createInterface({input: child.stdout});
        reader.on('line', (line) => {
            if (line.startsWith('ok')) {
                reject(Error(`Unexpected test success: ${line}`));
            }
        });
    })
));

cup.test('Tests will behave correctly', () => (
    new Promise((resolve, reject) => {
        const child = spawn('node', ['./test/mixed.js']);
        child.on('close', (exitCode) => {
            if (exitCode !== 1) {
                return reject(Error('Expected exit code to be 1.'));
            }

            return resolve();
        });

        const reader = readline.createInterface({input: child.stdout});
        reader.on('line', (line) => {
            if (line.startsWith('ok') && !line.includes('SHOULD PASS')) {
                reject(Error(`Unexpected test success: ${line}`));
            }

            if (line.startsWith('not ok') && !line.includes('SHOULD FAIL')) {
                reject(Error(`Unexpected test failure: ${line}`));
            }
        });
    })
));

cup.test('Tests will bail correctly', () => (
    new Promise((resolve, reject) => {
        const env = Object.create(process.env);
        env.CUP_BAIL = '1';

        const child = spawn('node', ['./test/bail.js'], {env});
        child.on('close', (exitCode) => {
            if (exitCode !== 1) {
                return reject(Error('Expected exit code to be 1.'));
            }

            return resolve();
        });

        const reader = readline.createInterface({input: child.stdout});
        reader.on('line', (line) => {
            if (line.startsWith('ok')) {
                reject(Error(`Unexpected test success: ${line}`));
            }
        });
    })
));

cup.test('Tests skip correctly', () => (
    new Promise((resolve, reject) => {
        const env = Object.create(process.env);
        env.CUP_ONLY = '1';

        const child = spawn('node', ['./test/only.js'], {env});
        child.on('close', (exitCode) => {
            if (exitCode) {
                return reject(Error('Non-zero exit code.'));
            }

            return resolve();
        });

        const reader = readline.createInterface({input: child.stdout});
        reader.on('line', (line) => {
            if (line.startsWith('not ok')) {
                reject(Error(`Unexpected test failure: ${line}`));
            }

            if (line.startsWith('# tests') && line !== '# tests 2') {
                reject(Error(`Unexpected number of tests: ${line}`));
            }
        });
    })
));
