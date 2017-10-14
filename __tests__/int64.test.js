const { Int64, UInt64 } = require('../src/int64')

describe('Int64', () => {
  describe('constructor', () => {
    test('success', () => {
      expect(() => {
	let buf = Buffer.from([0x80, 0x80, 0x00, 0x00, 0x80, 0x80, 0x00, 0x00])
	new Int64(buf)
      }).not.toThrow()
      expect(() => {
	new Int64(0x80800000, 0x80800000)
      }).not.toThrow()
    })
    test('error', () => {
      expect(() => {
	new Int64(Buffer.from([0x80]))
      }).toThrow(/Buffer length must be 8/)
      expect(() => {
	let buf = Buffer.from([0x80, 0x80, 0x00, 0x00, 0x80, 0x80, 0x00, 0x00, 0x00])
	new Int64(buf)
      }).toThrow(/Buffer length must be 8/)
      expect(() => {
	new Int64(0x8080000080800000)
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
    test('high minus', () => {
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
    test('normal minus', () => {
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
})

describe('UInt64', () => {
  describe('shiftRight', () => {
    test('high minus', () => {
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
})
