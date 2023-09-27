import { deepCopy } from '@/utils/html-util'
import { VXETable } from 'vxe-table'
import toast from '@/utils/toast'
import store from '@/stores/index'

export const paletteConfigList = {
  RoyText: [
    {
      title: '宽度',
      field: 'width',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0
        }
      }
    },
    {
      title: '高度',
      field: 'height',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0
        }
      }
    },
    {
      title: '背景颜色',
      field: 'background',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '边框类型',
      field: 'borderType',
      span: 24,
      itemRender: {
        name: '$select',
        options: [
          {
            label: '无',
            value: 'none'
          },
          {
            label: '实线',
            value: 'solid'
          },
          {
            label: '线虚线',
            value: 'dashed'
          },
          {
            label: '点虚线',
            value: 'dotted'
          }
        ]
      }
    },
    {
      title: '边框颜色',
      field: 'borderColor',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '边框宽度',
      field: 'borderWidth',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0,
          max: 4
        }
      }
    },
    {
      title: '旋转角度（°）',
      field: 'rotate',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0,
          max: 360
        }
      }
    }
    // {
    //   title: '元素位置',
    //   field: 'elementPosition',
    //   span: 24,
    //   itemRender: {
    //     name: '$radio',
    //     options: [
    //       {
    //         label: '是',
    //         value: true
    //       },
    //       {
    //         label: '否',
    //         value: false
    //       }
    //     ]
    //   }
    // }
  ],
  RoySimpleText: [
    {
      title: '宽度',
      field: 'width',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0
        }
      }
    },
    {
      title: '高度',
      field: 'height',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0
        }
      }
    },
    {
      title: '字体',
      field: 'fontFamily',
      span: 24,
      itemRender: {
        name: '$select',
        options: [
          {
            label: '默认',
            value: 'default'
          },
          {
            label: '宋体',
            value: 'simsun'
          },
          {
            label: '黑体',
            value: 'simhei'
          },
          {
            label: '楷体',
            value: 'kaiti'
          },
          {
            label: '仿宋',
            value: 'fangsong'
          },
          {
            label: '微软雅黑',
            value: 'microsoft yahei'
          }
        ]
      }
    },
    {
      title: '字体颜色',
      field: 'color',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '字体大小（pt）',
      field: 'fontSize',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 10,
          max: 120
        }
      }
    },
    {
      title: '行高',
      field: 'lineHeight',
      span: 24,
      itemRender: {
        name: '$select',
        options: [
          {
            value: '1',
            label: '1'
          },
          {
            value: '1.5',
            label: '1.5'
          },
          {
            value: '2',
            label: '2'
          },
          {
            value: '2.5',
            label: '2.5'
          },
          {
            value: '3',
            label: '3'
          }
        ]
      }
    },
    {
      title: '排列',
      span: 24,
      itemRender: {
        name: '$btnRadioGroup',
        options: [
          {
            field: 'justifyContent',
            options: [
              {
                type: 'icon',
                content: 'ri-align-left',
                value: 'flex-start',
                label: '水平居左'
              },
              {
                type: 'icon',
                content: 'ri-align-center',
                value: 'center',
                label: '水平居中'
              },
              {
                type: 'icon',
                content: 'ri-align-right',
                value: 'flex-end',
                label: '水平居下'
              }
            ]
          },
          {
            field: 'alignItems',
            options: [
              {
                type: 'icon',
                content: 'ri-align-left rotate-90',
                value: 'flex-start',
                label: '垂直居左'
              },
              {
                type: 'icon',
                content: 'ri-align-center rotate-90',
                value: 'center',
                label: '垂直居中'
              },
              {
                type: 'icon',
                content: 'ri-align-right rotate-90',
                value: 'flex-end',
                label: '垂直居下'
              }
            ]
          }
        ]
      }
    },
    {
      title: '文字样式',
      span: 24,
      itemRender: {
        name: '$btnRadioGroup',
        options: [
          {
            field: 'fontWeight',
            isRadio: false,
            options: [
              {
                type: 'icon',
                content: 'ri-bold',
                value: 'bold',
                label: '粗体'
              }
            ]
          },
          {
            field: 'fontStyle',
            isRadio: false,
            options: [
              {
                type: 'icon',
                content: 'ri-italic',
                value: 'italic',
                label: '斜体'
              }
            ]
          },
          {
            field: 'isUnderLine',
            isRadio: false,
            options: [
              {
                type: 'icon',
                content: 'ri-underline',
                value: true,
                label: '下划线'
              }
            ]
          },
          {
            field: 'isDelLine',
            isRadio: false,
            options: [
              {
                type: 'icon',
                content: 'ri-strikethrough',
                value: true,
                label: '删除线'
              }
            ]
          }
        ]
      }
    },
    {
      title: '背景颜色',
      field: 'background',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '边框类型',
      field: 'borderType',
      span: 24,
      itemRender: {
        name: '$select',
        options: [
          {
            label: '无',
            value: 'none'
          },
          {
            label: '实线',
            value: 'solid'
          },
          {
            label: '线虚线',
            value: 'dashed'
          },
          {
            label: '点虚线',
            value: 'dotted'
          }
        ]
      }
    },
    {
      title: '边框颜色',
      field: 'borderColor',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '边框宽度',
      field: 'borderWidth',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0,
          max: 4
        }
      }
    },
    {
      title: '旋转角度（°）',
      field: 'rotate',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0,
          max: 360
        }
      }
    },
    {
      title: '元素位置',
      field: 'elementPosition',
      span: 24,
      itemRender: {
        name: '$radio',
        options: [
          {
            label: '跟随全局配置（默认）',
            value: 'default'
          },
          {
            label: '固定位置',
            value: 'fixed'
          },
          {
            label: '重复位置',
            value: 'repeated'
          }
        ]
      }
    }
  ],
  RoyRect: [
    {
      title: '宽度',
      field: 'width',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0
        }
      }
    },
    {
      title: '高度',
      field: 'height',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0
        }
      }
    },
    {
      title: '背景颜色',
      field: 'background',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '边框类型',
      field: 'borderType',
      span: 24,
      itemRender: {
        name: '$select',
        options: [
          {
            label: '无',
            value: 'none'
          },
          {
            label: '实线',
            value: 'solid'
          },
          {
            label: '线虚线',
            value: 'dashed'
          },
          {
            label: '点虚线',
            value: 'dotted'
          }
        ]
      }
    },
    {
      title: '边框颜色',
      field: 'borderColor',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '边框宽度',
      field: 'borderWidth',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0,
          max: 4
        }
      }
    },
    {
      title: '旋转角度（°）',
      field: 'rotate',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0,
          max: 360
        }
      }
    },
    {
      title: '元素位置',
      field: 'elementPosition',
      span: 24,
      itemRender: {
        name: '$radio',
        options: [
          {
            label: '跟随全局配置（默认）',
            value: 'default'
          },
          {
            label: '固定位置',
            value: 'fixed'
          },
          {
            label: '重复位置',
            value: 'repeated'
          }
        ]
      }
    }
  ],
  RoyCircle: [
    {
      title: '宽度',
      field: 'width',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0
        }
      }
    },
    {
      title: '高度',
      field: 'height',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0
        }
      }
    },
    {
      title: '背景颜色',
      field: 'background',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '边框类型',
      field: 'borderType',
      span: 24,
      itemRender: {
        name: '$select',
        options: [
          {
            label: '无',
            value: 'none'
          },
          {
            label: '实线',
            value: 'solid'
          },
          {
            label: '线虚线',
            value: 'dashed'
          },
          {
            label: '点虚线',
            value: 'dotted'
          }
        ]
      }
    },
    {
      title: '边框颜色',
      field: 'borderColor',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '边框宽度',
      field: 'borderWidth',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0,
          max: 4
        }
      }
    },
    {
      title: '旋转角度（°）',
      field: 'rotate',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0,
          max: 360
        }
      }
    },
    {
      title: '元素位置',
      field: 'elementPosition',
      span: 24,
      itemRender: {
        name: '$radio',
        options: [
          {
            label: '跟随全局配置（默认）',
            value: 'default'
          },
          {
            label: '固定位置',
            value: 'fixed'
          },
          {
            label: '重复位置',
            value: 'repeated'
          }
        ]
      }
    }
  ],
  RoyLine: [
    {
      title: '宽度',
      field: 'width',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0
        }
      }
    },
    {
      title: '粗细',
      field: 'height',
      span: 24,
      itemRender: {
        name: '$select',
        options: [
          {
            label: '极细',
            value: 0.5
          },
          {
            label: '细',
            value: 1
          },
          {
            label: '正常',
            value: 1.5
          },
          {
            label: '粗',
            value: 2
          },
          {
            label: '极粗',
            value: 4
          },
          {
            label: '粗粗粗',
            value: 6
          }
        ]
      }
    },
    {
      title: '颜色',
      field: 'background',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '旋转角度（°）',
      field: 'rotate',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0,
          max: 360
        }
      }
    },
    {
      title: '元素位置',
      field: 'elementPosition',
      span: 24,
      itemRender: {
        name: '$radio',
        options: [
          {
            label: '跟随全局配置（默认）',
            value: 'default'
          },
          {
            label: '固定位置',
            value: 'fixed'
          },
          {
            label: '重复位置',
            value: 'repeated'
          }
        ]
      }
    }
  ],
  RoyStar: [
    {
      title: '大小',
      field: 'height',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0
        }
      }
    },
    {
      title: '颜色',
      field: 'background',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '样式',
      field: 'icon',
      span: 24,
      itemRender: {
        name: '$select',
        options: [
          {
            label: '实心五角星',
            value: 'icon-shiwujiaoxing'
          },
          {
            label: '空心五角星',
            value: 'icon-kongwujiaoxing'
          },
          {
            label: '圆润五角星',
            value: 'icon-shoucang'
          },
          {
            label: '双线五角星',
            value: 'icon-wujiaoxing'
          }
        ]
      }
    },
    {
      title: '旋转角度（°）',
      field: 'rotate',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0,
          max: 360
        }
      }
    },
    {
      title: '元素位置',
      field: 'elementPosition',
      span: 24,
      itemRender: {
        name: '$radio',
        options: [
          {
            label: '跟随全局配置（默认）',
            value: 'default'
          },
          {
            label: '固定位置',
            value: 'fixed'
          },
          {
            label: '重复位置',
            value: 'repeated'
          }
        ]
      }
    }
  ],
  RoySimpleTable: [
    {
      title: '背景颜色',
      field: 'background',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '边框颜色',
      field: 'borderColor',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '边框宽度',
      field: 'borderWidth',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0,
          max: 4
        }
      }
    }
    // {
    //   title: '元素位置',
    //   field: 'elementPosition',
    //   span: 24,
    //   itemRender: {
    //     name: '$radio',
    //     options: [
    //       {
    //         label: '是',
    //         value: true
    //       },
    //       {
    //         label: '否',
    //         value: false
    //       }
    //     ]
    //   }
    // }
  ],
  RoyComplexTable: [
    {
      title: '背景颜色',
      field: 'background',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '边框颜色',
      field: 'borderColor',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '边框宽度',
      field: 'borderWidth',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0,
          max: 4
        }
      }
    },
    {
      title: '字体',
      field: 'fontFamily',
      span: 24,
      itemRender: {
        name: '$select',
        options: [
          {
            label: '默认',
            value: 'default'
          },
          {
            label: '宋体',
            value: 'simsun'
          },
          {
            label: '黑体',
            value: 'simhei'
          },
          {
            label: '楷体',
            value: 'kaiti'
          },
          {
            label: '仿宋',
            value: 'fangsong'
          },
          {
            label: '微软雅黑',
            value: 'microsoft yahei'
          }
        ]
      }
    },
    {
      title: '字体颜色',
      field: 'color',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '字体大小（pt）',
      field: 'fontSize',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 10,
          max: 120
        }
      }
    }
    // {
    //   title: '元素位置',
    //   field: 'elementPosition',
    //   span: 24,
    //   itemRender: {
    //     name: '$radio',
    //     options: [
    //       {
    //         label: '是',
    //         value: true
    //       },
    //       {
    //         label: '否',
    //         value: false
    //       }
    //     ]
    //   }
    // }
  ],
  RoyTextIn: [
    {
      title: '背景颜色',
      field: 'background',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '边距',
      field: 'padding',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0,
          max: 20
        }
      }
    }
  ],
  RoySimpleTextIn: [
    {
      title: '字体',
      field: 'fontFamily',
      span: 24,
      itemRender: {
        name: '$select',
        options: [
          {
            label: '默认',
            value: 'default'
          },
          {
            label: '宋体',
            value: 'simsun'
          },
          {
            label: '黑体',
            value: 'simhei'
          },
          {
            label: '楷体',
            value: 'kaiti'
          },
          {
            label: '仿宋',
            value: 'fangsong'
          },
          {
            label: '微软雅黑',
            value: 'microsoft yahei'
          }
        ]
      }
    },
    {
      title: '字体颜色',
      field: 'color',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '字体大小（pt）',
      field: 'fontSize',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 10,
          max: 120
        }
      }
    },
    {
      title: '行高',
      field: 'lineHeight',
      span: 24,
      itemRender: {
        name: '$select',
        options: [
          {
            value: '1',
            label: '1'
          },
          {
            value: '1.5',
            label: '1.5'
          },
          {
            value: '2',
            label: '2'
          },
          {
            value: '2.5',
            label: '2.5'
          },
          {
            value: '3',
            label: '3'
          }
        ]
      }
    },
    {
      title: '排列',
      span: 24,
      itemRender: {
        name: '$btnRadioGroup',
        options: [
          {
            field: 'justifyContent',
            options: [
              {
                type: 'icon',
                content: 'ri-align-left',
                value: 'flex-start',
                label: '水平居左'
              },
              {
                type: 'icon',
                content: 'ri-align-center',
                value: 'center',
                label: '水平居中'
              },
              {
                type: 'icon',
                content: 'ri-align-right',
                value: 'flex-end',
                label: '水平居下'
              }
            ]
          },
          {
            field: 'alignItems',
            options: [
              {
                type: 'icon',
                content: 'ri-align-left rotate-90',
                value: 'flex-start',
                label: '垂直居左'
              },
              {
                type: 'icon',
                content: 'ri-align-center rotate-90',
                value: 'center',
                label: '垂直居中'
              },
              {
                type: 'icon',
                content: 'ri-align-right rotate-90',
                value: 'flex-end',
                label: '垂直居下'
              }
            ]
          }
        ]
      }
    },
    {
      title: '文字样式',
      span: 24,
      itemRender: {
        name: '$btnRadioGroup',
        options: [
          {
            field: 'fontWeight',
            isRadio: false,
            options: [
              {
                type: 'icon',
                content: 'ri-bold',
                value: 'bold',
                label: '粗体'
              }
            ]
          },
          {
            field: 'fontStyle',
            isRadio: false,
            options: [
              {
                type: 'icon',
                content: 'ri-italic',
                value: 'italic',
                label: '斜体'
              }
            ]
          },
          {
            field: 'isUnderLine',
            isRadio: false,
            options: [
              {
                type: 'icon',
                content: 'ri-underline',
                value: true,
                label: '下划线'
              }
            ]
          },
          {
            field: 'isDelLine',
            isRadio: false,
            options: [
              {
                type: 'icon',
                content: 'ri-strikethrough',
                value: true,
                label: '删除线'
              }
            ]
          }
        ]
      }
    },
    {
      title: '背景颜色',
      field: 'background',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '边距',
      field: 'padding',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0,
          max: 20
        }
      }
    }
  ],
  RoyImage: [
    {
      title: '圆角',
      field: 'borderRadius',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0,
          max: 10000
        }
      }
    },
    {
      title: '边框类型',
      field: 'borderType',
      span: 24,
      itemRender: {
        name: '$select',
        options: [
          {
            label: '无',
            value: 'none'
          },
          {
            label: '实线',
            value: 'solid'
          },
          {
            label: '线虚线',
            value: 'dashed'
          },
          {
            label: '点虚线',
            value: 'dotted'
          }
        ]
      }
    },
    {
      title: '边框颜色',
      field: 'borderColor',
      span: 24,
      itemRender: {
        name: '$colorPicker',
        props: {}
      }
    },
    {
      title: '边框宽度',
      field: 'borderWidth',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0,
          max: 4
        }
      }
    },
    {
      title: '旋转角度（°）',
      field: 'rotate',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0,
          max: 360
        }
      }
    },
    {
      title: '元素位置',
      field: 'elementPosition',
      span: 24,
      itemRender: {
        name: '$radio',
        options: [
          {
            label: '跟随全局配置（默认）',
            value: 'default'
          },
          {
            label: '固定位置',
            value: 'fixed'
          },
          {
            label: '重复位置',
            value: 'repeated'
          }
        ]
      }
    }
  ]
}

export const settingConfigList = {
  RoySimpleTextIn: [
    {
      title: '宽度',
      field: 'width',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0
        }
      }
    },
    {
      title: '高度',
      field: 'height',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0
        }
      }
    },
    {
      title: '文本类型',
      span: 24,
      itemRender: {
        name: '$btnRadioGroup',
        options: [
          {
            field: 'component',
            isRadio: false,
            customCallBack: ({ data }, field, { value }) => {
              if (data[field] !== value) {
                switch (value) {
                  case 'RoyTextIn':
                    data.simpleTextStyle = deepCopy(data.style)
                    data.style = deepCopy(data.textStyle)
                    break
                  case 'RoySimpleTextIn':
                    data.textStyle = deepCopy(data.style)
                    data.style = deepCopy(data.simpleTextStyle)
                    data.propValue = data.propValue.replace(/<.*?>/g, '')
                    break
                }
                data[field] = value
              }
            },
            options: [
              {
                type: 'icon',
                content: 'ri-text',
                value: 'RoySimpleTextIn',
                label: '普通文本'
              },
              {
                type: 'icon',
                content: 'ri-t-box-line',
                value: 'RoyTextIn',
                label: '富文本'
              }
            ]
          }
        ]
      }
    }
  ],
  RoyTextIn: [
    {
      title: '宽度',
      field: 'width',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0
        }
      }
    },
    {
      title: '高度',
      field: 'height',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'number',
          size: 'mini',
          min: 0
        }
      }
    },
    {
      title: '文本类型',
      span: 24,
      itemRender: {
        name: '$btnRadioGroup',
        options: [
          {
            field: 'component',
            isRadio: false,
            customCallBack: ({ data }, field, { value }) => {
              if (data[field] !== value) {
                switch (value) {
                  case 'RoyTextIn':
                    data.simpleTextStyle = deepCopy(data.style)
                    data.style = deepCopy(data.textStyle)
                    break
                  case 'RoySimpleTextIn':
                    data.textStyle = deepCopy(data.style)
                    data.style = deepCopy(data.simpleTextStyle)
                    data.propValue = data.propValue.replace(/<.*?>/g, '')
                    break
                }
                data[field] = value
              }
            },
            options: [
              {
                type: 'icon',
                content: 'ri-text',
                value: 'RoySimpleTextIn',
                label: '普通文本'
              },
              {
                type: 'icon',
                content: 'ri-t-box-line',
                value: 'RoyTextIn',
                label: '富文本'
              }
            ]
          }
        ]
      }
    }
  ],
  RoyComplexTable: [
    {
      title: '展示头部留白',
      span: 24,
      itemRender: {
        name: '$btnRadioGroup',
        options: [
          {
            field: 'showPrefix',
            isRadio: false,
            options: [
              {
                type: 'icon',
                content: 'ri-check-line',
                value: true,
                label: '是'
              },
              {
                type: 'icon',
                content: 'ri-close-line',
                value: false,
                label: '否'
              }
            ]
          }
        ]
      }
    },
    {
      title: '展示头部单元格',
      span: 24,
      itemRender: {
        name: '$btnRadioGroup',
        options: [
          {
            field: 'showHead',
            isRadio: false,
            options: [
              {
                type: 'icon',
                content: 'ri-check-line',
                value: true,
                label: '是'
              },
              {
                type: 'icon',
                content: 'ri-close-line',
                value: false,
                label: '否'
              }
            ]
          }
        ]
      }
    },
    {
      title: '展示尾部单元格',
      span: 24,
      itemRender: {
        name: '$btnRadioGroup',
        options: [
          {
            field: 'showFoot',
            isRadio: false,
            options: [
              {
                type: 'icon',
                content: 'ri-check-line',
                value: true,
                label: '是'
              },
              {
                type: 'icon',
                content: 'ri-close-line',
                value: false,
                label: '否'
              }
            ]
          }
        ]
      }
    },
    {
      title: '展示尾部留白',
      span: 24,
      itemRender: {
        name: '$btnRadioGroup',
        options: [
          {
            field: 'showSuffix',
            isRadio: false,
            options: [
              {
                type: 'icon',
                content: 'ri-check-line',
                value: true,
                label: '是'
              },
              {
                type: 'icon',
                content: 'ri-close-line',
                value: false,
                label: '否'
              }
            ]
          }
        ]
      }
    },
    {
      title: '数据表格设置',
      span: 24,
      itemRender: {
        name: '$btnRadioGroup',
        options: [
          {
            field: 'bodyDataSetting',
            isRadio: false,
            customCallBack: ({ data }) => {
              store.commit('printTemplateModule/setCurTableSettingId', data.id)
            },
            options: [
              {
                type: 'icon',
                content: 'ri-settings-5-line',
                value: 'none',
                label: '设置'
              }
            ]
          }
        ]
      }
    }
  ],
  RoyImage: [
    {
      title: '标题',
      field: 'title',
      span: 24,
      itemRender: {
        name: '$input',
        props: {
          type: 'text',
          size: 'mini'
        }
      }
    },
    {
      title: '图片链接地址',
      field: 'src',
      span: 24,
      itemRender: {
        name: '$textarea',
        props: {
          type: 'text',
          size: 'mini'
        }
      }
    },
    {
      title: '上传图片',
      span: 24,
      itemRender: {
        name: '$btnRadioGroup',
        options: [
          {
            field: 'src',
            isRadio: false,
            customCallBack: async ({ data }) => {
              const { file } = await VXETable.readFile({
                types: ['jpg', 'jpeg', 'gif', 'png']
              })
              if (file.size / 1000 > 1000) {
                toast('请上传小于 1MB 的图片', 'warning')
                return
              }
              let reader = new FileReader()
              reader.readAsDataURL(file)
              reader.onload = function () {
                data.src = reader.result
              }
            },
            options: [
              {
                type: 'icon',
                content: 'ri-upload-line',
                value: 'uploaded-image',
                label: '点击上传图片'
              }
            ]
          }
        ]
      }
    }
  ]
}
