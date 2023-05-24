/**
 * Returns whether the two passed arguments are equal _without peeking inside_.
 *
 * Returns `true` if the two passed arguments are:
 *  * both `undefined` or both `null`; or
 *  * both `true` or both `false`; or
 *  * both `+0`, both `-0`, the same non-zero number, or both `NaN`; or
 *  * the same string; or
 *  * errors with the same message; or
 *  * both functions; or
 *  * the same object (including arrays) by reference.
 *
 * Otherwise returns `undefined` if the two passed arguments are objects (including arrays), but neither is an error.
 *
 * Otherwise returns `false`.
 */
function determineEqualFlat(first, second) {
	// Use Object.is to catch simple equalities.
	if (Object.is(first, second)) {
		return true;
	}
	// If both of the values are functions, return true (equal). There is no way to test functions for equality in a
	// meaningful way.
	if ('function' == typeof first && 'function' == typeof second) {
		return true;
	}
	// If both checks above did not hit and at least one of the values is not an object, return false (unequal).
	if ('object' != typeof first || null == first || 'object' != typeof second || null == second) {
		return false;
	}
	// If both values are errors, return true (equal) if they have the same message. The message is the most conclusive
	// property of an error. However, as the message property is part of the prototype, checking errors in the same
	// manner other objects are checked (see below) would disregard the message. To prevent labeling two errors with
	// different messages as equal, check the message specifically.
	// If exactly one of the values is an error, return false (unequal).
	if (first instanceof Error) {
		if (second instanceof Error) {
			return first.message == second.message;
		} else /* if (false == second instanceof Error) */ {
			return false;
		}
	} else if (second instanceof Error) {
		return false;
	}
	// If both values are objects ‒ but not errors ‒ return undefined.
	/* return undefined; */
}
/**
 * Returns whether the two passed arguments are equal to each other (`true`) or not (`false`).
 *
 * In this context, two values are equal if they are:
 *  * both `undefined` or both `null`; or
 *  * both `true` or both `false`; or
 *  * both `+0`, both `-0`, the same non-zero number, or both `NaN`; or
 *  * the same string; or
 *  * errors with the same message; or
 *  * both functions; or
 *  * objects (including arrays) which are _congruent_: having the same set of properties where every property is equal
 *    according to the rules above, or is a (nested) objects itself (including arrays).
 *
 * Note that:
 *  * If two values are objects which in turn contain (nested) objects, those nested objects are not transversed
 *    futher. Rather, they are assumed equal. In other words: this function checks for equality one level deep, it is
 *    not recursive.
 *  * If two values are functions, they are always considered equal.
 */
export default function defaultEqualityTester(first, second) {
	// Try determineEqualFlat first. determineEqualFlat will return undefined if both values are objects (but not
	// errors).
	const result = determineEqualFlat(first, second);
	if (undefined != result) {
		return result;
	}
	// Both values are objects (but not errors). Perform a shallow comparison. Start by finding the keys.
	const keysFirst = Object.keys(first);
	// If the objects don't have the same number of properties, return false (unequal) before even looking inside.
	if (keysFirst.length != Object.keys(second).length) {
		return false;
	}
	// Return true (equal) if the second object has the exact same set of properties as the first one, where the values
	// of those properties are not unequal according to determineEqualFlat (including the case in which the values of
	// those properties are objects ‒ and determineEqualFlat thus returns undefined).
	// You could think of this behaviour as the opposite of that of a typical shallow equality tester. A typical shallow
	// equality tester doesn't transverse nested objects; it assumes nested objects are inequal. The logic below does not
	// transverse nested objects either; yet it assumes they are equal instead.
	return keysFirst.every(key => {
		return (
			false != determineEqualFlat(first[key], second[key])
			// It is possible for a property to appear in the first object (as its own property) and for that same property
			// to be inherited by the second object. In that case, the check above might pass, since it finds the inherited
			// property in the second object. That is undesirable. Check whether the property is the own property of the
			// second object.
			&& second.hasOwnProperty(key)
		);
	});
}