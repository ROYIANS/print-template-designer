import { n as a } from "./index.df561e03.mjs";
const l = {
  name: "PageBlock",
  data() {
    return {
      blocks: [
        [24],
        [12, 12],
        [8, 8, 8],
        [6, 6, 6, 6],
        [8, 16],
        [16, 8],
        [4, 8, 4, 8],
        [8, 4, 8, 4]
      ]
    };
  }
};
var t = function() {
  var e = this, n = e._self._c;
  return n("div", { staticClass: "roy-page-block" }, e._l(e.blocks, function(r, s) {
    return n("section", { key: s }, e._l(r, function(c, _) {
      return n("el-col", { key: _, attrs: { span: c } });
    }), 1);
  }), 0);
}, i = [];
t._withStripped = !0;
var o = /* @__PURE__ */ a(
  l,
  t,
  i,
  !1,
  null,
  "6fee6eca",
  null,
  null
);
o.options.__file = "D:/Study/\u4E2A\u4EBA\u9879\u76EE/svg-print-template-designer/src/components/home/PageBlock.vue";
const f = o.exports;
export {
  f as default
};
