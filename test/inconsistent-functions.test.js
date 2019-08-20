/**
 * @jest-environment node
 */

import bluster from './implementation';

// This function returns a different temperature depending on whether it was called promise-style or callback-style.
function getTemperature() {
	var callback /* = undefined */;
	if (arguments.length > 0) {
		callback = arguments[0];
	}
	if (undefined === callback) {
		return Promise.resolve(24.1);
	} else /* if (undefined !== callback) */ {
		callback(null, 18.2);
	}
}
// This function throws an error with a different message depending on whether it was called promise-style or callback-
// style.
function failGettingTemperature() {
	var callback /* = undefined */;
	if (arguments.length > 0) {
		callback = arguments[0];
	}
	if (undefined === callback) {
		return Promise.reject(new Error('Temperature service temporarily not available'));
	} else /* if (undefined !== callback) */ {
		callback(new Error('Temperature service unavailable'));
	}
}
test('inconsistent-functions', () => {
	const blusteredGetCoordinates = bluster(getTemperature);
	const blusteredError = bluster(failGettingTemperature);
	return Promise.all([
		expect(blusteredGetCoordinates()).rejects.toThrow('are not equal'),
		expect(blusteredError()).rejects.toThrow('are not equal')
	]);
});