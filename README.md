# int64_t

64bit integer in pure Javascript

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CircleCI](https://circleci.com/gh/gucchisk/int64_t.svg?style=svg)](https://circleci.com/gh/gucchisk/int64_t)

## Usage

`Int64` is the class which is a 64bit signed interger.
`UInt64` is the class which is a 64bit unsigned interger.

```js
const { Int64, UInt64 } = require('int64_t');
let i = new Int64(0x12345678, 0x9abcdef0);
console.log(i.toString());  // 1311768467463790320
```

## Constructor
Int64 & UInt64

* new Int64(buffer)
```js
let i = new Int64(Buffer.from([
  0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0
]);
```

* new Int64(high, low)
```js
let i = new Int64(0x12345678, 0x9abcdef0);
```
　:warning: negative number is unacceptable

* new Int64(int)
```js
let i = new Int64(0x123456789)
```
　:warning: up to 2^53 - 1

## Feature

### Four arithmetic operations

* add(int64) (+)
```js
let i1 = new Int64(0x12345678, 0x9abcdef0);
let i2 = new Int64(0x11111111, 0x11111111);
console.log(i1.add(i2).toString(16, true));  // 0x23456789abcdf001
```

* sub(int64) (-)
```js
let i1 = new Int64(0x12345678, 0x9abcdef0);
let i2 = new Int64(0x11111111, 0x11111111);
console.log(i1.sub(i2).toString(16, true));  // 0x123456789abcddf
```

* mul(int64) (*)
```js
let i1 = new Int64(0xf, 0x1234567678);
let i2 = new Int64(0x0, 0xf);
console.log(i1.mul(i2).toString(16, true));  // 0xe211111108
```

* div(int64) (/)
```js
let i1 = new Int64(0x12345678, 0x9abcdef0);
let i2 = new Int64(0x0, 0xf);
console.log(i1.div(i2).toString(16, true));  // 0x136b06e70b74210
```

* mod(int64) (%)
```js
let i1 = new Int64(0x12345678, 0x9abcdef0);
let i2 = new Int64(0x0, 0xe);
console.log(i1.mod(i2).toString(16, true));  // 0xc
```

### Bit operations

* and(int64) (&)
```js
let i = new UInt64(0x12345678, 0x9abcdef0);
console.log(i.add(new UInt64(0x0f0f0f0f, 0x0f0f0f0f)).toString(16, true));  // 0x020406080a0c0e00
```

* or(int64) (|)
```js
let i = new UInt64(0x12345678, 0x9abcdef0);
console.log(i.or(new UInt64(0x0f0f0f0f, 0x0f0f0f0f)).toString(16, true));  // 0x1f3f5f7f9fbfdfff
```

* xor(int64) (^)
```js
let i = new UInt64(0x12345678, 0x9abcdef0);
console.log(i.xor(new UInt64(0xffffffff, 0xffffffff)).toString(16, true));  // 0xedcba9876543210f
```

* shiftRight(number, logical) (>>, >>>)
```js
let i = new Int64(0x89abcdef, 0x01234567);
console.log(i.toShiftRight(1).toString(16, true));  // -0x3b2a19087f6e5d4d
console.log(i.toShiftRight(1, true).toString(16, true));  // 0x44d5e6f78091a2b3
```

* shiftLeft(number) (<<)
```js
let i = new Int64(0x12345678, 0x9abcdef0);
console.log(i.toShiftLeft(1).toString(16, true));  // 0x2468acf13579bde0
```

### Other operation
* equal(i)
```js
let i = new UInt64(0x12345678, 0x9abcdef0);
console.log(i.equal(new UInt64(0x12345678, 0x9abcdef0)));  // bool: true
console.log(i.equal(new UInt64(0x12345678, 0x9abcdef1)));  // bool: false
console.log(i.equal(new UInt64(0x12345679, 0x9abcdef0)));  // bool: false
console.log(i.equal(new Int64(0x12345678, 0x9abcdef0)));  // bool: false
```

* compare(i)
```js
let i = new UInt64(0x12345678, 0x9abcdef0);
console.log(i.compare(new UInt64(0x12345678, 0x0)));  // 1
console.log(i.compare(new UInt64(0x20000000, 0x0)));  // -1
console.log(i.compare(new UInt64(0x12345678, 0x9abcdef0)));  // 0
```

### Transform

* toString(radix, prefix)
default radix is 10
default prefix is false
```js
let i = new Int64(0x12345678, 0x9abcdef0);
console.log(i.toString());  //
console.log(i.toString(16));  // 123456789abcdef0
console.log(i.toString(16, true);  // 0x123456789abcdef0
```

* toBuffer()
```js
let i = new Int64(0x12345678, 0x9abcdef0);
console.log(i.toBuffer());  // <Buffer 12 34 56 78 9a bc de f0>
```

* toUnsigned(), toSigned()
```js
let i = new Int64(0x12345678, 0x9abcdef0);
let ui = i.toUnsigned();
console.log(ui);  // UInt64 { buffer: <Buffer 12 34 56 78 9a bc de f0> }
console.log(ui.toSigned());  // Int64 { buffer: <Buffer 12 34 56 78 9a bc de f0> }
```

* toNegative() (only Int64)
```js
let i = new Int64(0x12345678, 0x9abcdef0);
console.log(i.toNegative());  // Int64 { buffer: <Buffer ed cb a9 87 65 43 21 10> }
```

* isNegative() (only Int64)
```js
let i = new Int64(0x890abcde, 0xf1234567)
console.log(i.isNegative());  // bool: true
```

## License
[MIT](https://opensource.org/licenses/mit-license.php)
