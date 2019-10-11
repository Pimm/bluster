/**
 * @jest-environment node
 */

import bluster from './implementation';

function asynchronousIdentity(promiseResult, callbackResult) {
	var callback /* = undefined */;
	if (arguments.length > 2) {
		callback = arguments[2];
	}
	if (undefined === callback) {
		return Promise.resolve(promiseResult);
	} else /* if (undefined !== callback) */ {
		callback(null, callbackResult);
	}
}
test('custom-equality-testing', () => {
	return Promise.all([
		expect(bluster(asynchronousIdentity)(undefined, undefined)).resolves.toBe(undefined),
		expect(bluster(asynchronousIdentity)(null, null)).resolves.toBe(null),
		expect(bluster(asynchronousIdentity)(undefined, null)).rejects.toThrow('are not equal'),
		expect(bluster(asynchronousIdentity)(true, true)).resolves.toBe(true),
		expect(bluster(asynchronousIdentity)(true, false)).rejects.toThrow('are not equal'),
		expect(bluster(asynchronousIdentity)(NaN, NaN)).resolves.toBeNaN(),
		expect(bluster(asynchronousIdentity)(8, 8)).resolves.toBe(8),
		expect(bluster(asynchronousIdentity)(+0, -0)).rejects.toThrow('are not equal'),
		expect(bluster(asynchronousIdentity)('turnip', 'turnip')).resolves.toBe('turnip'),
		expect(bluster(asynchronousIdentity)(bluster, bluster)).resolves.toBe(bluster),
		expect(bluster(asynchronousIdentity)(() => {}, () => {})).resolves.toBeDefined(),
		expect(bluster(asynchronousIdentity)(new Error('Connection lost'), new Error('Connection lost'))).resolves.toEqual(new Error('Connection lost')),
		expect(bluster(asynchronousIdentity)({ text: 'wonderland' }, { text: 'wonderland' })).resolves.toEqual({ text: 'wonderland' }),
		expect(bluster(asynchronousIdentity)(new Error('wonderland'), { text: 'wonderland' })).rejects.toThrow('are not equal'),
		expect(bluster(asynchronousIdentity)({ text: 'wonderland' }, new Error('wonderland'))).rejects.toThrow('are not equal'),
		expect(bluster(asynchronousIdentity)({ text: 'wonderland' }, { text: 'wonderland', cached: true })).rejects.toThrow('are not equal'),
		expect(bluster(asynchronousIdentity)({ cached: true }, { cached: false })).rejects.toThrow('are not equal'),
		expect(bluster(asynchronousIdentity)([17], [17])).resolves.toEqual([17]),
		expect(bluster(asynchronousIdentity)([17], [2])).rejects.toThrow('are not equal'),
		(() => {
			const puppy = { name: 'Choco' };
			const spider = { legCount: 8 };
			spider.__proto__ = { name: 'Choco' };
			return Promise.all([
				expect(bluster(asynchronousIdentity)(puppy, spider)).rejects.toThrow('are not equal'),
				expect(bluster(asynchronousIdentity)(spider, puppy)).rejects.toThrow('are not equal'),
			]);
		})(),
		// It might surprise you that these are considered equal. The default equality tester is designed to catch obvious
		// inequalities (undefined ≠ 5, or a data object ≠ an error); it is not designed to be a strict, deep equality
		// tester.
		expect(bluster(asynchronousIdentity)({ list: [17] }, { list: [2] })).resolves.toBeDefined()
	]);
});