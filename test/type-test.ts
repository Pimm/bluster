import bluster from '..';

// This file is used to test the type definitions in `index.d.ts`.

export function promiseSignature(): Promise<number> {
	function getNumber(): Promise<number> | void {
		var callback: any /* = undefined */;
		if (arguments.length > 0) {
			callback = arguments[0];
		}
		if (undefined === callback) {
			return Promise.resolve(8);
		} else /* if (undefined !== callback) */ {
			callback(null, 8);
		}
	}
	return bluster(getNumber)();
}
export function callbackSignature(): Promise<number> {
	function getNumber(callback: (error: null | Error, value: number) => void): void | Promise<number> {
		if (undefined === callback) {
			return Promise.resolve(8);
		} else /* if (undefined !== callback) */ {
			callback(null, 8);
		}
	}
	return bluster(getNumber)();
}