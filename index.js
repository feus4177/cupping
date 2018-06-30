const EventEmitter = require('events');
const indent = require('indent-string');

const emitter = new EventEmitter();

function envToBool(value) {
    return ['1', 'true', 'True', 'TRUE', true].includes(value);
}

function tap(fn) {
    return (...args) => {
        fn(...args);

        return args[0];
    };
}

const trials = [];
function testOnly(name, promise) {
    const index = trials.push({name, succeeded: null}) - 1;

    function succeed() {
        trials[index].succeeded = true;
        emitter.emit('success', name);

        return trials[index];
    }

    function fail(reason) {
        trials[index].succeeded = false;
        trials[index].reason = reason;
        emitter.emit('failure', name);
        if (envToBool(process.env.CUP_BAIL)) {
            process.exit();
        }

        return trials[index];
    }

    let result;
    try {
        emitter.emit('start', name);

        if (promise instanceof Function) {
            promise = Promise.resolve(promise());
        }

        result = promise.then(succeed).catch(fail);
    } catch (error) {
        result = Promise.resolve(fail(error));
    }

    return result.then(tap(() => {
        emitter.emit('end', name);
    }));
}

function test(...args) {
    if (envToBool(process.env.CUP_ONLY)) {
        return Promise.resolve();
    }

    return testOnly(...args);
}

const serialTrials = {};
function makeSerial(testFn) {
    return (name, promise, key = 'default') => {
        const serialTrial = serialTrials[key] || Promise.resolve();

        serialTrials[key] = serialTrial.then(() => testFn(name, promise));

        return serialTrials[key];
    };
}

const serial = makeSerial(test);
const serialOnly = makeSerial(testOnly);

function shouldThrow(fn, regex) {
    return () => {
        let threw = true;
        try {
            fn();
            threw = false;
        } catch (error) {
            if (regex) {
                console.assert(
                    regex.test(error.message),
                    `Error message did not match regex: ${error.message}`,
                );
            }
        }

        console.assert(threw, 'Test did not throw');
    };
}

function shouldReject(promise, regex) {
    return () => new Promise((resolve, reject) => (
        promise().then(() => reject(new Error('Promise did not reject.')))
            .catch((error) => {
                if (!error) {
                    resolve();
                    return;
                }

                if (!(error instanceof Error)) {
                    reject(Error(
                        `shouldReject expects the rejection reason to either be falsey, or an "Error", instead got: ${error}`,
                    ));
                    return;
                }

                if (regex && !regex.test(error.message)) {
                    reject(Error(
                        `Error message did not match regex: ${error.message}`,
                    ));
                    return;
                }

                resolve();
            })
    ));
}

function finish() {
    console.log('TAP version 13');
    console.log(`1..${trials.length}`);
    trials.forEach((trial, index) => {
        const number = index + 1;
        if (trial.succeeded) {
            console.log(`ok ${number} ${trial.name}`);
            return;
        }

        console.log(`not ok ${number} ${trial.name}`);
        console.log('  ---');
        console.log('  reason: |-');
        if (trial.succeeded === null) {
            console.log(indent('never finished', 4));
        } else if (trial.reason && trial.reason.stack) {
            console.log(indent(trial.reason.stack, 4));
        } else {
            console.log(indent(String(trial.reason), 4));
        }
        console.log('  ...');
    });

    const passes = trials.reduce((total, trial) => {
        if (trial.succeeded) {
            return total + 1;
        }

        return total;
    }, 0);

    const failures = trials.length - passes;
    console.log(`# tests ${trials.length}`);
    console.log(`# pass ${passes}`);
    console.log(`# fail ${failures}`);

    if (failures) {
        process.exitCode = 1;
    }
}

process.on('exit', finish);
process.on('SIGINT', process.exit);

module.exports = {
    test,
    testOnly,
    serial,
    serialOnly,
    shouldThrow,
    shouldReject,
    emitter,
};
