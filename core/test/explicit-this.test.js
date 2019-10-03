/**
 * @jest-environment node
 */

import bluster from './implementation';

class ValueContainer {
	constructor(value) {
		this.value = value;
	}

	getValue() {
		var callback /* = undefined */;
		if (arguments.length > 0) {
			callback = arguments[0];
		}
		if (undefined === callback) {
			return Promise.resolve(this.value);
		} else /* if (undefined !== callback) */ {
			callback(null, this.value);
		}
	}
}

test('explicit-this', () => {
	const valueContainer = new ValueContainer(4);
	return Promise.all([
		expect(bluster(valueContainer.getValue.bind(valueContainer))()).resolves.toEqual(4),
		expect(bluster(valueContainer.getValue).call(valueContainer)).resolves.toEqual(4)
	]);
});