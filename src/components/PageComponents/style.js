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

const defaultProps = {
  color: {
    type: String,
    default: '#212121'
  },
  background: {
    type: String,
    default: '#FFFFFF'
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
    type: Number,
    default: 12
  },
  zIndex: {
    type: Number,
    default: 1
  }
}

const textProps = Object.assign(defaultProps, {})

export const StyledText = styled('div', textProps)`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
  color: ${(props) => props.color};
  background: ${(props) => props.background};
  border: ${(props) => props.border};
  border-radius: ${(props) => props.borderRadius};
  padding: ${(props) => props.padding};
  margin: ${(props) => props.margin};
  font-size: ${(props) => `${props.fontSize}pt`};
  z-index: ${(props) => props.zIndex};
`
