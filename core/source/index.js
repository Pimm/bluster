import { wrapRejection, determineIsRejection, unwrapRejection } from './rejections';
import defaultEqualityTester from './defaultEqualityTester';

/**
 * Calls the passed target function promise-style: the passed this argument and the passed arguments are used
 * untouched. The passed target function is expected to return a promise.
 *
 * `const promise = target.call(thisArgument, ...originalArguments);`
 *
 * Returns the promise returned by the passed target function, unless that promise rejects, in which case the promise
 * resolves to a rejection (`wrapRejection`) instead. If anything is amiss, this function throws an error.
 */
function callPromiseStyle(target, thisArgument, originalArguments) {
	var result;
	try {
		result = target.apply(thisArgument, originalArguments);
	} catch (cause) {
		let error = new Error('An error occurred while calling the passed function promise-style');
		error.cause = cause;
		throw error;
	}
	// (Note that although there is only a check for the availability of "then", "catch" is used only a few lines below.)
	if (null == result || undefined === result.then) {
		throw new Error('The passed function did not return a promise (or otherwise thenable object)');
	}
	return result
	// If the promise-style call rejects, wrap that rejection.
	.catch(wrapRejection);
}
/**
 * Calls the passed target function callback-style: the passed this argument is used, and a callback function is
 * concatenated to the passed arguments before being used. The passed target function is expected to call the callback
 * function.
 *
 * `target.call(thisArgument, ...originalArguments, callback);`
 *
 * Returns a promise which resolves to the value passed to the callback function or a rejection (`wrapRejection`) which
 * wraps the error passed to the callback function.
 */
function callCallbackStyle(target, thisArgument, originalArguments) {
	var resolveResult;
	try {
		target.call(thisArgument, ...originalArguments, (error, result) => {
			setTimeout(() => {
				if (null != error) {
					resolveResult(wrapRejection(error));
				} else /* if (null == error) */ {
					resolveResult(result);
				}
			});
		});
	} catch (cause) {
		let error = new Error('An error occurred while calling the passed function callback-style');
		error.cause = cause;
		throw error;
	}
	return new Promise(resolve => {
		resolveResult = resolve;
	});
}
/**
 * From the passed array, generates a bitmap which marks which values in the array are rejections. The returned bitmap
 * is a number of which bit `1 << n` represents whether the value at index `n` is a rejection. If this function returns
 * `0b10`, the first value in the passed array is not a rejection but the second one is.
 */
function generateRejectionBitmap(settlements) {
	return settlements.reduce((intermediateBitmap, settlement, index) => {
		if (determineIsRejection(settlement)) {
			intermediateBitmap += 1 << index;
		}
		return intermediateBitmap;
	}, 0);
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
 * const resource = await bluster(getResource)('example.gz');
 * // Perform assertions on the resource.
 * ```
 *
 * A promise is returned which either:
 *   * resolves to the value from both branches, or
 *   * rejects to the error from both branches, or
 *   * if the two branches do not behave identical, rejects to an error which explains the situation.
 *
 * The second argument is an optional equality tester which is used to determine whether the values from both branches
 * or the errors from both branches are equal.
 *
 * The third argument is an optional timeout in milliseconds. If any of the two calls does not settle within this
 * timeout, the returned promise will reject.
 *
 * #### On the equality tester
 *
 * If the second argument is omitted, the values from both branches or the errors from both branches will be tested for
 * equality by a shallow equality tester. Said default equality tester considers:
 *   * `true` equal to `true`;
 *   * `8` equal to `8`;
 *   * `{ text: 'wonderland' }` equal to `{ text: 'wonderland' }`; and
 *   * `[Math.PI]` equal to `[Math.PI]`;
 *
 * but considers `{ wrappee: { text: 'wonderland' } }` *inequal* to `{ wrappee: { text: 'wonderland' } }` because the
 * primitive (string) is burried too deep.
 *
 * If you require deep equality testing, provide an equality tester as the second argument. It is possible to pass in
 * Lodash' `_.isEqual`, for example.
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
	const blusteredTarget = function() {
		var promises;
		try {
			promises = [
				// Call the target promise-style.
				callPromiseStyle(target, this, arguments),
				// Call the target callback-style.
				callCallbackStyle(target, this, arguments)
			];
		} catch (error) {
			return Promise.reject(error);
		}
		// If no equality tester was passed, use this default equality tester.
		if (undefined === equalityTester) {
			equalityTester = defaultEqualityTester;
		}
		return new Promise((resolve, reject) => {
			Promise.all(promises)
			.then(settlements => {
				// Determine which of the calls rejected. For the promise-style call, this means the promise rejected; for the
				// callback-style call, this means the callback was called with an error not equal to null or undefined.
				const rejectionBitmap = generateRejectionBitmap(settlements);
				if (0b00 != rejectionBitmap) {
					// At least one of the calls rejected. Determine whether the other one did as well.
					if (0b11 == rejectionBitmap) {
						// If both calls reject, determine whether the errors are equal. If so ‒ and this may go against your
						// instincts ‒ that actually means the target function works correctly, in the sense that it behaves
						// identical when called promise-style and when called callback-style. And if so, reject to that error. If
						// not, this is a bug in the target function. Reject to an error which explains the situation.
						const errors = settlements.map(unwrapRejection);
						if (equalityTester(...errors)) {
							reject(errors[0]);
							//   ↓ This would of course ‒ virtually ‒ be the same as this:
							// reject(errors[1]);
						} else /* if (false == equalityTester(...errors)) */ {
							reject(new Error('The errors to which the promise-style call and the callback-style call rejected are not equal'));
						}
					// One of the calls rejecting and the other one fulfilling is unexpected, and definitely a bug in the target
					// function. Reject to an error which explains the situtation.
					} else /* if (0b01 == rejectionBitmap || 0b10 == rejectionBitmap) */ {
						let error;
						if (0b01 == rejectionBitmap) {
							error = new Error('The promise-style call rejected whereas the callback-style call fulfilled');
							error.cause = unwrapRejection(settlements[0]);
						} else /* if (0b10 == rejectionBitmap) */ {
							error = new Error('The promise-style call fulfilled whereas the callback-style call rejected');
							error.cause = unwrapRejection(settlements[1]);
						}
						reject(error);
					}
				// If both calls fulfilled, determine whether the results are equal. If so, resolve to that result. If not,
				// that is a bug in the target function. Reject to an error in that case.
				} else /* if (0b00 == rejectionBitmap) */ {
					if (equalityTester(...settlements)) {
						resolve(settlements[0]);
						//   ↓ This would of course ‒ virtually ‒ be the same as this:
						// resolve(settlements[1]);
					} else /* if (false == equalityTester(...settlements)) */ {
						reject(new Error('The results of the promise-style call and the callback-style call are not equal'));
					}
				}
			});
			// Note that errors in the chain above are not caught. Any errors which might occur are uncatchable. This is by
			// design: an error at this point means there is something wrong in our own implementation; not in that of the
			// target function.
			//
			// If after the timeout the promise has not settled yet, there is probably a bug in the target function. Reject
			// to an error.
			if (undefined !== timeout) {
				const cancelTimeout = clearTimeout.bind(
					undefined,
					setTimeout(
						reject.bind(undefined, new Error('Either the promise-style call or the callback-style call did not settle within the timeout (or neither did)')),
						timeout
					)
				);
				// For hygiene purposes, clear the timeout set above when the promise does settle.
				const originalResolve = resolve;
				const originalReject = reject;
				resolve = value => {
					originalResolve(value);
					cancelTimeout();
				};
				reject = error => {
					originalReject(error);
					cancelTimeout();
				};
			}
		});
	};
	// Set the length of the blustered function to the length of the target function. We are making the assumption here
	// that the target function has a sensible length. This is different from (() => {}).bind, which actually checks and
	// processes that length to ensure the bound function gets a length which is an integer. [1]
	Object.defineProperty(blusteredTarget, 'length', {
		value: target.length,
		/* writable: false, */
		/* enumerable: false, */
		configurable: true
	});
	// Set the name of the blustered function to the name of the target function, prefixed with "blustered ". This is
	// similar to what (() => {}).bind does. [2]
	Object.defineProperty(blusteredTarget, 'name', {
		value: `blustered ${target.name}`,
		/* writable: false, */
		/* enumerable: false, */
		configurable: true
	});
	return blusteredTarget;
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