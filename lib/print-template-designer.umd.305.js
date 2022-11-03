"use strict";
((typeof self !== 'undefined' ? self : this)["webpackChunkprint_template_designer"] = (typeof self !== 'undefined' ? self : this)["webpackChunkprint_template_designer"] || []).push([[305],{

/***/ 2305:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ GlobalSetting; }
});

;// CONCATENATED MODULE: ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-82.use[1]!./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??ruleSet[1].rules[3]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/Main/GlobalSetting.vue?vue&type=template&id=45115e2c&scoped=true&
var render = function render() {
  var _vm = this,
      _c = _vm._self._c;

  return _c('el-main', {
    staticClass: "roy-designer-global"
  }, [_c('el-row', {
    staticClass: "roy-designer-global__pages"
  }, [_c('el-col', {
    staticClass: "roy-designer-global__title",
    attrs: {
      "span": 24
    }
  }, [_vm._v("模板名称:")]), _c('el-col', {
    attrs: {
      "span": 24
    }
  }, [_vm._v(" 新建模板")])], 1), _c('el-row', {
    staticClass: "roy-designer-global__pages"
  }, [_c('el-col', {
    staticClass: "roy-designer-global__title",
    attrs: {
      "span": 24
    }
  }, [_vm._v("纸张大小:")]), _c('el-col', {
    attrs: {
      "span": 24
    }
  }, [_c('div', {
    staticClass: "roy-designer-global__pages__container"
  }, _vm._l(Object.values(_vm.pages), function (page) {
    return _c('div', {
      key: page.name,
      staticClass: "roy-designer-global__pages__item",
      class: _vm.currentPage === page.name ? 'roy-designer-global__pages__item--active' : '',
      on: {
        "click": function ($event) {
          _vm.currentPage = page.name;
        }
      }
    }, [_vm._v(" " + _vm._s(page.name) + " ")]);
  }), 0)])], 1)], 1);
};

var staticRenderFns = [];

// EXTERNAL MODULE: ./src/mixin/commonMixin.js
var commonMixin = __webpack_require__(6667);
// EXTERNAL MODULE: ./node_modules/vuex/dist/vuex.esm.js
var vuex_esm = __webpack_require__(6453);
;// CONCATENATED MODULE: ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-82.use[1]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/Main/GlobalSetting.vue?vue&type=script&lang=js&


/**
 * GlobalSetting
 */

/* harmony default export */ var GlobalSettingvue_type_script_lang_js_ = ({
  name: 'GlobalSetting',
  mixins: [commonMixin/* default */.Z],
  components: {},
  props: {},

  data() {
    return {
      pages: {
        A1: {
          name: 'A1',
          w: 594,
          h: 841
        },
        A2: {
          name: 'A2',
          w: 420,
          h: 594
        },
        A3: {
          name: 'A3',
          w: 297,
          h: 420
        },
        A4: {
          name: 'A4',
          w: 210,
          h: 297
        },
        A5: {
          name: 'A5',
          w: 148,
          h: 210
        },
        A6: {
          name: 'A6',
          w: 105,
          h: 148
        },
        A7: {
          name: 'A7',
          w: 74,
          h: 105
        },
        B1: {
          name: 'B1',
          w: 707,
          h: 1000
        },
        B2: {
          name: 'B2',
          w: 500,
          h: 707
        },
        B3: {
          name: 'B3',
          w: 353,
          h: 500
        },
        B4: {
          name: 'B4',
          w: 250,
          h: 353
        },
        B5: {
          name: 'B5',
          w: 176,
          h: 250
        },
        B6: {
          name: 'B6',
          w: 125,
          h: 176
        },
        B7: {
          name: 'B7',
          w: 88,
          h: 125
        },
        C1: {
          name: 'C1',
          w: 648,
          h: 917
        },
        C2: {
          name: 'C2',
          w: 458,
          h: 648
        },
        C3: {
          name: 'C3',
          w: 324,
          h: 458
        },
        C4: {
          name: 'C4',
          w: 229,
          h: 324
        },
        C5: {
          name: 'C5',
          w: 162,
          h: 229
        },
        C6: {
          name: 'C6',
          w: 114,
          h: 162
        },
        C7: {
          name: 'C7',
          w: 81,
          h: 114
        }
      },
      currentPage: 'A4'
    };
  },

  methods: { ...(0,vuex_esm/* mapActions */.nv)({
      reDrawRuler: 'printTemplateModule/rulerThings/reDrawRuler',
      setRect: 'printTemplateModule/rulerThings/setRect'
    }),

    initMounted() {}

  },

  created() {},

  mounted() {
    this.initMounted();
  },

  watch: {
    currentPage(newVal) {
      let page = this.pages[newVal];
      this.setRect(page);
      this.reDrawRuler();
      this.$store.commit('printTemplateModule/setPageSize', {
        pageSize: newVal,
        w: page.w,
        h: page.h
      });
    }

  }
});
;// CONCATENATED MODULE: ./src/components/Main/GlobalSetting.vue?vue&type=script&lang=js&
 /* harmony default export */ var Main_GlobalSettingvue_type_script_lang_js_ = (GlobalSettingvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./node_modules/mini-css-extract-plugin/dist/loader.js??clonedRuleSet-64.use[0]!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-64.use[1]!./node_modules/@vue/vue-loader-v15/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-64.use[2]!./node_modules/sass-loader/dist/cjs.js??clonedRuleSet-64.use[3]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/Main/GlobalSetting.vue?vue&type=style&index=0&id=45115e2c&prod&lang=scss&scoped=true&
// extracted by mini-css-extract-plugin

;// CONCATENATED MODULE: ./src/components/Main/GlobalSetting.vue?vue&type=style&index=0&id=45115e2c&prod&lang=scss&scoped=true&

// EXTERNAL MODULE: ./node_modules/@vue/vue-loader-v15/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__(1001);
;// CONCATENATED MODULE: ./src/components/Main/GlobalSetting.vue



;


/* normalize component */

var component = (0,componentNormalizer/* default */.Z)(
  Main_GlobalSettingvue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  "45115e2c",
  null
  
)

/* harmony default export */ var GlobalSetting = (component.exports);

/***/ })

}]);
//# sourceMappingURL=print-template-designer.umd.305.js.map