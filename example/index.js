// import Int64 from '../lib/index.js'
const { Int64, UInt64 } = require('../lib/int64')

// let i = new Int64(Buffer.from([0x80, 0x80, 0x00, 0x01, 0x01, 0x01, 0x00, 0x00]))
// console.log(i.toBuffer())
// console.log(i.toString(16))
// console.log(i.shiftRight(33))
// console.log(i.shiftRight(1))
// console.log(i.shiftLeft(33))
// console.log(i.shiftLeft(1))

// toString()
let i = new UInt64(0x12345678, 0x9abcdef0)
console.log(i.toString())
console.log(i.toString(16))
console.log(i.toString(16, true))

// add()
console.log('add:' + i.add(new UInt64(0x11111111, 0x11111111)).toString(16, true))

// sub()
console.log('sub:' + i.sub(new UInt64(0x11111111, 0x11111111)).toString(16, true))

// mul()
console.log('mul:' + i.mul(new UInt64(0x0, 0xf)).toString(16, true))

// and()
console.log('and:' + i.add(new UInt64(0x0f0f0f0f, 0x0f0f0f0f)).toString(16, true))

// or()
console.log('or:' + i.or(new UInt64(0x0f0f0f0f, 0x0f0f0f0f)).toString(16, true))

// xor()
console.log('xor:' + i.xor(new UInt64(0xffffffff, 0xffffffff)).toString(16, true))

// shiftRight()
console.log('shiftRight:' + i.shiftRight(1).toString(16, true))

// shiftLeft()
console.log('shiftLeft:' + i.shiftLeft(1).toString(16, true))

// toBuffer()
console.log(i.toBuffer())

// toSigned()
const si = i.toSigned()
console.log(si)

// toUnsigned()
console.log(si.toUnsigned())

// toMinus()
console.log(si.toMinus())
