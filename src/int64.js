

class Int64Base {
  constructor (first, second) {
    // new Int64(Buffer)
    if (first instanceof Buffer) {
      const length = first.length
      if (length !== 8) {
	throw new Error(`Buffer length must be 8, current argument length is ${length}`)
      }
      this.buffer = first
      return
    }
    // new Int64(Number, Number)
    if (typeof first === 'number' && typeof second === 'number') {
      this.buffer = int32PairToBuffer(first, second)
      return
    }
    throw new Error(`Invalid arguments`)
  }

  and (int64) {
    let buf = Buffer.alloc(8)
    const int64_buf = int64.toBuffer()
    for (let i = 0; i < 8; i++) {
      buf[i] = this.buffer[i] & int64_buf[i]
    }
    return new this.constructor(buf)
  }

  or (int64) {
    let buf = Buffer.alloc(8)
    const int64_buf = int64.toBuffer()
    for (let i = 0; i < 8; i++) {
      buf[i] = this.buffer[i] | int64_buf[i]
    }
    return new this.constructor(buf)
  }

  toBuffer () {
    return this.buffer
  }

  shiftLeft (num) {
    if (num >= 64) {
      return Int64.Zero
    }
    let buf = Buffer.alloc(8)
    let high = this.buffer.readInt32BE()
    let low = this.buffer.readInt32BE(4)
    if (num >= 32) {
      let value = low << (num - 32)
      const int32Buf = int32ToBuffer(value)
      for (let i = 0; i < 4; i++) {
	buf[i] = int32Buf[i]
      }
    } else {
      let shifted_high = ((high << num) & 0xffffffff) + ((low & shiftMaskHigh(num)) >>> (32 - num))
      let shifted_low = low << num
      buf.writeUInt32BE(shifted_high >>> 0, 0)
      buf.writeUInt32BE(shifted_low >>> 0, 4)
    }
    return new this.constructor(buf)
  }
}

export class Int64 extends Int64Base {
  constructor(first, second) {
    super(first, second)
  }
    
  shiftRight (num) {
    let buf = Buffer.alloc(8)
    let high = this.buffer.readInt32BE()
    let low = this.buffer.readInt32BE(4)
    num %= 64
    if (num >= 32) {
      let value = high >> (num - 32)
      const int32Buf = int32ToBuffer(value)
      for (let i = 0; i < 4; i++) {
	buf[4 + i] = int32Buf[i]
      }
      if ((high & 0x80000000) !== 0) {
	for (let i = 0; i < 4; i++) {
	  buf[i] = 0xff
	}
      }
    } else {
      let shifted_high = high >> num
      let shifted_low = ((high & shiftMaskLow(num)) << (32 - num)) + (low >>> num)
      buf = int32PairToBuffer(shifted_high, shifted_low)
    }
    return new Int64(buf)
  }

  toString (radix, prefix) {
    if (radix === undefined) {
      radix = 10
    }
    let pre = ''
    if (prefix === true) {
      pre = prefixString(radix)
    }
    let str = ''
    let high = this.buffer.readUInt32BE()
    let low = this.buffer.readUInt32BE(4)
    let negative = (high & 0x80000000) !== 0
    if (negative) {
      high = ~high
      low = 2 ** 32 - low
    }
    while (true) {
      const low_and_high_mod = (high % radix) * (2 ** 32) + low
      if (high == -1) break
      high = Math.floor(high / radix)
      low = Math.floor(low_and_high_mod / radix)
      str = (low_and_high_mod % radix).toString(radix) + str
      if (!high && !low) {
	break
      }
    }
    if (negative) {
      str = '-' + pre + str
    }
    return str
  }

  toUnsigned () {
    return new UInt64(this.toBuffer())
  }
}

Int64.Zero = new Int64(0, 0)
Int64.Max = new Int64(0x7fffffff, 0xffffffff)
Int64.Min = new Int64(0x80000000, 0)

export class UInt64 extends Int64Base {
  shiftRight (num) {
    let buf = Buffer.alloc(8)
    let high = this.buffer.readUInt32BE()
    let low = this.buffer.readUInt32BE(4)
    num %= 64
    if (num >= 32) {
      let value = high >>> (num - 32)
      const int32Buf = int32ToBuffer(value)
      for (let i = 0; i < 4; i++) {
	buf[4 + i] = int32Buf[i]
      }
    } else {
      let shifted_high = high >>> num
      let shifted_low = ((high & shiftMaskLow(num)) << (32 - num)) + (low >>> num)
      buf = int32PairToBuffer(shifted_high, shifted_low)
    }
    return new Int64(buf)
  }
  
  toString (radix, prefix) {
    if (radix === undefined) {
      radix = 10
    }
    let pre = ''
    if (prefix === true) {
      pre = prefixString(radix)
    }
    let high = this.buffer.readUInt32BE()
    let low = this.buffer.readUInt32BE(4)
    let str = ''
    while (true) {
      const low_and_high_mod = (high % radix) * (2 ** 32) + low
      if (high == -1) break
      high = Math.floor(high / radix)
      low = Math.floor(low_and_high_mod / radix)
      str = (low_and_high_mod % radix).toString(radix) + str
      if (!high && !low) {
	break
      }
    }
    return pre + str
  }

  toSigned () {
    return new Int64(this.toBuffer())
  }
}

function prefixString(radix) {
  switch (radix) {
  case 2:
    return '0b'
  case 8:
    return '0o'
  case 10:
    return ''
  case 16:
    return '0x'
  default:
    throw new Error(`cannot add prefix with this radix ${radix}`)
  }
}

UInt64.Zero = new UInt64(0, 0)
UInt64.Min = UInt64.Zero
UInt64.Max = new UInt64(0xffffffff, 0xffffffff)

function int32PairToBuffer(high, low) {
  let buf = Buffer.alloc(8)
  buf.writeUInt32BE(high >>> 0, 0)
  buf.writeUInt32BE(low >>> 0, 4)
  return buf
}

function int32ToBuffer(num) {
  let buf = Buffer.alloc(4)
  for(let i = 0; i < 4; i++) {
    buf[3 - i] = num & 0xff
    num >>= 8
  }
  return buf
}

function shiftMaskHigh(num) {
  if (num === 0 ) return 0
  const shift = 32 - num
  return (2 ** 32 - 1) >>> shift << shift
}

function shiftMaskLow(num) {
  if (num === 0 ) return 0
  const shift = 32 - num
  return (2 ** 32 - 1) >>> shift
}
