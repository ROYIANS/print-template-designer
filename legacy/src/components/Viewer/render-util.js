/*
 * @Author: ROYIANS
 * @Date: 2022/11/25 16:40
 * @Description:
 * @sign:
 * ╦═╗╔═╗╦ ╦╦╔═╗╔╗╔╔═╗
 * ╠╦╝║ ║╚╦╝║╠═╣║║║╚═╗
 * ╩╚═╚═╝ ╩ ╩╩ ╩╝╚╝╚═╝
 */
export const RenderUtil = {
  wait: (time = 10) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  },
  replaceTextWithDataSource: (value, dataSet, dataSource) => {
    // FIXME: 这里的正则其实不太正确，虽然在上下文中，不会影响程序的运行，但是不是我最初想要的效果
    return `${value}`.replace(/\[::[^[\]:]*::]/g, (word) => {
      const field = word.substring(3, word.length - 3)
      if (dataSet[field] && dataSet[field] instanceof Function) {
        return dataSet[field]()
      }
      return RenderUtil.getDataConvertedByDataSource(dataSet[field], field, dataSource)
    })
  },
  getDataConvertedByDataSource(value, field, dataSource) {
    const curDataConfig = dataSource.find((item) => {
      return item.field === field
    })
    const { typeName } = curDataConfig
    return RenderUtil.getDataWithTypeConvertedByDataSource(value, typeName)
  },
  getDataWithTypeConvertedByDataSource(value, typeName) {
    if (value === null || value === undefined) {
      return ''
    }
    switch (typeName) {
      case 'String':
        return value
      case 'Array':
        return JSON.stringify(value)
      case 'Money':
        return RenderUtil.parseMoneyValue(value)
      case 'BigMoney':
        return RenderUtil.parseBigDigitValue(value)
      case 'BigNumber':
        return RenderUtil.parseBigDigitValue(value, 'number')
      case 'CurDateTime':
        return RenderUtil.parseCurDateTime(value)
      case 'BigCurDate':
        return RenderUtil.parseBigCurDate()
    }
  },
  parseBigCurDate() {
    const curDate = new Date()
    const bigNumber = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
    const year = `${curDate.getFullYear()}`.replace(/\d/g, (number) => {
      return bigNumber[Number(number)]
    })
    const month = RenderUtil.numberIntToChinese(`${curDate.getMonth() + 1}`)
    const day = RenderUtil.numberIntToChinese(`${curDate.getDate()}`)
    return `${year}年${month}月${day}日`
  },
  numberIntToChinese(str) {
    let prefix = ''
    if (Number(str) < 0) {
      prefix = '负'
    }
    str = str + ''
    let len = str.length - 1
    let idxs = [
      '',
      '十',
      '百',
      '千',
      '万',
      '十',
      '百',
      '千',
      '亿',
      '十',
      '百',
      '千',
      '万',
      '十',
      '百',
      '千',
      '亿'
    ]
    let num = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
    return (
      prefix +
      str.replace(/([1-9]|0+)/g, ($, $1, idx) => {
        let pos = 0
        if ($1[0] !== '0') {
          pos = len - idx
          if (idx === 0 && $1[0] === '1' && idxs[len - idx] === '十') {
            return idxs[len - idx]
          }
          return num[$1[0]] + idxs[len - idx]
        } else {
          let left = len - idx
          let right = len - idx + $1.length
          if (Math.floor(right / 4) - Math.floor(left / 4) > 0) {
            pos = left - (left % 4)
          }
          if (pos) {
            return idxs[pos] + num[$1[0]]
          } else if (idx + $1.length >= len) {
            return ''
          } else {
            return num[$1[0]]
          }
        }
      })
    )
  },
  parseCurDateTime(format = 'YYYY-MM-DD hh:mm:ss:c') {
    const curDate = new Date()
    let o = {
      'Y+': curDate.getFullYear() + '',
      'M+': curDate.getMonth() + 1, //month  MM
      'D+': curDate.getDate(), //day  DD
      'h+': curDate.getHours(), //hour  hh
      'm+': curDate.getMinutes(), //minute mm
      's+': curDate.getSeconds(), //second ss
      'Q+': Math.floor((curDate.getMonth() + 3) / 3), //quarter 季度 q
      'c+': curDate.getMilliseconds(), //millisecond 毫秒 c
      W: ['一', '二', '三', '四', '五', '六', '日'][curDate.getDay() - 1] //week 星期
    }
    for (let k in o) {
      if (new RegExp('(' + k + ')').test(format)) {
        format = format.replace(
          RegExp.$1,
          RegExp.$1.length === 1
            ? o[k]
            : ('00' + o[k]).substr(('' + o[k]).length >= 2 ? 2 : ('' + o[k]).length)
        )
      }
    }
    return format
  },
  parseMoneyValue(number, digits = 2) {
    // 返回逗号隔开千分位的数字
    let result = ''
    digits = parseInt(digits)
    // number = Number(number).toFixed(digits)
    number = RenderUtil.accurateFixed(number, digits)
    if (isNaN(number)) {
      number = RenderUtil.accurateFixed('', digits)
    }
    if (number.indexOf('-') === 0) {
      result = '-'
    }
    number = Number(number).toLocaleString('zh-Hans-CN', {
      style: 'decimal',
      minimumIntegerDigit: 1,
      minimumFractionDigits: 1,
      maximumFractionDigits: 20,
      minimumSignificantDigits: 1,
      maximumSignificantDigits: 21
    })
    let numberArr = number
      .split('')
      .filter((item) => {
        return new RegExp('^[0-9.,]$').test(item)
      })
      .join('')
      .split('.')
    if (numberArr[0] === '') {
      numberArr[0] = '0'
    }
    if (digits === 0) {
      numberArr = [numberArr[0], numberArr[1] ? '.' + numberArr[1] : '']
      return result + numberArr[0] + numberArr[1]
    } else {
      let numberArr1 = numberArr[1] ? numberArr[1].split('') : []
      numberArr1 = [...numberArr1, ...new Array(digits).fill('0')]
      numberArr1.length = digits
      numberArr = [numberArr[0], '.', ...numberArr1]
      return result + numberArr.join('')
    }
  },
  parseBigDigitValue(money, type = 'money', arrearsPrefix = '欠') {
    // 汉字的数字
    // digitUppercase(-111111111111111.1111, 'number') "负一百一十一万一千一百一十一亿一千一百一十一万一千一百一十一点一一"
    // digitUppercase(-111111111111111.1111) "欠壹佰壹拾壹万壹仟壹佰壹拾壹亿壹仟壹佰壹拾壹万壹仟壹佰壹拾壹元壹角壹分"
    let cnNums =
      type === 'number'
        ? ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
        : ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
    // 基本单位
    let cnIntRadice = type === 'number' ? ['', '十', '百', '千'] : ['', '拾', '佰', '仟']
    // 对应整数部分扩展单位
    let cnIntUnits = type === 'number' ? ['', '万', '亿', '万'] : ['', '万', '亿', '万']
    // 对应小数部分单位
    let cnDecUnits = type === 'number' ? ['', '', '', ''] : ['角', '分', '毫', '厘']
    // 整数金额时后面跟的字符
    let cnInteger = type === 'number' ? '' : '整'
    // 整型完以后的单位
    let cnIntLast = type === 'number' ? '' : '元'
    // 最大处理的数字
    let maxNum = 999999999999999.9999
    // 金额整数部分
    let integerNum
    // 金额小数部分
    let decimalNum
    // 输出的中文金额字符串
    // 分离金额后用的数组，预定义
    let parts
    let chineseStr = money < 0 ? (type === 'number' ? '负' : arrearsPrefix) : ''
    money = (money + '')
      .split('')
      .filter((item) => {
        return new RegExp('^[0-9.]$').test(item)
      })
      .join('')
    if (money === '') {
      return ''
    }
    money = Math.abs(money) + ''
    if (money >= maxNum) {
      // 超出最大处理数字
      return ''
    }
    if (money === 0) {
      chineseStr = chineseStr + (cnNums[0] + cnIntLast + cnInteger)
      return chineseStr
    }
    // 转换为字符串
    if (money.indexOf('.') === -1) {
      integerNum = money
      decimalNum = ''
    } else {
      parts = money.split('.')
      integerNum = parts[0]
      decimalNum = parts[1].substr(0, 4)
    }
    // 获取整型部分转换
    if (parseInt(integerNum, 10) > 0) {
      let zeroCount = 0
      let IntLen = integerNum.length
      for (let i = 0; i < IntLen; i++) {
        let n = integerNum.substr(i, 1)
        let p = IntLen - i - 1
        let q = p / 4
        let m = p % 4
        if (n === '0') {
          zeroCount++
        } else {
          if (zeroCount > 0) {
            chineseStr += cnNums[0]
          }
          // 归零
          zeroCount = 0
          chineseStr += cnNums[parseInt(n)] + cnIntRadice[m]
        }
        if (m === 0 && zeroCount < 4) {
          chineseStr += cnIntUnits[q]
        }
      }
      chineseStr += cnIntLast
    }
    // 小数部分
    if (decimalNum !== '') {
      chineseStr = chineseStr + (type === 'number' ? '点' : '')
      let decLen = decimalNum.length
      for (let i = 0; i < decLen; i++) {
        let n = decimalNum.substr(i, 1)
        if (n !== '0') {
          chineseStr += cnNums[Number(n)] + cnDecUnits[i]
        }
      }
    }
    if (chineseStr === '') {
      chineseStr += cnNums[0] + cnIntLast + cnInteger
    } else if (decimalNum === '') {
      chineseStr += cnInteger
    }
    return chineseStr
  },
  accurateFixed(number, n) {
    // 保留小数位数(截取)
    let numberArr = RenderUtil.transInputToNumber(number, n).split('.')
    if (n > 0) {
      //  return numberArr[0] + (numberArr[1] ? ('.' + numberArr[1].slice(0, n)) : '')
      return (
        (numberArr[0] ? numberArr[0] : 0) + '.' + (numberArr[1] ? numberArr[1] : '0').padEnd(n, 0)
      )
    } else {
      return numberArr[0] || ''
    }
  },
  transInputToNumber(number, maxDigits) {
    let result = ''
    number = String(number)
    if (number.indexOf('-') === 0) {
      result = '-'
    }
    let numberArr = number
      .split('')
      .filter((item) => {
        return new RegExp('^[0-9.]$').test(item)
      })
      .join('')
      .split('.')

    if (numberArr[0] === '' && numberArr[1] !== undefined) {
      numberArr[0] = '0'
    }
    numberArr[0] = numberArr[0] ? Number(numberArr[0]) : numberArr[0]
    if (numberArr.length > 1) {
      if (maxDigits >= 0) {
        numberArr[1] = numberArr[1].substr(0, maxDigits)
      }
      numberArr = [numberArr[0], '.', numberArr[1]]
    }
    return result + numberArr.join('')
  }
}
