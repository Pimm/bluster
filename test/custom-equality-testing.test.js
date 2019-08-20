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
	// This equality tester is satisfied as long as the values are less than 1000 apart.
	const blusteredGetServerTime = bluster(getServerTime, (first, second) => {
		return 'number' == typeof first && 'number' == typeof second && Math.abs(second - first) < 1000;
	});
	return expect(blusteredGetServerTime()).resolves.toBeTruthy();
});