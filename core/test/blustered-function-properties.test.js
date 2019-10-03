/**
 * @jest-environment node
 */

import bluster from './implementation';

function openDatabase(path) {
}
test('blustered-function-properties', () => {
	const blusteredOpenDatabase = bluster(openDatabase);
	expect(blusteredOpenDatabase.length).toBe(1);
	expect(blusteredOpenDatabase.name).toBe('blustered openDatabase');
});