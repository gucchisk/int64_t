const { Int64, UInt64 } = require('../src/int64')

describe('Int64', () => {
  describe('Int64 constructor', () => {
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
        i = new Int64(1)
      }).not.toThrow()
      expect(i).toEqual(new Int64(0x0, 0x1))
      expect(() => {
        i = new Int64(0x123456789)
      }).not.toThrow()
      expect(i).toEqual(new Int64(0x1, 0x23456789))
      expect(() => {
        i = new Int64(Number.MAX_SAFE_INTEGER)
      }).not.toThrow()
      expect(i).toEqual(new Int64(0x001fffff, 0xffffffff))
      expect(() => {
        i = new Int64(Number.MIN_SAFE_INTEGER)
      }).not.toThrow()
      expect(i).toEqual(new Int64(0xffe00000, 0x1))
      expect(() => {
        i = new Int64(-1)
      }).not.toThrow()
      expect(i).toEqual(new Int64(0xffffffff, 0xffffffff))
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

  describe('typename', () => {
    test('Int64', () => {
      const i = Int64.Zero
      expect(i.typename()).toEqual('Int64')
      i.constructor = UInt64
      expect(i.typename()).toEqual('Int64')
      i.constructor = Int64
      i.constructor.Zero = new Int64(0)
    })
  })

  describe('equal', () => {
    test('true', () => {
      let i = Int64.Zero
      expect(i.equal(Int64.Zero)).toBeTruthy()
      expect(i.equal(new Int64(0x0))).toBeTruthy()
      i = new Int64(0x12345678, 0x9abcdef0)
      expect(i.equal(new Int64(0x12345678, 0x9abcdef0))).toBeTruthy()
    })
    test('false', () => {
      let i = Int64.Zero
      expect(i.equal(new Int64(0x1))).toBeFalsy()
      expect(i.equal(new Int64(0x1, 0x0))).toBeFalsy()
      expect(i.equal(UInt64.Zero)).toBeFalsy()
    })
  })

  describe('Int64 and', () => {
    test('success', () => {
      const i = new Int64(0x80800000, 0x80800000)
      expect(i.and(UInt64.Max)).toEqual(i)
      expect(i.and(Int64.Zero)).toEqual(Int64.Zero)
      expect(i.and(new Int64(0x7f7fffff, 0x7f7fffff))).toEqual(Int64.Zero)
    })
  })

  describe('Int64 or', () => {
    test('success', () => {
      const i = new Int64(0x80800000, 0x80800000)
      expect(i.or(UInt64.Max)).toEqual(UInt64.Max)
      expect(i.or(Int64.Zero)).toEqual(i)
      expect(i.or(new Int64(0x7f7fffff, 0x7f7fffff))).toEqual(UInt64.Max)
    })
  })

  describe('Int64 xor', () => {
    test('success', () => {
      const i = new Int64(0x80800000, 0x80800000)
      expect(i.xor(UInt64.Max)).toEqual(new Int64(0x7f7fffff, 0x7f7fffff))
      expect(i.xor(Int64.Zero)).toEqual(new Int64(0x80800000, 0x80800000))
      expect(i.xor(new Int64(0x7f7fffff, 0x7f7fffff))).toEqual(UInt64.Max)
    })
  })

  describe('Int64 shiftLeft', () => {
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

  describe('Int64 shiftRight', () => {
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
  describe('Int64 shiftRight logical', () => {
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
  describe('Int64 toString', () => {
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
  describe('Int64 toUnsigned', () => {
    test('toUnsigned', () => {
      const i = new Int64(0x80000000, 0)
      const ui = i.toUnsigned()
      expect(ui).not.toBeInstanceOf(Int64)
      expect(ui).toBeInstanceOf(UInt64)
      expect(ui.toString(16, true)).toEqual('0x8000000000000000')
    })
  })
  describe('Int64 add', () => {
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
  describe('Int64 sub', () => {
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
  describe('Int64 mul', () => {
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
  describe('Int64 div', () => {
    describe('Int64 divisor', () => {
      test('div divisor == dividend', () => {
	const i = new Int64(0x12345678, 0x9abcdef0)
	const divi = i.div(i)
	expect(divi).toBeInstanceOf(Int64)
	expect(divi).toEqual(new Int64(0x1))
      })
      test('div positive divisor < positive dividend', () => {
	const i = new Int64(0x12345678, 0x9abcdef0)
	let divi = i.div(new Int64(0x0, 0x2))
	expect(divi).toBeInstanceOf(Int64)
	expect(divi).toEqual(i.shiftRight(1))
	divi = i.div(new Int64(0x0, 0x20))
	expect(divi).toBeInstanceOf(Int64)
	expect(divi).toEqual(i.shiftRight(5))
	divi = i.div(new Int64(0x10000000, 0x0))
	expect(divi).toBeInstanceOf(Int64)
	expect(divi).toEqual(new Int64(0x1))
      })
      test('div positive divisor > positive dividend', () => {
	const i = new Int64(0x12345678, 0x9abcdef0)
	const divi = i.div(new Int64(0x20000000, 0x0))
	expect(divi).toBeInstanceOf(Int64)
	expect(divi).toEqual(new Int64(0x0))
      })
      test('div negative divisor < positive dividend (abs)', () => {
	const i = new Int64(0x12345678, 0x9abcdef0)
	let divi = i.div(new Int64(0xffffffff, 0xfffffffe))
	expect(divi).toBeInstanceOf(Int64)
	expect(divi).toEqual(i.shiftRight(1, true).twosComplement())
	divi = i.div(new Int64(0xffffffff, 0x0))
	expect(divi).toBeInstanceOf(Int64)
	expect(divi).toEqual(new Int64(0xffffffff, 0xedcba988))
      })
      test('div negative divisor > positive dividend (abs)', () => {
	const i = new Int64(0x12345678, 0x9abcdef0)
	let divi = i.div(new Int64(0x80000000, 0xf0000000))
	expect(divi).toBeInstanceOf(Int64)
	expect(divi).toEqual(new Int64(0x0))
      })
      test('div negative divisor == positive dividend (abs)', () => {
	const i = new Int64(0x12345678, 0x9abcdef0)
	const divi = i.div(new Int64(0xedcba987, 0x65432110))
	expect(divi).toBeInstanceOf(Int64)
	expect(divi).toEqual(new Int64(-1))
      })
      test('div positive divisor < negative dividend (abs)', () => {
	const i = new Int64(0x80000000, 0x0)
	const divi = i.div(new Int64(2))
	expect(divi).toBeInstanceOf(Int64)
	expect(divi).toEqual(i.twosComplement().shiftRight(1, true).toNegative())
      })
      test('div positive divisor > negative dividend (abs)', () => {
	const i = new Int64(0xf0000000, 0x0)
	const divi = i.div(new Int64(0x12345678, 0x9abcdef0))
	expect(divi).toBeInstanceOf(Int64)
	expect(divi).toEqual(new Int64(0x0))
      })
      test('div positive divisor == negative dividend (abs)', () => {
	const i = new Int64(0xffffffff, 0xffffffff)
	const divi = i.div(new Int64(1))
	expect(divi).toBeInstanceOf(Int64)
	expect(divi).toEqual(new Int64(-1))
      })
      test('div negative divisor < negative dividend (abs)', () => {
	const i = new Int64(0x80000000, 0x0)
	const divi = i.div(new Int64(-2))
	expect(divi).toBeInstanceOf(Int64)
	expect(divi).toEqual(new Int64(0x40000000, 0x0))
      })
      test('div negative divisor > negative dividend (abs)', () => {
	const i = new Int64(0xf0000000, 0x0)
	const divi = i.div(new Int64(0x80000000, 0x0))
	expect(divi).toBeInstanceOf(Int64)
	expect(divi).toEqual(new Int64(0x0))
      })
    })
    describe('UInt64 divisor', () => {
      test('div divisor == dividend', () => {
	const i = new Int64(0x12345678, 0x9abcdef0)
	const divi = i.div(new UInt64(0x12345678, 0x9abcdef0))
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(new UInt64(1))
      })
      test('div positive divisor < positive dividend', () => {
	const i = new Int64(0x12345678, 0x9abcdef0)
	const divi = i.div(new UInt64(0x2))
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(new UInt64(0x12345678, 0x9abcdef0).shiftRight(1))
      })
      test('div positive divisor > positive dividend', () => {
	const i = new Int64(0x12345678, 0x9abcdef0)
	const divi = i.div(new UInt64(0x80000000, 0x0))
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(new UInt64(0x0))
      })
      test('div positive divisor < negative dividend (abs)', () => {
	const i = new Int64(0x80000000, 0x12345678)
	const divi = i.div(new UInt64(0x2))
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(new UInt64(0x80000000, 0x12345678).shiftRight(1))
      })
      test('div positive divisor > negative dividend (abs)', () => {
	let i = new Int64(0xf0000000, 0x12345678)
	let divi = i.div(new UInt64(0x12345678, 0x9abcdef0))
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(new UInt64(13))
      })
      test('div positive divisor > negative dividend (unsigned)', () => {
	const i = new Int64(0x80000000, 0x12345678)
	const divi = i.div(new UInt64(0x80000001, 0x12345678))
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(UInt64.Zero)
      })

      test('div positive divisor == negative dividend (abs)', () => {
	const i = new Int64(0xedcba987, 0x65432110)
	const divi = i.div(new UInt64(0x12345678, 0x9abcdef0))
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(new UInt64(13))
      })
    })
  })
  describe('Int64 toNegative', () => {
    test('toNegative', () => {
      let i = new Int64(0x0, 0x1)
      expect(i.toNegative()).toEqual(new Int64(0xffffffff, 0xffffffff))
      i = new Int64(0x12345678, 0x9abcdef0)
      expect(i.toNegative()).toEqual(new Int64(0xedcba987, 0x65432110))
    })
  })
  describe('Int64 twosComplement', () => {
    test('success', () => {
      let i = new Int64(0x12345678, 0x9abcdef0)
      expect(i.twosComplement()).toEqual(new UInt64(0xedcba987, 0x65432110))
      i = new UInt64(0x80402010, 0x0)
      expect(i.twosComplement()).toEqual(new UInt64(0x7fbfdff0, 0x0))
      i = new Int64(-1)
      expect(i.twosComplement()).toEqual(new Int64(1))
      i = new Int64(Number.MIN_SAFE_INTEGER)
      expect(i.twosComplement()).toEqual(new Int64(Number.MAX_SAFE_INTEGER))
    })
  })
  describe('Int64 compare', () => {
    test('equal', () => {
      let i = new Int64(0x12345678, 0x0)
      expect(i.compare(new Int64(0x12345678, 0x0))).toEqual(0)
      expect(i.compare(new UInt64(0x12345678, 0x0))).toEqual(0)
      i = new Int64(0x0, 0x12345678)
      expect(i.compare(new Int64(0x0, 0x12345678))).toEqual(0)
      expect(i.compare(new UInt64(0x0, 0x12345678))).toEqual(0)
      i = new Int64(0x12345678, 0x9abcdef0)
      expect(i.compare(new Int64(0x12345678, 0x9abcdef0))).toEqual(0)
      expect(i.compare(new UInt64(0x12345678, 0x9abcdef0))).toEqual(0)
      i = new Int64(0x80402010, 0x80402010)
      expect(i.compare(new Int64(0x80402010, 0x80402010))).toEqual(0)
      expect(i.compare(new UInt64(0x80402010, 0x80402010))).toEqual(0)
      expect(Int64.Zero.compare(Int64.Zero)).toEqual(0)
    })
    test('bigger', () => {
      let i = new Int64(0x12345678, 0x0)
      expect(i.compare(new Int64(0x12345677, 0x0))).toEqual(1)
      expect(i.compare(new Int64(0x12345677, 0xffffffff))).toEqual(1)
      expect(i.compare(new Int64(0xffffffff, 0xffffffff))).toEqual(1)
      expect(i.compare(new Int64(0x80000000, 0x0))).toEqual(1)
      expect(i.compare(Int64.Zero)).toEqual(1)
      expect(i.compare(new UInt64(0x12345677, 0x0))).toEqual(1)
      expect(i.compare(new UInt64(0x12345677, 0xffffffff))).toEqual(1)
      expect(i.compare(UInt64.Zero)).toEqual(1)
      i = new Int64(0x0, 0x12345678)
      expect(i.compare(new Int64(0x0, 0x12345677))).toEqual(1)
      expect(i.compare(new Int64(0xffffffff, 0xffffffff))).toEqual(1)
      expect(i.compare(new Int64(0x80000000, 0x0))).toEqual(1)
      expect(i.compare(Int64.Zero)).toEqual(1)
      expect(i.compare(new UInt64(0x0, 0x12345677))).toEqual(1)
      expect(i.compare(UInt64.Zero)).toEqual(1)
      i = new Int64(0x12345678, 0x9abcdef0)
      expect(i.compare(new Int64(0x12345677, 0xffffffff))).toEqual(1)
      expect(i.compare(new Int64(0x12345678, 0x9abcdeef))).toEqual(1)
      expect(i.compare(new Int64(0xffffffff, 0xffffffff))).toEqual(1)
      expect(i.compare(new Int64(0x80000000, 0x0))).toEqual(1)
      expect(i.compare(Int64.Zero)).toEqual(1)
      expect(i.compare(new UInt64(0x12345677, 0xffffffff))).toEqual(1)
      expect(i.compare(new UInt64(0x12345678, 0x9abcdeef))).toEqual(1)
      expect(i.compare(UInt64.Zero)).toEqual(1)
      i = new Int64(0x80000001, 0x1)
      expect(i.compare(new Int64(0x80000001, 0x0))).toEqual(1)
      expect(i.compare(new Int64(0x80000000, 0x1))).toEqual(1)
      expect(i.compare(new UInt64(0x80000001, 0x0))).toEqual(1)
      expect(i.compare(new UInt64(0x80000000, 0x1))).toEqual(1)
      i = new Int64(0xffffffff, 0xffffffff)
      expect(i.compare(new Int64(0xffffffff, 0xfffffffe))).toEqual(1)
      expect(i.compare(new Int64(0xfffffffe, 0xffffffff))).toEqual(1)
      expect(i.compare(UInt64.Zero)).toEqual(1)
    })
    test('smaller', () => {
      let i = new Int64(0x12345678, 0x0)
      expect(i.compare(new Int64(0x12345679, 0x0))).toEqual(-1)
      expect(i.compare(new Int64(0x12345678, 0x1))).toEqual(-1)
      expect(i.compare(new UInt64(0x12345679, 0x0))).toEqual(-1)
      expect(i.compare(new UInt64(0x12345678, 0x1))).toEqual(-1)
      expect(i.compare(new UInt64(0xffffffff, 0xffffffff))).toEqual(-1)
      expect(i.compare(new UInt64(0x80000000, 0x0))).toEqual(-1)
      i = new Int64(0x0, 0x12345678)
      expect(i.compare(new Int64(0x0, 0x12345679))).toEqual(-1)
      expect(i.compare(new UInt64(0x0, 0x12345679))).toEqual(-1)
      expect(i.compare(new UInt64(0xffffffff, 0xffffffff))).toEqual(-1)
      expect(i.compare(new UInt64(0x80000000, 0x0))).toEqual(-1)
      i = new Int64(0x12345678, 0x9abcdef0)
      expect(i.compare(new Int64(0x12345679, 0x0))).toEqual(-1)
      expect(i.compare(new Int64(0x12345678, 0x9abcdef1))).toEqual(-1)
      expect(i.compare(new UInt64(0x12345679, 0x0))).toEqual(-1)
      expect(i.compare(new UInt64(0x12345678, 0x9abcdef1))).toEqual(-1)
      expect(i.compare(new UInt64(0xffffffff, 0xffffffff))).toEqual(-1)
      expect(i.compare(new UInt64(0x80000000, 0x0))).toEqual(-1)
      i = new Int64(0xffffffff, 0xffffffff)
      expect(i.compare(Int64.Zero)).toEqual(-1)
      i = Int64.Zero
      expect(i.compare(new Int64(0x0, 0x1))).toEqual(-1)
      expect(i.compare(new UInt64(0x0, 0x1))).toEqual(-1)
    })
  })

  describe('Int64 isNegative', () => {
    test('positive', () => {
      let i = new Int64(0x0, 0x1)
      expect(i.isNegative()).toEqual(false)
      i = new Int64(0x7fffffff, 0xffffffff)
      expect(i.isNegative()).toEqual(false)
      i = new Int64(0x12345678, 0x9abcdef0)
      expect(i.isNegative()).toEqual(false)
    })
    test('negative', () => {
      let i = new Int64(0x80000000, 0x0)
      expect(i.isNegative()).toEqual(true)
      i = new Int64(0xffffffff, 0xffffffff)
      expect(i.isNegative()).toEqual(true)
    })
  })

  describe('Int64 topBitPosition', () => {
    test('normal', () => {
      let i = new Int64(0x12345678, 0x9abcdef0)
      expect(i.topBitPosition()).toEqual(61)
    })
    test('high', () => {
      let i = new Int64(0x80000000, 0x0)
      expect(i.topBitPosition()).toEqual(64)
      i = new Int64(0x01000000, 0x0)
      expect(i.topBitPosition()).toEqual(57)
    })
    test('low', () => {
      let i = new Int64(0x0, 0x80000000)
      expect(i.topBitPosition()).toEqual(32)
      i = new Int64(0x0, 0x01000000)
      expect(i.topBitPosition()).toEqual(25)
    })
  })
})

describe('UInt64', () => {
  describe('typename', () => {
    test('UInt64', () => {
      const i = UInt64.Zero
      expect(i.typename()).toEqual('UInt64')
      i.constructor = Int64
      expect(i.typename()).toEqual('UInt64')
      i.constructor = UInt64
      i.constructor.Zero = new UInt64(0)
    })
  })

  describe('equal', () => {
    test('true', () => {
      let i = UInt64.Zero
      expect(i.equal(UInt64.Zero)).toBeTruthy()
      expect(i.equal(new UInt64(0x0))).toBeTruthy()
      i = new UInt64(0x12345678, 0x9abcdef0)
      expect(i.equal(new UInt64(0x12345678, 0x9abcdef0))).toBeTruthy()
    })
    test('false', () => {
      let i = UInt64.Zero
      expect(i.equal(new UInt64(0x1))).toBeFalsy()
      expect(i.equal(new UInt64(0x1, 0x0))).toBeFalsy()
      expect(i.equal(Int64.Zero)).toBeFalsy()
    })
  })

  describe('UInt64 shiftRight', () => {
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
  describe('UInt64 toString', () => {
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
  describe('UInt64 toSigned', () => {
    test('toSigned', () => {
      const ui = new UInt64(0xffffffff, 0xffffffff)
      const i = ui.toSigned()
      expect(i).not.toBeInstanceOf(UInt64)
      expect(i).toBeInstanceOf(Int64)
      expect(i.toString()).toEqual('-1')
    })
  })
  describe('UInt64 add', () => {
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
  describe('UInt64 mul', () => {
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
  describe('UInt64 div', () => {
    describe('UInt64 divisor', () => {
      test('div divisor < dividend', () => {
	const i = new UInt64(0x12345678, 0x9abcdef0)
	let divi = i.div(new UInt64(0x0, 0x2))
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(i.shiftRight(1))
	divi = i.div(new UInt64(0x0, 0x20))
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(i.shiftRight(5))
	divi = i.div(new UInt64(0x10000000, 0x0))
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(new UInt64(0x1))
      })
      test('div divisor > dividend', () => {
	const i = new UInt64(0x12345678, 0x9abcdef0)
	const divi = i.div(new UInt64(0x20000000, 0x0))
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(new UInt64(0x0))
      })
      test('div divisor == dividend', () => {
	const i = new UInt64(0x12345678, 0x9abcdef0)
	const divi = i.div(i)
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(new UInt64(0x1))
      })
    })
    describe('Int64 divisor', () => {
      test('div Int64 positive divisor == UInt64 dividend', () => {
	const i = new UInt64(0x12345678, 0x9abcdef0)
	const divi = i.div(new Int(0x12345678, 0x9abcdef0))
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(new UInt64(1))
      })
      test('div Int64 positive divisor > UInt64 dividend', () => {
	const i = new UInt64(0x12345678, 0x9abcdef0)
	const divi = i.div(new Int(0x20000008, 0x0))
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(UInt64.Zero)
      })
      test('div Int64 positive divisor < UInt64 dividend', () => {
	const i = new UInt64(0x12345678, 0x9abcdef0)
	const divi = i.div(new Int(0x2))
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(new UInt64(0x01234567, 0x89abcdef))
      })
      test('div Int64 negative divisor == UInt64 dividend (abs)', () => {
	const i = new UInt64(0x123456789, 0x9abcdef0)
	const divi = i.div(new Int(0xedcba987, 0x65432110))
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(UInt64.Zero)
      })
      test('div Int64 negative divisor > UInt64 dividend (abs)', () => {
	const i = new UInt64(0x123456789, 0x9abcdef0)
	const divi = i.div(new Int(0x80000000, 0x0))
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(new UInt64(0x7))
      })
      test('div Int64 negative divisor < UInt64 dividend (abs)', () => {
	const i = new UInt64(0x123456789, 0x9abcdef0)
	const divi = i.div(new Int(0xf0000000, 0x0))
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(new UInt64(0xd))
      })
      test('div Int64 negative divisor (to unsigned) > UInt64 dividend', () => {
	const i = new UInt64(0x12345678, 0x9abcdef0)
	const divi = i.div(new Int(0xffffffff, 0xffffffff))
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(UInt64(0xe))
      })
      test('div Int64 negative divisor (to unsigned) == UInt64 dividend', () => {
	const i = new UInt64(0x87654321, 0x12345678)
	const divi = i.div(new Int(0x87654321, 0x12345678))
	expect(divi).toBeInstanceOf(UInt64)
	expect(divi).toEqual(UInt64(0x1))
      })
    })
  })
  describe('UInt64 compare', () => {
    test('equal', () => {
      let i = new UInt64(0x12345678, 0x0)
      expect(i.compare(new UInt64(0x12345678, 0x0))).toEqual(0)
      expect(i.compare(new Int64(0x12345678, 0x0))).toEqual(0)
      i = new UInt64(0x0, 0x12345678)
      expect(i.compare(new UInt64(0x0, 0x12345678))).toEqual(0)
      expect(i.compare(new Int64(0x0, 0x12345678))).toEqual(0)
      i = new UInt64(0x12345678, 0x9abcdef0)
      expect(i.compare(new UInt64(0x12345678, 0x9abcdef0))).toEqual(0)
      expect(i.compare(new Int64(0x12345678, 0x9abcdef0))).toEqual(0)
      i = new UInt64(0x80402010, 0x80402010)
      expect(i.compare(new UInt64(0x80402010, 0x80402010))).toEqual(0)
      expect(i.compare(new Int64(0x80402010, 0x80402010))).toEqual(0)
      expect(UInt64.Zero.compare(UInt64.Zero)).toEqual(0)
    })
    test('bigger', () => {
      let i = new UInt64(0x12345678, 0x0)
      expect(i.compare(new UInt64(0x12345677, 0x0))).toEqual(1)
      expect(i.compare(new UInt64(0x12345677, 0xffffffff))).toEqual(1)
      expect(i.compare(UInt64.Zero)).toEqual(1)
      i = new UInt64(0x0, 0x12345678)
      expect(i.compare(new UInt64(0x0, 0x12345677))).toEqual(1)
      expect(i.compare(UInt64.Zero)).toEqual(1)
      i = new UInt64(0x12345678, 0x9abcdef0)
      expect(i.compare(new UInt64(0x12345677, 0xffffffff))).toEqual(1)
      expect(i.compare(new UInt64(0x12345678, 0x9abcdeef))).toEqual(1)
      expect(i.compare(UInt64.Zero)).toEqual(1)
      i = new UInt64(0x80000001, 0x1)
      expect(i.compare(new UInt64(0x80000001, 0x0))).toEqual(1)
      expect(i.compare(new UInt64(0x80000000, 0x1))).toEqual(1)
      i = new UInt64(0xffffffff, 0xffffffff)
      expect(i.compare(UInt64.Zero)).toEqual(1)
    })
    test('smaller', () => {
      let i = new UInt64(0x12345678, 0x0)
      expect(i.compare(new UInt64(0x12345679, 0x0))).toEqual(-1)
      expect(i.compare(new UInt64(0x12345678, 0x1))).toEqual(-1)
      expect(i.compare(new UInt64(0xffffffff, 0xffffffff))).toEqual(-1)
      expect(i.compare(new UInt64(0x80000000, 0x0))).toEqual(-1)
      expect(i.compare(new Int64(0x12345679, 0x0))).toEqual(-1)
      expect(i.compare(new Int64(0x12345678, 0x1))).toEqual(-1)
      expect(i.compare(new Int64(0xffffffff, 0xffffffff))).toEqual(-1)
      expect(i.compare(new Int64(0x80000000, 0x0))).toEqual(-1)
      i = new UInt64(0x0, 0x12345678)
      expect(i.compare(new UInt64(0x0, 0x12345679))).toEqual(-1)
      expect(i.compare(new UInt64(0xffffffff, 0xffffffff))).toEqual(-1)
      expect(i.compare(new UInt64(0x80000000, 0x0))).toEqual(-1)
      expect(i.compare(new Int64(0x0, 0x12345679))).toEqual(-1)
      expect(i.compare(new Int64(0xffffffff, 0xffffffff))).toEqual(-1)
      expect(i.compare(new Int64(0x80000000, 0x0))).toEqual(-1)
      i = new UInt64(0x12345678, 0x9abcdef0)
      expect(i.compare(new UInt64(0x12345679, 0x0))).toEqual(-1)
      expect(i.compare(new UInt64(0x12345678, 0x9abcdef1))).toEqual(-1)
      expect(i.compare(new UInt64(0xffffffff, 0xffffffff))).toEqual(-1)
      expect(i.compare(new UInt64(0x80000000, 0x0))).toEqual(-1)
      expect(i.compare(new Int64(0x12345679, 0x0))).toEqual(-1)
      expect(i.compare(new Int64(0x12345678, 0x9abcdef1))).toEqual(-1)
      expect(i.compare(new Int64(0xffffffff, 0xffffffff))).toEqual(-1)
      expect(i.compare(new Int64(0x80000000, 0x0))).toEqual(-1)
      expect(UInt64.Zero.compare(new UInt64(0x0, 0x1))).toEqual(-1)
    })
  })
  describe('toNegative', () => {
    test('undefined', () => {
      let ui = new UInt64(0x0, 0x1)
      expect(ui.toNegative).toBeUndefined()
      ui = new UInt64(0x80000000, 0x0)
      expect(ui.toNegative).toBeUndefined()
      ui = new UInt64(0x87654321, 0x9abcdef0)
      expect(ui.toNegative).toBeUndefined()
    })
  })
  describe('isNegative', () => {
    test('UInt64', () => {
      let ui = new UInt64(0x0, 0x1)
      expect(ui.isNegative).toBeUndefined()
      ui = new UInt64(0x80000000, 0x0)
      expect(ui.isNegative).toBeUndefined()
      ui = new UInt64(0x87654321, 0x9abcdef0)
      expect(ui.isNegative).toBeUndefined()
    })
  })
})
