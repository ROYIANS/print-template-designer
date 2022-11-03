"use strict";
((typeof self !== 'undefined' ? self : this)["webpackChunkprint_template_designer"] = (typeof self !== 'undefined' ? self : this)["webpackChunkprint_template_designer"] || []).push([[149],{

/***/ 9149:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ PageComponent; }
});

;// CONCATENATED MODULE: ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??ruleSet[1].rules[3]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/Main/PageComponent.vue?vue&type=template&id=dd23d612&scoped=true&
var render = function render() {
  var _vm = this,
      _c = _vm._self._c;

  return _c('div', {
    staticClass: "roy-page-component",
    on: {
      "dragstart": _vm.handleDragStart
    }
  }, _vm._l(_vm.componentItems, function (item, index) {
    return _c('div', {
      key: item.code,
      staticClass: "roy-page-component__item",
      attrs: {
        "data-index": index,
        "draggable": "true"
      }
    }, [_c('i', {
      class: item.icon
    }), _c('span', [_vm._v(_vm._s(item.name))])]);
  }), 0);
};

var staticRenderFns = [];

// EXTERNAL MODULE: ./src/components/config/componentList.js
var componentList = __webpack_require__(8760);
;// CONCATENATED MODULE: ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/Main/PageComponent.vue?vue&type=script&lang=js&

/* harmony default export */ var PageComponentvue_type_script_lang_js_ = ({
  name: 'PageComponent',

  data() {
    return {
      componentItems: componentList/* componentList */.sy
    };
  },

  methods: {
    handleDragStart(e) {
      e.dataTransfer.setData('index', e.target.dataset.index);
    }

  }
});
;// CONCATENATED MODULE: ./src/components/Main/PageComponent.vue?vue&type=script&lang=js&
 /* harmony default export */ var Main_PageComponentvue_type_script_lang_js_ = (PageComponentvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./node_modules/mini-css-extract-plugin/dist/loader.js??clonedRuleSet-22.use[0]!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-22.use[1]!./node_modules/@vue/vue-loader-v15/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-22.use[2]!./node_modules/sass-loader/dist/cjs.js??clonedRuleSet-22.use[3]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/Main/PageComponent.vue?vue&type=style&index=0&id=dd23d612&prod&lang=scss&scoped=true&
// extracted by mini-css-extract-plugin

;// CONCATENATED MODULE: ./src/components/Main/PageComponent.vue?vue&type=style&index=0&id=dd23d612&prod&lang=scss&scoped=true&

// EXTERNAL MODULE: ./node_modules/@vue/vue-loader-v15/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__(1001);
;// CONCATENATED MODULE: ./src/components/Main/PageComponent.vue



;


/* normalize component */

var component = (0,componentNormalizer/* default */.Z)(
  Main_PageComponentvue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  "dd23d612",
  null
  
)

/* harmony default export */ var PageComponent = (component.exports);

/***/ })

}]);
//# sourceMappingURL=print-template-designer.common.149.js.map