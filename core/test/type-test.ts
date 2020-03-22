import bluster from '..';

// This file is used to test the type definitions in `index.d.ts`.

export function promiseSignature0(): Promise<number> {
	function getNumber(): Promise<number> {
		var callback: any /* = undefined */;
		if (arguments.length > 0) {
			callback = arguments[0];
		}
		if (undefined === callback) {
			return Promise.resolve(8);
		} else /* if (undefined !== callback) */ {
			callback(null, 8);
		}
		// @ts-ignore
		return undefined;
	}
	return bluster(getNumber)();
}
export function callbackSignature0(): Promise<number> {
	function getNumber(callback: (error: null | Error, value: number) => void): void {
		if (undefined === callback) {
			// @ts-ignore
			return Promise.resolve(8);
		} else /* if (undefined !== callback) */ {
			callback(null, 8);
		}
	}
	return bluster(getNumber)();
}

export function overload0(): Promise<number> {
	function getNumber(): Promise<number>;
	function getNumber(callback: (error: null | Error, value: number) => void): void;
	function getNumber() {
		var callback: any /* = undefined */;
		if (arguments.length > 0) {
			callback = arguments[0];
		}
		if (undefined === callback) {
			return Promise.resolve(8);
		} else /* if (undefined !== callback) */ {
			callback(null, 8);
		}
		// @ts-ignore
		return undefined;
	}
	return bluster(getNumber)();
}

export function promiseSignature1(): Promise<number> {
	function increment(input: number): Promise<number> {
		var callback: any /* = undefined */;
		if (arguments.length > 0) {
			callback = arguments[0];
		}
		if (undefined === callback) {
			return Promise.resolve(input + 1);
		} else /* if (undefined !== callback) */ {
			callback(null, input + 1);
		}
		// @ts-ignore
		return undefined;
	}
	return bluster(increment)(5);
}
export function callbackSignature1(): Promise<number> {
	function increment(input: number, callback: (error: null | Error, value: number) => void): void {
		if (undefined === callback) {
			// @ts-ignore
			return Promise.resolve(input + 1);
		} else /* if (undefined !== callback) */ {
			callback(null, input + 1);
		}
	}
	return bluster(increment)(5);
}

export function overload1(): Promise<number> {
	function increment(input: number): Promise<number>;
	function increment(input: number, callback: (error: null | Error, value: number) => void): void;
	function increment(input: number) {
		var callback: any /* = undefined */;
		if (arguments.length > 1) {
			callback = arguments[1];
		}
		if (undefined === callback) {
			return Promise.resolve(input + 1);
		} else /* if (undefined !== callback) */ {
			callback(null, input + 1);
		}
		// @ts-ignore
		return undefined;
	}
	return bluster(increment)(5);
}

class Document {}

export function promiseSignatureV(): Promise<void> {
	function upload(document: Document): Promise<void> {
		var callback: any /* = undefined */;
		if (arguments.length > 0) {
			callback = arguments[0];
		}
		if (undefined === callback) {
			return Promise.resolve();
		} else /* if (undefined !== callback) */ {
			callback(null);
		}
		// @ts-ignore
		return undefined;
	}
	return bluster(upload)(new Document());
}
export function callbackSignatureV(): Promise<void> {
	function upload(document: Document, callback: (error: null | Error) => void): void {
		if (undefined === callback) {
			// @ts-ignore
			return Promise.resolve();
		} else /* if (undefined !== callback) */ {
			callback(null);
		}
	}
	return bluster(upload)(new Document());
}

export function overloadV(): Promise<void> {
	function upload(document: Document): Promise<void>;
	function upload(document: Document, callback: (error: null | Error) => void): void;
	function upload(document: Document) {
		var callback: any /* = undefined */;
		if (arguments.length > 0) {
			callback = arguments[0];
		}
		if (undefined === callback) {
			return Promise.resolve();
		} else /* if (undefined !== callback) */ {
			callback(null);
		}
		// @ts-ignore
		return undefined;
	}
	return bluster(upload)(new Document());
}