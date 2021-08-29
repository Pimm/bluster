/**
 * @jest-environment node
 */

const neverendingPromise = new Promise(() => {});
function waitUntilNextTick() {
	return new Promise(resolve => process.nextTick(resolve));
}
function waitForever() {
	var callback /* = undefined */;
	if (arguments.length > 0) {
		callback = arguments[0];
	}
	if (undefined === callback) {
		return neverendingPromise;
	}
}
test('timeout-fake', async () => {
	// If the original function does not settle, the blustered function should throw before the Jest timeout.
	function testWithTimeout(timeout) {
		if (undefined != timeout) {
			jest.setTimeout(timeout);
		}
		jest.useFakeTimers();
		var rethrow;
		bluster(waitForever)()
		.catch(error => void (rethrow = () => { throw error; }));
		if (undefined != timeout) {
			jest.advanceTimersByTime(timeout);
		} else /* if (undefined == timeout) */ {
			jest.runAllTimers();
		}
		jest.useRealTimers();
		return waitUntilNextTick()
		.then(() => expect(rethrow).toThrow('did not settle'));
	}
	await testWithTimeout();
	await testWithTimeout(20);
	await testWithTimeout(1000);
	await testWithTimeout(30e3);
});
test('timeout-real', () => {
	// Test once without the fake timers implementation.
	jest.setTimeout(1000);
	return expect(bluster(waitForever)).rejects.toThrow('did not settle');
});