/**
 * Returns whether the two passed arguments are equal to each other (`true`) or not (`false`).
 *
 * In this context, two values are equal if they are:
 *  * both `undefined` or both `null`; or
 *  * both `true` or both `false`; or
 *  * both `+0`, both `-0`, the same non-zero number, or both `NaN`; or
 *  * the same string; or
 *  * the same object (including arrays, functions, and errors) by reference; or
 *  * errors with the same message; or
 *  * objects (including arrays) which are shallowly equal according to their own properties.
 */
export default function defaultEqualityTester(first, second) {
	// Check Object.is, which is a proper equality tester for primitives.
	if (Object.is(first, second)) {
		return true;
	}
	// If Object.is returned false and at least one of the passed values is not an object, return false for not equal.
	if ('object' != typeof first || null === first || 'object' != typeof second || null === second) {
		return false;
	}
	// If at least one of the passed values is an error, perform this special equality check. The most conclusive
	// property of an error is its message. However, as the message property is part of the prototype, the check below
	// would not check it when testing for equality. To prevent labeling two errors with different messages as equal,
	// this specific check is used.
	if (first instanceof Error) {
		if (second instanceof Error) {
			return first.message === second.message;
		} else /* if (false == second instanceof Error) */ {
			return false;
		}
	} else if (second instanceof Error) {
		return false;
	}
	// Now that the fact that both passed values are objects (but not errors) has been established, perform a shallow
	// comparison. Start by finding the keys.
	const keysFirst = Object.keys(first);
	const propertyCountFirst = keysFirst.length;
	// If the passed objects don't have the same number of properties, return false before even looking inside.
	if (propertyCountFirst !== Object.keys(second).length) {
		return false;
	}
	// Return true if the second object has the exact same list of properties as the first one, with associated values
	// which are equal.
	return keysFirst.every(key => {
		return (
			Object.is(first[key], second[key])
			// It is possible for a property to appear in the first object (as its own property) and for that same property to
			// be inherited by the second object. In that case, the check above would pass, since it finds the inherited
			// property in the second object. Check whether the property is the own property of the second object.
			&& second.hasOwnProperty(key)
		);
	});
}