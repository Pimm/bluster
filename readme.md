# bluster &middot; [![License (X11/MIT)](https://badgen.net/github/license/pimm/bluster)](https://github.com/Pimm/bluster/blob/master/copying.txt) [![npm version](https://badgen.net/npm/v/bluster)](https://www.npmjs.com/package/bluster) [![Test status](https://github.com/Pimm/bluster/actions/workflows/test.yaml/badge.svg)](https://github.com/Pimm/bluster/actions/workflows/test.yaml) [![Coverage status](https://coveralls.io/repos/github/Pimm/bluster/badge.svg?branch=master)](https://coveralls.io/github/Pimm/bluster?branch=master)

Test both promises and callbacks in one go.

# Rationale

If your function supports both promise-style and continuation-passing-style asynchronous calls, `bluster` will cut your tests in half.

Take this function for example:
```typescript
function getResource(name: string): Promise<Resource>;
function getResource(name: string, callback: (error: Error, resource: Resource) => void): void;
```
(TypeScript types and overloading for clarity.)

Developers can call this function promise-style and continuation-passing-style (also known as callback-style). Whichever they prefer and fits the rest of the project. Cool! But how would you go about testing this? `bluster` lets you test both branches at the cost of one.

# With Jest

## Installation

Install `jest-bluster` using npm or Yarn and add it to your Jest configuration in package.json:
```json
{
	…
	"jest": {
		"setupFilesAfterEnv": ["jest-bluster"]
	},
	…
}
```

## Usage

Wrap your function using `bluster`:
``` javascript
test('get-resource', () => {
	return expect(
		bluster(getResource)('example.gz')
	).resolves.toMatchSnapshot();
});
```

The test above will fail if:
 * either `const promise = getResource('example.gz')` or `getResource('example.gz', callback)` produces an error, or
 * `const promise = getResource('example.gz')` and `getResource('example.gz', callback)` produce different values, or
 * the value produced by both branches [does not match the snapshot][jest-snapshots].

A passing test assures the function behaves correctly both when used promise-style and when used continuation-passing-style.

# Without Jest

## Installation

Install `bluster` using npm or Yarn and import the function in your tests:
```javascript
import bluster from 'bluster';
```

## Usage

Wrap your function using `bluster`:
```javascript
const resource = await bluster(getResource)('example.gz');
// Perform assertions on the resource.
```

This line throws an error if:
 * either `const promise = getResource('example.gz')` or `getResource('example.gz', callback)` produces an error, or
 * `const promise = getResource('example.gz')` and `getResource('example.gz', callback)` produce different values.

If no error is thrown, you can rest assured that the function behaves the same when used promise-style and when used continuation-passing-style. As normal, you will now determine whether the `resource` constant is accurate.

# License (X11/MIT)
Copyright (c) 2019, 2023 Pimm "de Chinchilla" Hogeling

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

**The Software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. in no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the Software or the use or other dealings in the Software.**


[jest-snapshots]: https://jestjs.io/docs/snapshot-testing