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
 * or the errors from both branches are equal.
 *
 * #### On the equality tester
 *
 * If the second argument is omitted, the values from both branches or the errors from both branches will be tested for
 * equality by a lenient equality tester. Said default equality tester considers:
 *   * `true` equal to `true`;
 *   * `8` equal to `8`;
 *   * a function equal to any other function;
 *   * `{ text: 'wonderland' }` equal to `{ text: 'wonderland' }` (but inequal to `{ text: 'cloud' }` or `{}`);
 *   * `[Math.PI]` equal to `[Math.PI]` (but inequal to `[3]` or `[0, Math.PI]`); and
 *   * `{ list: [x] }` equal to `{ list: [y] }`, regardless of the values of `x` and `y` as it does not transverse
 *     nested objects or arrays.
 *
 * If you require stricter and/or nested equality testing, provide an equality tester as the second argument. It is
 * possible to pass in Lodash' `_.isEqual`, for example.
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
 * This effect is not unique to this library; it is standard in JavaScript and TypeScript. Read more:
 * https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this#As_an_object_method
 */
declare function bluster<T>(
	target: PromiseTarget<T>,
	equalityTester?: (first: any, second: any) => boolean
): (...arguments: any[]) => Promise<any>;
declare function bluster<T>(
	target: PromiseTarget<T> | CallbackTarget<T>,
	equalityTester?: (first: any, second: any) => boolean
): (...arguments: any[]) => Promise<any>;

export default bluster;