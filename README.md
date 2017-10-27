# int64_t

64bit integer in pure Javascript

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

## Feature

* toString(radix, prefix)
default radix is 10
default prefix is false
```js
let i = new Int64(0x12345678, 0x9abcdef0);
console.log(i.toString());  //
console.log(i.toString(16));  // 123456789abcdef0
console.log(i.toString(16, true);  // 0x123456789abcdef0
```

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


* shiftRight(number) (>>)
```js
let i = new Int64(0x12345678, 0x9abcdef0);
console.log(i.toShiftRight(1).toString(16, true));  // 0x91a2b3c4d5e6f78
```

* shiftLeft(number) (<<)
```js
let i = new Int64(0x12345678, 0x9abcdef0);
console.log(i.toShiftLeft(1).toString(16, true));  // 0x2468acf13579bde0
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
