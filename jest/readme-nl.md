Test promises én callbacks in één klap.

# Motivatie

Als jouw functie promise-achtig én callback-achtig kan worden aangeroepen, halveert `bluster` jouw tests.

Neem deze functie als voorbeeld:
```typescript
function getResource(name: string): Promise<Resource>;
function getResource(name: string, callback: (error: Error, resource: Resource) => void): void;
```
(TypeScript types en overloading voor de duidelijkheid.)

Ontwikkelaars kunnen deze functie promise-achtig en continuation-passing-achtig (ofwel callback-achtig) aanroepen. Net wat zij prettig vinden en wat in het project past. Cool! Maar hoe zou je dit testen? `bluster` laat je beide aftakkingen testen voor de prijs van één.

# Installatie

Installeer `jest-bluster` met npm of Yarn en voeg het toe aan je Jest-configuratie in package.json:
```json
{
	…
	"jest": {
		"setupFilesAfterEnv": ["jest-bluster"]
	},
	…
}
```

# Gebruik

Wikkel je functie met `bluster`:
``` javascript
test('get-resource', () => {
	return expect(
		bluster(getResource)('example.gz')
	).resolves.toMatchSnapshot();
});
```

Bovenstaande test faalt als:
 * `const promise = getResource('example.gz')` ofwel `getResource('example.gz', callback)` een fout oplevert, of
 * `const promise = getResource('example.gz')` en `getResource('example.gz', callback)` verschillende waarden opleveren, of
 * de waarde die beide aftakkingen oplevert [niet overeenkomt met de snapshot][jest-snapshots].

Een slagende test bewijst dat de functie ‒ zowel wanneer deze promise-achtig als wanneer deze continuation-passing-achtig wordt aangeroepen ‒ correct werkt.

# Licentie (X11/MIT)
Copyright (c) 2019, 2023 Pimm "de Chinchilla" Hogeling

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

**The Software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. in no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the Software or the use or other dealings in the Software.**


[jest-snapshots]: https://jestjs.io/docs/snapshot-testing