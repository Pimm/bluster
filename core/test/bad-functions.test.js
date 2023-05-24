/**
 * @jest-environment node
 */

import bluster from './implementation';

function doOnlyPromises() {
	return Promise.resolve('peach');
}
function doOnlyCallbacks(callback) {
	callback(null, 'blueberry');
}
function doOnlyCallbacksIfPossible() {
	var callback /* = undefined */;
	if (arguments.length > 0) {
		callback = arguments[0];
	}
	if (undefined !== callback) {
		callback(null, 'cranberry');
	}
}
function makeNeverendingPromise() {
	var callback /* = undefined */;
	if (arguments.length > 0) {
		callback = arguments[0];
	}
	if (undefined === callback) {
		return new Promise(() => {});
	} else /* if (undefined !== callback) */ {
		callback(null, 'cantaloupe');
	}
}
function rejectPromise() {
	var callback /* = undefined */;
	if (arguments.length > 0) {
		callback = arguments[0];
	}
	if (undefined === callback) {
		return Promise.reject(new Error('No good!'));
	} else /* if (undefined !== callback) */ {
		callback(null, 'dragon fruit');
	}
}
function rejectCallback() {
	var callback /* = undefined */;
	if (arguments.length > 0) {
		callback = arguments[0];
	}
	if (undefined === callback) {
		return Promise.resolve('banana');
	} else /* if (undefined !== callback) */ {
		callback(new Error('No good!'));
	}
}
function failCallback() {
	var callback /* = undefined */;
	if (arguments.length > 0) {
		callback = arguments[0];
	}
	if (undefined === callback) {
		return Promise.resolve('grape');
	} else /* if (undefined !== callback) */ {
		throw new Error('No good!');
	}
}
test('bad-functions', () => {
	return Promise.all([
		// This function which only supports promise-style calls will never call the callback passed to it, and therefore
		// never settle.
		expect(bluster(doOnlyPromises, undefined, 10)()).rejects.toThrow('did not settle'),
		// This function which only supports continuation-passing-style will try to call the callback, which will not be
		// there when called promise-style.
		expect(
			bluster(doOnlyCallbacks)()
			.catch(error => ({
				message: error.message,
				cause: error.cause
			}))
		).resolves.toMatchSnapshot('doOnlyPromises'),
		// This function is slightly better than the previous, as it will only try to call the callback when called
		// continuation-passing-style.
		expect(bluster(doOnlyCallbacksIfPossible)()).rejects.toThrow('did not return a promise'),
		// This function which ‒ when called promise-style ‒ returns a neverending promise which will never settle.
		expect(bluster(makeNeverendingPromise, undefined, 10)()).rejects.toThrow('did not settle'),
		// This function rejects when called promise-style but fulfills when called continuation-passing-style.
		expect(
			bluster(rejectPromise)()
			.catch(error => ({
				message: error.message,
				cause: error.cause
			}))
		).resolves.toMatchSnapshot('rejectPromise'),
		// This function fulfills when called promise-style but rejects when called continuation-passing-style.
		expect(
			bluster(rejectCallback)()
			.catch(error => ({
				message: error.message,
				cause: error.cause
			}))
		).resolves.toMatchSnapshot('rejectCallback'),
		// This function fulfills when called promise-style but throws an error when called continuation-passing-style.
		expect(
			bluster(failCallback)()
			.catch(error => ({
				message: error.message,
				cause: error.cause
			}))
		).resolves.toMatchSnapshot('failCallback')
	]);
});