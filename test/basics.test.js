/**
 * @jest-environment node
 */

import bluster from './implementation';

function getCoordinates() {
	var callback /* = undefined */;
	if (arguments.length > 0) {
		callback = arguments[0];
	}
	const coordinates = [51.98190, 5.91417];
	if (undefined === callback) {
		return Promise.resolve(coordinates);
	} else /* if (undefined !== callback) */ {
		callback(null, coordinates);
	}
}
function getCoordinatesForDevice(deviceIdentifier) {
	var callback /* = undefined */;
	if (arguments.length > 1) {
		callback = arguments[1];
	}
	const coordinates = [51.97489, 5.91168];
	if (undefined === callback) {
		return Promise.resolve(coordinates);
	} else /* if (undefined !== callback) */ {
		callback(null, coordinates);
	}
}
function failGettingCoordinates() {
	var callback /* = undefined */;
	if (arguments.length > 0) {
		callback = arguments[0];
	}
	const error = new Error('Coordinates service not available');
	if (undefined === callback) {
		return Promise.reject(error);
	} else /* if (undefined !== callback) */ {
		callback(error);
	}
}
test('basics', () => {
	const blusteredGetCoordinates = bluster(getCoordinates);
	const blusteredGetCoordinatesForDevice = bluster(getCoordinatesForDevice);
	const blusteredError = bluster(failGettingCoordinates);
	return Promise.all([
		expect(blusteredGetCoordinates()).resolves.toEqual([51.98190, 5.91417]),
		expect(blusteredGetCoordinatesForDevice('local-1')).resolves.toEqual([51.97489, 5.91168]),
		expect(blusteredError()).rejects.toThrow('Coordinates service not available')
	]);
});