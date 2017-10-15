// import Int64 from '../lib/index.js'
const { Int64, UInt64 } = require('../lib/int64')

let i = new Int64(Buffer.from([0x80, 0x80, 0x00, 0x01, 0x01, 0x01, 0x00, 0x00]))
let i = new Int64(0x80800001, 0x01010000)
console.log(i.toBuffer())
console.log(i.toString(16))
console.log(i.shiftRight(33))
console.log(i.shiftRight(1))
console.log(i.shiftLeft(33))
console.log(i.shiftLeft(1))
