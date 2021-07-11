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

// Generate strings
```
