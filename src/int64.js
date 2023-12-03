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

    // Number
    if (typeof first === 'number') {
      // new Int64(Number)
      if (second === undefined) {
        this.buffer = intToBuffer(first)
        return
      }
      // new Int64(Number, Number)
      if (typeof second === 'number') {
        if (first < 0 || second < 0) {
          throw new Error(`Invalid arguments. Negative number is unacceptable.`)
        }
        this.buffer = int32PairToBuffer(first, second)
        return
      }
    }
    throw new Error(`Invalid arguments`)
  }

  typename () {
    const className = this.constructor.name
    throw new Error(`${className} does not implemented typename()`)
  }

  equal (i) {
    if (this.typename() !== i.typename()) {
      return false
    }
    return this.buffer.compare(i.toBuffer()) === 0
  }

  and (i) {
    const lHigh = this.buffer.readUInt32BE()
    const lLow = this.buffer.readUInt32BE(4)
    const ibuf = i.toBuffer()
    const rHigh = ibuf.readUInt32BE()
    const rLow = ibuf.readUInt32BE(4)
    const high = lHigh & rHigh
    const low = lLow & rLow
    return new this.constructor(int32PairToBuffer(high, low));
  }

  or (i) {
    const lHigh = this.buffer.readUInt32BE()
    const lLow = this.buffer.readUInt32BE(4)
    const ibuf = i.toBuffer()
    const rHigh = ibuf.readUInt32BE()
    const rLow = ibuf.readUInt32BE(4)
    const high = lHigh | rHigh
    const low = lLow | rLow
    return new this.constructor(int32PairToBuffer(high, low))
  }

  xor (i) {
    const lHigh = this.buffer.readUInt32BE()
    const lLow = this.buffer.readUInt32BE(4)
    const ibuf = i.toBuffer()
    const rHigh = ibuf.readUInt32BE()
    const rLow = ibuf.readUInt32BE(4)
    const high = lHigh ^ rHigh
    const low = lLow ^ rLow
    return new this.constructor(int32PairToBuffer(high, low))
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

  add (i) {
    const lHigh = this.buffer.readUInt32BE()
    const lLow = this.buffer.readUInt32BE(4)
    const ibuf = i.toBuffer()
    const rHigh = ibuf.readUInt32BE()
    const rLow = ibuf.readUInt32BE(4)

    let high = lHigh + rHigh
    let low = lLow + rLow
    if (low >= 0x100000000) {
      low &= 0xffffffff
      high += 1
    }
    high &= 0xffffffff
    const buf = int32PairToBuffer(high, low)
    return new this.constructor(buf)
  }

  sub (i) {
    return this.add(i.twosComplement())
  }

  mul (i) {
    const ibuf = i.toBuffer()
    const high = ibuf.readUInt32BE()
    const low = ibuf.readUInt32BE(4)

    let num = this.constructor.Zero
    for (let i = 0; i < 32; i++) {
      if (low & (0x1 << i)) {
	num = num.add(this.shiftLeft(i))
      }
    }
    for (let i = 0; i < 32; i++) {
      if (high & (0x1 << i)) {
	num = num.add(this.shiftLeft(i + 32))
      }
    }
    return num
  }

  div (i) {
    const divMod = this.divAndMod(i)
    return divMod.div
  }

  mod (i) {
    const divMod = this.divAndMod(i)
    return divMod.mod
  }

  twosComplement () {
    return this.xor(UInt64.Max).add(new UInt64(0, 1))
  }

  topBitPosition () {
    let high = this.buffer.readUInt32BE()
    let low = this.buffer.readUInt32BE(4)
    if (high > 0) {
      let pos = 32
      while (pos > 1) {
	if (high & (1 << (pos - 1))) {
	  break
	}
	pos--
      }
      if (pos != 0) {
	return pos + 32
      }
    }
    if (low > 0) {
      let pos = 32
      while (pos > 1) {
	if (low & (1 << (pos - 1))) {
	  break
	}
	pos--
      }
      if (pos != 0) {
	return pos
      }
    }
    return 0
  }
}

export class Int64 extends Int64Base {
  constructor(first, second) {
    // new Int64(string)
    if (typeof first === 'string') {
      let negative = false
      let uintStr = first
      if (first.charAt(0) === '-') {
        negative = true
        uintStr = first.substring(1, first.length)
      }
      const radix = getRadix(uintStr)
      let noPrefixStr = uintStr
      if (radix !== 10) {
        noPrefixStr = uintStr.substring(2, uintStr.length)
      } else {
        if (uintStr.length > 19) {
          throw new Error(`Over 64bit signed integer range`)
        }
        const intValue = parseInt(first)
        try {
          if (!isNaN(intValue)) {
            super(intValue)
            return
          }
        } catch (e) {
        }

        let low = 0
        let high = 0
        let pos = 0
        while (pos < uintStr.length) {
          const i = parseInt(uintStr[pos++])
          if (isNaN(i)) {
            throw new Error(`Invalid string as integer`)
          }
          low = low * 10 + i
          high = high * 10 + Math.floor(low / 0x100000000)
          low %= 0x100000000
        }
        if (negative) {
          if (high > 0x80000000 || (high === 0x80000000 && low > 0)) {
            throw new Error(`Over 64bit signed integer range`)
          }
          high = ~high
          if (low) {
            low = 0x100000000 - low
          } else {
            high++
          }
        } else {
          if (high > 0x7fffffff) {
            throw new Error(`Over 64bit signed integer range`)
          }
        }
        super(int32PairToBuffer(high, low))
        return
      }

      let high, low
      switch (radix) {
        case 2: {
          if (noPrefixStr.length > 64) {
            throw new Error(`Over 64bit signed integer range`)
          }
          if (noPrefixStr.length <= 53) {
            if (negative) {
              noPrefixStr = `-${noPrefixStr}`
            }
            const i = parseInt(noPrefixStr, radix)
            if (isNaN(i)) {
              throw new Error(`Invalid string as integer`)
            }
            super(i)
            return
          }
          const length = noPrefixStr.length
          high = parseInt(noPrefixStr.substring(0, length - 32), radix)
          low = parseInt(noPrefixStr.substring(length - 32, length), radix)
          break
        }
        case 8:
          if (noPrefixStr.length > 22) {
            throw new Error(`Over 64bit signed integer range`)
          }
          if (noPrefixStr.length <= 17) {
            if (negative) {
              noPrefixStr = `-${noPrefixStr}`
            }
            const i = parseInt(noPrefixStr, radix)
            if (isNaN(i)) {
              throw new Error(`Invalid string as integer`)
            }
            super(i)
            return
          }
          const length = noPrefixStr.length
          let lhigh = parseInt(noPrefixStr.substring(0, length - 11), radix)
          let llow = parseInt(noPrefixStr.substring(length - 11, length), radix)
          low = llow % 0x100000000
          const carry = Math.floor(llow / 0x100000000)
          if (lhigh >= 0x80000000) {
            throw new Error(`Over 64bit signed integer range`)
          }
          high = (lhigh << 1) >>> 0
          high += carry
          break
        case 16: {
          if (noPrefixStr.length > 16) {
            throw new Error(`Over 64bit signed integer range`)
          }
          if (noPrefixStr.length <= 8) {
            if (negative) {
              uintStr = `-${uintStr}`
            }
            const i = parseInt(uintStr, radix)
            if (isNaN(i)) {
              throw new Error(`Invalid string as integer`)
            }
            super(i)
            return
          }
          const length = noPrefixStr.length
          high = parseInt(noPrefixStr.substring(0, length - 8), radix)
          low = parseInt(noPrefixStr.substring(length - 8, length), radix)
          break
        }
      }
      if ((!negative && high >= 0x80000000) ||
        (negative && ((high > 0x80000001) || (high == 0x80000000 && low > 0))))  {
        throw new Error(`Over 64bit signed integer range`)
      }
      if (negative) {
        if (high > 0x80000001 || (high === 0x80000000 && low > 0)) {
          throw new Error(`Over 64bit signed integer range`)
        }
        high = ~high
        if (low) {
          low = 0x100000000 - low
        } else {
          high++
        }
      } else {
        if (high >= 0x80000000) {
          throw new Error(`Over 64bit signed integer range`)
        }
      }
      super(int32PairToBuffer(high, low))
      return
    }
    super(first, second)
  }

  typename () {
    return 'Int64'
  }

  shiftRight (num, logical) {
    let buf = Buffer.alloc(8)
    let high = this.buffer.readInt32BE()
    let low = this.buffer.readInt32BE(4)
    num %= 64
    if (num >= 32) {
      let value
      if (logical) {
        value = high >>> (num - 32)
      } else {
        value = high >> (num - 32)
      }
      const int32Buf = int32ToBuffer(value)
      for (let i = 0; i < 4; i++) {
        buf[4 + i] = int32Buf[i]
      }
      if (!logical && (high & 0x80000000) !== 0) {
        for (let i = 0; i < 4; i++) {
          buf[i] = 0xff
        }
      }
    } else {
      let shifted_high
      if (logical) {
        shifted_high = high >>> num
      } else {
        shifted_high = high >> num
      }
      let shifted_low = ((high & shiftMaskLow(num)) << (32 - num)) + (low >>> num)
      buf = int32PairToBuffer(shifted_high, shifted_low)
    }
    return new Int64(buf)
  }

  compare (i) {
    if (i instanceof UInt64) {
      return this.toUnsigned().compare(i)
    }
    let high = this.buffer.readInt32BE()
    let low = this.buffer.readUInt32BE(4)
    let iHigh = i.toBuffer().readInt32BE()
    let iLow = i.toBuffer().readUInt32BE(4)
    if (high === iHigh) {
      if (low === iLow) {
        return 0
      }
      if (low > iLow) {
        return 1
      }
      return -1
    }
    if (high > iHigh) {
      return 1
    }
    return -1
  }

  divAndMod (i) {
    if (i instanceof Int64) {
      const compare = this.compare(i)
      if (compare === 0) {
        return {
          div: new this.constructor(0x1),
          mod: new this.constructor(0x0)
        }
      }
      if (!(this.isNegative() || i.isNegative())) {
        const divAndMod = uint64PositiveDivAndMod(this, i)
        return {
          div: divAndMod.div.toSigned(),
          mod: divAndMod.mod.toSigned()
        }
      }
      if (this.isNegative() && i.isNegative()) {
        const divAndMod = uint64PositiveDivAndMod(this.twosComplement(), i.twosComplement())
        return {
          div: divAndMod.div.toSigned(),
          mod: divAndMod.mod.toSigned().toNegative()
        }
      }
      if (i.isNegative()) {
        const divAndMod = uint64PositiveDivAndMod(this, i.twosComplement())
        return {
          div: divAndMod.div.toSigned().twosComplement(),
          mod: divAndMod.mod.toSigned()
        }
      }
      const divAndMod = uint64PositiveDivAndMod(this.twosComplement(), i)
      return {
        div: divAndMod.div.toSigned().twosComplement(),
        mod: divAndMod.mod.toSigned().twosComplement()
      }
    }
    return uint64PositiveDivAndMod(this, i)
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
      // low = 2 ** 32 - low  // over v8
      low = Math.pow(2, 32) - low  // for node v6
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
    str = pre + str
    if (negative) {
      str = '-' + str
    }
    return str
  }

  /**
   * Int64 only method
   */
  toUnsigned () {
    return new UInt64(this.toBuffer())
  }

  toNegative () {
    return this.xor(UInt64.Max).add(new Int64(0x0, 0x1))
  }

  isNegative () {
    const high = this.buffer.readUInt32BE()
    return (high & 0x80000000) !== 0
  }
}

Int64.Zero = new Int64(0, 0)
Int64.Max = new Int64(0x7fffffff, 0xffffffff)
Int64.Min = new Int64(0x80000000, 0)

export class UInt64 extends Int64Base {
  constructor(first, second) {
    if (typeof first === 'string') {
      let negative = false
      if (first.charAt(0) === '-') {
	throw new Error(`Cannot accept negative value`)
      }
      const radix = getRadix(first)
      let noPrefixStr = first
      if (radix !== 10) {
	noPrefixStr = first.substring(2, first.length)
      } else {
	if (noPrefixStr.length > 20) {
	  throw new Error(`Over 64bit unsigned integer range`)
	}
	const intValue = parseInt(noPrefixStr)
	try {
	  if (!isNaN(intValue)) {
	    super(intValue)
	    return
	  }
	} catch (e) {
	}

	let low = 0
	let high = 0
	let pos = 0
	while (pos < noPrefixStr.length) {
	  const i = parseInt(noPrefixStr[pos++])
	  if (isNaN(i)) {
	    throw new Error(`Invalid string as integer`)
	  }
	  low = low * 10 + i
	  high = high * 10 + Math.floor(low / 0x100000000)
	  low %= 0x100000000
	}
	if (high > 0xffffffff) {
	  throw new Error(`Over 64bit unsigned integer range`)
	}
	super(int32PairToBuffer(high, low))
	return
      }
      let high, low
      switch (radix) {
      case 2: {
        if (noPrefixStr.length > 64) {
          throw new Error(`Over 64bit unsigned integer range`)
        }
	if (noPrefixStr.length <= 53) {
          const i = parseInt(noPrefixStr, radix)
          if (isNaN(i)) {
            throw new Error(`Invalid string as integer`)
          }
          super(i)
	  return
	}
        const length = noPrefixStr.length
        high = parseInt(noPrefixStr.substring(0, length - 32), radix)
        low = parseInt(noPrefixStr.substring(length - 32, length), radix)
        break
      }
      case 8:
	break
      case 16: {
	const length = noPrefixStr.length
	if (length > 16) {
	  throw new Error(`Over 64bit unsigned integer range`)
	}
	if (length <= 8) {
	  const i = parseInt(noPrefixStr, radix)
	  if (isNaN(i)) {
	    throw new Error(`Invalid string as integer`)
	  }
	  super(i)
	  return
	}
	high = parseInt(noPrefixStr.substring(0, length -8), radix)
	low = parseInt(noPrefixStr.substring(length - 8, length), radix)
	break
      }
      }
      super(int32PairToBuffer(high, low))
      return
    }
    super(first, second)
  }
  
  typename () {
    return 'UInt64'
  }

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

  compare (i) {
    let high = this.buffer.readUInt32BE()
    let low = this.buffer.readUInt32BE(4)
    let iHigh = i.toBuffer().readUInt32BE()
    let iLow = i.toBuffer().readUInt32BE(4)
    if (high === iHigh) {
      if (low === iLow) {
        return 0
      }
      if (low > iLow) {
        return 1
      }
      return -1
    }
    if (high > iHigh) {
      return 1
    }
    return -1
  }

  divAndMod (i) {
    return uint64PositiveDivAndMod(this, i)
  }

  div (i) {
    return this.divAndMod(i).div
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

function getRadix(intString) {
  if (intString.length <= 2) {
    return 10
  }
  switch (intString.substring(0, 2)) {
    case '0b':
      return 2
    case '0o':
      return 8
    case '0x':
      return 16
    default:
      return 10
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

function intToBuffer(num) {
  if (!Number.isSafeInteger(num)) {
    throw new Error(`Unsafe integer`)
  }
  let high = 0, low = 0
  if (num >= 0) {
    high = num / 0x100000000
    low = num & 0xffffffff
  } else {
    if (-num <= 0xffffffff) {
      high = 0xffffffff
      low = num & 0xffffffff
    } else {
      high = 0xffffffff - (((-num) / 0x100000000) >>> 0)
      low = 0x100000000 - ((-num) & 0xffffffff)
    }
  }
  return int32PairToBuffer(high, low)
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

function uint64PositiveDivAndMod(dividend, divisor) {
  if (dividend instanceof Int64) {
    dividend = dividend.toUnsigned()
  }
  if (divisor instanceof Int64) {
    divisor = divisor.toUnsigned()
  }
  const compare = dividend.compare(divisor)
  if (compare === 0) {
    return {
      div: new UInt64(0x1),
      mod: UInt64.Zero
    }
  }
  if (compare === 1) {
    let div = UInt64.Zero
    let current = dividend
    const divisorTopBitPos = divisor.topBitPosition()
    while (true) {
      let topBitPos = current.topBitPosition()
      let shift = topBitPos - divisorTopBitPos
      if (shift < 0) {
        break
      }
      let shiftedi = divisor.shiftLeft(shift)
      if (current.compare(shiftedi) === 0) {
        div = div.add(new UInt64(1).shiftLeft(shift))
        current = UInt64.Zero
        break
      } else if (current.compare(shiftedi) === 1) {
        div = div.add(new UInt64(1).shiftLeft(shift))
        current = current.sub(shiftedi)
      } else if (shift > 0) {
        shift--
        shiftedi = divisor.shiftLeft(shift)
        div = div.add(new UInt64(1).shiftLeft(shift))
        current = current.sub(shiftedi)
      } else {
        break
      }
    }
    return {
      div: div,
      mod: current
    }
  }
  return {
    div: UInt64.Zero,
    mod: dividend
  }
}
