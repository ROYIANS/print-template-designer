"use strict";
((typeof self !== 'undefined' ? self : this)["webpackChunkprint_template_designer"] = (typeof self !== 'undefined' ? self : this)["webpackChunkprint_template_designer"] || []).push([[848],{

/***/ 1848:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ PageToc; }
});

;// CONCATENATED MODULE: ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??ruleSet[1].rules[3]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/Main/PageToc.vue?vue&type=template&id=b6355edc&scoped=true&
var render = function render() {
  var _vm = this,
      _c = _vm._self._c;

  return _c('el-main', {
    staticClass: "roy-page-toc"
  }, [_vm.componentData.length ? _c('div', _vm._l(_vm.componentData, function (item, index) {
    return _c('div', {
      key: index,
      staticClass: "roy-page-toc__list",
      class: {
        activated: _vm.transformIndex(index) === _vm.curComponentIndex
      },
      on: {
        "click": function ($event) {
          _vm.onClick(_vm.transformIndex(index));
        }
      }
    }, [_c('i', {
      class: _vm.getComponent(index).icon,
      staticStyle: {
        "padding-right": "5px"
      }
    }), _c('span', [_vm._v(_vm._s(_vm.getComponent(index).label))]), _c('div', {
      staticClass: "roy-page-toc__buttons"
    }, [_c('span', {
      staticClass: "ri-arrow-up-line",
      on: {
        "click": function ($event) {
          _vm.upComponent(_vm.transformIndex(index));
        }
      }
    }), _c('span', {
      staticClass: "ri-arrow-down-line",
      on: {
        "click": function ($event) {
          _vm.downComponent(_vm.transformIndex(index));
        }
      }
    }), _c('span', {
      staticClass: "ri-delete-bin-4-line",
      on: {
        "click": function ($event) {
          _vm.deleteComponent(_vm.transformIndex(index));
        }
      }
    })])]);
  }), 0) : _c('div', {
    staticClass: "roy-page-toc__empty animate__animated animate__headShake"
  }, [_c('i', {
    staticClass: "ri-door-lock-box-line animate__backInUp",
    staticStyle: {
      "color": "var(--roy-color-warning)"
    }
  }), _c('div', [_vm._v("当前没有组件，您可以通过拖拽添加组件")])])]);
};

var staticRenderFns = [];

// EXTERNAL MODULE: ./src/mixin/commonMixin.js
var commonMixin = __webpack_require__(1917);
// EXTERNAL MODULE: ./node_modules/vuex/dist/vuex.esm.js
var vuex_esm = __webpack_require__(3822);
;// CONCATENATED MODULE: ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/Main/PageToc.vue?vue&type=script&lang=js&


/**
 * 页面大纲
 */

/* harmony default export */ var PageTocvue_type_script_lang_js_ = ({
  name: 'PageToc',
  mixins: [commonMixin/* default */.Z],
  components: {},
  props: {},

  data() {
    return {};
  },

  computed: { ...(0,vuex_esm/* mapState */.rn)({
      componentData: state => state.printTemplateModule.componentData,
      curComponent: state => state.printTemplateModule.curComponent,
      curComponentIndex: state => state.printTemplateModule.curComponentIndex
    })
  },
  methods: {
    initMounted() {},

    getComponent(index) {
      return this.componentData[this.componentData.length - 1 - index];
    },

    transformIndex(index) {
      return this.componentData.length - 1 - index;
    },

    onClick(index) {
      this.setCurComponent(index);
    },

    deleteComponent() {
      setTimeout(() => {
        this.$store.commit('printTemplateModule/deleteComponent');
        this.$store.commit('printTemplateModule/recordSnapshot');
      });
    },

    upComponent() {
      setTimeout(() => {
        this.$store.commit('printTemplateModule/upComponent');
        this.$store.commit('printTemplateModule/recordSnapshot');
      });
    },

    downComponent() {
      setTimeout(() => {
        this.$store.commit('printTemplateModule/downComponent');
        this.$store.commit('printTemplateModule/recordSnapshot');
      });
    },

    setCurComponent(index) {
      this.$store.commit('printTemplateModule/setCurComponent', {
        component: this.componentData[index],
        index
      });
    }

  },

  created() {},

  mounted() {
    this.initMounted();
  },

  watch: {}
});
;// CONCATENATED MODULE: ./src/components/Main/PageToc.vue?vue&type=script&lang=js&
 /* harmony default export */ var Main_PageTocvue_type_script_lang_js_ = (PageTocvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./node_modules/mini-css-extract-plugin/dist/loader.js??clonedRuleSet-22.use[0]!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-22.use[1]!./node_modules/@vue/vue-loader-v15/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-22.use[2]!./node_modules/sass-loader/dist/cjs.js??clonedRuleSet-22.use[3]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/Main/PageToc.vue?vue&type=style&index=0&id=b6355edc&prod&lang=scss&scoped=true&
// extracted by mini-css-extract-plugin

;// CONCATENATED MODULE: ./src/components/Main/PageToc.vue?vue&type=style&index=0&id=b6355edc&prod&lang=scss&scoped=true&

// EXTERNAL MODULE: ./node_modules/@vue/vue-loader-v15/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__(1001);
;// CONCATENATED MODULE: ./src/components/Main/PageToc.vue



;


/* normalize component */

var component = (0,componentNormalizer/* default */.Z)(
  Main_PageTocvue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  "b6355edc",
  null
  
)

/* harmony default export */ var PageToc = (component.exports);

/***/ })

}]);
//# sourceMappingURL=print-template-designer.common.848.js.map