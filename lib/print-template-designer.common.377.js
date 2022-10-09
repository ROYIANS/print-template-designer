"use strict";
((typeof self !== 'undefined' ? self : this)["webpackChunkprint_template_designer"] = (typeof self !== 'undefined' ? self : this)["webpackChunkprint_template_designer"] || []).push([[377],{

/***/ 4377:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ PageSetting; }
});

;// CONCATENATED MODULE: ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??ruleSet[1].rules[3]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/home/PageSetting.vue?vue&type=template&id=ad369a1a&scoped=true&
var render = function render() {
  var _vm = this,
      _c = _vm._self._c;

  return _c('div', {
    staticClass: "roy-page-setting"
  }, [_c('header', _vm._l(_vm.buttons, function (btn, index) {
    return _c('el-tooltip', {
      key: index,
      attrs: {
        "content": btn.content,
        "open-delay": 400,
        "visible-arrow": false,
        "effect": "dark",
        "placement": "bottom"
      }
    }, [_c('i', {
      class: btn.icon
    })]);
  }), 1), _vm._l(_vm.pages, function (page, index) {
    return _c('el-row', {
      key: index,
      class: page.active ? 'active' : '',
      attrs: {
        "data-index": index,
        "gutter": 10
      },
      nativeOn: {
        "click": function ($event) {
          return _vm.doActivePage(index);
        }
      }
    }, [_c('el-col', {
      attrs: {
        "span": 4
      }
    }, [_vm._v(_vm._s(index + 1))]), _c('el-col', {
      attrs: {
        "span": 20
      }
    }, [page.canvas ? _c('PageThumbnail', {
      attrs: {
        "element": page.canvas
      }
    }) : _vm._e()], 1)], 1);
  })], 2);
};

var staticRenderFns = [];

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.push.js
var es_array_push = __webpack_require__(7658);
;// CONCATENATED MODULE: ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??ruleSet[1].rules[3]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/home/PageThumbnail.vue?vue&type=template&id=1d8943b9&scoped=true&
var PageThumbnailvue_type_template_id_1d8943b9_scoped_true_render = function render() {
  var _vm = this,
      _c = _vm._self._c;

  return _c('div', {
    ref: "thumbnail",
    staticStyle: {
      "height": "100%",
      "width": "100%",
      "display": "flex",
      "align-items": "center",
      "justify-content": "center"
    }
  });
};

var PageThumbnailvue_type_template_id_1d8943b9_scoped_true_staticRenderFns = [];

// EXTERNAL MODULE: ./src/mixin/commonMixin.js
var commonMixin = __webpack_require__(1917);
;// CONCATENATED MODULE: ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/home/PageThumbnail.vue?vue&type=script&lang=js&

/**
 * 缩略图
 */

/* harmony default export */ var PageThumbnailvue_type_script_lang_js_ = ({
  name: "PageThumbnail",
  mixins: [commonMixin/* default */.Z],
  components: {},
  props: {
    element: {
      type: HTMLElement,
      default: null
    }
  },

  data() {
    return {};
  },

  methods: {
    initMounted() {
      if (this.element !== null) {
        this.$refs.thumbnail.appendChild(this.element);
      }
    }

  },

  created() {},

  mounted() {
    this.initMounted();
  },

  watch: {}
});
;// CONCATENATED MODULE: ./src/components/home/PageThumbnail.vue?vue&type=script&lang=js&
 /* harmony default export */ var home_PageThumbnailvue_type_script_lang_js_ = (PageThumbnailvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./node_modules/mini-css-extract-plugin/dist/loader.js??clonedRuleSet-22.use[0]!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-22.use[1]!./node_modules/@vue/vue-loader-v15/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-22.use[2]!./node_modules/sass-loader/dist/cjs.js??clonedRuleSet-22.use[3]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/home/PageThumbnail.vue?vue&type=style&index=0&id=1d8943b9&prod&lang=scss&scoped=true&
// extracted by mini-css-extract-plugin

;// CONCATENATED MODULE: ./src/components/home/PageThumbnail.vue?vue&type=style&index=0&id=1d8943b9&prod&lang=scss&scoped=true&

// EXTERNAL MODULE: ./node_modules/@vue/vue-loader-v15/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__(1001);
;// CONCATENATED MODULE: ./src/components/home/PageThumbnail.vue



;


/* normalize component */

var component = (0,componentNormalizer/* default */.Z)(
  home_PageThumbnailvue_type_script_lang_js_,
  PageThumbnailvue_type_template_id_1d8943b9_scoped_true_render,
  PageThumbnailvue_type_template_id_1d8943b9_scoped_true_staticRenderFns,
  false,
  null,
  "1d8943b9",
  null
  
)

/* harmony default export */ var PageThumbnail = (component.exports);
// EXTERNAL MODULE: ./node_modules/html2canvas/dist/html2canvas.js
var html2canvas = __webpack_require__(2269);
var html2canvas_default = /*#__PURE__*/__webpack_require__.n(html2canvas);
;// CONCATENATED MODULE: ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/home/PageSetting.vue?vue&type=script&lang=js&



/* harmony default export */ var PageSettingvue_type_script_lang_js_ = ({
  name: "PageSetting",

  data() {
    return {
      pages: [],
      buttons: [{
        icon: "ri-file-line",
        content: "新增空白页"
      }, {
        icon: "ri-file-copy-line",
        content: "复制"
      }, {
        icon: "ri-delete-bin-4-line",
        content: "删除"
      }, {
        icon: "ri-arrow-up-fill",
        content: "上移"
      }, {
        icon: "ri-arrow-down-fill",
        content: "下移"
      }, {
        icon: "ri-align-top",
        content: "置顶"
      }, {
        icon: "ri-align-bottom",
        content: "置底"
      }]
    };
  },

  components: {
    PageThumbnail: PageThumbnail
  },
  methods: {
    doActivePage(index) {
      for (let i = 0; i < this.pages.length; i++) {
        this.$set(this.pages[i], "active", i === index);
      }
    }

  },

  async mounted() {
    for (let i = 0; i < 3; i++) {
      let element = await html2canvas_default()(document.querySelector("#designer-page"), {
        scale: "0.6"
      });
      element.style.width = "auto";
      element.style.height = "96px";
      this.pages.push({
        canvas: element
      });
    }
  }

});
;// CONCATENATED MODULE: ./src/components/home/PageSetting.vue?vue&type=script&lang=js&
 /* harmony default export */ var home_PageSettingvue_type_script_lang_js_ = (PageSettingvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./node_modules/mini-css-extract-plugin/dist/loader.js??clonedRuleSet-22.use[0]!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-22.use[1]!./node_modules/@vue/vue-loader-v15/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-22.use[2]!./node_modules/sass-loader/dist/cjs.js??clonedRuleSet-22.use[3]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/home/PageSetting.vue?vue&type=style&index=0&id=ad369a1a&prod&lang=scss&scoped=true&
// extracted by mini-css-extract-plugin

;// CONCATENATED MODULE: ./src/components/home/PageSetting.vue?vue&type=style&index=0&id=ad369a1a&prod&lang=scss&scoped=true&

;// CONCATENATED MODULE: ./src/components/home/PageSetting.vue



;


/* normalize component */

var PageSetting_component = (0,componentNormalizer/* default */.Z)(
  home_PageSettingvue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  "ad369a1a",
  null
  
)

/* harmony default export */ var PageSetting = (PageSetting_component.exports);

/***/ })

}]);
//# sourceMappingURL=print-template-designer.common.377.js.map