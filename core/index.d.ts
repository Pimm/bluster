type PromiseTarget = (...arguments: any[]) => Promise<any>;
type Callback<R> = (error: any, result: R) => void;
type CallbackV = (error?: any) => void;
type CallbackTarget0<R> = (callback: Callback<R>) => void;
type CallbackTarget0V = (callback: CallbackV) => void;
type CallbackTarget1<A, R> = (a: A, callback: Callback<R>) => void;
type CallbackTarget1V<A> = (a: A, callback: CallbackV) => void;
type CallbackTarget2<A, B, R> = (a: A, b: B, callback: Callback<R>) => void;
type CallbackTarget2V<A, B> = (a: A, b: B, callback: CallbackV) => void;
type CallbackTarget3<A, B, C, R> = (a: A, b: B, c: C, callback: Callback<R>) => void;
type CallbackTarget3V<A, B, C> = (a: A, b: B, c: C, callback: CallbackV) => void;
type CallbackTarget4<A, B, C, D, R> = (a: A, b: B, c: C, d: D, callback: Callback<R>) => void;
type CallbackTarget4V<A, B, C, D> = (a: A, b: B, c: C, d: D, callback: CallbackV) => void;
type CallbackTargetn<R> =
		  ((a: any, b: any, c: any, d: any, e: any, callback: Callback<R>) => void)
		| ((a: any, b: any, c: any, d: any, e: any, f: any, callback: Callback<R>) => void)
		| ((a: any, b: any, c: any, d: any, e: any, f: any, g: any, callback: Callback<R>) => void)
		| ((a: any, b: any, c: any, d: any, e: any, f: any, g: any, h: any, callback: Callback<R>) => void);
type CallbackTargetnV =
		  ((a: any, b: any, c: any, d: any, e: any, callback: CallbackV) => void)
		| ((a: any, b: any, c: any, d: any, e: any, f: any, callback: CallbackV) => void)
		| ((a: any, b: any, c: any, d: any, e: any, f: any, g: any, callback: CallbackV) => void)
		| ((a: any, b: any, c: any, d: any, e: any, f: any, g: any, h: any, callback: CallbackV) => void);
type EqualityTester = (first: any, second: any) => boolean;
/**
 * Creates a wrapper around the passed target function which calls it *twice*: once promise-style and once
 * callback-style.
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
 * This effect is not unique to this library; it is standard in JavaScript and TypeScript. Read more:
 * https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this#As_an_object_method
 */
declare function bluster<T extends PromiseTarget>(
	target: T,
	equalityTester?: EqualityTester
): T;
declare function bluster<R>(
	target: CallbackTarget0<R>,
	equalityTester?: EqualityTester
): () => Promise<R>;
declare function bluster(
	target: CallbackTarget0V,
	equalityTester?: EqualityTester
): () => Promise<void>;
declare function bluster<A, R>(
	target: CallbackTarget1<A, R>,
	equalityTester?: EqualityTester
): (a: A) => Promise<R>;
declare function bluster<A>(
	target: CallbackTarget1V<A>,
	equalityTester?: EqualityTester
): (a: A) => Promise<void>;
declare function bluster<A, B, R>(
	target: CallbackTarget2<A, B, R>,
	equalityTester?: EqualityTester
): (a: A, b: B) => Promise<R>;
declare function bluster<A, B>(
	target: CallbackTarget2V<A, B>,
	equalityTester?: EqualityTester
): (a: A, b: B) => Promise<void>;
declare function bluster<A, B, C, R>(
	target: CallbackTarget3<A, B, C, R>,
	equalityTester?: EqualityTester
): (a: A, b: B, c: C) => Promise<R>;
declare function bluster<A, B, C>(
	target: CallbackTarget3V<A, B, C>,
	equalityTester?: EqualityTester
): (a: A, b: B, c: C) => Promise<void>;
declare function bluster<A, B, C, D, R>(
	target: CallbackTarget4<A, B, C, D, R>,
	equalityTester?: EqualityTester
): (a: A, b: B, c: C, d: D) => Promise<R>;
declare function bluster<A, B, C, D>(
	target: CallbackTarget4V<A, B, C, D>,
	equalityTester?: EqualityTester
): (a: A, b: B, c: C, d: D) => Promise<void>;
declare function bluster<R>(
	target: CallbackTargetn<R>,
	equalityTester?: EqualityTester
): (...a: any) => Promise<R>;
declare function bluster(
	target: CallbackTargetnV,
	equalityTester?: EqualityTester
): (...a: any) => Promise<void>;
declare function bluster(
	target: Function,
	equalityTester?: EqualityTester
): (...a: any) => Promise<any>;

export default bluster;