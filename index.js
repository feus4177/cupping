const EventEmitter = require('events');
const indent = require('indent-string');

const emitter = new EventEmitter();

function envToBool(value) {
    return ['1', 'true', 'True', 'TRUE', true].includes(value);
}

function tap(fn) {
    return (...args) => {
        fn(...args);

        if (args.length === 1) {
            return args[0];
        }

        return args;
    };
}

const trials = [];
const globalTimeout = parseInt(process.env.CUP_TIMEOUT, 10) || null;
function testOnly(name, fn, opts = {}) {
    const timeout = opts.timeout || globalTimeout;
    const index = trials.push({name, succeeded: null}) - 1;

    function once(finishFn) {
        return (...args) => {
            if (trials[index].succeeded !== null) {
                return trials[index];
            }

            return finishFn(...args);
        };
    }

    const succeed = once(() => {
        trials[index].succeeded = true;
        emitter.emit('success', name);

        return trials[index];
    });

    const fail = once((reason) => {
        trials[index].succeeded = false;
        trials[index].error = reason;
        emitter.emit('failure', name);
        if (envToBool(process.env.CUP_BAIL)) {
            process.exit();
        }

        return trials[index];
    });

    let result;
    try {
        emitter.emit('start', name);

        if (timeout) {
            setTimeout(() => (
                fail(new Error(`${name} exceeded timeout of ${timeout}ms`))
            ), timeout);
        }

        result = Promise.resolve(fn()).then(succeed).catch(fail);
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
    return (name, fn, opts = {}) => {
        const key = opts.key || 'default';

        // Get the last trial in this series or a resolved promise if there are
        // none.
        const serialTrial = serialTrials[key] || Promise.resolve();

        serialTrials[key] = serialTrial.then(() => testFn(name, fn, opts));

        return serialTrials[key];
    };
}

const serial = makeSerial(test);
const serialOnly = makeSerial(testOnly);

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
        console.log('  error: |-');
        if (trial.succeeded === null) {
            console.log(indent('never finished', 4));
        } else if (trial.error && trial.error.stack) {
            console.log(indent(trial.error.stack, 4));
        } else {
            console.log(indent(String(trial.error), 4));
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
    emitter,
};
