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

> ### **Jest users, see [`jest-bluster`][jest-bluster].**

# Installation

Install `bluster` using npm or Yarn and import the function in your tests:
```javascript
import bluster from 'bluster';
```

# Usage

Wrap your function using `bluster`:
```javascript
const resource = await bluster(getResource)('example.gz');
// Perform assertions on the resource.
```

This line throws an error if:
 * either `const promise = getResource('example.gz')` or `getResource('example.gz', callback)` produces an error, or
 * `const promise = getResource('example.gz')` and `getResource('example.gz', callback)` produce different values.

If no error is thrown, you can rest assured that the function behaves the same when used promise-style as it does when used continuation-passing-style. As normal, you will now determine whether the `resource` constant is accurate.

# License (X11/MIT)
Copyright (c) 2019, 2023 Pimm "de Chinchilla" Hogeling

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

**The Software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. in no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the Software or the use or other dealings in the Software.**


[jest-bluster]: https://github.com/Pimm/bluster/tree/master/jest