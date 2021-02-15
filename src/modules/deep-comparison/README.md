# Deep Comparison module

Provides a function to compare objects by value for equivalency, nested to arbitrary depth.

Basically does the same as [Lodash's `isEqual` method](https://lodash.com/docs/4.17.15#isEqual), but saves having to install a whole library.

## Usage

`import deepCompare from {@openmsupply/deep-compare}`

`deepCompare(obj1, obj2, [nullEqualsUndefined])`

`obj1` and `obj2` are the two objects to be compared. `nullEqualsUndefined` is an optional parameter declaring whether `null` values should be considered equal to `undefined` values (default `false`).

Will also work with arrays and primitive data types.
