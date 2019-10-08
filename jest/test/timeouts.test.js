/**
 * @jest-environment node
 */

const neverendingPromise = new Promise(() => {});
function waitForever() {
	var callback /* = undefined */;
	if (arguments.length > 0) {
		callback = arguments[0];
	}
	if (undefined === callback) {
		return neverendingPromise;
	}
}
function waitLong() {
	var callback /* = undefined */;
	if (arguments.length > 0) {
		callback = arguments[0];
	}
	if (undefined === callback) {
		return new Promise(resolve => {
			setTimeout(resolve.bind(undefined, true), 6000);
		});
	} else /* if (undefined !== callback) */ {
		setTimeout(callback.bind(undefined, null, true), 6000);
	}
}
test('timeouts-default', () => {
	const blusteredWaitForever = bluster(waitForever)
	return expect(blusteredWaitForever()).rejects.toThrow('did not settle');
});
test('timeouts-short', () => {
	jest.setTimeout(100);
	const blusteredWaitForever = bluster(waitForever)
	return expect(blusteredWaitForever()).rejects.toThrow('did not settle');
});
test('timeouts-long', () => {
	jest.setTimeout(10000);
	const blusteredWaitLong = bluster(waitLong);
	return expect(blusteredWaitLong()).resolves.toBe(true);
})