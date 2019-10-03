/**
 * @jest-environment node
 */

import bluster from './implementation';

function getServerTime() {
	var callback /* = undefined */;
	if (arguments.length > 0) {
		callback = arguments[0];
	}
	if (undefined === callback) {
		return Promise.resolve(1569923272952);
	} else /* if (undefined !== callback) */ {
		callback(null, 1569923272964);
	}
}
test('custom-equality-testing', () => {
	const promises = [];
	// This equality tester is satisfied as long as the values are less than 1000 apart.
	var blusteredGetServerTime = bluster(getServerTime, (first, second) => {
		return 'number' == typeof first && 'number' == typeof second && Math.abs(second - first) < 1000;
	});
	promises.push(expect(blusteredGetServerTime()).resolves.toBeTruthy());
	// And this one is only satisfied if the values are less than 10 apart.
	blusteredGetServerTime = bluster(getServerTime, (first, second) => {
		return 'number' == typeof first && 'number' == typeof second && Math.abs(second - first) < 10;
	});
	promises.push(expect(blusteredGetServerTime()).rejects.toThrow('are not equal'));
	return Promise.all(promises);
});