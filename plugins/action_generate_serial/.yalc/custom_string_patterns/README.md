# Custom String Patterns

Generate random and incrementing string patterns using regex and custom functions

**custom_string_patterns** is based on [randexp](https://github.com/fent/randexp.js) -- a package to generate random strings that match given regular expressions. custom_string_patterns takes it a step further by providing a mechanism for string patterns to contain incrementing values and custom replacement functions beyond what regex can do.

## Usage

```js
import Pattern from 'custom-string-patterns'

// Generate strings with 3 random letters, a hyphen, and an incrementing 4-digit value
const serial = new Pattern(/[A-Z]{3}-<+dddd>/)

console.log(await serial.gen()) // XAP-0001
console.log(await serial.gen()) // BYW-0002
console.log(await serial.gen()) // APL-0003
console.log(await serial.gen()) // SUH-0004

// NOTE: Assumes wrapped in an Async function, since `.gen()` is an Async method

// Generate strings using an external counter and a custom replacer function that doubles
// the input parameter and inserts it into the string
const extCounter = new Pattern(/COUNT: <+d> \| DOUBLED: <?double>/, {
  getCounter: DBCounterFunction,
  customReplacers: { double: (n) => n * 2 },
})
// where "DBCounterFunction" is a call to a database that stores a count value,
// returning the next number and incrementing the counter (current value: 123)

console.log(await extCounter.gen({ customArgs: { double: 5 } }))
// => COUNT: 123 | DOUBLED: 10
console.log(await extCounter.gen({ customArgs: { double: -2 } }))
// => COUNT: 124 | DOUBLED: -4
```

## API

A new pattern object is constructed with `new Pattern ( pattern, options )`

### pattern -- `string` or `RegExp`

The syntax of pattern is a regular expression (string or object), but with custom enhancements to represent counters or custom replacers.

Please see [randexp documentation](https://github.com/fent/randexp.js) for explanation of how a basic regex is used to generate a random string.

Counters and custom replacers are pre-processed (using the syntax [below](#custom-replacers)) into a final regex which is handled by randexp.

#### Counter substitutions

Counters are placed into the pattern string by using `<+dd>`, where `d` represents a digit in the output string -- numbers will be padded with leading zeroes to match (at least) the length of the `ddd` sequence. i.e. `<+dddd>` with output number `55` yields `0055`

More complex number formatting can be achieved using a `numberFormat` parameter in "options" (see [below](#numberformat--intlnumberformat)).

#### Custom replacers

Replacement functions are defined in "options" (see below), but are invoked as part of the string pattern using `<?func>`, where "func" is the name of the function defined in options.

In this case, the pre-processor would look for a key named "func" in customReplacers, and apply whatever function definition was provided.

### options

"options" is an object argument, with the following properties available (all are optional):

```js
{
  getCounter, setCounter, counterIncrement, counterInit, customReplacers, numberFormat
}
```

#### `getCounter: () => number | string`

You can provide your own "Counter" function. By default, the Pattern Generator uses a simple internal counter, but it is re-initialised with each new instance of the generator, and there is no data persistence. If you require this (e.g. for a system that is generating ongoing serial numbers), you will need to provide a function to retrieve the current count value from your database or API.

This function takes no parameters and should return either a number or a string. Note, the "counter" doesn't have to be numerical -- you could have a system that generates a sequence of "AAA, AAB, AAC, etc...". As long as calling this function returns the appropriate value in the sequence, it's fine to use.

Ideally, your `getCounter` function should also take care of incrementing the counter, so it can be called time after time and returns a new value each time. However, if this is not possible (i.e. it can only read a value), then you'll also have to provide a seperate function to update the value:

#### `setCounter: (newValue) => void`

Only required if your `getCounter()` function does not also take care of incrementing the counter, you'll need to provide another function to update it. If `setCounter` exists, the Pattern Generator will call it with the new counter value (usually `getCounter() + 1`) as its argument. Note that you should only use seperate get/set counter functions in an isolated system -- if your counter resides on a database that is accessed by multiple clients, you should retrieve and increment the counter atomically, or you'll likely run into concurrency issues.

#### `counterIncrement ((input: string | number) => string | number)`

By default, if using a custom `setCounter` function, or the internal counter, counts will be incremented by `+1` every time. It's possible to over-ride this by providing a `counterIncrement()` function -- it takes the current counter value as input and should return the new value

#### `counterInit: number`

Only relevant if using the internal counter (i.e. no `getCounter` function is provided). This value simply specifies what number to start counting from -- the default is `1`.

#### `customReplacers { <funcName>: (args) => string | number, ... }`

The Functions required to produce the output for the customReplacer strings ([above](#custom-replacers)). This parameter is a single object, where the keys are the names of the functions referenced in the pattern string, and the values are the functions themselves. Different arguments can be provided to these functions each time a new string is generated by the `.gen()` method (see [below](#numberformat--intlnumberformat)).

#### `numberFormat : Intl.NumberFormat`

The number output of the Counter can be formatted beyond the number of padding digits described above. If `numberFormat` is provided, the counter will be displayed using the [NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) standard of Javascript's [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) object. The `numberFormat` value must be a valid `Intl.NumberFormat` object, e.g.

```js
 numberFormat: new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }
```

which would render the counter value as a Japanese yen (￥) string.

### Generating a new string -- the `.gen()` method

Call the `.gen()` method on the Pattern object to return a new string -- see examples in [Usage](#Usage) above.

Note that `.gen()` is Async, since it's expected that many of the custom functions used by the Pattern Generator (e.g. `getCounter`, customReplacers, etc) are likely to be asynchronous functions.

The `.gen()` method can take a single, optional parameter object, with the following fields:

`{ shouldIncrement, customArgs }`

#### `shouldIncrement: boolean`

If `false`, the Pattern Generator will return a new string _without_ incrementing the counter on this occasion. Note that this will only work with the internal (default) counter, or if using seperate get/set counter functions, since we can't override the internal behaviour of a `getCounter` function that also auto-increments. (Default: `true`)

#### `customArgs: { { <funcName>: (args), ... } }`

If your customReplacer functions take arguments, then you supply the arguments to the `.gen()` method here. `customArgs` is an object with the same structure as `customReplacers` ([above](#custom-replacers)), but instead of the values being functions, they are the arguments supplied to those functions.

## Shorthand use

If only one output string is required, you can generate it using the short-hand function instead of constructing and calling `.gen()` on a Pattern object:

```js
import { patternGen } from 'custom-string-patterns'

console.log(await patternGen(/[A-Z]{3}-<+dddd>/), { getCounter })
// => PAL-005
```
