/*
 * @Author: ROYIANS
 * @Date: 2022/10/18 17:42
 * @Description:
 * @sign:
 * ╦═╗╔═╗╦ ╦╦╔═╗╔╗╔╔═╗
 * ╠╦╝║ ║╚╦╝║╠═╣║║║╚═╗
 * ╩╚═╚═╝ ╩ ╩╩ ╩╝╚╝╚═╝
 */
import { defaultImageSrc } from '@/components/config/bigData'
import QRCode from 'easyqrcodejs'

export const commonStyle = {
  rotate: 0,
  opacity: 1
}

export const commonAttr = {
  groupStyle: {}, // 当一个组件成为 Group 的子组件时使用
  isLock: false // 是否锁定组件
}

export const groupList = [
  {
    icon: '',
    code: 'common',
    name: '通用'
  },
  {
    icon: '',
    code: 'data',
    name: '数据'
  },
  {
    icon: '',
    code: 'shape',
    name: '形状'
  }
]

export const componentList = [
  {
    icon: 'ri-text',
    code: 'text',
    name: '文本',
    component: 'RoySimpleText',
    propValue: '单击编辑文本',
    group: 'common',
    style: {
      color: '#000000',
      borderRadius: 'inherit',
      padding: '0',
      margin: '0',
      fontFamily: 'default',
      lineHeight: '1',
      letterSpacing: '0',
      borderWidth: 0,
      borderColor: '#212121',
      borderType: 'none',
      width: 200,
      height: 50,
      fontSize: 10,
      background: null,
      rotate: 0,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      fontWeight: 'normal',
      fontStyle: 'normal',
      isUnderLine: false,
      isDelLine: false,
      elementPosition: 'default'
    },
    groupStyle: {},
    position: {}
  },
  {
    icon: 'ri-t-box-line',
    code: 'long-text',
    name: '长文本',
    component: 'RoyText',
    propValue:
      '<p><span style="font-size: 16pt;">双击</span><span style="color: rgb(255, 255, 255); background-color: #009688; font-size: 16pt; font-family: 仿宋;">编辑</span><span style="font-size: 16pt;">文本</span></p>',
    group: 'common',
    style: {
      width: 500,
      height: 200,
      fontSize: 12,
      background: null,
      rotate: 0,
      padding: '0',
      elementPosition: 'default',
      borderType: 'none',
      borderWidth: 0
    },
    groupStyle: {},
    position: {}
  },
  {
    icon: 'ri-table-2',
    code: 'table',
    name: '单元格',
    component: 'RoySimpleTable',
    propValue: {},
    group: 'data',
    style: {
      width: 'auto',
      height: 'auto',
      fontSize: 12,
      background: '#FFFFFF',
      borderWidth: 2,
      borderColor: '#212121',
      rotate: 0,
      elementPosition: 'default'
    },
    groupStyle: {},
    position: {}
  },
  {
    icon: 'ri-table-line',
    code: 'complex-table',
    name: '复杂表格',
    component: 'RoyComplexTable',
    propValue: {},
    showPrefix: true,
    showHead: true,
    showFoot: true,
    showSuffix: true,
    group: 'data',
    style: {
      width: 'auto',
      height: 'auto',
      fontSize: 12,
      fontFamily: 'default',
      color: '#000000',
      background: '#FFFFFF',
      borderWidth: 2,
      borderColor: '#212121',
      rotate: 0,
      elementPosition: 'default'
    },
    groupStyle: {},
    position: {}
  },
  {
    icon: 'ri-subtract-line',
    code: 'line',
    name: '直线',
    component: 'RoyLine',
    propValue: '',
    group: 'shape',
    style: {
      width: 200,
      height: 1,
      background: '#000',
      rotate: 0,
      elementPosition: 'default'
    },
    groupStyle: {},
    position: {}
  },
  {
    icon: 'ri-checkbox-blank-line',
    code: 'rectangle',
    name: '矩形',
    component: 'RoyRect',
    propValue: '',
    group: 'shape',
    style: {
      borderRadius: 'inherit',
      borderWidth: 1,
      borderColor: '#212121',
      borderType: 'solid',
      width: 200,
      height: 200,
      background: null,
      rotate: 0,
      elementPosition: 'default'
    },
    groupStyle: {},
    position: {}
  },
  {
    icon: 'ri-checkbox-blank-circle-line',
    code: 'circle',
    name: '圆形',
    component: 'RoyCircle',
    propValue: '',
    group: 'shape',
    style: {
      borderWidth: 1,
      borderColor: '#212121',
      borderType: 'solid',
      width: 200,
      height: 200,
      background: '#ffffff',
      rotate: 0,
      elementPosition: 'default'
    },
    groupStyle: {},
    position: {}
  },
  {
    icon: 'ri-star-line',
    code: 'star',
    name: '五角星',
    component: 'RoyStar',
    propValue: '',
    group: 'shape',
    style: {
      width: 200,
      height: 200,
      background: '#FF0000',
      icon: 'icon-shiwujiaoxing',
      rotate: 0,
      elementPosition: 'default'
    },
    groupStyle: {},
    position: {}
  },
  {
    icon: 'ri-image-2-line',
    code: 'image',
    name: '图片',
    component: 'RoyImage',
    src: defaultImageSrc,
    title: '默认图片',
    group: 'common',
    style: {
      borderRadius: 'inherit',
      borderWidth: 0,
      borderColor: '#212121',
      borderType: 'none',
      width: 200,
      height: 200,
      background: null,
      rotate: 0,
      elementPosition: 'default'
    },
    groupStyle: {},
    position: {}
  },
  {
    icon: 'ri-qr-code-line',
    code: 'qrcode',
    name: '二维码',
    component: 'RoyQRCode',
    propValue: '',
    group: 'common',
    text: 'Print Template Designer',
    isSyncWH: true,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H,
    style: {
      width: 100,
      height: 100,
      borderWidth: 0,
      borderColor: '#212121',
      borderType: 'solid',
      background: '#ffffff',
      rotate: 0,
      elementPosition: 'default'
    },
    groupStyle: {},
    position: {}
  },
  {
    icon: 'ri-barcode-line',
    code: 'barcode',
    name: '条形码',
    component: 'RoyBarCode',
    propValue: '',
    group: 'common',
    bcid: 'code128',
    text: '10101000101001',
    colorDark: '#000000',
    includeText: true,
    style: {
      width: 210,
      height: 70,
      borderWidth: 0,
      borderColor: '#212121',
      borderType: 'solid',
      background: '#ffffff',
      rotate: 0,
      elementPosition: 'default'
    },
    groupStyle: {},
    position: {}
  }
]
