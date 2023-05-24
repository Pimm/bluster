import defaultEqualityTester from './defaultEqualityTester';
import allSettled from 'core-js-pure/stable/promise/all-settled';

/**
 * Creates an error which is a consequence of the passed error. The passed error is assigned to the `cause` property of
 * the newly created error.
 *
 * @param {string | undefined} message
 * @param {Error} cause
 */
function createConsequence(message, cause) {
	return Object.defineProperty(
		new Error(message),
		'cause',
		{
			value: cause,
			/* writable: false, */
			enumerable: true,
			configurable: true
		}
	);
}

/**
 * Calls the passed target function promise-style. The target function is expected to return a promise.
 *
 * `target.apply(thisArgument, originalArguments);`
 *
 * @returns {Promise}
 */
function callPromiseStyle(target, thisArgument, originalArguments) {
	var result;
	try {
		result = target.apply(thisArgument, originalArguments);
	} catch (cause) {
		throw createConsequence('An error occurred while calling the passed function promise-style', cause);
	}
	if (null == result || 'function' != typeof result.then) {
		throw new Error('The passed function did not return a promise (or otherwise thenable object)');
	}
	return result;
}

/**
 * Calls the passed target function continuation-passing-style: a callback function is concatenated to the passed
 * arguments before being forwarded to the target function. The passed target function is expected to call the callback
 * function.
 *
 * `target.call(thisArgument, ...originalArguments, callback);`
 *
 * Returns a promise which rejects if the callback is called with a non-null-ish error or resolves to the value passed
 * to the callback function.
 *
 * @returns {Promise}
 */
function callContinuationPassingStyle(target, thisArgument, originalArguments) {
	var resolveResult, rejectResult;
	try {
		target.call(thisArgument, ...originalArguments, (error, result) => process.nextTick(() => {
			if (null != error) {
				rejectResult(error);
			} else /* if (null == error) */ {
				resolveResult(result);
			}
		}));
	} catch (error) {
		throw createConsequence('An error occurred while calling the passed function continuation-passing-style', error);
	}
	return new Promise((resolve, reject) => {
		resolveResult = resolve;
		rejectResult = reject;
	});
}

/**
 * Creates a wrapper around the passed target function which calls it *twice*: once promise-style and once
 * continuation-passing-style (also known as callback-style).
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
 * This facilitates testing both the promise-style and the continuation-passing-style branches in one go:
 *
 * ```javascript
 * const resource = await bluster(getResource)('example.gz');
 * // Perform assertions on the resource.
 * ```
 *
 * A promise is returned which either:
 *   * resolves to the value from both branches, or
 *   * rejects to the cause from both branches, or
 *   * if the two branches do not behave identical, rejects to an error which explains the situation.
 *
 * The second argument is an optional equality tester which is used to determine whether the values from both branches
 * (in case of fulfillment) or the causes from both branches (in case of rejection) are equal.
 *
 * The third argument is an optional timeout in milliseconds. If either of the two calls does not settle within this
 * timeout, the returned promise will reject.
 *
 * #### On the equality tester
 *
 * If the second argument is omitted, the values from both branches (in case of fulfillment) or the causes from both
 * branches (in case of rejection) will be tested for equality by a lenient equality tester. Said default equality
 * tester considers:
 *   * `true` equal to `true`;
 *   * `8` equal to `8`;
 *   * a function equal to any other function;
 *   * `{ text: 'wonderland' }` equal to `{ text: 'wonderland' }` (but inequal to `{ text: 'cloud' }` or `{}`);
 *   * `[Math.PI]` equal to `[Math.PI]` (but inequal to `[3]` or `[0, Math.PI]`); and
 *   * `{ list: [x] }` equal to `{ list: [y] }`, regardless of the values of `x` and `y` as it does not transverse
 *     nested objects or arrays.
 *
 * If you require stricter and/or nested equality testing, provide one as the second argument. It is possible to pass
 * in Lodash' `_.isEqual`, for example.
 *
 * #### On the `this` keyword
 *
 * If the wrapped target function uses the `this` keyword, you will have to assure that it has the correct value.
 *
 * Consider this line
 * ```javascript
 * const users = await database.listUsers({ limit: 100 });
 * ```
 * Blustering that function would discard the value of `this`. That can be prevented with `bind`:
 * ```javascript
 * const blusteredListUsers = bluster(database.listUsers.bind(database));
 * const users = await blusteredListUsers({ limit: 100 });
 * ```
 * Alternatively, it can be prevented with `call`:
 * ```javascript
 * const blusteredListUsers = bluster(database.listUsers);
 * const users = await blusteredListUsers.call(database, { limit: 100 });
 * ```
 *
 * This effect is not unique to this library; it is standard in JavaScript. Read more:
 * https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this#As_an_object_method
 */
export default function bluster(target, equalityTester, timeout) {
	return Object.defineProperties(
		function() {
			try {
				var promises = [
					// Call the target promise-style.
					callPromiseStyle(target, this, arguments),
					// Call the target continuation-passing-style.
					callContinuationPassingStyle(target, this, arguments)
				];
			} catch (error) {
				return Promise.reject(error);
			}
			// If no equality tester was passed, use this default equality tester. The default equality tester is quite
			// lenient. It is designed to catch obvious inequalities (such as undefined ≠ 5, or a data object ≠ an error);
			// it is not designed to be a strict deep equality tester.
			equalityTester ??= defaultEqualityTester;
			/**
			 * @type {ReturnType<typeof Promise.allSettled>}
			 */
			const settlements = allSettled(promises);
			return new Promise((resolve, reject) => {
				// If at least one of the promises does not settle within the passed timeout, there is probably a bug in the
				// target function. Reject to an error.
				if (undefined != timeout) {
					const cancelTimeout = clearTimeout.bind(
						undefined,
						setTimeout(
							reject.bind(
								undefined,
								new Error('Either the promise-style call or the continuation-passing-style call did not settle within the timeout (or neither did)')
							),
							timeout
						)
					);
					// For hygiene purposes, clear the timeout set above when the promises do settle.
					const originalResolve = resolve;
					const originalReject = reject;
					resolve = value => {
						cancelTimeout();
						originalResolve(value);
					};
					reject = reason => {
						cancelTimeout();
						originalReject(reason);
					};
				}
				settlements.then(([promiseStyleSettlement, continuationPassingStyleSettlement]) => {
					if (promiseStyleSettlement.status == continuationPassingStyleSettlement.status) {
						if ('fulfilled' == promiseStyleSettlement.status /* && 'fulfilled' == continuationPassingStyleSettlement */) {
							// If both calls fulfilled, determine whether the values are equal. If so, return that value. If not,
							// that indicates a bug in the target function. Throw an error in that case.
							if (equalityTester(promiseStyleSettlement.value, continuationPassingStyleSettlement.value)) {
								return promiseStyleSettlement.value;
							}
							throw new Error('The values to which the promise-style call and the continuation-passing-style call resolved are not equal');
						} else /* if ('rejected' == promiseStyleSettlement.status && 'rejected' == continuationPassingStyleSettlement.status) */ {
							// If both calls rejected, determine whether the reasons are equal. If so that actually means the target
							// function works correctly, in the sense that it behaves identical when called promise-style and when
							// called continuation-passing-style. If so, throw that reason. If not, that indicates a bug in the
							// target function. Throw a new error in that case.
							if (equalityTester(promiseStyleSettlement.reason, continuationPassingStyleSettlement.reason)) {
								throw promiseStyleSettlement.reason;
							}
							throw new Error('The errors to which the promise-style call and the continuation-passing-style call rejected are not equal');
						}
					// If one of the calls fulfilled and the other one rejected, that is unexpected. That indicates a bug in the
					// target function. Throw an error in that case.
					} else /* if (promiseStyleSettlement.status != continuationPassingStyleSettlement.status) */ {
						if ('rejected' == promiseStyleSettlement.status) {
							throw createConsequence('The promise-style call rejected whereas the continuation-passing-style call fulfilled', promiseStyleSettlement.reason);
						} else /* if ('rejected' == continuationPassingStyleSettlement.status) */ {
							throw createConsequence('The promise-style call fulfilled whereas the continuation-passing-style call rejected', continuationPassingStyleSettlement.reason);
						}
					}
				}).then(resolve, reject);
			});
		},
		{
			// Set the length of the blustered function to the length of the target function. We are making the assumption
			// that the target function has a sensible length. This is different from (() => {}).bind, which normalizes the
			// length to ensure the bound function gets a length which is an integer. [1]
			length: {
				value: target.length,
				/* writable: false, */
				/* enumerable: false, */
				configurable: true
			},
			// Set the name of the blustered function to the name of the target function, prefixed with "blustered ". This is
			// similar to what (() => {}).bind does. [2]
			name: {
				value: `blustered ${target.name}`,
				/* writable: false, */
				/* enumerable: false, */
				configurable: true
			}
		}
	);
}
// The outer "bluster" function is desigend to be similar to (() => {}).bind as defined in ECMAScript 2015.
//
// [1] See the spec for Function.prototype.bind:
//     6. Let targetHasLength be HasOwnProperty(Target, "length").
//     7. ReturnIfAbrupt(targetHasLength).
//     8. If targetHasLength is true, then
//       […]
//     9. Else let L be 0.
//    10. Let status be DefinePropertyOrThrow(F, "length", PropertyDescriptor {[[Value]]: L, [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: true}).
// [2] See the spec for Function.prototype.bind:
//    12. Let targetName be Get(Target, "name").
//    13. ReturnIfAbrupt(targetName).
//    14. If Type(targetName) is not String, let targetName be the empty string.
//    15. Perform SetFunctionName(F, targetName, "bound").