/**
 * Returns whether the two passed arguments are equal _without peeking inside_.
 *
 * Returns `true` if the two passed arguments are:
 *  * both `undefined` or both `null`; or
 *  * both `true` or both `false`; or
 *  * both `+0`, both `-0`, the same non-zero number, or both `NaN`; or
 *  * the same string; or
 *  * both functions (any function will do); or
 *  * errors with the same message; or
 *  * the same object (including arrays) by reference.
 *
 * Otherwise returns `undefined` if the two passed arguments are objects (including arrays).
 *
 * Otherwise returns `false`.
 */
function determineEqualFlat(first, second) {
	// Check Object.is, which is a proper first step.
	if (Object.is(first, second)) {
		return true;
	}
	// If both of the passed values are functions, return true for equal. It is very tricky ‒ if not impossible ‒ to test
	// two functions for equality in a meaningful way.
	if ('function' == typeof first && 'function' == typeof second) {
		return true;
	}
	// If the above checks did not trigger and at least one of the passed values is not an object, return false for not
	// equal.
	if ('object' != typeof first || null === first || 'object' != typeof second || null === second) {
		return false;
	}
	// If at least one of the passed values is an error, perform this special equality check. The most conclusive
	// property of an error is its message. However, as the message property is part of the prototype, checking errors
	// in the same manner other objects are checked would disregard the message. To prevent labeling two errors with
	// different messages as equal, this specific check is used.
	if (first instanceof Error) {
		if (second instanceof Error) {
			return first.message === second.message;
		} else /* if (false == second instanceof Error) */ {
			return false;
		}
	} else if (second instanceof Error) {
		return false;
	}
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
 *  * both functions (any function will do); or
 *  * errors with the same message; or
 *  * objects (including arrays) which are _congruent_: having the same set of properties where every property is equal
 *    according to the rules above, or is a (nested) objects itself (including arrays).
 *
 * The last rule means that if both values are objects which contain nested  objects, those nested objects are not
 * transversed futher. Rather, they are assumed equal.
 */
export default function defaultEqualityTester(first, second) {
	// Try to determine the equality of the values, speculating that they are non-objects (or errors).
	const result = determineEqualFlat(first, second);
	if (undefined !== result) {
		return result;
	}
	// Now that the fact that both passed values are objects (but not errors) has been established, perform a shallow
	// comparison. Start by finding the keys.
	const keysFirst = Object.keys(first);
	const propertyCountFirst = keysFirst.length;
	// If the passed objects don't have the same number of properties, return false before even looking inside.
	if (propertyCountFirst !== Object.keys(second).length) {
		return false;
	}
	// Return true if the second object has the exact same set of properties as the first one, where the values of those
	// properties are either equal non-objects, or (nested) objects (which are assumed equal without looking inside).
	// You could think of this behaviour as the opposite of that of a typical shallow equality tester. A typical shallow
	// equality tester doesn't transverse nested objects; it assumes nested objects are inequal. The logic below doesn't
	// transverse nested objects either; but it assumes they are equal instead.
	return keysFirst.every(key => {
		return (
			false != determineEqualFlat(first[key], second[key])
			// It is possible for a property to appear in the first object (as its own property) and for that same property to
			// be inherited by the second object. In that case, the check above might pass, since it finds the inherited
			// property in the second object. Check whether the property is the own property of the second object.
			&& second.hasOwnProperty(key)
		);
	});
}