function getCoordinates() {
	var callback /* = undefined */;
	if (arguments.length > 0) {
		callback = arguments[0];
	}
	const coordinates = [51.98190, 5.91417];
	// If no callback was passed, return a promise.
	if (undefined === callback) {
		return Promise.resolve(coordinates);
	// If a callback was defined, call that.
	} else /* if (undefined !== callback) */ {
		callback(null, coordinates);
	}
}
test('get-coordinates', () => {
	return expect(bluster(getCoordinates)).resolves.toEqual([51.98190, 5.91417]);
});