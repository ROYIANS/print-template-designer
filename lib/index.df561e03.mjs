/**
 * vuex v3.1.1
 * (c) 2019 Evan You
 * @license MIT
 */
function Re(e) {
  var t = Number(e.version.split(".")[0]);
  if (t >= 2)
    e.mixin({ beforeCreate: r });
  else {
    var n = e.prototype._init;
    e.prototype._init = function(i) {
      i === void 0 && (i = {}), i.init = i.init ? [r].concat(i.init) : r, n.call(this, i);
    };
  }
  function r() {
    var i = this.$options;
    i.store ? this.$store = typeof i.store == "function" ? i.store() : i.store : i.parent && i.parent.$store && (this.$store = i.parent.$store);
  }
}
var Ae = typeof window < "u" ? window : typeof global < "u" ? global : {}, F = Ae.__VUE_DEVTOOLS_GLOBAL_HOOK__;
function ke(e) {
  !F || (e._devtoolHook = F, F.emit("vuex:init", e), F.on("vuex:travel-to-state", function(t) {
    e.replaceState(t);
  }), e.subscribe(function(t, n) {
    F.emit("vuex:mutation", t, n);
  }));
}
function A(e, t) {
  Object.keys(e).forEach(function(n) {
    return t(e[n], n);
  });
}
function De(e) {
  return e !== null && typeof e == "object";
}
function Te(e) {
  return e && typeof e.then == "function";
}
function w(e, t) {
  if (!e)
    throw new Error("[vuex] " + t);
}
function Le(e, t) {
  return function() {
    return e(t);
  };
}
var E = function(t, n) {
  this.runtime = n, this._children = /* @__PURE__ */ Object.create(null), this._rawModule = t;
  var r = t.state;
  this.state = (typeof r == "function" ? r() : r) || {};
}, Xt = { namespaced: { configurable: !0 } };
Xt.namespaced.get = function() {
  return !!this._rawModule.namespaced;
};
E.prototype.addChild = function(t, n) {
  this._children[t] = n;
};
E.prototype.removeChild = function(t) {
  delete this._children[t];
};
E.prototype.getChild = function(t) {
  return this._children[t];
};
E.prototype.update = function(t) {
  this._rawModule.namespaced = t.namespaced, t.actions && (this._rawModule.actions = t.actions), t.mutations && (this._rawModule.mutations = t.mutations), t.getters && (this._rawModule.getters = t.getters);
};
E.prototype.forEachChild = function(t) {
  A(this._children, t);
};
E.prototype.forEachGetter = function(t) {
  this._rawModule.getters && A(this._rawModule.getters, t);
};
E.prototype.forEachAction = function(t) {
  this._rawModule.actions && A(this._rawModule.actions, t);
};
E.prototype.forEachMutation = function(t) {
  this._rawModule.mutations && A(this._rawModule.mutations, t);
};
Object.defineProperties(E.prototype, Xt);
var B = function(t) {
  this.register([], t, !1);
};
B.prototype.get = function(t) {
  return t.reduce(function(n, r) {
    return n.getChild(r);
  }, this.root);
};
B.prototype.getNamespace = function(t) {
  var n = this.root;
  return t.reduce(function(r, i) {
    return n = n.getChild(i), r + (n.namespaced ? i + "/" : "");
  }, "");
};
B.prototype.update = function(t) {
  qt([], this.root, t);
};
B.prototype.register = function(t, n, r) {
  var i = this;
  r === void 0 && (r = !0), process.env.NODE_ENV !== "production" && Zt(t, n);
  var o = new E(n, r);
  if (t.length === 0)
    this.root = o;
  else {
    var a = this.get(t.slice(0, -1));
    a.addChild(t[t.length - 1], o);
  }
  n.modules && A(n.modules, function(u, s) {
    i.register(t.concat(s), u, r);
  });
};
B.prototype.unregister = function(t) {
  var n = this.get(t.slice(0, -1)), r = t[t.length - 1];
  !n.getChild(r).runtime || n.removeChild(r);
};
function qt(e, t, n) {
  if (process.env.NODE_ENV !== "production" && Zt(e, n), t.update(n), n.modules)
    for (var r in n.modules) {
      if (!t.getChild(r)) {
        process.env.NODE_ENV !== "production" && console.warn(
          "[vuex] trying to add a new module '" + r + "' on hot reloading, manual reload is needed"
        );
        return;
      }
      qt(
        e.concat(r),
        t.getChild(r),
        n.modules[r]
      );
    }
}
var Bt = {
  assert: function(e) {
    return typeof e == "function";
  },
  expected: "function"
}, Ve = {
  assert: function(e) {
    return typeof e == "function" || typeof e == "object" && typeof e.handler == "function";
  },
  expected: 'function or object with "handler" function'
}, Ut = {
  getters: Bt,
  mutations: Bt,
  actions: Ve
};
function Zt(e, t) {
  Object.keys(Ut).forEach(function(n) {
    if (!!t[n]) {
      var r = Ut[n];
      A(t[n], function(i, o) {
        w(
          r.assert(i),
          je(e, n, o, i, r.expected)
        );
      });
    }
  });
}
function je(e, t, n, r, i) {
  var o = t + " should be " + i + ' but "' + t + "." + n + '"';
  return e.length > 0 && (o += ' in module "' + e.join(".") + '"'), o += " is " + JSON.stringify(r) + ".", o;
}
var _, C = function e(t) {
  var n = this;
  t === void 0 && (t = {}), !_ && typeof window < "u" && window.Vue && Fe(window.Vue), process.env.NODE_ENV !== "production" && (w(_, "must call Vue.use(Vuex) before creating a store instance."), w(typeof Promise < "u", "vuex requires a Promise polyfill in this browser."), w(this instanceof e, "store must be called with the new operator."));
  var r = t.plugins;
  r === void 0 && (r = []);
  var i = t.strict;
  i === void 0 && (i = !1), this._committing = !1, this._actions = /* @__PURE__ */ Object.create(null), this._actionSubscribers = [], this._mutations = /* @__PURE__ */ Object.create(null), this._wrappedGetters = /* @__PURE__ */ Object.create(null), this._modules = new B(t), this._modulesNamespaceMap = /* @__PURE__ */ Object.create(null), this._subscribers = [], this._watcherVM = new _();
  var o = this, a = this, u = a.dispatch, s = a.commit;
  this.dispatch = function(h, v) {
    return u.call(o, h, v);
  }, this.commit = function(h, v, g) {
    return s.call(o, h, v, g);
  }, this.strict = i;
  var c = this._modules.root.state;
  ot(this, c, [], this._modules.root), xt(this, c), r.forEach(function(f) {
    return f(n);
  });
  var l = t.devtools !== void 0 ? t.devtools : _.config.devtools;
  l && ke(this);
}, Et = { state: { configurable: !0 } };
Et.state.get = function() {
  return this._vm._data.$$state;
};
Et.state.set = function(e) {
  process.env.NODE_ENV !== "production" && w(!1, "use store.replaceState() to explicit replace store state.");
};
C.prototype.commit = function(t, n, r) {
  var i = this, o = rt(t, n, r), a = o.type, u = o.payload, s = o.options, c = { type: a, payload: u }, l = this._mutations[a];
  if (!l) {
    process.env.NODE_ENV !== "production" && console.error("[vuex] unknown mutation type: " + a);
    return;
  }
  this._withCommit(function() {
    l.forEach(function(h) {
      h(u);
    });
  }), this._subscribers.forEach(function(f) {
    return f(c, i.state);
  }), process.env.NODE_ENV !== "production" && s && s.silent && console.warn(
    "[vuex] mutation type: " + a + ". Silent option has been removed. Use the filter functionality in the vue-devtools"
  );
};
C.prototype.dispatch = function(t, n) {
  var r = this, i = rt(t, n), o = i.type, a = i.payload, u = { type: o, payload: a }, s = this._actions[o];
  if (!s) {
    process.env.NODE_ENV !== "production" && console.error("[vuex] unknown action type: " + o);
    return;
  }
  try {
    this._actionSubscribers.filter(function(l) {
      return l.before;
    }).forEach(function(l) {
      return l.before(u, r.state);
    });
  } catch (l) {
    process.env.NODE_ENV !== "production" && (console.warn("[vuex] error in before action subscribers: "), console.error(l));
  }
  var c = s.length > 1 ? Promise.all(s.map(function(l) {
    return l(a);
  })) : s[0](a);
  return c.then(function(l) {
    try {
      r._actionSubscribers.filter(function(f) {
        return f.after;
      }).forEach(function(f) {
        return f.after(u, r.state);
      });
    } catch (f) {
      process.env.NODE_ENV !== "production" && (console.warn("[vuex] error in after action subscribers: "), console.error(f));
    }
    return l;
  });
};
C.prototype.subscribe = function(t) {
  return Qt(t, this._subscribers);
};
C.prototype.subscribeAction = function(t) {
  var n = typeof t == "function" ? { before: t } : t;
  return Qt(n, this._actionSubscribers);
};
C.prototype.watch = function(t, n, r) {
  var i = this;
  return process.env.NODE_ENV !== "production" && w(typeof t == "function", "store.watch only accepts a function."), this._watcherVM.$watch(function() {
    return t(i.state, i.getters);
  }, n, r);
};
C.prototype.replaceState = function(t) {
  var n = this;
  this._withCommit(function() {
    n._vm._data.$$state = t;
  });
};
C.prototype.registerModule = function(t, n, r) {
  r === void 0 && (r = {}), typeof t == "string" && (t = [t]), process.env.NODE_ENV !== "production" && (w(Array.isArray(t), "module path must be a string or an Array."), w(t.length > 0, "cannot register the root module by using registerModule.")), this._modules.register(t, n), ot(this, this.state, t, this._modules.get(t), r.preserveState), xt(this, this.state);
};
C.prototype.unregisterModule = function(t) {
  var n = this;
  typeof t == "string" && (t = [t]), process.env.NODE_ENV !== "production" && w(Array.isArray(t), "module path must be a string or an Array."), this._modules.unregister(t), this._withCommit(function() {
    var r = Ot(n.state, t.slice(0, -1));
    _.delete(r, t[t.length - 1]);
  }), Yt(this);
};
C.prototype.hotUpdate = function(t) {
  this._modules.update(t), Yt(this, !0);
};
C.prototype._withCommit = function(t) {
  var n = this._committing;
  this._committing = !0, t(), this._committing = n;
};
Object.defineProperties(C.prototype, Et);
function Qt(e, t) {
  return t.indexOf(e) < 0 && t.push(e), function() {
    var n = t.indexOf(e);
    n > -1 && t.splice(n, 1);
  };
}
function Yt(e, t) {
  e._actions = /* @__PURE__ */ Object.create(null), e._mutations = /* @__PURE__ */ Object.create(null), e._wrappedGetters = /* @__PURE__ */ Object.create(null), e._modulesNamespaceMap = /* @__PURE__ */ Object.create(null);
  var n = e.state;
  ot(e, n, [], e._modules.root, !0), xt(e, n, t);
}
function xt(e, t, n) {
  var r = e._vm;
  e.getters = {};
  var i = e._wrappedGetters, o = {};
  A(i, function(u, s) {
    o[s] = Le(u, e), Object.defineProperty(e.getters, s, {
      get: function() {
        return e._vm[s];
      },
      enumerable: !0
    });
  });
  var a = _.config.silent;
  _.config.silent = !0, e._vm = new _({
    data: {
      $$state: t
    },
    computed: o
  }), _.config.silent = a, e.strict && He(e), r && (n && e._withCommit(function() {
    r._data.$$state = null;
  }), _.nextTick(function() {
    return r.$destroy();
  }));
}
function ot(e, t, n, r, i) {
  var o = !n.length, a = e._modules.getNamespace(n);
  if (r.namespaced && (e._modulesNamespaceMap[a] = r), !o && !i) {
    var u = Ot(t, n.slice(0, -1)), s = n[n.length - 1];
    e._withCommit(function() {
      _.set(u, s, r.state);
    });
  }
  var c = r.context = Ie(e, a, n);
  r.forEachMutation(function(l, f) {
    var h = a + f;
    Ue(e, h, l, c);
  }), r.forEachAction(function(l, f) {
    var h = l.root ? f : a + f, v = l.handler || l;
    ze(e, h, v, c);
  }), r.forEachGetter(function(l, f) {
    var h = a + f;
    Ge(e, h, l, c);
  }), r.forEachChild(function(l, f) {
    ot(e, t, n.concat(f), l, i);
  });
}
function Ie(e, t, n) {
  var r = t === "", i = {
    dispatch: r ? e.dispatch : function(o, a, u) {
      var s = rt(o, a, u), c = s.payload, l = s.options, f = s.type;
      if ((!l || !l.root) && (f = t + f, process.env.NODE_ENV !== "production" && !e._actions[f])) {
        console.error("[vuex] unknown local action type: " + s.type + ", global type: " + f);
        return;
      }
      return e.dispatch(f, c);
    },
    commit: r ? e.commit : function(o, a, u) {
      var s = rt(o, a, u), c = s.payload, l = s.options, f = s.type;
      if ((!l || !l.root) && (f = t + f, process.env.NODE_ENV !== "production" && !e._mutations[f])) {
        console.error("[vuex] unknown local mutation type: " + s.type + ", global type: " + f);
        return;
      }
      e.commit(f, c, l);
    }
  };
  return Object.defineProperties(i, {
    getters: {
      get: r ? function() {
        return e.getters;
      } : function() {
        return Be(e, t);
      }
    },
    state: {
      get: function() {
        return Ot(e.state, n);
      }
    }
  }), i;
}
function Be(e, t) {
  var n = {}, r = t.length;
  return Object.keys(e.getters).forEach(function(i) {
    if (i.slice(0, r) === t) {
      var o = i.slice(r);
      Object.defineProperty(n, o, {
        get: function() {
          return e.getters[i];
        },
        enumerable: !0
      });
    }
  }), n;
}
function Ue(e, t, n, r) {
  var i = e._mutations[t] || (e._mutations[t] = []);
  i.push(function(a) {
    n.call(e, r.state, a);
  });
}
function ze(e, t, n, r) {
  var i = e._actions[t] || (e._actions[t] = []);
  i.push(function(a, u) {
    var s = n.call(e, {
      dispatch: r.dispatch,
      commit: r.commit,
      getters: r.getters,
      state: r.state,
      rootGetters: e.getters,
      rootState: e.state
    }, a, u);
    return Te(s) || (s = Promise.resolve(s)), e._devtoolHook ? s.catch(function(c) {
      throw e._devtoolHook.emit("vuex:error", c), c;
    }) : s;
  });
}
function Ge(e, t, n, r) {
  if (e._wrappedGetters[t]) {
    process.env.NODE_ENV !== "production" && console.error("[vuex] duplicate getter key: " + t);
    return;
  }
  e._wrappedGetters[t] = function(o) {
    return n(
      r.state,
      r.getters,
      o.state,
      o.getters
    );
  };
}
function He(e) {
  e._vm.$watch(function() {
    return this._data.$$state;
  }, function() {
    process.env.NODE_ENV !== "production" && w(e._committing, "do not mutate vuex store state outside mutation handlers.");
  }, { deep: !0, sync: !0 });
}
function Ot(e, t) {
  return t.length ? t.reduce(function(n, r) {
    return n[r];
  }, e) : e;
}
function rt(e, t, n) {
  return De(e) && e.type && (n = t, t = e, e = e.type), process.env.NODE_ENV !== "production" && w(typeof e == "string", "expects string as the type, but found " + typeof e + "."), { type: e, payload: t, options: n };
}
function Fe(e) {
  if (_ && e === _) {
    process.env.NODE_ENV !== "production" && console.error(
      "[vuex] already installed. Vue.use(Vuex) should be called only once."
    );
    return;
  }
  _ = e, Re(_);
}
var We = Ke(function(e, t) {
  var n = {};
  return Je(t).forEach(function(r) {
    var i = r.key, o = r.val;
    n[i] = function() {
      for (var u = [], s = arguments.length; s--; )
        u[s] = arguments[s];
      var c = this.$store.dispatch;
      if (e) {
        var l = Xe(this.$store, "mapActions", e);
        if (!l)
          return;
        c = l.context.dispatch;
      }
      return typeof o == "function" ? o.apply(this, [c].concat(u)) : c.apply(this.$store, [o].concat(u));
    };
  }), n;
});
function Je(e) {
  return Array.isArray(e) ? e.map(function(t) {
    return { key: t, val: t };
  }) : Object.keys(e).map(function(t) {
    return { key: t, val: e[t] };
  });
}
function Ke(e) {
  return function(t, n) {
    return typeof t != "string" ? (n = t, t = "") : t.charAt(t.length - 1) !== "/" && (t += "/"), e(t, n);
  };
}
function Xe(e, t, n) {
  var r = e._modulesNamespaceMap[n];
  return process.env.NODE_ENV !== "production" && !r && console.error("[vuex] module namespace not found in " + t + "(): " + n), r;
}
const k = {
  methods: {
    deepCopy(e, t = []) {
      if (e === null || typeof e != "object")
        return e;
      const n = Object.prototype.toString.call(e).slice(8, -1);
      if (n === "RegExp")
        return new RegExp(e);
      if (n === "Date")
        return new Date(e);
      if (n === "Error")
        return new Error(e);
      const r = t.filter((o) => o.original === e)[0];
      if (r)
        return r.copy;
      const i = Array.isArray(e) ? [] : {};
      return t.push({ original: e, copy: i }), Object.keys(e).forEach((o) => {
        i[o] = this.deepCopy(e[o], t);
      }), i;
    },
    getUuid(e = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz") {
      let t = [];
      for (let r = 0; r < 36; r++)
        t[r] = e.substr(Math.floor(Math.random() * 16), 1);
      return t[14] = "4", t[19] = e.substr(t[19] & 3 | 8, 1), t[8] = t[13] = t[18] = t[23] = "", t.join("");
    },
    isBlank(e) {
      return e == null || e === "";
    },
    findParentComponent(e, t) {
      let n = e.$parent;
      for (; n; )
        if ((n.$options.componentName || n.$options.name) !== t)
          n = n.$parent;
        else
          return n;
      return !1;
    }
  }
};
function S(e, t, n, r, i, o, a, u) {
  var s = typeof e == "function" ? e.options : e;
  t && (s.render = t, s.staticRenderFns = n, s._compiled = !0), r && (s.functional = !0), o && (s._scopeId = "data-v-" + o);
  var c;
  if (a ? (c = function(h) {
    h = h || this.$vnode && this.$vnode.ssrContext || this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext, !h && typeof __VUE_SSR_CONTEXT__ < "u" && (h = __VUE_SSR_CONTEXT__), i && i.call(this, h), h && h._registeredComponents && h._registeredComponents.add(a);
  }, s._ssrRegister = c) : i && (c = u ? function() {
    i.call(
      this,
      (s.functional ? this.parent : this).$root.$options.shadowRoot
    );
  } : i), c)
    if (s.functional) {
      s._injectStyles = c;
      var l = s.render;
      s.render = function(v, g) {
        return c.call(g), l(v, g);
      };
    } else {
      var f = s.beforeCreate;
      s.beforeCreate = f ? [].concat(f, c) : [c];
    }
  return {
    exports: e,
    options: s
  };
}
const qe = {
  name: "DesignerAside",
  mixins: [k],
  data() {
    return {
      showRight: !0,
      menuList: [
        {
          name: "\u7EC4\u4EF6",
          code: "component",
          icon: "ri-pencil-ruler-2-line",
          component: () => import("./PageComponent.035021f4.mjs")
        },
        {
          name: "\u533A\u5757",
          code: "blocks",
          icon: "ri-layout-5-line",
          component: () => import("./PageBlock.c135bd44.mjs")
        },
        {
          name: "\u9875\u9762",
          code: "page",
          icon: "ri-stack-line",
          component: () => import("./PageSetting.20219eae.mjs")
        },
        {
          name: "\u5927\u7EB2",
          code: "toc",
          icon: "ri-pages-line",
          component: () => import("./PageToc.bcc92d32.mjs")
        },
        {
          name: "\u5DE5\u5177",
          code: "tools",
          icon: "ri-magic-line",
          component: () => import("./PageTools.50d478c9.mjs")
        },
        {
          name: "\u5168\u5C40",
          code: "setting",
          icon: "ri-sound-module-line",
          component: () => import("./GlobalSetting.a0e63210.mjs")
        }
      ],
      curActiveComponent: null,
      curActiveComponentCode: ""
    };
  },
  computed: {
    asideStyle() {
      return this.showRight ? "width: 300px" : "width: 65px";
    }
  },
  methods: {
    onMenuSelect(e) {
      this.curActiveComponentCode === this.menuList[e].code ? this.showRight = !this.showRight : this.showRight = !0, this.curActiveComponent = this.menuList[e].component, this.curActiveComponentCode = this.menuList[e].code;
    }
  },
  mounted() {
    this.curActiveComponent = this.menuList[0].component, this.curActiveComponentCode = this.menuList[0].code;
  }
};
var te = function() {
  var t = this, n = t._self._c;
  return n("section", { staticClass: "roy-designer-aside__main", style: t.asideStyle }, [n("el-menu", { staticClass: "roy-designer-aside__menu", attrs: { collapse: !0, "default-active": "0" }, on: { select: t.onMenuSelect } }, t._l(t.menuList, function(r, i) {
    return n("el-menu-item", { key: r.code, attrs: { index: `${i}` } }, [n("div", { staticClass: "roy-designer-aside__menu__icon" }, [n("i", { class: r.icon }), n("span", [t._v(t._s(r.name))])])]);
  }), 1), n("keep-alive", [n(t.curActiveComponent, { directives: [{ name: "show", rawName: "v-show", value: t.showRight, expression: "showRight" }], key: t.curActiveComponentCode, tag: "component", staticClass: "roy-designer-aside__right_panel" })], 1)], 1);
}, Ze = [];
te._withStripped = !0;
var ee = /* @__PURE__ */ S(
  qe,
  te,
  Ze,
  !1,
  null,
  null,
  null,
  null
);
ee.options.__file = "D:/Study/\u4E2A\u4EBA\u9879\u76EE/svg-print-template-designer/src/components/home/DesignerAside.vue";
const Qe = ee.exports;
const Ye = {
  name: "ToolBar",
  mixins: [k],
  components: {},
  props: {},
  data() {
    return {
      toolbarLeftConfig: [
        {
          name: "\u64A4\u9500",
          icon: "ri-arrow-go-back-fill",
          event: () => {
            alert("\u64A4\u9500");
          }
        },
        {
          name: "\u6062\u590D",
          icon: "ri-arrow-go-forward-fill",
          event: () => {
          }
        }
      ],
      toolbarRightConfig: [
        {
          name: "\u9884\u89C8",
          icon: "ri-eye-2-fill",
          event: () => {
          }
        },
        {
          name: "\u4FDD\u5B58",
          icon: "ri-save-2-fill",
          event: () => {
          }
        }
      ]
    };
  },
  methods: {
    initMounted() {
    }
  },
  created() {
  },
  mounted() {
    this.initMounted();
  },
  watch: {}
};
var ne = function() {
  var t = this, n = t._self._c;
  return n("el-header", { staticClass: "roy-designer-main__toolbar", attrs: { height: "45px" } }, [n("section", { staticClass: "roy-designer-main__toolbar_left" }, t._l(t.toolbarLeftConfig, function(r, i) {
    return n("el-tooltip", { key: i, attrs: { content: r.name, "open-delay": 600, "visible-arrow": !1, effect: "dark", placement: "bottom" } }, [n("div", { staticClass: "roy-designer-main__toolbar__item", on: { click: r.event } }, [n("i", { class: r.icon })])]);
  }), 1), n("section", { staticClass: "roy-designer-main__toolbar_right" }, t._l(t.toolbarRightConfig, function(r, i) {
    return n("el-tooltip", { key: i, attrs: { content: r.name, "open-delay": 600, "visible-arrow": !1, effect: "dark", placement: "bottom" } }, [n("div", { staticClass: "roy-designer-main__toolbar__item", on: { click: r.event } }, [n("i", { class: r.icon })])]);
  }), 1)]);
}, tn = [];
ne._withStripped = !0;
var re = /* @__PURE__ */ S(
  Ye,
  ne,
  tn,
  !1,
  null,
  null,
  null,
  null
);
re.options.__file = "D:/Study/\u4E2A\u4EBA\u9879\u76EE/svg-print-template-designer/src/components/toolbar/ToolBar.vue";
const en = re.exports;
function Nt(e, t) {
  return function(n) {
    n && (e[t] = n);
  };
}
function nn(e, t) {
  return function(n) {
    var r = n.prototype;
    e.forEach(function(i) {
      t(r, i);
    });
  };
}
var rn = /* @__PURE__ */ function() {
  function e() {
    this.keys = [], this.values = [];
  }
  var t = e.prototype;
  return t.get = function(n) {
    return this.values[this.keys.indexOf(n)];
  }, t.set = function(n, r) {
    var i = this.keys, o = this.values, a = i.indexOf(n), u = a === -1 ? i.length : a;
    i[u] = n, o[u] = r;
  }, e;
}(), on = /* @__PURE__ */ function() {
  function e() {
    this.object = {};
  }
  var t = e.prototype;
  return t.get = function(n) {
    return this.object[n];
  }, t.set = function(n, r) {
    this.object[n] = r;
  }, e;
}(), sn = typeof Map == "function", an = /* @__PURE__ */ function() {
  function e() {
  }
  var t = e.prototype;
  return t.connect = function(n, r) {
    this.prev = n, this.next = r, n && (n.next = this), r && (r.prev = this);
  }, t.disconnect = function() {
    var n = this.prev, r = this.next;
    n && (n.next = r), r && (r.prev = n);
  }, t.getIndex = function() {
    for (var n = this, r = -1; n; )
      n = n.prev, ++r;
    return r;
  }, e;
}();
function un(e, t) {
  var n = [], r = [];
  return e.forEach(function(i) {
    var o = i[0], a = i[1], u = new an();
    n[o] = u, r[a] = u;
  }), n.forEach(function(i, o) {
    i.connect(n[o - 1]);
  }), e.filter(function(i, o) {
    return !t[o];
  }).map(function(i, o) {
    var a = i[0], u = i[1];
    if (a === u)
      return [0, 0];
    var s = n[a], c = r[u - 1], l = s.getIndex();
    s.disconnect(), c ? s.connect(c, c.next) : s.connect(void 0, n[0]);
    var f = s.getIndex();
    return [l, f];
  });
}
var cn = /* @__PURE__ */ function() {
  function e(n, r, i, o, a, u, s, c) {
    this.prevList = n, this.list = r, this.added = i, this.removed = o, this.changed = a, this.maintained = u, this.changedBeforeAdded = s, this.fixed = c;
  }
  var t = e.prototype;
  return Object.defineProperty(t, "ordered", {
    get: function() {
      return this.cacheOrdered || this.caculateOrdered(), this.cacheOrdered;
    },
    enumerable: !0,
    configurable: !0
  }), Object.defineProperty(t, "pureChanged", {
    get: function() {
      return this.cachePureChanged || this.caculateOrdered(), this.cachePureChanged;
    },
    enumerable: !0,
    configurable: !0
  }), t.caculateOrdered = function() {
    var n = un(this.changedBeforeAdded, this.fixed), r = this.changed, i = [];
    this.cacheOrdered = n.filter(function(o, a) {
      var u = o[0], s = o[1], c = r[a], l = c[0], f = c[1];
      if (u !== s)
        return i.push([l, f]), !0;
    }), this.cachePureChanged = i;
  }, e;
}();
function ie(e, t, n) {
  var r = sn ? Map : n ? on : rn, i = n || function(y) {
    return y;
  }, o = [], a = [], u = [], s = e.map(i), c = t.map(i), l = new r(), f = new r(), h = [], v = [], g = {}, T = [], P = 0, O = 0;
  return s.forEach(function(y, m) {
    l.set(y, m);
  }), c.forEach(function(y, m) {
    f.set(y, m);
  }), s.forEach(function(y, m) {
    var p = f.get(y);
    typeof p > "u" ? (++O, a.push(m)) : g[p] = O;
  }), c.forEach(function(y, m) {
    var p = l.get(y);
    typeof p > "u" ? (o.push(m), ++P) : (u.push([p, m]), O = g[m] || 0, h.push([p - O, m - P]), v.push(m === p), p !== m && T.push([p, m]));
  }), a.reverse(), new cn(e, t, o, a, T, u, h, v);
}
var ln = "function", fn = "object", dn = "string", hn = "number", pn = "undefined", et = {
  cm: function(e) {
    return e * 96 / 2.54;
  },
  mm: function(e) {
    return e * 96 / 254;
  },
  in: function(e) {
    return e * 96;
  },
  pt: function(e) {
    return e * 96 / 72;
  },
  pc: function(e) {
    return e * 96 / 6;
  },
  "%": function(e, t) {
    return e * t / 100;
  },
  vw: function(e, t) {
    return t === void 0 && (t = window.innerWidth), e / 100 * t;
  },
  vh: function(e, t) {
    return t === void 0 && (t = window.innerHeight), e / 100 * t;
  },
  vmax: function(e, t) {
    return t === void 0 && (t = Math.max(window.innerWidth, window.innerHeight)), e / 100 * t;
  },
  vmin: function(e, t) {
    return t === void 0 && (t = Math.min(window.innerWidth, window.innerHeight)), e / 100 * t;
  }
};
function vn(e) {
  return typeof e === pn;
}
function mn(e) {
  return e && typeof e === fn;
}
function _n(e) {
  return Array.isArray(e);
}
function W(e) {
  return typeof e === dn;
}
function gn(e) {
  return typeof e === hn;
}
function yn(e) {
  return typeof e === ln;
}
function bn(e) {
  var t = /^([^\d|e|\-|\+]*)((?:\d|\.|-|e-|e\+)+)(\S*)$/g.exec(e);
  if (!t)
    return {
      prefix: "",
      unit: "",
      value: NaN
    };
  var n = t[1], r = t[2], i = t[3];
  return {
    prefix: n,
    unit: i,
    value: parseFloat(r)
  };
}
function mt(e, t) {
  return t === void 0 && (t = "-"), e.replace(/([a-z])([A-Z])/g, function(n, r, i) {
    return "" + r + t + i.toLowerCase();
  });
}
function _t(e, t) {
  var n = bn(e), r = n.value, i = n.unit;
  if (mn(t)) {
    var o = t[i];
    if (o) {
      if (yn(o))
        return o(r);
      if (et[i])
        return et[i](r, o);
    }
  } else if (i === "%")
    return r * t / 100;
  return et[i] ? et[i](r) : r;
}
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var yt = function(e, t) {
  return yt = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function(n, r) {
    n.__proto__ = r;
  } || function(n, r) {
    for (var i in r)
      r.hasOwnProperty(i) && (n[i] = r[i]);
  }, yt(e, t);
};
function D(e, t) {
  yt(e, t);
  function n() {
    this.constructor = e;
  }
  e.prototype = t === null ? Object.create(t) : (n.prototype = t.prototype, new n());
}
var $ = function() {
  return $ = Object.assign || function(t) {
    for (var n, r = 1, i = arguments.length; r < i; r++) {
      n = arguments[r];
      for (var o in n)
        Object.prototype.hasOwnProperty.call(n, o) && (t[o] = n[o]);
    }
    return t;
  }, $.apply(this, arguments);
};
function oe(e, t) {
  var n = {};
  for (var r in e)
    Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++)
      t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
  return n;
}
function wn() {
  for (var e = 0, t = 0, n = arguments.length; t < n; t++)
    e += arguments[t].length;
  for (var r = Array(e), i = 0, t = 0; t < n; t++)
    for (var o = arguments[t], a = 0, u = o.length; a < u; a++, i++)
      r[i] = o[a];
  return r;
}
function bt(e, t) {
  if (e === t)
    return !1;
  for (var n in e)
    if (!(n in t))
      return !0;
  for (var n in t)
    if (e[n] !== t[n])
      return !0;
  return !1;
}
function Mt(e, t) {
  var n = Object.keys(e), r = Object.keys(t), i = ie(n, r, function(s) {
    return s;
  }), o = {}, a = {}, u = {};
  return i.added.forEach(function(s) {
    var c = r[s];
    o[c] = t[c];
  }), i.removed.forEach(function(s) {
    var c = n[s];
    a[c] = e[c];
  }), i.maintained.forEach(function(s) {
    var c = s[0], l = n[c], f = [e[l], t[l]];
    e[l] !== t[l] && (u[l] = f);
  }), {
    added: o,
    removed: a,
    changed: u
  };
}
function se(e) {
  e.forEach(function(t) {
    t();
  });
}
function zt(e) {
  var t = 0;
  return e.map(function(n) {
    return n == null ? "$compat" + ++t : "" + n;
  });
}
function Gt(e, t, n, r) {
  if (W(e) || gn(e))
    return new On("text_" + e, t, n, r, null, {});
  var i = typeof e.type == "string" ? Nn : e.type.prototype.render ? $n : Mn;
  return new i(e.type, t, n, r, e.ref, e.props);
}
function ae(e) {
  var t = [];
  return e.forEach(function(n) {
    t = t.concat(_n(n) ? ae(n) : n);
  }), t;
}
function Ht(e) {
  var t = e.className, n = oe(e, ["className"]);
  return t != null && (n.class = t), delete n.style, delete n.children, n;
}
function gt(e, t) {
  if (!t)
    return e;
  for (var n in t)
    vn(e[n]) && (e[n] = t[n]);
  return e;
}
function st(e, t) {
  for (var n = [], r = 2; r < arguments.length; r++)
    n[r - 2] = arguments[r];
  var i = t || {}, o = i.key, a = i.ref, u = oe(i, ["key", "ref"]);
  return {
    type: e,
    key: o,
    ref: a,
    props: $($({}, u), {
      children: ae(n).filter(function(s) {
        return s != null && s !== !1;
      })
    })
  };
}
var K = /* @__PURE__ */ function() {
  function e(n, r, i, o, a, u) {
    u === void 0 && (u = {}), this.type = n, this.key = r, this.index = i, this.container = o, this.ref = a, this.props = u, this._providers = [];
  }
  var t = e.prototype;
  return t._should = function(n, r) {
    return !0;
  }, t._update = function(n, r, i, o) {
    if (this.base && !W(r) && !o && !this._should(r.props, i))
      return !1;
    this.original = r, this._setState(i);
    var a = this.props;
    return W(r) || (this.props = r.props, this.ref = r.ref), this._render(n, this.base ? a : {}, i), !0;
  }, t._mounted = function() {
    var n = this.ref;
    n && n(this.base);
  }, t._setState = function(n) {
  }, t._updated = function() {
    var n = this.ref;
    n && n(this.base);
  }, t._destroy = function() {
    var n = this.ref;
    n && n(null);
  }, e;
}();
function Cn(e, t, n) {
  var r = Mt(e, t), i = r.added, o = r.removed, a = r.changed;
  for (var u in i)
    n.setAttribute(u, i[u]);
  for (var u in a)
    n.setAttribute(u, a[u][1]);
  for (var u in o)
    n.removeAttribute(u);
}
function En(e, t, n) {
  var r = Mt(e, t), i = r.added, o = r.removed, a = r.changed;
  for (var u in o)
    n.removeEventListener(u);
  for (var u in i)
    n.addEventListener(u, i[u]);
  for (var u in a)
    n.removeEventListener(u), n.addEventListener(u, a[u][1]);
  for (var u in o)
    n.removeEventListener(u);
}
function xn(e, t, n) {
  var r = n.style, i = Mt(e, t), o = i.added, a = i.removed, u = i.changed;
  for (var s in o) {
    var c = mt(s, "-");
    r.setProperty ? r.setProperty(c, o[s]) : r[c] = o[s];
  }
  for (var s in u) {
    var c = mt(s, "-");
    r.setProperty ? r.setProperty(c, u[s][1]) : r[c] = u[s][1];
  }
  for (var s in a) {
    var c = mt(s, "-");
    r.removeProperty ? r.removeProperty(c) : r[c] = "";
  }
}
function Ft(e) {
  var t = {}, n = {};
  for (var r in e)
    r.indexOf("on") === 0 ? n[r.replace("on", "").toLowerCase()] = e[r] : t[r] = e[r];
  return {
    attributes: t,
    events: n
  };
}
var On = /* @__PURE__ */ function(e) {
  D(t, e);
  function t() {
    return e !== null && e.apply(this, arguments) || this;
  }
  var n = t.prototype;
  return n._render = function(r) {
    var i = this, o = !this.base;
    return o && (this.base = document.createTextNode(this.type.replace("text_", ""))), r.push(function() {
      o ? i._mounted() : i._updated();
    }), !0;
  }, n._unmount = function() {
    this.base.parentNode.removeChild(this.base);
  }, t;
}(K), Nn = /* @__PURE__ */ function(e) {
  D(t, e);
  function t() {
    var r = e !== null && e.apply(this, arguments) || this;
    return r.events = {}, r._isSVG = !1, r;
  }
  var n = t.prototype;
  return n.addEventListener = function(r, i) {
    var o = this.events;
    o[r] = function(a) {
      a.nativeEvent = a, i(a);
    }, this.base.addEventListener(r, o[r]);
  }, n.removeEventListener = function(r) {
    var i = this.events;
    this.base.removeEventListener(r, i[r]), delete i[r];
  }, n._should = function(r) {
    return bt(this.props, r);
  }, n._render = function(r, i) {
    var o = this, a = !this.base;
    if (a) {
      var u = this._hasSVG();
      this._isSVG = u;
      var s = this.props.portalContainer;
      if (!s) {
        var c = this.type;
        u ? s = document.createElementNS("http://www.w3.org/2000/svg", c) : s = document.createElement(c);
      }
      this.base = s;
    }
    X(this, this._providers, this.props.children, r, null);
    var l = this.base, f = Ft(i), h = f.attributes, v = f.events, g = Ft(this.props), T = g.attributes, P = g.events;
    return Cn(Ht(h), Ht(T), l), En(v, P, this), xn(i.style || {}, this.props.style || {}, l), r.push(function() {
      a ? o._mounted() : o._updated();
    }), !0;
  }, n._unmount = function() {
    var r = this.events, i = this.base;
    for (var o in r)
      i.removeEventListener(o, r[o]);
    this._providers.forEach(function(a) {
      a._unmount();
    }), this.events = {}, this.props.portalContainer || i.parentNode.removeChild(i);
  }, n._hasSVG = function() {
    if (this._isSVG || this.type === "svg")
      return !0;
    var r = $t(this.container);
    return r && "ownerSVGElement" in r;
  }, t;
}(K);
function $t(e) {
  if (!e)
    return null;
  var t = e.base;
  return t instanceof Node ? t : $t(e.container);
}
function J(e) {
  if (!e)
    return null;
  if (e instanceof Node)
    return e;
  var t = e.$_provider._providers;
  return t.length ? J(t[0].base) : null;
}
var Mn = /* @__PURE__ */ function(e) {
  D(t, e);
  function t() {
    return e !== null && e.apply(this, arguments) || this;
  }
  var n = t.prototype;
  return n._render = function(r) {
    var i = this.type(this.props);
    return X(this, this._providers, i ? [i] : [], r), !0;
  }, n._unmount = function() {
    this._providers.forEach(function(r) {
      r._unmount();
    });
  }, t;
}(K), ue = /* @__PURE__ */ function(e) {
  D(t, e);
  function t(r) {
    var i = e.call(this, "container", "container", 0, null) || this;
    return i.base = r, i;
  }
  var n = t.prototype;
  return n._render = function() {
    return !0;
  }, n._unmount = function() {
  }, t;
}(K), $n = /* @__PURE__ */ function(e) {
  D(t, e);
  function t(r, i, o, a, u, s) {
    return s === void 0 && (s = {}), e.call(this, r, i, o, a, u, gt(s, r.defaultProps)) || this;
  }
  var n = t.prototype;
  return n._should = function(r, i) {
    return this.base.shouldComponentUpdate(gt(r, this.type.defaultProps), i || this.base.state);
  }, n._render = function(r, i) {
    var o = this;
    this.props = gt(this.props, this.type.defaultProps);
    var a = !this.base;
    a ? (this.base = new this.type(this.props), this.base.$_provider = this) : this.base.props = this.props;
    var u = this.base, s = u.state, c = u.render();
    c && c.props && !c.props.children.length && (c.props.children = this.props.children), X(this, this._providers, c ? [c] : [], r), r.push(function() {
      a ? (o._mounted(), u.componentDidMount()) : (o._updated(), u.componentDidUpdate(i, s));
    });
  }, n._setState = function(r) {
    var i = this.base;
    !i || !r || (i.state = r);
  }, n._unmount = function() {
    this._providers.forEach(function(r) {
      r._unmount();
    }), clearTimeout(this.base.$_timer), this.base.componentWillUnmount();
  }, t;
}(K), ce = /* @__PURE__ */ function() {
  function e(n) {
    n === void 0 && (n = {}), this.props = n, this.state = {}, this.$_timer = 0, this.$_state = {};
  }
  var t = e.prototype;
  return t.shouldComponentUpdate = function(n, r) {
    return !0;
  }, t.render = function() {
    return null;
  }, t.setState = function(n, r, i) {
    var o = this;
    this.$_timer || (this.$_state = {}), clearTimeout(this.$_timer), this.$_timer = 0, this.$_state = $($({}, this.$_state), n), i ? this.$_setState(r, i) : this.$_timer = setTimeout(function() {
      o.$_timer = 0, o.$_setState(r, i);
    });
  }, t.forceUpdate = function(n) {
    this.setState({}, n, !0);
  }, t.componentDidMount = function() {
  }, t.componentDidUpdate = function(n, r) {
  }, t.componentWillUnmount = function() {
  }, t.$_setState = function(n, r) {
    var i = [], o = this.$_provider, a = X(o.container, [o], [o.original], i, $($({}, this.state), this.$_state), r);
    a && (n && i.push(n), se(i));
  }, e;
}(), le = /* @__PURE__ */ function(e) {
  D(t, e);
  function t() {
    return e !== null && e.apply(this, arguments) || this;
  }
  var n = t.prototype;
  return n.shouldComponentUpdate = function(r, i) {
    return bt(this.props, r) || bt(this.state, i);
  }, t;
}(ce), Sn = /* @__PURE__ */ function(e) {
  D(t, e);
  function t() {
    return e !== null && e.apply(this, arguments) || this;
  }
  var n = t.prototype;
  return n.componentDidMount = function() {
    var r = this.props, i = r.element, o = r.container;
    this._portalProvider = new ue(o), nt(i, o, this._portalProvider);
  }, n.componentDidUpdate = function() {
    var r = this.props, i = r.element, o = r.container;
    nt(i, o, this._portalProvider);
  }, n.componentWillUnmount = function() {
    var r = this.props.container;
    nt(null, r, this._portalProvider), this._portalProvider = null;
  }, t;
}(le);
function Pn(e, t, n) {
  var r = [];
  X(e, e._providers, t, r, n), se(r);
}
function Rn(e, t) {
  for (var n = e._providers, r = n.length, i = t.index + 1; i < r; ++i) {
    var o = J(n[i].base);
    if (o)
      return o;
  }
  return null;
}
function An(e, t, n) {
  var r = n.map(function(s) {
    return W(s) ? null : s.key;
  }), i = zt(t.map(function(s) {
    return s.key;
  })), o = zt(r), a = ie(i, o, function(s) {
    return s;
  });
  a.removed.forEach(function(s) {
    t.splice(s, 1)[0]._unmount();
  }), a.ordered.forEach(function(s) {
    var c = s[0], l = s[1], f = t.splice(c, 1)[0];
    t.splice(l, 0, f);
    var h = J(f.base), v = J(t[l + 1] && t[l + 1].base);
    h && h.parentNode.insertBefore(h, v);
  }), a.added.forEach(function(s) {
    t.splice(s, 0, Gt(n[s], r[s], s, e));
  });
  var u = a.maintained.filter(function(s) {
    s[0];
    var c = s[1], l = n[c], f = t[c], h = W(l) ? "text_" + l : l.type;
    return h !== f.type ? (f._unmount(), t.splice(c, 1, Gt(l, r[c], c, e)), !0) : (f.index = c, !1);
  });
  return wn(a.added, u.map(function(s) {
    s[0];
    var c = s[1];
    return c;
  }));
}
function X(e, t, n, r, i, o) {
  var a = An(e, t, n), u = t.filter(function(c, l) {
    return c._update(r, n[l], i, o);
  }), s = $t(e);
  return s && a.reverse().forEach(function(c) {
    var l = t[c], f = J(l.base);
    if (!!f && s !== f && !f.parentNode) {
      var h = Rn(e, l);
      s.insertBefore(f, h);
    }
  }), u.length > 0;
}
function nt(e, t, n) {
  n === void 0 && (n = t.__REACT_COMPAT__);
  var r = !!n;
  return n || (n = new ue(t)), Pn(n, e ? [e] : []), r || (t.__REACT_COMPAT__ = n), n;
}
function Wt(e, t, n) {
  var r = t.__REACT_COMPAT__;
  e && !r && (t.innerHTML = ""), nt(e, t, r), n && n();
}
function kn(e, t) {
  return st(Sn, {
    element: e,
    container: t
  });
}
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var wt = function(e, t) {
  return wt = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function(n, r) {
    n.__proto__ = r;
  } || function(n, r) {
    for (var i in r)
      r.hasOwnProperty(i) && (n[i] = r[i]);
  }, wt(e, t);
};
function Dn(e, t) {
  wt(e, t);
  function n() {
    this.constructor = e;
  }
  e.prototype = t === null ? Object.create(t) : (n.prototype = t.prototype, new n());
}
var Tn = /* @__PURE__ */ function(e) {
  Dn(t, e);
  function t() {
    var r = e !== null && e.apply(this, arguments) || this;
    return r.state = {
      scrollPos: 0
    }, r.width = 0, r.height = 0, r;
  }
  var n = t.prototype;
  return n.render = function() {
    return st("canvas", {
      ref: Nt(this, "canvasElement"),
      style: this.props.style
    });
  }, n.componentDidMount = function() {
    var r = this.canvasElement, i = r.getContext("2d");
    this.canvasContext = i, this.resize();
  }, n.componentDidUpdate = function() {
    this.resize();
  }, n.scroll = function(r) {
    this.draw(r);
  }, n.resize = function() {
    var r = this.canvasElement, i = this.props, o = i.width, a = i.height, u = i.scrollPos;
    this.width = o || r.offsetWidth, this.height = a || r.offsetHeight, r.width = this.width * 2, r.height = this.height * 2, this.draw(u);
  }, n.draw = function(r) {
    r === void 0 && (r = this.state.scrollPos);
    var i = this.props, o = i, a = o.unit, u = o.zoom, s = o.type, c = o.backgroundColor, l = o.lineColor, f = o.textColor, h = o.textBackgroundColor, v = o.direction, g = o.negativeRuler, T = g === void 0 ? !0 : g, P = o.segment, O = P === void 0 ? 10 : P, y = o.textFormat, m = o.range, p = m === void 0 ? [-1 / 0, 1 / 0] : m, Pt = o.rangeBackgroundColor, U = this.width, z = this.height, xe = this.state;
    xe.scrollPos = r;
    var d = this.canvasContext, x = s === "horizontal", Rt = T !== !1, Oe = i.font || "10px sans-serif", at = i.textAlign || "left", L = i.textOffset || [0, 0], ut = x ? z : U, ct = _t("" + (i.mainLineSize || "100%"), ut), Ne = _t("" + (i.longLineSize || 10), ut), Me = _t("" + (i.shortLineSize || 7), ut), N = i.lineOffset || [0, 0];
    switch (c === "transparent" ? d.clearRect(0, 0, U * 2, z * 2) : (d.rect(0, 0, U * 2, z * 2), d.fillStyle = c, d.fill()), d.save(), d.scale(2, 2), d.strokeStyle = l, d.lineWidth = 1, d.font = Oe, d.fillStyle = f, v) {
      case "start":
        d.textBaseline = "top";
        break;
      case "center":
        d.textBaseline = "middle";
        break;
      case "end":
        d.textBaseline = "bottom";
        break;
    }
    d.translate(0.5, 0), d.beginPath();
    var lt = x ? U : z, q = u * a, ft = Math.floor(r * u / q), $e = Math.ceil((r * u + lt) / q), At = $e - ft, kt = Math.max(["left", "center", "right"].indexOf(at) - 1, -1), V = x ? z : U;
    if (Pt !== "transparent" && p[0] !== -1 / 0 && p[1] !== 1 / 0) {
      var Dt = (p[0] - r) * u, Tt = (p[1] - p[0]) * u;
      d.save(), d.fillStyle = Pt, x ? d.fillRect(Dt, 0, Tt, V) : d.fillRect(0, Dt, V, Tt), d.restore();
    }
    for (var R = 0; R <= At; ++R) {
      var G = R + ft;
      if (!(!Rt && G < 0))
        for (var M = G * a, j = (M - r) * u, I = 0; I < O; ++I) {
          var Z = j + I / O * q, Lt = M + I / O * a;
          if (!(Z < 0 || Z >= lt || Lt < p[0] || Lt > p[1])) {
            var Q = I === 0 ? ct : I % 2 === 0 ? Ne : Me, b = 0;
            switch (v) {
              case "start":
                b = 0;
                break;
              case "center":
                b = V / 2 - Q / 2;
                break;
              case "end":
                b = V - Q;
                break;
            }
            var Vt = x ? [Z + N[0], b + N[1]] : [b + N[0], Z + N[1]], dt = Vt[0], ht = Vt[1], jt = x ? [dt, ht + Q] : [dt + Q, ht], Se = jt[0], Pe = jt[1];
            d.moveTo(dt + N[0], ht + N[1]), d.lineTo(Se + N[0], Pe + N[1]);
          }
        }
    }
    d.stroke();
    for (var R = 0; R <= At; ++R) {
      var G = R + ft;
      if (!(!Rt && G < 0)) {
        var M = G * a, j = (M - r) * u;
        if (!(j < -q || j >= lt + a * u || M < p[0] || M > p[1])) {
          var b = 0;
          switch (v) {
            case "start":
              b = 17;
              break;
            case "center":
              b = V / 2;
              break;
            case "end":
              b = V - 17;
              break;
          }
          var It = x ? [j + kt * -3, b] : [b, j + kt * 3], pt = It[0], vt = It[1], Y = "" + M;
          y && (Y = y(M)), d.textAlign = at;
          var H = 0, tt = d.measureText(Y).width;
          switch (at) {
            case "left":
              H = 0;
              break;
            case "center":
              H = -tt / 2;
              break;
            case "right":
              H = -tt;
              break;
          }
          x ? (d.save(), d.fillStyle = h, d.fillRect(pt + L[0] + H, 0, tt, ct), d.restore()) : (d.save(), d.translate(0, vt + L[1]), d.rotate(-Math.PI / 2), d.fillStyle = h, d.fillRect(H, 0, tt, ct), d.restore()), x ? d.fillText(Y, pt + L[0], vt + L[1]) : (d.save(), d.translate(pt + L[0], vt + L[1]), d.rotate(-Math.PI / 2), d.fillText(Y, 0, 0), d.restore());
        }
      }
    }
    d.restore();
  }, t.defaultProps = {
    type: "horizontal",
    zoom: 1,
    width: 0,
    height: 0,
    unit: 50,
    negativeRuler: !0,
    mainLineSize: "100%",
    longLineSize: 10,
    shortLineSize: 7,
    segment: 10,
    direction: "end",
    style: {
      width: "100%",
      height: "100%"
    },
    backgroundColor: "#333333",
    font: "10px sans-serif",
    textColor: "#ffffff",
    textBackgroundColor: "transparent",
    lineColor: "#777777",
    range: [-1 / 0, 1 / 0],
    rangeBackgroundColor: "transparent"
  }, t;
}(le), Ln = ["type", "width", "height", "unit", "zoom", "direction", "textAlign", "font", "segment", "mainLineSize", "longLineSize", "shortLineSize", "lineOffset", "textOffset", "negativeRuler", "range", "scrollPos", "style", "backgroundColor", "rangeBackgroundColor", "lineColor", "textColor", "textBackgroundColor", "textFormat"];
const Vn = Tn;
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var Ct = function(e, t) {
  return Ct = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, r) {
    n.__proto__ = r;
  } || function(n, r) {
    for (var i in r)
      r.hasOwnProperty(i) && (n[i] = r[i]);
  }, Ct(e, t);
};
function jn(e, t) {
  Ct(e, t);
  function n() {
    this.constructor = e;
  }
  e.prototype = t === null ? Object.create(t) : (n.prototype = t.prototype, new n());
}
var it = function() {
  return it = Object.assign || function(t) {
    for (var n, r = 1, i = arguments.length; r < i; r++) {
      n = arguments[r];
      for (var o in n)
        Object.prototype.hasOwnProperty.call(n, o) && (t[o] = n[o]);
    }
    return t;
  }, it.apply(this, arguments);
};
function In(e, t) {
  var n = {};
  for (var r in e)
    Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++)
      t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
  return n;
}
function Bn(e, t, n, r) {
  var i = arguments.length, o = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, a;
  if (typeof Reflect == "object" && typeof Reflect.decorate == "function")
    o = Reflect.decorate(e, t, n, r);
  else
    for (var u = e.length - 1; u >= 0; u--)
      (a = e[u]) && (o = (i < 3 ? a(o) : i > 3 ? a(t, n, o) : a(t, n)) || o);
  return i > 3 && o && Object.defineProperty(t, n, o), o;
}
var Un = Ln, zn = /* @__PURE__ */ function(e) {
  jn(t, e);
  function t(r) {
    var i = e.call(this, r) || this;
    return i.state = {}, i.state = i.props, i;
  }
  var n = t.prototype;
  return n.render = function() {
    var r = this.state, i = r.parentElement, o = In(r, ["parentElement"]);
    return kn(st(Vn, it({
      ref: Nt(this, "ruler")
    }, o)), i);
  }, t;
}(ce), Gn = /* @__PURE__ */ function() {
  function e(n, r) {
    r === void 0 && (r = {}), this.tempElement = document.createElement("div"), Wt(st(zn, it({
      ref: Nt(this, "innerRuler")
    }, r, {
      parentElement: n
    })), this.tempElement);
  }
  var t = e.prototype;
  return t.scroll = function(n) {
    this.getRuler().scroll(n);
  }, t.resize = function() {
    this.getRuler().resize();
  }, t.destroy = function() {
    Wt(null, this.tempElement), this.tempElement = null, this.innerRuler = null;
  }, t.getRuler = function() {
    return this.innerRuler.ruler;
  }, e = Bn([nn(Un, function(n, r) {
    Object.defineProperty(n, r, {
      get: function() {
        return this.getRuler().props[r];
      },
      set: function(i) {
        var o;
        this.innerRuler.setState((o = {}, o[r] = i, o));
      },
      enumerable: !0,
      configurable: !0
    });
  })], e), e;
}();
const fe = Gn, Hn = {
  name: "RulerHorizontal",
  mixins: [k],
  components: {},
  props: {
    scale: {
      type: Number
    },
    scroll: {
      type: Number
    }
  },
  data() {
    return {
      ruler: null
    };
  },
  computed: {
    isNightMode() {
      return this.$store.state.printTemplateModule.nightMode.isNightMode;
    }
  },
  methods: {
    initMounted() {
      let e = document.getElementsByClassName("roy-ruler-outer-box");
      e.length && (this.ruler = new fe(this.$refs.rulerDiv, {
        type: "horizontal",
        backgroundColor: window.getComputedStyle(e[0]).backgroundColor,
        textColor: window.getComputedStyle(e[0]).color,
        height: 16,
        unit: 1,
        zoom: 50
      }));
    }
  },
  created() {
  },
  mounted() {
    this.initMounted();
  },
  watch: {
    isNightMode() {
      let e = document.getElementsByClassName("roy-ruler-outer-box");
      e.length && (this.ruler.backgroundColor = window.getComputedStyle(
        e[0]
      ).backgroundColor, this.ruler.textColor = window.getComputedStyle(e[0]).color);
    }
  }
};
var de = function() {
  var t = this, n = t._self._c;
  return n("div", { ref: "rulerDiv", staticClass: "roy-ruler" });
}, Fn = [];
de._withStripped = !0;
var he = /* @__PURE__ */ S(
  Hn,
  de,
  Fn,
  !1,
  null,
  null,
  null,
  null
);
he.options.__file = "D:/Study/\u4E2A\u4EBA\u9879\u76EE/svg-print-template-designer/src/components/ruler/RulerHorizontal.vue";
const Wn = he.exports, Jn = {
  name: "RulerHorizontal",
  mixins: [k],
  components: {},
  props: {
    scale: {
      type: Number
    },
    scroll: {
      type: Number
    }
  },
  data() {
    return {
      ruler: null
    };
  },
  computed: {
    isNightMode() {
      return this.$store.state.printTemplateModule.nightMode.isNightMode;
    }
  },
  methods: {
    initMounted() {
      let e = document.getElementsByClassName("roy-ruler-outer-box");
      e.length && (this.ruler = new fe(this.$refs.rulerDiv, {
        type: "vertical",
        backgroundColor: window.getComputedStyle(e[0]).backgroundColor,
        textColor: window.getComputedStyle(e[0]).color,
        width: 16,
        unit: 1,
        zoom: 50
      }));
    }
  },
  created() {
  },
  mounted() {
    this.initMounted();
  },
  watch: {
    isNightMode() {
      let e = document.getElementsByClassName("roy-ruler-outer-box");
      e.length && (this.ruler.backgroundColor = window.getComputedStyle(
        e[0]
      ).backgroundColor, this.ruler.textColor = window.getComputedStyle(e[0]).color);
    }
  }
};
var pe = function() {
  var t = this, n = t._self._c;
  return n("div", { ref: "rulerDiv", staticClass: "roy-ruler" });
}, Kn = [];
pe._withStripped = !0;
var ve = /* @__PURE__ */ S(
  Jn,
  pe,
  Kn,
  !1,
  null,
  null,
  null,
  null
);
ve.options.__file = "D:/Study/\u4E2A\u4EBA\u9879\u76EE/svg-print-template-designer/src/components/ruler/RulerVertical.vue";
const Xn = ve.exports;
const qn = {
  name: "RoyRuler",
  mixins: [k],
  components: {
    RulerHorizontal: Wn,
    RulerVertical: Xn
  },
  props: {},
  data() {
    return {};
  },
  methods: {
    initMounted() {
    }
  },
  created() {
  },
  mounted() {
    this.initMounted();
  },
  watch: {}
};
var me = function() {
  var t = this, n = t._self._c;
  return n("div", { staticClass: "roy-ruler-box" }, [n("div", { staticClass: "roy-ruler-outer-box" }), n("div", { staticClass: "roy-ruler-horizontal-wrapper" }, [n("RulerHorizontal")], 1), n("div", { staticClass: "roy-ruler-vertical-wrapper" }, [n("RulerVertical")], 1), n("div", { staticClass: "roy-ruler-inner-box" }, [n("div", { staticClass: "roy-ruler-inner-box-content" }, [t._t("default")], 2)])]);
}, Zn = [];
me._withStripped = !0;
var _e = /* @__PURE__ */ S(
  qn,
  me,
  Zn,
  !1,
  null,
  null,
  null,
  null
);
_e.options.__file = "D:/Study/\u4E2A\u4EBA\u9879\u76EE/svg-print-template-designer/src/components/ruler/Ruler.vue";
const Qn = _e.exports;
const Yn = {
  name: "RoyEditor",
  mixins: [k],
  components: {
    Ruler: Qn
  },
  props: {},
  data() {
    return {};
  },
  methods: {
    initMounted() {
    }
  },
  created() {
  },
  mounted() {
    this.initMounted();
  },
  watch: {}
};
var ge = function() {
  var t = this, n = t._self._c;
  return n("el-main", { staticClass: "roy-designer-main__page" }, [n("Ruler", [n("div", { attrs: { id: "designer-page" } }, [n("div", [t._v("\u6D4B\u8BD5\u9875\u9762")])])])], 1);
}, tr = [];
ge._withStripped = !0;
var ye = /* @__PURE__ */ S(
  Yn,
  ge,
  tr,
  !1,
  null,
  null,
  null,
  null
);
ye.options.__file = "D:/Study/\u4E2A\u4EBA\u9879\u76EE/svg-print-template-designer/src/components/editor/Editor.vue";
const er = ye.exports, nr = {
  name: "DesignerMain",
  mixins: [k],
  components: {
    ToolBar: en,
    Editor: er
  },
  props: {},
  data() {
    return {};
  },
  methods: {
    initMounted() {
    }
  },
  created() {
  },
  mounted() {
    this.initMounted();
  },
  watch: {}
};
var be = function() {
  var t = this, n = t._self._c;
  return n("section", { staticClass: "height-all" }, [n("ToolBar"), n("Editor")], 1);
}, rr = [];
be._withStripped = !0;
var we = /* @__PURE__ */ S(
  nr,
  be,
  rr,
  !1,
  null,
  null,
  null,
  null
);
we.options.__file = "D:/Study/\u4E2A\u4EBA\u9879\u76EE/svg-print-template-designer/src/components/home/DesignerMain.vue";
const ir = we.exports;
const or = {
  name: "RoyPrintDesigner",
  components: {
    DesignerAside: Qe,
    DesignerMain: ir
  },
  props: {},
  data() {
    return {};
  },
  computed: {
    isNightMode() {
      return this.$store.state.printTemplateModule.nightMode.isNightMode;
    }
  },
  methods: {
    ...We({
      initNightMode: "printTemplateModule/nightMode/initNightMode",
      toggleNightMode: "printTemplateModule/nightMode/toggleNightMode"
    }),
    initMounted() {
      this.initConfig();
    },
    initConfig() {
      this.initNightMode();
    },
    dayNightChange() {
      console.log(!this.isNightMode), this.toggleNightMode(!this.isNightMode);
    },
    enterFullScreen() {
    }
  },
  created() {
  },
  mounted() {
    this.initMounted();
  },
  watch: {}
};
var Ce = function() {
  var t = this, n = t._self._c;
  return n("el-container", { staticClass: "roy-designer-container", attrs: { id: "roy-print-template-designer", theme: "day" } }, [n("el-header", { staticClass: "roy-designer-header", attrs: { height: "40px" } }, [n("div", { staticClass: "roy-designer-header__text" }, [n("i", { staticClass: "ri-pen-nib-line" }), n("span", [t._v("\u6253\u5370\u6A21\u677F\u8BBE\u8BA1\u5668")])]), n("div", { staticClass: "roy-night-mode" }, [n("transition-group", { attrs: { name: "roy-fade", tag: "span" } }, [t.isNightMode ? n("i", { key: 1, staticClass: "ri-haze-fill", on: { click: t.dayNightChange } }) : n("i", { key: 2, staticClass: "ri-moon-foggy-fill", on: { click: t.dayNightChange } })])], 1)]), n("el-container", { staticStyle: { height: "calc(100% - 40px)" } }, [n("el-aside", { staticClass: "roy-designer-aside", attrs: { width: "auto" } }, [n("DesignerAside")], 1), n("el-main", { staticClass: "roy-designer-main" }, [n("DesignerMain")], 1)], 1)], 1);
}, sr = [];
Ce._withStripped = !0;
var Ee = /* @__PURE__ */ S(
  or,
  Ce,
  sr,
  !1,
  null,
  null,
  null,
  null
);
Ee.options.__file = "D:/Study/\u4E2A\u4EBA\u9879\u76EE/svg-print-template-designer/src/components/home/Home.vue";
const ar = Ee.exports;
const ur = {}, cr = {}, lr = {}, fr = {}, dr = {
  STORAGE_PREFIX: "_ROY_DESIGNER_"
}, { STORAGE_PREFIX: Jt } = dr, hr = {
  namespaced: !0,
  state: () => ({
    isNightMode: !1
  }),
  mutations: {
    setIsNightMode(e, t) {
      e.isNightMode = t.isNightMode;
    }
  },
  actions: {
    toggleNightMode({ commit: e }, t) {
      console.log(t), window.localStorage.setItem(
        `${Jt}NIGHT_MODE`,
        JSON.stringify(t)
      ), document.getElementById("roy-print-template-designer").setAttribute("theme", t ? "dark" : "day"), e("setIsNightMode", {
        isNightMode: t
      });
    },
    async initNightMode({ dispatch: e }) {
      const t = window.localStorage.getItem(
        `${Jt}NIGHT_MODE`
      );
      t !== null && await e("toggleNightMode", JSON.parse(t));
    }
  }
}, pr = {
  namespaced: !0,
  state: ur,
  mutations: lr,
  actions: fr,
  getters: cr,
  modules: {
    nightMode: hr
  }
}, Kt = {
  PtdDesigner: ar
}, St = function(e, t = {}) {
  if (!St.installed) {
    if (!t.store) {
      console.warn("[print-template-designer] \u8BF7\u63D0\u4F9Bstore\uFF01");
      return;
    }
    t.store.registerModule(["printTemplateModule"], pr), Object.keys(Kt).forEach((n) => {
      e.component(n, Kt[n]);
    });
  }
}, vr = {
  version: "ROY-PRINT-DESIGNER@0.0.6",
  install: St
};
typeof window < "u" && window.Vue && St(window.Vue);
export {
  vr as A,
  k as c,
  S as n
};
