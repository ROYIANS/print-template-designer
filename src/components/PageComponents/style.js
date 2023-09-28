/*
 * @Author: ROYIANS
 * @Date: 2022/10/18 9:12
 * @Description: css in js
 * @sign: 迷路，并无小路大路短路长路之区别。不能说在大路长路上迷路就不是迷路了。走在达不到目的的路上，就是迷路。
 * ╦═╗╔═╗╦ ╦╦╔═╗╔╗╔╔═╗
 * ╠╦╝║ ║╚╦╝║╠═╣║║║╚═╗
 * ╩╚═╚═╝ ╩ ╩╩ ╩╝╚╝╚═╝
 */
import styled from 'vue-styled-components'

const commonProps = {
  width: {
    type: [Number, String],
    default: 10
  },
  height: {
    type: [Number, String],
    default: 10
  },
  color: {
    type: String,
    default: '#212121'
  },
  background: {
    type: String,
    default: 'transparent'
  },
  border: {
    type: String,
    default: 'none'
  },
  borderRadius: {
    type: String,
    default: 'inherit'
  },
  padding: {
    type: String,
    default: '0'
  },
  margin: {
    type: String,
    default: '0'
  },
  fontSize: {
    type: [Number, String],
    default: 12
  },
  zIndex: {
    type: [Number, String],
    default: 1
  },
  fontFamily: {
    type: String,
    default: 'default'
  },
  lineHeight: {
    type: String,
    default: '1'
  },
  letterSpacing: {
    type: String,
    default: '0'
  },
  justifyContent: {
    type: String,
    default: 'flex-start'
  },
  alignItems: {
    type: String,
    default: 'flex-start'
  },
  borderWidth: {
    type: [Number, String],
    default: 0
  },
  borderColor: {
    type: String,
    default: '#212121'
  },
  borderType: {
    type: String,
    default: 'none'
  },
  fontWeight: {
    type: String,
    default: 'normal'
  },
  fontStyle: {
    type: String,
    default: 'normal'
  },
  isUnderLine: {
    type: Boolean,
    default: false
  },
  isDelLine: {
    type: Boolean,
    default: false
  }
}

const textProps = Object.assign({}, commonProps, {})

const imageProps = Object.assign({}, commonProps, {})

const lineProps = Object.assign({}, commonProps, {})

const starProps = Object.assign({}, commonProps, {})

const circleProps = Object.assign({}, commonProps, {})

const rectProps = Object.assign({}, commonProps, {
  borderWidth: {
    type: [Number, String],
    default: 1
  }
})

const simpleTableProps = Object.assign({}, commonProps, {
  isRelative: {
    type: Boolean,
    default: false
  }
})

const complexTableProps = Object.assign({}, commonProps, {})

export const StyledText = styled('div', textProps)`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  color: ${(props) => props.color};
  background: ${(props) => props.background};
  border-radius: ${(props) => props.borderRadius};
  margin: ${(props) => props.margin};
  z-index: ${(props) => props.zIndex};
  border: ${(props) => {
    const { borderWidth, borderType, borderColor } = props
    if (borderType === 'none') {
      return borderType
    } else {
      return `${borderWidth}px ${borderType} ${borderColor}`
    }
  }};

  .roy-text-inner {
    height: 100%;
    padding: ${(props) => `${props.padding}px`};
    line-height: ${(props) => props.lineHeight};
    letter-spacing: ${(props) => `${props.letterSpacing}px`};
    font-size: ${(props) => `${props.fontSize}pt`};
    font-family: ${(props) => (props.fontFamily === 'default' ? 'inherit' : `${props.fontFamily}`)};
  }
  table {
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 1px;
    background-color: #000000;
    padding: 1px;
  }

  td {
    position: relative;
    background-color: #fff;
    overflow: hidden;
  }

  p {
    margin-block-start: 0;
    margin-block-end: 0;
  }
`

export const StyledSimpleText = styled('div', textProps)`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
  color: ${(props) => props.color};
  background: ${(props) => props.background};
  border: ${(props) => props.border};
  border-radius: ${(props) => props.borderRadius};
  margin: ${(props) => props.margin};
  font-size: ${(props) => `${props.fontSize}pt`};
  font-family: ${(props) => (props.fontFamily === 'default' ? 'inherit' : `${props.fontFamily}`)};
  border: ${(props) => `${props.borderWidth}px ${props.borderType} ${props.borderColor}`};
  z-index: ${(props) => props.zIndex};
  .roy-simple-text-inner {
    height: 100%;
    display: flex;
    text-align: left;
    word-break: break-all;
    justify-content: ${(props) => props.justifyContent};
    align-items: ${(props) => props.alignItems};
    padding: ${(props) => `${props.padding}px`};
    line-height: ${(props) => props.lineHeight};
    letter-spacing: ${(props) => `${props.letterSpacing}px`};
    font-weight: ${(props) => `${props.fontWeight}`};
    font-style: ${(props) => `${props.fontStyle}`};
    text-decoration: ${(props) => {
      const { isUnderLine, isDelLine } = props
      const propsValue = {
        underline: isUnderLine,
        'line-through': isDelLine
      }
      if (isUnderLine || isDelLine) {
        return Object.keys(propsValue)
          .filter((item) => propsValue[item])
          .join(' ')
      } else {
        return 'none'
      }
    }};
  }
`

export const StyledRect = styled('div', rectProps)`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
  background: ${(props) => props.background};
  border-radius: ${(props) => props.borderRadius};
  z-index: ${(props) => props.zIndex};
  border: ${(props) => {
    const { borderWidth, borderType, borderColor } = props
    if (borderType === 'none') {
      return borderType
    } else {
      return `${borderWidth}px ${borderType} ${borderColor}`
    }
  }};
`

export const StyledImage = styled('div', imageProps)`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.background};
  padding: ${(props) => `${props.borderWidth}px`};
  img {
    height: 100%;
    border-radius: ${(props) =>
      isNaN(props.borderRadius) ? props.borderRadius : `${props.borderRadius}px`};
    z-index: ${(props) => props.zIndex};
    border: ${(props) => {
      const { borderWidth, borderType, borderColor } = props
      if (borderType === 'none') {
        return borderType
      } else {
        return `${borderWidth}px ${borderType} ${borderColor}`
      }
    }};
  }
`

export const StyledCircle = styled('div', circleProps)`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
  background: ${(props) => props.background};
  border-radius: 100%;
  z-index: ${(props) => props.zIndex};
  border: ${(props) => {
    const { borderWidth, borderType, borderColor } = props
    if (borderType === 'none') {
      return borderType
    } else {
      return `${borderWidth}px ${borderType} ${borderColor}`
    }
  }};
`

export const StyledLine = styled('div', lineProps)`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
  background: ${(props) => props.background};
  z-index: ${(props) => props.zIndex};
  border: none;
`

export const StyledStar = styled('div', starProps)`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
  border: none;
  padding: 0;
  margin: 0;
  color: ${(props) => props.background};
  .roy-star-icon {
    font-size: ${(props) => `${props.height}px!important`};
    line-height: ${(props) => `${props.height}px!important`};
  }
`

export const StyledSimpleTable = styled('div', simpleTableProps)`
  width: 100%;
  height: auto;
  position: relative;
  //position: ${(props) => (props.isRelative ? 'relative' : 'absolute')};
  border: none;
  padding: 0;
  margin: 0;
  color: ${(props) => props.color};
  background: ${(props) => props.background};

  table {
    width: 100%;
    //table-layout: fixed;
    border-collapse: separate;
    border-spacing: ${(props) => `${props.borderWidth}px`};
    background-color: ${(props) => `${props.borderColor}`};
  }

  td {
    position: relative;
    padding: 2px;
    background-color: ${(props) => `${props.background || '#FFF'}`};
  }

  .roy-simple-table-cell--selected {
    background: #d4e7f5;
  }

  .roy-simple-table__cell__corner {
    width: 6px;
    height: 6px;
    background: var(--roy-color-primary);
    right: 0;
    bottom: 0;
    opacity: 0.9;
    cursor: nw-resize !important;
    position: absolute;
    border: 1px solid var(--roy-color-primary);
    box-shadow: 0 0 2px #bbb;
    background: #fff;
    border-radius: 0;
    z-index: 9;
  }

  .roy-simple-table__cell__corner__bind {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 9;
    cursor: pointer;
    border-radius: 2px;
    padding: 2px;
    font-size: 10px;
    background: #ffffff;
    color: #999;
  }
`

export const StyledComplexTable = styled('div', complexTableProps)`
  //position: absolute;
  position: relative;
  border: none;
  padding: 0;
  margin: 0;
  color: ${(props) => props.color};
  background: ${(props) => props.background};
  font-size: ${(props) => `${props.fontSize}pt`};
  font-family: ${(props) => (props.fontFamily === 'default' ? 'inherit' : `${props.fontFamily}`)};

  table {
    width: 100%;
  }

  th {
    text-align: center;
    font-weight: bold;
    padding: 0;
    word-break: break-all;
  }

  td {
    padding: 0;
    word-break: break-all;
    position: relative;
  }

  .roy-complex-table-cell-in {
    height: 100%;
    width: 100%;
    //position: absolute;
    //left: 0;
    //right: 0;
    //top: 0;
    //bottom: 0;
    align-items: center;
    display: flex;
  }

  .rendered-roy-complex-table__footer {
    margin-top: ${(props) => `-${props.borderWidth - 0.5}px`};
  }

  .roy-complex-table__body table,
  .rendered-roy-complex-table__body {
    //table-layout: fixed;
    border-collapse: separate;
    border-spacing: ${(props) => `${props.borderWidth}px`};
    background-color: ${(props) => `${props.borderColor}`};
  }
  .roy-complex-table__body td,
  .roy-complex-table__body th,
  .rendered-roy-complex-table__body td,
  .rendered-roy-complex-table__body th {
    position: relative;
    background-color: ${(props) => `${props.background || '#FFF'}`};
  }
  .roy-complex-table__prefix,
  .roy-complex-table__suffix,
  .rendered-roy-text {
    overflow: hidden;
  }

  .roy-complex-table__container,
  .rendered-roy-complex-table {
    border-spacing: 0;
    border-collapse: separate;
  }

  .roy-complex-table__container > tr > td {
    padding: 0;
    margin: 0;
  }

  .roy-complex-table__auto_fill {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #ccc;
    background-color: rgb(246, 246, 246);
    background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.1) 3%, transparent 1px),
      linear-gradient(1turn, rgba(0, 0, 0, 0.1) 3%, transparent 1px);
    background-size: 10px 10px;
    background-position: 50%;
    background-repeat: repeat;
  }
`
