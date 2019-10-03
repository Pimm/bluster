type PromiseTarget<T> = (...arguments: any[]) => Promise<T>;
type Callback<T> = (error: null | Error, value: T) => void;
type CallbackTarget<T> = ((callback: Callback<T>) => void)
		| ((a: any, callback: Callback<T>) => void)
		| ((a: any, b: any, callback: Callback<T>) => void)
		| ((a: any, b: any, c: any, callback: Callback<T>) => void)
		| ((a: any, b: any, c: any, d: any, callback: Callback<T>) => void)
		| ((a: any, b: any, c: any, d: any, e: any, callback: Callback<T>) => void)
		| ((a: any, b: any, c: any, d: any, e: any, f: any, callback: Callback<T>) => void)
		| ((a: any, b: any, c: any, d: any, e: any, f: any, g: any, callback: Callback<T>) => void)
		| ((a: any, b: any, c: any, d: any, e: any, f: any, g: any, h: any, callback: Callback<T>) => void);
/**
 * Creates a wrapper around the passed target function which calls it *twice*: once promise-style and once callback-
 * style.
 *
 * Think of this single line
 * ```javascript
 * bluster(openDatabase)('example.db');
 * ```
 * as the alterenative to both these lines
 * ```javascript
 * const promise = openDatabase('example.db');
 * openDatabase('example.db', callback);
 * ```
 *
 * This facilitates testing both the promise-style and the callback-style branches in one go:
 *
 * ```javascript
 * const database = await bluster(openDatabase)('example.db');
 * // Perform assertions on the database.
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
 */
declare function bluster<T>(
	target: PromiseTarget<T>,
	equalityTester?: (first: any, second: any) => boolean,
	timeout?: number
): (...arguments: any[]) => Promise<any>;
declare function bluster<T>(
	target: PromiseTarget<T> | CallbackTarget<T>,
	equalityTester?: (first: any, second: any) => boolean,
	timeout?: number
): (...arguments: any[]) => Promise<any>;

export default bluster;