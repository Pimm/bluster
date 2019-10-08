var coreBluster = require('bluster');
// Note that we are depending on package internals here. As this package depends on a specific exact version of expect,
// this should not break.
var equals = require('expect/build/jasmineUtils').equals;
var customTesters = [require('expect/build/utils').iterableEquality];
/**
 * Returns whether the two passed arguments are equal to each other (`true`) or not (`false`).
 *
 * This function mimics `expect(…).toEqual(…)` in Jest. In fact, it uses the same implementation under the hood.
 */
function jestlikeEqualityTester(first, second) {
	return equals(first, second, customTesters);
}
/**
 * Returns the current timeout Jest uses, in milliseconds, as set by `jest.setTimeout(…)`.
 */
var getJestTimeout;
// (See src/index.ts in jest-runtime: https://github.com/facebook/jest/blob/master/packages/jest-runtime/src/index.ts.)
if (global.jasmine) {
	getJestTimeout = function() {
		return global.jasmine._DEFAULT_TIMEOUT_INTERVAL;
	};
} else {
	var testTimeoutSymbol;
	try {
		testTimeoutSymbol = Symbol.for('TEST_TIMEOUT_SYMBOL');
		getJestTimeout = function() {
			return global[testTimeoutSymbol];
		};
	} catch (error) {
		getJestTimeout = function() {
			// There's a typeof operator which will detect that this isn't a number.
			return undefined;
		};
	}
}
/**
 * Creates a wrapper around the passed target function which calls it *twice*: once promise-style and once callback-
 * style.
 *
 * Think of this single line
 * ```javascript
 * bluster(getResource)('example.gz');
 * ```
 * as the alterenative to both these lines
 * ```javascript
 * const promise = getResource('example.gz');
 * getResource('example.gz', callback);
 * ```
 *
 * This facilitates testing both the promise-style and the callback-style branches in one go:
 *
 * ```javascript
 * expect(bluster(getResource)('example.gz')).resolves.toMatchSnapshot();
 * ```
 *
 * A promise is returned which either:
 *   * resolves to the value from both branches, or
 *   * rejects to the error from both branches, or
 *   * if the two branches do not behave identical, rejects to an error which explains the situation.
 *
 * Put differently, the test above will fail if:
 *   * either `const promise = getResource('example.gz')` or `getResource('example.gz', callback)` produces an error, or
 *   * `const promise = getResource('example.gz')` and `getResource('example.gz', callback)` produce different values,
 *     or
 *   * that value produced by both branches does not match the snapshot.
 *
 * The second argument is an optional equality tester which is used to determine whether the values from both branches
 * or the errors from both branches are equal. If omitted, equality testing follows the same rules as
 * `expect(…).toEqual(…)`.
 *
 * #### On the `this` keyword
 *
 * If the wrapped target function uses the `this` keyword, you will have to assure that it has the correct value.
 *
 * Consider this line
 * ```javascript
 * expect(database.listUsers({ limit: 100 })).resolves.toMatchSnapshot();
 * ```
 * Blustering that `listUsers` function would discard the value of `this`. That can be prevented with `bind`:
 * ```javascript
 * const blusteredListUsers = bluster(database.listUsers.bind(database));
 * expect(blusteredListUsers({ limit: 100 })).resolves.toMatchSnapshot();
 * ```
 * Alternatively, it can be prevented with `call`:
 * ```javascript
 * const blusteredListUsers = bluster(database.listUsers);
 * expect(blusteredListUsers.call(database, { limit: 100 })).resolves.toMatchSnapshot();
 * ```
 *
 * This effect is not unique to this library; it is standard in JavaScript. Read more:
 * https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this#As_an_object_method
 */
global.bluster = function bluster(target, equalityTester) {
	// If no equality tester was passed, use the equality tester which mimics expect(…).toEqual(…).
	if (undefined === equalityTester) {
		equalityTester = jestlikeEqualityTester;
	}
	// Determine Jest's timeout. It is possible that jest.setTimeout(…) is called after this. The blustered function
	// would be stuck with the old value. That would be slightly unfortunate.
	var jestTimeout = getJestTimeout();
	if ('number' != typeof jestTimeout) {
		jestTimeout = 5000;
	}
	return coreBluster(
		target,
		equalityTester,
		// Set the timeout to half a second shorter than Jest's timeout, or half of Jest's timeout if that timeout is
		// shorter than 1 second. This will hopefully cause bluster to time out before Jest does. Bluster timing out gives
		// the user more helpful feedback than Jest timing out.
		Math.max(jestTimeout - 500, jestTimeout / 2)
	);
};