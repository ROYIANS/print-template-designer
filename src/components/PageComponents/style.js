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
    default: '0 0 0 0'
  },
  margin: {
    type: String,
    default: '0 0 0 0'
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
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  color: ${(props) => props.color};
  background: ${(props) => props.background};
  border-radius: ${(props) => props.borderRadius};
  padding: ${(props) => props.padding};
  margin: ${(props) => props.margin};
  font-size: ${(props) => `${props.fontSize}pt`};
  font-family: ${(props) =>
    props.fontFamily === 'default' ? 'inherit' : `${props.fontFamily}`};
  z-index: ${(props) => props.zIndex};
  line-height: ${(props) => props.lineHeight};
  letter-spacing: ${(props) => `${props.letterSpacing}px`};
  border: ${(props) => {
    const { borderWidth, borderType, borderColor } = props
    if (borderType === 'none') {
      return borderType
    } else {
      return `${borderWidth}px ${borderType} ${borderColor}`
    }
  }};
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
  }
`

export const StyledSimpleText = styled('div', textProps)`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
  display: flex;
  text-align: center;
  justify-content: ${(props) => props.justifyContent};
  align-items: ${(props) => props.alignItems};
  color: ${(props) => props.color};
  background: ${(props) => props.background};
  border: ${(props) => props.border};
  border-radius: ${(props) => props.borderRadius};
  padding: ${(props) => props.padding};
  margin: ${(props) => props.margin};
  font-size: ${(props) => `${props.fontSize}pt`};
  font-family: ${(props) =>
    props.fontFamily === 'default' ? 'inherit' : `${props.fontFamily}`};
  z-index: ${(props) => props.zIndex};
  line-height: ${(props) => props.lineHeight};
  letter-spacing: ${(props) => `${props.letterSpacing}px`};
  border: ${(props) =>
    `${props.borderWidth}px ${props.borderType} ${props.borderColor}`};
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
`

export const StyledRect = styled('div', rectProps)`
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

export const StyledCircle = styled('div', circleProps)`
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
  height: 100%;
  position: ${(props) => (props.isRelative ? 'relative' : 'absolute')};
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
    width: 8px;
    height: 8px;
    background: var(--roy-color-primary);
    box-shadow: rgba(99, 99, 99, 0.2) 0 2px 8px 0;
    position: absolute;
    right: 0;
    bottom: 0;
    opacity: 0.5;
    cursor: nw-resize !important;
    z-index: 1;
  }
`

export const StyledComplexTable = styled('div', complexTableProps)`
  position: absolute;
  border: none;
  padding: 0;
  margin: 0;
  color: ${(props) => props.color};
  background: ${(props) => props.background};
  font-size: ${(props) => `${props.fontSize}pt`};
  font-family: ${(props) =>
    props.fontFamily === 'default' ? 'inherit' : `${props.fontFamily}`};

  table {
    width: 100%;
  }

  th {
    text-align: center;
    font-weight: bold;
    padding: 2px;
  }

  td {
    padding: 3px;
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
    background-image: linear-gradient(
        90deg,
        rgba(0, 0, 0, 0.1) 3%,
        transparent 1px
      ),
      linear-gradient(1turn, rgba(0, 0, 0, 0.1) 3%, transparent 1px);
    background-size: 10px 10px;
    background-position: 50%;
    background-repeat: repeat;
  }
`
