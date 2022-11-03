"use strict";
((typeof self !== 'undefined' ? self : this)["webpackChunkprint_template_designer"] = (typeof self !== 'undefined' ? self : this)["webpackChunkprint_template_designer"] || []).push([[485],{

/***/ 3485:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ PagePalette; }
});

;// CONCATENATED MODULE: ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??ruleSet[1].rules[3]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/Main/PagePalette.vue?vue&type=template&id=0fb49b2e&scoped=true&
var render = function render() {
  var _vm = this,
      _c = _vm._self._c;

  return _c('div', {
    staticClass: "roy-page-tools"
  }, [_vm.curComponent && _vm.curComponent.id ? _c('div', [_c('vxe-form', {
    ref: "form",
    attrs: {
      "sync-resize": "",
      "title-overflow": _vm.formGlobalConfigIn.titleOverflow,
      "data": _vm.formData,
      "items": _vm.formItemConfig,
      "rules": {},
      "span": _vm.formGlobalConfigIn.span,
      "align": _vm.formGlobalConfigIn.align,
      "valid-config": _vm.formGlobalConfigIn.validConfig,
      "size": _vm.formGlobalConfigIn.size,
      "title-align": _vm.formGlobalConfigIn.titleAlign,
      "title-width": _vm.formGlobalConfigIn.titleWidth,
      "title-colon": _vm.formGlobalConfigIn.titleColon,
      "prevent-submit": _vm.formGlobalConfigIn.preventSubmit,
      "loading": _vm.formGlobalConfigIn.loading
    }
  })], 1) : _c('div', {
    staticClass: "roy-page-tools__empty animate__animated animate__headShake"
  }, [_c('i', {
    staticClass: "ri-door-lock-box-line animate__backInUp",
    staticStyle: {
      "color": "var(--roy-color-warning)"
    }
  }), _c('div', [_vm._v("请先选定一个组件，再进行该组件的属性设置")])])]);
};

var staticRenderFns = [];

// EXTERNAL MODULE: ./node_modules/vuex/dist/vuex.esm.js
var vuex_esm = __webpack_require__(3822);
// EXTERNAL MODULE: ./src/mixin/commonMixin.js
var commonMixin = __webpack_require__(1917);
;// CONCATENATED MODULE: ./src/components/config/renderers.js
const renderers = {
  $btnRadioGroup: {
    renderItem(h, renderOpts, params) {
      let {
        options = []
      } = renderOpts;
      let {
        data
      } = params;

      if (options && options.length) {
        return [h("div", {
          "class": "roy-btn-radio-group"
        }, [options.map(group => {
          const {
            field,
            defaultValue,
            isRadio = true,
            options: inOpt
          } = group;

          if (inOpt && inOpt.length) {
            return inOpt.map(option => {
              const value = option.value;
              return h("div", {
                "class": value === data[field] ? 'roy-btn-radio-group__btn roy-btn-radio-group__btn--active' : 'roy-btn-radio-group__btn',
                "attrs": {
                  "title": option.label
                },
                "on": {
                  "click": () => {
                    if (option.customCallBack) {
                      option.customCallBack(params, field, option);
                    } else {
                      if (!isRadio) {
                        value === data[field] ? data[field] = defaultValue : data[field] = value;
                      } else {
                        data[field] = value;
                      }
                    }
                  }
                }
              }, [option.type === 'icon' ? h("i", {
                "class": option.content
              }) : h("span", [option.content])]);
            });
          }

          return [h("div", ["None"])];
        })])];
      }

      return [h("div", ["None"])];
    }

  },
  $colorPicker: {
    renderItem(h, renderOpts, params) {
      let {
        property,
        data
      } = params;
      return [h("el-color-picker", {
        "attrs": {
          "value": data[property],
          "size": "mini"
        },
        "class": "roy-color-picker",
        "on": {
          "change": val => {
            data[property] = val;
          }
        }
      })];
    }

  }
};
;// CONCATENATED MODULE: ./src/components/config/paletteConfig.js
const paletteConfigList = {
  RoyText: [{
    title: '宽度',
    field: 'width',
    span: 24,
    itemRender: {
      name: '$input',
      props: {
        type: 'number',
        size: 'mini'
      }
    }
  }, {
    title: '高度',
    field: 'height',
    span: 24,
    itemRender: {
      name: '$input',
      props: {
        type: 'number',
        size: 'mini'
      }
    }
  }, {
    title: '背景颜色',
    field: 'background',
    span: 24,
    itemRender: {
      name: '$colorPicker',
      props: {}
    }
  }, {
    title: '边框类型',
    field: 'borderType',
    span: 24,
    itemRender: {
      name: '$select',
      options: [{
        label: '无',
        value: 'none'
      }, {
        label: '实线',
        value: 'solid'
      }, {
        label: '线虚线',
        value: 'dashed'
      }, {
        label: '点虚线',
        value: 'dotted'
      }]
    }
  }, {
    title: '边框颜色',
    field: 'borderColor',
    span: 24,
    itemRender: {
      name: '$colorPicker',
      props: {}
    }
  }, {
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
  }, {
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
  }],
  RoySimpleText: [{
    title: '宽度',
    field: 'width',
    span: 24,
    itemRender: {
      name: '$input',
      props: {
        type: 'number',
        size: 'mini'
      }
    }
  }, {
    title: '高度',
    field: 'height',
    span: 24,
    itemRender: {
      name: '$input',
      props: {
        type: 'number',
        size: 'mini'
      }
    }
  }, {
    title: '字体',
    field: 'fontFamily',
    span: 24,
    itemRender: {
      name: '$select',
      options: [{
        label: '默认',
        value: 'default'
      }, {
        label: '宋体',
        value: 'simsun'
      }, {
        label: '黑体',
        value: 'simhei'
      }, {
        label: '楷体',
        value: 'kaiti'
      }, {
        label: '仿宋',
        value: 'fangsong'
      }, {
        label: '微软雅黑',
        value: 'microsoft yahei'
      }]
    }
  }, {
    title: '字体颜色',
    field: 'color',
    span: 24,
    itemRender: {
      name: '$colorPicker',
      props: {}
    }
  }, {
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
  }, {
    title: '排列',
    span: 24,
    itemRender: {
      name: '$btnRadioGroup',
      options: [{
        field: 'justifyContent',
        options: [{
          type: 'icon',
          content: 'ri-align-left',
          value: 'flex-start',
          label: '水平居左'
        }, {
          type: 'icon',
          content: 'ri-align-center',
          value: 'center',
          label: '水平居中'
        }, {
          type: 'icon',
          content: 'ri-align-right',
          value: 'flex-end',
          label: '水平居下'
        }]
      }, {
        field: 'alignItems',
        options: [{
          type: 'icon',
          content: 'ri-align-left rotate-90',
          value: 'flex-start',
          label: '垂直居左'
        }, {
          type: 'icon',
          content: 'ri-align-center rotate-90',
          value: 'center',
          label: '垂直居中'
        }, {
          type: 'icon',
          content: 'ri-align-right rotate-90',
          value: 'flex-end',
          label: '垂直居下'
        }]
      }]
    }
  }, {
    title: '文字样式',
    span: 24,
    itemRender: {
      name: '$btnRadioGroup',
      options: [{
        field: 'fontWeight',
        isRadio: false,
        options: [{
          type: 'icon',
          content: 'ri-bold',
          value: 'bold',
          label: '粗体'
        }]
      }, {
        field: 'fontStyle',
        isRadio: false,
        options: [{
          type: 'icon',
          content: 'ri-italic',
          value: 'italic',
          label: '斜体'
        }]
      }, {
        field: 'isUnderLine',
        isRadio: false,
        options: [{
          type: 'icon',
          content: 'ri-underline',
          value: true,
          label: '下划线'
        }]
      }, {
        field: 'isDelLine',
        isRadio: false,
        options: [{
          type: 'icon',
          content: 'ri-strikethrough',
          value: true,
          label: '删除线'
        }]
      }]
    }
  }, {
    title: '背景颜色',
    field: 'background',
    span: 24,
    itemRender: {
      name: '$colorPicker',
      props: {}
    }
  }, {
    title: '边框类型',
    field: 'borderType',
    span: 24,
    itemRender: {
      name: '$select',
      options: [{
        label: '无',
        value: 'none'
      }, {
        label: '实线',
        value: 'solid'
      }, {
        label: '线虚线',
        value: 'dashed'
      }, {
        label: '点虚线',
        value: 'dotted'
      }]
    }
  }, {
    title: '边框颜色',
    field: 'borderColor',
    span: 24,
    itemRender: {
      name: '$colorPicker',
      props: {}
    }
  }, {
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
  }, {
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
  }],
  RoyRect: [{
    title: '宽度',
    field: 'width',
    span: 24,
    itemRender: {
      name: '$input',
      props: {
        type: 'number',
        size: 'mini'
      }
    }
  }, {
    title: '高度',
    field: 'height',
    span: 24,
    itemRender: {
      name: '$input',
      props: {
        type: 'number',
        size: 'mini'
      }
    }
  }, {
    title: '背景颜色',
    field: 'background',
    span: 24,
    itemRender: {
      name: '$colorPicker',
      props: {}
    }
  }, {
    title: '边框类型',
    field: 'borderType',
    span: 24,
    itemRender: {
      name: '$select',
      options: [{
        label: '无',
        value: 'none'
      }, {
        label: '实线',
        value: 'solid'
      }, {
        label: '线虚线',
        value: 'dashed'
      }, {
        label: '点虚线',
        value: 'dotted'
      }]
    }
  }, {
    title: '边框颜色',
    field: 'borderColor',
    span: 24,
    itemRender: {
      name: '$colorPicker',
      props: {}
    }
  }, {
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
  }, {
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
  }],
  RoyCircle: [{
    title: '宽度',
    field: 'width',
    span: 24,
    itemRender: {
      name: '$input',
      props: {
        type: 'number',
        size: 'mini'
      }
    }
  }, {
    title: '高度',
    field: 'height',
    span: 24,
    itemRender: {
      name: '$input',
      props: {
        type: 'number',
        size: 'mini'
      }
    }
  }, {
    title: '背景颜色',
    field: 'background',
    span: 24,
    itemRender: {
      name: '$colorPicker',
      props: {}
    }
  }, {
    title: '边框类型',
    field: 'borderType',
    span: 24,
    itemRender: {
      name: '$select',
      options: [{
        label: '无',
        value: 'none'
      }, {
        label: '实线',
        value: 'solid'
      }, {
        label: '线虚线',
        value: 'dashed'
      }, {
        label: '点虚线',
        value: 'dotted'
      }]
    }
  }, {
    title: '边框颜色',
    field: 'borderColor',
    span: 24,
    itemRender: {
      name: '$colorPicker',
      props: {}
    }
  }, {
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
  }, {
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
  }],
  RoyLine: [{
    title: '宽度',
    field: 'width',
    span: 24,
    itemRender: {
      name: '$input',
      props: {
        type: 'number',
        size: 'mini'
      }
    }
  }, {
    title: '粗细',
    field: 'height',
    span: 24,
    itemRender: {
      name: '$select',
      options: [{
        label: '极细',
        value: 0.5
      }, {
        label: '细',
        value: 1
      }, {
        label: '正常',
        value: 1.5
      }, {
        label: '粗',
        value: 2
      }, {
        label: '极粗',
        value: 4
      }, {
        label: '粗粗粗',
        value: 6
      }]
    }
  }, {
    title: '颜色',
    field: 'background',
    span: 24,
    itemRender: {
      name: '$colorPicker',
      props: {}
    }
  }, {
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
  }],
  RoyStar: [{
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
  }, {
    title: '颜色',
    field: 'background',
    span: 24,
    itemRender: {
      name: '$colorPicker',
      props: {}
    }
  }, {
    title: '样式',
    field: 'icon',
    span: 24,
    itemRender: {
      name: '$select',
      options: [{
        label: '实心五角星',
        value: 'icon-shiwujiaoxing'
      }, {
        label: '空心五角星',
        value: 'icon-kongwujiaoxing'
      }, {
        label: '圆润五角星',
        value: 'icon-shoucang'
      }, {
        label: '双线五角星',
        value: 'icon-wujiaoxing'
      }]
    }
  }, {
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
  }]
};
;// CONCATENATED MODULE: ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/Main/PagePalette.vue?vue&type=script&lang=js&




/* harmony default export */ var PagePalettevue_type_script_lang_js_ = ({
  name: 'PagePalette',
  mixins: [commonMixin/* default */.Z],
  computed: { ...(0,vuex_esm/* mapState */.rn)({
      curComponent: state => state.printTemplateModule.curComponent
    }),

    formItemConfig() {
      let curComponentCode = this.curComponent?.component || 'no';
      return this.formItemConfigs[curComponentCode] || [];
    }

  },

  data() {
    return {
      formGlobalConfigIn: {
        titleOverflow: true,
        span: 8,
        align: 'left',
        size: 'medium',
        titleAlign: 'right',
        titleWidth: '200',
        titleColon: false,
        preventSubmit: false,
        loading: false,
        validConfig: {
          autoPos: true
        }
      },
      formData: {},
      formItemConfigs: paletteConfigList
    };
  },

  methods: {
    registerTableRender(renderers) {
      // 注册渲染器
      for (let i in renderers) {
        this.$VXETable.renderer.add(i, renderers[i]);
      }
    }

  },

  mounted() {
    this.registerTableRender(renderers);
  },

  watch: {
    curComponent: {
      handler() {
        if (this.curComponent) {
          this.formData = this.curComponent.style;
        }
      },

      deep: true,
      immediate: true
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Main/PagePalette.vue?vue&type=script&lang=js&
 /* harmony default export */ var Main_PagePalettevue_type_script_lang_js_ = (PagePalettevue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./node_modules/mini-css-extract-plugin/dist/loader.js??clonedRuleSet-22.use[0]!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-22.use[1]!./node_modules/@vue/vue-loader-v15/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-22.use[2]!./node_modules/sass-loader/dist/cjs.js??clonedRuleSet-22.use[3]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/Main/PagePalette.vue?vue&type=style&index=0&id=0fb49b2e&prod&lang=scss&scoped=true&
// extracted by mini-css-extract-plugin

;// CONCATENATED MODULE: ./src/components/Main/PagePalette.vue?vue&type=style&index=0&id=0fb49b2e&prod&lang=scss&scoped=true&

;// CONCATENATED MODULE: ./node_modules/mini-css-extract-plugin/dist/loader.js??clonedRuleSet-22.use[0]!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-22.use[1]!./node_modules/@vue/vue-loader-v15/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-22.use[2]!./node_modules/sass-loader/dist/cjs.js??clonedRuleSet-22.use[3]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/Main/PagePalette.vue?vue&type=style&index=1&id=0fb49b2e&prod&lang=scss&
// extracted by mini-css-extract-plugin

;// CONCATENATED MODULE: ./src/components/Main/PagePalette.vue?vue&type=style&index=1&id=0fb49b2e&prod&lang=scss&

// EXTERNAL MODULE: ./node_modules/@vue/vue-loader-v15/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__(1001);
;// CONCATENATED MODULE: ./src/components/Main/PagePalette.vue



;



/* normalize component */

var component = (0,componentNormalizer/* default */.Z)(
  Main_PagePalettevue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  "0fb49b2e",
  null
  
)

/* harmony default export */ var PagePalette = (component.exports);

/***/ })

}]);
//# sourceMappingURL=print-template-designer.common.485.js.map