const { Int64, UInt64 } = require('../src/int64')

describe('Int64', () => {
  describe('constructor', () => {
    test('success Buffer', () => {
      expect(() => {
	let buf = Buffer.from([0x80, 0x80, 0x00, 0x00, 0x80, 0x80, 0x00, 0x00])
	new Int64(buf)
      }).not.toThrow()
    })
    test('success high & low int', () => {
      expect(() => {
	new Int64(0x80800000, 0x80800000)
      }).not.toThrow()
    })
    test('success int', () => {
      let i
      expect(() => {
	i = new Int64(Number.MAX_SAFE_INTEGER)
      }).not.toThrow()
      expect(i).toEqual(new Int64(0x001fffff, 0xffffffff))
      expect(() => {
	new Int64(0x123456789)
      }).not.toThrow()
    })
    test('error Buffer length', () => {
      expect(() => {
	new Int64(Buffer.from([0x80]))
      }).toThrow(/Buffer length must be 8/)
      expect(() => {
	let buf = Buffer.from([0x80, 0x80, 0x00, 0x00, 0x80, 0x80, 0x00, 0x00, 0x00])
	new Int64(buf)
      }).toThrow(/Buffer length must be 8/)
    })
    test('error unsafe int', () => {
      let i
      expect(() => {
	i = new Int64(0x0020000000000000)
      }).toThrow('Unsafe integer')
    })
    test('error invalid arguments', () => {
      expect(() => {
	new Int64('hello')
      }).toThrow('Invalid arguments')
    })
  })

  describe('and', () => {
    test('success', () => {
      const i = new Int64(0x80800000, 0x80800000)
      expect(i.and(UInt64.Max)).toEqual(i)
      expect(i.and(Int64.Zero)).toEqual(Int64.Zero)
      expect(i.and(new Int64(0x7f7fffff, 0x7f7fffff))).toEqual(Int64.Zero)
    })
  })

  describe('or', () => {
    test('success', () => {
      const i = new Int64(0x80800000, 0x80800000)
      expect(i.or(UInt64.Max)).toEqual(UInt64.Max)
      expect(i.or(Int64.Zero)).toEqual(i)
      expect(i.or(new Int64(0x7f7fffff, 0x7f7fffff))).toEqual(UInt64.Max)
    })
  })

  describe('xor', () => {
    test('success', () => {
      const i = new Int64(0x80800000, 0x80800000)
      expect(i.xor(UInt64.Max)).toEqual(new Int64(0x7f7fffff, 0x7f7fffff))
      expect(i.xor(Int64.Zero)).toEqual(new Int64(0x80800000, 0x80800000))
      expect(i.xor(new Int64(0x7f7fffff, 0x7f7fffff))).toEqual(UInt64.Max)
    })
  })

  describe('shiftLeft', () => {
    test('low', () => {
      const i = new Int64(0x0, 0x80402010)
      expect(i.shiftLeft(2)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x02, 0x01, 0x00, 0x80, 0x40
      ])))
      expect(i.shiftLeft(31)).toEqual(new Int64(Buffer.from([
	0x40, 0x20, 0x10, 0x08, 0x00, 0x00, 0x00, 0x00
      ])))
      expect(i.shiftLeft(32)).toEqual(new Int64(Buffer.from([
	0x80, 0x40, 0x20, 0x10, 0x00, 0x00, 0x00, 0x00
      ])))
      expect(i.shiftLeft(34)).toEqual(new Int64(Buffer.from([
	0x01, 0x00, 0x80, 0x40, 0x00, 0x00, 0x00, 0x00
      ])))
      expect(i.shiftLeft(63)).toEqual(Int64.Zero)
      expect(i.shiftLeft(64)).toEqual(Int64.Zero)
    })
    test('normal', () => {
      const i = new Int64(0x80402010, 0x80402010)
      expect(i.shiftLeft(2)).toEqual(new Int64(Buffer.from([
	0x01, 0x00, 0x80, 0x42, 0x01, 0x00, 0x80, 0x40
      ])))
      expect(i.shiftLeft(30)).toEqual(new Int64(Buffer.from([
	0x20, 0x10, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00
      ])))
      expect(i.shiftLeft(32)).toEqual(new Int64(Buffer.from([
	0x80, 0x40, 0x20, 0x10, 0x00, 0x00, 0x00, 0x00
      ])))
      expect(i.shiftLeft(34)).toEqual(new Int64(Buffer.from([
	0x01, 0x00, 0x80, 0x40, 0x00, 0x00, 0x00, 0x00
      ])))
      expect(i.shiftLeft(63)).toEqual(Int64.Zero)
      expect(i.shiftLeft(64)).toEqual(Int64.Zero)
    })
  })

  describe('shiftRight', () => {
    test('low', () => {
      const i = new Int64(0x0, 0x80402010)
      expect(i.shiftRight(2)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x20, 0x10, 0x08, 0x04
      ])))
      expect(i.shiftRight(30)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02
      ])))
      expect(i.shiftRight(32)).toEqual(Int64.Zero)
      expect(i.shiftRight(34)).toEqual(Int64.Zero)
      expect(i.shiftLeft(63)).toEqual(Int64.Zero)
      expect(i.shiftLeft(64)).toEqual(Int64.Zero)
    })
    test('high', () => {
      const i = new Int64(0x08040201, 0x0)
      expect(i.shiftRight(2)).toEqual(new Int64(Buffer.from([
	0x02, 0x01, 0x00, 0x80, 0x40, 0x00, 0x00, 0x00
      ])))
      expect(i.shiftRight(30)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x20, 0x10, 0x08, 0x04
      ])))
      expect(i.shiftRight(32)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x08, 0x04, 0x02, 0x01
      ])))
      expect(i.shiftRight(34)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x02, 0x01, 0x00, 0x80
      ])))
      expect(i.shiftRight(60)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
      ])))
    })
    test('high negative', () => {
      const i = new Int64(0x80402010, 0x0)
      expect(i.shiftRight(2)).toEqual(new Int64(Buffer.from([
	0xe0, 0x10, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00
      ])))
      expect(i.shiftRight(30)).toEqual(new Int64(Buffer.from([
	0xff, 0xff, 0xff, 0xfe, 0x01, 0x00, 0x80, 0x40
      ])))
      expect(i.shiftRight(32)).toEqual(new Int64(Buffer.from([
	0xff, 0xff, 0xff, 0xff, 0x80, 0x40, 0x20, 0x10
      ])))
      expect(i.shiftRight(34)).toEqual(new Int64(Buffer.from([
	0xff, 0xff, 0xff, 0xff, 0xe0, 0x10, 0x08, 0x04
      ])))
      expect(i.shiftRight(63)).toEqual(new Int64(Buffer.from([
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff
      ])))
      expect(i.shiftRight(64)).toEqual(i)
    })
    test('normal negative', () => {
      const i = new Int64(0x80402010, 0x80402010)
      expect(i.shiftRight(2)).toEqual(new Int64(Buffer.from([
	0xe0, 0x10, 0x08, 0x04, 0x20, 0x10, 0x08, 0x04
      ])))
      expect(i.shiftRight(30)).toEqual(new Int64(Buffer.from([
	0xff, 0xff, 0xff, 0xfe, 0x01, 0x00, 0x80, 0x42
      ])))
      expect(i.shiftRight(32)).toEqual(new Int64(Buffer.from([
	0xff, 0xff, 0xff, 0xff, 0x80, 0x40, 0x20, 0x10
      ])))
      expect(i.shiftRight(34)).toEqual(new Int64(Buffer.from([
	0xff, 0xff, 0xff, 0xff, 0xe0, 0x10, 0x08, 0x04
      ])))
      expect(i.shiftRight(63)).toEqual(new Int64(Buffer.from([
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff
      ])))
      expect(i.shiftRight(64)).toEqual(i)
    })
  })
  describe('shiftRight logical', () => {
    test('low', () => {
      const i = new Int64(0x0, 0x80402010)
      expect(i.shiftRight(2, true)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x20, 0x10, 0x08, 0x04
      ])))
      expect(i.shiftRight(30)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02
      ])))
      expect(i.shiftRight(32)).toEqual(Int64.Zero)
      expect(i.shiftRight(34)).toEqual(Int64.Zero)
      expect(i.shiftLeft(63)).toEqual(Int64.Zero)
      expect(i.shiftLeft(64)).toEqual(Int64.Zero)
    })
    test('high', () => {
      const i = new Int64(0x08040201, 0x0)
      expect(i.shiftRight(2, true)).toEqual(new Int64(Buffer.from([
	0x02, 0x01, 0x00, 0x80, 0x40, 0x00, 0x00, 0x00
      ])))
      expect(i.shiftRight(30)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x20, 0x10, 0x08, 0x04
      ])))
      expect(i.shiftRight(32, true)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x08, 0x04, 0x02, 0x01
      ])))
      expect(i.shiftRight(34, true)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x02, 0x01, 0x00, 0x80
      ])))
      expect(i.shiftRight(60, true)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
      ])))
    })
    test('high negative', () => {
      const i = new Int64(0x80402010, 0x0)
      expect(i.shiftRight(2, true)).toEqual(new Int64(Buffer.from([
	0x20, 0x10, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00
      ])))
      expect(i.shiftRight(30, true)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x02, 0x01, 0x00, 0x80, 0x40
      ])))
      expect(i.shiftRight(32, true)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x80, 0x40, 0x20, 0x10
      ])))
      expect(i.shiftRight(34, true)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x20, 0x10, 0x08, 0x04
      ])))
      expect(i.shiftRight(63, true)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01
      ])))
      expect(i.shiftRight(64, true)).toEqual(i)
    })
    test('normal negative', () => {
      const i = new Int64(0x80402010, 0x80402010)
      expect(i.shiftRight(2, true)).toEqual(new Int64(Buffer.from([
	0x20, 0x10, 0x08, 0x04, 0x20, 0x10, 0x08, 0x04
      ])))
      expect(i.shiftRight(30, true)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x02, 0x01, 0x00, 0x80, 0x42
      ])))
      expect(i.shiftRight(32, true)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x80, 0x40, 0x20, 0x10
      ])))
      expect(i.shiftRight(34, true)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x20, 0x10, 0x08, 0x04
      ])))
      expect(i.shiftRight(63, true)).toEqual(new Int64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01
      ])))
      expect(i.shiftRight(64, true)).toEqual(i)
    })
  })
  describe('toString', () => {
    test('toString -1', () => {
      let i = new Int64(0xffffffff, 0xffffffff)
      expect(i.toString(2)).toEqual('-1')
      expect(i.toString(8)).toEqual('-1')
      expect(i.toString()).toEqual('-1')
      expect(i.toString(16)).toEqual('-1')
    })
    test('toString Min', () => {
      let i = new Int64(0x80000000, 0)
      expect(i.toString(2)).toEqual('-1000000000000000000000000000000000000000000000000000000000000000')
      expect(i.toString(8)).toEqual('-1000000000000000000000')
      expect(i.toString()).toEqual('-9223372036854775808')
      expect(i.toString(16)).toEqual('-8000000000000000')
    })
    test('toString Max', () => {
      let i = new Int64(0x7fffffff, 0xffffffff)
      expect(i.toString(2)).toEqual('111111111111111111111111111111111111111111111111111111111111111')
      expect(i.toString(8)).toEqual('777777777777777777777')
      expect(i.toString()).toEqual('9223372036854775807')
      expect(i.toString(16)).toEqual('7fffffffffffffff')
    })
  })
  describe('toUnsigned', () => {
    test('toUnsigned', () => {
      const i = new Int64(0x80000000, 0)
      const ui = i.toUnsigned()
      expect(ui).not.toBeInstanceOf(Int64)
      expect(ui).toBeInstanceOf(UInt64)
      expect(ui.toString(16, true)).toEqual('0x8000000000000000')
    })
  })
  describe('add', () => {
    test('add', () => {
      const i1 = new Int64(0x11111111, 0x11111111)
      const i2 = new Int64(0x10101010, 0x01010101)
      expect(i1.add(i2)).toEqual(new Int64(0x21212121, 0x12121212))
    })
    test('add carry low', () => {
      const i1 = new Int64(0x0, 0xffffffff)
      const i2 = new Int64(0x0, 0xffffffff)
      expect(i1.add(i2)).toEqual(new Int64(0x1, 0xfffffffe))
      const i3 = new Int64(0x0, 0x80000000)
      const i4 = new Int64(0x0, 0x80000000)
      expect(i3.add(i4)).toEqual(new Int64(0x1, 0x0))
    })
    test('add carry high', () => {
      const i1 = new Int64(0xffffffff, 0x0)
      const i2 = new Int64(0xffffffff, 0x0)
      expect(i1.add(i2)).toEqual(new Int64(0xfffffffe, 0x0))
      const i3 = new Int64(0x80000000, 0x0)
      const i4 = new Int64(0x80000000, 0x0)
      expect(i3.add(i4)).toEqual(new Int64(0x0, 0x0))
    })
    test('add carry', () => {
      const i1 = new Int64(0x80000000, 0x80000000)
      const i2 = new Int64(0x80000000, 0x80000000)
      expect(i1.add(i2)).toEqual(new Int64(0x1, 0x0))
      const i3 = new Int64(0xffffffff, 0xffffffff)
      const i4 = new Int64(0x0, 0x1)
      expect(i3.add(i4)).toEqual(new Int64(0x0, 0x0))
      const i5 = new Int64(0xffffffff, 0xffffffff)
      const i6 = new Int64(0x0, 0x10)
      expect(i5.add(i6)).toEqual(new Int64(0x0, 0xf))
    })
    test('add different type', () => {
      const i = new Int64(0x1, 0x0)
      const ui = new UInt64(0x0, 0x2)
      expect(i.add(ui)).toEqual(new Int64(0x1, 0x2))
      expect(i.add(ui)).toBeInstanceOf(Int64)
      // expect(() => {
      // 	i.add(ui)
      // }).toThrow('Cannot add Int64 to UInt64')
    })
  })
  describe('sub', () => {
    test('sub', () => {
      const i1 = new Int64(0x11111111, 0x11111111)
      const i2 = new Int64(0x10101010, 0x01010101)
      expect(i1.sub(i2)).toEqual(new Int64(0x01010101, 0x10101010))
    })
    test('sub brought high', () => {
      const i1 = new Int64(0x1, 0x0)
      const i2 = new Int64(0x0, 0x1)
      expect(i1.sub(i2)).toEqual(new Int64(0x0, 0xffffffff))
    })
    test('sub negative low', () => {
      const i1 = new Int64(0x0, 0x1)
      const i2 = new Int64(0x0, 0x2)
      expect(i1.sub(i2)).toEqual(UInt64.Max)
    })
    test('sub negative high', () => {
      const i1 = new Int64(0x1, 0x0)
      const i2 = new Int64(0x2, 0x0)
      expect(i1.sub(i2)).toEqual(new Int64(0xffffffff, 0x0))
    })
    test('sub negative', () => {
      const i1 = new Int64(0x1, 0x1)
      const i2 = new Int64(0x2, 0x2)
      expect(i1.sub(i2)).toEqual(new Int64(0xfffffffe, 0xffffffff))
    })
  })
  describe('mul', () => {
    test('mul', () => {
      const i = new Int64(0x12345678, 0x9abcdef0)
      const muli = i.mul(new Int64(2))
      expect(muli).toEqual(new Int64(0x2468acf1, 0x3579bde0))
      expect(muli).toBeInstanceOf(Int64)
    })
    test('mul low int', () => {
      const i = new Int64(0x12345678, 0x9abcdef0)
      expect(i.mul(new Int64(0x0, 0x12345678))).toEqual(new Int64(0x28f5c28e, 0x242d2080))
    })
    test('mul int64', () => {
      const i = new Int64(0x12345678, 0x9abcdef0)
      expect(i.mul(new Int64(0x12345678, 0x9abcdef0))).toEqual(new Int64(0xa5e20890, 0xf2a52100))
    })
    test('mul negative', () => {
      const i = new Int64(0x12345678, 0x9abcdef0)
      expect(i.mul(new Int64(0xffffffff, 0xfffffffe))).toEqual(new Int64(0xdb97530e, 0xca864220))
    })
    test('mul low int negative', () => {
      const i = new Int64(0x12345678, 0x9abcdef0)
      expect(i.mul(new Int64(0x0, 0x12345678).toNegative())).toEqual(new Int64(0xd70a3d71, 0xdbd2df80))
    })
    test('mul int64 negative', () => {
      const i = new Int64(0x12345678, 0x9abcdef0)
      expect(i.mul(i.toNegative())).toEqual(new Int64(0x5a1df76f, 0x0d5adf00))
    })
  })
  describe('toNegative', () => {
    test('toNegative', () => {
      let i = new Int64(0x0, 0x1)
      expect(i.toNegative()).toEqual(new Int64(0xffffffff, 0xffffffff))
      i = new Int64(0x12345678, 0x9abcdef0)
      expect(i.toNegative()).toEqual(new Int64(0xedcba987, 0x65432110))
    })
  })
})

describe('UInt64', () => {
  describe('shiftRight', () => {
    test('high negative', () => {
      const i = new UInt64(0x80402010, 0x0)
      expect(i.shiftRight(2)).toEqual(new UInt64(Buffer.from([
	0x20, 0x10, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00
      ])))
      expect(i.shiftRight(30)).toEqual(new UInt64(Buffer.from([
	0x00, 0x00, 0x00, 0x02, 0x01, 0x00, 0x80, 0x40
      ])))
      expect(i.shiftRight(32)).toEqual(new UInt64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x80, 0x40, 0x20, 0x10
      ])))
      expect(i.shiftRight(34)).toEqual(new UInt64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x20, 0x10, 0x08, 0x04
      ])))
      expect(i.shiftRight(63)).toEqual(new UInt64(Buffer.from([
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01
      ])))
      expect(i.shiftRight(64)).toEqual(i)
    })
  })
  describe('toString', () => {
    test('toString', () => {
      let i = new UInt64(0xf0000000, 0xf0000000)
      expect(i.toString(2)).toEqual('1111000000000000000000000000000011110000000000000000000000000000')
      expect(i.toString(8)).toEqual('1700000000036000000000')
      expect(i.toString()).toEqual('17293822573129236480')
      expect(i.toString(16)).toEqual('f0000000f0000000')
    })
    test('toString Max', () => {
      let i = new UInt64(0xffffffff, 0xffffffff)
      expect(i.toString(2)).toEqual('1111111111111111111111111111111111111111111111111111111111111111')
      expect(i.toString(8)).toEqual('1777777777777777777777')
      expect(i.toString()).toEqual('18446744073709551615')
      expect(i.toString(16)).toEqual('ffffffffffffffff')
    })
    test('toString with prefix', () => {
      let i = new UInt64(0xffffffff, 0xffffffff)
      expect(i.toString(2, true)).toEqual('0b1111111111111111111111111111111111111111111111111111111111111111')
      expect(i.toString(8, true)).toEqual('0o1777777777777777777777')
      expect(i.toString(10, true)).toEqual('18446744073709551615')
      expect(i.toString(16, true)).toEqual('0xffffffffffffffff')
    })
    test('toString prefix error', () => {
      let i = new UInt64(0xffffffff, 0xffffffff)
      expect(() => {
	i.toString(3, true)
      }).toThrow()
    })
  })
  describe('toSigned', () => {
    test('toSigned', () => {
      const ui = new UInt64(0xffffffff, 0xffffffff)
      const i = ui.toSigned()
      expect(i).not.toBeInstanceOf(UInt64)
      expect(i).toBeInstanceOf(Int64)
      expect(i.toString()).toEqual('-1')
    })
  })
  describe('add', () => {
    test('add', () => {
      const i1 = new UInt64(0x11111111, 0x11111111)
      const i2 = new UInt64(0x10101010, 0x01010101)
      expect(i1.add(i2)).toEqual(new Int64(0x21212121, 0x12121212))
    })
    test('add carry low', () => {
      const i1 = new UInt64(0x0, 0xffffffff)
      const i2 = new UInt64(0x0, 0xffffffff)
      expect(i1.add(i2)).toEqual(new Int64(0x1, 0xfffffffe))
      const i3 = new UInt64(0x0, 0x80000000)
      const i4 = new UInt64(0x0, 0x80000000)
      expect(i3.add(i4)).toEqual(new Int64(0x1, 0x0))
    })
    test('add carry high', () => {
      const i1 = new UInt64(0xffffffff, 0x0)
      const i2 = new UInt64(0xffffffff, 0x0)
      expect(i1.add(i2)).toEqual(new Int64(0xfffffffe, 0x0))
      const i3 = new UInt64(0x80000000, 0x0)
      const i4 = new UInt64(0x80000000, 0x0)
      expect(i3.add(i4)).toEqual(new Int64(0x0, 0x0))
    })
    test('add carry', () => {
      const i1 = new UInt64(0x80000000, 0x80000000)
      const i2 = new UInt64(0x80000000, 0x80000000)
      expect(i1.add(i2)).toEqual(new Int64(0x1, 0x0))
      const i3 = new UInt64(0xffffffff, 0xffffffff)
      const i4 = new UInt64(0x0, 0x1)
      expect(i3.add(i4)).toEqual(new Int64(0x0, 0x0))
      const i5 = new UInt64(0xffffffff, 0xffffffff)
      const i6 = new UInt64(0x0, 0x10)
      expect(i5.add(i6)).toEqual(new Int64(0x0, 0xf))
    })
    test('add different type', () => {
      const ui = new UInt64(0x1, 0x0)
      const i = new Int64(0x0, 0x2)
      expect(ui.add(i)).toEqual(new UInt64(0x1, 0x2))
      expect(ui.add(i)).toBeInstanceOf(UInt64)
      // expect(() => {
      // 	i.add(ui)
      // }).toThrow('Cannot add UInt64 to Int64')
    })
  })
  describe('mul', () => {
    test('mul', () => {
      const i = new UInt64(0x12345678, 0x9abcdef0)
      const muli = i.mul(new UInt64(0, 2))
      expect(muli).toEqual(new UInt64(0x2468acf1, 0x3579bde0))
      expect(muli).toBeInstanceOf(UInt64)
    })
    test('mul low int', () => {
      const i = new UInt64(0x12345678, 0x9abcdef0)
      expect(i.mul(new UInt64(0x0, 0x12345678))).toEqual(new UInt64(0x28f5c28e, 0x242d2080))
    })
    test('mul int64', () => {
      const i = new UInt64(0x12345678, 0x9abcdef0)
      expect(i.mul(new UInt64(0x12345678, 0x9abcdef0))).toEqual(new UInt64(0xa5e20890, 0xf2a52100))
    })
  })
})
