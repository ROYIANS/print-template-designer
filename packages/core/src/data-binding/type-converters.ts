import type { DataFieldType } from '../types/data-source'

function accurateFixed(number: unknown, n: number): string {
  const str = transInputToNumber(number, n)
  const parts = str.split('.')
  if (n > 0) {
    return (parts[0] ?? '0') + '.' + (parts[1] ?? '0').padEnd(n, '0')
  }
  return parts[0] ?? ''
}

function transInputToNumber(number: unknown, maxDigits: number): string {
  let result = ''
  const numStr = String(number)
  if (numStr.startsWith('-')) result = '-'
  const parts = numStr
    .split('')
    .filter((c) => /^[0-9.]$/.test(c))
    .join('')
    .split('.')
  if (parts[0] === '' && parts[1] !== undefined) parts[0] = '0'
  const intPart = parts[0] ? String(Number(parts[0])) : parts[0] ?? ''
  if (parts.length > 1) {
    const dec = maxDigits >= 0 ? (parts[1] ?? '').substring(0, maxDigits) : (parts[1] ?? '')
    return result + intPart + '.' + dec
  }
  return result + intPart
}

function parseMoneyValue(number: unknown, digits = 2): string {
  let result = ''
  const fixed = accurateFixed(number, digits)
  if (isNaN(Number(fixed))) {
    return accurateFixed('', digits)
  }
  if (String(number).startsWith('-')) result = '-'
  const localized = Number(fixed).toLocaleString('zh-Hans-CN', {
    style: 'decimal',
    minimumIntegerDigits: 1,
    minimumFractionDigits: 1,
    maximumFractionDigits: 20,
    minimumSignificantDigits: 1,
    maximumSignificantDigits: 21,
  })
  let parts = localized
    .split('')
    .filter((c) => /^[0-9.,]$/.test(c))
    .join('')
    .split('.')
  if (parts[0] === '') parts[0] = '0'
  if (digits === 0) {
    return result + (parts[0] ?? '') + (parts[1] ? '.' + parts[1] : '')
  }
  const decChars = [...(parts[1] ?? '').split(''), ...new Array(digits).fill('0')]
  decChars.length = digits
  return result + (parts[0] ?? '') + '.' + decChars.join('')
}

function numberIntToChinese(str: string): string {
  let prefix = ''
  if (Number(str) < 0) prefix = '负'
  const s = str + ''
  const len = s.length - 1
  const idxs = ['', '十', '百', '千', '万', '十', '百', '千', '亿', '十', '百', '千', '万', '十', '百', '千', '亿']
  const num = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  return (
    prefix +
    s.replace(/([1-9]|0+)/g, (_: string, $1: string, idx: number) => {
      if ($1[0] !== '0') {
        const pos = len - idx
        if (idx === 0 && $1[0] === '1' && idxs[len - idx] === '十') {
          return idxs[len - idx] ?? ''
        }
        return (num[Number($1[0])] ?? '') + (idxs[pos] ?? '')
      } else {
        const left = len - idx
        const right = len - idx + $1.length
        let pos = 0
        if (Math.floor(right / 4) - Math.floor(left / 4) > 0) {
          pos = left - (left % 4)
        }
        if (pos) {
          return (idxs[pos] ?? '') + (num[Number($1[0])] ?? '')
        } else if (idx + $1.length >= len) {
          return ''
        } else {
          return num[Number($1[0])] ?? ''
        }
      }
    })
  )
}

function parseBigCurDate(): string {
  const curDate = new Date()
  const bigNumber = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  const year = `${curDate.getFullYear()}`.replace(/\d/g, (n) => bigNumber[Number(n)] ?? n)
  const month = numberIntToChinese(`${curDate.getMonth() + 1}`)
  const day = numberIntToChinese(`${curDate.getDate()}`)
  return `${year}年${month}月${day}日`
}

function parseCurDateTime(format = 'YYYY-MM-DD hh:mm:ss:c'): string {
  const d = new Date()
  const tokens: Record<string, string | number> = {
    'Y+': d.getFullYear(),
    'M+': d.getMonth() + 1,
    'D+': d.getDate(),
    'h+': d.getHours(),
    'm+': d.getMinutes(),
    's+': d.getSeconds(),
    'Q+': Math.floor((d.getMonth() + 3) / 3),
    'c+': d.getMilliseconds(),
    W: ['一', '二', '三', '四', '五', '六', '日'][d.getDay() - 1] ?? '',
  }
  let result = format
  for (const k of Object.keys(tokens)) {
    const re = new RegExp('(' + k + ')')
    if (re.test(result)) {
      const val = String(tokens[k])
      result = result.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? val : ('00' + val).substring(val.length >= 2 ? 2 : val.length),
      )
    }
  }
  return result
}

function parseBigDigitValue(money: unknown, type: 'money' | 'number' = 'money', arrearsPrefix = '欠'): string {
  const cnNums = type === 'number'
    ? ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
    : ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const cnIntRadice = type === 'number' ? ['', '十', '百', '千'] : ['', '拾', '佰', '仟']
  const cnIntUnits = ['', '万', '亿', '万']
  const cnDecUnits = type === 'number' ? ['', '', '', ''] : ['角', '分', '毫', '厘']
  const cnInteger = type === 'number' ? '' : '整'
  const cnIntLast = type === 'number' ? '' : '元'
  const maxNum = 999999999999999.9999

  const raw = Number(money)
  let chineseStr = raw < 0 ? (type === 'number' ? '负' : arrearsPrefix) : ''

  const cleaned = String(money)
    .split('')
    .filter((c) => /^[0-9.]$/.test(c))
    .join('')

  if (cleaned === '') return ''
  const absVal = Math.abs(Number(cleaned))
  if (absVal >= maxNum) return ''
  if (absVal === 0) return chineseStr + cnNums[0] + cnIntLast + cnInteger

  const parts = cleaned.includes('.') ? cleaned.split('.') : [cleaned, '']
  const integerNum = parts[0] ?? ''
  const decimalNum = (parts[1] ?? '').substring(0, 4)

  if (parseInt(integerNum, 10) > 0) {
    let zeroCount = 0
    const intLen = integerNum.length
    for (let i = 0; i < intLen; i++) {
      const n = integerNum[i] ?? '0'
      const p = intLen - i - 1
      const m = p % 4
      const q = Math.floor(p / 4)
      if (n === '0') {
        zeroCount++
      } else {
        if (zeroCount > 0) chineseStr += cnNums[0]
        zeroCount = 0
        chineseStr += (cnNums[parseInt(n)] ?? '') + (cnIntRadice[m] ?? '')
      }
      if (m === 0 && zeroCount < 4) chineseStr += cnIntUnits[q] ?? ''
    }
    chineseStr += cnIntLast
  }

  if (decimalNum !== '') {
    if (type === 'number') chineseStr += '点'
    for (let i = 0; i < decimalNum.length; i++) {
      const n = decimalNum[i] ?? '0'
      if (n !== '0') chineseStr += (cnNums[Number(n)] ?? '') + (cnDecUnits[i] ?? '')
    }
  }

  if (chineseStr === '') {
    chineseStr += cnNums[0] + cnIntLast + cnInteger
  } else if (decimalNum === '') {
    chineseStr += cnInteger
  }
  return chineseStr
}

export function convertByType(value: unknown, typeName: DataFieldType): string {
  if (value === null || value === undefined) return ''
  switch (typeName) {
    case 'String':
      return String(value)
    case 'Array':
      return JSON.stringify(value)
    case 'Money':
      return parseMoneyValue(value)
    case 'BigMoney':
      return parseBigDigitValue(value, 'money')
    case 'BigNumber':
      return parseBigDigitValue(value, 'number')
    case 'CurDateTime':
      return parseCurDateTime(value as string | undefined)
    case 'BigCurDate':
      return parseBigCurDate()
    default:
      return String(value)
  }
}
