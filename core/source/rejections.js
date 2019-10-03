function Rejection(error) {
	this.error = error;
}
/**
 * Wraps the passed error into an object which can later identified as a rejection.
 */
export function wrapRejection(error) {
	return new Rejection(error);
}
/**
 * Determine whether the passed argument is a rejection, created by `wrapRejection`.
 */
export function determineIsRejection(input) {
	return input instanceof Rejection;
}
/**
 * Unwraps a rejection, reversing the effect of `wrapRejection`.
 */
export function unwrapRejection(rejection) {
	return rejection.error;
}