Array.prototype.at || (Array.prototype.at = function (t) {
  let e = this.length;
  if ((t |= 0) < 0 && (t += e), !(t < 0 || t >= e)) return this[t]
}),
  /*!Sea.js 2.2.3|https://github.com/seajs/seajs/blob/master/LICENSE.md*/
  (t => {
    if (!t.s) {
      let r = t.s = {};
      let i, s = 0,
        d = /[^?#]*\//,
        l = /\/\.\//g,
        o = /\/[^/]+\/\.\.\//,
        a = /([^:/])\/\//g,
        n = t => t.match(d)[0],
        h = (t, e) => t.hasOwnProperty(e),
        c = t => {
          for (t = t.replace(l, "/"); t.match(o);) t = t.replace(o, "/");
          return t = t.replace(a, "$1/")
        },
        p = /^\/\/.|:\//,
        u = /^.*?\/\/.*?\//,
        f = (t, e) => {
          let r;
          let i = (t += ".js")[0];
          if (p.test(t)) r = t;
          else if ("." === i) r = c((e ? n(e) : b) + t);
          else if ("/" === i) {
            let e = b.match(u);
            r = e ? e[0] + t.substring(1) : t
          } else r = y + t;
          return r
        },
        g = document,
        b = n(g.URL),
        $ = g.scripts,
        m = $[$.length - 1],
        y = n(m.src || b),
        x = g.head,
        _ = (t, e) => {
          let r = g.createElement("script");
          w(r, e), r.async = !0, r.src = t, x.appendChild(r)
        },
        w = (t, e) => {
          let r = () => {
            t.onload = t.onerror = null, x.removeChild(t), t = null, e()
          };
          t.onload = t.onerror = r
        },
        k = {},
        v = {},
        L = {},
        F = {},
        S = 1,
        C = 2,
        H = 3,
        M = 4,
        G = 5,
        T = 6;
      function e(t, e = []) {
        this.uri = t, this.bF = e, this.bG = null, this.bH = 0, this.bI = {}, this.bJ = 0
      }
      Object.assign(e.prototype, {
        bK() {
          let t = this,
            e = t.bF,
            r = [];
          for (let i = e.length; i--;) r[i] = f(e[i], t.uri);
          return r
        },
        bO() {
          let t = this;
          if (t.bH < H) {
            t.bH = H;
            let r, i = t.bK(),
              s = t.bJ = i.length;
            for (let d = 0; d < s; d++) r = e.bL(i[d]), r.bH < M ? r.bI[t.uri] = (r.bI[t.uri] ||
              0) + 1 : t.bJ--;
            if (0 == t.bJ) t.bM();
            else {
              let t = {};
              for (let e = 0; e < s; e++) r = k[i[e]], r.bH < S ? r.bN(t) : r.bH == C && r.bO();
              for (let e in t) h(t, e) && t[e]()
            }
          }
        },
        bM() {
          let t = this;
          t.bH = M, t.bP && t.bP();
          let e, r, i = t.bI;
          for (e in i) h(i, e) && (r = k[e], r.bJ -= i[e], 0 === r.bJ && r.bM());
          delete t.bI, delete t.bJ
        },
        bN(t) {
          let r = this,
            s = r.uri;
          if (r.bH = S, !s || L[s]) r.bO();
          else if (v[s]) F[s].push(r);
          else {
            v[s] = 1, F[s] = [r];
            let d = () => {
                delete v[s], L[s] = 1, i && (e.bQ(s, i), i = null);
                let t, r = F[s];
                for (delete F[s]; t = r.shift();) t.bO()
              },
              l = () => {
                _(s, d)
              };
            t ? t[s] = l : l()
          }
        },
        bR() {
          let t = this;
          if (t.bH < G) {
            t.bH = G;
            let r = t.uri,
              i = t => e.bL(f(t, r)).bR(),
              s = t.bS(i);
            delete t.bS, t.bG = s, t.bH = T
          }
          return t.bG
        }
      }), r.d = (t, r, s) => {
        s || (s = r, r = []);
        let d = {
          id: t,
          uri: f(t),
          deps: r,
          f: s
        };
        d.uri ? e.bQ(d.uri, d) : i = d
      }, e.bQ = (t, r) => {
        let i = e.bL(t);
        i.bH < C && (i.id = r.id || t, i.bF = r.deps, i.bS = r.f, i.bH = C)
      }, e.bL = (t, r) => k[t] || (k[t] = new e(t, r)), r.use = (r, i) => {
        let d = b + "__dL_" + s++,
          l = e.bL(d, r);
        l.bP = () => {
          let e = [],
            r = l.bK();
          for (let t = 0, i = r.length; t < i; t++) e[t] = k[r[t]].bR();
          null == i || i.apply(t, e), delete l.bP
        }, l.bO()
      }, r.r = t => {
        let r = e.bL(f(t));
        return r.bH < G && (r.bM(), r.bR()), r.bG
      }, r.rp = c
    }
  })(window), s.d("5u", (() => {
  let t = 0,
    e = "",
    r = [],
    i = null,
    d = window,
    l = Promise,
    o = document,
    a = d.setTimeout,
    n = encodeURIComponent,
    h = "$";
  function c() {}
  let p, u, f = JSON.stringify,
    g = o.head,
    b = d.performance,
    $ = b.now.bind(b),
    m = "\x1e",
    y = "_",
    x = (e = "_") => e + t++,
    _ = t => o.getElementById(t),
    w = (t, e) => t.innerHTML = e,
    k = t => t[0] == m,
    v = {},
    L = {
      rootId: x(),
      retard: c,
      request: c,
      error(t) {
        throw t
      }
    },
    F = t => !t || "object" != typeof t,
    S = (t, e, r, i) => {
      if (t && e && !(i = !r && t == e)) try {
        i = 16 == (16 & e.compareDocumentPosition(t))
      } catch {}
      return i
    },
    C = (t, e, r, i) => {
      e ? (i = t["\x1ebF"]) && (i[e] = 0) : t["\x1ebF"] = 0
    },
    {
      assign: H,
      keys: M,
      hasOwnProperty: G,
      prototype: T
    } = Object,
    A = T.toString,
    z = (t, e = 8) => A.call(t).slice(e, -1),
    P = t => "Object" == z(t),
    j = Array.isArray,
    I = g.getAttribute,
    B = (t, e) => I.call(t, e),
    D = (t, e, r) => {
      e && !D[t] && (D[t] = 1, r = o.createElement("style"), w(r, e), g.appendChild(r))
    },
    N = (t, e, r, i) => {
      try {
        i = j(e) ? t.apply(r, e) : t.call(r, e)
      } catch (t) {
        L.error(t)
      }
      return i
    },
    R = (t, e) => t && G.call(t, e),
    W = (t, r) => {
      let i, s;
      if (F(r)) i = r + e, k(i) && (r = t.get(i));
      else
        for (i in r) s = r[i], s = W(t, s), r[i] = s;
      return r
    },
    O = (t, r, i) => {
      if (t) {
        let r, s = j(t) ? t.slice() : (t + e).split(".");
        for (;
          (r = s.shift()) && i;) i = i[r];
        r && (i = u)
      }
      let s;
      return r !== u && (s = z(r)) != z(i) && (i = r), i
    },
    Y = (t, e) => e.bF - t.bF;
  function E(t = 50, e = 20, r) {
    (r = this).bF = [], r.bG = e, r.bH = r.bG + t
  }
  H(E.prototype, {
    get(t) {
      let e = this.bF[m + t];
      return e && (e.bF++, e = e.bG), e
    },
    set(t, e) {
      let r = this,
        i = r.bF,
        s = m + t,
        d = i[s],
        l = r.bG;
      if (!d) {
        if (i.length > r.bH)
          for (i.sort(Y); l--;) d = i.pop(), d.bF && r.del(d.bH);
        d = {
          bH: t
        }, i.push(d), i[s] = d
      }
      d.bG = e, d.bF = 1
    },
    del(t) {
      t = m + t;
      let r = this.bF,
        i = r[t];
      i && (i.bF = 0, i.bG = e, delete r[t])
    },
    has(t) {
      return R(this.bF, m + t)
    }
  });
  let V, U, K, J, X, q, Z, Q, tt = {
      bubbles: !0,
      cancelable: !0
    },
    et = (t, ...e) => t.addEventListener(...e),
    rt = (t, ...e) => t.removeEventListener(...e),
    it = (t, e, r, i, s, d) => {
      let l = {
        bF: s,
        bG: r,
        bH: e,
        bI: t,
        bJ(e) {
          s ? (e.eventTarget = t, N(r, e, d)) : r(e)
        }
      };
      V || (V = l), U && (U.bK = l), U = l, et(t, e, l.bJ, i)
    },
    st = (t, e, r, i, s) => {
      let d, l = V;
      for (; l;) {
        if (l.bH == e && l.bF == s && l.bI == t && l.bG == r) {
          rt(t, e, l.bJ, i), d && (d.bK = l.bK), V == l && (V = l.bK), U == l && (U = d);
          break
        }
        d = l, l = l.bK
      }
    },
    dt = new E,
    lt = (t, e = 1, r) => (e && dt.has(t) ? r = dt.get(t) : (r = N(Function("return " + t)), e && dt.set(
      t, r)), r),
    ot = decodeURIComponent,
    at = new E,
    nt = t => {
      let r, i, s, d, l, o, a = at.get(t);
      if (!a) {
        if (d = {}, l = t.indexOf("?"), -1 == l ? (r = t, o = e) : (r = t.substring(0, l), o = t.substring(
          l + 1)), o)
          for (l of o.split("&")) l && (o = l.indexOf("="), -1 == o ? (i = l, s = e) : (i = l.substring(
            0, o), s = l.substring(o + 1)), d[ot(i)] = k(s) ? s : ot(s));
        at.set(t, a = {
          a: r,
          b: d
        })
      }
      return {
        path: a.a,
        params: H({}, a.b)
      }
    },
    ht = new E,
    ct = navigator.scheduling,
    {
      port1: pt,
      port2: ut
    } = new MessageChannel;
  pt.onmessage = () => {
    let t, e, r, s = $() + 9,
      d = L.retard;
    for (;;) {
      if (!J) {
        Z = K = i, 0 != Q && d(Q = 0);
        break
      }
      if (q == J && (q = i), X = J, r = J.bF, t = J.bG, e = J.bH, e && N(e, t, r), J = J.bI, X =
        i, J && ($() > s || (null == ct ? void 0 : ct.isInputPending()))) {
        1 != Q && d(Q = 1), ut.postMessage(i);
        break
      }
    }
  };
  let ft = (t, e, r, s, d) => {
      d = {
        bH: t,
        bF: r,
        bG: e
      }, s ? (Z ? Z.bI = d : J = d, Z = d) : ((s = q || X) ? (d.bI = s.bI, s.bI = d, Z == s && (Z =
        d)) : J ? (d.bI = J, J = d) : J = Z = d, q = d), K || (K = 1, ut.postMessage(i))
    },
    gt = (t, e, r) => {
      ft(t, e, r, 1)
    },
    bt = 0,
    $t = (...t) => new l((async e => {
      let r = [];
      try {
        let i = L.request;
        bt || i(1), bt++, s.use(t, ((...t) => {
          for (let e of t) r.push(e);
          bt--, bt || i(0), e(r)
        }))
      } catch (t) {
        L.error(t)
      }
    })),
    mt = (t, e, r, i) => (c.prototype = e.prototype, i = new c, H(i, r), i.constructor = t, t.prototype =
      i, t),
    yt = t => t;
  let xt, _t = {
      fire(t, e = {}) {
        let r = this,
          i = r[m + t];
        for (e.type = t; i;) N(i.bF, e, r), i = i.bG;
        return e
      },
      on(t, e, r = 0) {
        let i, s = this,
          d = m + t,
          l = {
            bF: e,
            bH: r
          },
          o = s[d];
        if (o) {
          for (; o;) {
            if (o.bH < r) {
              l.bG = o, i ? i.bG = l : s[d] = l;
              break
            }
            i = o, o = o.bG
          }
          o || (i.bG = l)
        } else s[d] = l
      },
      off(t, e, r = 0) {
        let s = m + t,
          d = this;
        if (e) {
          let t, i = d[s];
          for (; i;) {
            if (i.bF == e && i.bH == r) {
              t ? t.bG = i.bG : d[s] = i.bG;
              break
            }
            t = i, i = i.bG
          }
        } else d[s] = i
      }
    },
    wt = {},
    kt = (t, e, r, i) => {
      e.includes(m) && (i = wt[t]) && (W(i._fn, r), r["\x1e"] && (H(r, r["\x1e"]), delete r["\x1e"]))
    },
    vt = (t, e, r) => {
      let s, d;
      var l, o, a;
      e = e ? t._fo[r ? e : e.bG] : t.id, s = wt[e], s && (d = s.pId, St(s), (o = wt[l = e]) && (
        delete wt[l], (a = o.root).bF = 0, a.bG = 0, o.id = o.root = o.pId = o._fo = i), s =
        wt[d], R(null == s ? void 0 : s._fo, e) && (delete s._fo[e], s._fp = 0))
    },
    Lt = (t, e, r, i, s, d, l) => {
      for ([r, l, i] of (e = t._fq, s = t._fr, e)) r && ft(i, (d = s[r]) && N(d, l, s));
      e.length = 0
    },
    Ft = (t, e, r) => {
      let i, s, d;
      for (i in t._fo) e ? (s = wt[i], d = s && S(s.root, e, r)) : d = 1, d && vt(t, i, d)
    },
    St = t => {
      let {
        _fr: e,
        root: r,
        pId: i
      } = t;
      e && (t._fr = 0, e._fs && (e._fs = 0, C(e), Ft(t), e.fire("destroy"), xe(e, 1), r && t._ft && e
        ._fu && w(r, t._fv))), t._fw++
    },
    Ct = async (t, e, r) => {
      let i, s, d, l, o, {
        id: a,
        root: n,
        pId: h
      } = t;
      !t._ft && n && (t._ft = 1, t._fv = n.innerHTML), St(t), n && e && (i = nt(e), d = i.path, t
        .path = e, l = i.params, kt(h, e, l), t._fx = d, H(l, r), s = t._fw, [o] = await $t(
        d), s == t._fw && o && (Fe(o), d = new o(a, n, t, l), t._fr = d, xe(d), N(d.init,
        l, d), N(d._fC, [l, t._fv], d), d._fD(), d._fu || d._fE || ye(d)))
    }, Ht = t => t.bG || (t.bG = x());
  function Mt(t, e) {
    let r = this,
      i = Ht(t);
    var s, d;
    r.id = i, r.root = t, r._fw = 1, r._fo = {}, r.pId = e, r._fq = [], r._fn = new Map, d = r, R(wt, s =
      i) || (wt[s] = d, d.root.bF = 1)
  }
  H(Mt, {
    root: () => xt,
    all: () => wt,
    byId: t => wt[t],
    byNode: t => wt[null == t ? void 0 : t.bG]
  }), H(Mt.prototype, {
    mount(t, e, r) {
      let i, s = this,
        d = s.id,
        l = s._fo,
        o = Ht(t);
      return i = wt[o], i || (R(l, o) || (s._fp = 0), l[o] = o, i = new Mt(t, d)), Ct(i, e, r),
        i
    },
    unmount(...t) {
      vt(this, ...t)
    },
    parent(t = 1, e) {
      for (e = this; e && t--;) e = wt[e.pId];
      return e
    },
    invoke(t, ...e) {
      let r, i, s = this,
        d = s._fq;
      return new l((l => {
        (r = s._fr) && r._fE ? l((i = r[t]) && N(i, e, r)) : d.push([t, e, l])
      }))
    }
  });
  let Gt = new E,
    Tt = /^([\w\-]+)\x1e(\d+)?(\x1e)?([^(]+)\(([\s\S]*?)\)$/,
    At = {},
    zt = {},
    Pt = {},
    jt = {},
    It = {
      capture: !0,
      passive: !1
    },
    Bt = {
      capture: !0,
      passive: !0
    },
    Dt = {
      capture: !1,
      passive: !1
    },
    Nt = {
      capture: !1,
      passive: !0
    },
    Rt = (t, s) => {
      let d, l, o, a, n, h, c, u, f, g = [],
        b = t,
        $ = B(t, "_" + s);
      if ($ && (n = Gt.get($), n || (n = $.match(Tt) || r, n = {
        v: n[1],
        b: 0 | n[2],
        t: n[3],
        n: n[4],
        i: n[5]
      }, Gt.set($, n)), n = H({}, n)), n && !n.v || zt[s]) {
        if (u = b.bH, u == i) {
          for (c = [b]; b != p && (b = b.parentNode);) {
            if (wt[l = b.bG] || (l = b.bH)) {
              u = l;
              break
            }
            c.push(b)
          }
          for ($ of c) $.bH = u || e
        }
        if (b = t.bG, wt[b] && (f = u = b), u)
          do {
            if (d = wt[u], h = null == d ? void 0 : d._fr) {
              if (o = h._fF, a = o[s], a)
                for (b = a.length; b--;) l = a[b], o = {
                  r: l,
                  v: u,
                  n: l
                }, l ? !f && t.matches(l) && g.push(o) : f && g.push(o);
              if (h._fu && !f) break
            }
            f = 0
          } while (d && (u = d.pId))
      }
      return n && g.push(n), g
    },
    Wt = t => {
      var e, r;
      let i, s, d, l, o, a, n, h, {
          target: c,
          type: u
        } = t,
        f = [];
      for (; c && c != p && !t.cancelBubble && (!(s = c.bI) || !s[u]);) {
        if (h = 1, c.nodeType == h) {
          if (i = Rt(c, u), i.length)
            for (a of (f.length = 0, i)) {
              let {
                v: e,
                n: r,
                i: i,
                t: s,
                b: p
              } = a;
              0, d = wt[e], l = null == d ? void 0 : d._fr, l && l._fE && l._fs && (o = r + m +
                u, a = l[o], a && (t.eventTarget = c, n = i ? (g = i, b = d._fn, $ =
                void 0, ht.has(g) ? $ = ht.get(g) : ($ = lt(g, 0), g.includes(m) ?
                W(b, $) : ht.set(g, $)), $) : v, t.params = n, N(a, t, l)), c ==
              l.root || l._fF[u] || (s ? h = p || h : (c = l.root, h = 0)))
            } else f.push(c);
          h && (d = wt[c.bG], (null === (r = null === (e = null == d ? void 0 : d._fr) || void 0 ===
          e ? void 0 : e._fG) || void 0 === r ? void 0 : r[u]) && (f.length = 0))
        }
        for (; h--;) c = c.parentNode
      }
      var g, b, $;
      for (c of f) s = c.bI || (c.bI = {}), s[u] = 1
    },
    Ot = (t, e, r, i) => {
      let s = 0 | At[t],
        d = jt[t] || (jt[t] = {}),
        l = r ? -1 : 1,
        o = r ? st : it;
      4 & i && (d[4] = (0 | d[4]) + l), 8 & i && (d[8] = (0 | d[8]) + l), 1 & i && (d[1] = (0 | d[1]) +
        l), 2 & i && (d[2] = (0 | d[2]) + l);
      let a, n = Pt[t];
      a = d[2] ? d[4] ? It : Dt : d[4] ? Bt : Nt, s && r !== s ? a != n && (st(p, t, Wt, n), it(p, t,
        Wt, a)) : o(p, t, Wt, r ? n : a), Pt[t] = a, At[t] = s + l, e && (zt[t] = (0 | zt[t]) +
        l)
    };
  let Yt = {
      "&": 38,
      "<": 60,
      ">": 62,
      '"': 34,
      "'": 39,
      "`": 96
    },
    Et = /[&<>"'\`]/g,
    Vt = t => `&#${Yt[t]};`,
    Ut = t => (t + e).replace(Et, Vt),
    Kt = {
      "!": 1,
      "'": 7,
      "(": 8,
      ")": 9,
      "*": "A"
    },
    Jt = t => "%2" + Kt[t],
    Xt = /[!')(*]/g,
    qt = t => n(t).replace(Xt, Jt),
    Zt = /[\\'"]/g,
    Qt = t => (t + e).replace(Zt, "\\$&"),
    te = (t, e, r) => (t.has(e) ? r = t.get(e) : (r = m + (r || t.bF++), t.has(r) || (t.set(e, r), t.set(
      r, e))), r),
    ee = async (t, e) => {
      if (t._fs && (e = t._fu)) {
        let i, s, {
            _fH: d,
            id: l,
            _fA: o,
            root: a
          } = t,
          n = wt[l],
          h = {
            bF: [],
            bG: [],
            bH: 0
          },
          c = n._fn;
        t._fI = 0, t._fH = {}, c.bF = 0, c.clear(), s = await e(o, re, l, qt, c, te, Qt, j), i =
          () => {
            if (t._fs) {
              for (s of (t._fJ = s, (e = h.bI || !t._fE) && ft(ye, t), h.bF)) ft(s._fD, r,
                s);
              if (t._fK > 1) t._fK = 1, h.bG.length = 0, ft(ee, t);
              else {
                for ([s, l, c] of (t._fK = 0, h.bG)) s[l] != c && (s[l] = c);
                for (s of (d = t._fL, d)) s();
                d.length = 0
              }
            }
          }, ft(ue, [a, t._fJ, s, h, n, d, t, i])
      }
    }, re = (t, r, s, d) => {
      let l;
      if (t) {
        r = r || v;
        let o, a, n, c, p, u, f = e,
          g = 1 == s,
          b = d,
          $ = d,
          x = 0,
          _ = "<" + t,
          w = e,
          k = 0;
        if (s && 1 != s)
          for (n of s) {
            if (n.bG) a = n.bG + (n.bH ? "/>" : `>${n.bI}</${n.bJ}>`);
            else if (a = n.bI, n.bJ == ie) {
              if (!a) continue;
              a = Ut(a)
            }
            w += a, u && n.bJ == ie && u.bJ == ie ? u.bI += n.bI : (n.bK && (c || (c = {}),
              c[n.bK] = (c[n.bK] || 0) + 1, x++), b = b || n.bL, u = n, p || (p = []),
              p.push(n))
          }
        for (o in d = d || v, r) a = r[o], !1 !== a && a != i ? (!0 === a && (r[o] = a = d[o] ?
          a : e), "__" != o && "id" != o && o != h || f || (f = a, "id" == o) ? (o ==
        y && a && (k = nt(a).path, f || (f = t + m + k)), "value" == o && d._ ? w =
          a : "$$" == o ? (b = a, delete r[o]) : _ += ` ${o}="${a&&Ut(a)}"`) : delete r[
          o]) : d[o] || delete r[o];
        l = {
          bI: w,
          bK: f,
          bJ: t,
          bM: k,
          bL: b,
          bN: d,
          bO: $,
          bG: _,
          bP: r,
          bQ: p,
          bR: c,
          bS: x,
          bH: g
        }
      } else l = {
        bJ: s ? m : ie,
        bI: r + e
      };
      return l
    };
  let ie = t;
  let se = "http://www.w3.org/",
    de = {
      svg: se + "2000/svg",
      math: se + "1998/Math/MathML"
    },
    le = (t, r, i, s) => {
      var d;
      let l, o, a, n, h, c = 0,
        p = r.bN,
        u = r.bP;
      if (s)
        for (l in a = s.bN, n = s.bP, n) R(u, l) || (c = 1, (h = a[l]) ? i ? i.bG.push([t, h, e]) :
          t[h] = e : t.removeAttribute(l));
      for (l in u) o = null !== (d = u[l]) && void 0 !== d ? d : e, (h = p[l]) ? s && t[h] == o || (c =
        1, i ? i.bG.push([t, h, o]) : t[h] = o) : s && n[l] == o || (c = 1, t.setAttribute(l, o));
      c && (i.bI = 1)
    },
    oe = (t, e, r) => {
      let i, s = t.bJ;
      return s == ie ? i = o.createTextNode(t.bI) : (i = o.createElementNS(de[s] || e.namespaceURI, s),
        le(i, t, r), w(i, t.bI)), i
    },
    ae = (t, e, r, i, s) => {
      let d, l, o, a = {};
      for (d = i; d >= r; d--, s--) l = t[d], o = l.bK, o && (l = a[o] || (a[o] = []), l.push(e[s]));
      return a
    },
    ne = (t, e) => t.bK && e.bK == t.bK || !t.bK && !e.bK && t.bJ == e.bJ || t.bJ == m || e.bJ == m,
    he = (t, e, r, i) => {
      r && ((i = wt[t.bG]) ? vt(i) : Ft(e, t))
    },
    ce = (t, e, r, i, s, d) => {
      s._fs && (he(t, r, 1 == t.nodeType), e.removeChild(t), --i.bH || ft(d))
    },
    pe = (t, e, r, i, s, d, l, o) => {
      s._fs && (e.bJ == m ? (Ft(l, t), w(t, e.bI)) : t.insertBefore(oe(e, t, d), r[i]), --d.bH || ft(
        o))
    },
    ue = (t, s, d, l, o, a, n, h) => {
      if (n._fs)
        if (s) {
          if (s.bL || s.bI != d.bI) {
            let c, p, u, f, g, b = s.bQ || r,
              $ = d.bQ || r,
              y = d.bR || v,
              x = d.bS,
              _ = s.bS,
              k = t.childNodes,
              L = 0,
              F = $.length,
              S = b.length - 1,
              C = 0,
              H = F - 1,
              M = (t, e) => {
                if (y[t.bK] && (y[t.bK]--, x--), p = g && g[t.bK], p)
                  for (c = p.length; c--;)
                    if (p[c] == e) {
                      p[c] = i;
                      break
                    }
              };
            let G, T = b[L],
              A = b[S],
              z = $[C],
              P = $[H],
              j = L,
              I = S;
            for (; L <= S && C <= H;)
              if (T)
                if (A)
                  if (ne(z, T)) p = k[j], z.bJ == m || T.bJ == m ? (l.bI = 1, Ft(o, t), z
                    .bJ == m ? (I = 0, w(t, z.bI)) : (w(t, e), t.appendChild(oe(z,
                    t, l)))) : (l.bH++, ft(fe, [p, t, T, z, l, o, a, n, h])), M(
                    T, p), j++, T = b[++L], z = $[++C];
                  else if (ne(P, A)) p = k[I], l.bH++, ft(fe, [p, t, A, P, l, o, a, n, h]),
                    M(A, p), I--, A = b[--S], P = $[--H];
                  else if (ne(P, T)) p = k[j], t.insertBefore(p, k[I + 1]), l.bH++, ft(fe, [p, t, T,
                    P, l, o, a, n, h]), M(T, p), I--, T = b[++L], P = $[--H];
                  else if (ne(z, A)) p = k[I], t.insertBefore(p, k[j++]), l.bH++, ft(fe, [p, t, A, z,
                    l, o, a, n, h]), M(A, p), A = b[--S], z = $[++C];
                  else {
                    for (!g && x > 0 && _ > 0 && (g = ae(b, k, L, S, I)), G = k[j], p = g && g[z.bK],
                           f = i; p && p.length && !(f = p.pop()););
                    if (f) {
                      if (u = T, f != G) {
                        for (p = L + 1, c = j + 1; p <= S; p++) {
                          if (u = b[p], u && k[c++] == f) {
                            b[p] = i;
                            break
                          }
                          0
                        }
                        L--, t.insertBefore(f, G)
                      }
                      y[u.bK] && y[u.bK]--, l.bH++, ft(fe, [f, t, u, z, l, o, a, n, h])
                    } else g && g[T.bK] && y[T.bK] || wt[G.bG] && !z.bM ? (l.bI = 1, t.insertBefore(
                      oe(z, t, l), G), L--, I++) : (l.bH++, ft(fe, [G, t, T, z, l, o, a, n, h]));
                    ++j, T = b[++L], z = $[++C]
                  } else A = b[--S];
              else T = b[++L];
            for (c = C, p = 1; c <= H; c++, p++) u = $[c], l.bI = 1, l.bH++, ft(pe, [t, u, k, I +
            p, n, l, o, h]);
            for (!F && T && T.bJ == m && (I = k.length - 1), c = I; c >= j; c--) l.bI = 1, l.bH++,
              ft(ce, [k[c], t, o, l, n, h])
          }
        } else l.bI = 1, w(t, d.bI);
      l.bH || ft(h)
    },
    fe = (t, e, r, i, s, d, l, o, a) => {
      if (o._fs) {
        let n = r.bP,
          h = i.bP;
        if (r.bL || r.bG != i.bG || r.bI != i.bI)
          if (r.bJ == i.bJ) {
            if (r.bJ == ie) s.bI = 1, t.nodeValue = i.bI;
            else if (!n.$ || n.$ != h.$) {
              let e, n, c, p, u, f, g, b = h._,
                $ = i.bI,
                m = r.bG != i.bG || i.bO,
                y = wt[t.bG],
                x = b && nt(b);
              if (m && le(t, i, s, r), b && y && y._fx == x.path && (p = y._fr)) {
                if (f = $ != r.bI, g = b != y.path, c = i.bL, !f && !g && c)
                  for (c of (u = c.split(","), u))
                    if ("#" == c || R(l, c)) {
                      g = 1;
                      break
                    } e = !p._fu, (g || f) && (c = p._fC, u = x.params, kt(h._5, b, u),
                  y.path = b, y._fv = $, !1 !== N(c, [u, $], p) && s.bF.push(p))
              } else e = 1, n = y;
              n && (s.bI = 1, vt(y)), e && !i.bH && ue(t, r, i, s, d, l, o, a)
            }
          } else s.bI = 1, he(t, d, 1), e.replaceChild(oe(i, e, s), t)
      }--s.bH || ft(a)
    },
    ge = {},
    be = H({
      get: t => t ? ge[t] : ge,
      set(...t) {
        H(ge, ...t)
      }
    }, _t),
    $e = /^(\$?)([^<]*)<([^>]+)>(?:\s*&(.+))?$/,
    me = (t, e, r) => (t.bF ? r = t : ((r = function (t, e) {
      for (e of r.bF) N(e, t, this)
    }).bF = [t], r.bG = 1), r.bF = r.bF.concat(e.bF || e), r),
    ye = t => {
      let e, r;
      t._fs && (r = t._fE, t._fE = 1, e = t.owner, ((t, e, r) => {
        for (r of (e = e || t.root).querySelectorAll(`[_][_5=${t.id}]`)) r.bF || t.mount(
          r, B(r, y))
      })(e), r || ft(Lt, e))
    },
    xe = (t, e) => {
      let r, {
        _fG: i,
        _fF: s,
        _fM: d,
        id: l
      } = t;
      for (r in i) Ot(r, s[r], e, i[r]);
      for (r of (i = e ? st : it, d)) i(r.bF, r.bG, r.bH, r.bI, l, t)
    },
    _e = {
      win: d,
      doc: o,
      root: e
    };
  function we(...t) {
    return H(this, ...t), this
  }
  function ke(...t) {
    let e = this,
      r = e.bF || (e.bF = []);
    return ((t, e, r) => {
      let i, s, d, l, o = {};
      for (s of t)
        for (i in s) d = s[i], l = o[i], "ctor" != i ? ($e.test(i) && (l ? d = me(l, d) : d
          .bG = 1), o[i] = d) : r.push(d);
      for (i in o) R(e, i) || (e[i] = o[i])
    })(t, e.prototype, r), e
  }
  let ve = t => function (...e) {
      return this._fs && N(t, e, this)
    },
    Le = (t, e, r, i) => {
      if (t)
        for (i of t) N(i, e, r)
    };
  let Fe = t => {
    if (!t["\x1e"]) {
      t["\x1e"] = 1;
      let r, s, d, l, o, a, n, h, c, p, u, f = t.prototype,
        g = {},
        b = [],
        $ = {};
      for (n in f)
        if (r = f[n], s = n.match($e), s)
          for (h of ([, a, d, l, u] = s, p = u ? lt(u) : Nt, l = l.split(","), l)) {
            if (o = _e[d], c = 0, c |= p.passive || p.passive == i ? 1 : 2, c |= p.capture ?
              4 : 8, a) {
              if (o) {
                b.push({
                  bH: r,
                  bF: o,
                  bG: h,
                  bI: p
                });
                continue
              }
              o === e && (d = e), o = $[h], o || (o = $[h] = []), o[d] || (o[d] = 1, o.push(
                d))
            }
            g[h] |= c, h = d + m + h, o = f[h], o ? o.bG && (r.bG ? f[h] = me(r, o) : R(f,
              n) && (f[h] = r)) : f[h] = r
          }
      f._fD != f.render && (f._fD = f.render = ve(f.render)), f._fG = g, f._fM = b, f._fF = $, f._fC =
        f.assign, f._fu = f.tmpl
    }
  };
  function Se(t, e, r, i, s) {
    (s = this).root = e, s.owner = r, s.id = t, s._fs = 1, s._fI = 1, s._fA = {}, s._fH = {}, s._fK = 0,
      s._fL = [], Le(Se.bF, i, s)
  }
  function Ce() {
    this.id = x("b"), this.bF = {}
  }
  H(Se, {
    merge: ke,
    extend: function t(e = {}) {
      let r = this,
        i = e.ctor;
      function s(t, e, d, l, o) {
        r.call(o = this, t, e, d, l), i && N(i, l, o), Le(s.bF, l, o)
      }
      return s.merge = ke, s.extend = t, s.static = we, mt(s, r, e)
    }
  }), H(Se.prototype, _t, {
    init: c,
    render: c,
    assign: c,
    get(t, e) {
      return e = this._fA, t && (e = e[t]), e
    },
    set(...t) {
      let e, r, i, s, d = this,
        l = d._fA,
        o = d._fH,
        a = d._fI;
      for (let d of t)
        for (i in d) e = d[i], r = l[i], s = !F(e) || r != e, s && (o[i] = 1, a = 1), l[
          i] = e;
      return d._fI = a, d
    },
    digest(t) {
      return t = this.set(t), new l((e => {
        t._fI ? (t._fK++, t._fL.push(e), 1 == t._fK && ft(ee, t)) : t._fK ? t._fL
          .push(e) : e()
      }))
    },
    finale() {
      let t = this;
      return new l((e => {
        t._fK ? t._fL.push(e) : e()
      }))
    }
  }), H(Ce.prototype, {
    get(t, e) {
      return O(t, e, this.bF)
    },
    set(...t) {
      H(this.bF, ...t)
    }
  });
  let He = (t, e, r) => i => {
      if (r = t[e]) {
        delete t[e];
        for (let t of r) N(t, i, r.bF)
      }
    },
    Me = (t, e, r, s, d) => {
      if (t.bF) return t;
      if (t.bG) return t.enqueue(Me.bind(t, t, e, r, s, d));
      t.bG = 1, j(e) || (e = [e]);
      let l = t.constructor,
        o = 0,
        a = l.bH,
        n = ((t, e, r, s, d, l) => {
          let o = [],
            a = i,
            n = 0;
          return (h, c, p) => {
            let u;
            n++;
            let f, g = h.bG,
              b = g.bF;
            if (o[c + 1] = h, p ? (a = p, u = 1) : l.has(b) || (b && l.set(b, h), g.bG =
              $(), f = g.bH, f && N(f, h, h), u = 1), !r.bF) {
              let e = n == s;
              e && (r.bG = 0, 2 == d && (o[0] = a, N(t, o, r))), 1 == d && N(t, [p ||
              i, h, e, c], r)
            }
            u && e.fire("end", {
              bag: h,
              error: p
            })
          }
        })(r, l, t, e.length, s, l.bI);
      for (let t of e)
        if (t) {
          let e, [r, i] = l.get(t, d),
            s = r.bG.bF,
            h = n.bind(r, r, o++);
          s && a[s] ? a[s].push(h) : i ? (s && (e = [h], e.bF = r, a[s] = e, h = He(a, s)), l.bJ(
            r, h)) : h()
        } return t
    };
  function Ge() {
    this.id = x("s"), this.bK = []
  }
  H(Ge.prototype, {
    all(t, e) {
      return Me(this, t, e, 2)
    },
    save(t, e) {
      return Me(this, t, e, 2, 1)
    },
    one(t, e) {
      return Me(this, t, e, 1)
    },
    enqueue(t) {
      let e = this;
      return e.bF || (e.bK.push(t), e.dequeue(e.bL)), e
    },
    dequeue(...t) {
      let e, r = this;
      r.bG || r.bF || (r.bG = 1, a((() => {
        r.bG = 0, r.bF || (e = r.bK.shift(), e && N(e, r.bL = t))
      })))
    },
    destroy(t) {
      (t = this).bF = 1, t.bK = 0
    }
  });
  let Te = (t, e) => [f(e), f(t)].join(m),
    Ae = H({
      add(t) {
        let e, r = this.bM;
        for (e of (j(t) || (t = [t]), t))
          if (e) {
            let {
              name: t,
              cache: i
            } = e;
            e.cache = 0 | i, r[t] = e
          }
      },
      create(t) {
        let e = this.meta(t),
          r = 0 | t.cache || e.cache,
          i = new Ce;
        i.set(e), i.bG = {
          bH: e.after,
          bF: r && Te(e, t)
        }, P(t) && i.set(t);
        let s = e.before;
        return s && N(s, i, i), this.fire("begin", {
          bag: i
        }), i
      },
      meta(t) {
        return this.bM[t.name || t] || t
      },
      get(t, e) {
        let r, i, s = this;
        return e || (r = s.cached(t)), r || (r = s.create(t), i = 1), [r, i]
      },
      cached(t) {
        let e, r, i = this,
          s = i.bI,
          d = i.meta(t),
          l = 0 | t.cache || d.cache;
        if (l && (r = Te(d, t)), r) {
          let t = i.bH[r];
          t ? e = t.bF : (e = s.get(r), e && $() - e.bG.bG > l && (s.del(r), e = 0))
        }
        return e
      }
    }, _t);
  function ze() {}
  Ge.extend = (t, e, r) => {
    function i() {
      Ge.call(this)
    }
    return i.bJ = t, i.bI = new E(e, r), i.bH = {}, i.bM = {}, H(i, Ae), mt(i, Ge)
  }, H(ze.prototype, _t), ze.extend = function t(e, r) {
    let i = this,
      s = null == e ? void 0 : e.ctor;
    function d(...t) {
      i.apply(this, t), null == s || s.apply(this, t)
    }
    return d.extend = t, H(d, r), mt(d, i, e)
  };
  let Pe = 0,
    {
      MAX_SAFE_INTEGER: je,
      MIN_SAFE_INTEGER: Ie
    } = Number;
  return {
    version: "5.1.0",
    config(t, ...e) {
      let r = L;
      return t && (r = P(t) ? H(r, t, ...e) : r[t]), r
    },
    boot(t) {
      var e, r;
      Pe || (Pe = 1, H(L, t), Ct((xt || (p = o.body, e = L.rootId, (r = _(e)) || (r = p), xt = new Mt(
        r)), xt), L.defaultView))
    },
    unboot() {
      Pe && (Pe = 0, xt && (vt(xt), xt = i))
    },
    HIGH: 1e3,
    LOW: -1e3,
    isObject: P,
    isArray: j,
    isFunction: t => z(t, -9).endsWith("Function"),
    isString: t => "String" == z(t),
    isNumber: t => "Number" == z(t),
    isPrimitive: F,
    toNumber(t) {
      let e = parseFloat(t);
      return !isNaN(e) && isFinite(e) && e <= je && e >= Ie ? e : t
    },
    attach: et,
    detach: rt,
    now: $,
    mix: H,
    toMap: (t, e) => {
      let r, i = {};
      if (t)
        for (r of t) i[e && r ? r[e] : r] = e ? r : 1 + (0 | i[r]);
      return i
    },
    toTry: N,
    toUrl: (t, r, i) => {
      let s, d, l, o = [];
      for (d in r) s = r[d] + e, (s || R(i, d)) && (s = n(s), o.push(l = d + "=" + s));
      return l && (t += (t && (t.includes("?") ? "&" : "?")) + o.join("&")), t
    },
    parseUrl: nt,
    guid: x,
    use: $t,
    dispatch: (t, e, r) => {
      let i = new Event(e, tt);
      return H(i, r), t.dispatchEvent(i), i
    },
    guard: yt,
    type: z,
    has: R,
    inside: S,
    applyStyle: D,
    Cache: E,
    View: Se,
    Vframe: Mt,
    State: be,
    Service: Ge,
    Event: _t,
    Base: ze,
    mark: (t, e, r, i, s) => (0 != t[s = "\x1ebF"] && (r = t[s] || (t[s] = {}), R(r, e) || (r[e] = $()),
      i = ++r[e]), r => (r = t[s]) && i === r[e]),
    keys: M,
    unmark: C,
    node: _,
    task: ft,
    lowTask: gt,
    taskFinale: () => new l(ft),
    lowTaskFinale: () => new l(gt),
    delay: t => new l((e => a(e, t)))
  }
})),
  /*!report-desinger|https://github.com/xinglie|158*/
  (() => {
    let t = document.currentScript.src.replace(/\/[^\/]+$/, "/"),
      e = document.body,
      {
        max: r,
        min: i
      } = Math,
      d = t => (d._o8 || (d._o8 = new Promise((e => {
        s.use(["5u", "6b/5r", "6c/6d"], (({
                                            applyStyle: s,
                                            config: d,
                                            View: l
                                          }, o, a) => {
          s("rd-bG",
            "@font-face{font-family:rd-bF;src:url('//at.alicdn.com/t/a/font_890516_lvzohrgypgd.woff2?t=1665541873102') format('woff2')}:root{--rd-bF:#fa742b;--rd-bG:#fcaf85;--rd-bH:#fdc6a8;--rd-bI:#fa6717;--rd-bJ:#f65b06;--rd-bK:#ec5706;--rd-bL:rgba(250, 116, 43, 0.05);--rd-bM:rgba(250, 116, 43, 0.1);--rd-bN:rgba(250, 116, 43, 0.2);--rd-bO:rgba(250, 116, 43, 0.3);--rd-bP:rgba(250, 116, 43, 0.6);--rd-bQ:#ffffff;--rd-bR:rgba(255, 255, 255, 0.15);--rd-bS:rgba(255, 255, 255, 0.6);--rd-bT:#dddb}.rd-bF{font:400 normal normal 16px/1 rd-bF;display:inline-block;position:relative}.rd-bG{all:initial;display:block;box-sizing:border-box;font-size:14px;line-height:1.5;color:#333}.rd-bH{font-family:arial,sans-serif}.rd-bG *{box-sizing:inherit}.rd-bG :after,.rd-bG :before{box-sizing:inherit}.rd-bG ::-moz-placeholder{color:#999}.rd-bG ::placeholder{color:#999}.rd-bG ::-moz-selection{background:var(--rd-bN)}.rd-bG ::selection{background:var(--rd-bN)}.rd-bI *{cursor:inherit!important}.rd-bJ{margin:0}.rd-bK,.rd-bL{font-size:100%;-webkit-appearance:none;-moz-appearance:none;appearance:none;caret-color:var(--rd-bF);display:inline-block;height:22px;padding:1px 4px;border-radius:2px;box-sizing:border-box;box-shadow:none;border:1px solid #e6e6e6;background:#fff;max-width:100%;outline:0}.rd-bK:hover,.rd-bL:hover{border-color:#ccc}.rd-bK:focus,.rd-bL:focus,.rd-bM{outline:0;border-color:var(--rd-bF)}.rd-bL{height:auto;resize:none;padding:3px 4px;line-height:1.5}.rd-bN{outline:0}.rd-bO:hover{box-shadow:0 0 4px 1px var(--rd-bH)}.rd-bO:active{box-shadow:0 0 0 1px var(--rd-bH)}.rd-bK[disabled],.rd-bL[disabled],.rd-bP{background:#f5f5f5;cursor:not-allowed;color:#999}.rd-bK:-moz-placeholder,.rd-bL:-moz-placeholder{color:#a9a9a9;opacity:1}.rd-bK:-moz-focus-inner{border-style:none;padding:0}.rd-bK[disabled]:hover,.rd-bL[disabled]:hover,.rd-bP:hover{cursor:not-allowed;border-color:#e6e6e6}.rd-bM:hover{border-color:var(--rd-bF)}.rd-bQ{background:#ccc;padding:3px 14px;font-size:14px;line-height:1;border:1px solid #0000;border-radius:2px;-webkit-user-select:none;-moz-user-select:none;user-select:none;color:inherit}.rd-bR{font-weight:400}.rd-bQ:focus,.rd-bQ:hover{background:#bbb}.rd-bS{background:var(--rd-bF);color:var(--rd-bQ)}.rd-bS:focus,.rd-bS:hover{background:var(--rd-bI);color:var(--rd-bQ)}.rd-bQ[disabled]{background:#f5f5f5;border-color:#e6e6e6;color:#999;cursor:not-allowed}.rd-bQ[disabled]:hover{border-color:#e6e6e6;color:#999}.rd-bS[disabled]{background:var(--rd-bO);color:var(--rd-bQ);border-color:#0000}.rd-bS[disabled]:hover{color:var(--rd-bQ);border-color:#0000}.rd-bQ:-moz-focus-inner{border-style:none;padding:0}.rd-bT{padding:8px 25px;border-bottom:1px solid rgba(230,230,230,.4);line-height:1.5}.rd-bU{height:10px;margin-top:10px;top:28px;box-shadow:0 0 6px #ccc}.rd-bV{line-height:14px}.rd-bW{padding:18px 25px}.rd-bX{height:10px;bottom:28px;margin-bottom:10px;box-shadow:0 0 6px #ccc}.rd-bY{padding:8px 25px;border-top:1px solid rgba(230,230,230,.4);min-height:40px}.rd-bZ{margin-bottom:-20px}.rd-b0,.rd-b1:after,.rd-b1:before{content:'';width:14px;height:14px;background:#ccc;-webkit-animation:rd-bF 1s infinite ease-in-out both;animation:rd-bF 1s infinite ease-in-out both}.rd-b1:before{-webkit-animation-delay:-.32s;animation-delay:-.32s}.rd-b0{-webkit-animation-delay:-.16s;animation-delay:-.16s}@-webkit-keyframes rd-bF{0%,100%,80%{transform:scale(0)}40%{transform:scale(1)}}@keyframes rd-bF{0%,100%,80%{transform:scale(0)}40%{transform:scale(1)}}.rd-b2{display:inline-block}.rd-b3{list-style-type:none;list-style-image:none}.rd-b4{color:var(--rd-bF);text-decoration:none}.rd-b4:focus,.rd-b4:hover{color:var(--rd-bK)}.rd-b4:active,.rd-b4:focus,.rd-b4:hover,.rd-b4:visited{outline:0}.rd-b5{border-style:none;height:auto;vertical-align:top}.rd-b6{margin-right:2px}.rd-b7{margin-left:5px}.rd-b8{transform:rotate(180deg)}.rd-b9{transform:rotate(90deg)}.rd-c_{transform:rotate(270deg)}.rd-ca{margin-bottom:10px}.rd-cb{margin-left:10px}.rd-cc{padding-right:10px}.rd-cd::after{content:' ';display:block;clear:both}.rd-ce{padding-left:4px}.rd-cf{padding-right:4px}.rd-cg{padding-right:2px}.rd-ch{padding-left:10px}.rd-ci{margin:2px}.rd-cj{margin-right:5px}.rd-ck{margin-right:10px}.rd-cl{background:var(--rd-bF)}.rd-cm{background:var(--rd-bM)}.rd-cn{background:var(--rd-bN)}.rd-co{background:var(--rd-bO)}.rd-cp{background:var(--rd-bP)}.rd-cq{color:var(--rd-bQ)}.rd-cr{background:var(--rd-bQ)}.rd-cs{color:var(--rd-bS)}.rd-ct{background:#fff}.rd-cu{background:var(--rd-bG)}.rd-cv{background:var(--rd-bH)}.rd-cw{background:#f5f5f5}.rd-cx{background:#e6e6e6}.rd-cy{background:#bbb}.rd-cz{width:100%}.rd-cA{height:100%}.rd-cB{max-width:100%}.rd-cC{max-height:100%}.rd-cD{text-align:right}.rd-cE{text-align:center}.rd-cF{float:left}.rd-cG{position:absolute}.rd-cH{position:relative}.rd-cI{position:fixed}.rd-cJ{pointer-events:all}.rd-cK{pointer-events:none}.rd-cL{margin:30px 0}.rd-cM{display:block}.rd-cN{display:inline-block}.rd-cO{display:contents}.rd-cP{-webkit-user-select:none;-moz-user-select:none;user-select:none}.rd-cQ{scrollbar-color:var(--rd-bF) #0000}.rd-cQ::-webkit-scrollbar{height:4px;width:4px}.rd-cQ::-webkit-scrollbar-corner{height:4px;width:4px}.rd-cQ::-webkit-scrollbar-thumb{background:var(--rd-bF);border-radius:2px}.rd-cQ::-webkit-scrollbar-thumb:hover{background:var(--rd-bJ)}.rd-cR{scroll-behavior:smooth}.rd-cS{scrollbar-width:thin}.rd-cS::-webkit-scrollbar{height:2px;width:2px}.rd-cS::-webkit-scrollbar-corner{height:2px;width:2px}.rd-cT{word-wrap:normal;overflow:hidden;text-overflow:ellipsis}.rd-cU{height:1px;margin:5px 0;background:linear-gradient(to right,#0000,#7d768454 50%,#0000)}.rd-cV{flex:1}.rd-cW{display:flex}.rd-cX{display:grid}.rd-cY{flex-direction:column}.rd-cZ{flex-shrink:0}.rd-c0{align-items:center}.rd-c1{transform:scaleX(-1)}.rd-c2{transform:scaleY(-1)}.rd-c3{position:sticky}.rd-c4{top:0}.rd-c5{margin-bottom:4px}.rd-c6{margin-top:4px}.rd-c7{margin-top:-20px}.rd-c8{margin:0 2px}.rd-c9{width:1px}.rd-d_{width:4px}.rd-da{width:50px}.rd-db{width:60px}.rd-dc{width:90px}.rd-dd{width:150px}.rd-de{width:242px}.rd-df{height:1px}.rd-dg{height:4px}.rd-dh{height:26px}.rd-di{height:100px}.rd-dj{justify-content:space-between}.rd-dk{justify-content:center}.rd-dl{justify-content:flex-end}.rd-dm{justify-items:center}.rd-dn{flex-wrap:wrap}.rd-do{cursor:pointer}.rd-dp{cursor:move}.rd-dq{cursor:default}.rd-dr{cursor:text}.rd-ds{cursor:ew-resize}.rd-dt{cursor:ns-resize}.rd-du{word-break:break-all}.rd-dv{white-space:nowrap}.rd-dw{border-collapse:collapse}.rd-dx{border:1px solid #000}.rd-dy{box-shadow:inset 2px 2px 10px rgba(0,0,0,.2);outline:var(--rd-bF) 2px solid;background:var(--rd-bM)}.rd-dz{left:0;top:0;right:0;bottom:0}.rd-dA{align-items:flex-start}.rd-dB{align-self:flex-start}.rd-dC{visibility:hidden}.rd-dD{width:36px;height:18px;display:inline-block;border-radius:2px;background:#ccc}.rd-dD::before{content:'';width:calc(50% - 4px);height:calc(100% - 4px);position:absolute;left:0;margin:2px;border-radius:2px;background:var(--rd-bQ);transition:all .15s}.rd-dE{border:solid 1px var(--rd-bQ)}.rd-dF{transition:all .15s}.rd-dC:checked+.rd-dD{background:var(--rd-bF)}.rd-dC:checked+.rd-dD::before{left:100%;margin-left:calc(-50% + 2px)}.rd-dE{width:32px;height:16px}.rd-dE::before{width:calc(50% - 2px);height:calc(100% - 2px);margin:1px}.rd-dG:checked+.rd-dE{background:var(--rd-bG)}.rd-dG:checked+.rd-dE::before{left:100%;margin-left:calc(-50% + 1px)}.rd-dC:disabled+.rd-dD{background:#e6e6e6;cursor:not-allowed}.rd-dC:checked:disabled+.rd-dD{background:var(--rd-bO)}.rd-dH{width:21px;margin:0 1px;height:21px;line-height:21px;background:#e6e6e6;border-radius:2px}.rd-dH:hover{background:#ccc}.rd-dI,.rd-dI:hover{background:var(--rd-bF);color:var(--rd-bQ)}.rd-dJ{opacity:0}.rd-dK{opacity:.2}.rd-dL{opacity:.4}.rd-dM .rd-dH,.rd-dM .rd-dH:hover{background:#e6e6e6;color:#999}.rd-dM .rd-dI,.rd-dM .rd-dI:hover{background:var(--rd-bO);color:var(--rd-bQ)}.rd-dN{cursor:not-allowed}.rd-dO{color:var(--rd-bF)}.rd-dP{color:#999}.rd-dQ{color:#666}.rd-dR:hover{color:#666}.rd-dS{overflow:hidden}.rd-dT{overflow:visible}.rd-dU{overflow:auto}.rd-dV{overflow-y:scroll}.rd-dW{overflow-x:hidden}.rd-dX{transform:scale(.8)}.rd-dY{font-size:12px}.rd-dZ{font-size:14px}.rd-d0{font-size:16px}.rd-d1{font-size:20px}.rd-d2{font-size:26px}.rd-d3{right:0}.rd-d4{top:2px}.rd-d5{bottom:0}.rd-d6{outline:dashed 1px var(--rd-bF)}.rd-d7{z-index:1}.rd-d8{z-index:2}.rd-d9{z-index:5}.rd-e_{z-index:6}.rd-ea{z-index:7}.rd-eb{z-index:8}.rd-ec{z-index:9}.rd-ed::before{width:100%;height:100%;content:attr(data-tip);position:absolute;display:flex;justify-content:center;align-items:center}.rd-ee::before{position:absolute;left:-7px;right:-7px;top:-5px;content:'';border-style:solid;border-width:5px;border-color:#0000 var(--rd-bG);height:11px}.rd-ef::before{left:-5px;right:-5px;top:-3px;border-width:3px;height:7px}.rd-ee::after{position:absolute;border-bottom:dashed 1px var(--rd-bG);left:-5px;right:-5px;top:0;content:''}.rd-eg{min-height:80px}.rd-eh{min-height:500px}.rd-ei{border-style:dashed}.rd-ej{border:none}.rd-ek{font-family:inherit}.rd-el{contain:paint}.rd-em{padding:4px}.rd-en{padding:0}.rd-eo{padding:2px}.rd-ep{padding:2px 4px}.rd-eq{padding:2px 0}.rd-er{padding:0 2px}.rd-es{left:2px}.rd-et{left:0}.rd-eu{border-radius:2px}.rd-ev{opacity:0}.rd-ev:focus{opacity:1;pointer-events:all}.rd-ev:focus+.rd-ew{opacity:0}.rd-ex{transform:translateY(-50%)}.rd-ey{transform:translateX(-50%)}.rd-ez{transform:translate(-50%,-50%)}.rd-eA{transform-origin:0}.rd-eB{touch-action:none}.rd-eC{scrollbar-gutter:stable}.rd-eD{overscroll-behavior:contain}.rd-eE{content-visibility:auto}.rd-eF{left:-500cm;top:-500cm}.rd-eG{background:#f9f9f9;border:solid 1px #0000}.rd-eG:hover,.rd-eH{border-color:var(--rd-bF)}.rd-eI,.rd-eI:hover{background:#f5f5f5;border-color:#0000}.rd-eI.rd-eH,.rd-eI.rd-eH:hover{border-color:var(--rd-bO)}.rd-eH::after{content:'';position:absolute;right:0;top:0;border-top:solid 8px var(--rd-bF);border-left:solid 8px #0000;width:0;height:0}.rd-eI::after{border-top-color:var(--rd-bO)}.rd-eJ{border:solid 1px #e6e6e6}.rd-eJ:hover{border-color:#ccc}.rd-eK:hover{border-color:#e6e6e6}.rd-eL{background:#fafafa}.rd-eM{flex-basis:22%}.rd-eN{display:none}.rd-eO{min-height:calc(100vh - 132px)}"
          );
          let n = a.cE("lang", "zh");
          d(t, {
            lang: n
          }), l.merge({
            ctor() {
              this.set({
                enHTML: a.cA,
                safeHTML: a.cB,
                i18n: o,
                am: a.cD,
                mmax: r,
                mmin: i
              })
            },
            _ch(t) {
              t.preventDefault()
            },
            _fl(t) {
              t.stopPropagation()
            },
            "_fm<change,wheel>"(t) {
              this._fl(t)
            }
          }), e()
        }))
      }))), d._o8),
      l = () => {},
      o = async t => (await d(t), o._o8 || (o._o8 = new Promise((t => {
        addEventListener("unhandledrejection", l), s.use(["5u"], (({
                                                                     View: r,
                                                                     boot: i,
                                                                     toUrl: d,
                                                                     config: o
                                                                   }) => {
          let a = o("rootId");
          s.d("~/root", (() => r.extend())), e.id || (e.id = a), i({
            defaultPath: "/rd",
            defaultView: "~/root",
            rootId: e.id,
            error: l
          }), t()
        }))
      }))), o._o8), a = "rd-bG";
    window.viewer = {
      resolve: e => s.rp(t + e),
      setup: (t = {}) => new Promise((async r => {
        await o(t), s.use(["5u"], (({
                                      node: i,
                                      config: s,
                                      Vframe: d
                                    }) => {
          let {
            rootId: l = "app",
            use: o = "8a/5r"
          } = t, n = i(l);
          "virtual" == o && (o = "8a/a7", n = document.createElement(
            "div"), n.className = "rd-cK rd-eF rd-cI rd-dJ", e.append(
            n)), n.classList.add(a, "rd-bH", "rd-eD");
          let h = s("rootId"),
            c = d.byNode(i(h));
          r(c.mount(n, o))
        }))
      })),
      element(t, e) {
        (async (t, e, r) => {
          await o();
          let {
            config: i,
            node: d,
            isString: l,
            Vframe: n,
            State: h
          } = s.r("5u"), c = d(i("rootId"));
          h.set({
            bK: r.unit || "px"
          });
          let p = n.byNode(c),
            u = t;
          if (l(u) && (u = d(u.replace(/^#/, ""))), u) {
            u.classList.contains(a) || u.classList.add(a, "rd-bH");
            let t = n.byNode(u);
            (null == t ? void 0 : t.path) == e ? (await t.invoke("assign", r), await t.invoke(
              "render")) : p.mount(u, e, r)
          }
        })(t, `6o/${e.type}/5r`, e)
      },
      remove(t) {
        let e = t,
          {
            node: r,
            Vframe: i,
            isString: d
          } = s.r("5u");
        if (d(e) && (e = r(e.replace(/^#/, ""))), e) {
          let t = i.byNode(e);
          if (t) return t.unmount(), !0
        }
        return !1
      },
      destroy() {
        removeEventListener("unhandledrejection", l), s.use(["5u"], (({
                                                                        unboot: t
                                                                      }) => {
          o._o8 = null, t()
        }))
      }
    }
  })(), s.d("6b/9f", (() => ({
  cK: "Align bottom",
  cI: "Align horizontal center",
  cG: "Align left",
  cL: "Align vertical center",
  cH: "Align right",
  cJ: "Align top",
  d0: "Shortcuts",
  c7: " closed",
  c6: " opened",
  c5: "Auto save{0}",
  bH: "Delete help line",
  bJ: "Hide all help lines",
  bI: "Drag move help line",
  bK: "Show all help lines",
  cq: "Apply",
  cr: "Cancel",
  lK: "Enter",
  dc: "Click to show {0}",
  lL: "Close window",
  jA: "Top",
  el: "BC",
  ff: "Circle",
  hM: "IMG",
  go: "Line",
  ia: "Page",
  eC: "QRC",
  iR: "Rect",
  gc: "Text",
  cU: "Help",
  dj: "Clear stage",
  dr: "Align elements",
  cA: "Paste",
  cs: "Select all",
  cF: "Select movable",
  lN: "Animate",
  ej: "Close all panels(Shift+Z)",
  eh: "Close {0} Panel (Number:{1})",
  lO: "DataSource",
  lP: "Elements",
  lQ: "Outline",
  lR: "Properties",
  lS: "History",
  lT: "Structure Tree",
  lU: "Please select",
  gh: "Drag modify height",
  cT: "Preview",
  hE: "Active",
  k2: "Alpha",
  gv: "Height",
  lV: "Help",
  ib: "Unit",
  gw: "Rotate",
  lW: "Type",
  gu: "Width",
  lX: "X",
  lY: "Y",
  d7: "Redo(Ctrl+Y,Ctrl+Shift+Z)",
  c8: "Save",
  lZ: "Search here",
  dZ: `xinglie&nbsp;&copy;&nbsp;2018-${(new Date).getFullYear()}&nbsp;&nbsp;wechat\uff1aqq84685009`,
  cn: "X-Designer",
  l0: "Waiting...",
  cV: "Template",
  dd: "Theme",
  d6: "Undo(Ctrl+Z)",
  id: "Centimeters(cm)",
  ig: "Inches(in)",
  ic: "Millimeters(mm)",
  ih: "Picas(pc)",
  if: "Points(pt)",
  ie: "Pixels(px)",
  ii: "Quarter-mm(q)"
}))), s.d("6b/5r", ["5u", "./9f", "./9g"], (t => {
  let e = t("5u"),
    r = t("./9f"),
    i = t("./9g"),
    {
      has: s,
      config: d,
      Cache: l,
      isArray: o,
      mix: a
    } = e,
    n = a({}, i, r),
    h = {
      en: n,
      "en-us": n,
      zh: i,
      "zh-cn": i
    },
    c = /\{(\d+)\}/g,
    p = new l(400, 100);
  return (t, ...e) => {
    let r = d("lang");
    s(h, r) || (r = "zh");
    let i, l = h[r],
      a = [r, t, ...e].join("\0");
    if (p.has(a)) i = p.get(a);
    else {
      if (o(t)) {
        i = "";
        for (let e of t) i += s(l, e) ? l[e] : e
      } else i = s(l, t) ? l[t] : t, e.length && (i = i.replace(c, ((t, r, i) => (r |= 0, e.length >
      r ? (i = e[r], s(l, i) ? l[i] : i) : t))));
      p.set(a, i)
    }
    return i
  }
})), s.d("6b/9g", (() => ({
  cK: "\u4e0b\u5bf9\u9f50",
  cI: "\u6c34\u5e73\u5c45\u4e2d\u5bf9\u9f50",
  cG: "\u5de6\u5bf9\u9f50",
  cL: "\u5782\u76f4\u5c45\u4e2d\u5bf9\u9f50",
  cH: "\u53f3\u5bf9\u9f50",
  cJ: "\u4e0a\u5bf9\u9f50",
  d0: "\u5feb\u6377\u952e\u5927\u5168",
  c7: "\u5173",
  c6: "\u5f00",
  c5: "\u81ea\u52a8\u4fdd\u5b58{0}",
  d2: "\u5143\u7d20\u95f4\u6c34\u5e73\u5747\u5206\u6392\u5217(\u6309\u4e0bShift\u952e\u5219\u4f7f\u7528\u5143\u7d20\u4e2d\u5fc3\u70b9\u8fdb\u884c\u5747\u5206)",
  d4: "\u5143\u7d20\u5728\u8bbe\u8ba1\u533a\u5185\u6c34\u5e73\u5747\u5206\u6392\u5217(\u6309\u4e0bShift\u952e\u5219\u4f7f\u7528\u5143\u7d20\u4e2d\u5fc3\u70b9\u8fdb\u884c\u5747\u5206\u6216\u6309\u4e0bCtrl\u952e\u5728\u8bbe\u8ba1\u533a\u6c34\u5e73\u5c45\u4e2d)",
  d5: "\u5143\u7d20\u5728\u8bbe\u8ba1\u533a\u5185\u5782\u76f4\u5747\u5206\u6392\u5217(\u6309\u4e0bShift\u952e\u5219\u4f7f\u7528\u5143\u7d20\u4e2d\u5fc3\u70b9\u8fdb\u884c\u5747\u5206\u6216\u6309\u4e0bCtrl\u952e\u5728\u8bbe\u8ba1\u533a\u5782\u76f4\u5c45\u4e2d)",
  d3: "\u5143\u7d20\u95f4\u5782\u76f4\u5747\u5206\u6392\u5217(\u6309\u4e0bShift\u952e\u5219\u4f7f\u7528\u5143\u7d20\u4e2d\u5fc3\u70b9\u8fdb\u884c\u5747\u5206)",
  bH: "\u5220\u9664\u8f85\u52a9\u7ebf",
  bJ: "\u70b9\u51fb\u9690\u85cf\u6240\u6709\u8f85\u52a9\u7ebf",
  bI: "\u62d6\u52a8\u53ef\u79fb\u52a8\u8f85\u52a9\u7ebf",
  bK: "\u70b9\u51fb\u663e\u793a\u6240\u6709\u8f85\u52a9\u7ebf",
  cq: "\u5e94\u7528",
  cr: "\u53d6\u6d88",
  lK: "\u786e\u5b9a",
  ln: "\u7d2f\u8ba1\u5e73\u5747",
  lm: "\u672c\u9875\u5e73\u5747",
  ll: "\u672c\u5355\u5e73\u5747",
  kW: "\u6c42\u5e73\u5747",
  fX: "\u70b9\u51fb\u9009\u4e2d\u5f53\u524d\u683c\u5b50",
  kU: "\u9759\u6001\u6587\u672c",
  lk: "\u672c\u9875\u7d2f\u8ba1",
  li: "\u672c\u9875\u6c42\u548c",
  lj: "\u672c\u5355\u6c42\u548c",
  kV: "\u6c42\u548c",
  dS: "\u60a8\u786e\u8ba4\u6e05\u7a7a\u7f16\u8f91\u533a\u5185\u5bb9\u5417\uff1f",
  lz: "\u70b9\u51fb\u9009\u62e9\u56fe\u7247",
  dc: "\u70b9\u51fb\u663e\u793a{0}",
  lL: "\u5173\u95ed\u7a97\u53e3",
  kQ: "\u6dfb\u52a0\u914d\u8272",
  kO: "\u968f\u673a\u4e00\u4e2a\u989c\u8272",
  kP: "\u79fb\u9664\u5f53\u524d\u914d\u8272",
  dR: "\u60a8\u786e\u8ba4\u65b0\u5efa\u7f16\u8f91\u533a\u5185\u5bb9\u5417\uff1f",
  d1: "\u81ea\u5b9a\u4e49",
  l1: '\u8bf7\u9009\u4e2d\u4e00\u4e2a\u652f\u6301\u6570\u636e\u7ed1\u5b9a\u7684\u7ec4\u4ef6\uff0c\u5982\u6570\u636e\u4e2d\u7684"\u5217\u8868\u683c"\u3001"\u5355\u5143\u683c"\u6216"\u67f1\u72b6\u56fe"',
  lJ: "\u63d0\u793a",
  jC: "\u4e0b",
  jD: "\u5de6",
  kH: "\u5de6\u4e0b",
  kE: "\u5de6\u4e0a",
  jB: "\u53f3",
  kG: "\u53f3\u4e0b",
  kF: "\u53f3\u4e0a",
  jA: "\u4e0a",
  dX: "\u7f16\u8f91\u5185\u5bb9",
  i3: "\u5f27",
  el: "\u6761\u5f62\u7801",
  ez: "\u6279\u91cf\u6761\u7801",
  eG: "\u6279\u91cf\u6587\u672c",
  i8: "\u7535\u6c60",
  jd: "\u8d1d\u585e\u5c142",
  je: "\u8d1d\u585e\u5c143",
  eK: "BWIP",
  eN: "\u65e5\u5386",
  eS: "\u67f1\u72b6\u56fe",
  eX: "Chart.js",
  eZ: "ECharts",
  e0: "\u6f0f\u6597\u56fe",
  e2: "\u6298\u7ebf\u56fe",
  e5: "\u4eea\u8868\u76d8",
  e8: "\u4eea\u8868\u76d82",
  e9: "\u997c\u56fe",
  f_: "\u96f7\u8fbe\u56fe",
  fa: "\u6563\u70b9\u56fe",
  fb: "\u6761\u4ef6\u56fe\u7247",
  ff: "\u5706\u5f62",
  fi: "\u65f6\u949f",
  fm: "\u73af\u5f62\u8fdb\u5ea6",
  gq: "\u66f2\u7ebf",
  f6: "\u8bf7\u7ed1\u5b9a\u6570\u636e",
  fs: "\u5355\u5143\u683c",
  fA: "\u5217\u8868\u683c",
  fJ: "\u6570\u636e\u8868\u683c",
  fZ: "\u81ea\u7531\u8868\u683c",
  f4: "\u6a2a\u7eb5\u91cd\u590d",
  f7: "\u65e5\u671f\u65f6\u95f4",
  fx: "\u5220\u9664\u7ed1\u5b9a\u5b57\u6bb5",
  ji: "\u692d\u5706",
  ey: "\u8bf7\u8f93\u5165\u5185\u5bb9\u6216\u7ed1\u5b9a\u6570\u636e",
  jj: "\u98ce\u6247",
  gk: "\u6ce8\u91ca",
  gl: "\u5361\u7247",
  gm: "\u8fde\u63a5\u7ebf",
  gA: "\u6570\u636e",
  gB: "\u6570\u636e\u5e93",
  gC: "\u5224\u5b9a",
  gF: "\u5c55\u793a",
  gG: "\u6587\u6863",
  gH: "\u5916\u90e8\u6570\u636e",
  gI: "\u5185\u90e8\u5b58\u50a8",
  gJ: "\u5faa\u73af\u9650\u503c",
  gK: "\u4eba\u5de5\u8f93\u5165",
  gL: "\u4eba\u5de5\u64cd\u4f5c",
  gM: "\u8de8\u9875\u5f15\u7528",
  gN: "\u5e76\u884c\u6a21\u5f0f",
  gO: "\u9884\u5907",
  gP: "\u8fc7\u7a0b",
  gQ: "\u961f\u5217\u6570\u636e",
  gR: "\u9875\u5185\u5f15\u7528",
  gS: "\u5b50\u6d41\u7a0b",
  gT: "\u6761\u5e26",
  gU: "\u5f00\u59cb\u7ed3\u675f",
  gV: "\u590d\u9009\u6846",
  g6: "\u6570\u636e\u91c7\u96c6",
  hc: "\u4e0b\u62c9\u6846",
  hg: "\u8f93\u5165\u6846",
  hk: "\u5355\u9009\u6846",
  hl: "\u516c\u5f0f",
  hm: "\u51fd\u6570",
  hB: "H-Flex",
  jn: "\u5fc3\u5f62",
  hv: "\u70ed\u5ea6",
  hG: "HTML",
  hH: "Iframe",
  l2: "\u4f7f\u7528\u56fe\u7247\u5c3a\u5bf8",
  hS: "\u8bf7\u9009\u62e9\u6216\u7ed1\u5b9a\u56fe\u7247",
  hM: "\u56fe\u7247",
  go: "\u76f4\u7ebf",
  h3: "\u6b63\u5728\u8f7d\u5165\u7b2c\u4e09\u65b9\u7ec4\u4ef6...",
  hU: "\u8fb9\u6846",
  hV: "\u9884\u8bbe\u56fe\u7247",
  hW: "\u5730\u56fe",
  i_: "\u5e8f\u53f7\u5668",
  h4: "\u6570\u5b57\u8c03\u8282",
  ia: "\u7f16\u8f91\u533a",
  iJ: "\u9875\u7801\u5668",
  iM: "\u89e6\u538b\u6309\u94ae",
  jT: "\u5706\u997c",
  jp: "\u6db2\u4f53\u7ba1\u9053",
  gp: "\u6298\u7ebf",
  hy: "\u9875\u811a",
  hA: "\u9875\u5934",
  iK: "\u8fdb\u5ea6\u6761",
  eC: "\u4e8c\u7ef4\u7801",
  iO: "\u8bc4\u5206",
  iR: "\u77e9\u5f62",
  iT: "\u8bf7\u9009\u62e9\u6216\u7ed1\u5b9a\u80cc\u666f\u56fe\u7247",
  iS: "\u80cc\u666f\u56fe",
  f5: "\u5bcc\u6587\u672c",
  iV: "\u6807\u5c3a",
  fe: "\u8bf7\u8bbe\u7f6e\u89c4\u5219",
  i2: "\u4fe1\u53f7\u706f",
  jW: "\u4fe1\u53f7",
  i0: "\u7b7e\u540d",
  j0: "\u626c\u58f0\u5668",
  jw: "\u7bad\u5934",
  jf: "\u5927\u62ec\u53f7",
  jy: "\u6c14\u6ce1",
  jg: "\u5706",
  jG: "\u62d0\u89d2",
  jH: "\u5341\u5b57",
  jI: "\u7acb\u65b9\u4f53",
  jM: "\u5706\u67f1",
  jO: "\u53cc\u7bad\u5934",
  j5: "\u4e94\u89d2\u661f",
  jo: "\u7ebf\u6bb5",
  jS: "\u6708\u7259",
  jP: "\u56db\u8fb9\u5f62",
  jU: "\u661f\u661f",
  hC: "\u8868\u683c",
  hD: "Tabs",
  kb: "\u6807\u7b7e\u4e91",
  j6: "\u6db2\u7f50",
  gc: "\u6587\u672c",
  k_: "\u4e09\u89d2\u5f62",
  hF: "V-Flex",
  kl: "\u8bf7\u8f93\u5165\u89c6\u9891\u5730\u5740",
  kf: "\u89c6\u9891",
  km: "\u5929\u6c14",
  ka: "WiFi",
  kp: "Excel",
  cm: "\u6b63\u5728\u5bfc\u51fa...",
  co: "\u5bfc\u51fa\u6210\u529f~",
  bP: "\u4eff\u5b8b",
  b5: "\u624b\u672d\u4f53-\u7b80",
  b4: "\u7fe9\u7fe9\u4f53-\u7b80",
  b2: "\u51ac\u9752\u9ed1\u4f53\u7b80",
  bO: "\u6977\u4f53",
  b3: "\u5170\u4ead\u9ed1-\u7b80",
  bQ: "\u96b6\u4e66",
  bN: "\u5fae\u8f6f\u96c5\u9ed1",
  bR: "\u82f9\u65b9",
  bM: "\u9ed1\u4f53",
  bL: "\u5b8b\u4f53",
  b6: "\u5b8b\u4f53-\u7b80",
  bW: "\u534e\u6587\u4eff\u5b8b",
  bS: "\u534e\u6587\u9ed1\u4f53",
  bY: "\u534e\u6587\u7425\u73c0",
  bU: "\u534e\u6587\u6977\u4f53",
  b0: "\u534e\u6587\u96b6\u4e66",
  bV: "\u534e\u6587\u5b8b\u4f53",
  bT: "\u534e\u6587\u7ec6\u9ed1",
  b1: "\u534e\u6587\u884c\u6977",
  bZ: "\u534e\u6587\u65b0\u9b4f",
  bX: "\u534e\u6587\u4e2d\u5b8b",
  b7: "\u5a03\u5a03\u4f53-\u7b80",
  b8: "\u9b4f\u7891-\u7b80",
  b9: "\u884c\u6977-\u7b80",
  c_: "\u5706\u4f53-\u7b80",
  bG: "\u6c34\u5e73",
  bF: "\u5782\u76f4",
  cU: "\u5e2e\u52a9",
  dg: "\u6dfb\u52a0<{0}>\u8f85\u52a9\u7ebf",
  df: "\u6e05\u9664\u5168\u90e8\u8f85\u52a9\u7ebf",
  dj: "\u6e05\u7a7a\u7f16\u8f91\u533a",
  dh: "\u5220\u9664<{0}>\u8f85\u52a9\u7ebf",
  dt: "\u6dfb\u52a0<{0}>",
  dr: "\u5bf9\u9f50\u5143\u7d20",
  dL: "<{0}>\u6dfb\u52a0\u52a8\u753b",
  dN: "<{0}>\u4fee\u6539\u52a8\u753b",
  dM: "<{0}>\u5220\u9664\u52a8\u753b",
  dI: "\u6c34\u5e73\u5747\u5206<\u591a\u4e2a\u5143\u7d20>",
  dJ: "\u5782\u76f4\u5747\u5206<\u591a\u4e2a\u5143\u7d20>",
  dG: "\u526a\u5207<{0}>",
  dH: "\u514b\u9686<{0}>",
  dp: "\u9009\u4e2d<{0}>",
  dv: "\u7ec4\u5408\u5143\u7d20",
  dx: "\u7f16\u8f91\u9501\u5b9a<{0}>",
  do: "\u53d6\u6d88\u9009\u4e2d<{0}>",
  dC: "\u4fee\u6539<{0}>\u63a7\u5236\u70b9",
  dD: "\u4fee\u6539<{0}>\u8c03\u6574\u70b9",
  dF: "\u4fee\u6539<{0}>\u5c5e\u6027",
  dE: "\u4fee\u6539<{0}>\u5c3a\u5bf8",
  dq: "\u79fb\u52a8<{0}>",
  dA: "\u7c98\u8d34<{0}>",
  du: "\u5220\u9664<{0}>",
  dB: "\u65cb\u8f6c<{0}>",
  ds: "\u540c\u6b65\u5143\u7d20\u5c3a\u5bf8",
  dw: "\u53d6\u6d88\u7ec4\u5408\u5143\u7d20",
  dy: "\u53d6\u6d88\u7f16\u8f91\u9501\u5b9a<{0}>",
  dz: "\u8c03\u6574<{0}>Z\u8f74",
  dQ: "\u81ea\u5b9a\u4e49\u6a21\u677f",
  dO: "\u6a21\u677f<{0}>",
  dP: "\u521d\u59cb<{0}>",
  de: "\u521d\u59cb\u72b6\u6001",
  di: "\u79fb\u52a8<{0}>\u8f85\u52a9\u7ebf",
  dn: "\u65b0\u5efa\u7f16\u8f91\u533a",
  dk: "\u653e\u5927\u7f16\u8f91\u533a",
  dl: "\u7f29\u5c0f\u7f16\u8f91\u533a",
  dm: "\u8fd8\u539f\u7f16\u8f91\u533a",
  l3: "\u70b9\u51fb\u8fd8\u539f\u5230{0}",
  dK: "\u540c\u6b65<{0}>\u5c5e\u6027",
  f8: "\u8bed\u8a00",
  g_: "\u82f1\u6587",
  f9: "\u4e2d\u6587",
  lB: "\u56fe\u7247\u5e93",
  lA: "\u83b7\u53d6\u56fe\u7247\u5c3a\u5bf8\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5\uff5e\uff5e",
  ef: "\u9006\u65f6\u9488\u65cb\u8f6c\u589e\u52a0{0}\u5ea6\uff0c\u6309\u4e0bctrl\u589e\u52a0{1}\u5ea6(\u6309\u4e0bshift\u952e\u5438\u9644\u5230{0}\u7684\u500d\u6570\u4e0a\uff0c\u6309\u4e0bctrl+shift\u952e\u5438\u9644\u5230{1}\u7684\u500d\u6570\u4e0a)",
  cS: "\u6e05\u7a7a\u683c\u5b50",
  cC: "\u6e05\u7a7a\u7f16\u8f91\u533a",
  eg: "\u987a\u65f6\u9488\u65cb\u8f6c\u589e\u52a0{0}\u5ea6\uff0c\u6309\u4e0bctrl\u589e\u52a0{1}\u5ea6(\u6309\u4e0bshift\u952e\u5438\u9644\u5230{0}\u7684\u500d\u6570\u4e0a\uff0c\u6309\u4e0bctrl+shift\u952e\u5438\u9644\u5230{1}\u7684\u500d\u6570\u4e0a)",
  cM: "\u7ec4\u5408",
  cN: "\u53d6\u6d88\u7ec4\u5408",
  ct: "\u590d\u5236",
  cu: "\u526a\u5207",
  cB: "\u5220\u9664",
  cz: "\u514b\u9686",
  ea: "\u5f53\u524d\u72b6\u6001\uff1a\u901a\u8fc7\u5c5e\u6027\u9762\u677f\u4fee\u6539\u5750\u6807\u65f6\uff0c\u7ec4\u5408\u4e2d\u7684\u5176\u5b83\u5143\u7d20\u4e0d\u968f\u7740\u4fee\u6539",
  e_: "\u5f53\u524d\u72b6\u6001\uff1a\u901a\u8fc7\u5c5e\u6027\u9762\u677f\u4fee\u6539\u5750\u6807\u65f6\uff0c\u7ec4\u5408\u4e2d\u7684\u5176\u5b83\u5143\u7d20\u968f\u7740\u4fee\u6539",
  d8: "\u7ec4\u5408\u9009\u4e2d\u5143\u7d20",
  db: "\u4ece\u672c\u5730\u6587\u4ef6\u5bfc\u5165",
  l4: "\u5f53\u524d\u72b6\u6001\uff1a\u4fee\u6539\u5143\u7d20\u5c3a\u5bf8\u65f6\uff0c\u4e0d\u4fdd\u6301\u7b49\u6bd4\u4fee\u6539",
  l5: "\u5f53\u524d\u72b6\u6001\uff1a\u4fee\u6539\u5143\u7d20\u5c3a\u5bf8\u65f6\uff0c\u4fdd\u6301\u7b49\u6bd4\u4fee\u6539",
  eb: "\u9501\u5b9a\u7f16\u8f91",
  cy: "\u4e0b\u79fb\u4e00\u5c42",
  cx: "\u4e0a\u79fb\u4e00\u5c42",
  cD: "\u65b0\u5efa\u7f16\u8f91\u533a",
  ee: "\u5f53\u524d\u72b6\u6001\uff1a\u4e0d\u5c55\u793a\u666e\u901a\u5143\u7d20\u7684\u8f6e\u5ed3\u7ebf",
  ed: "\u5f53\u524d\u72b6\u6001\uff1a\u5c55\u793a\u666e\u901a\u5143\u7d20\u7684\u8f6e\u5ed3\u7ebf",
  cA: "\u7c98\u8d34",
  cE: "\u53cd\u9009",
  cs: "\u5168\u9009",
  cF: "\u5168\u9009(\u53ef\u79fb\u52a8)",
  cP: "\u9ad8\u4f5c\u4e3a\u5bbd",
  cR: "\u540c\u9ad8",
  cO: "\u5bbd\u4f5c\u4e3a\u9ad8",
  cQ: "\u540c\u5bbd",
  cw: "\u79fb\u81f3\u5e95\u5c42",
  cv: "\u79fb\u81f3\u9876\u5c42",
  d9: "\u53d6\u6d88\u7ec4\u5408\u5143\u7d20",
  ec: "\u89e3\u9501\u7f16\u8f91",
  c3: "\u591a\u4e2a\u5143\u7d20",
  kA: "\u5220\u9664\u5f53\u524d\u683c\u5b50",
  kJ: "\u4e0b\u65b9\u6dfb\u52a0\u683c\u5b50",
  ky: "\u5de6\u4fa7\u6dfb\u52a0\u683c\u5b50",
  kz: "\u53f3\u4fa7\u6dfb\u52a0\u683c\u5b50",
  kI: "\u4e0a\u65b9\u6dfb\u52a0\u683c\u5b50",
  kK: "\u5de6\u4fa7\u6dfb\u52a0\u5217",
  kL: "\u53f3\u4fa7\u6dfb\u52a0\u5217",
  kx: "\u4e0b\u65b9\u6dfb\u52a0\u884c",
  kw: "\u4e0a\u65b9\u6dfb\u52a0\u884c",
  kN: "\u5411\u4e0b\u5408\u5e76\u683c\u5b50",
  kB: "\u5411\u5de6\u5408\u5e76\u683c\u5b50",
  kC: "\u5411\u53f3\u5408\u5e76\u683c\u5b50",
  kM: "\u5411\u4e0a\u5408\u5e76\u683c\u5b50",
  kD: "\u62c6\u5206\u683c\u5b50",
  lH: "\u53ef\u4ee5\u8f93\u5165\u6216\u7c98\u8d34\u5341\u516d\u8fdb\u5236\u7684\u989c\u8272\u503c",
  lI: "\u70b9\u51fb\u4f7f\u7528\u5438\u7ba1\u5438\u53d6\u989c\u8272",
  lp: "\u62d6\u52a8\u6570\u636e\u6e90\u5b57\u6bb5\u5230\u8fd9\u91cc",
  kv: "\u5782\u76f4\u5c45\u4e0b",
  kr: "\u6c34\u5e73\u5c45\u4e2d",
  kq: "\u6c34\u5e73\u5c45\u5de6",
  ku: "\u5782\u76f4\u5c45\u4e2d",
  ks: "\u6c34\u5e73\u5c45\u53f3",
  kt: "\u5782\u76f4\u5c45\u4e0a",
  lt: "\u52a0\u7c97",
  lu: "\u659c\u4f53",
  lx: "\u4e0a\u5212\u7ebf",
  lw: "\u5220\u9664\u7ebf",
  lv: "\u4e0b\u5212\u7ebf",
  lr: "\u5c45\u4e2d",
  lq: "\u5c45\u5de6",
  ls: "\u5c45\u53f3",
  kR: "\u8bf7\u5148\u7ed1\u5b9a\u6570\u636e",
  lF: "\u9ad8\u5ea6\u5747\u5206",
  lE: "\u5bbd\u5ea6\u5747\u5206",
  lC: "\u70b9\u51fb\u9690\u85cf{0}\u8fb9\u6846",
  lD: "\u70b9\u51fb\u663e\u793a{0}\u8fb9\u6846",
  lb: "\u5220\u9664\u5f53\u524d\u5217",
  la: "\u5220\u9664\u5f53\u524d\u884c",
  k9: "\u5de6\u4fa7\u6dfb\u52a0\u5217",
  l_: "\u53f3\u4fa7\u6dfb\u52a0\u5217",
  k8: "\u4e0b\u65b9\u6dfb\u52a0\u884c",
  k7: "\u4e0a\u65b9\u6dfb\u52a0\u884c",
  lh: "\u5411\u4e0b\u5408\u5e76\u5355\u5143\u683c",
  le: "\u5411\u5de6\u5408\u5e76\u5355\u5143\u683c",
  lf: "\u5411\u53f3\u5408\u5e76\u5355\u5143\u683c",
  lg: "\u5411\u4e0a\u5408\u5e76\u5355\u5143\u683c",
  lc: "\u6c34\u5e73\u62c6\u5206\u5355\u5143\u683c",
  ld: "\u5782\u76f4\u62c6\u5206\u5355\u5143\u683c",
  l6: "\u4e00\u952e\u540c\u6b65\u4e0b\u5217\u5c5e\u6027",
  lN: "\u52a8\u753b",
  c4: "\u57fa\u7840\u5c5e\u6027",
  ej: "\u5173\u95ed\u6240\u6709\u9762\u677f(Shift+Z)",
  eh: "\u5173\u95ed{0}\u9762\u677f(\u6570\u5b57\u952e{1})",
  lO: "\u6570\u636e\u6e90",
  l7: "\u6309\u4e0b\u79fb\u52a8{0}\u9762\u677f",
  lP: "\u5143\u7d20",
  l8: "\u62d6\u52a8\u6539\u53d8\u9762\u677f\u5bbd\u5ea6",
  l9: "\u5c55\u5f00{0}\u9762\u677f(Shift+\u6570\u5b57\u952e{1})",
  m_: "\u70b9\u51fb\u67e5\u770b{0}\u7684\u8bf4\u660e",
  ma: "\u62d6\u52a8\u6539\u53d8\u9762\u677f\u9ad8\u5ea6",
  ek: "\u6253\u5f00\u6240\u6709\u9762\u677f(Shift+Z)",
  ei: "\u6253\u5f00{0}\u9762\u677f(\u6570\u5b57\u952e{1})",
  lQ: "\u6982\u89c8\u56fe",
  lR: "\u5c5e\u6027",
  mb: "\u53ea\u8bfb\u5143\u7d20\u4e0d\u80fd\u9009\u4e2d\u548c\u62d6\u52a8\u6392\u5e8f",
  lS: "\u5386\u53f2\u64cd\u4f5c",
  mc: "\u6298\u53e0{0}\u9762\u677f(Shift+\u6570\u5b57\u952e{1})",
  lT: "\u7ed3\u6784\u6811",
  md: "\u4e0d\u80fd\u653e\u7f6e",
  me: "\u677e\u5f00\u653e\u5728\u683c\u5b50\u91cc",
  mf: "\u677e\u5f00\u653e\u5728\u7f16\u8f91\u533a",
  dY: "\u9884\u8bbe\u5185\u5bb9",
  fz: "\u62d6\u52a8\u4fee\u6539\u683c\u5b50\u9ad8\u5ea6",
  fy: "\u62d6\u52a8\u4fee\u6539\u683c\u5b50\u5bbd\u5ea6",
  gD: "\u62d6\u52a8\u4fee\u6539\u63a7\u5236\u70b9",
  gh: "\u62d6\u52a8\u4fee\u6539\u5143\u7d20\u9ad8\u5ea6",
  gf: "\u62d6\u52a8\u65cb\u8f6c\u5143\u7d20",
  gi: "\u62d6\u52a8\u4fee\u6539\u5143\u7d20\u5bbd\u5ea6\u548c\u9ad8\u5ea6",
  gg: "\u62d6\u52a8\u4fee\u6539\u5143\u7d20\u5bbd\u5ea6",
  hb: "\u62d6\u52a8\u4fee\u6539Excel\u9876\u90e8\u6807\u9898\u9ad8\u5ea6",
  ha: "\u62d6\u52a8\u4fee\u6539Excel\u5de6\u4fa7\u6807\u9898\u5bbd\u5ea6",
  gE: "\u62d6\u52a8\u4e0e\u5176\u5b83\u5143\u7d20\u8fde\u7ebf\u6216\u677e\u5f00\u8fde\u63a5\u5230\u8be5\u70b9",
  gj: "\u62d6\u52a8\u4fee\u6539\u8c03\u6574\u70b9",
  fY: "\u62d6\u52a8\u4fee\u6539\u7559\u767d\u9ad8\u5ea6",
  cT: "\u9884\u89c8",
  mg: "\u6d4f\u89c8\u5668\u6253\u5370",
  mh: "\u8f6c\u6362\u5185\u5bb9\u4e3a",
  ch: "\u6bcf\u9875\u6253\u5370",
  cl: "\u5076\u6570\u9875\u6253\u5370",
  ci: "\u9996\u9875\u6253\u5370",
  cj: "\u5c3e\u9875\u6253\u5370",
  mi: "\u8bf7\u4f20\u9012 id \u53c2\u6570\u4e14\u914d\u7f6e getContentUrl \u5e76\u786e\u4fdd\u63a5\u53e3\u6709\u6570\u636e\u8fd4\u56de",
  ck: "\u5947\u6570\u9875\u6253\u5370",
  mj: "\u6b63\u5728\u51c6\u5907\u57fa\u7840\u9875\u9762...",
  mk: "RDS\u6253\u5370",
  ml: "RDS\u8bbe\u7f6e",
  mm: "\u9759\u9ed8\u6253\u5370",
  mn: "\u72ec\u7acb\u4f7f\u7528",
  hE: "\u9009\u4e2d",
  hK: "\u7b56\u7565",
  k2: "\u900f\u660e\u5ea6",
  eJ: "\u9002\u5e94\u9ad8\u5ea6",
  in: "\u81ea\u9002\u5e94",
  f3: "\u884c\u9ad8\u68c0\u6d4b",
  ki: "\u81ea\u52a8\u64ad\u653e",
  iy: "\u80cc\u666f\u56fe\u7247",
  iA: "\u5e73\u94fa\u65b9\u5f0f",
  eV: "\u80cc\u666f\u989c\u8272",
  iL: "\u8fdb\u5ea6\u989c\u8272",
  hw: "\u67f1\u5b50\u4e2a\u6570",
  hx: "\u67f1\u5b50\u5bbd\u5ea6",
  eo: "\u7f16\u7801\u683c\u5f0f",
  mo: "\u6279\u91cf<{0}>",
  j_: "\u5145\u7535\u4e2d",
  jb: "\u7535\u91cf\u989c\u8272",
  jc: "\u95ea\u7535\u989c\u8272",
  ja: "\u7535\u6c60\u989c\u8272",
  i9: "\u7535\u91cf",
  en: "\u7ed1\u5b9a\u5b57\u6bb5",
  e4: "X\u8f74\u7ed1\u5b9a",
  e3: "Y\u8f74\u7ed1\u5b9a",
  fg: "\u8fb9\u6846\u989c\u8272",
  iq: "\u5706\u89d2",
  cc: "\u865a\u7ebf",
  cb: "\u70b9\u7ebf",
  ce: "\u53cc\u8fb9\u6846",
  cd: "\u9686\u8d77",
  ca: "\u5b9e\u7ebf",
  mp: "\u8fb9\u6846\u7c7b\u578b",
  fn: "\u8fb9\u6846\u5bbd\u5ea6",
  hJ: "\u8fb9\u6846",
  h9: "\u6309\u94ae\u6587\u5b57",
  fU: "\u5e73\u5747\u5206\u914d",
  fV: "\u4e0d\u5206\u914d",
  fT: "\u5360\u6bd4\u5206\u914d",
  fS: "\u5bbd\u5ea6\u5206\u914d",
  k3: "\u683c\u5b50\u80cc\u666f",
  kT: "\u683c\u5b50\u8ba1\u7b97",
  kS: "\u683c\u5b50\u5185\u5bb9",
  fR: "\u6570\u636e\u68c0\u6d4b",
  fw: "\u683c\u5b50\u64cd\u4f5c",
  ft: "\u683c\u5b50\u5747\u5206",
  hz: "\u683c\u5b50\u9ad8",
  fu: "\u683c\u5b50\u5c3a\u5bf8",
  eT: "\u56fe\u8868\u6807\u9898",
  fj: "\u8868\u76d8\u989c\u8272",
  fk: "\u6307\u9488\u989c\u8272",
  fl: "\u523b\u5ea6\u989c\u8272",
  mq: "\u95ed\u5408",
  e1: "\u914d\u8272",
  eW: "\u989c\u8272",
  gn: "\u8fde\u7ebf\u7c7b\u578b",
  kX: "\u5185\u5bb9\u4f4d\u7f6e",
  g3: "\u81ea\u52a8",
  g5: "\u9690\u85cf",
  g4: "\u663e\u793a",
  g2: "\u5185\u5bb9\u6ea2\u51fa",
  kk: "\u663e\u793a\u63a7\u5236",
  jV: "\u89d2",
  jN: "\u67f1\u4f53\u989c\u8272",
  f0: "\u6570\u636e\u6e90",
  hh: "\u9ed8\u8ba4\u6587\u672c",
  ho: "\u7981\u7528\u7f29\u653e",
  iN: "\u53d1\u9001\u6570\u636e",
  jZ: "\u65ad\u7f51\u989c\u8272",
  gW: "\u8bc6\u522b\u540d\u79f0",
  gZ: "\u5782\u76f4",
  gY: "\u6c34\u5e73",
  gX: "\u6392\u5217\u65b9\u5f0f",
  it: "\u62d6\u52a8\u78c1\u5438",
  i7: "\u7ed3\u675f\u89d2\u5ea6",
  gs: "\u7ed3\u675f\u7bad\u5934",
  iZ: "\u7ed3\u675f\u8fb9\u6846",
  g8: "\u6807\u9898\u80cc\u666f",
  h_: "\u5de6\u6807\u9898\u5bbd",
  g9: "\u9876\u6807\u9898\u9ad8",
  g7: "Excel\u6807\u9898",
  he: "\u6269\u5c55\u6837\u5f0f",
  hd: "\u6269\u5c55\u6807\u8bb0",
  fh: "\u586b\u5145\u989c\u8272",
  eq: "\u586b\u5145\u65b9\u5f0f",
  kd: "\u6392\u5217",
  fq: "\u5b57\u4f53",
  fp: "\u5b57\u53f7",
  ew: "\u6587\u5b57\u6837\u5f0f",
  fL: "\u6700\u540e\u663e\u5c3e",
  fr: "\u6587\u5b57\u989c\u8272",
  k5: "\u8ba1\u7b97\u51fd\u6570",
  ga: "\u5feb\u6377\u683c\u5f0f",
  eH: "\u8f93\u51fa\u683c\u5f0f",
  jK: "\u524d\u90e8\u989c\u8272",
  io: "\u62c9\u4f38\u94fa\u6ee1",
  jz: "\u7f3a\u53e3\u65b9\u5411",
  jE: "\u7f3a\u53e3\u4f4d\u7f6e",
  jF: "\u7f3a\u53e3\u5927\u5c0f",
  iw: "\u7f51\u683c\u989c\u8272",
  iv: "\u7f51\u683c\u9ad8",
  ix: "\u5438\u9644\u7f51\u683c",
  iu: "\u7f51\u683c\u5bbd",
  eA: "\u6c34\u5e73\u95f4\u9694",
  fK: "\u521d\u59cb\u663e\u5934",
  gv: "\u9ad8",
  lV: "\u5e2e\u52a9",
  fQ: "\u9690\u85cf\u5c3e",
  fM: "\u9690\u85cf\u5934",
  fN: "\u9690\u85cf\u6807\u9898",
  f2: "\u9690\u85cf\u8868\u5c3e",
  f1: "\u9690\u85cf\u8868\u5934",
  fP: "\u9690\u85cf\u5408\u8ba1",
  fo: "\u9ad8\u4eae\u989c\u8272",
  iG: "\u56fe\u7247\u9ad8",
  hP: "\u56fe\u7247\u5c3a\u5bf8",
  iF: "\u56fe\u7247\u5bbd",
  hO: "\u56fe\u7247",
  g0: "\u9009\u9879\u95f4\u8ddd",
  k6: "\u5b57\u95f4\u8ddd",
  e7: "\u5706\u89d2\u5316",
  es: "\u7ebf\u6761\u989c\u8272",
  mr: "\u865a\u7ebf\u95f4\u9694",
  kc: "\u884c\u9ad8",
  ms: "\u659c\u89d2",
  mt: "\u5c16\u89d2",
  mu: "\u5706\u89d2",
  mv: "\u62d0\u89d2",
  gt: "\u6587\u5b57",
  hT: "\u7ebf\u7c7b\u578b",
  et: "\u7ebf\u6761\u5bbd",
  mw: "\u5f53\u524d\u7a97\u53e3",
  mx: "\u65b0\u7a97\u53e3",
  my: "\u81ea\u5b9a\u4e49\u5f39\u7a97",
  mz: "\u6253\u5f00\u65b9\u5f0f",
  mA: "\u5f39\u7a97\u9ad8",
  mB: "\u5f39\u7a97\u5bbd",
  mC: "\u94fe\u63a5",
  ju: "\u6db2\u4f53\u989c\u8272",
  j7: "\u6db2\u4f4d",
  mD: "\u9501\u5b9a\u7f16\u8f91",
  iW: "\u957f",
  kj: "\u5faa\u73af\u64ad\u653e",
  h2: "\u53cc\u51fb\u7f29\u653e",
  h1: "\u80fd\u5426\u62d6\u52a8",
  hZ: "\u7eac\u5ea6",
  hY: "\u7ecf\u5ea6",
  h0: "\u663e\u793a\u7f29\u653e",
  hX: "\u7f29\u653e\u7ea7\u522b",
  hf: "\u591a\u9009",
  hj: "\u591a\u884c\u6a21\u5f0f",
  fW: "\u591a\u680f\u6253\u5370",
  j4: "\u9759\u97f3\u989c\u8272",
  j1: "\u9759\u97f3",
  iB: "\u4e0d\u5e73\u94fa",
  h5: "\u5c0f\u6570\u4f4d",
  h8: "\u6700\u5927\u503c",
  h7: "\u6700\u5c0f\u503c",
  h6: "\u6b65\u957f",
  mE: "\u5b98\u65b9\u7f51\u7ad9",
  iH: "\u6c34\u5e73\u504f\u79fb",
  iI: "\u5782\u76f4\u504f\u79fb",
  mF: "\u64cd\u4f5c",
  eY: "\u914d\u7f6e",
  k0: "\u4e0b\u8fb9\u8ddd",
  k1: "\u5de6\u8fb9\u8ddd",
  kZ: "\u53f3\u8fb9\u8ddd",
  kY: "\u4e0a\u8fb9\u8ddd",
  hn: "\u7f51\u683c",
  ik: "\u5e38\u7528\u7eb8\u5f20",
  im: "\u5168\u5c4f\u663e\u793a",
  is: "\u9875\u9762\u6807\u9898",
  ib: "\u5355\u4f4d",
  ij: "\u7f16\u8f91\u533a",
  i1: "\u7b7e\u5b57\u989c\u8272",
  js: "\u7ba1\u9053\u989c\u8272",
  jq: "\u6d41\u52a8",
  jv: "\u6db2\u4f53\u95f4\u9694",
  jt: "\u6db2\u4f53\u5bbd",
  jr: "\u7ba1\u9053\u5bbd",
  hi: "\u5360\u4f4d\u6587\u672c",
  iz: "\u5957\u6253",
  eL: "\u9884\u8bbe\u503c",
  ir: "\u6253\u5370\u4efd\u6570",
  mG: "\u6253\u5370\u8bbe\u7f6e",
  eD: "\u6697\u8272",
  eE: "\u4eae\u8272",
  eF: "\u7ea0\u9519\u7ea7\u522b",
  jh: "\u534a\u5f84",
  mH: "\u53c2\u8003",
  gb: "\u8f93\u51fa\u65b9\u5f0f",
  mI: "PNG\u56fe\u7247",
  mJ: "SVG\u77e2\u91cf\u56fe",
  ep: "\u8f93\u51fa\u683c\u5f0f",
  iC: "\u6a2a\u5411\u5e73\u94fa",
  iD: "\u5782\u76f4\u5e73\u94fa",
  iE: "\u53cc\u5411\u5e73\u94fa",
  jm: "\u53cd\u5411\u65cb\u8f6c",
  eI: "\u5bcc\u6587\u672c",
  hQ: "\u5782\u76f4\u955c\u50cf",
  hR: "\u6c34\u5e73\u955c\u50cf",
  gw: "\u65cb\u8f6c\u89d2\u5ea6",
  jk: "\u65cb\u8f6c",
  jQ: "\u6c34\u5e73\u5706\u89d2",
  jR: "\u5782\u76f4\u5706\u89d2",
  i4: "\u6c34\u5e73\u534a\u5f84",
  i5: "\u5782\u76f4\u534a\u5f84",
  hL: "\u6c99\u7bb1",
  il: "\u5206\u8fa8\u7387",
  ip: "\u5feb\u6377\u5706\u89d2",
  fO: "\u6bcf\u9875\u6807\u9898",
  e6: "\u663e\u793a\u8fdb\u5ea6",
  er: "\u663e\u793a\u6587\u5b57",
  jL: "\u4fa7\u90e8\u989c\u8272",
  jY: "\u4fe1\u53f7\u5f3a\u5ea6",
  j3: "\u97f3\u91cf\u989c\u8272",
  jl: "\u901f\u5ea6",
  iU: "\u81ea\u52a8\u5206\u9875",
  iP: "\u661f\u661f\u4e2a\u6570",
  iQ: "\u661f\u661f\u5927\u5c0f",
  i6: "\u5f00\u59cb\u89d2\u5ea6",
  gr: "\u5f00\u59cb\u7bad\u5934",
  iY: "\u5f00\u59cb\u8fb9\u6846",
  kn: "\u6837\u5f0f\u6807\u8bc6",
  jx: "\u71d5\u5c3e",
  fH: "\u5076\u6570\u884c",
  eQ: "\u5185\u5bb9\u5b57\u53f7",
  fI: "\u5947\u6570\u884c",
  fG: "\u5185\u5bb9\u884c\u9ad8",
  fE: "\u5185\u5bb9\u5bf9\u9f50",
  cf: "\u5408\u5e76",
  mK: "\u8fb9\u6846\u884c\u4e3a",
  cg: "\u5206\u79bb",
  fv: "\u8fb9\u6846\u663e\u793a",
  fB: "\u5217\u5bbd",
  fC: "\u7559\u767d",
  eO: "\u8868\u5934\u5b57\u53f7",
  eP: "\u8868\u5934\u80cc\u666f",
  fF: "\u8868\u5934\u884c\u9ad8",
  fD: "\u5feb\u6377\u76ae\u80a4",
  ex: "\u6587\u5b57\u5bf9\u9f50",
  em: "\u5185\u5bb9",
  ev: "\u6587\u5b57\u8ddd\u79bb",
  gx: "\u7ebf\u4e0a\u4f4d\u7f6e",
  eu: "\u6587\u5b57\u4f4d\u7f6e",
  iX: "\u6587\u5b57\u89d2\u5ea6",
  g1: "\u5185\u5bb9\u95f4\u8ddd",
  k4: "\u6587\u672c",
  gd: "\u7eaf\u5c55\u793a",
  ge: "\u5b9e\u65f6",
  eU: "\u6807\u9898\u5bf9\u9f50",
  mL: "\u5143\u7d20\u540d\u79f0",
  jJ: "\u9876\u90e8\u989c\u8272",
  lW: "\u7c7b\u578b",
  ke: "\u9ed1\u767d",
  eM: "\u6269\u5c55\u53c2\u6570",
  hI: "\u7f51\u5740",
  eB: "\u5782\u76f4\u95f4\u9694",
  kh: "\u6d77\u62a5\u5730\u5740",
  kg: "\u89c6\u9891\u5730\u5740",
  j2: "\u97f3\u91cf",
  j9: "\u5bb9\u5668\u989c\u8272",
  j8: "\u58c1\u5bbd",
  ko: "\u5929\u6c14\u76ae\u80a4",
  hN: "\u7f51\u7edc\u56fe\u7247",
  eR: "\u5f00\u59cb\u65e5\u671f",
  gu: "\u5bbd",
  jX: "\u8054\u7f51",
  hq: "X\u8f74\u8303\u56f4",
  hp: "X\u8f74\u6807\u9898",
  ht: "X\u63d0\u793a\u7ebf",
  gy: "\u6c34\u5e73\u504f\u79fb",
  lX: "X\u5750\u6807",
  hs: "Y\u8f74\u8303\u56f4",
  hr: "Y\u8f74\u6807\u9898",
  hu: "Y\u63d0\u793a\u7ebf",
  gz: "\u5782\u76f4\u504f\u79fb",
  lY: "Y\u5750\u6807",
  mM: "H\u7ea7\u522b",
  mN: "L\u7ea7\u522b",
  mO: "M\u7ea7\u522b",
  mP: "Q\u7ea7\u522b",
  dW: "\u6b63\u5728\u8bfb\u53d6\u5185\u5bb9...",
  d7: "\u91cd\u505a(Ctrl+Y,Ctrl+Shift+Z)",
  lo: "\u70b9\u51fb\u5220\u9664\u7ed1\u5b9a\u7684{{0}}",
  lG: "\u6e05\u9664\u989c\u8272",
  mQ: "\u70b9\u51fb\u5220\u9664\u5143\u7d20",
  mR: "\u70b9\u51fb\u5220\u9664\u5386\u53f2\u8bb0\u5f55",
  ly: "\u6e05\u9664\u56fe\u7247",
  mS: "\u6e05\u9664\u5173\u952e\u5b57",
  fd: "\u672a\u627e\u5230{0}\u5bf9\u5e94\u7684\u89c4\u5219",
  fc: "\u672a\u8bbe\u7f6e{0}\u5bf9\u5e94\u7684\u56fe\u7247",
  cp: "\u7f16\u8f91\u533a\u6570\u636e",
  dT: "\u4fdd\u5b58\u5931\u8d25\uff1a",
  c9: "\u66f4\u591a\u4fdd\u5b58\u9009\u9879",
  dU: "\u4fdd\u5b58\u6210\u529f~",
  da: "\u5bfc\u51fa\u5230\u672c\u5730\u6587\u4ef6",
  c8: "\u4fdd\u5b58",
  lZ: "\u641c\u7d22\u6570\u636e\u6e90",
  lM: "\u641c\u7d22...",
  dV: "\u8bf7\u9009\u62e9\u6570\u636e\u6e90",
  d_: "\u5feb\u6377\u952e\uff1a",
  dZ: `\u884c\u5217&nbsp;&copy;&nbsp;2018-${(new Date).getFullYear()}&nbsp;&nbsp;\u6388\u6743\u6216\u6e90\u7801\u8bf7\u8054\u7cfb\u4f5c\u8005\u5fae\u4fe1\uff1aqq84685009`,
  cn: "\u901a\u7528\u8bbe\u8ba1\u5668",
  l0: "\u7cfb\u7edf\u6b63\u5fd9...",
  c2: "\u6b63\u5728\u83b7\u53d6\u5185\u5bb9...",
  cV: "\u6a21\u677f",
  dd: "\u4e3b\u9898",
  d6: "\u64a4\u9500(Ctrl+Z)",
  id: "\u5398\u7c73(cm)",
  ig: "\u82f1\u5bf8(in)",
  ic: "\u6beb\u7c73(mm)",
  ih: "\u6d3e\u5361(pc)",
  if: "\u70b9(pt)",
  ie: "\u50cf\u7d20(px)",
  ii: "1/4\u6beb\u7c73(q)",
  cX: "Ctrl+\u52a0\u53f7",
  cW: "\u653e\u5927",
  cZ: "Ctrl+\u51cf\u53f7",
  cY: "\u7f29\u5c0f",
  c1: "Ctrl+\u6570\u5b570",
  c0: "\u8fd8\u539f"
}))), s.d("5s/7r", ["5u"], (t => {
  let e = t("5u"),
    {
      Service: r,
      toUrl: i,
      config: s,
      HIGH: d,
      State: l
    } = e,
    o = (t, e) => {
      let r, i;
      return t.success ? i = t.data : r = t.message || `\u63a5\u53e3${e}\u9519\u8bef`, {
        _eD: r,
        _eE: i
      }
    },
    a = r.extend(((t, e) => {
      l.fire("b8", {
        _eF: 1
      });
      let r = t.get("_eG") || "GET",
        d = t.get("_dI"),
        a = t.get("_ei"),
        n = t.get("url"),
        h = {
          Accept: "application/json",
          "Content-type": "application/x-www-form-urlencoded;charset=utf-8"
        },
        c = {
          method: r,
          credentials: "include"
        };
      t.get("_eH") || (c.headers = h);
      let p = s("version");
      n = i(n, {
        ...d,
        v: p
      }), a && (c.body = a), ((t, e) => fetch(t, e).then((t => {
        if (t.ok) return t.json();
        throw Error(t.statusText || "Network error")
      })))(n, c).then((r => {
        l.fire("b8");
        let {
          _eD: i,
          _eE: s
        } = o(r, n);
        i ? e({
          message: i
        }) : (t.set({
          data: s
        }), e())
      })).catch((t => {
        l.fire("b8"), e({
          message: t.message
        })
      }))
    }));
  return a.add([{
    name: "_eI",
    url: s("getImageUrl"),
    cache: 60 * d
  }, {
    name: "_eo",
    url: s("getFieldUrl")
  }, {
    name: "_dH",
    url: s("getTemplateUrl"),
    cache: 60 * d
  }, {
    name: "_eh",
    url: s("saveContentUrl"),
    _eG: "post"
  }, {
    name: "_er",
    url: s("getContentUrl")
  }, {
    name: "_es",
    url: s("presetUrl")
  }, {
    name: "_eu"
  }, {
    name: "_eJ",
    _eG: "post"
  }]), a._eK = o, a
})), s.d("5s/62", ["5u", "./60"], (t => {
  let e = t("5u"),
    r = t("./60"),
    {
      State: i,
      node: s,
      has: d
    } = e,
    {
      sqrt: l,
      pow: o,
      atan: a,
      PI: n,
      sin: h,
      cos: c,
      min: p,
      max: u,
      atan2: f,
      tan: g,
      abs: b
    } = Math,
    $ = n / 180,
    m = {
      tl: 2,
      tm: 2,
      tr: 3,
      br: 0,
      bm: 0,
      bl: 1,
      mr: 3,
      ml: 1
    },
    y = () => s("_rd_sc").getBoundingClientRect();
  return {
    bF: y,
    bJ({
         x: t,
         y: e
       }) {
      let r = y();
      return {
        x: t = t - r.x - scrollX,
        y: e = e - r.y - scrollY
      }
    },
    bL(t, {
      x: e,
      y: r,
      f: i
    }) {
      let s = t;
      if (i)
        for (; s.parentNode && "hod" != s.dataset.as;) s = s.parentNode;
      let d = s.getBoundingClientRect();
      return {
        x: e = e - d.x - scrollX,
        y: r = r - d.y - scrollY
      }
    },
    bM({
         x: t,
         y: e
       }) {
      let r = y();
      return {
        x: t = t + r.x + scrollX,
        y: e = e + r.y + scrollY
      }
    },
    bI(t) {
      let e = t / i.get("bJ");
      return r.bK(e)
    },
    bN: t => t * i.get("bJ"),
    bG({
         x: t,
         y: e,
         width: r,
         height: i,
         rotate: s
       }) {
      s || (s = 0);
      let d = l(o(r, 2) + o(i, 2)) / 2,
        f = r ? 180 * a(i / r) / n : 90,
        g = 180 - s - f,
        b = f - s,
        m = 90 - s,
        y = r / 2,
        x = i / 2,
        _ = t + y,
        w = e + x,
        k = {
          x: _ + d * c(g * $),
          y: w - d * h(g * $)
        },
        v = {
          x: _ + d * c(b * $),
          y: w - d * h(b * $)
        },
        L = {
          x: _ - d * c(g * $),
          y: w + d * h(g * $)
        },
        F = {
          x: _ - d * c(b * $),
          y: w + d * h(b * $)
        },
        S = {
          x: _ + x * c(m * $),
          y: w - x * h(m * $)
        },
        C = {
          x: _ + y * c(s * $),
          y: w + y * h(s * $)
        },
        H = {
          x: _ - x * h(s * $),
          y: w + x * c(s * $)
        },
        M = {
          x: _ - y * c(s * $),
          y: w - y * h(s * $)
        },
        G = p(k.x, v.x, L.x, F.x),
        T = u(k.x, v.x, L.x, F.x),
        A = p(k.y, v.y, L.y, F.y),
        z = u(k.y, v.y, L.y, F.y);
      return {
        _ck: [k, v, L, F],
        _eN: [S, C, H, M],
        _bP: T - G,
        _bQ: z - A,
        _cm: G,
        _dN: T,
        _cn: A,
        _dO: z,
        _cC: _,
        _cD: w
      }
    },
    bO: (t, e) => (360 + 180 * f(t.y - e.y, t.x - e.x) / n) % 360,
    bP: t => m[t],
    bQ(t, e, r) {
      let i = l(o(t.x - e.x, 2) + o(t.y - e.y, 2));
      return {
        x: e.x + i * c(r * $),
        y: e.y + i * h(r * $)
      }
    },
    bR(t, e, r) {
      let i = g(r * $);
      return {
        k: i,
        b: e - t * i
      }
    },
    bS(t, e, r, i) {
      let s = (i - e) / (r - t);
      return {
        k: s,
        b: e - t * s
      }
    },
    bT: (t, e) => l(o(t.x - e.x, 2) + o(t.y - e.y, 2)),
    bK(t, e) {
      let [r, i] = t, [s, d] = e, l = ((i.x - r.x) * (s.y - r.y) - (i.y - r.y) * (s.x - r.x)) * ((i.x -
        r.x) * (d.y - r.y) - (i.y - r.y) * (d.x - r.x)), o = ((d.x - s.x) * (r.y - s.y) - (d.y -
        s.y) * (r.x - s.x)) * ((d.x - s.x) * (i.y - s.y) - (d.y - s.y) * (i.x - s.x));
      return l < 0 && o < 0
    },
    bH(t, e, r) {
      let i = t.width / 2,
        s = t.height / 2,
        d = e.width / 2,
        l = e.height / 2,
        o = t.x + i,
        a = t.y + s,
        n = e.x + d,
        h = e.y + l,
        c = r ? -1 : 1;
      return b(n - o) <= i + c * d && b(h - a) <= s + c * l
    },
    bU(t) {
      if (!t._eM) {
        let e = [],
          r = 1;
        for (;;) {
          let i = "ctrl" + r++;
          if (!d(t, i + "X")) break;
          e.push(i)
        }
        t._eM = e
      }
      return t._eM
    }
  }
})), s.d("5s/60", ["5u", "./6h"], (t => {
  let e = t("5u"),
    r = t("./6h"),
    {
      State: i
    } = e,
    {
      round: s,
      pow: d,
      abs: l
    } = Math,
    o = document.body,
    a = 1e-7,
    n = {
      px: 0,
      mm: 2,
      cm: 3,
      pt: 2,
      in: 3,
      pc: 3,
      q: 1
    },
    h = {
      px: {
        bF: 1,
        bG: 1
      }
    },
    c = t => {
      if (!h[t]) {
        let e = document.createElement("div"),
          r = 1e3;
        e.style.cssText = `width:${r}${t};position:absolute;left:-${r}${t};top:-10px`, o.appendChild(
          e);
        let i = e.offsetWidth;
        o.removeChild(e);
        let s = r / i,
          d = i / r;
        h[t] = {
          bF: s,
          bG: d
        }
      }
    },
    p = (t, e) => (e = e || i.get("bK"), c(e), t * h[e].bG);
  return {
    bW: 50,
    bP: 800,
    bX: 1,
    bY: 1,
    bZ: 1,
    b0: 1,
    b1: 1,
    b2: 1,
    bM: 1,
    bV: 1,
    b3: 1,
    b4: [80, 450, 220, 240],
    b5: 1,
    b6: 1,
    b7: 0,
    b8: 1,
    b9: 793,
    c_: 1122,
    bI: 1e4,
    bJ: 1e4,
    ca: 80,
    cb: 80,
    cc: 20,
    cd: 5,
    ce: 1,
    cf: r.bH,
    cg: r.bI | r.bJ,
    ch: 0,
    ci: 1,
    bT: 0,
    cj: 20,
    ck: 20,
    cl: 60,
    cm: 60,
    cn: 10,
    co: 10,
    cp: 200,
    bL: 20,
    bH: 1,
    bG: 4,
    cq: .5,
    cr: .5,
    cs: !1,
    ct: 0,
    cu: 1e3,
    cv: 0,
    cw: 120,
    cx: 500,
    bO: 1,
    bN: 10,
    cy: 1,
    cz: 5,
    cA: 8,
    cB: 45,
    cC: 4,
    cD: 1,
    cE: 1,
    bR: 10,
    cF: 3,
    cG: 200,
    cH: 0,
    cI: 3,
    cJ: 1,
    cK: 12,
    cL: 1,
    cM: [{
      value: "simsun",
      style: "font-family:simsun",
      text: "bL"
    }, {
      value: "simhei",
      style: "font-family:simhei",
      text: "bM"
    }, {
      value: "microsoft yahei",
      style: "font-family:microsoft yahei",
      text: "bN"
    }, {
      value: "kaiti",
      style: "font-family:kaiti",
      text: "bO"
    }, {
      value: "fangsong",
      style: "font-family:fangsong",
      text: "bP"
    }, {
      value: "lisu",
      style: "font-family:lisu",
      text: "bQ"
    }, {
      value: "times new roman",
      style: "font-family:times new roman",
      text: "Times New Roman"
    }, {
      value: "tahoma",
      style: "font-family:tahoma",
      text: "Tahoma"
    }, {
      value: "manrope",
      style: "font-family:manrope",
      text: "Manrope"
    }, {
      value: "monospace",
      style: "font-family:monospace",
      text: "Monospace"
    }, {
      value: "fantasy",
      style: "font-family:fantasy",
      text: "Fantasy"
    }, {
      value: "cursive",
      style: "font-family:cursive",
      text: "Cursive"
    }, {
      value: "kano",
      style: "font-family:kano",
      text: "Kano"
    }, {
      value: "pingfang sc",
      text: "bR",
      style: "font-family:pingfang sc"
    }, {
      value: "stheiti",
      text: "bS",
      style: "font-family:stheiti"
    }, {
      value: "stxihei",
      text: "bT",
      style: "font-family:stxihei"
    }, {
      value: "stkaiti",
      text: "bU",
      style: "font-family:stkaiti"
    }, {
      value: "stsong",
      text: "bV",
      style: "font-family:stsong"
    }, {
      value: "stfangsong",
      text: "bW",
      style: "font-family:stfangsong"
    }, {
      value: "stzhongsong",
      text: "bX",
      style: "font-family:stzhongsong"
    }, {
      value: "sthupo",
      text: "bY",
      style: "font-family:sthupo"
    }, {
      value: "stxinwei",
      text: "bZ",
      style: "font-family:stxinwei"
    }, {
      value: "stliti",
      text: "b0",
      style: "font-family:stliti"
    }, {
      value: "stxingkai",
      text: "b1",
      style: "font-family:stxingkai"
    }, {
      value: "hiragino sans gb",
      text: "b2",
      style: "font-family:hiragino sans gb"
    }, {
      value: "lantinghei sc",
      text: "b3",
      style: "font-family:lantinghei sc"
    }, {
      value: "hanzipen sc",
      text: "b4",
      style: "font-family:hanzipen sc"
    }, {
      value: "hannotate sc",
      text: "b5",
      style: "font-family:hannotate sc"
    }, {
      value: "songti sc",
      text: "b6",
      style: "font-family:songti sc"
    }, {
      value: "wawati sc",
      text: "b7",
      style: "font-family:wawati sc"
    }, {
      value: "weibei sc",
      text: "b8",
      style: "font-family:weibei sc"
    }, {
      value: "xingkai sc",
      text: "b9",
      style: "font-family:xingkai sc"
    }, {
      value: "yuanti sc",
      text: "c_",
      style: "font-family:yuanti sc"
    }],
    cN: [{
      text: "ca",
      value: "solid"
    }, {
      text: "cb",
      value: "dotted"
    }, {
      text: "cc",
      value: "dashed"
    }, {
      text: "cd",
      value: "ridge"
    }, {
      text: "ce",
      value: "double"
    }],
    cO: [{
      text: "cf",
      value: "collapse"
    }, {
      text: "cg",
      value: "separate"
    }],
    cP: [{
      text: "ch",
      value: "each"
    }, {
      text: "ci",
      value: "first"
    }, {
      text: "cj",
      value: "last"
    }, {
      text: "ck",
      value: "odd"
    }, {
      text: "cl",
      value: "even"
    }],
    cQ: "mm",
    cR: 1,
    bS: t => (t = t || i.get("bK"), c(t), h[t].bF),
    cS: t => (t = t || i.get("bK"), n[t]),
    bK(t, e, r) {
      r = r || i.get("bK"), null == e && (e = n[r]);
      let l = d(10, e);
      return s(t *= l) / l
    },
    bF: (t, e) => (e = e || i.get("bK"), c(e), t *= h[e].bF),
    cT: a,
    cU: (t, e) => t < e ? l(t - e) < a : 1,
    bQ: (t, e) => l(t - e) < a,
    bU: p,
    cV(t) {
      let e = p((t => (t = t || i.get("bK"), 1 / d(10, n[t])))(t));
      return e > .5 && (e = .5), e
    },
    cW(t, e, r) {
      r = r || i.get("bK"), c(r), c(e);
      let s = h[r],
        d = h[e];
      return t * s.bG * d.bF
    }
  }
})), s.d("5s/6h", (() => ({
  bF: 1,
  bK: 2,
  bR: 4,
  bJ: 1,
  bS: 2,
  bI: 4,
  bM: 1,
  bH: 2,
  bT: 1,
  bP: 2,
  bO: 4,
  bQ: 8,
  bU: 16,
  bV: 32,
  bW: 64,
  bL: 128,
  bX: 256,
  bN: 512,
  bY: 1024,
  bZ: 2048,
  bG: 4096,
  b0: 1,
  b1: 2,
  b2: 3,
  b3: 4,
  b4: 6,
  b5: 7,
  b6: 8,
  b7: 9,
  b8: 10,
  b9: 11,
  c_: 12,
  ca: "6s/5r",
  cb: "5t/5r",
  cc: "6t/5t",
  cd: "6t/6u",
  ce: "6v/5r",
  cf: "70/5r",
  cg: "70/fx",
  ch: "6j/71",
  ci: "72/6k",
  cj: "72/73",
  ck: "72/74",
  cl: "72/75",
  cm: "72/76",
  cn: "77/6u",
  co: "77/78",
  cp: "77/74",
  cq: "77/79",
  cr: "77/7a",
  cs: "77/7b",
  ct: "77/7c",
  cu: "72/6u",
  cv: "7d/5r",
  cw: "7e/7f",
  cx: "7g/73",
  cy: "7g/6k",
  cz: "7h/73",
  cA: "7h/6k",
  cB: "7i/73",
  cC: "fx/5r",
  cD: "fx/7j",
  cE: "svg/kp",
  cF: "svg/mod",
  cG: "tab/5r",
  cH: "tag/5r",
  cI: "7k/5r",
  cJ: "7l/5r",
  cK: "7m/5r",
  cL: "7n/5r",
  cM: "7o/5r",
  cN: "6v/7p",
  cO: "pbtn/5r"
}))), s.d("6o/barcode/5r", ["5u", "../../5s/60", "../../6c/barcode"], (t => {
  let e = t("5u"),
    r = t("../../5s/60"),
    i = t("../../6c/barcode"),
    s = {
      class: "rd-cW rd-cA rd-c0 rd-dk"
    },
    {
      View: d,
      mark: l,
      task: o,
      isArray: a
    } = e;
  return d.extend({
    tmpl({
           error: t,
           text: e,
           props: r,
           unit: i,
           am: d,
           render: l
         }, o, a) {
      let n, h, c, p = [];
      return (t || e) && (c = [], t ? (h = [o(0, t)], c.push(o("div", s, h))) : "svg" == l ?
        c.push(o("svg", {
          id: `_rd_${a}_bar`,
          class: "rd-cB rd-cz rd-cA rd-cK"
        })) : (n = "rd-b5 rd-cB rd-cC", "full" == r.fill && (n += " rd-cz rd-cA"), c.push(
          o("img", {
            id: `_rd_${a}_bar`,
            class: n
          }, 1))), n = "rd-cG rd-dS rd-d7", "auto" == r.fill && (n +=
        " rd-cW rd-c0 rd-dk"), p.push(o("div", {
        style: `left:${r.x}${i};top:${r.y}${i};height:${r.height}${i};opacity:${r.alpha};width:${r.width}${i};transform:rotate(${r.rotate}deg);` +
          d(r.animations),
        class: n
      }, c))), o(a, 0, p)
    },
    assign(t) {
      let {
        props: e
      } = t, {
        bind: r,
        text: i
      } = e;
      if (r.id) {
        let t = r.fields[0];
        if (r._tip) i = r._tip;
        else if (r._data) {
          let e = r._data;
          a(e) && (e = e[0]), i = e[t.key]
        } else i = `[bind:${t.key}]`
      }
      this.set(t, {
        text: i
      })
    },
    async render() {
      let t = l(this, "_bF"),
        {
          linewidth: e,
          height: s,
          format: d,
          showText: a,
          styleBold: n,
          styleItalic: h,
          color: c,
          textPosition: p,
          textAlign: u,
          font: f,
          textMargin: g,
          fontsize: b,
          render: $
        } = this.get("props"),
        m = this.get("text"),
        y = JSON.stringify({
          linewidth: e,
          height: s,
          format: d,
          showText: a,
          styleBold: n,
          styleItalic: h,
          color: c,
          textPosition: p,
          textAlign: u,
          font: f,
          text: m,
          fontsize: b,
          textMargin: g,
          render: $
        }),
        x = y != this._fW;
      this._fW = y, await this.digest({
        error: null,
        render: $
      });
      try {
        await i._fX(), t() && m && x && (t = l(this, "_fY"), o((() => {
          if (t()) {
            b = r.bU(b), g = r.bU(g), e = r.bU(e), s = r.bU(s);
            let t = "";
            n && (t = "bold"), h && (n && (t += " "), t += "italic");
            try {
              JsBarcode(`#_rd_${this.id}_bar`, m, {
                height: s,
                fontSize: b,
                lineColor: c,
                width: e,
                textPosition: p,
                textAlign: u,
                format: d,
                fontOptions: t,
                displayValue: a,
                font: f,
                textMargin: g
              })
            } catch (t) {
              this.digest({
                error: t
              })
            }
          }
        })))
      } catch (e) {
        t() && this.digest({
          error: e
        })
      }
    }
  })
})), s.d("6o/calendar/5r", ["5u", "../../66/6a/5r"], (t => {
  let e = t("5u"),
    r = t("../../66/6a/5r"),
    i = {
      class: "rd-cz rd-cA rd-cE rd-dw"
    },
    {
      View: s
    } = e,
    d = "\u65e5\u4e00\u4e8c\u4e09\u56db\u4e94\u516d".split("");
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           weekText: s,
           weeks: d
         }, l, o) {
      let a, n, h, c, p, u, f;
      p = [], h = [];
      for (let r = null == s ? void 0 : s.length, i = 0; i < r; i += 1) {
        n = [l(0, s[i])], h.push(l("td", {
          style: `font-size:${t.theadFontsize}${e};background:` + t.theadRowBackground
        }, n))
      }
      p.push(l("tr", 0, h));
      for (let r = null == d ? void 0 : d.length, i = 0; i < r; i += 1) {
        let r = d[i];
        h = [];
        for (let i = null == r ? void 0 : r.length, s = 0; s < i; s += 1) {
          let i = r[s],
            d = `${i.year}-${i.month}-${i.day}`;
          c = "", i.otherMonth || (c += ` ${i.day} `), n = [l(0, c)], h.push(l("td", {
            style: "font-size:" + t.tbodyFontsize + e,
            title: !i.otherMonth && d
          }, n))
        }
        p.push(l("tr", 0, h))
      }
      return u = [l("tbody", 0, p)], f = [l("table", i, u)], a = [l("div", {
        class: "rd-cG rd-d7 rd-dS",
        style: `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);` +
          r(t.animations)
      }, f)], l(o, 0, a)
    },
    init() {
      let t = this.render.bind(this);
      r._b0(3e5, t), this.on("destroy", (() => {
        r._bZ(t)
      }))
    },
    assign(t) {
      let e = t.props.weekStart,
        r = d.slice(e);
      e > 0 && (r = r.concat(d.slice(0, e))), this.set(t, {
        weekText: r,
        weekStart: e
      })
    },
    render() {
      let t = new Date,
        e = t.getFullYear(),
        r = t.getMonth() + 1,
        i = t.getDate();
      t.setHours(0, 0, 0, 0);
      let s, d = (7 - this.get("weekStart") + new Date(e, r - 1, 1).getDay()) % 7,
        l = [],
        o = [],
        a = ((t, e) => 32 - new Date(t, e - 1, 32).getDate())(e, r);
      for (s = 1; s <= d; s++) o.push({
        otherMonth: !0
      });
      for (s = 1; s <= a; s++) o.push({
        year: e,
        day: s,
        month: r
      }), (s + d) % 7 == 0 && (l.push(o), o = []);
      let n = o.length;
      if (n) {
        let t = 7;
        for (s = n; s < t && (o.push({
          otherMonth: !0
        }), (s + 1) % 7 != 0 || (l.push(o), o = [], 6 != l.length)); s++);
      }
      this.digest({
        year: e,
        month: r,
        day: i,
        weeks: l
      })
    }
  })
})), s.d("6o/bwip/5r", ["5u", "../subs/bwip"], (t => {
  let e = t("5u");
  t("../subs/bwip");
  let {
    View: r,
    isArray: i
  } = e;
  return r.extend({
    tmpl({
           props: t,
           unit: e,
           am: r
         }, i, s, d, l, o) {
      let a;
      return a = [i("div", {
        $$: "props",
        _5: s,
        class: "rd-cG rd-d7 rd-cW rd-c0 rd-dk",
        style: `left:${t.x}${e};top:${t.y}${e};width:${t.width}${e};height:${t.height}${e};opacity:${t.alpha};transform:rotate(${t.rotate}deg);` +
          r(t.animations),
        _: "6o/subs/bwip?props=" + o(l, t, "a/")
      })], i(s, 0, a)
    },
    assign(t) {
      this.set(t)
    },
    render() {
      let t = this.get("props"),
        {
          bind: e
        } = t;
      if (e && e._data) {
        let r = e._data;
        i(r) && (r = r[0]), t.bwipValue = r[e.fields[0].key]
      }
      this.digest()
    }
  })
})), s.d("6o/circle/5r", ["5u"], (t => t("5u").View.extend({
  tmpl({
         props: t,
         unit: e,
         bw: r,
         am: i
       }, s, d) {
    let l, o;
    return o = `border-radius:50%;left:${t.x}${e};top:${t.y}${e};`, r && (o +=
      `border:${r}${e} ${t.bordertype} ${t.bordercolor};`), t.fillcolor && (o +=
      `background:${t.fillcolor};`), o +=
      `height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);` +
      i(t.animations), l = [s("div", {
      class: "rd-cG rd-d7",
      style: o
    })], s(d, 0, l)
  },
  assign(t) {
    let {
      props: e
    } = t, {
      borderwidth: r,
      width: i,
      height: s
    } = e, d = this.get("mmin")(i, s) / 2;
    r > d && (r = d), this.set(t, {
      bw: r
    })
  },
  render() {
    this.digest()
  }
}))), s.d("6o/cimage/5r", ["5u", "../../6c/6d"], (t => {
  let e = t("5u"),
    r = t("../../6c/6d"),
    {
      View: i,
      isArray: s,
      dispatch: d,
      mark: l,
      toNumber: o
    } = e;
  return i.extend({
    tmpl({
           props: t,
           text: e,
           unit: r,
           am: i,
           rmap: s,
           value: d
         }, l, o, a, n, h) {
      let c, p, u, f = [],
        g = t.x,
        b = t.y,
        $ = t.width,
        m = t.height,
        y = t.alpha,
        x = t.rotate,
        _ = t.rules;
      if (e) c = [l(0, e)], f.push(l("div", {
        class: "rd-dS rd-d7 rd-cG rd-cW rd-c0 rd-dk",
        style: `left:${g}${r};top:${b}${r};height:${m}${r};opacity:${y};width:${$}${r};transform:rotate(${x}deg);` +
          i(t.animations)
      }, c));
      else
        for (let e = null == _ ? void 0 : _.length, a = 0; a < e; a += 1) {
          let e = _[a];
          if (null == s ? void 0 : s[e.use](d, e.value)) {
            e.image && (p = "rd-b5 rd-cG rd-d7", e.send && (p += " rd-do rd-bO"), u =
              `left:${g}${r};top:${b}${r};height:${m}${r};opacity:${y};width:${$}${r};transform:rotate(${x}deg)`,
            e.mx && (u += " rotateX(180deg)"), e.my && (u += " rotateY(180deg)"),
              u += ";" + i(t.animations), f.push(l("img", {
              draggable: "false",
              src: e.image,
              _click: e.send && o +
                `\x1e_gc({rule:'${h(n,e,`a/.${a}.a;`)}'})`,
              class: p,
              style: u
            }, 1)));
            break
          }
        }
      return l(o, 0, f)
    },
    init() {
      this.set({
        rmap: r.cG
      })
    },
    assign(t) {
      let {
        props: e
      } = t, {
        bind: r,
        value: i
      } = e, d = "";
      if (r.id) {
        let t = r.fields[0];
        if (r._tip) d = r._tip;
        else if (r._data) {
          let e = r._data;
          s(e) && (e = e[0]), i = e[null == t ? void 0 : t.key]
        }
      }
      this.set(t, {
        text: d,
        value: i
      })
    },
    render() {
      this.digest()
    },
    async "_gc<click>"({
                         params: t
                       }) {
      var e;
      let r = this.root,
        i = l(this, "_ga"),
        s = d(r, "presend", {
          rule: t.rule
        }),
        a = await (null === (e = s._gb) || void 0 === e ? void 0 : e.call(s));
      i() && (a = o(a), d(r, "send", {
        value: a
      }))
    }
  })
})), s.d("6o/clock/5r", ["5u", "../../66/6a/5r"], (t => {
  let e, r = t("5u"),
    i = t("../../66/6a/5r"),
    s = "div",
    {
      View: d,
      applyStyle: l,
      mark: o,
      node: a,
      State: n
    } = r;
  return l("rd-db",
    ".rd-fZ{border-radius:50%}.rd-f0{height:2px;border-radius:1px;width:calc(50% + 3px);top:calc(50% - 1px);left:calc(50% - 15px);transform-origin:15px center}.rd-f1{height:4px;border-radius:2px;width:calc(50% - 15px);top:calc(50% - 2px);left:calc(50% - 12px);transform-origin:12px center}.rd-f2{height:6px;border-radius:3px;width:calc(50% - 25px);top:calc(50% - 3px);left:calc(50% - 10px);transform-origin:10px center}.rd-f3{height:6px;background:#fff6;box-shadow:0 0 0 2px #0006;border-radius:50%;width:6px;top:calc(50% - 3px);left:calc(50% - 3px)}.rd-f4,.rd-f5,.rd-f6,.rd-f7,.rd-f8,.rd-f9{left:4px;top:calc(50% - 2px);height:4px;width:calc(100% - 8px);border-left:4px solid;border-right:4px solid}.rd-f5{transform:rotate(30deg)}.rd-f6{transform:rotate(60deg)}.rd-f7{transform:rotate(90deg)}.rd-f8{transform:rotate(120deg)}.rd-f9{transform:rotate(150deg)}"
  ), d.extend({
    tmpl({
           props: t,
           unit: r,
           scale: i,
           am: d
         }, l, o) {
      let a, n, h;
      return h = [l(s, {
        class: "rd-f4 rd-cG",
        style: "border-color:" + t.markColor
      }), l(s, {
        class: "rd-f5 rd-cG",
        style: "border-color:" + t.markColor
      }), l(s, {
        class: "rd-f6 rd-cG",
        style: "border-color:" + t.markColor
      }), l(s, {
        class: "rd-f7 rd-cG",
        style: "border-color:" + t.markColor
      }), l(s, {
        class: "rd-f8 rd-cG",
        style: "border-color:" + t.markColor
      }), l(s, {
        class: "rd-f9 rd-cG",
        style: "border-color:" + t.markColor
      }), l(s, {
        class: "rd-f2 rd-cG",
        id: "_rd_h_" + o,
        style: "background-color:" + t.handleColor
      }), l(s, {
        class: "rd-f1 rd-cG",
        id: "_rd_m_" + o,
        style: "background-color:" + t.handleColor
      }), l(s, {
        class: "rd-f0 rd-cG",
        id: "_rd_s_" + o,
        style: "background-color:" + t.handleColor
      })], e ? h.push(e) : h.push(e = l(s, {
        $: "a/",
        class: "rd-f3 rd-cG"
      })), n =
        `left:${t.x}${r};top:${t.y}${r};height:${t.height/i}${r};opacity:${t.alpha};width:${t.width/i}${r};background-color:${t.dialColor};`,
      1 != i && (n += `transform:scale(${i});transform-origin:0 0;`), n += d(t.animations),
        a = [l(s, {
          class: "rd-cG rd-d7 rd-fZ",
          style: n
        }, h)], l(o, 0, a)
    },
    assign(t) {
      this.set(t)
    },
    async render() {
      let t = o(this, "_bF");
      if (await this.digest({
        scale: n.get("bJ") || 1
      }), t()) {
        let t = a("_rd_s_" + this.id),
          e = a("_rd_m_" + this.id),
          r = a("_rd_h_" + this.id),
          s = () => {
            let i = new Date,
              s = (1e3 * i.getSeconds() + i.getMilliseconds()) / 1e3,
              d = (60 * i.getMinutes() + s) / 60,
              l = (60 * i.getHours() + d) / 60;
            t.style.transform = `rotate(${6*s-90}deg)`, e.style.transform =
              `rotate(${6*d-90}deg)`, r.style.transform = `rotate(${30*l-90}deg)`
          };
        i._b0(32, s), this.on("destroy", (() => {
          i._bZ(s)
        }))
      }
    }
  })
})), s.d("6o/cprogress/5r", ["5u", "../../5s/60", "../../66/6a/fx", "../pbar/5r"], (t => {
  let e = t("5u"),
    r = t("../../5s/60"),
    i = t("../../66/6a/fx"),
    s = t("../pbar/5r"),
    d = "50%",
    l = "none",
    o = "circle",
    {
      node: a
    } = e,
    {
      PI: n
    } = Math;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           radius: i,
           border: s,
           center: a,
           d1: n,
           d2: h,
           text: c,
           value: p
         }, u, f) {
      let g, b, $, m;
      return m = [], m.push(u(o, {
        cx: d,
        cy: d,
        r: i,
        fill: l,
        stroke: t.background,
        "stroke-width": s
      }, 1)), b = "", t.roundCap ? b += "round" : b += "butt", m.push(u(o, {
        cx: d,
        cy: d,
        r: i,
        fill: l,
        stroke: t.fillcolor,
        transform: `rotate(-90 ${a} ${a})`,
        "stroke-width": s,
        "stroke-dasharray": n + "," + h,
        id: "_rd_" + f,
        "stroke-linecap": b
      }, 1)), t.showText && ($ = [u(0, c || p + "%")], m.push(u("text", {
        x: d,
        y: d,
        style: "text-anchor:middle;dominant-baseline:middle",
        "font-family": t.fontfamily,
        "font-size": t.fontsize + e,
        fill: t.forecolor
      }, $))), g = [u("svg", {
        class: "rd-cG",
        style: `width:${t.width}${e};height:${t.height}${e};opacity:${t.alpha};left:${t.x}${e};top:${t.y}${e};` +
          r(t.animations)
      }, m)], u(f, 0, g)
    },
    init() {
      let t = new i(200, (t => {
        let e = t(this._gd, this._ge);
        this._gf = e;
        let r = this.get("radius"),
          i = 2 * n * r,
          s = i * e,
          d = i - s;
        a(`_rd_${this.id}`).setAttribute("stroke-dasharray", `${s},${d}`)
      }));
      this._gg = t, this.on("destroy", (() => {
        t._fm()
      }))
    },
    assign(t) {
      var e;
      let i = this._gh(t),
        {
          props: {
            width: s,
            border: d
          }
        } = t;
      d = r.bU(d);
      let l = r.bU(s),
        o = this.get("mmax"),
        a = null !== (e = this._gf) && void 0 !== e ? e : 0,
        h = i / 100,
        c = o((l - d) / 2, 0),
        p = 2 * n * c,
        u = p * a,
        f = p - u;
      this._gg._fm(), this._gd = a, this._ge = h, this.set(t, {
        border: d,
        center: l / 2,
        radius: c,
        d1: u,
        d2: f
      })
    },
    async render() {
      await this.digest(), this._gd != this._ge && this._gg._gi()
    }
  })
})), s.d("6o/data-coltable/92", (() => ({
  _gz: 120,
  _gA: 200,
  _gB: 100
}))), s.d("6o/data-coltable/5r", ["5u"], (t => {
  let e, r, i = t("5u"),
    s = "rd-dx rd-en rd-cT rd-dv",
    d = "tr",
    l = "thead",
    o = "td",
    a = "tbody";
  return i.View.extend({
    tmpl({
           props: t,
           unit: i,
           am: n
         }, h, c) {
      var p, u, f;
      let g, b, $, m, y, x;
      if (x = [], null === (u = null === (p = t.bind) || void 0 === p ? void 0 : p.fields) ||
      void 0 === u ? void 0 : u.length) {
        m = [];
        for (let e = t.bind.fields, r = null == e ? void 0 : e.length, d = 0; d < r; d += 1) {
          let r = e[d];
          $ = [h(0, r.name)], b =
            `width:${t.columns[r.key]}${i};border-color:${t.bordercolor};text-align:${t.cellAlign};height:${t.theadRowHeight}${i};line-height:${t.theadRowHeight}${i};font-size:${t.theadFontsize}${i};color:${t.theadForecolor};`,
          t.theadRowBackground && (b += "background:" + t.theadRowBackground), m.push(
            h("th", {
              class: s,
              style: b
            }, $))
        }
        if (y = [h(d, 0, m)], x.push(h(l, 0, y)), y = [], t.bind)
          if (t.bind._tip) $ = [h(0, t.bind._tip)], m = [h(o, {
            class: "rd-dx rd-en rd-dP rd-cE rd-dY rd-cT rd-dv",
            colspan: t.bind.fields.length,
            style: `border-color:${t.bordercolor};height:${t.loadingHeight}${i};line-height:${t.loadingHeight}${i};font-size:` +
              t.theadFontsize + i
          }, $)], y.push(h(d, 0, m));
          else
            for (let e = t.bind._data, r = null == e ? void 0 : e.length, l = 0; l < r; l +=
              1) {
              let r = e[l];
              m = [];
              for (let e = t.bind.fields, d = null == e ? void 0 : e.length, a = 0; a <
              d; a += 1) {
                $ = [h(0, null !== (f = r[e[a].key]) && void 0 !== f ? f : "")], b =
                  `text-align:${t.cellAlign};height:${t.tbodyRowHeight}${i};line-height:${t.tbodyRowHeight}${i};font-size:${t.tbodyFontsize}${i};color:${t.tbodyForecolor};border-color:${t.bordercolor};`,
                  l % 2 && t.tbodyOddRowBackground ? b += "background:" + t.tbodyOddRowBackground :
                    l % 2 == 0 && t.tbodyEvenRowBackground && (b += "background:" +
                      t.tbodyEvenRowBackground), m.push(h(o, {
                  class: s,
                  style: b
                }, $))
              }
              y.push(h(d, 0, m))
            }
        x.push(h(a, 0, y))
      } else $ = [e || (e = h(0, "\u7ed1\u5b9a\u6570\u636e"))], b =
        `height:${t.theadRowHeight}${i};line-height:${t.theadRowHeight}${i};font-size:${t.theadFontsize}${i};color:${t.theadForecolor};text-align:${t.cellAlign};border-color:${t.bordercolor};`,
      t.theadRowBackground && (b += "background:" + t.theadRowBackground), m = [h("th", {
        class: s,
        style: b
      }, $)], y = [h(d, 0, m)], x.push(h(l, 0, y)), $ = [r || (r = h(0,
        "\u8bf7\u5148\u7ed1\u5b9a\u6570\u636e"))], b =
        `height:${t.tbodyRowHeight}${i};line-height:${t.tbodyRowHeight}${i};font-size:${t.tbodyFontsize}${i};color:${t.tbodyForecolor};text-align:${t.cellAlign};border-color:${t.bordercolor};`,
      t.tbodyOddRowBackground && (b += "background:" + t.tbodyOddRowBackground), m = [h(o, {
        class: s,
        style: b
      }, $)], y = [h(d, 0, m)], x.push(h(a, 0, y));
      return g = [h("table", {
        class: "rd-cG rd-d7 rd-dw",
        style: `left:${t.x}${i};top:${t.y}${i};opacity:${t.alpha};width:${t.width}${i};table-layout:fixed;border-color:${t.bordercolor};` +
          n(t.animations)
      }, x)], h(c, 0, g)
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/data-ftable/5r", ["5u", "../../5s/60", "../../6c/70"], (t => {
  let e = t("5u"),
    r = t("../../5s/60"),
    i = t("../../6c/70"),
    s = i._f8.bind(i),
    d = t => (t += "").length ? t[0].toUpperCase() + t.substring(1) : t;
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: r
         }, i, s, d, l, o) {
      var a;
      let n, h, c, p, u, f, g, b, $ = t.borderwidth,
        m = t.bordertype,
        y = t.bordercolor,
        x = t.borderdeed,
        _ = t.rows,
        w = t.bind;
      p = [];
      for (let r = null == _ ? void 0 : _.length, n = 0; n < r; n += 1) {
        let r = _[n];
        if (!r.label && !g && w._showHead || r.label && !t.hideLabel || r.data || r.total &&
          !t.hideTotal || b && w._showFoot) {
          c = [];
          for (let t = r.cols, p = null == t ? void 0 : t.length, u = 0; u < p; u += 1) {
            let r = t[u];
            if (h = [], w._tip) h.push(i(0, w._tip));
            else if (null === (a = r.elements) || void 0 === a ? void 0 : a.length)
              for (let t = r.elements, a = null == t ? void 0 : t.length, c = 0; c <
              a; c += 1) {
                let r = t[c];
                h.push(i("div", {
                  $$: "props",
                  _5: s,
                  _: `6o/${r.type}/5r?props=${o(l,r.props,`a/.${n}.a;.${u}.a:.${c}.a-`)}&unit=` +
                    d(e)
                }))
              }
            c.push(i("td", {
              class: "rd-dx rd-en rd-du rd-dS rd-cH",
              colspan: 1 != r.colspan && r.colspan,
              rowspan: 1 != r.rowspan && r.rowspan,
              style: `width:${r.width}${e};height:${r.height}${e};border-left:${$?m:"dotted"} ${$}${e} ${$&&r.bLeft?y:"#0000"};border-top:${$?m:"dotted"} ${$}${e} ${$&&r.bTop?y:"#0000"};border-right:${$?m:"dotted"} ${$}${e} ${$&&r.bRight?y:"#0000"};border-bottom:${$?m:"dotted"} ${$}${e} ` +
                ($ && r.bBottom ? y : "#0000")
            }, h))
          }
          p.push(i("tr", 0, c))
        }
        r.total ? b = 1 : r.label && (g = 1)
      }
      return u = [i("tbody", 0, p)], f = [i("table", {
        class: "rd-cz rd-dw",
        style: "border-collapse:" + x
      }, u)], n = [i("div", {
        class: "rd-cG rd-d7",
        style: `left:${t.x}${e};top:${t.y}${e};opacity:${t.alpha};width:${t.width}${e};` +
          r(t.animations)
      }, f)], i(s, 0, n)
    },
    init() {
      this.set({
        format: s,
        toPx: r.bU,
        toUnit: r.bF,
        ftu: d
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/data-repeater/5r", ["5u"], (t => {
  let e = t("5u"),
    r = "div",
    i = {
      class: "rd-cW"
    };
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: s
         }, d, l, o, a, n) {
      let h, c, p, u;
      u = [];
      for (let s = t.rows, o = null == s ? void 0 : s.length, h = 0; h < o; h += 1) {
        let t = s[h];
        p = [];
        for (let i = t.cols, s = null == i ? void 0 : i.length, o = 0; o < s; o += 1) {
          let s = i[o];
          c = [];
          for (let t = s.elements, i = null == t ? void 0 : t.length, p = 0; p < i; p +=
            1) {
            let i = t[p];
            c.push(d(r, {
              $$: "props,unit",
              _5: l,
              class: "rd-cO",
              _: `6o/${i.type}/5r?props=${n(a,i.props,`a/.${h}.a;.${o}.a:.${p}.a-`)}&unit=` +
                n(a, e, "b_")
            }))
          }
          p.push(d(r, {
            class: "rd-cz rd-cA rd-cH rd-dS",
            style: `height:${t.height}${e};width:${s.width}${e};border-top:${s.borderTopStyle} ${s.borderTopWidth}${e} ${s.borderTopColor};border-right:${s.borderRightStyle} ${s.borderRightWidth}${e} ${s.borderRightColor};border-bottom:${s.borderBottomStyle} ${s.borderBottomWidth}${e} ${s.borderBottomColor};border-left:${s.borderLeftStyle} ${s.borderLeftWidth}${e} ${s.borderLeftColor};border-radius:` +
              s.borderRadius
          }, c))
        }
        u.push(d(r, i, p))
      }
      return h = [d(r, {
        class: "rd-cG rd-d7 rd-cW rd-cY",
        style: `left:${t.x}${e};top:${t.y}${e};opacity:${t.alpha};width:${t.width}${e};height:${t.height}${e};` +
          s(t.animations)
      }, u)], d(l, 0, h)
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/datetime/5r", ["../../6c/70", "../text/5r", "../../6c/6d", "../../66/6a/5r", "../subs/qrcode"], (t => {
  let e = t("../../6c/70"),
    r = t("../text/5r"),
    i = t("../../6c/6d"),
    s = t("../../66/6a/5r");
  t("../subs/qrcode");
  let d = "div";
  return r.extend({
    tmpl({
           props: t,
           unit: e,
           td: r,
           bw: i,
           am: s,
           text: l,
           safeHTML: o,
           enHTML: a,
           i18n: n,
           mmin: h
         }, c, p, u, f, g) {
      let b, $, m, y, x, _ = t.type,
        w = t.width,
        k = t.height,
        v = t.display;
      if (x = [], "text" == _) y = [c(0, l ? t.richText ? o(l) : a(l) : n("ey"), 1)], x.push(
        c(d, 0, y));
      else {
        let r = h(w, k);
        x.push(c(d, {
          $$: "props",
          _5: p,
          style: `height:${r}${e};width:` + r + e,
          _: `6o/subs/qrcode?props=${g(f,t,"a/")}&value=` + u(l)
        }))
      }
      return $ = "rd-cG rd-d7 rd-cW rd-dS rd-du", "qrcode" == _ && ($ += " rd-c0 rd-dk"), v &&
      ($ += " rd-cK"), m =
        `left:${t.x}${e};top:${t.y}${e};width:${w}${e};transform:rotate(${t.rotate}deg);`,
        "text" == _ ? (m += `color:${t.forecolor};`, t.background && (m +=
            `background:${t.background};`), m +=
            `font-size:${t.fontsize}${e};min-height:${k}${e};letter-spacing:${t.letterspacing}${e};opacity:${t.alpha};line-height:${t.lineheight};`,
          t.styleBold && (m += "font-weight:bold;"), t.styleItalic && (m +=
            "font-style:italic;"), r && (m += `text-decoration:${r};`), m +=
            `align-items:${t.vpos};justify-content:${t.hpos};font-family:${t.fontfamily};`,
          i && (m += `border:${i}${e} ${t.bordertype} ${t.bordercolor};`), t.autoHeight ?
            m += `transform-origin:${w/2}${e} ${k/2}${e};` : m += `max-height:${k}${e};`) :
          m += `height:${k}${e};`, m += s(t.animations), b = [c(d, {
        class: $,
        style: m
      }, x)], c(p, 0, b)
    },
    init() {
      this.on("destroy", (() => {
        s._bZ(this._gJ)
      }))
    },
    _gK({
          text: t,
          lang: r,
          richText: s
        }) {
      let d;
      if (s) {
        let e = i.cI(t);
        d = e.cJ, t = e.cK
      }
      t = e._f8(`date@${r}:` + t, new Date), s && (t = i.cL(t, d)), this.set({
        text: t
      })
    },
    assign(t) {
      let {
        props: e
      } = t;
      this.set(t), this._gK(e), this._gH(e), this._gI(e)
    },
    render() {
      this.digest();
      let {
        tick: t
      } = this.get("props");
      t ? (this._gJ || (this._gJ = () => {
        this._gK(this.get("props")), this.digest()
      }), s._b0(100, this._gJ)) : s._bZ(this._gJ)
    }
  })
})), s.d("6o/data-dtable/5r", ["5u", "../../5s/60", "../../6c/70", "../../6c/6d", "../subs/barcode",
  "../subs/qrcode"], (t => {
  let e = t("5u"),
    r = t("../../5s/60"),
    i = t("../../6c/70"),
    s = t("../../6c/6d");
  t("../subs/barcode"), t("../subs/qrcode");
  let d = "props",
    l = "div",
    o = "rd-dS rd-cW",
    a = t => (t += "").length ? t[0].toUpperCase() + t.substring(1) : t;
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           toUnit: i,
           mmax: s,
           td: a,
           safeHTML: n,
           enHTML: h,
           ftu: c,
           format: p
         }, u, f, g, b, $) {
      var m;
      let y, x, _, w, k, v, L, F, S, C, H, M, G = t.x,
        T = t.y,
        A = t.width,
        z = t.alpha,
        P = t.hideLabel,
        j = t.hideFoot,
        I = t.hideTotal,
        B = t.borderwidth,
        D = t.bordertype,
        N = t.bordercolor,
        R = t.borderdeed,
        W = t.rows,
        O = t.bind,
        Y = ("collapse" == R ? 1 : 2) * B;
      L = [];
      for (let t = null == W ? void 0 : W.length, r = 0; r < t; r += 1) {
        let t = W[r];
        if (t.label && O._data && O._data.length && !P || !t.data && !t.label && !C && O._showHead ||
          H && !j && O._showFoot || t.total && !I && O._showAcc) {
          v = [];
          for (let y = t.cols, L = null == y ? void 0 : y.length, F = 0; F < L; F += 1) {
            let L = y[F];
            if (k = [], O._tip) k.push(u(0, O._tip));
            else if (null === (m = L.elements) || void 0 === m ? void 0 : m.length)
              for (let t = L.elements, i = null == t ? void 0 : t.length, s = 0; s <
              i; s += 1) {
                let i = t[s];
                k.push(u(l, {
                  $$: d,
                  _5: f,
                  _: `6o/${i.type}/5r?props=${$(b,i.props,`a/.${r}.a;.${F}.a:.${s}.a-`)}&unit=` +
                    g(e)
                }))
              } else {
              let g = L.paddingTop,
                m = L.paddingBottom,
                y = L.paddingLeft,
                v = L.paddingRight,
                S = L.width - Y - i(1),
                C = s(L.height - Y - i(1), 0);
              g > C && (g = C), g + m > C && (m = C - g), y > S && (y = S), y + v >
              S && (v = S - y);
              let H = a(L);
              if (w = [], "text" == L.type) _ = [u(0, L.textRichText ? n(L.textContent) :
                h(L.textContent), 1)], w.push(u(l, {
                class: !L.textAutoHeight && "rd-cT rd-dv"
              }, _));
              else if ("image" == L.type) L.imageContent && (x = "", (L.imageRotateX ||
                L.imageRotateY) && (x += ";transform:", L.imageRotateX &&
              (x += "rotateX(180deg)"), L.imageRotateY && (x +=
                " rotateY(180deg)")), w.push(u("img", {
                class: "rd-b5 rd-cC rd-cB",
                src: L.imageContent,
                style: x
              }, 1)));
              else if ("barcode" == L.type) L.barcodeContent && w.push(u(l, {
                $$: d,
                _5: f,
                style: "height:" + (C - g - m) + e,
                _: "6o/subs/barcode?props=" + $(b, L,
                  `a/.${r}.a;.${F}.b_`)
              }));
              else if ("qrcode" == L.type) L.qrcodeContent && w.push(u(l, {
                $$: d,
                _5: f,
                style: "height:" + (C - g - m) + e,
                _: "6o/subs/qrcode?props=" + $(b, L,
                  `a/.${r}.a;.${F}.b_`)
              }));
              else if (t.total) {
                let t = M[F],
                  e = c(L.type);
                "text" == L.type ? (_ = [u(0, L.textContent)], w.push(u(l, {
                  class: !L.textAutoHeight && "rd-cT rd-dv"
                }, _))) : "custom" == L.type ? (_ = [u(0, p(L.textFormat, L
                  .totalData, O._data, O._all))], w.push(u(l, {
                  class: !L.textAutoHeight && "rd-cT rd-dv"
                }, _))) : null != L.totalData[t.bindKey + e] && (_ = [u(0,
                  p(L.textFormat, L.totalData[t.bindKey + e], L.totalData)
                )], w.push(u(l, {
                  class: !L.textAutoHeight && "rd-cT rd-dv"
                }, _)))
              }
              x = `padding:${g}${e} ${v}${e} ${m}${e} ${y}${e};width:${S}${e};`,
              L.textAutoHeight && (x += "min-"), x +=
                `height:${C}${e};align-items:${L.vpos};justify-content:${L.hpos};opacity:${L.alpha};`,
              null != L.textFontsize && (x +=
                  `color:${L.textForecolor};letter-spacing:${L.textLetterspacing}${e};`,
                L.textStyleBold && (x += "font-weight:bold;"), L.textStyleItalic &&
                (x += "font-style:italic;"), H && (x +=
                  `text-decoration:${H};`), x +=
                  `font-family:${L.textFontfamily};font-size:${L.textFontsize}${e};`
              ), k.push(u(l, {
                class: o,
                style: x
              }, w))
            }
            x =
              `width:${L.width}${e};height:${L.height}${e};border-left:${B?D:"dotted"} ${B}${e} ${B&&L.bLeft?N:"#0000"};border-top:${B?D:"dotted"} ${B}${e} ${B&&L.bTop?N:"#0000"};border-right:${B?D:"dotted"} ${B}${e} ${B&&L.bRight?N:"#0000"};border-bottom:${B?D:"dotted"} ${B}${e} ${B&&L.bBottom?N:"#0000"};`,
            L.background && (x += "background:" + L.background), v.push(u("td", {
              class: "rd-dx rd-en rd-du rd-dS rd-cH",
              colspan: 1 != L.colspan && L.colspan,
              rowspan: 1 != L.rowspan && L.rowspan,
              style: x
            }, k))
          }
          L.push(u("tr", 0, v))
        }
        if (t.data) {
          if (M = t.cols, O._data) {
            let i = O._rHeights;
            for (let s = O._data, c = null == s ? void 0 : s.length, m = 0; m < c; m +=
              1) {
              let c = s[m];
              v = [];
              let y = i && i[m];
              for (let i = t.cols, s = null == i ? void 0 : i.length, m = 0; m < s; m +=
                1) {
                let t = i[m];
                if (k = [], O._tip) k.push(u(0, O._tip));
                else {
                  let i = t.paddingTop,
                    s = t.paddingBottom,
                    v = t.paddingLeft,
                    L = t.paddingRight,
                    F = t.width - Y,
                    S = (y || t.height) - Y;
                  i > S && (i = S), i + s > S && (s = S - i), v > F && (v = F), v +
                  L > F && (L = F - v);
                  let C, H = a(t);
                  w = [], "text" == t.type ? (t.bindKey && (C = c[t.bindKey], C =
                    p(t.textFormat, C, c)), C && (_ = [u(0, t.textRichText ?
                    n(C) : h(C), 1)], w.push(u(l, {
                    class: !t.textAutoHeight &&
                      "rd-cT rd-dv"
                  }, _)))) : "image" == t.type ? (t.bindKey && (C = c[t.bindKey]),
                  C && (x = `height:${S-i-s}px;`, (t.imageRotateX || t.imageRotateY) &&
                  (x += ";transform:", t.imageRotateX && (x +=
                    "rotateX(180deg)"), t.imageRotateY && (x +=
                    " rotateY(180deg)")), w.push(u("img", {
                    class: "rd-b5 rd-cB rd-cC",
                    src: C,
                    style: x
                  }, 1)))) : "barcode" == t.type ? (t.bindKey && (C =
                    c[t.bindKey]), C && w.push(u(l, {
                    $$: d,
                    _5: f,
                    style: "height:" + (S - i - s) + e,
                    _: `6o/subs/barcode?props=${$(b,t,`a/.${r}.a;.${m}.b_`)}&value=` +
                      g(C)
                  }))) : "qrcode" == t.type && (t.bindKey && (C = c[t.bindKey]),
                  C && w.push(u(l, {
                    $$: d,
                    _5: f,
                    style: "height:" + (S - i - s) + e,
                    _: `6o/subs/qrcode?props=${$(b,t,`a/.${r}.a;.${m}.b_`)}&value=` +
                      g(C)
                  }))), x =
                    `padding:${i}${e} ${L}${e} ${s}${e} ${v}${e};width:${F}${e};`,
                  t.textAutoHeight && (x += "min-"), x +=
                    `height:${S}${e};align-items:${t.vpos};justify-content:${t.hpos};opacity:${t.alpha};`,
                  "text" == t.type && (x +=
                      `color:${t.textForecolor};letter-spacing:${t.textLetterspacing}${e};`,
                    t.textStyleBold && (x += "font-weight:bold;"), t.textStyleItalic &&
                    (x += "font-style:italic;"), H && (x +=
                      `text-decoration:${H};`), x +=
                      `font-family:${t.textFontfamily};font-size:${t.textFontsize}${e};`
                  ), k.push(u(l, {
                    class: o,
                    style: x
                  }, w))
                }
                x =
                  `width:${t.width}${e};border-left:${B?D:"dotted"} ${B}${e} ${B&&t.bLeft?N:"#0000"};border-top:${B?D:"dotted"} ${B}${e} ${B&&t.bTop?N:"#0000"};border-right:${B?D:"dotted"} ${B}${e} ${B&&t.bRight?N:"#0000"};border-bottom:${B?D:"dotted"} ${B}${e} ${B&&t.bBottom?N:"#0000"};`,
                t.background && (x += "background:" + t.background), v.push(u(
                  "td", {
                    class: "rd-dx rd-en rd-du rd-cH",
                    colspan: 1 != t.colspan && t.colspan,
                    rowspan: 1 != t.rowspan && t.rowspan,
                    style: x
                  }, k))
              }
              L.push(u("tr", 0, v))
            }
          }
        } else t.total ? H = 1 : t.label && (C = 1)
      }
      return F = [u("tbody", 0, L)], S = [u("table", {
        class: "rd-cz rd-dw",
        style: "border-collapse:" + R
      }, F)], y = [u(l, {
        class: "rd-cG rd-d7",
        style: `left:${G}${e};top:${T}${e};opacity:${z};width:${A}${e};` + r(t.animations)
      }, S)], u(f, 0, y)
    },
    init() {
      this.set({
        td: s._go,
        format: i._f8.bind(i),
        toPx: r.bU,
        toUnit: r.bF,
        ftu: a
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/form-checkbox/5r", ["5u"], (t => {
  let e = t("5u"),
    r = {
      checked: "checked"
    },
    {
      View: i,
      isArray: s,
      isObject: d
    } = e;
  return i.extend({
    tmpl({
           props: t,
           unit: e,
           am: i
         }, s, d) {
      var l, o;
      let a, n, h, c, p, u;
      u = [];
      for (let i = t.items, d = null == i ? void 0 : i.length, a = 0; a < d; a += 1) {
        let d = i[a],
          n = 0 === a;
        p = [s("input", {
          name: t.inputName,
          class: "rd-bJ",
          type: "checkbox",
          checked: d.checked,
          disabled: d.disabled,
          value: null !== (l = d.value) && void 0 !== l ? l : ""
        }, 1, r)], c = [s(0, null !== (o = d.text) && void 0 !== o ? o : "")], p.push(s(
          "span", {
            style: `color:${t.forecolor};font-size:${t.fontsize}${e};letter-spacing:${t.letterspacing}${e};font-family:${t.fontfamily};margin-left:` +
              t.textSpace + e
          }, c)), h = "", n || (h += "margin-", "row" == t.rank ? h += "left" : h +=
          "top", h += ":" + t.itemSpace + e), u.push(s("label", {
          class: "rd-cW rd-c0 rd-cZ",
          style: h
        }, p))
      }
      return n = "rd-cG rd-d7 rd-cW", "hidden" == t.overflow ? n += " rd-dS" : "visible" == t
        .overflow ? n += " rd-dT" : n += " rd-cQ rd-cS rd-dU rd-cR", "column" == t.rank &&
      (n += " rd-cY"), a = [s("div", {
        style: `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);` +
          i(t.animations),
        class: n
      }, u)], s(d, 0, a)
    },
    assign(t) {
      let {
        props: e
      } = t, {
        items: r = [],
        bind: i
      } = e;
      if ((null == i ? void 0 : i.id) && i.fields.length) {
        r.length = 0;
        let t = i._data,
          e = i.fields[0].key;
        s(t) || (t = [t]);
        for (let i of t) {
          let t = i[e];
          d(t) && r.push(t)
        }
      }
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/form-collect/5r", ["5u", "../../5s/60", "../../6c/70", "../../6c/6d", "../../6c/72", "../subs/barcode",
  "../subs/qrcode"], (t => {
  let e = t("5u"),
    r = t("../../5s/60"),
    i = t("../../6c/70"),
    s = t("../../6c/6d"),
    d = t("../../6c/72");
  t("../subs/barcode"), t("../subs/qrcode");
  let l, o, a = "rd-dx rd-en rd-du",
    n = "td",
    h = "div",
    c = "props",
    p = "value",
    u = "rd-bF rd-bQ rd-bR rd-bN rd-bJ rd-cE rd-do rd-cG rd-cJ",
    f = {
      class: "rd-cW rd-cA rd-cz rd-c0 rd-dk rd-df"
    },
    g = {
      class: "rd-cT rd-dv"
    },
    b = {
      _: 1,
      value: p
    },
    $ = {
      value: p
    },
    m = {
      selected: "selected"
    },
    {
      View: y,
      mark: x,
      dispatch: _,
      node: w,
      mix: k,
      toNumber: v
    } = e,
    L = (t, e) => t.startsWith("_") ? void 0 : e,
    F = t => {
      let e = 0;
      for (let r of t)
        for (let t of r) t._g4 && (e += t._g5);
      return e
    },
    S = t => {
      let e = 0,
        r = 0,
        i = 0;
      for (let r of t)
        for (let t of r) t._g4 && (e += t._g5, i++);
      return i > 0 && (r = e / i), r
    };
  return y.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           readonly: i,
           getMaxCol: s,
           excelTitle: d,
           toUnit: p,
           td: y,
           safeHTML: x,
           enHTML: _,
           getSumByCell: w,
           format: k,
           calcSum: v,
           calcAvg: L,
           toPx: F
         }, S, C, H, M, G) {
      var T;
      let A, z, P, j, I, B, D, N, R, W, O, Y, E, V = t.borderwidth,
        U = t.bordertype,
        K = t.bordercolor,
        J = t.borderdeed,
        X = t.rows,
        q = t.readonly,
        Z = t.excel,
        Q = t.excelLeft,
        tt = t.excelTop,
        et = t.excelBackground,
        rt = t.excelForecolor,
        it = ("collapse" == J ? 1 : 2) * V,
        st = 0,
        dt = i || q;
      if (R = [], Z) {
        j = [], j.push(S(n, {
          class: a,
          style: `height:${tt}${e};background:${et};border:${V?U:"dotted"} ${V}${e} ` +
            K
        }));
        let r = s(t);
        for (let t = 0; r > t; t++) z = [S(0, d(t))], P = [S(h, f, z)], j.push(S(n, {
          class: a,
          style: `height:${tt}${e};background:${et};border:${V?U:"dotted"} ${V}${e} ${K};color:` +
            rt
        }, P));
        R.push(S("tr", 0, j))
      }
      for (let r = null == X ? void 0 : X.length, i = 0; i < r; i += 1) {
        let r = X[i];
        if (r.label && (Y = 1), r.total && !t.hideTotal || r.data || r.label && !t.hideLabel ||
        !Y && !t.hideHead || E && !t.hideFoot) {
          j = [], Z && (z = [S(0, ++st)], P = [S(h, f, z)], j.push(S(n, {
            class: a,
            style: `width:${Q}${e};background:${et};border:${V?U:"dotted"} ${V}${e} ${K};color:` +
              rt
          }, P)));
          for (let t = r.cols, s = null == t ? void 0 : t.length, d = s - 1, a = 0; a < s; a +=
            1) {
            let s = t[a],
              f = 0 === a,
              A = a === d;
            if (P = [], null === (T = s.elements) || void 0 === T ? void 0 : T.length)
              for (let t = s.elements, r = null == t ? void 0 : t.length, d = 0; d <
              r; d += 1) {
                let r = t[d];
                P.push(S(h, {
                  $$: "props,readonly||eReadonly",
                  _5: C,
                  id: r.id,
                  _: `6o/${r.type}/5r?props=${G(M,r.props,`a/.${i}.a;.${a}.a:.${d}.a-`)}&unit=${H(e)}&readonly=` +
                    G(M, dt),
                  _elementinput: C + "\x1e_hd()"
                }))
              } else {
              let t = s.paddingTop,
                d = s.paddingBottom,
                n = s.paddingLeft,
                H = s.paddingRight,
                T = s.width - it - p(1),
                j = s.height - it - p(1);
              t > j && (t = j), t + d > j && (d = j - t), n > T && (n = T), n + H >
              T && (H = T - n);
              let R = y(s);
              if (z = [], "text" == s.type) D = [S(0, s.textRichText ? x(s.textContent) :
                _(s.textContent), 1)], z.push(S(h, g, D));
              else if ("image" == s.type) s.imageContent && (B = "", (s.imageRotateX ||
                s.imageRotateY) && (B += ";transform:", s.imageRotateX &&
              (B += "rotateX(180deg)"), s.imageRotateY && (B +=
                " rotateY(180deg)")), z.push(S("img", {
                class: "rd-b5 rd-cC rd-cB",
                src: s.imageContent,
                style: B
              }, 1)));
              else if ("barcode" == s.type) s.barcodeContent && z.push(S(h, {
                $$: c,
                _5: C,
                style: "height:" + (j - t - d) + e,
                _: "6o/subs/barcode?props=" + G(M, s,
                  `a/.${i}.a;.${a}.b_`)
              }));
              else if ("qrcode" == s.type) s.qrcodeContent && z.push(S(h, {
                $$: c,
                _5: C,
                style: "height:" + (j - t - d) + e,
                _: "6o/subs/qrcode?props=" + G(M, s,
                  `a/.${i}.a;.${a}.b_`)
              }));
              else if ("input" == s.type) s.inputMultiline ? (I =
                "rd-dU rd-bJ rd-cz rd-cA rd-bL", s.inputClassName && (I +=
                " " + s.inputClassName), z.push(S("textarea", {
                id: `ipt_${C}_${i}_` + a,
                readonly: !0 === dt,
                style: `color:${s.inputForecolor};font-size:${s.inputFontsize}${e};letter-spacing:${s.inputLetterspacing}${e};font-family:${s.inputFontfamily};text-align:` +
                  s.inputTextAlign,
                placeholder: s.inputplaceholder,
                _input: C +
                  `\x1e_hc({cell:'${G(M,s,`a/.${i}.a;.${a}.b_`)}'})`,
                value: s.inputUserValue || s.inputText,
                class: I
              }, 0, b))) : (I = "rd-bJ rd-cz rd-cA rd-bK", s.inputClassName &&
              (I += " " + s.inputClassName), z.push(S("input", {
                id: `ipt_${C}_${i}_` + a,
                readonly: !0 === dt,
                style: `color:${s.inputForecolor};font-size:${s.inputFontsize}${e};letter-spacing:${s.inputLetterspacing}${e};font-family:${s.inputFontfamily};text-align:` +
                  s.inputTextAlign,
                placeholder: s.inputPlaceholder,
                value: s.inputUserValue || s.inputText,
                _input: C +
                  `\x1e_hc({cell:'${G(M,s,`a/.${i}.a;.${a}.b_`)}'})`,
                class: I
              }, 1, $)));
              else if ("sum" == s.type || "custom" == s.type || "avg" == s.type) {
                let t = w(s);
                "sum" == s.type ? (D = [S(0, k(s.textFormat, v(t)), 1)], z.push(
                  S(h, g, D))) : "avg" == s.type ? (D = [S(0, k(s.textFormat,
                  L(t)), 1)], z.push(S(h, g, D))) : (D = [S(0, k(s.textFormat,
                  t), 1)], z.push(S(h, g, D)))
              } else if ("dropdown" == s.type) {
                D = [];
                for (let t = s.dropdownItems, e = null == t ? void 0 : t.length,
                       r = 0; r < e; r += 1) {
                  let e = t[r];
                  N = [S(0, e.text)], D.push(S("option", {
                    disabled: e.disabled,
                    selected: e.checked,
                    value: e.value
                  }, N, m))
                }
                I = "rd-cz rd-cA", s.dropdownClassName && (I += " " + s.dropdownClassName),
                  z.push(S("select", {
                    multiple: s.dropdownMultipleSelect,
                    readonly: !0 === dt,
                    style: `color:${s.dropdownForecolor};font-size:${s.dropdownFontsize}${e};letter-spacing:${s.dropdownLetterspacing}${e};font-family:` +
                      s.dropdownFontfamily,
                    name: s.dropdownName,
                    _change: C +
                      `\x1e_hc({cell:'${G(M,s,`a/.${i}.a;.${a}.b_`)}'})`,
                    class: I
                  }, D))
              }
              dt || r.data && (f && (D = [l || (l = S(0, "\ue650"))], z.push(S(
                "i", {
                  style: `left:${-45-F(V)-(Z?F(Q):0)}px;top:${(F(j)-22)/2}px`,
                  class: u,
                  title: "\u70b9\u51fb\u590d\u5236\u6dfb\u52a0\u5f53\u524d\u884c",
                  _click: C + `\x1e_he({ri:${i}})`
                }, D))), A && r.copy && (D = [o || (o = S(0, "\ue68e"))],
                z.push(S("i", {
                  style: `right:${-45-F(V)}px;top:${(F(j)-22)/2}px`,
                  class: u,
                  title: "\u70b9\u51fb\u5220\u9664\u5f53\u524d\u884c",
                  _click: C + `\x1e_hf({ri:${i}})`
                }, D)))), B =
                `padding:${t}${e} ${H}${e} ${d}${e} ${n}${e};width:${T}${e};height:${j}${e};align-items:${s.vpos};justify-content:${s.hpos};opacity:${s.alpha};`,
              s.background && (B += `background:${s.background};`), null != s
                .textFontsize && (B +=
                  `color:${s.textForecolor};letter-spacing:${s.textLetterspacing}${e};`,
                s.textStyleBold && (B += "font-weight:bold;"), s.textStyleItalic &&
                (B += "font-style:italic;"), R && (B +=
                  `text-decoration:${R};`), B +=
                  `font-family:${s.textFontfamily};font-size:${s.textFontsize}${e};`
              ), P.push(S(h, {
                class: "rd-dS rd-cW",
                style: B
              }, z))
            }
            I = "rd-dx rd-en rd-du rd-cH", r.data || (I += " rd-dS"), j.push(S(n, {
              colspan: 1 != s.colspan && s.colspan,
              rowspan: 1 != s.rowspan && s.rowspan,
              style: `width:${s.width}${e};height:${s.height}${e};border-left:${V?U:"dotted"} ${V}${e} ${V&&s.bLeft?K:"#0000"};border-top:${V?U:"dotted"} ${V}${e} ${V&&s.bTop?K:"#0000"};border-right:${V?U:"dotted"} ${V}${e} ${V&&s.bRight?K:"#0000"};border-bottom:${V?U:"dotted"} ${V}${e} ` +
                (V && s.bBottom ? K : "#0000"),
              class: I
            }, P))
          }
          R.push(S("tr", 0, j))
        }
        r.total && (E = 1)
      }
      return W = [S("tbody", 0, R)], O = [S("table", {
        class: "rd-cz rd-dw",
        style: "border-collapse:" + J
      }, W)], A = [S(h, {
        class: "rd-cG rd-d7",
        style: `left:${t.x}${e};top:${t.y}${e};opacity:${t.alpha};width:${t.width}${e};` +
          r(t.animations)
      }, O)], S(C, 0, A)
    },
    init() {
      this.set({
        format: i._f8.bind(i),
        td: s._go,
        toPx: r.bU,
        toUnit: r.bF,
        excelTitle: s.cM,
        getMaxCol: t => d.bF(t, 1)._gk,
        getSumByCell: t => {
          let {
            rows: e
          } = this.get("props"), r = {};
          for (let i of e)
            if (i.data)
              for (let e of i.cols) {
                let i = e._g6;
                if (i >= t._g6 && i <= t._g7) {
                  r[i] || (r[i] = []);
                  let t, s = e.inputUserValue || e.inputText,
                    d = v(s);
                  t = isNaN(d) ? {
                    _g5: 0,
                    _g4: 0
                  } : {
                    _g5: d,
                    _g4: 1
                  }, r[i].push(t)
                }
              }
          let i = [];
          for (let t in r) i.push(r[t]);
          return i
        },
        calcSum: F,
        calcAvg: S
      })
    },
    assign(t) {
      t.overrideProps && k(t.props, t.overrideProps), d.bF(t.props, 1), this.set(t)
    },
    async render() {
      let t = x(this, "_g8");
      await this.digest();
      let e = await this.getValue();
      t() && !this._g9 && (this._g9 = 1, this._h_(e))
    },
    _h_(t) {
      t || (t = this._ha()), t.elementProps != this._hb && (this._hb = t.elementProps, delete t
        .id, delete t.type, _(this.root, "elementinput", t))
    },
    _ha() {
      var t;
      let e = this.get("props"),
        r = JSON.stringify(e, L),
        {
          rows: i
        } = e,
        s = {
          head: [],
          label: [],
          data: [],
          total: [],
          foot: []
        },
        d = [],
        l = t => {
          let e = [];
          for (let r of t)
            if ("form-input" == r.type) {
              let {
                userValue: t,
                text: i,
                inputName: s
              } = r.props;
              null == t && (t = i), e.push({
                type: "form-input",
                value: t,
                name: s
              });
              let l = w(r.id);
              l && d.push({
                node: l.querySelector("input"),
                type: "form-input",
                value: t,
                name: s
              })
            } else e.push(null);
          return e
        };
      for (let e = 0; e < i.length; e++) {
        let r, o = i[e],
          a = [];
        for (let r = 0; r < o.cols.length; r++) {
          let i = o.cols[r];
          if (null === (t = i.elements) || void 0 === t ? void 0 : t.length) a.push(l(i.elements));
          else if ("input" == i.type) {
            let t;
            t = null != i.inputUserValue ? i.inputUserValue : i.inputText, a.push({
              value: t,
              type: "form-collect-input",
              name: i.inputName
            }), d.push({
              node: w(`ipt_${this.id}_${e}_${r}`),
              type: "form-collect-input",
              value: t,
              name: i.inputName
            })
          } else if ("sum" == i.type || "custom" == i.type) {
            let t, {
                getSumByCell: e,
                format: r,
                calcSum: s
              } = this.get(),
              d = e(i);
            t = "sum" == i.type ? r(i.textFormat, s(d)) : r(i.textFormat, d), a.push({
              type: "total-sum",
              value: t
            })
          } else a.push(null)
        }
        o.head ? r = s.head : o.label ? r = s.label : o.data ? r = s.data : o.total ? r = s
          .total : o.foot && (r = s.foot), r.push(a)
      }
      let o = this.get("id");
      return {
        id: o,
        type: "form-collect",
        props: e,
        elementId: o,
        elementType: "form-collect",
        elementProps: r,
        elementValue: s,
        elementInputs: d
      }
    },
    getValue() {
      return new Promise((t => {
        let e = () => {
          let r = this._ha(),
            i = 1;
          for (let t of r.elementInputs)
            if (!t.node) {
              i = 0;
              break
            } i ? t(r) : setTimeout(e, 50)
        };
        setTimeout(e, 50)
      }))
    },
    "_hc<input>"(t) {
      let {
        cell: e
      } = t.params, r = t.eventTarget;
      e.inputUserValue = r.value;
      let i = this.get("props");
      this.digest({
        props: i
      }), this._h_()
    },
    "_hc<change>"(t) {},
    "_hd<elementinput>"(t) {
      t.stopImmediatePropagation(), this._h_()
    },
    "_he<click>"(t) {
      let {
        ri: e
      } = t.params, r = this.get("props"), {
        rows: i
      } = r, s = i[e], l = 0;
      for (let t of i) {
        if (t.total) break;
        l++
      }
      d.bH(r, l, {}, 0);
      let o = i[l];
      o.data = !0, o.copy = !0;
      for (let t = s.cols.length; t--;) {
        let e = s.cols[t],
          r = o.cols[t],
          i = JSON.parse(JSON.stringify(e));
        k(r, i)
      }
      d.bF(r), this.set({
        props: r
      }), this.render()
    },
    "_hf<click>"(t) {
      let {
        ri: e
      } = t.params, r = this.get("props");
      d.bI(r, e), d.bF(r), this.set({
        props: r
      }), this.render()
    }
  })
})), s.d("6o/form-input/5r", ["5u"], (t => {
  let e = t("5u"),
    r = "value",
    i = {
      _: 1,
      value: r
    },
    s = {
      value: r
    },
    {
      View: d,
      node: l,
      dispatch: o,
      isArray: a,
      isObject: n
    } = e;
  return d.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           readonly: d,
           text: l
         }, o, a) {
      let n, h, c;
      c = [];
      let p = d || t.readonly;
      return t.multiline ? (h = "rd-dU rd-cz rd-cA rd-bJ rd-bL", t.className && (h += " " + t
        .className), c.push(o("textarea", {
        id: "ipt_" + a,
        readonly: !0 === p,
        style: `color:${t.forecolor};font-size:${t.fontsize}${e};letter-spacing:${t.letterspacing}${e};font-family:${t.fontfamily};text-align:` +
          t.textAlign,
        name: t.inputName,
        placeholder: t.placeholder,
        _input: a + "\x1e_hc()",
        value: t.userValue || l,
        class: h
      }, 0, i))) : (h = "rd-bJ rd-cz rd-cA rd-bK", t.className && (h += " " + t.className),
        c.push(o("input", {
          name: t.inputName,
          id: "ipt_" + a,
          readonly: !0 === p,
          style: `color:${t.forecolor};font-size:${t.fontsize}${e};letter-spacing:${t.letterspacing}${e};font-family:${t.fontfamily};text-align:` +
            t.textAlign,
          placeholder: t.placeholder,
          value: t.userValue || l,
          _input: a + "\x1e_hc()",
          class: h
        }, 1, s))), n = [o("div", {
        class: "rd-cG rd-d7 rd-cW rd-c0 rd-dS",
        style: `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);` +
          r(t.animations)
      }, c)], o(a, 0, n)
    },
    assign(t) {
      let {
        props: e
      } = t, {
        bind: r,
        text: i
      } = e;
      if (null == r ? void 0 : r.id) {
        let t = r.fields[0];
        if (r._tip) i = r._tip;
        else if (r._data) {
          let s = r._data;
          a(s) && (s = s[0]);
          let d = s[t.key];
          n(d) ? (d.value && (i = d.value), d.className && (e.className = d.className), d
            .placeholder && (e.placeholder = d.placeholder), d.markAs && (e.markAs =
            d.markAs), d.inputName && (e.inputName = d.inputName)) : i = d
        } else i = `[\u7ed1\u5b9a:${t.name}]`
      }
      this.set(t, {
        text: i
      })
    },
    render() {
      this.digest()
    },
    getValue() {
      let t = this.get("props"),
        e = l(`ipt_${this.id}`),
        r = this.get("id");
      return {
        id: r,
        type: "form-input",
        props: t,
        elementId: r,
        elementType: "form-input",
        elementProps: JSON.stringify(t),
        elementValue: t.userValue,
        elementName: t.inputName,
        elementInput: e
      }
    },
    "_hc<input>"(t) {
      this._fl(t);
      let {
        eventTarget: e
      } = t, r = e.value, i = this.get("props");
      i.userValue = r, o(this.root, "elementinput", {
        elementId: this.get("id"),
        elementType: "form-input",
        elementProps: JSON.stringify(i),
        elementValue: r,
        elementName: i.inputName,
        elementInput: e
      })
    }
  })
})), s.d("6o/form-dropdown/5r", ["5u"], (t => {
  let e = t("5u"),
    r = {
      selected: "selected"
    },
    {
      View: i,
      node: s,
      dispatch: d,
      isArray: l,
      isObject: o
    } = e;
  return i.extend({
    tmpl({
           props: t,
           unit: e,
           am: i
         }, s, d) {
      var l, o;
      let a, n, h, c, p;
      c = [];
      for (let e = t.items, i = null == e ? void 0 : e.length, d = 0; d < i; d += 1) {
        let t = e[d];
        h = [s(0, null !== (l = t.text) && void 0 !== l ? l : "")], c.push(s("option", {
          disabled: t.disabled,
          selected: t.checked,
          value: null !== (o = t.value) && void 0 !== o ? o : ""
        }, h, r))
      }
      return n = "rd-cz rd-cA", t.className && (n += " " + t.className), p = [s("select", {
        multiple: t.multipleSelect,
        style: `color:${t.forecolor};font-size:${t.fontsize}${e};letter-spacing:${t.letterspacing}${e};font-family:` +
          t.fontfamily,
        name: t.inputName,
        class: n
      }, c)], n = "rd-cG rd-d7 rd-cW rd-c0 ", "hidden" == t.overflow ? n += " rd-dS" :
        "visible" == t.overflow ? n += " rd-dT" : n += " rd-dU", a = [s("div", {
        style: `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);` +
          i(t.animations),
        class: n
      }, p)], s(d, 0, a)
    },
    assign(t) {
      let {
        props: e
      } = t, {
        items: r = [],
        bind: i,
        multipleSelect: s
      } = e;
      if ((null == i ? void 0 : i.id) && i.fields.length) {
        r.length = 0;
        let t = i._data,
          e = i.fields[0].key;
        l(t) || (t = [t]);
        for (let i of t) {
          let t = i[e];
          o(t) && r.push({
            ...t
          })
        }
      }
      if (!s) {
        let t;
        for (let e = r.length; e--;) {
          let i = r[e];
          t ? i.checked && (i.checked = !1) : i.checked && (t = 1)
        }
      }
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/form-radio/5r", ["5u"], (t => {
  let e = t("5u"),
    r = {
      checked: "checked"
    },
    {
      View: i,
      isArray: s,
      isObject: d
    } = e;
  return i.extend({
    tmpl({
           props: t,
           unit: e,
           am: i
         }, s, d) {
      var l;
      let o, a, n, h, c, p;
      p = [];
      for (let i = t.items, d = null == i ? void 0 : i.length, o = 0; o < d; o += 1) {
        let d = i[o],
          a = 0 === o;
        c = [s("input", {
          name: t.inputName,
          class: "rd-bJ",
          type: "radio",
          checked: d.checked,
          disabled: d.disabled,
          value: d.value
        }, 1, r)], h = [s(0, null !== (l = d.text) && void 0 !== l ? l : "")], c.push(s(
          "span", {
            style: `color:${t.forecolor};font-size:${t.fontsize}${e};letter-spacing:${t.letterspacing}${e};font-family:${t.fontfamily};margin-left:` +
              t.textSpace + e
          }, h)), n = "", a || (n += "margin-", "row" == t.rank ? n += "left" : n +=
          "top", n += ":" + t.itemSpace + e), p.push(s("label", {
          class: "rd-cW rd-c0 rd-cZ",
          style: n
        }, c))
      }
      return a = "rd-cG rd-d7 rd-cW", "hidden" == t.overflow ? a += " rd-dS" : "visible" == t
        .overflow ? a += " rd-dT" : a += " rd-cQ rd-cS rd-dU rd-cR", "column" == t.rank &&
      (a += " rd-cY"), o = [s("div", {
        style: `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);` +
          i(t.animations),
        class: a
      }, p)], s(d, 0, o)
    },
    assign(t) {
      let {
        props: e
      } = t, {
        items: r,
        bind: i
      } = e;
      if ((null == i ? void 0 : i.id) && i.fields.length) {
        r.length = 0;
        let t = i._data,
          e = i.fields[0].key;
        s(t) || (t = [t]);
        for (let i of t) {
          let t = i[e];
          d(t) && r.push(t)
        }
      }
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/formula/5r", ["5u", "../../6c/mathjax"], (t => {
  let e = t("5u"),
    r = t("../../6c/mathjax"),
    {
      View: i,
      mark: s
    } = e;
  return i.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           html: i
         }, s, d) {
      let l, o;
      return o = [s(0, i, 1)], l = [s("div", {
        class: "rd-cG rd-d7 rd-dS",
        style: `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);padding:2px;color:${t.color};font-size:${t.fontsize}${e};` +
          r(t.animations),
        title: t.text
      }, o)], s(d, 0, l)
    },
    assign(t) {
      this.set(t)
    },
    async render() {
      let t = s(this, "_bF");
      try {
        if (window.MathJax || await this.digest({
          html: "loading..."
        }), await r(), t()) {
          let t = this.get("props").text,
            e = this._hh;
          t != this._hi && (this._hi = t, e = MathJax.tex2svg(t, {
            em: 12,
            ex: 6
          }).innerHTML, this._hh = e), this.digest({
            html: e
          })
        }
      } catch (e) {
        t() && this.digest({
          html: e
        })
      }
    }
  })
})), s.d("6o/fx/5r", ["5u", "../../5s/60", "../../6c/fx", "../../6c/6d"], (t => {
  let e = t("5u"),
    r = t("../../5s/60"),
    i = t("../../6c/fx"),
    s = t("../../6c/6d"),
    d = "div",
    {
      View: l,
      mark: o,
      node: a
    } = e;
  return l.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           html: i
         }, s, l) {
      let o, a, n;
      return a = [s(0, i)], n = [s(d, {
        class: "rd-cG rd-cz rd-cA rd-cW rd-c0 rd-dk",
        id: "ld_" + l
      }, a), s(d, {
        id: "fx_" + l
      })], o = [s(d, {
        class: "rd-cG rd-d7 rd-dS",
        style: `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);` +
          r(t.animations)
      }, n)], s(l, 0, o)
    },
    assign(t) {
      this.set(t)
    },
    async render() {
      let t = o(this, "_bF");
      try {
        if (window.functionPlot ? await this.digest() : await this.digest({
          html: "loading..."
        }), await i(), t()) {
          let {
            title: t,
            width: e,
            height: i,
            xAxisRange: d,
            xAxisTitle: l,
            yAxisRange: o,
            yAxisTitle: n,
            grid: h,
            zoom: c,
            xLine: p,
            yLine: u,
            data: f,
            annotations: g
          } = this.get("props"), b = a(`fx_${this.id}`), $ = a(`ld_${this.id}`);
          this._hj != t || this._bP != e || this._bQ != i || this._hk != d.join(",") ||
          this._hl != l || this._hm != o.join(",") || this._hn != n || this._ho !=
          h || this._hp != c || this._bT != p || this._bU != u || this._eE !=
          JSON.stringify(f) || this._hq != g.join(",") ? (b.innerHTML = "", this._bT =
            p, this._bU = u, this._hk = d.join(","), this._hm = o.join(","),
            this._hq = g.join(","), this._eE = JSON.stringify(f), functionPlot({
            target: b,
            width: this._bP = r.bU(e),
            height: this._bQ = r.bU(i),
            yAxis: {
              domain: o,
              label: this._hn = n
            },
            xAxis: {
              domain: d,
              label: this._hl = l
            },
            tip: {
              xLine: p,
              yLine: u
            },
            grid: h,
            disableZoom: c,
            title: this._hj = t,
            data: s.bJ(f),
            annotations: s.bJ(g)
          }), $.innerHTML = "&nbsp;") : this.digest()
        }
      } catch (e) {
        t() && this.digest({
          html: e
        })
      }
    }
  })
})), s.d("6o/heat/5r", ["../pbar/5r"], (t => {
  let e = t("../pbar/5r"),
    r = "div",
    i = {
      class: "rd-cA rd-cW rd-dj rd-c0"
    };
  return e.extend({
    tmpl({
           props: t,
           unit: e,
           am: s,
           value: d,
           step: l
         }, o, a) {
      let n, h, c, p;
      h = [];
      for (let i = 0; t.bars > i; i++) h.push(o(r, {
        style: `height:80%;width:${t.barWidth}${e};background:${t.background};border-radius:` +
          t.barWidth / 2 + e
      }));
      p = [o(r, i, h)], c = [];
      for (let i = 0; t.bars > i; i++) c.push(o(r, {
        style: `height:80%;opacity:${i*l*100}%;width:${t.barWidth}${e};background:${t.fillcolor};border-radius:` +
          t.barWidth / 2 + e
      }));
      return h = [o(r, {
        class: "rd-cW rd-cA rd-dj rd-c0",
        style: "width:" + t.width + e
      }, c)], p.push(o(r, {
        class: "rd-cG rd-dz rd-dS rd-dF",
        style: `width:${d}%`
      }, h)), n = [o(r, {
        class: "rd-cG",
        style: `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);color:${t.background};` +
          s(t.animations)
      }, p)], o(a, 0, n)
    },
    assign(t) {
      let {
        props: e
      } = t;
      this.set(t, {
        step: 1 / e.bars
      }), this._gh(t)
    }
  })
})), s.d("6o/hod-footer/5r", ["5u"], (t => {
  let e = t("5u"),
    r = "div",
    i = {
      class: "rd-cW"
    };
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           stage: s,
           am: d
         }, l, o, a, n, h) {
      let c, p, u, f, g;
      g = [];
      for (let s = t.rows, d = null == s ? void 0 : s.length, a = 0; a < d; a += 1) {
        let t = s[a];
        f = [];
        for (let i = t.cols, s = null == i ? void 0 : i.length, d = 0; d < s; d += 1) {
          let s = i[d];
          u = [];
          for (let t = s.elements, i = null == t ? void 0 : t.length, c = 0; c < i; c +=
            1) {
            let i = t[c];
            u.push(l(r, {
              $$: "props,unit",
              _5: o,
              class: "rd-cO",
              _: `6o/${i.type}/5r?props=${h(n,i.props,`a/.${a}.a;.${d}.a:.${c}.a-`)}&unit=` +
                h(n, e, "b_")
            }))
          }
          f.push(l(r, {
            class: "rd-cz rd-cA rd-cH rd-dS",
            style: `height:${t.height}${e};width:${s.width}${e};border-top:${s.borderTopStyle} ${s.borderTopWidth}${e} ${s.borderTopColor};border-right:${s.borderRightStyle} ${s.borderRightWidth}${e} ${s.borderRightColor};border-bottom:${s.borderBottomStyle} ${s.borderBottomWidth}${e} ${s.borderBottomColor};border-left:${s.borderLeftStyle} ${s.borderLeftWidth}${e} ${s.borderLeftColor};border-radius:` +
              s.borderRadius
          }, u))
        }
        g.push(l(r, i, f))
      }
      return p = `left:${t.x}${e};`, p += s ? "bottom:0;" : `top:${t.y}${e};`, p +=
        `opacity:${t.alpha};width:${t.width}${e};height:${t.height}${e};` + d(t.animations),
        c = [l(r, {
          class: "rd-cG rd-d7 rd-cY rd-cW",
          style: p
        }, g)], l(o, 0, c)
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/hod-header/5r", ["5u"], (t => {
  let e = t("5u"),
    r = "div",
    i = {
      class: "rd-cW"
    };
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: s
         }, d, l, o, a, n) {
      let h, c, p, u;
      u = [];
      for (let s = t.rows, o = null == s ? void 0 : s.length, h = 0; h < o; h += 1) {
        let t = s[h];
        p = [];
        for (let i = t.cols, s = null == i ? void 0 : i.length, o = 0; o < s; o += 1) {
          let s = i[o];
          c = [];
          for (let t = s.elements, i = null == t ? void 0 : t.length, p = 0; p < i; p +=
            1) {
            let i = t[p];
            c.push(d(r, {
              $$: "props,unit",
              _5: l,
              class: "rd-cO",
              _: `6o/${i.type}/5r?props=${n(a,i.props,`a/.${h}.a;.${o}.a:.${p}.a-`)}&unit=` +
                n(a, e, "b_")
            }))
          }
          p.push(d(r, {
            class: "rd-cz rd-cA rd-cH rd-dS",
            style: `height:${t.height}${e};width:${s.width}${e};border-top:${s.borderTopStyle} ${s.borderTopWidth}${e} ${s.borderTopColor};border-right:${s.borderRightStyle} ${s.borderRightWidth}${e} ${s.borderRightColor};border-bottom:${s.borderBottomStyle} ${s.borderBottomWidth}${e} ${s.borderBottomColor};border-left:${s.borderLeftStyle} ${s.borderLeftWidth}${e} ${s.borderLeftColor};border-radius:` +
              s.borderRadius
          }, c))
        }
        u.push(d(r, i, p))
      }
      return h = [d(r, {
        class: "rd-cG rd-d7 rd-cW rd-cY",
        style: `left:${t.x}${e};top:${t.y}${e};opacity:${t.alpha};width:${t.width}${e};height:${t.height}${e};` +
          s(t.animations)
      }, u)], d(l, 0, h)
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/hod-hflex/5r", ["5u"], (t => {
  let e = t("5u"),
    r = "div",
    i = {
      class: "rd-cW"
    };
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: s
         }, d, l, o, a, n) {
      let h, c, p, u;
      u = [];
      for (let s = t.rows, o = null == s ? void 0 : s.length, h = 0; h < o; h += 1) {
        let t = s[h];
        p = [];
        for (let i = t.cols, s = null == i ? void 0 : i.length, o = 0; o < s; o += 1) {
          let s = i[o];
          c = [];
          for (let t = s.elements, i = null == t ? void 0 : t.length, p = 0; p < i; p +=
            1) {
            let i = t[p];
            c.push(d(r, {
              $$: "props,unit",
              _5: l,
              class: "rd-cO",
              _: `6o/${i.type}/5r?props=${n(a,i.props,`a/.${h}.a;.${o}.a:.${p}.a-`)}&unit=` +
                n(a, e, "b_")
            }))
          }
          p.push(d(r, {
            class: "rd-cz rd-cA rd-cH rd-dS",
            style: `height:${t.height}${e};width:${s.width}${e};border-top:${s.borderTopStyle} ${s.borderTopWidth}${e} ${s.borderTopColor};border-right:${s.borderRightStyle} ${s.borderRightWidth}${e} ${s.borderRightColor};border-bottom:${s.borderBottomStyle} ${s.borderBottomWidth}${e} ${s.borderBottomColor};border-left:${s.borderLeftStyle} ${s.borderLeftWidth}${e} ${s.borderLeftColor};border-radius:` +
              s.borderRadius
          }, c))
        }
        u.push(d(r, i, p))
      }
      return h = [d(r, {
        class: "rd-cG rd-d7 rd-cW rd-cY",
        style: `left:${t.x}${e};top:${t.y}${e};opacity:${t.alpha};width:${t.width}${e};height:${t.height}${e};` +
          s(t.animations)
      }, u)], d(l, 0, h)
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/hod-table/5r", ["5u"], (t => {
  let e = t("5u"),
    r = "div",
    i = {
      class: "rd-cz rd-cA rd-cH rd-dS"
    };
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: s
         }, d, l, o, a, n) {
      let h, c, p, u, f, g, b, $ = t.borderwidth,
        m = t.bordertype,
        y = t.bordercolor,
        x = t.borderdeed,
        _ = t.rows;
      f = [];
      for (let t = null == _ ? void 0 : _.length, s = 0; s < t; s += 1) {
        u = [];
        for (let t = _[s].cols, o = null == t ? void 0 : t.length, h = 0; h < o; h += 1) {
          let o = t[h];
          c = [];
          for (let t = o.elements, i = null == t ? void 0 : t.length, p = 0; p < i; p +=
            1) {
            let i = t[p];
            c.push(d(r, {
              $$: "props,unit",
              _5: l,
              class: "rd-cO",
              id: i.id,
              _: `6o/${i.type}/5r?props=${n(a,i.props,`a/.${s}.a;.${h}.a:.${p}.a-`)}&unit=` +
                n(a, e, "b_")
            }))
          }
          p = [d(r, i, c)], u.push(d("td", {
            class: "rd-dx rd-en rd-du rd-cH",
            colspan: 1 != o.colspan && o.colspan,
            rowspan: 1 != o.rowspan && o.rowspan,
            style: `width:${o.width}${e};height:${o.height}${e};border-left:${$?m:"dotted"} ${$}${e} ${$&&o.bLeft?y:"#0000"};border-top:${$?m:"dotted"} ${$}${e} ${$&&o.bTop?y:"#0000"};border-right:${$?m:"dotted"} ${$}${e} ${$&&o.bRight?y:"#0000"};border-bottom:${$?m:"dotted"} ${$}${e} ` +
              ($ && o.bBottom ? y : "#0000")
          }, p))
        }
        f.push(d("tr", 0, u))
      }
      return g = [d("tbody", 0, f)], b = [d("table", {
        class: "rd-cz rd-dw",
        style: "border-collapse:" + x
      }, g)], h = [d(r, {
        class: "rd-cG rd-d7",
        style: `left:${t.x}${e};top:${t.y}${e};opacity:${t.alpha};width:${t.width}${e};height:${t.height}${e};` +
          s(t.animations)
      }, b)], d(l, 0, h)
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/data-celltable/5r", ["5u", "../../5s/60", "../../6c/70", "../../6c/6d", "../subs/barcode",
  "../subs/qrcode"], (t => {
  let e = t("5u"),
    r = t("../../5s/60"),
    i = t("../../6c/70"),
    s = t("../../6c/6d");
  t("../subs/barcode"), t("../subs/qrcode");
  let d = "div",
    l = "props";
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           toUnit: i,
           td: s,
           format: o,
           safeHTML: a,
           enHTML: n
         }, h, c, p, u, f) {
      let g, b, $, m, y, x, _, w, k, v = t.borderwidth,
        L = t.bordertype,
        F = t.bordercolor,
        S = t.borderdeed,
        C = t.rows,
        H = t.bind,
        M = ("collapse" == S ? 1 : 2) * v;
      _ = [];
      for (let t = null == C ? void 0 : C.length, r = 0; r < t; r += 1) {
        x = [];
        for (let t = C[r].cols, g = null == t ? void 0 : t.length, _ = 0; _ < g; _ += 1) {
          let g = t[_];
          if (y = [], H._tip) y.push(h(0, H._tip));
          else {
            let t = g.paddingTop,
              x = g.paddingBottom,
              w = g.paddingLeft,
              k = g.paddingRight,
              v = g.width - M - i(1),
              L = g.height - M - i(1);
            t > L && (t = L), t + x > L && (x = L - t), w > v && (w = v), w + k > v &&
            (k = v - w);
            let F, S = s(g);
            m = [], "text" == g.type ? (g.bindKey ? (F = H._data && H._data[g.bindKey],
              F = o(g.textFormat, F, H._data)) : F = g.textContent, F && ($ = [
              h(0, g.textRichText ? a(F) : n(F), 1)], m.push(h(d, {
              class: !g.textAutoHeight && "rd-cT rd-dv"
            }, $)))) : "image" == g.type ? (F = g.bindKey ? H._data && H._data[g.bindKey] :
              g.imageContent, F && (b = "", (g.imageRotateX || g.imageRotateY) &&
            (b += ";transform:", g.imageRotateX && (b += "rotateX(180deg)"),
            g.imageRotateY && (b += " rotateY(180deg)")), m.push(h(
              "img", {
                class: "rd-b5 rd-cB rd-cC",
                src: F,
                style: b
              }, 1)))) : "barcode" == g.type ? (F = g.bindKey ? H._data &&
              H._data[g.bindKey] : g.barcodeContent, F && m.push(h(d, {
              $$: l,
              _5: c,
              style: "height:" + (L - t - x) + e,
              _: `6o/subs/barcode?props=${f(u,g,`a/.${r}.a;.${_}.a:`)}&value=` +
                p(F)
            }))) : "qrcode" == g.type && (F = g.bindKey ? H._data && H._data[g.bindKey] :
              g.qrcodeContent, F && m.push(h(d, {
              $$: l,
              _5: c,
              style: "height:" + (L - t - x) + e,
              _: `6o/subs/qrcode?props=${f(u,g,`a/.${r}.a;.${_}.a:`)}&value=` +
                p(F)
            }))), b =
              `padding:${t}${e} ${k}${e} ${x}${e} ${w}${e};width:${v}${e};height:`, g
              .textAutoHeight ? b += "100%" : b += L + e, b +=
              `;align-items:${g.vpos};justify-content:${g.hpos};opacity:${g.alpha};`,
            g.background && (b += `background:${g.background};`), "text" == g.type &&
            (b +=
              `color:${g.textForecolor};letter-spacing:${g.textLetterspacing}${e};`,
            g.textStyleBold && (b += "font-weight:bold;"), g.textStyleItalic &&
            (b += "font-style:italic;"), S && (b += `text-decoration:${S};`), b +=
              `font-family:${g.textFontfamily};font-size:${g.textFontsize}${e};`),
              y.push(h(d, {
                class: "rd-dS rd-cW",
                style: b
              }, m))
          }
          b =
            `width:${g.width}${e};height:${g.height}${e};border-left:${v?L:"dotted"} ${v}${e} ${v&&g.bLeft?F:"#0000"};border-top:${v?L:"dotted"} ${v}${e} ${v&&g.bTop?F:"#0000"};border-right:${v?L:"dotted"} ${v}${e} ${v&&g.bRight?F:"#0000"};border-bottom:${v?L:"dotted"} ${v}${e} ` +
            (v && g.bBottom ? F : "#0000"), "text" != g.type && (b +=
            ";vertical-align:", "flex-start" == g.vpos ? b += "top" : "center" == g
            .vpos ? b += "middle" : "flex-end" == g.vpos && (b += "bottom")), x.push(
            h("td", {
              class: "rd-dx rd-en rd-du rd-cH",
              colspan: 1 != g.colspan && g.colspan,
              rowspan: 1 != g.rowspan && g.rowspan,
              style: b
            }, y))
        }
        _.push(h("tr", 0, x))
      }
      return w = [h("tbody", 0, _)], k = [h("table", {
        class: "rd-cz rd-dw",
        style: "border-collapse:" + S
      }, w)], g = [h(d, {
        class: "rd-cG rd-d7",
        style: `left:${t.x}${e};top:${t.y}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);` +
          r(t.animations)
      }, k)], h(c, 0, g)
    },
    init() {
      this.set({
        toUnit: r.bF,
        format: i._f8.bind(i),
        td: s._go
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/hod-tabs/5r", ["5u"], (t => {
  let e = t("5u"),
    r = "div",
    i = {
      class: "rd-cW rd-gL rd-cG rd-d7 rd-dv rd-dU"
    },
    s = {
      class: "rd-cG rd-dz rd-gK"
    },
    {
      View: d,
      applyStyle: l
    } = e;
  return l("rd-eY",
    ".rd-gK{box-shadow:0 -1px #d7dde4}.rd-gL{transform:translate(10px,-100%);width:calc(100% - 20px)}.rd-gM{border-bottom:solid 2px var(--rd-bF)}"
  ), d.extend({
    tmpl({
           props: t,
           unit: e,
           am: d
         }, l, o, a, n, h) {
      let c, p, u, f, g;
      g = [], f = [];
      for (let e = t.rows, i = null == e ? void 0 : e.length, s = 0; s < i; s += 1) {
        for (let i = e[s].cols, d = null == i ? void 0 : i.length, a = 0; a < d; a += 1) {
          u = [l(0, i[a].text)], p = "rd-dQ rd-ep rd-cJ rd-do", t.activeTab == a && (p +=
            " rd-gM rd-dO"), f.push(l(r, {
            _click: o + `\x1e_hs({to:${a}})`,
            class: p
          }, u))
        }
      }
      g.push(l(r, i, f));
      for (let i = t.rows, d = null == i ? void 0 : i.length, a = 0; a < d; a += 1) {
        let d = i[a];
        f = [];
        for (let i = d.cols, s = null == i ? void 0 : i.length, c = 0; c < s; c += 1) {
          let s = i[c];
          if (c == t.activeTab) {
            u = [];
            for (let t = s.elements, i = null == t ? void 0 : t.length, d = 0; d < i; d +=
              1) {
              let i = t[d];
              u.push(l(r, {
                $$: "props,unit",
                _5: o,
                class: "rd-cO",
                _: `6o/${i.type}/5r?props=${h(n,i.props,`a/.${a}.a;.${c}.a:.${d}.a-`)}&unit=` +
                  h(n, e, "b_")
              }))
            }
            f.push(l(r, {
              class: "rd-cH rd-dS",
              style: `height:${d.height}${e};width:` + s.width + e
            }, u))
          }
        }
        g.push(l(r, s, f))
      }
      return c = [l(r, {
        class: "rd-cG rd-d7 rd-cW rd-cY",
        style: `left:${t.x}${e};top:${t.y}${e};opacity:${t.alpha};width:${t.width}${e};height:${t.height}${e};` +
          d(t.animations)
      }, g)], l(o, 0, c)
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    },
    "_hs<click>"(t) {
      let {
        to: e
      } = t.params, r = this.get("props");
      e != r.activeTab && (r.activeTab = e, this.digest({
        props: r
      }))
    }
  })
})), s.d("6o/html/5r", ["../../6c/6d", "../../6c/underscore", "../richtext/5r"], (t => {
  let e = t("../../6c/6d"),
    r = t("../../6c/underscore");
  return t("../richtext/5r").extend({
    assign(t) {
      let {
        props: r
      } = t;
      r.text = e.cB(r.text), this.set(t)
    },
    async render() {
      await r();
      let t = this.get("props"),
        {
          bind: e
        } = t;
      e.id && e._data && (t.text = _.template(t.text)({
        data: e._data,
        fields: e.fields
      })), this.digest()
    }
  })
})), s.d("6o/image/5r", ["5u"], (t => {
  let e = t("5u"),
    {
      View: r,
      isArray: i,
      dispatch: s
    } = e;
  return r.extend({
    tmpl({
           props: t,
           image: e,
           unit: r,
           am: i,
           text: s
         }, d, l) {
      let o, a, n, h = [],
        c = t.x,
        p = t.y,
        u = t.height,
        f = t.alpha,
        g = t.width,
        b = t.rotate,
        $ = t.link,
        m = t.rotateX,
        y = t.rotateY,
        x = t.animations;
      return e ? (o = "rd-b5 rd-cG rd-d7", $ && (o += " rd-do rd-bO"), a =
        `left:${c}${r};top:${p}${r};height:${u}${r};opacity:${f};width:${g}${r};transform:rotate(${b}deg)`,
      m && (a += " rotateX(180deg)"), y && (a += " rotateY(180deg)"), a += ";" + i(x),
        h.push(d("img", {
          draggable: "false",
          src: e,
          _click: $ && l + "\x1e_hu()",
          class: o,
          style: a
        }, 1))) : s && (n = [d(0, s)], h.push(d("div", {
        class: "rd-dS rd-d7 rd-cG rd-cW rd-c0 rd-dk",
        style: `left:${c}${r};top:${p}${r};height:${u}${r};opacity:${f};width:${g}${r};transform:rotate(${b}deg)`
      }, n))), d(l, 0, h)
    },
    assign(t) {
      let {
        props: e
      } = t, {
        bind: r,
        image: s,
        webUrl: d
      } = e, l = "";
      if (!s && d && (s = d), r.id) {
        let t = r.fields[0];
        if (r._tip) l = r._tip;
        else if (r._data) {
          let e = r._data;
          i(e) && (e = e[0]), s = e[t.key]
        } else this._fS && (l = `[\u7ed1\u5b9a:${t.name}]`)
      }
      this.set(t, {
        image: s,
        text: l
      })
    },
    render() {
      this.digest()
    },
    "_hu<click>"() {
      let t = this.get("props");
      s(this.root, "link", {
        props: t
      })
    }
  })
})), s.d("6o/iframe/5r", ["5u"], (t => {
  let e = t("5u"),
    {
      View: r
    } = e;
  return r.extend({
    tmpl({
           props: t,
           unit: e,
           am: r
         }, i, s) {
      let d, l;
      return l = [], t.src && l.push(i("iframe", {
        src: t.src,
        class: "rd-cz rd-cA",
        frameborder: t.border ? 1 : 0,
        sandbox: "" != t.sandbox && t.sandbox,
        allow: "" != t.allow && t.allow
      })), d = [i("div", {
        class: "rd-cG rd-d7",
        style: `left:${t.x}${e};top:${t.y}${e};width:${t.width}${e};height:${t.height}${e};opacity:${t.alpha};transform:rotate(${t.rotate}deg);` +
          r(t.animations)
      }, l)], i(s, 0, d)
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/line/5r", ["5u"], (t => t("5u").View.extend({
  tmpl({
         props: t,
         unit: e,
         am: r
       }, i, s) {
    let d;
    return d = [i("div", {
      class: "rd-cG rd-d7",
      style: `left:${t.x}${e};top:${t.y}${e};border-top:${t.height}${e} ${t.bordertype} ${t.color};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);` +
        r(t.animations)
    })], i(s, 0, d)
  },
  assign(t) {
    this.set(t)
  },
  render() {
    this.digest()
  }
}))), s.d("6o/hod-vflex/5r", ["5u"], (t => {
  let e = t("5u"),
    r = "div",
    i = {
      class: "rd-cW rd-cY"
    };
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: s
         }, d, l, o, a, n) {
      let h, c, p, u;
      u = [];
      for (let s = t.rows, o = null == s ? void 0 : s.length, h = 0; h < o; h += 1) {
        let t = s[h];
        p = [];
        for (let i = t.cols, s = null == i ? void 0 : i.length, o = 0; o < s; o += 1) {
          let s = i[o];
          c = [];
          for (let t = s.elements, i = null == t ? void 0 : t.length, p = 0; p < i; p +=
            1) {
            let i = t[p];
            c.push(d(r, {
              $$: "props,unit",
              _5: l,
              class: "rd-cO",
              _: `6o/${i.type}/5r?props=${n(a,i.props,`a/.${h}.a;.${o}.a:.${p}.a-`)}&unit=` +
                n(a, e, "b_")
            }))
          }
          p.push(d(r, {
            class: "rd-cz rd-cA rd-cH rd-dS",
            style: `width:${t.width}${e};height:${s.height}${e};border-top:${s.borderTopStyle} ${s.borderTopWidth}${e} ${s.borderTopColor};border-right:${s.borderRightStyle} ${s.borderRightWidth}${e} ${s.borderRightColor};border-bottom:${s.borderBottomStyle} ${s.borderBottomWidth}${e} ${s.borderBottomColor};border-left:${s.borderLeftStyle} ${s.borderLeftWidth}${e} ${s.borderLeftColor};border-radius:` +
              s.borderRadius
          }, c))
        }
        u.push(d(r, i, p))
      }
      return h = [d(r, {
        class: "rd-cW rd-cG rd-d7",
        style: `left:${t.x}${e};top:${t.y}${e};opacity:${t.alpha};width:${t.width}${e};height:${t.height}${e};` +
          s(t.animations)
      }, u)], d(l, 0, h)
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/map/5r", ["5u", "../../6c/map"], (t => {
  let e = t("5u"),
    r = t("../../6c/map"),
    {
      View: i,
      mark: s,
      node: d
    } = e;
  return i.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           error: i,
           i18n: s
         }, d, l) {
      let o, a, n, h;
      return a = "", a += i ? ` ${i} ` : ` ${s("h3")} `, n = [d(0, a)], h = [d("div", {
        id: "tip_" + l,
        class: "rd-cW rd-cA rd-c0 rd-dk"
      }, n)], o = [d("div", {
        class: "rd-cG rd-d7",
        style: `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};` +
          r(t.animations),
        id: "map_" + l
      }, h)], d(l, 0, o)
    },
    init() {
      this.on("destroy", (() => {
        let t = this._hx;
        t && t.remove()
      }))
    },
    assign(t) {
      this.set(t)
    },
    async render() {
      let t = s(this, "_bF"),
        e = this.get("props");
      if (this._hy) this.digest({
        error: this._hy
      });
      else {
        if (await this.digest(), !this._hx) try {
          if (await r(), t()) {
            let t = d(`map_${this.id}`),
              r = L.map(t, {
                zoom: e.zoom,
                center: [e.lat, e.lng],
                zoomControl: e.zoomCtrl,
                dragging: e.dragging,
                doubleClickZoom: e.doubleClickZoom
              });
            this._hx = r, L.tileLayer(
              "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
              }).addTo(r), d(`tip_${this.id}`).remove()
          }
        } catch (t) {
          this.digest({
            error: this._hy = t
          })
        }
      }
    }
  })
})), s.d("6o/nbtn/5r", ["5u", "66/96/5r"], (t => {
  let e = t("5u");
  t("66/96/5r");
  let {
    View: r,
    isArray: i,
    dispatch: s,
    mark: d,
    delay: l
  } = e;
  return r.extend({
    tmpl({
           props: t,
           unit: e,
           am: r
         }, i, s, d, l, o) {
      let a, n, h, c = t.x,
        p = t.y,
        u = t.width,
        f = t.height,
        g = t.alpha,
        b = t.rotate,
        $ = t.value,
        m = t.fixed,
        y = t.step,
        x = t.min,
        _ = t.max,
        w = t.enter,
        k = t.hspace;
      return h = [i("div", {
        $$: "props",
        _5: s,
        class: "rd-cA rd-cV rd-bK rd-cH",
        _change: s + "\x1e_hc()",
        _: `66/96/5r?value=${o(l,$,"a/")}&fixed=${o(l,m,"a;")}&step=${o(l,y,"a:")}&min=${o(l,x,"a-")}&max=${o(l,_,"b_")}&keep=`
      })], n = [i(0, w)], h.push(i("button", {
        class: "rd-bQ rd-bS rd-dv rd-bN rd-do",
        style: "margin-left:" + k + e,
        _click: s + "\x1e_gc()"
      }, n)), a = [i("div", {
        class: "rd-cG rd-d7 rd-dS rd-cW",
        style: `left:${c}${e};top:${p}${e};width:${u}${e};height:${f}${e};opacity:${g};transform:rotate(${b}deg);` +
          r(t.animations)
      }, h)], i(s, 0, a)
    },
    assign(t) {
      var e, r;
      let {
        props: s
      } = t, {
        bind: d
      } = s;
      if (d._data) {
        let t = d._data;
        i(t) && (t = t[0]), s.value = t[null === (r = null === (e = d.fields) || void 0 ===
        e ? void 0 : e[0]) || void 0 === r ? void 0 : r.key]
      }
      this._hB = +s.value, this.set(t)
    },
    render() {
      this.digest()
    },
    "_hC<keydown>"(t) {
      "Enter" == t.code && this["_gc<click>"]()
    },
    "_hc<input,change>"(t) {
      this._hB = t.value
    },
    async "_gc<click>"() {
      let t = this.root,
        e = this._hB;
      s(t, "send", {
        value: e
      })
    }
  })
})), s.d("6o/pager/5r", ["5u", "../text/5r"], (t => {
  let e = t("5u"),
    r = t("../text/5r"),
    {
      has: i
    } = e,
    s = /\$\{([a-zA-z0-9_]+)\}/g;
  return r.extend({
    assign(t) {
      let {
        props: e
      } = t, {
        text: r,
        ext: d
      } = e;
      null == d._totalPage && (d._totalPage = "Y"), null == d._currentPage && (d._currentPage =
        "X"), r = r.replace(s, ((t, e) => {
        let r = "_" + e;
        return i(d, r) ? d[r] : t
      })), this.set(t, {
        text: r
      }), this._gH(e), this._gI(e)
    }
  })
})), s.d("6o/number/5r", ["../../6c/6d", "../text/5r"], (t => {
  let e = t("../../6c/6d"),
    r = t("../text/5r"),
    i = /\{#\}/g,
    {
      pow: s
    } = Math;
  return r.extend({
    assign(t) {
      let {
        props: r
      } = t, {
        text: d,
        ext: l
      } = r;
      if (l._fill) {
        let t, r = 0;
        if (l.pad) {
          let t;
          "AP" == l.fx ? t = l.start + (l._total - 1) * l.step : "GP" == l.fx && (t = l.start *
            s(l.step, l._total)), r = (t + "").length
        }
        let o = l._index;
        l.reverse && (o = l._total - o - 1), "AP" == l.fx ? t = l.start + o * l.step : "GP" ==
          l.fx && (t = l.start * s(l.step, o)), l.pad && (t = e.bS(t, r, "0")), d = d.replace(
          i, t)
      }
      this.set(t, {
        text: d
      }), this._gH(r), this._gI(r)
    }
  })
})), s.d("6o/pbtn/5r", ["5u"], (t => {
  let e = t("5u"),
    {
      View: r,
      dispatch: i,
      mark: s,
      toNumber: d
    } = e;
  return r.extend({
    tmpl({
           props: t,
           active: e,
           unit: r,
           am: i
         }, s, d) {
      let l, o = [],
        a = t.x,
        n = t.y,
        h = t.width,
        c = t.height,
        p = t.alpha,
        u = t.rotate,
        f = t.rules[e];
      return f.image && (l =
        `left:${a}${r};top:${n}${r};height:${c}${r};opacity:${p};width:${h}${r};transform:rotate(${u}deg)`,
      f.mx && (l += " rotateX(180deg)"), f.my && (l += " rotateY(180deg)"), l += ";" +
        i(t.animations), o.push(s("img", {
        draggable: "false",
        class: "rd-b5 rd-cG rd-d7 rd-do rd-bO rd-cP",
        src: f.image,
        _pointerdown: d + "\x1e_gc()",
        _pointerup: d + "\x1e_gc()",
        _pointercancel: d + "\x1e_gc()",
        style: l
      }, 1))), s(d, 0, o)
    },
    init() {
      this.set({
        active: 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    },
    async "_gc<pointerdown,pointerup,pointercancel>"({
                                                       eventTarget: t,
                                                       pointerId: e,
                                                       type: r
                                                     }) {
      var l;
      let o = 0;
      "pointerdown" == r ? (t.setPointerCapture(e), o = 1) : t.releasePointerCapture(e),
        this.digest({
          active: o
        });
      let {
        rules: a
      } = this.get("props"), n = this.root, h = a[o], c = s(this, "_ga"), p = i(n,
        "presend", {
          rule: {
            send: "preset",
            sval: h.sval
          }
        }), u = await (null === (l = p._gb) || void 0 === l ? void 0 : l.call(p));
      c() && (u = d(u), i(n, "send", {
        value: u
      }))
    }
  })
})), s.d("6o/pbar/5r", ["5u"], (t => {
  let e = t("5u"),
    r = "rd-cG",
    {
      View: i,
      isArray: s
    } = e;
  return i.extend({
    tmpl({
           props: t,
           unit: e,
           am: i,
           value: s,
           text: d
         }, l, o) {
      let a, n, h, c;
      return h = [], (t.showText || d) && (n = [l(0, d || s + "%")], h.push(l("span", {
        class: r,
        style: `transform:translate(50%,-100%);right:0;color:${t.textColor};font-size:` +
          t.textFontsize + e
      }, n))), c = [l("div", {
        style: `width:${s}%;background-color:${t.barcolor};border-radius:` + t.radius +
          e,
        class: "rd-cA rd-cH rd-dF"
      }, h)], a = [l("div", {
        class: r,
        style: `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);background-color:${t.background};border-radius:${t.radius}${e};` +
          i(t.animations)
      }, c)], l(o, 0, a)
    },
    _gh({
          props: t
        }) {
      let {
        bind: e,
        value: r
      } = t, i = "";
      if (e.id) {
        let t = e.fields[0];
        if (e._tip) i = e._tip, r = 60;
        else if (e._data) {
          let i = e._data;
          s(i) && (i = i[0]), r = i[t.key], !isNaN(r) && isFinite(r) || (r = 0), r < 0 ?
            r = 0 : r > 100 && (r = 100)
        } else this._hF && (i = `[\u7ed1\u5b9a:${t.name}]`)
      }
      return this.set({
        value: r,
        text: i
      }), r
    },
    assign(t) {
      this.set(t), this._gh(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/qrcode/5r", ["5u", "../../6c/qrcode"], (t => {
  let e = t("5u"),
    r = t("../../6c/qrcode"),
    i = "div",
    s = {
      class: "rd-cW rd-c0 rd-dk rd-cA"
    },
    {
      View: d,
      mark: l,
      node: o,
      task: a,
      isArray: n
    } = e;
  return d.extend({
    tmpl({
           error: t,
           text: e,
           props: r,
           unit: d,
           am: l
         }, o, a) {
      let n, h, c = [];
      return (t || e) && (h = [], t && (n = [o(0, t)], h.push(o(i, s, n))), h.push(o(i, {
        id: `_rd_${a}_qr`
      })), c.push(o(i, {
        class: "rd-cG rd-d7 rd-dS",
        style: `left:${r.x}${d};top:${r.y}${d};height:${r.height}${d};opacity:${r.alpha};width:${r.width}${d};transform:rotate(${r.rotate}deg);` +
          l(r.animations)
      }, h))), o(a, 0, c)
    },
    assign(t) {
      let {
        props: e
      } = t, {
        bind: r,
        text: i
      } = e;
      if (r.id) {
        let t = r.fields[0];
        if (r._tip) i = r._tip;
        else if (r._data) {
          let e = r._data;
          n(e) && (e = e[0]), i = e[t.key]
        } else i = `[\u7ed1\u5b9a:${t.name}]`
      }
      this.set(t, {
        text: i + ""
      })
    },
    async render() {
      let t = l(this, "_bF");
      await this.digest({
        error: null
      });
      try {
        if (await r._fX(), t()) {
          let e = this.get("text"),
            r = this.get("props"),
            i = this._hG;
          if (e) {
            if (e != this._hH || r.colorDark != this._hI || r.colorLight != this._hJ ||
              r.correctLevel != this._hK) {
              if (!i) {
                let t = o(`_rd_${this.id}_qr`);
                i = new QRCode(t, {
                  width: 512,
                  height: 512
                }), this._hG = i
              }
              let s = l(this, "_hL");
              a((() => {
                if (t() && s()) {
                  i._htOption.colorDark = this._hI = r.colorDark,
                    i._htOption.colorLight = this._hJ = r.colorLight,
                    i._htOption.correctLevel = this._hK =
                      QRCode.CorrectLevel[r.correctLevel], i.makeCode(
                    this._hH = e);
                  let {
                    classList: t
                  } = this.root.querySelector("img");
                  t.add("rd-b5", "rd-cz", "rd-cB");
                  let s = i._el;
                  null == s || s.classList.remove("rd-eN")
                }
              }))
            }
          } else if (i) {
            let t = i._el;
            null == t || t.classList.add("rd-eN")
          }
        }
      } catch (e) {
        t() && this.digest({
          error: e
        })
      }
    }
  })
})), s.d("6o/rate/5r", ["../pbar/5r"], (t => {
  let e, r = t("../pbar/5r"),
    i = "rd-bF",
    s = "div",
    d = {
      class: "rd-cA rd-cW rd-dj rd-c0"
    };
  return r.extend({
    tmpl({
           props: t,
           unit: r,
           am: l,
           value: o
         }, a, n) {
      let h, c, p, u, f;
      p = [];
      for (let s = 0; t.stars > s; s++) c = [e || (e = a(0, "\ue60c"))], p.push(a("i", {
        class: i,
        style: "font-size:" + t.starSize + r
      }, c));
      f = [a(s, d, p)], c = [];
      for (let s = 0; t.stars > s; s++) u = [e || (e = a(0, "\ue60c"))], c.push(a("i", {
        class: i,
        style: "font-size:" + t.starSize + r
      }, u));
      return p = [a(s, {
        class: "rd-cW rd-cA rd-dj rd-c0",
        style: "width:" + t.width + r
      }, c)], f.push(a(s, {
        class: "rd-cG rd-dz rd-dS rd-dF",
        style: `width:${o}%;color:` + t.fillcolor
      }, p)), h = [a(s, {
        class: "rd-cG",
        style: `left:${t.x}${r};top:${t.y}${r};height:${t.height}${r};opacity:${t.alpha};width:${t.width}${r};transform:rotate(${t.rotate}deg);color:${t.background};` +
          l(t.animations)
      }, f)], a(n, 0, h)
    }
  })
})), s.d("6o/rect/5r", ["5u"], (t => t("5u").View.extend({
  tmpl({
         props: t,
         unit: e,
         btWidth: r,
         brWidth: i,
         bbWidth: s,
         blWidth: d,
         am: l
       }, o, a) {
    let n, h;
    return h =
      `left:${t.x}${e};top:${t.y}${e};border-top:${t.borderTopStyle} ${r}${e} ${t.borderTopColor};border-right:${t.borderRightStyle} ${i}${e} ${t.borderRightColor};border-bottom:${t.borderBottomStyle} ${s}${e} ${t.borderBottomColor};border-left:${t.borderLeftStyle} ${d}${e} ${t.borderLeftColor};`,
    t.fillcolor && (h += `background:${t.fillcolor};`), h +=
      `height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);border-radius:${t.radius};` +
      l(t.animations), n = [o("div", {
      class: "rd-cG rd-d7",
      style: h
    })], o(a, 0, n)
  },
  assign(t) {
    let {
      props: e
    } = t, {
      borderTopWidth: r,
      borderRightWidth: i,
      borderBottomWidth: s,
      borderLeftWidth: d,
      width: l,
      height: o
    } = e, a = r + s, n = i + d;
    a > o && (r = r / a * o, s = s / a * o), n > l && (i = i / n * l, d = d / n * l), this.set(t, {
      btWidth: r,
      brWidth: i,
      bbWidth: s,
      blWidth: d
    })
  },
  render() {
    this.digest()
  }
}))), s.d("6o/repeat/5r", ["5u"], (t => {
  let e = t("5u"),
    {
      View: r,
      isArray: i
    } = e;
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: r
         }, i, s) {
      let d, l;
      return l =
        `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);`,
      t.radius && (l += `border-radius:${t.radius}${e};`), (t.image || t.webUrl) && (l +=
          `background-image:url(${t.image||t.webUrl});`, "full" == t.repeat ? l +=
          "background-size:100% 100%;" : t.imageWidth > 0 && t.imageHeight > 0 && (l +=
          `background-size:${t.imageWidth}${e} ${t.imageHeight}${e};`), l +=
          `background-repeat:${"full"==t.repeat?"no-repeat":t.repeat};background-position:${t.backgroundXOffset}${e} ${t.backgroundYOffset}${e};`
      ), l += r(t.animations), d = [i("div", {
        class: "rd-cG rd-d7 rd-dS",
        style: l
      })], i(s, 0, d)
    },
    assign(t) {
      let {
        props: e
      } = t, {
        bind: r
      } = e, s = "";
      if (r.id) {
        let t = r.fields[0];
        if (r._tip) s = r._tip;
        else if (r._data) {
          let s = r._data;
          i(s) && (s = s[0]), e.image = s[t.key]
        } else this._fS && (s = `[\u7ed1\u5b9a:${t.name}]`)
      }
      this.set(t, {
        text: s
      })
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/richtext/5r", ["5u"], (t => t("5u").View.extend({
  tmpl({
         props: t,
         unit: e,
         am: r
       }, i, s) {
    let d, l, o, a;
    return a = [i(0, t.text, 1)], l = "rd-cG rd-d7", t.splitToPages || (l += " rd-dU"), o =
      `left:${t.x}${e};top:${t.y}${e};opacity:${t.alpha};width:${t.width}${e};height:`, t.splitToPages ?
      o += "auto" : o += t.height + e, o += ";" + r(t.animations), d = [i("div", {
      class: l,
      style: o
    }, a)], i(s, 0, d)
  },
  assign(t) {
    this.set(t)
  },
  render() {
    this.digest()
  }
}))), s.d("6o/signature/5r", ["5u", "../../6c/signature"], (t => {
  let e = t("5u"),
    r = t("../../6c/signature"),
    {
      View: i,
      mark: s,
      node: d
    } = e;
  return i.extend({
    tmpl({
           props: t,
           unit: e,
           bw: r
         }, i, s) {
      let d, l, o;
      return o = [i("canvas", {
        class: "rd-cz rd-cA",
        id: s + "_c"
      })], l =
        `left:${t.x}${e};top:${t.y}${e};width:${t.width}${e};height:${t.height}${e};opacity:${t.alpha};`,
      r && (l += `border:${r}${e} ${t.bordertype} ${t.bordercolor};`), d = [i("div", {
        class: "rd-cG rd-d7",
        style: l
      }, o)], i(s, 0, d)
    },
    init() {
      this.on("destroy", (() => {
        let t = this._hO;
        null == t || t.off()
      }))
    },
    assign(t) {
      let {
        props: e
      } = t, {
        borderwidth: r,
        width: i,
        height: s
      } = e, d = this.get("mmin")(i, s) / 2;
      r > d && (r = d), this.set(t, {
        bw: r
      })
    },
    async render() {
      let t = s(this, "_bF");
      if (await r(), await this.digest(), t()) {
        let t = this._hO,
          e = this.get("props"),
          r = d(`${this.id}_c`),
          i = devicePixelRatio;
        r.width = r.offsetWidth * i, r.height = r.offsetHeight * i, r.getContext("2d").scale(
          i, i), t || (t = new SignaturePad(r), this._hO = t), e.background && (t
          .backgroundColor = e.background), t.penColor = e.pencolor, t.clear()
      }
    }
  })
})), s.d("6o/rod/5r", ["5u"], (t => {
  let e = t("5u"),
    r = "span";
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: i
         }, s, d) {
      let l, o, a, n, h = t.bordertype,
        c = t.color;
      return n = [s(r, {
        style: `flex-grow:1;border-top:1px ${h} ` + c
      })], a = [s(0, t.text)], n.push(s(r, {
        style: `padding:0 4px;transform:rotate(${t.textRotate}deg);color:` + c
      }, a), s(r, {
        style: `flex-grow:1;border-top:1px ${h} ` + c
      })), o =
        `left:${t.x}${e};top:${t.y}${e};opacity:${t.alpha};width:${t.width}${e};height:${t.height}${e};transform:rotate(${t.rotate}deg);`,
      t.startBorder && (o += `border-left:1px ${h} ${c};`), t.endBorder && (o +=
        `border-right:1px ${h} ${c};`), o += i(t.animations), l = [s("div", {
        class: "rd-cG rd-d7 rd-cW rd-c0 rd-dk",
        style: o
      }, n)], s(d, 0, l)
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/slight/5r", ["5u", "../../66/6a/5r", "../../6c/6d"], (t => {
  let e = t("5u"),
    r = t("../../66/6a/5r"),
    i = t("../../6c/6d"),
    {
      isArray: s,
      View: d,
      node: l
    } = e;
  return d.extend({
    tmpl({
           props: t,
           unit: e,
           bg: r,
           am: i
         }, s, d) {
      let l, o;
      return o =
        `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);border-radius:${t.radius};`,
      r && (o += `background-color:${r};`), o += i(t.animations), l = [s("div", {
        class: "rd-cG rd-d7",
        id: "_rd_" + d,
        style: o
      })], s(d, 0, l)
    },
    init() {
      this._hP = this._hQ.bind(this), this.on("destroy", (() => {
        r._bZ(this._hP)
      }))
    },
    assign(t) {
      let {
        props: e
      } = t, {
        bind: r,
        value: i,
        rules: d = []
      } = e;
      if (r.id) {
        let t = r.fields[0];
        if (r._data) {
          let e = r._data;
          s(e) && (e = e[0]), i = e[t.key]
        }
      }
      this.set(t, {
        value: i,
        rules: d
      })
    },
    _hQ() {
      let t = this._hR,
        e = this.get("rules"),
        i = this._hS,
        s = this._hT;
      if (-1 == i) t.background = "", this.set({
        bg: ""
      });
      else {
        let d = e[i],
          l = d.colors.length,
          o = d.colors[s];
        t.background = o, this.set({
          bg: o
        }), l > 1 ? (this._hT++, this._hT >= l && (this._hT = 0)) : r._bZ(this._hP)
      }
    },
    async render() {
      await this.digest();
      let t = this.get("value"),
        e = this.get("rules"),
        s = -1;
      if (!this._hR) {
        let t = l(`_rd_${this.id}`);
        this._hR = t.style
      }
      for (let r = 0; r < e.length; r++) {
        let d = e[r],
          l = i.cG[d.use];
        if (null == l ? void 0 : l(t, d.value)) {
          s = r;
          break
        }
      }
      let d = e[s],
        o = JSON.stringify([d, s]);
      o != this._hU && (this._hU = o, this._hT = 0, this._hS = s, r._bZ(this._hP), this._hQ(),
      (null == d ? void 0 : d.speed) && r._b0(100 * d.speed, this._hP))
    }
  })
})), s.d("6o/subs/barcode", ["5u", "../../5s/60", "../../6c/barcode"], (t => {
  let e = t("5u"),
    r = t("../../5s/60"),
    i = t("../../6c/barcode"),
    {
      View: s,
      task: d,
      mark: l
    } = e;
  return s.extend({
    tmpl({
           msg: t,
           render: e,
           fill: r
         }, i, s) {
      let d, l = [];
      return t ? l.push(i(0, t)) : "svg" == e ? l.push(i("svg", {
        id: s + "_bar",
        class: "rd-cB rd-cz rd-cA rd-cK"
      })) : (d = "rd-b5 rd-cB rd-cC", "full" == r && (d += " rd-cz rd-cA"), l.push(i(
        "img", {
          id: s + "_bar",
          class: d
        }, 1))), i(s, 0, l)
    },
    assign(t) {
      this.set(t)
    },
    async render() {
      let t = l(this, "_bF");
      await this.digest({});
      try {
        if (await i._fX(), t()) {
          let {
            value: e,
            props: i
          } = this.get(), {
            barcodeColor: s,
            barcodeLineWidth: l,
            barcodeShowText: o,
            barcodeFormat: a,
            barcodeContent: n,
            barcodeRender: h,
            barcodeFill: c,
            barcodeStyleBold: p,
            barcodeStyleItalic: u,
            barcodeTextPosition: f,
            barcodeTextAlign: g,
            barcodeFont: b,
            barcodeFontsize: $,
            barcodeTextMargin: m
          } = i;
          await this.digest({
            msg: null,
            render: h,
            fill: c
          }), d((() => {
            if (t()) {
              e || (e = n);
              let t = "",
                i = this.root.offsetHeight;
              p && (t = "bold"), u && (p && (t += " "), t += "italic"),
                $ = r.bU($), m = r.bU(m), l = r.bU(l), JsBarcode(
                `#${this.id}_bar`, e, {
                  height: i,
                  lineColor: s,
                  width: l,
                  textPosition: f,
                  textAlign: g,
                  format: a,
                  fontSize: $,
                  fontOptions: t,
                  displayValue: o,
                  font: b,
                  textMargin: m
                })
            }
          }))
        }
      } catch (e) {
        t() && this.digest({
          msg: e.message || e
        })
      }
    }
  })
})), s.d("6o/subs/bwip", ["5u", "../../6b/5r", "../../6c/bwip"], (t => {
  let e = t("5u"),
    r = t("../../6b/5r"),
    i = t("../../6c/bwip"),
    {
      View: s,
      task: d,
      mark: l
    } = e;
  return s.extend({
    assign(t) {
      this.set(t)
    },
    async render() {
      let {
        root: t
      } = this;
      i._hV() || (t.innerHTML = r("h3"));
      let e = l(this, "_bF"),
        {
          bwipParams: s,
          bwipFormat: o,
          bwipValue: a
        } = this.get("props"),
        n = JSON.stringify([s, o, a]);
      try {
        await i._fX(), d((() => {
          if (e() && this._hW != n)
            if (this._hW = n, a) {
              let e = bwipjs.toSVG({
                bcid: o,
                text: a
              }, s);
              t.innerHTML = e
            } else t.innerHTML = "N/A"
        }))
      } catch (r) {
        e() && (t.innerHTML = r.message)
      }
    }
  })
})), s.d("6o/subs/qrcode", ["5u", "../../6c/qrcode"], (t => {
  let e = t("5u"),
    r = t("../../6c/qrcode"),
    {
      View: i,
      mark: s,
      node: d,
      task: l
    } = e;
  return i.extend({
    tmpl({
           msg: t,
           props: e
         }, r, i) {
      let s = [];
      return t ? s.push(r(0, t)) : s.push(r("div", {
        id: `_rd_${i}_qr`,
        class: "rd-cW rd-cA",
        style: "align-items:" + e.vpos
      })), r(i, 0, s)
    },
    assign(t) {
      this.set(t)
    },
    async render() {
      let t = s(this, "_bF");
      await this.digest({});
      try {
        await r._fX();
        let {
          value: e,
          props: i
        } = this.get();
        l((() => {
          if (t() && (e || (e = i.qrcodeContent), e && (e != this._hH ||
            i.qrcodeColorDark != this._hI || i.qrcodeColorLight !=
            this._hJ || i.qrcodeCorrectLevel != this._hK))) {
            let r = this._hG;
            if (!r) {
              let t = d(`_rd_${this.id}_qr`);
              r = new QRCode(t, {
                width: 512,
                height: 512
              }), this._hG = r
            }
            let o = s(this, "_hL");
            l((() => {
              if (t() && o()) {
                r._htOption.colorDark = this._hI = i.qrcodeColorDark,
                  r._htOption.colorLight = this._hJ =
                    i.qrcodeColorLight, r._htOption.correctLevel =
                  this._hK = QRCode.CorrectLevel[i.qrcodeCorrectLevel],
                  r.makeCode(this._hH = e);
                let {
                  classList: t
                } = this.root.querySelector("img");
                t.add("rd-b5", "rd-cC", "rd-cB")
              }
            }))
          }
        }))
      } catch (e) {
        t() && this.digest({
          msg: e
        })
      }
    }
  })
})), s.d("6o/text/5r", ["5u", "../../6c/70", "../../6c/6d"], (t => {
  let e = t("5u"),
    r = t("../../6c/70"),
    i = t("../../6c/6d"),
    {
      isArray: s,
      View: d,
      dispatch: l
    } = e;
  return d.extend({
    tmpl({
           props: t,
           unit: e,
           td: r,
           bw: i,
           am: s,
           safeHTML: d,
           text: l,
           enHTML: o
         }, a, n) {
      let h, c, p, u, f;
      return u = [a(0, t.richText ? d(l) : o(l), 1)], f = [a("div", 0, u)], c =
        "rd-cG rd-d7 rd-cW rd-dS rd-du", t.link && (c += " rd-do rd-bO"), t.display && (c +=
        " rd-cK"), p = `left:${t.x}${e};top:${t.y}${e};color:${t.forecolor};`, t.background &&
      (p += `background:${t.background};`), p +=
        `font-size:${t.fontsize}${e};min-height:${t.height}${e};letter-spacing:${t.letterspacing}${e};opacity:${t.alpha};line-height:${t.lineheight};`,
      t.styleBold && (p += "font-weight:bold;"), t.styleItalic && (p +=
        "font-style:italic;"), r && (p += `text-decoration:${r};`), p +=
        `align-items:${t.vpos};justify-content:${t.hpos};width:${t.width}${e};transform:rotate(${t.rotate}deg);font-family:${t.fontfamily};`,
      i && (p += `border:${i}${e} ${t.bordertype} ${t.bordercolor};`), t.autoHeight ? p +=
        `transform-origin:${t.width/2}${e} ${t.height/2}${e};` : p +=
        `max-height:${t.height}${e};`, p += s(t.animations), h = [a("div", {
        _click: t.link && n + "\x1e_hu()",
        class: c,
        style: p
      }, f)], a(n, 0, h)
    },
    _gH(t) {
      this.set({
        td: i._go(t, "style")
      })
    },
    _gI({
          borderwidth: t,
          width: e,
          height: r
        }) {
      let i = this.get("mmin")(e, r) / 2;
      t > i && (t = i), this.set({
        bw: t
      })
    },
    assign(t) {
      let {
        props: e
      } = t, {
        text: d,
        bind: l,
        format: o,
        richText: a
      } = e;
      if (null == l ? void 0 : l.id) {
        let t = l.fields[0];
        if (l._tip) d = l._tip;
        else if (l._data) {
          let e, n = l._data;
          if (s(n) && (n = n[0]), d = n[t.key], a) {
            let t = i.cI(o);
            o = t.cK, e = t.cJ
          }
          d = r._f8(o, d, n), a && (d = i.cL(d, e))
        } else this._fS && (d = `[\u7ed1\u5b9a:${t.name}]`)
      }
      this.set(t, {
        text: d
      }), this._gH(e), this._gI(e)
    },
    render() {
      this.digest()
    },
    "_hu<click>"() {
      let t = this.get("props");
      l(this.root, "link", {
        props: t
      })
    }
  })
})), s.d("6o/tag/5r", ["5u"], (t => {
  let e = t("5u"),
    r = "rd-gS rd-dv",
    {
      View: i,
      applyStyle: s,
      isArray: d,
      isObject: l
    } = e;
  return s("rd-g7",
    ".rd-gS{padding:1px 4px;border-radius:2px;text-decoration:none;margin:4px;display:inline-block}"
  ), i.extend({
    tmpl({
           props: t,
           unit: e,
           am: i
         }, s, d) {
      let l, o, a, n;
      n = [];
      for (let e = t.words, i = null == e ? void 0 : e.length, d = 0; d < i; d += 1) {
        let t = e[d];
        t.text && (t.url ? (a = [s(0, t.text)], n.push(s("a", {
          class: r,
          style: `background:${t.background};color:` + t.forecolor,
          href: t.url,
          rel: "noopener noreferrer",
          target: "_blank"
        }, a))) : (a = [s(0, t.text)], n.push(s("span", {
          class: r,
          style: `background:${t.background};color:` + t.forecolor
        }, a))))
      }
      return o = "rd-cG rd-d7", "hidden" == t.overflow ? o += " rd-dS" : "visible" == t.overflow ?
        o += " rd-dT" : o += " rd-cQ rd-cS rd-dU rd-cR", l = [s("div", {
        style: `left:${t.x}${e};top:${t.y}${e};width:${t.width}${e};height:${t.height}${e};opacity:${t.alpha};transform:rotate(${t.rotate}deg);` +
          i(t.animations),
        class: o
      }, n)], s(d, 0, l)
    },
    assign(t) {
      let {
        props: e
      } = t, {
        words: r = [],
        bind: i
      } = e;
      if ((null == i ? void 0 : i.id) && i.fields.length && i._data) {
        r.length = 0;
        let t = i._data,
          e = i.fields[0].key;
        d(t) || (t = [t]);
        for (let i of t) {
          let t = i[e];
          l(t) && r.push(t)
        }
      }
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/video/5r", ["5u"], (t => {
  let e = t("5u");
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           i18n: i
         }, s, d) {
      let l, o, a;
      return a = [], t.src ? a.push(s("video", {
        src: t.src,
        poster: t.poster,
        controls: t.controls,
        autoplay: t.autoplay,
        loop: t.loop,
        muted: t.muted,
        style: `width:${t.width}${e};height:` + t.height + e
      })) : (o = [s(0, i("kl"))], a.push(s("div", {
        class: "rd-dS rd-cE",
        style: `width:${t.width}${e};height:${t.height}${e};line-height:` +
          t.height + e
      }, o))), l = [s("div", {
        class: "rd-cG rd-d7",
        style: `left:${t.x}${e};top:${t.y}${e};opacity:${t.alpha};transform:rotate(${t.rotate}deg);` +
          r(t.animations)
      }, a)], s(d, 0, l)
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/todo/5r", ["5u", "../../5s/60", "../../5s/6f"], (t => {
  let e, r, i = t("5u"),
    s = t("../../5s/60"),
    d = t("../../5s/6f"),
    l = "input",
    o = "div",
    a = {
      class: "rd-em rd-gW"
    },
    n = {
      class: "rd-gT rd-eu"
    },
    h = {
      class: "rd-gX rd-cW rd-c0 rd-gW"
    },
    c = {
      checked: "checked"
    },
    {
      View: p,
      applyStyle: u,
      node: f,
      State: g
    } = i;
  return u("rd-he",
    ".rd-gT{border:solid 1px #ccc9}.rd-gU{background:#eee9}.rd-gV{min-height:40px}.rd-gW{border-bottom:1px solid #ccc9}.rd-gX{height:24px;line-height:24px;padding:0 4px}.rd-gY{display:none}.rd-gX:hover{background:#eee3}.rd-gX:hover .rd-gY{display:block}.rd-gZ{text-decoration:line-through}"
  ), p.extend({
    tmpl({
           props: t,
           unit: i,
           scale: s,
           am: d
         }, p, u) {
      let f, g, b, $, m, y, x, _;
      if (b = [p(l, {
        class: "rd-bJ rd-bK rd-cz rd-dh",
        placeholder: "\u51c6\u5907\u505a\u4ec0\u4e48?\u56de\u8f66\u6dfb\u52a0\u5f85\u529e\u4e8b\u9879",
        _keydown: u + "\x1e_ip()"
      }, 1)], _ = [p(o, a, b)], b = [], t.todos.length) {
        x = [];
        for (let r = t.todos, i = null == r ? void 0 : r.length; i--;) {
          let t = r[i];
          m = [p(l, {
            type: "checkbox",
            checked: t.complete,
            _change: u + `\x1e_io({index:${i}})`
          }, 1, c), p(0, t.task)], $ = "rd-cW rd-c0 rd-cV rd-cT rd-dv", t.complete &&
          ($ += " rd-dP rd-gZ"), y = [p("label", {
            class: $
          }, m)], m = [e || (e = p(0, "\ue6b3"))], y.push(p("i", {
            class: "rd-bF rd-dY rd-do rd-dP rd-dR rd-gY",
            _click: u + `\x1e_iq({index:${i}})`
          }, m)), x.push(p(o, h, y))
        }
        b.push(p(o, n, x))
      } else b.push(r || (r = p(0, "\u6682\u65e0\u5f85\u529e\u4e8b\u9879")));
      return $ = "rd-em rd-gV rd-ct", t.todos.length || ($ += " rd-dP"), _.push(p(o, {
        class: $
      }, b)), g =
        `left:${t.x}${i};top:${t.y}${i};height:${t.height/s}${i};opacity:${t.alpha};width:${t.width/s}${i};`,
      1 != s && (g += `transform:scale(${s});transform-origin:0 0;`), g += d(t.animations),
        f = [p(o, {
          class: "rd-cG rd-d7 rd-gU rd-gT rd-eB",
          _pointerdown: u + "\x1e_fm()",
          _contextmenu: u + "\x1e_fm()",
          id: "todo_" + u,
          style: g
        }, _)], p(u, 0, f)
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest({
        scale: g.get("bJ") || 1
      })
    },
    _in() {
      let t = f(`todo_${this.id}`);
      if (t) {
        let e = t.childNodes,
          r = 2 * (g.get("bJ") || 1);
        for (let t = e.length; t--;) {
          let i = e[t];
          1 == i.nodeType && (r += i.offsetHeight)
        }
        let i = this.get("props");
        i.height = s.bF(r), this.digest({
          props: i
        })
      }
    },
    async "_ip<keydown>"({
                           code: t,
                           eventTarget: e
                         }) {
      if (t == d.bO) {
        let t = e,
          r = t.value;
        if (r) {
          t.value = "";
          let e = this.get("props");
          e.todos.push({
            task: r,
            complete: !1
          }), await this.digest({
            props: e
          }), this._in()
        }
      }
    },
    async "_iq<click>"(t) {
      let {
        index: e
      } = t.params, r = this.get("props");
      r.todos.splice(e, 1), await this.digest({
        props: r
      }), this._in()
    },
    "_io<change>"(t) {
      let {
        index: e
      } = t.params, r = this.get("props");
      r.todos[e].complete = t.eventTarget.checked, this.digest({
        props: r
      })
    },
    "_fm<pointerdown,contextmenu>"(t) {
      t._d2 || (t._d2 = 1)
    }
  })
})), s.d("6o/wea/5r", ["5u", "../../66/6a/5r"], (t => {
  let e = t("5u"),
    r = t("../../66/6a/5r"),
    {
      View: i,
      State: s
    } = e;
  return i.extend({
    tmpl({
           props: t,
           unit: e,
           scale: r,
           am: i,
           day: s
         }, d, l) {
      let o, a, n, h, c = t.x,
        p = t.y,
        u = t.width,
        f = t.height,
        g = t.alpha,
        b = t.rotate,
        $ = t.skin,
        m = t.style,
        y = t.color,
        x = t.params;
      return n =
        `//tianqiapi.com/api.php?style=${m}&skin=${$}&align=${t.align}&color=${y.slice(1)}&d=` +
        s, x && (n += "&" + x), h = [d("iframe", {
        scrolling: "no",
        frameborder: 0,
        class: "rd-cz rd-cA",
        allowtransparency: "true",
        src: n
      })], a =
        `left:${c}${e};top:${p}${e};width:${u/r}${e};height:${f/r}${e};opacity:${g};transform:rotate(${b}deg);`,
      1 != r && (a += `transform:scale(${r});transform-origin:0 0;`), a += i(t.animations),
        o = [d("div", {
          class: "rd-cG rd-d7 rd-dS",
          style: a
        }, h)], d(l, 0, o)
    },
    init() {
      let t = (new Date).getDate(),
        e = () => {
          let e = (new Date).getDate();
          e != t && (t = e, this.digest({
            day: t
          }))
        };
      this.set({
        day: t
      }), r._b0(5e3, e), this.on("destroy", (() => {
        r._bZ(e)
      }))
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest({
        scale: s.get("bJ") || 1
      })
    }
  })
})), s.d("6o/xsheet/5r", ["5u", "../../6c/xsheet"], (t => {
  let e = t("5u"),
    r = t("../../6c/xsheet"),
    {
      View: i,
      mark: s,
      node: d
    } = e;
  return i.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           error: i,
           i18n: s
         }, d, l) {
      let o, a, n, h;
      return a = "", a += i ? ` ${i} ` : ` ${s("h3")} `, n = [d(0, a)], h = [d("div", {
        id: "_rd_tip_" + l,
        class: "rd-cW rd-cA rd-c0 rd-dk"
      }, n)], o = [d("div", {
        class: "rd-cG rd-d7",
        style: `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};` +
          r(t.animations),
        id: "_rd_sheet_" + l
      }, h)], d(l, 0, o)
    },
    init() {
      this.on("destroy", (() => {
        this._ir && window.luckysheet && luckysheet.destroy({
          container: "_rd_sheet_" + this.id
        })
      }))
    },
    assign(t) {
      this.set(t)
    },
    async render() {
      let t = s(this, "_bF");
      if (this._hy) this.digest({
        error: this._hy
      });
      else {
        if (await this.digest(), !this._ir) try {
          if (await r(), t()) {
            let t = this.get("props");
            luckysheet.create({
              showtoolbar: !1,
              showsheetbar: !1,
              showinfobar: !1,
              enableAddBackTop: !1,
              enableAddRow: !1,
              sheetFormulaBar: !1,
              showstatisticBar: !1,
              data: t.sheetData,
              cellRightClickConfig: {
                copy: !0,
                copyAs: !0,
                paste: !0,
                insertRow: !0,
                insertColumn: !0,
                deleteRow: !0,
                deleteColumn: !0,
                deleteCell: !0,
                hideRow: !1,
                hideColumn: !1,
                rowHeight: !1,
                columnWidth: !1,
                clear: !1,
                matrix: !1,
                sort: !1,
                filter: !1,
                chart: !1,
                image: !1,
                link: !1,
                data: !1,
                cellFormat: !1
              },
              container: "_rd_sheet_" + this.id
            }), this._ir = 1, d(`_rd_tip_${this.id}`).remove()
          }
        } catch (t) {
          this.digest({
            error: this._hy = t
          })
        }
      }
    }
  })
})), s.d("6o/chart/bar/5r", ["5u", "../../../6c/83", "../../../6c/echarts"], (t => {
  let e = t("5u"),
    r = t("../../../6c/83"),
    i = t("../../../6c/echarts"),
    {
      node: s,
      View: d,
      mark: l,
      isArray: o
    } = e;
  return d.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           error: i
         }, s, d) {
      let l, o;
      return o =
        `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);`,
      t.background && (o += `background:${t.background};`), o += r(t.animations), l = [s(
        "div", {
          class: "rd-cG rd-d7 rd-ed",
          "data-tip": i || "\u6b63\u5728\u52a0\u8f7d\u56fe\u8868\u7ec4\u4ef6...",
          id: "_rd_chart_" + d,
          style: o
        })], s(d, 0, l)
    },
    assign(t) {
      this.set(t)
    },
    _f3() {
      if (!this._f2) {
        let t = s("_rd_chart_" + this.id);
        this._f2 = echarts.init(t), this.on("destroy", (() => {
          this._f2.dispose()
        }));
        let e = ["\u8bf7\u7ed1\u5b9a\u6570\u636e"],
          r = [100];
        this._f2.setOption({
          tooltip: {
            trigger: "axis"
          },
          xAxis: {
            data: e
          },
          yAxis: {
            type: "value"
          },
          series: [{
            data: r,
            type: "bar"
          }]
        }, !0), t.dataset.tip = ""
      }
      this._f2.resize()
    },
    async render() {
      let t = l(this, "_bF");
      await this.digest();
      try {
        if (await i(), t()) {
          let t = this.get("props");
          this._f3(), this._f2.setOption({
            title: {
              text: t.title,
              x: t.titleAlign
            },
            color: t.color
          });
          let e = this._f4,
            r = JSON.stringify(t.bind);
          e != r && (this._f4 = r, this._f5(t))
        }
      } catch (e) {
        t() && this.digest({
          error: e
        })
      }
    },
    async _f5(t) {
      let {
        bind: e
      } = t;
      if (e.id) {
        let t = l(this, "_f5"),
          {
            _eE: i
          } = await r._f6(e);
        if (t()) {
          o(i) || (i = [i]);
          let t = i[0],
            r = [],
            s = [];
          if (t) {
            for (let i of e.fields) r.push(i.name), s.push(t[i.key]);
            this._f2.setOption({
              xAxis: {
                data: r
              },
              series: [{
                data: s,
                type: "bar"
              }]
            })
          }
        }
      }
    }
  })
})), s.d("6o/chart/funnel/5r", ["5u", "../../../6c/83", "../../../6c/echarts"], (t => {
  let e = t("5u"),
    r = t("../../../6c/83"),
    i = t("../../../6c/echarts"),
    {
      node: s,
      View: d,
      mark: l,
      isArray: o
    } = e;
  return d.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           error: i
         }, s, d) {
      let l, o;
      return o =
        `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);`,
      t.background && (o += `background:${t.background};`), o += r(t.animations), l = [s(
        "div", {
          class: "rd-cG rd-d7 rd-ed",
          "data-tip": i || "\u6b63\u5728\u52a0\u8f7d\u56fe\u8868\u7ec4\u4ef6...",
          id: "_rd_chart_" + d,
          style: o
        })], s(d, 0, l)
    },
    assign(t) {
      this.set(t)
    },
    _f3() {
      if (!this._f2) {
        let t = s("_rd_chart_" + this.id);
        this._f2 = echarts.init(t), this.on("destroy", (() => {
          this._f2.dispose()
        })), this._f2.setOption({
          series: [{
            type: "funnel",
            min: 0,
            max: 100,
            minSize: "0%",
            maxSize: "100%",
            gap: 2,
            label: {
              show: !0,
              position: "inside"
            },
            data: [{
              value: 100,
              name: "\u8bf7\u7ed1\u5b9a\u6570\u636e"
            }]
          }]
        }, !0), t.dataset.tip = ""
      }
      this._f2.resize()
    },
    async render() {
      let t = l(this, "_bF");
      await this.digest();
      try {
        if (await i(), t()) {
          let t = this.get("props");
          this._f3(), this._f2.setOption({
            title: {
              text: t.title,
              x: t.titleAlign
            },
            color: t.colors
          });
          let e = this._f4,
            r = JSON.stringify(t.bind);
          e != r && (this._f4 = r, this._f5(t))
        }
      } catch (e) {
        t() && this.digest({
          error: e
        })
      }
    },
    async _f5(t) {
      let {
        bind: e,
        showProgress: i,
        roundCap: s,
        color: d
      } = t, a = this._f2, {
        series: n
      } = this._f2.getOption();
      if (e.id) {
        let t = l(this, "_f5"),
          {
            _eE: i
          } = await r._f6(e);
        if (t()) {
          o(i) || (i = [i]);
          let t = [],
            r = i[0];
          if (r) {
            for (let i of e.fields) t.push({
              value: r[i.key],
              name: i.name
            });
            n[0].data = t, a.setOption({
              series: n
            })
          }
        }
      } else n[0].data = [{
        value: 100,
        name: "\u8bf7\u7ed1\u5b9a\u6570\u636e"
      }], a.setOption({
        series: n
      })
    }
  })
})), s.d("6o/chart/chartjs/5r", ["5u", "../../../6c/chart", "../../../6c/70"], (t => {
  let e = t("5u"),
    r = t("../../../6c/chart"),
    i = t("../../../6c/70"),
    {
      node: s,
      View: d,
      mark: l,
      isArray: o,
      mix: a
    } = e;
  return d.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           error: i
         }, s, d) {
      let l, o, a;
      return a = [s("canvas", {
        id: "_rd_chart_c_" + d
      })], o =
        `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);`,
      t.background && (o += `background:${t.background};`), o += r(t.animations), l = [s(
        "div", {
          class: "rd-cG rd-d7 rd-ed rd-dS",
          "data-tip": i || "\u6b63\u5728\u52a0\u8f7d\u56fe\u8868\u7ec4\u4ef6...",
          id: "_rd_chart_" + d,
          style: o
        }, a)], s(d, 0, l)
    },
    init() {
      this.on("destroy", (() => {
        this._f2 && this._f2.destroy()
      }))
    },
    assign(t) {
      this.set(t)
    },
    _f7(t) {
      if (this._f2) {
        let e = this._f2;
        a(e.config, t), e.update()
      } else {
        let e = s(`_rd_chart_${this.id}`),
          r = s(`_rd_chart_c_${this.id}`),
          i = new Chart(r, t);
        this._f2 = i, e.dataset.tip = ""
      }
    },
    async render() {
      let t = l(this, "_bF");
      await this.digest();
      try {
        await r();
        let e = this.get("props"),
          {
            bind: s,
            options: d
          } = e;
        if (t()) {
          let t = i._f8(d, s._data, s.fields),
            e = JSON.stringify(t);
          this._f9 != e && (this._f9 = e, this._f7(t))
        }
      } catch (e) {
        t() && (this._f2 && (this._f2.destroy(), this._f2 = null), this.digest({
          error: e
        }))
      }
    }
  })
})), s.d("6o/chart/echart/5r", ["5u", "../../../6c/echarts", "../../../6c/70"], (t => {
  let e = t("5u"),
    r = t("../../../6c/echarts"),
    i = t("../../../6c/70"),
    {
      node: s,
      View: d,
      mark: l,
      isArray: o
    } = e;
  return d.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           error: i
         }, s, d) {
      let l, o;
      return o =
        `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);`,
      t.background && (o += `background:${t.background};`), o += r(t.animations), l = [s(
        "div", {
          class: "rd-cG rd-d7 rd-ed",
          "data-tip": i || "\u6b63\u5728\u52a0\u8f7d\u56fe\u8868\u7ec4\u4ef6...",
          id: "_rd_chart_" + d,
          style: o
        })], s(d, 0, l)
    },
    assign(t) {
      this.set(t)
    },
    _f3() {
      if (!this._f2) {
        let t = s("_rd_chart_" + this.id);
        this._f2 = echarts.init(t), this.on("destroy", (() => {
          this._f2 && this._f2.dispose()
        })), t.dataset.tip = ""
      }
      this._f2.resize()
    },
    async render() {
      let t = l(this, "_bF");
      await this.digest();
      try {
        await r();
        let e = this.get("props"),
          {
            bind: s,
            options: d
          } = e;
        if (t()) {
          this._f3();
          let t = i._f8(d, s._data, s.fields);
          this._f2.setOption(t, !0)
        }
      } catch (e) {
        t() && (this._f2 && (this._f2.dispose(), this._f2 = null), this.digest({
          error: e
        }))
      }
    }
  })
})), s.d("6o/chart/meter2/5r", ["5u", "../../../6c/echarts", "../../../6c/70"], (t => {
  let e = t("5u"),
    r = t("../../../6c/echarts"),
    i = t("../../../6c/70"),
    {
      node: s,
      View: d,
      mark: l
    } = e;
  return d.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           error: i
         }, s, d) {
      let l, o;
      return o =
        `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);`,
      t.background && (o += `background:${t.background};`), o += r(t.animations), l = [s(
        "div", {
          class: "rd-cG rd-d7 rd-ed",
          "data-tip": i || "\u6b63\u5728\u52a0\u8f7d\u56fe\u8868\u7ec4\u4ef6...",
          id: "_rd_chart_" + d,
          style: o
        })], s(d, 0, l)
    },
    assign(t) {
      this.set(t)
    },
    _f3() {
      if (!this._f2) {
        let t = s("_rd_chart_" + this.id);
        this._f2 = echarts.init(t), this.on("destroy", (() => {
          this._f2 && this._f2.dispose()
        })), t.dataset.tip = ""
      }
      this._f2.resize()
    },
    async render() {
      let t = l(this, "_bF");
      await this.digest();
      try {
        await r();
        let e = this.get("props"),
          {
            bind: s,
            options: d
          } = e;
        if (t()) {
          this._f3();
          let t = i._f8(d, s._data, s.fields);
          this._f2.setOption(t, !0)
        }
      } catch (e) {
        t() && (this._f2 && (this._f2.dispose(), this._f2 = null), this.digest({
          error: e
        }))
      }
    }
  })
})), s.d("6o/chart/pie/5r", ["5u", "../../../6c/83", "../../../6c/echarts"], (t => {
  let e = t("5u"),
    r = t("../../../6c/83"),
    i = t("../../../6c/echarts"),
    {
      node: s,
      View: d,
      mark: l,
      isArray: o
    } = e;
  return d.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           error: i
         }, s, d) {
      let l, o;
      return o =
        `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);`,
      t.background && (o += `background:${t.background};`), o += r(t.animations), l = [s(
        "div", {
          class: "rd-cG rd-d7 rd-ed",
          "data-tip": i || "\u6b63\u5728\u52a0\u8f7d\u56fe\u8868\u7ec4\u4ef6...",
          id: "_rd_chart_" + d,
          style: o
        })], s(d, 0, l)
    },
    assign(t) {
      this.set(t)
    },
    _f3() {
      if (!this._f2) {
        let t = s("_rd_chart_" + this.id);
        this._f2 = echarts.init(t), this.on("destroy", (() => {
          this._f2.dispose()
        })), this._f2.setOption({
          series: [{
            data: [{
              value: 0,
              name: "\u8bf7\u7ed1\u5b9a\u6570\u636e"
            }],
            type: "pie"
          }]
        }, !0), t.dataset.tip = ""
      }
      this._f2.resize()
    },
    async render() {
      let t = l(this, "_bF");
      await this.digest();
      try {
        if (await i(), t()) {
          let t = this.get("props");
          this._f3(), this._f2.setOption({
            title: {
              text: t.title,
              x: t.titleAlign
            },
            color: t.colors
          });
          let e = this._f4,
            r = JSON.stringify(t.bind);
          e != r && (this._f4 = r, this._f5(t))
        }
      } catch (e) {
        t() && this.digest({
          error: e
        })
      }
    },
    async _f5(t) {
      let {
        bind: e
      } = t;
      if (e.id) {
        let t = l(this, "_f5"),
          {
            _eE: i
          } = await r._f6(e);
        if (t()) {
          o(i) || (i = [i]);
          let t = [],
            r = i[0];
          if (r) {
            for (let i of e.fields) t.push({
              value: r[i.key],
              name: i.name
            });
            this._f2.setOption({
              series: [{
                data: t,
                type: "pie"
              }]
            })
          }
        }
      }
    }
  })
})), s.d("6o/chart/meter/5r", ["5u", "../../../6c/83", "../../../6c/echarts"], (t => {
  let e = t("5u"),
    r = t("../../../6c/83"),
    i = t("../../../6c/echarts"),
    {
      node: s,
      View: d,
      mark: l,
      isArray: o
    } = e;
  return d.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           error: i
         }, s, d) {
      let l, o;
      return o =
        `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);`,
      t.background && (o += `background:${t.background};`), o += r(t.animations), l = [s(
        "div", {
          class: "rd-cG rd-d7 rd-ed",
          "data-tip": i || "\u6b63\u5728\u52a0\u8f7d\u56fe\u8868\u7ec4\u4ef6...",
          id: "_rd_chart_" + d,
          style: o
        })], s(d, 0, l)
    },
    assign(t) {
      this.set(t)
    },
    _f3() {
      if (!this._f2) {
        let t = s("_rd_chart_" + this.id);
        this._f2 = echarts.init(t), this.on("destroy", (() => {
          this._f2.dispose()
        })), this._f2.setOption({
          series: [{
            type: "gauge",
            detail: {
              formatter: "{value}%"
            },
            data: [{
              value: 0,
              name: "\u8bf7\u7ed1\u5b9a\u6570\u636e"
            }],
            itemStyle: {
              color: this.get("props").color
            }
          }]
        }, !0), t.dataset.tip = ""
      }
      this._f2.resize()
    },
    async render() {
      let t = l(this, "_bF");
      await this.digest();
      try {
        if (await i(), t()) {
          let t = this.get("props");
          this._f3();
          let {
            series: e
          } = this._f2.getOption();
          e[0].progress = {
            show: t.showProgress,
            roundCap: t.roundCap
          }, e[0].itemStyle = {
            color: t.color
          }, this._f2.setOption({
            series: e,
            title: {
              text: t.title,
              x: t.titleAlign
            }
          });
          let r = this._f4,
            i = JSON.stringify(t.bind);
          r != i && (this._f4 = i, this._f5(t))
        }
      } catch (e) {
        t() && this.digest({
          error: e
        })
      }
    },
    async _f5(t) {
      let {
        bind: e,
        showProgress: i,
        roundCap: s,
        color: d
      } = t, a = this._f2, {
        series: n
      } = this._f2.getOption();
      if (e.id) {
        let t = l(this, "_f5"),
          {
            _eE: h
          } = await r._f6(e);
        if (t()) {
          o(h) || (h = [h]);
          let t = [],
            r = h[0];
          if (r) {
            for (let i of e.fields) t.push({
              value: r[i.key],
              name: i.name
            });
            n[0].progress = {
              show: i,
              roundCap: s
            }, n[0].itemStyle = {
              color: d
            }, n[0].data = t, a.setOption({
              series: n
            })
          }
        }
      } else n[0].data = [{
        value: 0,
        name: "\u8bf7\u7ed1\u5b9a\u6570\u636e"
      }], a.setOption({
        series: n
      })
    }
  })
})), s.d("6o/chart/line/5r", ["5u", "../../../6c/83", "../../../6c/echarts"], (t => {
  let e = t("5u"),
    r = t("../../../6c/83"),
    i = t("../../../6c/echarts"),
    {
      node: s,
      View: d,
      mark: l,
      isArray: o
    } = e;
  return d.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           error: i
         }, s, d) {
      let l, o;
      return o =
        `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);`,
      t.background && (o += `background:${t.background};`), o += r(t.animations), l = [s(
        "div", {
          class: "rd-cG rd-d7 rd-ed",
          "data-tip": i || "\u6b63\u5728\u52a0\u8f7d\u56fe\u8868\u7ec4\u4ef6...",
          id: "_rd_chart_" + d,
          style: o
        })], s(d, 0, l)
    },
    assign(t) {
      this.set(t)
    },
    _f3() {
      if (!this._f2) {
        let t = s("_rd_chart_" + this.id);
        this._f2 = echarts.init(t), this.on("destroy", (() => {
          this._f2.dispose()
        })), this._f2.setOption({
          tooltip: {
            trigger: "axis"
          },
          xAxis: {
            data: [
              "\u8bf7\u5148\u7ed1\u5b9a\u6570\u636e\u548cX\u8f74\u7684\u6570\u636e"
            ]
          },
          yAxis: {
            type: "value"
          }
        }, !0), t.dataset.tip = ""
      }
      this._f2.resize()
    },
    async render() {
      let t = l(this, "_bF");
      await this.digest();
      try {
        if (await i(), t()) {
          let t = this.get("props");
          this._f3(), this._f2.setOption({
            title: {
              text: t.title,
              x: t.titleAlign
            },
            color: t.colors
          });
          let e = this._f4,
            r = JSON.stringify(t.bind) + JSON.stringify(t.xBind);
          e != r && (this._f4 = r, this._f5(t))
        }
      } catch (e) {
        t() && this.digest({
          error: e
        })
      }
    },
    async _f5(t) {
      let e = this._f2,
        {
          bind: i,
          xBind: s
        } = t;
      if (i.id && s.id) {
        let t = l(this, "_f5"),
          {
            _eE: d
          } = await r._f6(i);
        if (t()) {
          o(d) || (d = [d]);
          let t = [],
            r = [];
          for (let e of d) {
            for (let r of s.fields) t.push(e[r.key]);
            let d = 0;
            for (let t of i.fields) {
              let i = r[d];
              i || (r[d] = i = {
                data: [],
                type: "line"
              }), i.data.push(e[t.key]), d++
            }
          }
          e.setOption({
            xAxis: {
              data: t
            },
            series: r
          })
        }
      } else e.setOption({
        xAxis: {
          data: [
            "\u8bf7\u5148\u7ed1\u5b9a\u6570\u636e\u548cX\u8f74\u7684\u6570\u636e"
          ]
        },
        series: [{
          data: [],
          type: "line"
        }]
      })
    }
  })
})), s.d("6o/chart/radar/5r", ["5u", "../../../6c/83", "../../../6c/echarts", "../../../6c/70"], (t => {
  let e = t("5u"),
    r = t("../../../6c/83"),
    i = t("../../../6c/echarts"),
    s = t("../../../6c/70"),
    {
      node: d,
      View: l,
      mark: o
    } = e;
  return l.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           error: i
         }, s, d) {
      let l, o;
      return o =
        `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);`,
      t.background && (o += `background:${t.background};`), o += r(t.animations), l = [s(
        "div", {
          class: "rd-cG rd-d7 rd-ed",
          "data-tip": i || "\u6b63\u5728\u52a0\u8f7d\u56fe\u8868\u7ec4\u4ef6...",
          id: "_rd_chart_" + d,
          style: o
        })], s(d, 0, l)
    },
    assign(t) {
      this.set(t)
    },
    _f3() {
      if (!this._f2) {
        let t = d("_rd_chart_" + this.id);
        this._f2 = echarts.init(t), this.on("destroy", (() => {
          this._f2 && this._f2.dispose()
        })), t.dataset.tip = ""
      }
      this._f2.resize()
    },
    async render() {
      let t = o(this, "_bF");
      await this.digest();
      try {
        await i();
        let e, d = this.get("props"),
          {
            bind: l,
            options: o
          } = d;
        if (l.id) {
          let {
            _eE: t
          } = await r._f6(l);
          e = t
        }
        if (t()) {
          this._f3();
          let t = s._f8(o, e, l.fields);
          this._f2.setOption(t, !0)
        }
      } catch (e) {
        t() && (this._f2 && (this._f2.dispose(), this._f2 = null), this.digest({
          error: e
        }))
      }
    }
  })
})), s.d("6o/chart/scatter/5r", ["5u", "../../../6c/83", "../../../6c/echarts", "../../../6c/70"], (t => {
  let e = t("5u"),
    r = t("../../../6c/83"),
    i = t("../../../6c/echarts"),
    s = t("../../../6c/70"),
    {
      node: d,
      View: l,
      mark: o
    } = e;
  return l.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           error: i
         }, s, d) {
      let l, o;
      return o =
        `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);`,
      t.background && (o += `background:${t.background};`), o += r(t.animations), l = [s(
        "div", {
          class: "rd-cG rd-d7 rd-ed",
          "data-tip": i || "\u6b63\u5728\u52a0\u8f7d\u56fe\u8868\u7ec4\u4ef6...",
          id: "_rd_chart_" + d,
          style: o
        })], s(d, 0, l)
    },
    assign(t) {
      this.set(t)
    },
    _f3() {
      if (!this._f2) {
        let t = d("_rd_chart_" + this.id);
        this._f2 = echarts.init(t), this.on("destroy", (() => {
          this._f2 && this._f2.dispose()
        })), t.dataset.tip = ""
      }
      this._f2.resize()
    },
    async render() {
      let t = o(this, "_bF");
      await this.digest();
      try {
        await i();
        let e, d = this.get("props"),
          {
            bind: l,
            options: o
          } = d;
        if (l.id) {
          let {
            _eE: t
          } = await r._f6(l);
          e = t
        }
        if (t()) {
          this._f3();
          let t = s._f8(o, e, l.fields);
          this._f2.setOption(t, !0)
        }
      } catch (e) {
        t() && (this._f2 && (this._f2.dispose(), this._f2 = null), this.digest({
          error: e
        }))
      }
    }
  })
})), s.d("6o/flow/card/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           ox: i,
           oy: s,
           enHTML: d
         }, l, o) {
      let a, n, h, c, p, u = t.alpha,
        f = t.x,
        g = t.y,
        b = t.width,
        $ = t.height,
        m = t.fillColor,
        y = t.cap,
        x = t.rotate,
        _ = t.color,
        w = t.linewidth,
        k = t.dash,
        v = t.textX,
        L = t.textY,
        F = t.textWidth,
        S = t.textHeight,
        C = t.padding,
        H = t.textFontsize,
        M = t.textForecolor,
        G = t.textBackground,
        T = t.textLetterspacing,
        A = t.textFontfamily,
        z = t.text,
        P = r(b),
        j = r($);
      return p = [l("path", {
        d: `M0 ${j/4}L0 ${j}L${P} ${j}L${P} 0L${P/4} 0z`,
        style: `fill:${m||"none"};stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e,
        "stroke-linecap": y && "round"
      }, 1)], h = [l(0, d(z), 1)], n =
        `padding:${C}${e};font-size:${H}${e};width:${F}${e};color:${M};`, G && (n +=
        `background:${G};`), n += `letter-spacing:${T}${e};font-family:` + A, c = [l(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: n
        }, h)], p.push(l("foreignObject", {
        x: v - f + i + e,
        y: L - g + s + e,
        width: F + e,
        height: S + e
      }, c)), a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${u};left:${f}${e};top:${g}${e};width:${b}${e};height:${$}${e};transform:rotate(${x}deg)`
      }, p)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/annotation/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           ox: i,
           oy: s,
           enHTML: d
         }, l, o) {
      let a, n, h, c, p, u = t.alpha,
        f = t.x,
        g = t.y,
        b = t.width,
        $ = t.height,
        m = t.fillColor,
        y = t.cap,
        x = t.rotate,
        _ = t.color,
        w = t.linewidth,
        k = t.dash,
        v = t.textX,
        L = t.textY,
        F = t.textWidth,
        S = t.textHeight,
        C = t.padding,
        H = t.textFontsize,
        M = t.textForecolor,
        G = t.textBackground,
        T = t.textLetterspacing,
        A = t.textFontfamily,
        z = t.text,
        P = r($);
      return p = [l("path", {
        d: `M20 0L0 0L0 ${P}L20 ` + P,
        style: `fill:none;stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e,
        "stroke-linecap": y && "round"
      }, 1)], h = [l(0, d(z), 1)], n =
        `padding:${C}${e};font-size:${H}${e};width:${F}${e};color:${M};`, G && (n +=
        `background:${G};`), n += `letter-spacing:${T}${e};font-family:` + A, c = [l(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: n
        }, h)], p.push(l("foreignObject", {
        x: v - f + i + e,
        y: L - g + s + e,
        width: F + e,
        height: S + e
      }, c)), n =
        `opacity:${u};left:${f}${e};top:${g}${e};width:${b}${e};height:${$}${e};transform:rotate(${x}deg)`,
      m && (n += ";background:" + m), a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: n
      }, p)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/data/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           ox: i,
           oy: s,
           enHTML: d
         }, l, o) {
      let a, n, h, c, p, u = t.alpha,
        f = t.x,
        g = t.y,
        b = t.width,
        $ = t.height,
        m = t.fillColor,
        y = t.cap,
        x = t.rotate,
        _ = t.color,
        w = t.linewidth,
        k = t.dash,
        v = t.textX,
        L = t.textY,
        F = t.textWidth,
        S = t.textHeight,
        C = t.padding,
        H = t.textFontsize,
        M = t.textForecolor,
        G = t.textBackground,
        T = t.textLetterspacing,
        A = t.textFontfamily,
        z = t.text,
        P = r(b),
        j = r($);
      return p = [l("path", {
        d: `M40 0L0 ${j}L${P-40} ${j}L${P} 0z`,
        style: `fill:${m||"none"};stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e,
        "stroke-linecap": y && "round"
      }, 1)], h = [l(0, d(z), 1)], n =
        `padding:${C}${e};font-size:${H}${e};width:${F}${e};color:${M};`, G && (n +=
        `background:${G};`), n += `letter-spacing:${T}${e};font-family:` + A, c = [l(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: n
        }, h)], p.push(l("foreignObject", {
        x: v - f + i + e,
        y: L - g + s + e,
        width: F + e,
        height: S + e
      }, c)), a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${u};left:${f}${e};top:${g}${e};width:${b}${e};height:${$}${e};transform:rotate(${x}deg)`
      }, p)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/connector/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    i = "0 0 8 6",
    s = "auto",
    d = "path",
    l = "marker",
    o = "M4 1L7 3L4 5L1 3z",
    a = "0 0 6 6",
    n = "circle",
    h = "0 0 6 8",
    {
      State: c,
      View: p
    } = e;
  return p.extend({
    tmpl({
           toUnit: t,
           props: e,
           unit: r,
           mmax: c,
           toNormalScale: p,
           toPx: u,
           ox: f,
           oy: g,
           enHTML: b
         }, $, m) {
      let y, x, _, w, k, v, L = t(1),
        F = e.x,
        S = e.y,
        C = e.width,
        H = e.height,
        M = e.alpha,
        G = e.lineType,
        T = e.endArrow,
        A = e.color,
        z = e.startArrow,
        P = e.startX,
        j = e.startY,
        I = e.endX,
        B = e.endY,
        D = e.ctrl1X,
        N = e.ctrl1Y,
        R = e.ctrl2X,
        W = e.ctrl2Y,
        O = e.linewidth,
        Y = e.dash,
        E = e.cap,
        V = e.textRotate,
        U = e.textPointX,
        K = e.textOffsetX,
        J = e.textPointY,
        X = e.textOffsetY,
        q = e.textX,
        Z = e.textY,
        Q = e.textWidth,
        tt = e.textHeight,
        et = e.points,
        rt = e.textFontsize,
        it = e.textForecolor,
        st = e.textBackground,
        dt = e.textLetterspacing,
        lt = e.textFontfamily,
        ot = e.text;
      if (_ = [], 2 == T ? (x = [$(d, {
        d: "M2 1L8 3L2 5z",
        style: "fill:" + A
      }, 1)], _.push($(l, {
        id: "a_" + m,
        viewBox: i,
        refX: 7,
        refY: 3,
        orient: s,
        markerWidth: 8,
        markerHeight: 6
      }, x))) : 3 == T ? (x = [$(d, {
        d: "M2 1L7 3L2 5z",
        style: "fill:#fff;stroke:" + A
      }, 1)], _.push($(l, {
        id: "a_" + m,
        viewBox: i,
        refX: 7,
        refY: 3,
        orient: s,
        markerWidth: 8,
        markerHeight: 6
      }, x))) : 4 == T ? (x = [$(d, {
        d: "M2 1L8 3L2 5",
        style: "fill:none;stroke:" + A
      }, 1)], _.push($(l, {
        id: "a_" + m,
        viewBox: i,
        refX: 7,
        refY: 3,
        orient: s,
        markerWidth: 8,
        markerHeight: 6
      }, x))) : 5 == T ? (x = [$(d, {
        d: o,
        style: "fill:" + A
      }, 1)], _.push($(l, {
        id: "a_" + m,
        viewBox: i,
        refX: 7,
        refY: 3,
        orient: s,
        markerWidth: 8,
        markerHeight: 6
      }, x))) : 6 == T ? (x = [$(d, {
        d: o,
        style: "fill:#fff;stroke:" + A
      }, 1)], _.push($(l, {
        id: "a_" + m,
        viewBox: i,
        refX: 8,
        refY: 3,
        orient: s,
        markerWidth: 8,
        markerHeight: 6
      }, x))) : 7 == T ? (x = [$(n, {
        cx: 3,
        cy: 3,
        r: 2,
        style: "fill:" + A
      }, 1)], _.push($(l, {
        id: "a_" + m,
        viewBox: a,
        refX: 5,
        refY: 3,
        orient: s,
        markerWidth: 6,
        markerHeight: 6
      }, x))) : 8 == T ? (x = [$(n, {
        cx: 3,
        cy: 3,
        r: 2,
        style: "fill:#fff;stroke:" + A
      }, 1)], _.push($(l, {
        id: "a_" + m,
        viewBox: a,
        refX: 6,
        refY: 3,
        orient: s,
        markerWidth: 6,
        markerHeight: 6
      }, x))) : 9 == T && (x = [$(d, {
        d: "M2 4L6 1M2 4L6 7",
        style: "fill:none;stroke:" + A
      }, 1)], _.push($(l, {
        id: "a_" + m,
        viewBox: h,
        refX: 6,
        refY: 4,
        orient: s,
        markerWidth: 6,
        markerHeight: 8
      }, x))), 2 == z ? (x = [$(d, {
        d: "M6 1L0 3L6 5z",
        style: "fill:" + A
      }, 1)], _.push($(l, {
        id: "as_" + m,
        viewBox: i,
        refX: 1,
        refY: 3,
        markerWidth: 8,
        markerHeight: 6,
        orient: s
      }, x))) : 3 == z ? (x = [$(d, {
        d: "M6 1L1 3L6 5z",
        style: "fill:#fff;stroke:" + A
      }, 1)], _.push($(l, {
        id: "as_" + m,
        viewBox: i,
        refX: 1,
        refY: 3,
        markerWidth: 8,
        markerHeight: 6,
        orient: s
      }, x))) : 4 == z ? (x = [$(d, {
        d: "M6 1L0 3L6 5",
        style: "fill:none;stroke:" + A
      }, 1)], _.push($(l, {
        id: "as_" + m,
        viewBox: i,
        refX: 1,
        refY: 3,
        orient: s,
        markerWidth: 8,
        markerHeight: 6
      }, x))) : 5 == z ? (x = [$(d, {
        d: o,
        style: "fill:" + A
      }, 1)], _.push($(l, {
        id: "as_" + m,
        viewBox: i,
        refX: 1,
        refY: 3,
        orient: s,
        markerWidth: 8,
        markerHeight: 6
      }, x))) : 6 == z ? (x = [$(d, {
        d: o,
        style: "fill:#fff;stroke:" + A
      }, 1)], _.push($(l, {
        id: "as_" + m,
        viewBox: i,
        refX: 0,
        refY: 3,
        orient: s,
        markerWidth: 8,
        markerHeight: 6
      }, x))) : 7 == z ? (x = [$(n, {
        cx: 3,
        cy: 3,
        r: 2,
        style: "fill:" + A
      }, 1)], _.push($(l, {
        id: "as_" + m,
        viewBox: a,
        refX: 1,
        refY: 3,
        orient: s,
        markerWidth: 6,
        markerHeight: 6
      }, x))) : 8 == z ? (x = [$(n, {
        cx: 3,
        cy: 3,
        r: 2,
        style: "fill:#fff;stroke:" + A
      }, 1)], _.push($(l, {
        id: "as_" + m,
        viewBox: a,
        refX: 0,
        refY: 3,
        orient: s,
        markerWidth: 6,
        markerHeight: 6
      }, x))) : 9 == z && (x = [$(d, {
        d: "M4 4L0 1M4 4L0 7",
        style: "fill:none;stroke:" + A
      }, 1)], _.push($(l, {
        id: "as_" + m,
        viewBox: h,
        refX: 0,
        refY: 4,
        orient: s,
        markerWidth: 6,
        markerHeight: 8
      }, x))), v = [$("defs", 0, _)], w = `M${u(P-F+f)} ` + u(j - S + g), "line" == G) w +=
        "L";
      else if ("bezier" == G) w += `C${u(D-F+f)} ${u(N-S+g)} ${u(R-F+f)} ${u(W-S+g)} `;
      else {
        for (let t = 0, e = et.length; t < e; t += 1) {
          let e = et[t];
          w += `L${u(e.x-F+f)} ` + u(e.y - S + g)
        }
        w += "L"
      }
      return w += u(I - F + f) + " " + u(B - S + g), v.push($(d, {
        style: `fill:none;stroke:${A};stroke-width:` + O + r,
        "stroke-dasharray": Y + r,
        "stroke-linecap": E && "round",
        "marker-start": 1 != z && `url(#as_${m})`,
        "marker-end": 1 != T && `url(#a_${m})`,
        d: w
      }, 1)), x = [$(0, b(ot), 1)], k =
        `line-height:${tt}${r};font-size:${rt}${r};width:${Q}${r};height:${tt}${r};color:${it};`,
      st && (k += `background:${st};`), k += `letter-spacing:${dt}${r};font-family:` + lt,
        _ = [$("div", {
          class: "rd-cE",
          style: k
        }, x)], v.push($("foreignObject", {
        transform: `rotate(${V},${u(U-F+K+f)},${u(J-S+X+g)})`,
        x: q - F + K + f + r,
        y: Z - S + X + g + r,
        width: Q + r,
        height: tt + r
      }, _)), y = [$("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${F}${r};top:${S}${r};width:${c(p(C),L)}${r};height:${c(p(H),L)}${r};opacity:` +
          M
      }, v)], $(m, 0, y)
    },
    init() {
      this.set({
        toUnit: r.bF,
        toNormalScale: r.bK,
        toPx: r.bU,
        ox: c.get("bZ") || 0,
        oy: c.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/database/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           ox: i,
           oy: s,
           enHTML: d
         }, l, o) {
      let a, n, h, c, p, u = t.alpha,
        f = t.x,
        g = t.y,
        b = t.width,
        $ = t.height,
        m = t.fillColor,
        y = t.cap,
        x = t.rotate,
        _ = t.color,
        w = t.linewidth,
        k = t.dash,
        v = t.textX,
        L = t.textY,
        F = t.textWidth,
        S = t.textHeight,
        C = t.padding,
        H = t.textFontsize,
        M = t.textForecolor,
        G = t.textBackground,
        T = t.textLetterspacing,
        A = t.textFontfamily,
        z = t.text,
        P = r(b),
        j = r($);
      return p = [l("path", {
        d: `M${P/8} 0L${P/8*7} 0A${P/8} ${j/2} 0 0 1 ${P/8*7} ${j}L${P/8} ${j}A${P/8} ${j/2} 0 0 1 ${P/8} 0M${P/8*7} ${j}A${P/8} ${j/2} 0 0 1 ${P/8*7} 0`,
        style: `fill:${m||"none"};stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e,
        "stroke-linecap": y && "round"
      }, 1)], h = [l(0, d(z), 1)], n =
        `padding:${C}${e};font-size:${H}${e};width:${F}${e};color:${M};`, G && (n +=
        `background:${G};`), n += `letter-spacing:${T}${e};font-family:` + A, c = [l(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: n
        }, h)], p.push(l("foreignObject", {
        x: v - f + i + e,
        y: L - g + s + e,
        width: F + e,
        height: S + e
      }, c)), a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${u};left:${f}${e};top:${g}${e};width:${b}${e};height:${$}${e};transform:rotate(${x}deg)`
      }, p)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/decision/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           ox: i,
           oy: s,
           enHTML: d
         }, l, o) {
      let a, n, h, c, p, u = t.alpha,
        f = t.x,
        g = t.y,
        b = t.width,
        $ = t.height,
        m = t.fillColor,
        y = t.cap,
        x = t.rotate,
        _ = t.color,
        w = t.linewidth,
        k = t.dash,
        v = t.textX,
        L = t.textY,
        F = t.textWidth,
        S = t.textHeight,
        C = t.padding,
        H = t.textFontsize,
        M = t.textForecolor,
        G = t.textBackground,
        T = t.textLetterspacing,
        A = t.textFontfamily,
        z = t.text,
        P = r(b),
        j = r($);
      return p = [l("path", {
        d: `M${P/2} 0L0 ${j/2}L${P/2} ${j}L${P} ${j/2}z`,
        style: `fill:${m||"none"};stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e,
        "stroke-linecap": y && "round"
      }, 1)], h = [l(0, d(z), 1)], n =
        `padding:${C}${e};font-size:${H}${e};width:${F}${e};color:${M};`, G && (n +=
        `background:${G};`), n += `letter-spacing:${T}${e};font-family:` + A, c = [l(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: n
        }, h)], p.push(l("foreignObject", {
        x: v - f + i + e,
        y: L - g + s + e,
        width: F + e,
        height: S + e
      }, c)), a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${u};left:${f}${e};top:${g}${e};width:${b}${e};height:${$}${e};transform:rotate(${x}deg)`
      }, p)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/display/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           ox: i,
           oy: s,
           enHTML: d
         }, l, o) {
      let a, n, h, c, p, u = t.alpha,
        f = t.x,
        g = t.y,
        b = t.width,
        $ = t.height,
        m = t.fillColor,
        y = t.cap,
        x = t.rotate,
        _ = t.color,
        w = t.linewidth,
        k = t.dash,
        v = t.textX,
        L = t.textY,
        F = t.textWidth,
        S = t.textHeight,
        C = t.padding,
        H = t.textFontsize,
        M = t.textForecolor,
        G = t.textBackground,
        T = t.textLetterspacing,
        A = t.textFontfamily,
        z = t.text,
        P = r(b),
        j = r($);
      return p = [l("path", {
        d: `M${P/8} 0L${P/8*7} 0A${P/8} ${j/2} 0 0 1 ${P/8*7} ${j}L${P/8} ${j}L0 ${j/2}z`,
        style: `fill:${m||"none"};stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e,
        "stroke-linecap": y && "round"
      }, 1)], h = [l(0, d(z), 1)], n =
        `padding:${C}${e};font-size:${H}${e};width:${F}${e};color:${M};`, G && (n +=
        `background:${G};`), n += `letter-spacing:${T}${e};font-family:` + A, c = [l(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: n
        }, h)], p.push(l("foreignObject", {
        x: v - f + i + e,
        y: L - g + s + e,
        width: F + e,
        height: S + e
      }, c)), a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${u};left:${f}${e};top:${g}${e};width:${b}${e};height:${$}${e};transform:rotate(${x}deg)`
      }, p)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/document/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           ox: i,
           oy: s,
           enHTML: d
         }, l, o) {
      let a, n, h, c, p, u = t.alpha,
        f = t.x,
        g = t.y,
        b = t.width,
        $ = t.height,
        m = t.fillColor,
        y = t.cap,
        x = t.rotate,
        _ = t.color,
        w = t.linewidth,
        k = t.dash,
        v = t.textX,
        L = t.textY,
        F = t.textWidth,
        S = t.textHeight,
        C = t.padding,
        H = t.textFontsize,
        M = t.textForecolor,
        G = t.textBackground,
        T = t.textLetterspacing,
        A = t.textFontfamily,
        z = t.text,
        P = r(b),
        j = r($);
      return p = [l("path", {
        d: `M0 0L0 ${j}C${P/4} ${1.5*j} ${.75*P} ${j/2} ${P} ${j}L${P} 0z`,
        style: `fill:${m||"none"};stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e,
        "stroke-linecap": y && "round"
      }, 1)], h = [l(0, d(z), 1)], n =
        `padding:${C}${e};font-size:${H}${e};width:${F}${e};color:${M};`, G && (n +=
        `background:${G};`), n += `letter-spacing:${T}${e};font-family:` + A, c = [l(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: n
        }, h)], p.push(l("foreignObject", {
        x: v - f + i + e,
        y: L - g + s + e,
        width: F + e,
        height: S + e
      }, c)), a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${u};left:${f}${e};top:${g}${e};width:${b}${e};height:${$}${e};transform:rotate(${x}deg)`
      }, p)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/estore/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           ox: i,
           oy: s,
           enHTML: d
         }, l, o) {
      let a, n, h, c, p, u = t.alpha,
        f = t.x,
        g = t.y,
        b = t.width,
        $ = t.height,
        m = t.fillColor,
        y = t.cap,
        x = t.rotate,
        _ = t.color,
        w = t.linewidth,
        k = t.dash,
        v = t.textX,
        L = t.textY,
        F = t.textWidth,
        S = t.textHeight,
        C = t.padding,
        H = t.textFontsize,
        M = t.textForecolor,
        G = t.textBackground,
        T = t.textLetterspacing,
        A = t.textFontfamily,
        z = t.text,
        P = r(b),
        j = r($);
      return p = [l("path", {
        d: `M${P/8} 0L${P} 0A${P/8} ${j/2} 0 0 0 ${P} ${j}L${P/8} ${j}A${P/8} ${j/2} 0 0 1 ${P/8} 0`,
        style: `fill:${m||"none"};stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e,
        "stroke-linecap": y && "round"
      }, 1)], h = [l(0, d(z), 1)], n =
        `padding:${C}${e};font-size:${H}${e};width:${F}${e};color:${M};`, G && (n +=
        `background:${G};`), n += `letter-spacing:${T}${e};font-family:` + A, c = [l(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: n
        }, h)], p.push(l("foreignObject", {
        x: v - f + i + e,
        y: L - g + s + e,
        width: F + e,
        height: S + e
      }, c)), a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${u};left:${f}${e};top:${g}${e};width:${b}${e};height:${$}${e};transform:rotate(${x}deg)`
      }, p)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/istore/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           ox: i,
           oy: s,
           enHTML: d
         }, l, o) {
      let a, n, h, c, p, u = t.alpha,
        f = t.x,
        g = t.y,
        b = t.width,
        $ = t.height,
        m = t.fillColor,
        y = t.cap,
        x = t.rotate,
        _ = t.color,
        w = t.linewidth,
        k = t.dash,
        v = t.textX,
        L = t.textY,
        F = t.textWidth,
        S = t.textHeight,
        C = t.padding,
        H = t.textFontsize,
        M = t.textForecolor,
        G = t.textBackground,
        T = t.textLetterspacing,
        A = t.textFontfamily,
        z = t.text,
        P = (r(b), r($));
      return p = [l("path", {
        d: `M0 0L0 ${P}L${P} ${P}L${P} 0ZM${.1*P} 0L${.1*P} ${P}M0 ${.1*P}L${P} ` +
          .1 * P,
        style: `fill:${m||"none"};stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e,
        "stroke-linecap": y && "round"
      }, 1)], h = [l(0, d(z), 1)], n =
        `padding:${C}${e};font-size:${H}${e};width:${F}${e};color:${M};`, G && (n +=
        `background:${G};`), n += `letter-spacing:${T}${e};font-family:` + A, c = [l(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: n
        }, h)], p.push(l("foreignObject", {
        x: v - f + i + e,
        y: L - g + s + e,
        width: F + e,
        height: S + e
      }, c)), a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${u};left:${f}${e};top:${g}${e};width:${b}${e};height:${$}${e};transform:rotate(${x}deg)`
      }, p)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/moperation/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           ox: i,
           oy: s,
           enHTML: d
         }, l, o) {
      let a, n, h, c, p, u = t.alpha,
        f = t.x,
        g = t.y,
        b = t.width,
        $ = t.height,
        m = t.fillColor,
        y = t.cap,
        x = t.rotate,
        _ = t.color,
        w = t.linewidth,
        k = t.dash,
        v = t.textX,
        L = t.textY,
        F = t.textWidth,
        S = t.textHeight,
        C = t.padding,
        H = t.textFontsize,
        M = t.textForecolor,
        G = t.textBackground,
        T = t.textLetterspacing,
        A = t.textFontfamily,
        z = t.text,
        P = r(b),
        j = r($);
      return p = [l("path", {
        d: `M0 0L${.1*P} ${j}L${.9*P} ${j}L${P} 0z`,
        style: `fill:${m||"none"};stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e,
        "stroke-linecap": y && "round"
      }, 1)], h = [l(0, d(z), 1)], n =
        `padding:${C}${e};font-size:${H}${e};width:${F}${e};color:${M};`, G && (n +=
        `background:${G};`), n += `letter-spacing:${T}${e};font-family:` + A, c = [l(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: n
        }, h)], p.push(l("foreignObject", {
        x: v - f + i + e,
        y: L - g + s + e,
        width: F + e,
        height: S + e
      }, c)), a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${u};left:${f}${e};top:${g}${e};width:${b}${e};height:${$}${e};transform:rotate(${x}deg)`
      }, p)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/pageref/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           ox: i,
           oy: s,
           enHTML: d
         }, l, o) {
      let a, n, h, c, p, u = t.alpha,
        f = t.x,
        g = t.y,
        b = t.width,
        $ = t.height,
        m = t.fillColor,
        y = t.cap,
        x = t.rotate,
        _ = t.color,
        w = t.linewidth,
        k = t.dash,
        v = t.textX,
        L = t.textY,
        F = t.textWidth,
        S = t.textHeight,
        C = t.padding,
        H = t.textFontsize,
        M = t.textForecolor,
        G = t.textBackground,
        T = t.textLetterspacing,
        A = t.textFontfamily,
        z = t.text,
        P = r(b),
        j = r($);
      return p = [l("path", {
        d: `M0 0L0 ${.75*j}L${P/2} ${j}L${P} ${.75*j}L${P} 0z`,
        style: `fill:${m||"none"};stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e,
        "stroke-linecap": y && "round"
      }, 1)], h = [l(0, d(z), 1)], n =
        `padding:${C}${e};font-size:${H}${e};width:${F}${e};color:${M};`, G && (n +=
        `background:${G};`), n += `letter-spacing:${T}${e};font-family:` + A, c = [l(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: n
        }, h)], p.push(l("foreignObject", {
        x: v - f + i + e,
        y: L - g + s + e,
        width: F + e,
        height: S + e
      }, c)), a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${u};left:${f}${e};top:${g}${e};width:${b}${e};height:${$}${e};transform:rotate(${x}deg)`
      }, p)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/looplimit/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           mmin: i,
           ox: s,
           oy: d,
           enHTML: l
         }, o, a) {
      let n, h, c, p, u, f = t.alpha,
        g = t.x,
        b = t.y,
        $ = t.width,
        m = t.height,
        y = t.fillColor,
        x = t.cap,
        _ = t.rotate,
        w = t.color,
        k = t.linewidth,
        v = t.dash,
        L = t.textX,
        F = t.textY,
        S = t.textWidth,
        C = t.textHeight,
        H = t.padding,
        M = t.textFontsize,
        G = t.textForecolor,
        T = t.textBackground,
        A = t.textLetterspacing,
        z = t.textFontfamily,
        P = t.text,
        j = r($),
        I = r(m),
        B = i(j, I);
      return u = [o("path", {
        d: `M${B/4} 0L0 ${B/4}L0 ${I}L${j} ${I}L${j} ${B/4}L${j-B/4} 0z`,
        style: `fill:${y||"none"};stroke:${w};stroke-width:` + k + e,
        "stroke-dasharray": v + e,
        "stroke-linecap": x && "round"
      }, 1)], c = [o(0, l(P), 1)], h =
        `padding:${H}${e};font-size:${M}${e};width:${S}${e};color:${G};`, T && (h +=
        `background:${T};`), h += `letter-spacing:${A}${e};font-family:` + z, p = [o(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: h
        }, c)], u.push(o("foreignObject", {
        x: L - g + s + e,
        y: F - b + d + e,
        width: S + e,
        height: C + e
      }, p)), n = [o("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${f};left:${g}${e};top:${b}${e};width:${$}${e};height:${m}${e};transform:rotate(${_}deg)`
      }, u)], o(a, 0, n)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/manual/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           ox: i,
           oy: s,
           enHTML: d
         }, l, o) {
      let a, n, h, c, p, u = t.alpha,
        f = t.x,
        g = t.y,
        b = t.width,
        $ = t.height,
        m = t.fillColor,
        y = t.cap,
        x = t.rotate,
        _ = t.color,
        w = t.linewidth,
        k = t.dash,
        v = t.textX,
        L = t.textY,
        F = t.textWidth,
        S = t.textHeight,
        C = t.padding,
        H = t.textFontsize,
        M = t.textForecolor,
        G = t.textBackground,
        T = t.textLetterspacing,
        A = t.textFontfamily,
        z = t.text,
        P = r(b),
        j = r($);
      return p = [l("path", {
        d: `M0 ${j/4}L0 ${j}L${P} ${j}L${P} 0z`,
        style: `fill:${m||"none"};stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e,
        "stroke-linecap": y && "round"
      }, 1)], h = [l(0, d(z), 1)], n =
        `padding:${C}${e};font-size:${H}${e};width:${F}${e};color:${M};`, G && (n +=
        `background:${G};`), n += `letter-spacing:${T}${e};font-family:` + A, c = [l(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: n
        }, h)], p.push(l("foreignObject", {
        x: v - f + i + e,
        y: L - g + s + e,
        width: F + e,
        height: S + e
      }, c)), a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${u};left:${f}${e};top:${g}${e};width:${b}${e};height:${$}${e};transform:rotate(${x}deg)`
      }, p)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/prepare/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           ox: i,
           oy: s,
           enHTML: d
         }, l, o) {
      let a, n, h, c, p, u = t.alpha,
        f = t.x,
        g = t.y,
        b = t.width,
        $ = t.height,
        m = t.fillColor,
        y = t.cap,
        x = t.rotate,
        _ = t.color,
        w = t.linewidth,
        k = t.dash,
        v = t.textX,
        L = t.textY,
        F = t.textWidth,
        S = t.textHeight,
        C = t.padding,
        H = t.textFontsize,
        M = t.textForecolor,
        G = t.textBackground,
        T = t.textLetterspacing,
        A = t.textFontfamily,
        z = t.text,
        P = r(b),
        j = r($);
      return p = [l("path", {
        d: `M${P/4} 0L0 ${j/2}L${P/4} ${j}L${P/4*3} ${j}L${P} ${j/2}L${P/4*3} 0z`,
        style: `fill:${m||"none"};stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e,
        "stroke-linecap": y && "round"
      }, 1)], h = [l(0, d(z), 1)], n =
        `padding:${C}${e};font-size:${H}${e};width:${F}${e};color:${M};`, G && (n +=
        `background:${G};`), n += `letter-spacing:${T}${e};font-family:` + A, c = [l(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: n
        }, h)], p.push(l("foreignObject", {
        x: v - f + i + e,
        y: L - g + s + e,
        width: F + e,
        height: S + e
      }, c)), a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${u};left:${f}${e};top:${g}${e};width:${b}${e};height:${$}${e};transform:rotate(${x}deg)`
      }, p)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/parallel/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           ox: i,
           oy: s,
           enHTML: d
         }, l, o) {
      let a, n, h, c, p, u = t.alpha,
        f = t.x,
        g = t.y,
        b = t.width,
        $ = t.height,
        m = (t.fillColor, t.cap),
        y = t.rotate,
        x = t.color,
        _ = t.linewidth,
        w = t.dash,
        k = t.textX,
        v = t.textY,
        L = t.textWidth,
        F = t.textHeight,
        S = t.padding,
        C = t.textFontsize,
        H = t.textForecolor,
        M = t.textBackground,
        G = t.textLetterspacing,
        T = t.textFontfamily,
        A = t.text,
        z = r(b),
        P = r($);
      return p = [l("path", {
        d: `M0 0L${z} 0M${z} ${P}L0 ` + P,
        style: `stroke:${x};stroke-width:` + _ + e,
        "stroke-dasharray": w + e,
        "stroke-linecap": m && "round"
      }, 1)], h = [l(0, d(A), 1)], n =
        `padding:${S}${e};font-size:${C}${e};width:${L}${e};color:${H};`, M && (n +=
        `background:${M};`), n += `letter-spacing:${G}${e};font-family:` + T, c = [l(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: n
        }, h)], p.push(l("foreignObject", {
        x: k - f + i + e,
        y: v - g + s + e,
        width: L + e,
        height: F + e
      }, c)), a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${u};left:${f}${e};top:${g}${e};width:${b}${e};height:${$}${e};transform:rotate(${y}deg)`
      }, p)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/qdata/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           ox: i,
           oy: s,
           enHTML: d
         }, l, o) {
      let a, n, h, c, p, u = t.alpha,
        f = t.x,
        g = t.y,
        b = t.width,
        $ = t.height,
        m = t.fillColor,
        y = t.cap,
        x = t.rotate,
        _ = t.color,
        w = t.linewidth,
        k = t.dash,
        v = t.textX,
        L = t.textY,
        F = t.textWidth,
        S = t.textHeight,
        C = t.padding,
        H = t.textFontsize,
        M = t.textForecolor,
        G = t.textBackground,
        T = t.textLetterspacing,
        A = t.textFontfamily,
        z = t.text,
        P = r(b),
        j = r($);
      return p = [l("ellipse", {
        cx: P / 2,
        cy: j / 2,
        rx: P / 2,
        ry: j / 2,
        style: `fill:${m||"none"};stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e,
        "stroke-linecap": y && "round"
      }, 1), l("path", {
        d: `M${P/2} ${j}L${P} ` + j,
        style: `fill:none;stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e
      }, 1)], h = [l(0, d(z), 1)], n =
        `padding:${C}${e};font-size:${H}${e};width:${F}${e};color:${M};`, G && (n +=
        `background:${G};`), n += `letter-spacing:${T}${e};font-family:` + A, c = [l(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: n
        }, h)], p.push(l("foreignObject", {
        x: v - f + i + e,
        y: L - g + s + e,
        width: F + e,
        height: S + e
      }, c)), a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${u};left:${f}${e};top:${g}${e};width:${b}${e};height:${$}${e};transform:rotate(${x}deg)`
      }, p)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/ref/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           ox: i,
           oy: s,
           enHTML: d
         }, l, o) {
      let a, n, h, c, p, u = t.alpha,
        f = t.x,
        g = t.y,
        b = t.width,
        $ = t.height,
        m = t.fillColor,
        y = t.cap,
        x = t.rotate,
        _ = t.color,
        w = t.linewidth,
        k = t.dash,
        v = t.textX,
        L = t.textY,
        F = t.textWidth,
        S = t.textHeight,
        C = t.padding,
        H = t.textFontsize,
        M = t.textForecolor,
        G = t.textBackground,
        T = t.textLetterspacing,
        A = t.textFontfamily,
        z = t.text,
        P = r(b),
        j = r($);
      return p = [l("ellipse", {
        cx: P / 2,
        cy: j / 2,
        rx: P / 2,
        ry: j / 2,
        style: `fill:${m||"none"};stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e,
        "stroke-linecap": y && "round"
      }, 1)], h = [l(0, d(z), 1)], n =
        `padding:${C}${e};font-size:${H}${e};width:${F}${e};color:${M};`, G && (n +=
        `background:${G};`), n += `letter-spacing:${T}${e};font-family:` + A, c = [l(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: n
        }, h)], p.push(l("foreignObject", {
        x: v - f + i + e,
        y: L - g + s + e,
        width: F + e,
        height: S + e
      }, c)), a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${u};left:${f}${e};top:${g}${e};width:${b}${e};height:${$}${e};transform:rotate(${x}deg)`
      }, p)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/process/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           ox: i,
           oy: s,
           enHTML: d
         }, l, o) {
      let a, n, h, c, p, u = t.alpha,
        f = t.x,
        g = t.y,
        b = t.width,
        $ = t.height,
        m = t.fillColor,
        y = t.cap,
        x = t.rotate,
        _ = t.color,
        w = t.linewidth,
        k = t.dash,
        v = t.textX,
        L = t.textY,
        F = t.textWidth,
        S = t.textHeight,
        C = t.padding,
        H = t.textFontsize,
        M = t.textForecolor,
        G = t.textBackground,
        T = t.textLetterspacing,
        A = t.textFontfamily,
        z = t.text,
        P = r(b),
        j = r($);
      return p = [l("path", {
        d: `M0 0L0 ${j}L${P} ${j}L${P} 0z`,
        style: `fill:${m||"none"};stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e,
        "stroke-linecap": y && "round"
      }, 1)], h = [l(0, d(z), 1)], n =
        `padding:${C}${e};font-size:${H}${e};width:${F}${e};color:${M};`, G && (n +=
        `background:${G};`), n += `letter-spacing:${T}${e};font-family:` + A, c = [l(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: n
        }, h)], p.push(l("foreignObject", {
        x: v - f + i + e,
        y: L - g + s + e,
        width: F + e,
        height: S + e
      }, c)), a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${u};left:${f}${e};top:${g}${e};width:${b}${e};height:${$}${e};transform:rotate(${x}deg)`
      }, p)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/subprocess/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           ox: i,
           oy: s,
           enHTML: d
         }, l, o) {
      let a, n, h, c, p, u = t.alpha,
        f = t.x,
        g = t.y,
        b = t.width,
        $ = t.height,
        m = t.fillColor,
        y = t.cap,
        x = t.rotate,
        _ = t.color,
        w = t.linewidth,
        k = t.dash,
        v = t.textX,
        L = t.textY,
        F = t.textWidth,
        S = t.textHeight,
        C = t.padding,
        H = t.textFontsize,
        M = t.textForecolor,
        G = t.textBackground,
        T = t.textLetterspacing,
        A = t.textFontfamily,
        z = t.text,
        P = r(b),
        j = r($);
      return p = [l("path", {
        d: `M0 0L0 ${j}L${P} ${j}L${P} 0ZM${.1*P} 0L${.1*P} ${j}M${.9*P} 0L${.9*P} ` +
          j,
        style: `fill:${m||"none"};stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e,
        "stroke-linecap": y && "round"
      }, 1)], h = [l(0, d(z), 1)], n =
        `padding:${C}${e};font-size:${H}${e};width:${F}${e};color:${M};`, G && (n +=
        `background:${G};`), n += `letter-spacing:${T}${e};font-family:` + A, c = [l(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: n
        }, h)], p.push(l("foreignObject", {
        x: v - f + i + e,
        y: L - g + s + e,
        width: F + e,
        height: S + e
      }, c)), a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${u};left:${f}${e};top:${g}${e};width:${b}${e};height:${$}${e};transform:rotate(${x}deg)`
      }, p)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/terminator/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           ox: r,
           oy: i,
           enHTML: s
         }, d, l) {
      let o, a, n, h, c, p = t.alpha,
        u = t.x,
        f = t.y,
        g = t.width,
        b = t.height,
        $ = t.fillColor,
        m = t.cap,
        y = t.rotate,
        x = t.color,
        _ = t.linewidth,
        w = t.dash,
        k = t.textX,
        v = t.textY,
        L = t.textWidth,
        F = t.textHeight,
        S = t.padding,
        C = t.textFontsize,
        H = t.textForecolor,
        M = t.textBackground,
        G = t.textLetterspacing,
        T = t.textFontfamily,
        A = t.text;
      return c = [d("rect", {
        x: 0,
        y: 0,
        width: g + e,
        height: b + e,
        style: `fill:${$||"none"};stroke:${x};stroke-width:` + _ + e,
        "stroke-dasharray": w + e,
        rx: 20,
        ry: b / 2 + e,
        "stroke-linecap": m && "round"
      }, 1)], n = [d(0, s(A), 1)], a =
        `padding:${S}${e};font-size:${C}${e};width:${L}${e};color:${H};`, M && (a +=
        `background:${M};`), a += `letter-spacing:${G}${e};font-family:` + T, h = [d(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: a
        }, n)], c.push(d("foreignObject", {
        x: k - u + r + e,
        y: v - f + i + e,
        width: L + e,
        height: F + e
      }, h)), o = [d("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${p};left:${u}${e};top:${f}${e};width:${g}${e};height:${b}${e};transform:rotate(${y}deg)`
      }, c)], d(l, 0, o)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/flow/tape/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           toPx: r,
           ox: i,
           oy: s,
           enHTML: d
         }, l, o) {
      let a, n, h, c, p, u = t.alpha,
        f = t.x,
        g = t.y,
        b = t.width,
        $ = t.height,
        m = t.fillColor,
        y = t.cap,
        x = t.rotate,
        _ = t.color,
        w = t.linewidth,
        k = t.dash,
        v = t.textX,
        L = t.textY,
        F = t.textWidth,
        S = t.textHeight,
        C = t.padding,
        H = t.textFontsize,
        M = t.textForecolor,
        G = t.textBackground,
        T = t.textLetterspacing,
        A = t.textFontfamily,
        z = t.text,
        P = r(b),
        j = r($);
      return p = [l("path", {
        d: `M0 0C${P/4} ${.5*j} ${.75*P} ${-j/2} ${P} 0L${P} ${j}C${.75*P} ${.5*j} ${.25*P} ${1.5*j} 0 ${j}L0 0z`,
        style: `fill:${m||"none"};stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e,
        "stroke-linecap": y && "round"
      }, 1)], h = [l(0, d(z), 1)], n =
        `padding:${C}${e};font-size:${H}${e};width:${F}${e};color:${M};`, G && (n +=
        `background:${G};`), n += `letter-spacing:${T}${e};font-family:` + A, c = [l(
        "div", {
          class: "rd-cW rd-cA rd-c0 rd-dk rd-du",
          style: n
        }, h)], p.push(l("foreignObject", {
        x: v - f + i + e,
        y: L - g + s + e,
        width: F + e,
        height: S + e
      }, c)), a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `opacity:${u};left:${f}${e};top:${g}${e};width:${b}${e};height:${$}${e};transform:rotate(${x}deg)`
      }, p)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/lscreen/border-css2/5r", ["5u"], (t => {
  let e, r = t("5u"),
    {
      View: i,
      applyStyle: s
    } = r;
  return s("rd-fh",
    ".rd-gN{border-radius:10px;border:1px #0174f5 solid;padding:1px;background:#0208171a}.rd-gO{border:2px solid #016ae0;border-radius:10px}"
  ), i.extend({
    tmpl({
           props: t,
           unit: r,
           am: i
         }, s, d) {
      let l, o;
      return o = e ? [e] : [e = s("div", {
        $: "a/",
        class: "rd-cz rd-cA rd-gO"
      })], l = [s("div", {
        class: "rd-cG rd-d7 rd-gN",
        style: `left:${t.x}${r};top:${t.y}${r};height:${t.height}${r};opacity:${t.alpha};width:${t.width}${r};transform:rotate(${t.rotate}deg);` +
          i(t.animations)
      }, o)], s(d, 0, l)
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/lscreen/image/5r", ["5u"], (t => t("5u").View.extend({
  tmpl({
         props: t,
         unit: e,
         am: r
       }, i, s) {
    let d, l, o = t.rotateX,
      a = t.rotateY;
    return l =
      `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);`,
    (o || a) && (l += ";transform:", o && (l += "rotateX(180deg)"), a && (l +=
      " rotateY(180deg)"), l += ";"), l += r(t.animations), d = [i("img", {
      class: "rd-b5 rd-cG rd-d7",
      src: t.image,
      style: l
    }, 1)], i(s, 0, d)
  },
  assign(t) {
    this.set(t)
  },
  render() {
    this.digest()
  }
}))), s.d("6o/lscreen/border-bg/5r", ["5u"], (t => t("5u").View.extend({
  tmpl({
         props: t,
         unit: e,
         am: r
       }, i, s) {
    let d;
    return d = [i("div", {
      class: "rd-cG rd-d7",
      style: `left:${t.x}${e};top:${t.y}${e};height:${t.height}${e};opacity:${t.alpha};width:${t.width}${e};transform:rotate(${t.rotate}deg);background:url(./images/border_1.png);background-size:${t.width}${e} ${t.height}${e};` +
        r(t.animations)
    })], i(s, 0, d)
  },
  assign(t) {
    this.set(t)
  },
  render() {
    this.digest()
  }
}))), s.d("6o/lscreen/border-css4/5r", ["5u"], (t => {
  let e, r, i = t("5u"),
    s = "div",
    {
      View: d,
      applyStyle: l
    } = i;
  return l("rd-fk",
    ".rd-gP{border:1px solid #19ba8b2b;background:#0001}.rd-gQ::after,.rd-gQ::before,.rd-gR::after,.rd-gR::before{position:absolute;content:'';width:10px;height:10px}.rd-gQ::before{border-left:2px solid #02a6b5;left:0;border-top:2px solid #02a6b5}.rd-gQ::after{border-right:2px solid #02a6b5;right:0;border-top:2px solid #02a6b5}.rd-gR::before{border-left:2px solid #02a6b5;left:0;bottom:0;border-bottom:2px solid #02a6b5}.rd-gR::after{border-right:2px solid #02a6b5;right:0;bottom:0;border-bottom:2px solid #02a6b5}"
  ), d.extend({
    tmpl({
           props: t,
           unit: i,
           am: d
         }, l, o) {
      let a, n;
      return n = e ? [e] : [e = l(s, {
        $: "a/",
        class: "rd-cG rd-d3 rd-cz rd-gQ"
      })], r ? n.push(r) : n.push(r = l(s, {
        $: "a;",
        class: "rd-cG rd-d3 rd-d5 rd-cz rd-gR"
      })), a = [l(s, {
        class: "rd-cG rd-d7 rd-gP",
        style: `left:${t.x}${i};top:${t.y}${i};height:${t.height}${i};opacity:${t.alpha};width:${t.width}${i};transform:rotate(${t.rotate}deg);` +
          d(t.animations)
      }, n)], l(o, 0, a)
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/battery/5r", ["5u"], (t => {
  let e = t("5u"),
    r = "path",
    {
      View: i,
      isArray: s
    } = e;
  return i.extend({
    tmpl({
           props: t,
           unit: e,
           am: i
         }, s, d) {
      let l, o, a = t.x,
        n = t.y,
        h = t.width,
        c = t.height,
        p = t.alpha,
        u = t.rotate,
        f = t.charging,
        g = t.fill,
        b = t.lightning,
        $ = t.outline,
        m = t.power,
        y = t.animations,
        x = 8.1 * (100 - m),
        _ = 8.1 * m;
      return o = [], o.push(s(r, {
        fill: g,
        d: `M330 ${140+x}h350v${_}H330z`
      }, 1)), f && o.push(s(r, {
        fill: b,
        d: "M499.712 801.131l97.445-324.376-97.445 12.783V266.735l-93.415 314.798 93.415-29.927zm50.077-772.228h-94.704z",
        stroke: g,
        "stroke-width": "10px"
      }, 1)), o.push(s(r, {
        fill: $,
        d: "M440 0c-47.368 0-47.368 76.338-48.788 76.338h190.86S582.072 0 534.704 0z"
      }, 1), s(r, {
        fill: $,
        d: "M247.742 168.663V919.75c0 99.328 93.712 100.121 93.712 100.121h327.879s93.712 0 93.712-100.12V168.662c0-100.121-93.712-100.121-93.712-100.121H341.454s-93.712 0-93.712 100.12zm427.206-60.45s48.458-.065 48.458 51.234V928.9c0 51.3-48.458 51.3-48.458 51.3H335.84s-48.458 0-48.458-51.3V159.48c0-52.885 48.458-51.3 48.458-51.3h339.11z"
      }, 1)), l = [s("svg", {
        viewBox: "0 0 1024 1024",
        class: "rd-cG rd-d7",
        style: `left:${a}${e};top:${n}${e};width:${h}${e};height:${c}${e};opacity:${p};transform:rotate(${u}deg);` +
          i(y)
      }, o)], s(d, 0, l)
    },
    assign(t) {
      var e;
      let {
        props: r
      } = t, {
        bind: i
      } = r;
      if (null == i ? void 0 : i._data) {
        let t = i._data;
        s(t) && (t = t[0]);
        let d = null !== (e = i.fields) && void 0 !== e ? e : [],
          l = d[0];
        l && (r.power = t[l.key]), l = d[1], l && (r.charging = t[l.key])
      }
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/arc/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      PI: i,
      cos: s,
      sin: d
    } = Math,
    {
      State: l,
      View: o
    } = e;
  return o.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           toPx: i,
           startX: s,
           ox: d,
           startY: l,
           oy: o,
           big: a,
           endX: n,
           endY: h
         }, c, p) {
      let u, f, g = t.x,
        b = t.y,
        $ = t.width,
        m = t.height,
        y = t.rotate,
        x = t.rx,
        _ = t.ry,
        w = t.fillcolor,
        k = t.closed,
        v = t.color,
        L = t.cap,
        F = t.alpha,
        S = t.dash,
        C = t.linewidth,
        H = t.linejoin,
        M = t.animations;
      return f = [c("path", {
        d: `M${i(s-g+d)} ${i(l-b+o)}A${i(x)} ${i(_)} 0 ${a?1:0} 1 ${i(n-g+d)} ` +
          i(h - b + o) + (k ? "z" : ""),
        style: `fill:${w||"none"};stroke:${v};stroke-width:${C}${e};opacity:` +
          F,
        "stroke-dasharray": S + e,
        "stroke-linecap": L && "round",
        "stroke-linejoin": H
      }, 1)], u = [c("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${g}${e};top:${b}${e};width:${$}${e};height:${m}${e};transform:rotate(${y}deg);` +
          r(M)
      }, f)], c(p, 0, u)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: l.get("bZ") || 0,
        oy: l.get("b0") || 0
      })
    },
    assign(t) {
      let {
        props: e
      } = t, {
        startAngle: r,
        endAngle: l,
        rx: o,
        ry: a,
        centerX: n,
        centerY: h
      } = e;
      r = parseFloat(r), l = parseFloat(l), l < r && ([l, r] = [r, l]);
      let c = l - r;
      c > 360 && (r += 360, c = l - r);
      let p = c >= 180,
        u = i / 180,
        f = n + o * s(r * u),
        g = h + a * d(r * u),
        b = n + o * s(l * u),
        $ = h + a * d(l * u);
      this.set(t, {
        big: p,
        startX: f,
        startY: g,
        endX: b,
        endY: $
      })
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/bezier3/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           mmax: r,
           mu: i,
           am: s,
           toPx: d,
           ox: l,
           oy: o
         }, a, n) {
      let h, c, p = t.x,
        u = t.y,
        f = t.width,
        g = t.height,
        b = t.color,
        $ = t.fillcolor,
        m = t.animations,
        y = t.ctrl1X,
        x = t.ctrl1Y,
        _ = t.ctrl2X,
        w = t.ctrl2Y,
        k = t.ctrl3X,
        v = t.ctrl3Y,
        L = t.ctrl4X,
        F = t.ctrl4Y,
        S = t.linewidth,
        C = t.alpha,
        H = t.cap,
        M = t.dash,
        G = t.closed;
      return c = [a("path", {
        d: `M${d(y-p+l)} ${d(x-u+o)}C${d(_-p+l)} ${d(w-u+o)} ${d(k-p+l)} ${d(v-u+o)} ${d(L-p+l)} ` +
          d(F - u + o) + (G ? "z" : ""),
        style: `fill:${$||"none"};stroke:${b};stroke-width:${S}${e};opacity:` +
          C,
        "stroke-dasharray": M + e,
        "stroke-linecap": H && "round"
      }, 1)], h = [a("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${p}${e};top:${u}${e};width:${r(f,i)}${e};height:${r(g,i)}${e};` +
          s(m)
      }, c)], a(n, 0, h)
    },
    init() {
      this.set({
        mu: r.bF(1),
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/bezier2/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           mmax: r,
           mu: i,
           am: s,
           toPx: d,
           ox: l,
           oy: o
         }, a, n) {
      let h, c, p = t.x,
        u = t.y,
        f = t.width,
        g = t.height,
        b = t.color,
        $ = t.animations,
        m = t.ctrl1X,
        y = t.ctrl1Y,
        x = t.ctrl2X,
        _ = t.ctrl2Y,
        w = t.ctrl3X,
        k = t.ctrl3Y,
        v = t.fillcolor,
        L = t.linewidth,
        F = t.alpha,
        S = t.cap,
        C = t.dash,
        H = t.closed;
      return c = [a("path", {
        d: `M${d(m-p+l)} ${d(y-u+o)}Q${d(x-p+l)} ${d(_-u+o)} ${d(w-p+l)} ` + d(
          k - u + o) + (H ? "z" : ""),
        style: `fill:${v||"none"};stroke:${b};stroke-width:${L}${e};opacity:` +
          F,
        "stroke-dasharray": C + e,
        "stroke-linecap": S && "round"
      }, 1)], h = [a("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${p}${e};top:${u}${e};width:${r(f,i)}${e};height:${r(g,i)}${e};` +
          s($)
      }, c)], a(n, 0, h)
    },
    init() {
      this.set({
        mu: r.bF(1),
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/circle/5r", ["5u"], (t => t("5u").View.extend({
  tmpl({
         props: t,
         unit: e,
         am: r
       }, i, s) {
    let d, l, o = t.x,
      a = t.y,
      n = t.width,
      h = t.height,
      c = t.r,
      p = t.fillcolor,
      u = t.linewidth,
      f = t.alpha,
      g = t.dash,
      b = t.cap,
      $ = t.color,
      m = t.animations;
    return l = [i("circle", {
      r: c + e,
      cx: c + e,
      cy: c + e,
      style: `fill:${p||"none"};stroke:${$};stroke-width:${u}${e};opacity:` + f,
      "stroke-dasharray": g + e,
      "stroke-linecap": b && "round"
    }, 1)], d = [i("svg", {
      class: "rd-dT rd-cG rd-d7",
      style: `left:${o}${e};top:${a}${e};width:${n}${e};height:${h}${e};` + r(m)
    }, l)], i(s, 0, d)
  },
  assign(t) {
    this.set(t)
  },
  render() {
    this.digest()
  }
}))), s.d("6o/svg/brace/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60");
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           toPx: i
         }, s, d) {
      let l, o, a = t.x,
        n = t.y,
        h = t.width,
        c = t.height,
        p = t.rotate,
        u = t.color,
        f = t.linewidth,
        g = t.alpha,
        b = t.dash,
        $ = t.cap,
        m = t.animations,
        y = i(h),
        x = i(c);
      return o = [s("path", {
        d: `M${y} 0C0 0 ${y} ${x/2} 0 ${x/2}M0 ${x/2}C${y} ${x/2} 0 ${x} ${y} ` +
          x,
        style: `fill:none;stroke:${u};stroke-width:${f}${e};opacity:` + g,
        "stroke-dasharray": b + e,
        "stroke-linecap": $ && "round"
      }, 1)], l = [s("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${a}${e};top:${n}${e};width:${h}${e};height:${c}${e};transform:rotate(${p}deg);` +
          r(m)
      }, o)], s(d, 0, l)
    },
    init() {
      this.set({
        toPx: r.bU
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/ellipse/5r", ["5u"], (t => {
  let e = t("5u"),
    {
      State: r,
      View: i
    } = e;
  return i.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           ox: i,
           oy: s
         }, d, l) {
      let o, a, n = t.x,
        h = t.y,
        c = t.width,
        p = t.height,
        u = t.rotate,
        f = t.animations;
      return a = [d("ellipse", {
        cx: t.centerX - n + i + e,
        cy: t.centerY - h + s + e,
        rx: t.rx + e,
        ry: t.ry + e,
        style: `fill:${t.fillcolor||"none"};stroke:${t.color};stroke-width:${t.linewidth}${e};opacity:` +
          t.alpha,
        "stroke-dasharray": t.dash + e
      }, 1)], o = [d("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${n}${e};top:${h}${e};width:${c}${e};height:${p}${e};transform:rotate(${u}deg);` +
          r(f)
      }, a)], d(l, 0, o)
    },
    init() {
      this.set({
        ox: r.get("bZ") || 0,
        oy: r.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/fan/5r", ["5u", "../../../66/6a/5r"], (t => {
  let e = t("5u"),
    r = t("../../../66/6a/5r"),
    {
      View: i,
      node: s,
      now: d,
      isArray: l
    } = e;
  return i.extend({
    tmpl({
           props: t,
           unit: e,
           am: r
         }, i, s) {
      let d, l, o = t.x,
        a = t.y,
        n = t.width,
        h = t.height,
        c = t.alpha,
        p = t.fill,
        u = t.animations;
      return l = [i("path", {
        d: "M941.376 595.693c-15.633-99.283-108.77-158.96-225.173-146.083-48.627 5.366-134.595 45.824-145.204 20.339-18.51-86.894 90.139-112.135 169.397-116.183 103.305-5.291 137.717-64.237 87.554-153.447C774.318 104.928 639.771 47.324 552 82.173c-90.306 35.85-127.715 134.389-100.112 265.985 7.074 33.509 39.706 77.992-12.949 92.087-39.238 10.535-65.287-28.484-75.089-67.847-7.804-31.46-15.95-63.334-18.899-95.502-10.217-111.914-71.212-140.547-165.985-76.334-94.038 63.75-141.129 186.372-97.012 270.216 56.36 107.111 152.837 115.744 258.217 92.453 34.02-7.535 79.916-39.556 92.746 14.608 8.584 36.339-31.217 60.679-69.213 75.261-31.802 12.241-62.895 15.998-96.208 17.656-105.185 5.171-135.523 61.58-84.067 152.617 54.021 95.624 190.958 151.399 277.289 112.94 97.331-43.336 152.473-156.738 102.137-289.75-4.391-24.192-33.604-54.335-5.534-67.163 26.848-12.242 50.676 8.413 63.918 27.411 31.021 44.582 44.287 93.062 38.192 151.181-7.584 72.233 32.874 107.134 107.988 93.453 97.964-17.876 190.1-153.131 173.957-255.752z m-440.662-46.678c-21.122 0-38.24-17.121-38.24-38.239 0-21.12 17.118-38.24 38.24-38.24 21.122 0 38.24 17.12 38.24 38.24 0 21.118-17.118 38.239-38.24 38.239z",
        fill: p,
        id: "_rd_" + s
      }, 1)], d = [i("svg", {
        viewBox: "0 0 1024 1024",
        class: "rd-cG rd-d7 rd-dS",
        style: `left:${o}${e};top:${a}${e};width:${n}${e};height:${h}${e};opacity:${c};` +
          r(u)
      }, l)], i(s, 0, d)
    },
    init() {
      this.on("destroy", (() => {
        r._bZ(this._h8)
      }))
    },
    assign(t) {
      var e;
      let {
        props: r
      } = t, {
        bind: i,
        speed: s,
        reverse: d
      } = r;
      if (i._data && (null === (e = i.fields) || void 0 === e ? void 0 : e.length)) {
        let t = i._data;
        l(t) && (t = t[0]);
        let e = i.fields[0];
        (null == e ? void 0 : e.key) && (r.working = null == t ? void 0 : t[e.key]);
        let d = i.fields[1];
        (null == d ? void 0 : d.key) && (s = null == t ? void 0 : t[d.key])
      }
      this.set(t, {
        reverse: d,
        speed: Math.pow(1.8, s + 1)
      })
    },
    async render() {
      var t, e;
      if (await this.digest(), this._h8 || (this._h9 = s(`_rd_${this.id}`), this._i_ = d(),
        this._ia = 0, this._h8 = () => {
        let {
          speed: t,
          reverse: e
        } = this.get(), r = (d() - this._i_) / 100 % t;
        e && (r = t - r);
        let i = (r / t * 360 + this._ia) % 360;
        this._ib = i, this._h9.setAttribute("transform", `rotate(${i},500,510)`)
      }), this.get("props").working)
        if (this._ic) {
          let e = this.get("speed"),
            r = this.get("reverse"),
            i = ((null !== (t = this._ib) && void 0 !== t ? t : 0) - this._ia + 360) %
              360 / 360 * e;
          r && (i = e - i), this._i_ = d() - 100 * i
        } else this._ic = 1, this._i_ = d(), r._b0(40, this._h8);
      else this._ic && (r._bZ(this._h8), this._ic = 0, this._ia = null !== (e = this._ib) &&
      void 0 !== e ? e : 0)
    }
  })
})), s.d("6o/svg/line/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           mmax: e,
           mu: r,
           unit: i,
           am: s,
           toPx: d,
           ox: l,
           oy: o
         }, a, n) {
      let h, c, p = t.width,
        u = t.height,
        f = t.x,
        g = t.y,
        b = t.color,
        $ = t.ctrl1X,
        m = t.ctrl1Y,
        y = t.ctrl2X,
        x = t.ctrl2Y,
        _ = t.linewidth,
        w = t.alpha,
        k = t.dash,
        v = t.cap,
        L = t.animations;
      return c = [a("path", {
        d: `M${d($-f+l)} ${d(m-g+o)}L${d(y-f+l)} ` + d(x - g + o),
        style: `fill:none;stroke:${b};stroke-width:${_}${i};opacity:` + w,
        "stroke-dasharray": k + i,
        "stroke-linecap": v && "round"
      }, 1)], h = [a("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `width:${e(p,r)}${i};height:${e(u,r)}${i};left:${f}${i};top:${g}${i};` +
          s(L)
      }, c)], a(n, 0, h)
    },
    init() {
      this.set({
        mu: r.bF(1),
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/heart/5r", ["5u"], (t => {
  let e = t("5u"),
    {
      View: r
    } = e;
  return r.extend({
    tmpl({
           props: t,
           unit: e,
           am: r
         }, i, s) {
      let d, l, o = t.x,
        a = t.y,
        n = t.width,
        h = t.height,
        c = t.rotate,
        p = t.animations,
        u = t.fill,
        f = t.alpha;
      return l = [i("path", {
        d: "M706.024 122C840.746 122 945 224.268 945 356.383c0 158.703-141.855 286.703-358.154 480.274L573.51 848.59 510.5 904l-63.011-55.41-32.988-29.529C209.304 635.221 76 510.228 76 356.383 76 224.268 180.254 122 314.975 122c76.038 0 147.704 34.089 195.525 89.497C558.32 156.09 629.988 122 706.024 122z",
        fill: u
      }, 1)], d = [i("svg", {
        viewBox: "0 0 1024 1024",
        class: "rd-cG rd-d7 rd-dS",
        style: `left:${o}${e};top:${a}${e};width:${n}${e};height:${h}${e};opacity:${f};transform:rotate(${c}deg);` +
          r(p)
      }, l)], i(s, 0, d)
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/polyline2/5r", ["5u", "../../../5s/60", "../../../5s/62"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    i = t("../../../5s/62"),
    {
      State: s,
      View: d
    } = e;
  return d.extend({
    tmpl({
           props: t,
           unit: e,
           mmax: r,
           mu: i,
           am: s,
           path: d
         }, l, o) {
      let a, n, h = t.x,
        c = t.y,
        p = t.width,
        u = t.height,
        f = t.fillcolor,
        g = t.color,
        b = t.linewidth,
        $ = t.alpha,
        m = t.dash,
        y = t.cap,
        x = t.linejoin,
        _ = t.closed,
        w = t.animations;
      return n = [l("path", {
        d: d + (_ ? "z" : ""),
        style: `fill:${f||"none"};stroke:${g};stroke-width:${b}${e};opacity:` +
          $,
        "stroke-dasharray": m + e,
        "stroke-linejoin": x,
        "stroke-linecap": y && "round"
      }, 1)], a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${h}${e};top:${c}${e};width:${r(p,i)}${e};height:${r(u,i)}${e};` +
          s(w)
      }, n)], l(o, 0, a)
    },
    init() {
      this.set({
        mu: r.bF(1)
      })
    },
    assign(t) {
      let {
        props: e,
        unit: d
      } = t, {
        x: l,
        y: o
      } = e;
      l -= s.get("bZ") || 0, o -= s.get("b0") || 0;
      let a, n = i.bU(e);
      for (let t of n) {
        let i = e[t + "X"],
          s = e[t + "Y"];
        a ? a += "L" : a = "M", a += r.bU(i - l) + "," + r.bU(s - o)
      }
      this.set({
        unit: d,
        props: e,
        path: a
      })
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/pipe/5r", ["5u", "../../../5s/60", "../../../5s/62", "../../../66/6a/5r"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    i = t("../../../5s/62"),
    s = t("../../../66/6a/5r"),
    d = "path",
    {
      State: l,
      View: o,
      node: a,
      now: n,
      isArray: h
    } = e;
  return o.extend({
    tmpl({
           props: t,
           unit: e,
           mmax: r,
           mu: i,
           am: s,
           path: l
         }, o, a) {
      let n, h, c = t.x,
        p = t.y,
        u = t.width,
        f = t.height,
        g = t.pipeColor,
        b = t.pipeWidth,
        $ = t.alpha,
        m = t.liquidWidth,
        y = t.liquidColor,
        x = t.liquidDash,
        _ = t.animations;
      return h = [o(d, {
        d: l,
        style: `fill:none;stroke:${g};stroke-width:${b}${e};stroke-linejoin:round`
      }, 1), o(d, {
        d: l,
        style: `fill:none;stroke:${y};stroke-width:${m}${e};stroke-dasharray:${x};stroke-linejoin:round`,
        id: "_rd_" + a
      }, 1)], n = [o("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${c}${e};top:${p}${e};width:${r(u,i)}${e};height:${r(f,i)}${e};opacity:${$};` +
          s(_)
      }, h)], o(a, 0, n)
    },
    init() {
      this.set({
        mu: r.bF(1)
      }), this.on("destroy", (() => {
        s._bZ(this._id)
      }))
    },
    assign(t) {
      var e;
      let {
        props: s,
        unit: d
      } = t, {
        x: o,
        y: a,
        bind: n,
        speed: c
      } = s;
      o -= l.get("bZ") || 0, a -= l.get("b0") || 0;
      let p, u = i.bU(s);
      for (let t of u) {
        let e = s[t + "X"],
          i = s[t + "Y"];
        p ? p += "L" : p = "M", p += r.bU(e - o) + "," + r.bU(i - a)
      }
      if (n._data && (null === (e = n.fields) || void 0 === e ? void 0 : e.length)) {
        let t = n._data;
        h(t) && (t = t[0]);
        let e = n.fields[0];
        (null == e ? void 0 : e.key) && (s.flowing = null == t ? void 0 : t[e.key]);
        let r = n.fields[1];
        (null == r ? void 0 : r.key) && (c = null == t ? void 0 : t[r.key])
      }
      this.set({
        unit: d,
        speed: Math.pow(1.6, c),
        props: s,
        path: p
      })
    },
    async render() {
      var t, e;
      await this.digest(), this._id || (this._h9 = a(`_rd_${this.id}`), this._ie = 0,
        this._id = () => {
          let {
            liquidDash: t
          } = this.get("props"), e = this.get("speed"), r = 2 * t, i = ((n() -
            this._i_) / 100 % e / e * r + this._ie) % r;
          this._if = i, this._h9.setAttribute("stroke-dashoffset", (r - i).toFixed(
            2))
        });
      let r = this.get("props");
      if (r.flowing)
        if (this._ig) {
          let e = this.get("speed"),
            i = 2 * r.liquidDash,
            s = ((null !== (t = this._if) && void 0 !== t ? t : 0) - this._ie + i) %
              i / i * e;
          this._i_ = n() - 100 * s
        } else this._ig = 1, this._i_ = n(), s._b0(60, this._id);
      else this._ig && (s._bZ(this._id), this._ig = 0, this._ie = null !== (e = this._if) &&
      void 0 !== e ? e : 0)
    }
  })
})), s.d("6o/svg/rarrow/5r", ["5u", "../../../5s/60", "../../../5s/62"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    i = t("../../../5s/62");
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           path: i
         }, s, d) {
      let l, o, a = t.x,
        n = t.y,
        h = t.width,
        c = t.height,
        p = t.rotate,
        u = t.fillcolor,
        f = t.color,
        g = t.linewidth,
        b = t.alpha,
        $ = t.dash,
        m = t.cap,
        y = t.linejoin,
        x = t.animations;
      return o = [s("path", {
        d: i,
        style: `fill:${u||"none"};stroke:${f};stroke-width:${g}${e};opacity:` +
          b,
        "stroke-dasharray": $ + e,
        "stroke-linecap": m && "round",
        "stroke-linejoin": y
      }, 1)], l = [s("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${a}${e};top:${n}${e};width:${h}${e};height:${c}${e};transform:rotate(${p}deg);` +
          r(x)
      }, o)], s(d, 0, l)
    },
    assign(t) {
      let {
        props: e,
        unit: s
      } = t, d = "M", {
        width: l,
        height: o,
        mod1X: a,
        mod1Y: n,
        stail: h
      } = e, c = r.bU(l), p = r.bU(o), u = p / 2, f = 0, g = u * n;
      if (d += f + " " + g, f = c * a, d += "L" + f + " " + g, d += "L" + f + " 0", d += "L" +
        c + " " + u, d += "L" + f + " " + p, d += "L" + f + " " + (p - g), d += "L0 " + (p -
        g), h) {
        let {
          k: t
        } = i.bS(f, 0, c, u);
        d += `L${(u-g)/t} ${u}`
      }
      d += "z", this.set({
        unit: s,
        props: e,
        path: d
      })
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/rbubble/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60");
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           path: i
         }, s, d) {
      let l, o, a = t.x,
        n = t.y,
        h = t.width,
        c = t.height,
        p = t.rotate,
        u = t.fillcolor,
        f = t.color,
        g = t.linewidth,
        b = t.alpha,
        $ = t.dash,
        m = t.cap,
        y = t.linejoin,
        x = t.animations;
      return o = [s("path", {
        d: i,
        style: `fill:${u||"none"};stroke:${f};stroke-width:${g}${e};opacity:` +
          b,
        "stroke-dasharray": $ + e,
        "stroke-linecap": m && "round",
        "stroke-linejoin": y
      }, 1)], l = [s("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${a}${e};top:${n}${e};width:${h}${e};height:${c}${e};transform:rotate(${p}deg);` +
          r(x)
      }, o)], s(d, 0, l)
    },
    assign(t) {
      let {
        props: e,
        unit: i
      } = t, {
        width: s,
        height: d,
        mod1X: l,
        mod1Y: o,
        radius: a,
        gapPosition: n,
        gapPRatio: h,
        gapRatio: c
      } = e, p = s / 2, u = d / 2, f = this.get("mmin")(p, u);
      a > f && (a = f);
      let g = [],
        b = r.bU(a),
        $ = r.bU(s),
        m = r.bU(d),
        y = r.bU(l),
        x = r.bU(o),
        _ = $ - 2 * b,
        w = m - 2 * b,
        k = "A" + b + "," + b + ",0,0,1," + b + ",0",
        v = "A" + b + "," + b + ",0,0,1," + $ + "," + b,
        L = "A" + b + "," + b + ",0,0,1," + ($ - b) + "," + m,
        F = "A" + b + "," + b + ",0,0,1,0," + (m - b);
      if ("top" == n) {
        let t = b + _ * h,
          e = t + _ * c;
        e > $ - b && (e = $ - b), g.push(b, ",0,L", t, ",0", "L", y, ",", -x, "L", e, ",0",
          "L", $ - b, ",0", v, "L", $, ",", m - b, L, "L", b, ",", m, ",", F, "L0,",
          b, k)
      } else if ("right" == n) {
        let t = b + w * h,
          e = t + w * c;
        e > m - b && (e = m - b), g.push(b, ",0,L", $ - b, ",0", v, "L", $, ",", t, "L", $ +
          y, ",", x, "L", $, ",", e, "L", $, ",", m - b, L, "L", b, ",", m, F, "L0,",
          b, k)
      } else if ("bottom" == n) {
        let t = b + _ * h,
          e = t + _ * c;
        e > $ - b && (e = $ - b), g.push(b, ",0,L", $ - b, ",0", v, "L", $, ",", m - b, L,
          "L", e, ",", m, "L", y, ",", m + x, "L", t, ",", m, "L", b, ",", m, F,
          "L0,", b, k)
      } else if ("left" == n) {
        let t = b + w * h,
          e = t + w * c;
        e > m - b && (e = m - b), g.push(b, ",0,L", $ - b, ",0", v, "L", $, ",", m - b, L,
          "L", b, ",", m, F, "L0,", e, "L", -y, ",", x, "L0,", t, "L0,", b, k)
      }
      this.set({
        unit: i,
        props: e,
        path: "M" + g.join("")
      })
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/rcross/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60");
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           path: i
         }, s, d) {
      let l, o, a = t.x,
        n = t.y,
        h = t.width,
        c = t.height,
        p = t.rotate,
        u = t.animations,
        f = t.fillcolor,
        g = t.color,
        b = t.linewidth,
        $ = t.alpha,
        m = (t.dash, t.cap),
        y = t.linejoin;
      return o = [s("path", {
        d: i,
        style: `fill:${f||"none"};stroke:${g};stroke-width:${b}${e};opacity:` +
          $,
        "stroke-dasharray": t.dash + e,
        "stroke-linecap": m && "round",
        "stroke-linejoin": y
      }, 1)], l = [s("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${a}${e};top:${n}${e};width:${h}${e};height:${c}${e};transform:rotate(${p}deg);` +
          r(u)
      }, o)], s(d, 0, l)
    },
    assign(t) {
      let {
        props: e,
        unit: i
      } = t, s = "M", {
        width: d,
        height: l,
        mod1X: o,
        mod1Y: a
      } = e;
      d = r.bU(d), l = r.bU(l);
      let n = d / 2 * o,
        h = l / 2 * a;
      s += "0 " + h, s += "L" + n + " " + h, s += "L" + n + " 0", s += "L" + (d - n) + " 0",
        s += "L" + (d - n) + " " + h, s += "L" + d + " " + h, s += "L" + d + " " + (l - h),
        s += "L" + (d - n) + " " + (l - h), s += "L" + (d - n) + " " + l, s += "L" + n +
        " " + l, s += "L" + n + " " + (l - h), s += "L0 " + (l - h) + "z", this.set({
        unit: i,
        props: e,
        path: s
      })
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/rcard/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60");
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           path: i
         }, s, d) {
      let l, o, a = t.x,
        n = t.y,
        h = t.width,
        c = t.height,
        p = t.rotate,
        u = t.fillcolor,
        f = t.animations;
      return o = [s("path", {
        d: i,
        style: `fill:${u||"none"};stroke:${t.color};stroke-width:${t.linewidth}${e};opacity:` +
          t.alpha,
        "stroke-dasharray": t.dash + e,
        "stroke-linecap": t.cap && "round",
        "stroke-linejoin": t.linejoin
      }, 1)], l = [s("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${a}${e};top:${n}${e};width:${h}${e};height:${c}${e};transform:rotate(${p}deg);` +
          r(f)
      }, o)], s(d, 0, l)
    },
    assign(t) {
      let {
        props: e,
        unit: i
      } = t, s = "M", {
        width: d,
        height: l,
        mod1X: o,
        mod2Y: a
      } = e, n = r.bU(d), h = r.bU(l);
      s += n * o + " 0", s += "L" + n + " 0", s += "L" + n + " " + h, s += "L0 " + h, s +=
        "L0 " + h * a + "z", this.set({
        unit: i,
        props: e,
        path: s
      })
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/rcorner/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60");
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           path: i
         }, s, d) {
      let l, o, a = t.x,
        n = t.y,
        h = t.width,
        c = t.height,
        p = t.rotate,
        u = t.animations;
      return o = [s("path", {
        d: i,
        style: `fill:${t.fillcolor||"none"};stroke:${t.color};stroke-width:${t.linewidth}${e};opacity:` +
          t.alpha,
        "stroke-dasharray": t.dash + e,
        "stroke-linecap": t.cap && "round",
        "stroke-linejoin": t.linejoin
      }, 1)], l = [s("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${a}${e};top:${n}${e};width:${h}${e};height:${c}${e};transform:rotate(${p}deg);` +
          r(u)
      }, o)], s(d, 0, l)
    },
    assign(t) {
      let {
        props: e,
        unit: i
      } = t, s = "M", {
        width: d,
        height: l,
        mod1Y: o,
        mod2X: a,
        mod2Y: n,
        mod3X: h
      } = e, c = r.bU(d), p = r.bU(l), u = p / 2, f = c / 2;
      s += "0 0", s += "L0 " + p, s += "L" + a * f + " " + (p - o * u), s += "L" + a * f +
        " " + n * u, s += "L" + (c - h * f) + " " + n * u, s += "L" + c + " 0z", this.set({
        unit: i,
        props: e,
        path: s
      })
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/rcube/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    i = "path";
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           path1: s,
           path2: d,
           path3: l,
           path4: o
         }, a, n) {
      let h, c, p = t.x,
        u = t.y,
        f = t.width,
        g = t.height,
        b = t.rotate,
        $ = t.animations,
        m = t.topcolor,
        y = t.frontcolor,
        x = t.sidecolor,
        _ = t.color,
        w = t.linewidth,
        k = t.dash,
        v = t.cap,
        L = t.linejoin,
        F = t.alpha;
      return c = [], m && c.push(a(i, {
        d: s,
        style: "fill:" + m
      }, 1)), y && c.push(a(i, {
        d: d,
        style: "fill:" + y
      }, 1)), x && c.push(a(i, {
        d: l,
        style: "fill:" + x
      }, 1)), c.push(a(i, {
        d: o,
        style: `fill:none;stroke:${_};stroke-width:` + w + e,
        "stroke-dasharray": k + e,
        "stroke-linecap": v && "round",
        "stroke-linejoin": L
      }, 1)), h = [a("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${p}${e};top:${u}${e};width:${f}${e};height:${g}${e};transform:rotate(${b}deg);opacity:${F};` +
          r($)
      }, c)], a(n, 0, h)
    },
    assign(t) {
      let {
        props: e,
        unit: i
      } = t, {
        width: s,
        height: d,
        mod1Y: l
      } = e;
      s = r.bU(s), d = r.bU(d);
      let o = d * l;
      o > s && (o = s);
      let a = `M${o},0L${s},0L${s-o},${o}L0,${o}z`,
        n = `M0,${o}L0,${d}L${s-o},${d}L${s-o},${o}z`,
        h = `M${s},0L${s},${d-o}L${s-o},${d}L${s-o},${o}z`,
        c =
          `M0,${o}L0,${d}L${s-o},${d}L${s},${d-o}L${s},0L${o},0zM${s},0L${s-o},${o}L${s-o},${d}M${s-o},${o}L0,${o}`;
      this.set({
        unit: i,
        props: e,
        path1: a,
        path2: n,
        path3: h,
        path4: c
      })
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/rcylinder/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60");
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           path: i,
           cx: s,
           cy: d
         }, l, o) {
      let a, n, h = t.x,
        c = t.y,
        p = t.width,
        u = t.height,
        f = t.rotate,
        g = t.animations,
        b = t.bodycolor,
        $ = t.color,
        m = t.linewidth,
        y = t.alpha,
        x = t.dash,
        _ = t.topcolor;
      t.cap;
      return n = [l("path", {
        d: i,
        style: `fill:${b||"none"};stroke:${$};stroke-width:${m}${e};opacity:` +
          y,
        "stroke-dasharray": x + e
      }, 1), l("ellipse", {
        cx: s,
        cy: d,
        rx: s,
        ry: d,
        style: `fill:${_||"none"};stroke:${$};stroke-width:${m}${e};opacity:` +
          y,
        "stroke-dasharray": x + e
      }, 1)], a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${h}${e};top:${c}${e};width:${p}${e};height:${u}${e};transform:rotate(${f}deg);` +
          r(g)
      }, n)], l(o, 0, a)
    },
    assign(t) {
      let {
        props: e,
        unit: i
      } = t, {
        width: s,
        height: d,
        mod1Y: l
      } = e;
      s = r.bU(s), d = r.bU(d);
      let o = s / 2,
        a = d / 2 / 2 * l,
        n = "M0," + a;
      n += "L0," + (d - a), n += "A" + o + "," + a + ",0 0 0," + s + "," + (d - a), n += "L" +
        s + "," + a, n += "A" + o + "," + a + ",0 0 1,0," + a, this.set({
        unit: i,
        props: e,
        cx: o,
        cy: a,
        path: n
      })
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/rdarrow/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60");
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           path: i
         }, s, d) {
      let l, o, a = t.x,
        n = t.y,
        h = t.width,
        c = t.height,
        p = t.rotate,
        u = t.animations;
      return o = [s("path", {
        d: i,
        style: `fill:${t.fillcolor||"none"};stroke:${t.color};stroke-width:${t.linewidth}${e};opacity:` +
          t.alpha,
        "stroke-dasharray": t.dash + e,
        "stroke-linecap": t.cap && "round",
        "stroke-linejoin": t.linejoin
      }, 1)], l = [s("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${a}${e};top:${n}${e};width:${h}${e};height:${c}${e};transform:rotate(${p}deg);` +
          r(u)
      }, o)], s(d, 0, l)
    },
    assign(t) {
      let {
        props: e,
        unit: i
      } = t, s = "M", {
        width: d,
        height: l,
        mod1X: o,
        mod1Y: a
      } = e;
      d = r.bU(d), l = r.bU(l);
      let n = l / 2,
        h = n * a,
        c = d / 2 * o;
      s += "0 " + n, s += "L" + c + " 0", s += "L" + c + " " + h, s += "L" + (d - c) + " " +
        h, s += "L" + (d - c) + " 0", s += "L" + d + " " + n, s += "L" + (d - c) + " " + l,
        s += "L" + (d - c) + " " + (l - h), s += "L" + c + " " + (l - h), s += "L" + c +
        " " + l + "z", this.set({
        unit: i,
        props: e,
        path: s
      })
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/rect/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           mmax: r,
           mu: i,
           am: s,
           toPx: d,
           ox: l,
           oy: o
         }, a, n) {
      let h, c, p = t.x,
        u = t.y,
        f = t.width,
        g = t.height,
        b = t.fillcolor,
        $ = t.color,
        m = t.linewidth,
        y = t.alpha,
        x = t.dash,
        _ = t.cap,
        w = t.linejoin,
        k = t.animations,
        v = t.ctrl1X,
        L = t.ctrl1Y,
        F = t.ctrl2X,
        S = t.ctrl2Y,
        C = t.ctrl3X,
        H = t.ctrl3Y,
        M = t.ctrl4X,
        G = t.ctrl4Y;
      return c = [a("path", {
        d: `M${d(v-p+l)} ${d(L-u+o)}L${d(F-p+l)} ${d(S-u+o)}L${d(C-p+l)} ${d(H-u+o)}L${d(M-p+l)} ${d(G-u+o)}Z`,
        style: `fill:${b||"none"};stroke:${$};stroke-width:${m}${e};opacity:` +
          y,
        "stroke-dasharray": x + e,
        "stroke-linecap": _ && "round",
        "stroke-linejoin": w
      }, 1)], h = [a("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${p}${e};top:${u}${e};width:${r(f,i)}${e};height:${r(g,i)}${e};` +
          s(k)
      }, c)], a(n, 0, h)
    },
    init() {
      this.set({
        mu: r.bF(1),
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/rmoon/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60");
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           path: i
         }, s, d) {
      let l, o, a = t.x,
        n = t.y,
        h = t.width,
        c = t.height,
        p = t.rotate,
        u = t.alpha,
        f = t.fillcolor,
        g = t.color,
        b = t.linewidth,
        $ = t.animations;
      return o = [s("path", {
        d: i,
        style: `fill:${f||"none"};stroke:${g};stroke-width:` + b + e,
        "stroke-dasharray": t.dash + e,
        "stroke-linecap": t.cap && "round",
        "stroke-linejoin": t.linejoin
      }, 1)], l = [s("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${a}${e};top:${n}${e};width:${h}${e};height:${c}${e};transform:rotate(${p}deg);opacity:${u};` +
          r($)
      }, o)], s(d, 0, l)
    },
    assign(t) {
      let {
        props: e,
        unit: i
      } = t, {
        width: s,
        height: d,
        mod1X: l
      } = e;
      s = r.bU(s), d = r.bU(d);
      let o = d / 2,
        a = "M0,0";
      a += "A" + s + "," + o + ",0 0 1 0," + d, a += "A" + l * s + "," + o + ",0 0 0 0 0z",
        this.set({
          unit: i,
          props: e,
          path: a
        })
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/rect2/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60");
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           mmax: r,
           mu: i,
           am: s
         }, d, l) {
      let o, a, n = t.x,
        h = t.y,
        c = t.width,
        p = t.height,
        u = t.rotate,
        f = t.roundX,
        g = t.roundY,
        b = t.fillcolor,
        $ = t.animations;
      return a = [d("rect", {
        x: 0,
        y: 0,
        rx: f + e,
        ry: g + e,
        width: c + e,
        height: p + e,
        style: `fill:${b||"none"};stroke:${t.color};stroke-width:${t.linewidth}${e};opacity:` +
          t.alpha,
        "stroke-dasharray": t.dash + e,
        "stroke-linecap": t.cap && "round",
        "stroke-linejoin": t.linejoin
      }, 1)], o = [d("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${n}${e};top:${h}${e};width:${r(c,i)}${e};height:${r(p,i)}${e};transform:rotate(${u}deg);` +
          s($)
      }, a)], d(l, 0, o)
    },
    init() {
      this.set({
        mu: r.bF(1)
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/signal/5r", ["5u"], (t => {
  let e = t("5u"),
    r = "rd-dF",
    i = "path",
    {
      View: s,
      isArray: d
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           am: s
         }, d, l) {
      let o, a, n, h = t.x,
        c = t.y,
        p = t.width,
        u = t.height,
        f = t.rotate,
        g = t.alpha,
        b = t.connected,
        $ = t.animations,
        m = t.strength,
        y = t.fill,
        x = t.background,
        _ = t.disconnect;
      return n = [], a = "", a += !b || 1 > m ? x : y, n.push(d(i, {
        class: r,
        d: "M112.88 689.631h155.428v244.244h-155.428v-244.244z",
        fill: a
      }, 1)), a = "", a += !b || 2 > m ? x : y, n.push(d(i, {
        class: r,
        d: "M334.921 556.409h155.428v377.467h-155.428v-377.467z",
        fill: a
      }, 1)), a = "", a += !b || 3 > m ? x : y, n.push(d(i, {
        class: r,
        d: "M579.164 400.98h133.223v532.895h-133.223v-532.895z",
        fill: a
      }, 1)), a = "", a += !b || 4 > m ? x : y, n.push(d(i, {
        class: r,
        d: "M801.202 245.553h155.428v688.323h-155.428v-688.323z",
        fill: a
      }, 1)), a = "", a += !b || 5 > m ? x : y, n.push(d(i, {
        class: r,
        d: "M1023.242 90.125h155.427v843.75h-155.428v-843.75z",
        fill: a
      }, 1)), b || n.push(d(i, {
        fill: _,
        d: "M301.188 81.702l83.042 82.935-251.446 252.884-83.042-82.935z"
      }, 1), d(i, {
        fill: _,
        d: "M47.262 160.271l78.843-78.265L381.75 334.009l-78.842 78.264z"
      }, 1)), o = [d("svg", {
        viewBox: "0 0 1294 1024",
        class: "rd-cG rd-d7",
        style: `left:${h}${e};top:${c}${e};width:${p}${e};height:${u}${e};opacity:${g};transform:rotate(${f}deg);` +
          s($)
      }, n)], d(l, 0, o)
    },
    assign(t) {
      var e;
      let {
        props: r
      } = t, {
        bind: i
      } = r;
      if (i._data && (null === (e = i.fields) || void 0 === e ? void 0 : e.length)) {
        let t = i._data;
        d(t) && (t = t[0]);
        let e = i.fields[0];
        (null == e ? void 0 : e.key) && (r.connected = null == t ? void 0 : t[e.key]);
        let s = i.fields[1];
        (null == s ? void 0 : s.key) && (r.strength = null == t ? void 0 : t[s.key])
      }
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/speaker/5r", ["5u"], (t => {
  let e = t("5u"),
    r = "path",
    i = "rd-dF",
    {
      View: s,
      isArray: d
    } = e;
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: s
         }, d, l) {
      let o, a, n, h = t.x,
        c = t.y,
        p = t.width,
        u = t.height,
        f = t.alpha,
        g = t.rotate,
        b = t.fill,
        $ = t.muted,
        m = t.animations,
        y = t.volume,
        x = t.background,
        _ = t.vcolor,
        w = t.mutedcolor;
      return n = [], n.push(d(r, {
        fill: b,
        d: "M213.34 341.34L426.68 128v768L213.34 682.66H128q-53.002 0-90.501-37.499T0 554.66v-83.661q0-53.002 37.499-91.34T128 341.318h85.34zm128 348.652V332.329l-92.672 94.33H128q-17.326 0-30.003 13.17t-12.677 31.17v83.66q0 17.675 12.492 30.168t30.168 12.493h120.668z"
      }, 1)), $ ? n.push(d(r, {
        fill: w,
        d: "M537 609.9l248.8-248.8c15.7-15.7 41.3-15.7 57 0 15.7 15.7 15.7 41.3 0 57L594 666.9c-15.7 15.7-41.3 15.7-57 0-15.7-15.6-15.7-41.3 0-57z"
      }, 1), d(r, {
        fill: w,
        d: "M594 361.1l248.8 248.8c15.7 15.7 15.7 41.3 0 57-15.7 15.7-41.3 15.7-57 0L537 418.1c-15.7-15.7-15.7-41.3 0-57 15.7-15.7 41.3-15.7 57 0z"
      }, 1)) : (a = "", a += 1 > y ? x : _, n.push(d(r, {
        class: i,
        d: "M619.991 369.664q12.329 0 23.163 7.004t16.159 19.006q23.326 56.34 23.326 116.326 0 61.01-23.326 115.671-4.997 12.001-15.831 19.17t-23.491 7.167q-15.667 0-29.163-11.837t-13.497-30.843q0-7.66 3.338-16.67Q597.34 555.314 597.34 512q0-43.008-16.67-83.005-3.339-7.66-3.339-16.671 0-19.006 12.841-30.843t29.84-11.837z",
        fill: a
      }, 1)), a = "", a += 2 > y ? x : _, n.push(d(r, {
        class: i,
        d: "M750.326 250.675q24.002 0 36.659 20.992 32.993 55.01 49.009 113.664Q853.32 448 853.32 512q0 63.672-17.326 126.996-16.343 59.331-49.009 113.664-12.329 20.665-36.66 20.665-16.67 0-29.675-12.001t-13.005-30.659q0-11.674 6.329-21.996 26.01-43.335 39.67-92.672Q767.98 566.006 767.98 512q0-53.658-14.336-103.67-13.66-49.336-39.67-93-6.329-9.666-6.329-21.667 0-18.002 13.17-30.495t29.49-12.493z",
        fill: a
      }, 1)), a = "", a += 3 > y ? x : _, n.push(d(r, {
        class: i,
        d: "M877.998 133.673q23 0 35.328 18.657 54.334 79.667 82.494 171.336T1023.98 512t-28.16 188.334-82.494 171.336q-12.001 18.657-35.328 18.657-17.326 0-29.84-12.001t-12.492-30.659q0-13.332 7.332-24.002Q938.66 683.335 938.66 512q0-84.009-24.33-163.328t-71.332-148.337q-7.332-10.67-7.332-24.002 0-18.657 12.493-30.659t29.84-12.001z",
        fill: a
      }, 1))), o = [d("svg", {
        viewBox: "0 0 1024 1024",
        class: "rd-cG rd-d7",
        style: `left:${h}${e};top:${c}${e};width:${p}${e};height:${u}${e};opacity:${f};transform:rotate(${g}deg);` +
          s(m)
      }, n)], d(l, 0, o)
    },
    assign(t) {
      var e;
      let {
        props: r
      } = t, {
        bind: i
      } = r;
      if (i._data && (null === (e = i.fields) || void 0 === e ? void 0 : e.length)) {
        let t = i._data;
        d(t) && (t = t[0]);
        let e = i.fields[0];
        (null == e ? void 0 : e.key) && (r.muted = null == t ? void 0 : t[e.key]);
        let s = i.fields[1];
        (null == s ? void 0 : s.key) && (r.volume = null == t ? void 0 : t[s.key])
      }
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/rstar/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      PI: i,
      sin: s,
      cos: d
    } = Math,
    {
      MAX_VALUE: l
    } = Number;
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           path: i
         }, s, d) {
      let l, o, a = t.x,
        n = t.y,
        h = t.width,
        c = t.height,
        p = t.rotate,
        u = t.fillcolor,
        f = t.animations;
      return o = [s("path", {
        d: i,
        style: `fill:${u||"none"};stroke:${t.color};stroke-width:${t.linewidth}${e};opacity:` +
          t.alpha,
        "stroke-dasharray": t.dash + e,
        "stroke-linejoin": t.linejoin,
        "stroke-linecap": t.cap && "round"
      }, 1)], l = [s("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${a}${e};top:${n}${e};width:${h}${e};height:${c}${e};transform:rotate(${p}deg);` +
          r(f)
      }, o)], s(d, 0, l)
    },
    assign(t) {
      let {
        props: e,
        unit: o
      } = t, a = i / 180, n = r.bU(e.width) / 2, h = n * (1 - e.mod1Y), c = e.corner, p = 360 /
        c, u = p / 2 - 90, f = [];
      for (let t = 0; t < c; t++) f.push(n + n * d((t * p - 90) * a), n + n * s((t * p - 90) *
        a), n + h * d((u + t * p) * a), n + h * s((u + t * p) * a));
      let {
        h: g,
        v: b
      } = (t => {
        let e = -l,
          r = e,
          i = l,
          s = i;
        for (let d = 0; d < t.length; d += 2) {
          let l = t[d],
            o = t[d + 1];
          l > e && (e = l), l < s && (s = l), o > r && (r = o), o < i && (i = o)
        }
        return {
          h: s + (e - s) / 2,
          v: i + (r - i) / 2
        }
      })(f);
      g = n - g, b = n - b;
      let $ = "M";
      for (let t = 0; t < f.length; t += 2) {
        "M" != $ && ($ += "L"), $ += f[t] + g + " " + (f[t + 1] + b)
      }
      $ += "Z", this.set({
        unit: o,
        props: e,
        path: $
      })
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/rpie/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      PI: i,
      cos: s,
      sin: d
    } = Math;
  return e.View.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           startX: i,
           toPx: s,
           startY: d,
           big: l,
           endX: o,
           endY: a,
           cx: n,
           cy: h
         }, c, p) {
      let u, f, g = t.x,
        b = t.y,
        $ = t.width,
        m = t.height,
        y = t.rotate,
        x = t.rx,
        _ = t.ry,
        w = t.linejoin,
        k = t.animations,
        v = t.fillcolor,
        L = t.color,
        F = t.linewidth,
        S = t.alpha,
        C = t.cap,
        H = t.dash;
      return f = [c("path", {
        d: `M${i-s(g)} ${d-s(b)}A${s(x)} ${s(_)} 0 ${l?1:0} 1 ${o-s(g)} ${a-s(b)}L${n} ${h}z`,
        style: `fill:${v||"none"};stroke:${L};stroke-width:${F}${e};opacity:` +
          S,
        "stroke-dasharray": H + e,
        "stroke-linecap": C && "round",
        "stroke-linejoin": w
      }, 1)], u = [c("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${g}${e};top:${b}${e};width:${$}${e};height:${m}${e};transform:rotate(${y}deg);` +
          r(k)
      }, f)], c(p, 0, u)
    },
    init() {
      this.set({
        toPx: r.bU
      })
    },
    assign(t) {
      let {
        props: e,
        unit: l
      } = t, {
        startAngle: o,
        endAngle: a,
        rx: n,
        ry: h,
        centerX: c,
        centerY: p,
        mod1X: u,
        mod1Y: f
      } = e;
      n = r.bU(n), h = r.bU(h), c = r.bU(c), p = r.bU(p), a < o && ([a, o] = [o, a]);
      let g = a - o;
      g > 360 && (o += 360, g = a - o);
      let b = g >= 180,
        $ = i / 180,
        m = c + n * s(o * $),
        y = p + h * d(o * $),
        x = c + n * s(a * $),
        _ = p + h * d(a * $),
        w = 2 * n * u,
        k = 2 * h * f;
      this.set(t, {
        unit: l,
        big: b,
        cx: w,
        cy: k,
        startX: m,
        startY: y,
        endX: x,
        endY: _
      })
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/tank/5r", ["5u", "../../../5s/60", "../../../66/6a/fx"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    i = t("../../../66/6a/fx"),
    s = "path",
    {
      node: d,
      View: l,
      isArray: o
    } = e;
  return l.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           path2: i,
           path1: d
         }, l, o) {
      let a, n, h = t.x,
        c = t.y,
        p = t.width,
        u = t.height,
        f = t.alpha,
        g = t.rotate,
        b = t.animations,
        $ = t.wallWidth,
        m = t.wallColor,
        y = t.liquidColor;
      return n = [l(s, {
        d: i,
        id: "_rd_" + o,
        style: "fill:" + y
      }, 1), l(s, {
        d: d,
        style: `fill:none;stroke-width:${$}${e};stroke:${m};stroke-linejoin:round`
      }, 1)], a = [l("svg", {
        class: "rd-cG rd-d7 rd-dT",
        style: `left:${h}${e};top:${c}${e};width:${p}${e};height:${u}${e};opacity:${f};transform:rotate(${g}deg);` +
          r(b)
      }, n)], l(o, 0, a)
    },
    init() {
      let t = new i(200, (t => {
        this._ii = t(this._ij, this._ik);
        let e = this._il,
          r = this._im,
          i = r - r * this._ii / 100,
          s = `M0 ${i}L0,${r}L${e},${r}L${e},${i}`;
        d(`_rd_${this.id}`).setAttribute("d", s)
      }));
      this._gg = t, this.on("destroy", (() => {
        t._fm()
      }))
    },
    assign(t) {
      var e, i, s;
      let {
        props: d,
        unit: l
      } = t, {
        width: a,
        height: n,
        level: h,
        bind: c
      } = d;
      if (c._data && (null === (e = c.fields) || void 0 === e ? void 0 : e.length)) {
        let t = c._data,
          e = c.fields[0];
        o(t) && (t = t[0]), h = +(null == t ? void 0 : t[e.key])
      }
      isNaN(h) && (h = 0), this._gg._fm();
      let p = r.bU(a),
        u = r.bU(n);
      this._il = p, this._im = u, this._ij = null !== (s = null !== (i = this._ii) && void 0 !==
      i ? i : this._ik) && void 0 !== s ? s : 0, this._ik = h;
      let f = `M0,0L0,${u}L${p},${u}L${p},0`,
        g = u - u * this._ij / 100,
        b = `M0 ${g}L0,${u}L${p},${u}L${p},${g}`;
      this.set({
        unit: l,
        props: d,
        path1: f,
        path2: b
      })
    },
    async render() {
      await this.digest(), this._ij != this._ik && this._gg._gi()
    }
  })
})), s.d("6o/svg/star/5r", ["5u", "../../../5s/60", "../../../5s/62"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    i = t("../../../5s/62"),
    {
      State: s,
      View: d
    } = e;
  return d.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           path: i
         }, s, d) {
      let l, o, a = t.x,
        n = t.y,
        h = t.width,
        c = t.height,
        p = t.rotate,
        u = t.animations;
      return o = [s("path", {
        d: i,
        style: `fill:${t.fillcolor||"none"};stroke:${t.color};stroke-width:${t.linewidth}${e};opacity:` +
          t.alpha,
        "stroke-dasharray": t.dash + e,
        "stroke-linecap": t.cap && "round",
        "stroke-linejoin": t.linejoin
      }, 1)], l = [s("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${a}${e};top:${n}${e};width:${h}${e};height:${c}${e};transform:rotate(${p}deg);` +
          r(u)
      }, o)], s(d, 0, l)
    },
    assign(t) {
      let {
        props: e,
        unit: d
      } = t, l = (t => {
        let e = s.get("bZ") || 0,
          d = s.get("b0") || 0,
          l = i.bU(t),
          o = 0,
          a = [];
        for (let i of l) a.push(o ? "L" : "M"), o = 1, a.push(
          `${r.bU(t[i+"X"]-t.x+e)} ${r.bU(t[i+"Y"]-t.y+d)}`);
        return a.push("z"), a.join("")
      })(e);
      this.set({
        unit: d,
        props: e,
        path: l
      })
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/wifi/5r", ["5u"], (t => {
  let e = t("5u"),
    r = "rd-dF",
    i = "path",
    {
      isArray: s,
      View: d
    } = e;
  return d.extend({
    tmpl({
           props: t,
           unit: e,
           am: s
         }, d, l) {
      let o, a, n, h = t.x,
        c = t.y,
        p = t.width,
        u = t.height,
        f = t.alpha,
        g = t.rotate,
        b = t.animations,
        $ = t.connected,
        m = t.strength,
        y = t.fill,
        x = t.background,
        _ = t.disconnect;
      return n = [], a = "", a += !$ || 3 > m ? x : y, n.push(d(i, {
        class: r,
        d: "M512.2 192c-159.8 0-311.4 59.8-427.8 168.2l-20.4 19 19.8 19.6 64.6 64 18.6 18.4 19.2-17.6c89-81.8 204.6-127 325.6-127 121 0 236.8 45.2 325.6 127l19.2 17.6 18.6-18.4 64.6-64 19.8-19.6-20.4-19C823.2 251.8 671.4 192 512.2 192z",
        fill: a
      }, 1)), a = "", a += !$ || 2 > m ? x : y, n.push(d(i, {
        class: r,
        d: "M794.8 512.8C717.2 442.6 617 404 512.6 404h-17.8l-.2.4c-98.4 4-192 42.2-265.2 108.4l-21 19 20.2 20 65.4 64.8 18.2 18 19.2-16.8c50.6-44.4 114.8-69 180.6-69 66.2 0 130.4 24.6 181 69l19.2 16.8 18.2-18 65.4-64.8 20.2-20-21.2-19z",
        fill: a
      }, 1)), a = "", a += !$ || 1 > m ? x : y, n.push(d(i, {
        class: r,
        d: "M512.4 832l19.2-19 105.6-104.4 21.2-21-23.2-19c-30.8-22.8-64.8-40-123-40-58 0-89.8 18.8-123 40l-23 19 21.2 21L493 813l19.4 19z",
        fill: a
      }, 1)), $ || n.push(d(i, {
        fill: _,
        d: "M513.067 170.667c34.133 0 64 29.866 64 64v298.666c0 34.134-29.867 64-64 64s-64-29.866-64-64V234.667c0-34.134 29.866-64 64-64zM449.067 682.667a64 64 0 1 0 128 0 64 64 0 1 0-128 0z"
      }, 1)), o = [d("svg", {
        viewBox: "0 0 1024 1024",
        class: "rd-cG rd-d7",
        style: `left:${h}${e};top:${c}${e};width:${p}${e};height:${u}${e};opacity:${f};transform:rotate(${g}deg);` +
          s(b)
      }, n)], d(l, 0, o)
    },
    assign(t) {
      var e;
      let {
        props: r
      } = t, {
        bind: i
      } = r;
      if (i._data && (null === (e = i.fields) || void 0 === e ? void 0 : e.length)) {
        let t = i._data;
        s(t) && (t = t[0]);
        let e = i.fields[0];
        (null == e ? void 0 : e.key) && (r.connected = null == t ? void 0 : t[e.key]);
        let d = i.fields[1];
        (null == d ? void 0 : d.key) && (r.strength = null == t ? void 0 : t[d.key])
      }
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6o/svg/triangle/5r", ["5u", "../../../5s/60"], (t => {
  let e = t("5u"),
    r = t("../../../5s/60"),
    {
      State: i,
      View: s
    } = e;
  return s.extend({
    tmpl({
           props: t,
           unit: e,
           am: r,
           toPx: i,
           ox: s,
           oy: d
         }, l, o) {
      let a, n, h = t.x,
        c = t.y,
        p = t.width,
        u = t.height,
        f = t.animations,
        g = t.ctrl1X,
        b = t.ctrl1Y,
        $ = t.ctrl2X,
        m = t.ctrl2Y,
        y = t.ctrl3X,
        x = t.ctrl3Y,
        _ = t.linejoin,
        w = t.fillcolor,
        k = t.color,
        v = t.linewidth,
        L = t.alpha,
        F = t.dash,
        S = t.cap;
      return n = [l("path", {
        d: `M${i(g-h+s)} ${i(b-c+d)}L${i($-h+s)} ${i(m-c+d)}L${i(y-h+s)} ${i(x-c+d)}Z`,
        style: `fill:${w||"none"};stroke:${k};stroke-width:${v}${e};opacity:` +
          L,
        "stroke-dasharray": F + e,
        "stroke-linecap": S && "round",
        "stroke-linejoin": _
      }, 1)], a = [l("svg", {
        class: "rd-dT rd-cG rd-d7",
        style: `left:${h}${e};top:${c}${e};width:${p}${e};height:${u}${e};` + r(
          f)
      }, n)], l(o, 0, a)
    },
    init() {
      this.set({
        toPx: r.bU,
        ox: i.get("bZ") || 0,
        oy: i.get("b0") || 0
      })
    },
    assign(t) {
      this.set(t)
    },
    render() {
      this.digest()
    }
  })
})), s.d("6c/barcode", ["5u", "./9s"], (t => {
  let e = t("5u"),
    r = t("./9s"),
    {
      config: i
    } = e,
    s = i("providers"),
    d = [((null == s ? void 0 : s.barcode) || "//unpkg.com/jsbarcode@3.11.5/dist/") +
    "JsBarcode.all.js"];
  return {
    _dd: [{
      value: "CODE128",
      text: "CODE128"
    }, {
      value: "CODE128A",
      text: "CODE128A"
    }, {
      value: "CODE128B",
      text: "CODE128B"
    }, {
      value: "CODE128C",
      text: "CODE128C"
    }, {
      value: "CODE39",
      text: "CODE39"
    }, {
      value: "EAN2",
      text: "EAN2"
    }, {
      value: "EAN5",
      text: "EAN5"
    }, {
      value: "EAN8",
      text: "EAN8"
    }, {
      value: "EAN13",
      text: "EAN13"
    }, {
      value: "ITF",
      text: "ITF"
    }, {
      value: "ITF14",
      text: "ITF14"
    }, {
      value: "MSI",
      text: "MSI"
    }, {
      value: "MSI10",
      text: "MSI10"
    }, {
      value: "MSI11",
      text: "MSI11"
    }, {
      value: "MSI1010",
      text: "MSI1010"
    }, {
      value: "MSI1110",
      text: "MSI1110"
    }, {
      value: "UPC",
      text: "UPC"
    }, {
      value: "UPCE",
      text: "UPCE"
    }, {
      value: "upce",
      text: "UPC-E"
    }, {
      value: "codabar",
      text: "codabar"
    }, {
      value: "pharmacode",
      text: "pharmacode"
    }, {
      value: "GenericBarcode",
      text: "GenericBarcode"
    }],
    _fO: [{
      text: "mI",
      value: "img"
    }, {
      text: "mJ",
      value: "svg"
    }],
    _fP: [{
      text: "io",
      value: "full"
    }, {
      text: "in",
      value: "auto"
    }],
    _fQ: [{
      text: "jA",
      value: "top"
    }, {
      text: "jC",
      value: "bottom"
    }],
    _fR: {
      bold: 1,
      italic: 1
    },
    _fX: () => r("JsBarcode", d)
  }
})), s.d("6c/bwip", ["5u", "./9s"], (t => {
  let e, r = t("5u"),
    i = t("./9s"),
    {
      config: s,
      has: d
    } = r,
    l = s("providers"),
    o = [((null == l ? void 0 : l.bwip) || "//unpkg.com/bwip-js@3.1.0/dist/") + "bwip-js-min.js"],
    a = (t, e) => {
      var r, i, s, d, l, o = 0,
        a = 0,
        n = 0,
        h = 0,
        c = 0,
        p = 0,
        u = "",
        f = {},
        g = .55183475;
      return {
        scale(t, e) {},
        clip() {},
        unclip() {},
        measure(t, r, i, s) {
          i |= 0, s |= 0;
          for (var d = e.lookup(r), l = 0, o = 0, a = 0, n = 0; n < t.length; n++) {
            var h = t.charCodeAt(n),
              c = e.getpaths(d, h, i, s);
            c && (o = Math.max(o, c.ascent), a = Math.max(a, -c.descent), l += c.advance)
          }
          return {
            width: l,
            ascent: o,
            descent: a
          }
        },
        init(e, r) {
          var f = t.paddingleft,
            g = t.paddingright,
            b = t.paddingtop,
            $ = t.paddingbottom,
            m = t.rotate || "N";
          switch (e += f + g, r += b + $, m) {
            case "R":
              a = -1, n = 1, h = 1;
              break;
            case "I":
              o = -1, n = 1, c = -1, p = 1;
              break;
            case "L":
              a = 1, h = -1, p = 1;
              break;
            default:
              o = c = 1
          }
          var y = "L" == m || "R" == m;
          i = y ? r : e, s = y ? e : r, d = f, l = b, u = ""
        },
        line(t, e, r, i, s, d) {
          t |= 0, e |= 0, r |= 0, i |= 0, 1 & (s = Math.round(s)) && (t == r && (t += .5, r += .5),
          e == i && (e += .5, i += .5));
          var l = s + "#" + d;
          f[l] || (f[l] = '<path stroke="#' + d + '" stroke-width="' + s + '" d="'), f[l] += "M" +
            b(t, e) + "L" + b(r, i)
        },
        polygon(t) {
          r || (r = '<path d="'), r += "M" + b(t[0][0], t[0][1]);
          for (var e = 1, i = t.length; e < i; e++) {
            var s = t[e];
            r += "L" + b(s[0], s[1])
          }
          r += "Z"
        },
        hexagon(t) {
          this.polygon(t)
        },
        ellipse(t, e, i, s, d) {
          r || (r = '<path d="');
          var l = i * g,
            o = s * g;
          r += "M" + b(t - i, e) + "C" + b(t - i, e - o) + " " + b(t - l, e - s) + " " + b(t, e -
              s) + "C" + b(t + l, e - s) + " " + b(t + i, e - o) + " " + b(t + i, e) + "C" +
            b(t + i, e + o) + " " + b(t + l, e + s) + " " + b(t, e + s) + "C" + b(t - l, e + s) +
            " " + b(t - i, e + o) + " " + b(t - i, e) + "Z"
        },
        fill(t) {
          r && (u += r + '" fill="#' + t + '" fill-rule="evenodd" />', r = null)
        },
        text(t, r, i, s, d) {
          for (var l = e.lookup(d.name), o = 0 | d.width, a = 0 | d.height, n = 0 | d.dx, h = "",
                 c = 0; c < i.length; c++) {
            var p = i.charCodeAt(c),
              f = e.getpaths(l, p, o, a);
            if (f) {
              if (f.length) {
                for (var g = 0, $ = f.length; g < $; g++) {
                  let e = f[g];
                  "M" == e.type || "L" == e.type ? h += e.type + b(e.x + t, r - e.y) :
                    "Q" == e.type ? h += e.type + b(e.cx + t, r - e.cy) + " " + b(e.x +
                      t, r - e.y) : "C" == e.type && (h += e.type + b(e.cx1 + t, r -
                      e.cy1) + " " + b(e.cx2 + t, r - e.cy2) + " " + b(e.x + t, r -
                      e.y))
                }
                h += "Z"
              }
              t += f.advance + n
            }
          }
          h && (u += '<path d="' + h + '" fill="#' + s + '" />')
        },
        end() {
          var e = "";
          for (var r in f) e += f[r] + '" />';
          var d = t.backgroundcolor;
          return '<svg style="width:100%;height:100%" viewBox="0 0 ' + i + " " + s + '">' + (
            /^[0-9A-Fa-f]{6}$/.test(d) ? '<rect width="100%" height="100%" fill="#' + d +
              '" />' : "") + e + u + "</svg>"
        }
      };
      function b(t, e) {
        var r = o * (t += d) + a * (e += l) + n * (i - 1) + 0 * (s - 1),
          u = h * t + c * e + 0 * (i - 1) + p * (s - 1);
        return ((0 | r) == r ? r : r.toFixed(2)) + " " + ((0 | u) == u ? u : u.toFixed(2))
      }
    },
    n = /\s+/;
  return {
    _dd: [{
      value: "ean5",
      text: "EAN-5 (5 digit addon)",
      fill: "90200",
      opts: "includetext guardwhitespace"
    }, {
      value: "ean2",
      text: "EAN-2 (2 digit addon)",
      fill: "05",
      opts: "includetext guardwhitespace"
    }, {
      value: "ean13",
      text: "EAN-13",
      fill: "2112345678900",
      opts: "includetext guardwhitespace"
    }, {
      value: "ean8",
      text: "EAN-8",
      fill: "02345673",
      opts: "includetext guardwhitespace"
    }, {
      value: "upca",
      text: "UPC-A",
      fill: "416000336108",
      opts: "includetext"
    }, {
      value: "upce",
      text: "UPC-E",
      fill: "00123457",
      opts: "includetext"
    }, {
      value: "isbn",
      text: "ISBN",
      fill: "978-1-56581-231-4 90000",
      opts: "includetext guardwhitespace"
    }, {
      value: "ismn",
      text: "ISMN",
      fill: "979-0-2605-3211-3",
      opts: "includetext guardwhitespace"
    }, {
      value: "issn",
      text: "ISSN",
      fill: "0311-175X 00 17",
      opts: "includetext guardwhitespace"
    }, {
      value: "code128",
      text: "Code 128",
      fill: "Count01234567!",
      opts: "includetext"
    }, {
      value: "gs1-128",
      text: "GS1-128",
      fill: "(01)95012345678903(3103)000123",
      opts: "includetext"
    }, {
      value: "ean14",
      text: "GS1-14",
      fill: "(01) 0 46 01234 56789 3",
      opts: "includetext"
    }, {
      value: "sscc18",
      text: "SSCC-18",
      fill: "(00) 0 0614141 123456789 0",
      opts: "includetext"
    }, {
      value: "code39",
      text: "Code 39",
      fill: "THIS IS CODE 39",
      opts: "includetext includecheck includecheckintext"
    }, {
      value: "code39ext",
      text: "Code 39 Extended",
      fill: "Code39 Ext!",
      opts: "includetext includecheck includecheckintext"
    }, {
      value: "code32",
      text: "Italian Pharmacode",
      fill: "01234567",
      opts: "includetext"
    }, {
      value: "pzn",
      text: "Pharmazentralnummer (PZN)",
      fill: "123456",
      opts: "includetext"
    }, {
      value: "code93",
      text: "Code 93",
      fill: "THIS IS CODE 93",
      opts: "includetext includecheck"
    }, {
      value: "code93ext",
      text: "Code 93 Extended",
      fill: "Code93 Ext!",
      opts: "includetext includecheck"
    }, {
      value: "interleaved2of5",
      text: "Interleaved 2 of 5 (ITF)",
      fill: "2401234567",
      opts: "height=12 includecheck includetext includecheckintext"
    }, {
      value: "itf14",
      text: "ITF-14",
      fill: "0 46 01234 56789 3",
      opts: "includetext"
    }, {
      value: "identcode",
      text: "Deutsche Post Identcode",
      fill: "563102430313",
      opts: "includetext"
    }, {
      value: "leitcode",
      text: "Deutsche Post Leitcode",
      fill: "21348075016401",
      opts: "includetext"
    }, {
      value: "databaromni",
      text: "GS1 DataBar Omnidirectional",
      fill: "(01)24012345678905"
    }, {
      value: "databarstacked",
      text: "GS1 DataBar Stacked",
      fill: "(01)24012345678905"
    }, {
      value: "databarstackedomni",
      text: "GS1 DataBar Stacked Omnidirectional",
      fill: "(01)24012345678905"
    }, {
      value: "databartruncated",
      text: "GS1 DataBar Truncated",
      fill: "(01)24012345678905"
    }, {
      value: "databarlimited",
      text: "GS1 DataBar Limited",
      fill: "(01)15012345678907"
    }, {
      value: "databarexpanded",
      text: "GS1 DataBar Expanded",
      fill: "(01)95012345678903(3103)000123"
    }, {
      value: "databarexpandedstacked",
      text: "GS1 DataBar Expanded Stacked",
      fill: "(01)95012345678903(3103)000123",
      opts: "segments=4"
    }, {
      value: "gs1northamericancoupon",
      text: "GS1 North American Coupon",
      fill: "(8110)106141416543213500110000310123196000",
      opts: "includetext segments=8"
    }, {
      value: "pharmacode",
      text: "Pharmaceutical Binary Code",
      fill: "117480",
      opts: "showborder"
    }, {
      value: "pharmacode2",
      text: "Two-track Pharmacode",
      fill: "117480",
      opts: "includetext showborder"
    }, {
      value: "code2of5",
      text: "Code 25",
      fill: "01234567",
      opts: "includetext includecheck includecheckintext"
    }, {
      value: "industrial2of5",
      text: "Industrial 2 of 5",
      fill: "01234567",
      opts: "includetext includecheck includecheckintext"
    }, {
      value: "iata2of5",
      text: "IATA 2 of 5",
      fill: "01234567",
      opts: "includetext includecheck includecheckintext"
    }, {
      value: "matrix2of5",
      text: "Matrix 2 of 5",
      fill: "01234567",
      opts: "includetext includecheck includecheckintext"
    }, {
      value: "coop2of5",
      text: "COOP 2 of 5",
      fill: "01234567",
      opts: "includetext includecheck includecheckintext"
    }, {
      value: "datalogic2of5",
      text: "Datalogic 2 of 5",
      fill: "01234567",
      opts: "includetext includecheck includecheckintext"
    }, {
      value: "code11",
      text: "Code 11",
      fill: "0123456789",
      opts: "includetext includecheck includecheckintext"
    }, {
      value: "bc412",
      text: "BC412",
      fill: "BC412",
      opts: "semi includetext includecheckintext"
    }, {
      value: "rationalizedCodabar",
      text: "Codabar",
      fill: "A0123456789B",
      opts: "includetext includecheck includecheckintext"
    }, {
      value: "onecode",
      text: "USPS Intelligent Mail",
      fill: "0123456709498765432101234567891",
      opts: "barcolor=FF0000"
    }, {
      value: "postnet",
      text: "USPS POSTNET",
      fill: "01234",
      opts: "includetext includecheckintext"
    }, {
      value: "planet",
      text: "USPS PLANET",
      fill: "01234567890",
      opts: "includetext includecheckintext"
    }, {
      value: "royalmail",
      text: "Royal Mail 4 State Customer Code",
      fill: "LE28HS9Z",
      opts: "includetext barcolor=FF0000"
    }, {
      value: "auspost",
      text: "AusPost 4 State Customer Code",
      fill: "5956439111ABA 9",
      opts: "includetext custinfoenc=character"
    }, {
      value: "kix",
      text: "Royal Dutch TPG Post KIX",
      fill: "1231FZ13XHS",
      opts: "includetext"
    }, {
      value: "japanpost",
      text: "Japan Post 4 State Customer Code",
      fill: "6540123789-A-K-Z",
      opts: "includetext includecheckintext"
    }, {
      value: "msi",
      text: "MSI Modified Plessey",
      fill: "0123456789",
      opts: "includetext includecheck includecheckintext"
    }, {
      value: "plessey",
      text: "Plessey UK",
      fill: "01234ABCD",
      opts: "includetext includecheckintext"
    }, {
      value: "telepen",
      text: "Telepen",
      fill: "ABCDEF",
      opts: "includetext"
    }, {
      value: "telepennumeric",
      text: "Telepen Numeric",
      fill: "01234567",
      opts: "includetext"
    }, {
      value: "posicode",
      text: "PosiCode",
      fill: "ABC123",
      opts: "version=b inkspread=-0.5 parsefnc includetext"
    }, {
      value: "codablockf",
      text: "Codablock F",
      fill: "CODABLOCK F 34567890123456789010040digit",
      opts: "columns=8"
    }, {
      value: "code16k",
      text: "Code 16K",
      fill: "Abcd-1234567890-wxyZ"
    }, {
      value: "code49",
      text: "Code 49",
      fill: "MULTIPLE ROWS IN CODE 49"
    }, {
      value: "channelcode",
      text: "Channel Code",
      fill: "3493",
      opts: "height=12 includetext"
    }, {
      value: "flattermarken",
      text: "Flattermarken",
      fill: "11099",
      opts: "inkspread=-0.25 showborder borderleft=0 borderright=0"
    }, {
      value: "raw",
      text: "Custom 1D symbology",
      fill: "331132131313411122131311333213114131131221323",
      opts: "height=12"
    }, {
      value: "daft",
      text: "Custom 4 state symbology",
      fill: "FATDAFTDAD"
    }, {
      value: "symbol",
      text: "Miscellaneous symbols",
      fill: "fima",
      opts: "backgroundcolor=DD000011"
    }, {
      value: "pdf417",
      text: "PDF417",
      fill: "This is PDF417",
      opts: "columns=2"
    }, {
      value: "pdf417compact",
      text: "Compact PDF417",
      fill: "This is compact PDF417",
      opts: "columns=2"
    }, {
      value: "micropdf417",
      text: "MicroPDF417",
      fill: "MicroPDF417"
    }, {
      value: "datamatrix",
      text: "Data Matrix",
      fill: "This is Data Matrix!"
    }, {
      value: "datamatrixrectangular",
      text: "Data Matrix Rectangular",
      fill: "1234"
    }, {
      value: "datamatrixrectangularextension",
      text: "Data Matrix Rectangular Extension",
      fill: "1234",
      opts: "version=8x96"
    }, {
      value: "mailmark",
      text: "Royal Mail Mailmark",
      fill: "JGB 012100123412345678AB19XY1A 0             www.xyz.com",
      opts: "type=29"
    }, {
      value: "qrcode",
      text: "QR Code",
      fill: "http://goo.gl/0bis",
      opts: "eclevel=M"
    }, {
      value: "swissqrcode",
      text: "Swiss QR Code",
      fill: ""
    }, {
      value: "microqrcode",
      text: "Micro QR Code",
      fill: "1234"
    }, {
      value: "rectangularmicroqrcode",
      text: "Rectangular Micro QR Code",
      fill: "1234",
      opts: "version=R17x139"
    }, {
      value: "maxicode",
      text: "MaxiCode",
      fill: "[)>^03001^02996152382802^029840^029001^0291Z00004951^029UPSN^02906X610^029159^0291234567^0291/1^029^029Y^029634 ALPHA DR^029PITTSBURGH^029PA^029^004",
      opts: "mode=2 parse"
    }, {
      value: "azteccode",
      text: "Aztec Code",
      fill: "This is Aztec Code",
      opts: "format=full"
    }, {
      value: "azteccodecompact",
      text: "Compact Aztec Code",
      fill: "1234"
    }, {
      value: "aztecrune",
      text: "Aztec Runes",
      fill: "1"
    }, {
      value: "codeone",
      text: "Code One",
      fill: "Code One"
    }, {
      value: "hanxin",
      text: "Han Xin Code",
      fill: "This is Han Xin"
    }, {
      value: "dotcode",
      text: "DotCode",
      fill: "This is DotCode",
      opts: "inkspread=0.16"
    }, {
      value: "ultracode",
      text: "Ultracode",
      fill: "Awesome colours!",
      opts: "eclevel=EC2"
    }, {
      value: "gs1-cc",
      text: "GS1 Composite 2D Component",
      fill: "(01)95012345678903(3103)000123",
      opts: "ccversion=b cccolumns=4"
    }, {
      value: "ean13composite",
      text: "EAN-13 Composite",
      fill: "2112345678900|(99)1234-abcd",
      opts: "includetext"
    }, {
      value: "ean8composite",
      text: "EAN-8 Composite",
      fill: "02345673|(21)A12345678",
      opts: "includetext"
    }, {
      value: "upcacomposite",
      text: "UPC-A Composite",
      fill: "416000336108|(99)1234-abcd",
      opts: "includetext"
    }, {
      value: "upcecomposite",
      text: "UPC-E Composite",
      fill: "00123457|(15)021231",
      opts: "includetext"
    }, {
      value: "databaromnicomposite",
      text: "GS1 DataBar Omnidirectional Composite",
      fill: "(01)03612345678904|(11)990102"
    }, {
      value: "databarstackedcomposite",
      text: "GS1 DataBar Stacked Composite",
      fill: "(01)03412345678900|(17)010200"
    }, {
      value: "databarstackedomnicomposite",
      text: "GS1 DataBar Stacked Omnidirectional Composite",
      fill: "(01)03612345678904|(11)990102"
    }, {
      value: "databartruncatedcomposite",
      text: "GS1 DataBar Truncated Composite",
      fill: "(01)03612345678904|(11)990102"
    }, {
      value: "databarlimitedcomposite",
      text: "GS1 DataBar Limited Composite",
      fill: "(01)03512345678907|(21)abcdefghijklmnopqrst"
    }, {
      value: "databarexpandedcomposite",
      text: "GS1 DataBar Expanded Composite",
      fill: "(01)93712345678904(3103)001234|(91)1A2B3C4D5E"
    }, {
      value: "databarexpandedstackedcomposite",
      text: "GS1 DataBar Expanded Stacked Composite",
      fill: "(01)00012345678905(10)ABCDEF|(21)12345678",
      opts: "segments=4"
    }, {
      value: "gs1-128composite",
      text: "GS1-128 Composite",
      fill: "(00)030123456789012340|(02)13012345678909(37)24(10)1234567ABCDEFG",
      opts: "ccversion=c"
    }, {
      value: "gs1datamatrix",
      text: "GS1 Data Matrix",
      fill: "(01)03453120000011(17)120508(10)ABCD1234(410)9501101020917"
    }, {
      value: "gs1datamatrixrectangular",
      text: "GS1 Data Matrix Rectangular",
      fill: "(01)03453120000011(17)120508(10)ABCD1234(410)9501101020917"
    }, {
      value: "gs1qrcode",
      text: "GS1 QR Code",
      fill: "(01)03453120000011(8200)http://www.abc.net(10)ABCD1234(410)9501101020917"
    }, {
      value: "gs1dotcode",
      text: "GS1 DotCode",
      fill: "(235)5vBZIF%!<B;?oa%(01)01234567890128(8008)19052001",
      opts: "rows=16"
    }, {
      value: "hibccode39",
      text: "HIBC Code 39",
      fill: "A123BJC5D6E71",
      opts: "includetext"
    }, {
      value: "hibccode128",
      text: "HIBC Code 128",
      fill: "A123BJC5D6E71",
      opts: "includetext"
    }, {
      value: "hibcdatamatrix",
      text: "HIBC Data Matrix",
      fill: "A123BJC5D6E71"
    }, {
      value: "hibcdatamatrixrectangular",
      text: "HIBC Data Matrix Rectangular",
      fill: "A123BJC5D6E71"
    }, {
      value: "hibcpdf417",
      text: "HIBC PDF417",
      fill: "A123BJC5D6E71"
    }, {
      value: "hibcmicropdf417",
      text: "HIBC MicroPDF417",
      fill: "A123BJC5D6E71"
    }, {
      value: "hibcqrcode",
      text: "HIBC QR Code",
      fill: "A123BJC5D6E71"
    }, {
      value: "hibccodablockf",
      text: "HIBC Codablock F",
      fill: "A123BJC5D6E71"
    }, {
      value: "hibcazteccode",
      text: "HIBC Aztec Code",
      fill: "A123BJC5D6E71"
    }],
    _hV: () => e,
    async _fX() {
      try {
        await i("bwipjs", o)
      } finally {
        e = 1
      }
      window.bwipjs && !bwipjs.toSVG && (bwipjs.toSVG = (t, e = "") => {
        try {
          let r = e.split(n);
          for (let e of r) {
            let [r, i] = e.split("=");
            d(t, r) || (t[r] = null == i || i)
          }
          return bwipjs.fixupOptions(t), bwipjs.render(t, a(t, bwipjs.FontLib))
        } catch (t) {
          return t.message
        }
      })
    }
  }
})), s.d("6c/chart", ["5u", "./9s"], (t => {
  let e = t("5u"),
    r = t("./9s"),
    {
      config: i
    } = e,
    s = i("providers"),
    d = [((null == s ? void 0 : s.chartjs) || "//unpkg.com/chart.js@3.9.1/dist/") + "chart.min.js"];
  return () => r("Chart", d)
})), s.d("6c/97", ["5u", "./9s"], (t => {
  let e = t("5u"),
    r = t("./9s"),
    {
      config: i
    } = e,
    s = i("providers"),
    d = [((null == s ? void 0 : s.ckeditor) || "//ckeditor.com/assets/libs/ckeditor5/35.2.0/") +
    "ckeditor.js"];
  return () => r("CKEditor", d)
})), s.d("6c/83", ["5u", "../5s/7r"], (t => {
  let e = t("5u"),
    r = t("../5s/7r"),
    i = {},
    s = {},
    d = {},
    l = {},
    {
      random: o
    } = Math,
    {
      type: a,
      isArray: n,
      config: h,
      isFunction: c,
      isObject: p,
      has: u
    } = e,
    f = {},
    g = t => {
      let e = d[t.id],
        {
          id: r,
          tag: i
        } = e,
        s = r + "~" + i,
        l = h("getBindUrl");
      return f[s] ? i = f[s] : c(l) ? (i = l(e), f[s] = i) : f[s] = i, i
    };
  return {
    _nz(t) {
      let e = g(t);
      return i[e]
    },
    _nA(t) {
      let e = g(t);
      return s[e]
    },
    _f6: (t, e) => new Promise((d => {
      let l, h = g(t),
        c = i[h];
      if (c || (c = {}, l = {}, i[h] = c, s[h] = l), c._nB) d(c);
      else if (c._nC) c._nC.push(d);
      else {
        c._nC = [d], (new r).all({
          name: "_eu",
          url: h
        }, ((t, r) => {
          let i = r.get("data");
          if (o() < .1 && n(i)) {
            let t = [];
            for (let e of i)
              if ("Object" == a(e)) {
                let r = {};
                for (let t in e) {
                  let i = e[t];
                  "Number" == a(i) ? r[t] = i + 10 * o() | 0 :
                    "String" != a(i) || i.startsWith("//") ? r[
                      t] = i : r[t] = i.substring(1)
                }
                t.push(r)
              } else t.push(e);
            i = t
          }
          l._eE = i, l._eD = null == t ? void 0 : t.message, e && (n(i) ?
            i = [] : p(i) && (i = {})), c._eE = i, c._nB = 1, c._eD =
            null == t ? void 0 : t.message;
          for (let t of c._nC) t(c);
          c._nC = null
        }))
      }
    })),
    _nD(t, e, r = "") {
      let s = i[t];
      s || (s = {}, i[t] = s), s._eE = e, s._nB = 1, s._eD = r
    },
    _bJ() {
      for (let t in i) delete i[t], delete s[t];
      for (let t in d) delete d[t]
    },
    _nE: t => u(i, t),
    _nF: g,
    _nG: t => {
      let e = d[t.id];
      return e || (d[t.id] = e = {
        id: t.id
      }), u(t, "tag") && (e.tag = t.tag), u(t, "name") && (e.name = t.name), e
    },
    _ep(t, e) {
      l._eE = t, l._eD = e
    },
    _gF: () => l
  }
})), s.d("6c/5s", ["5u", "../5s/60", "../5s/6h", "../5s/62"], (t => {
  let e = t("5u"),
    r = t("../5s/60"),
    i = t("../5s/6h"),
    s = t("../5s/62"),
    {
      Cache: d,
      config: l
    } = e,
    o = new d,
    a = {
      _cX: 1,
      fixed: () => r.cS(),
      step: () => r.bS(),
      read: s.bI,
      write: s.bN,
      type: i.b0,
      json: 1
    },
    n = {
      ...a,
      tip: "lX",
      key: "x"
    },
    h = {
      ...a,
      tip: "lY",
      key: "y"
    },
    c = (t, e) => {
      let r, s = `b${t}_${e}`;
      return o.has(s) ? r = o.get(s) : (r = {
        tip: t,
        key: e,
        type: i.b2,
        json: 1
      }, o.set(s, r)), r
    },
    p = (t, e, r = 0, s = 0) => {
      let d, l = `c${t}_${e}_${r}_${s}`;
      return o.has(l) ? d = o.get(l) : (d = {
        tip: t,
        key: e,
        alpha: r,
        clear: s,
        type: i.b1,
        json: 1
      }, o.set(l, d)), d
    },
    u = {
      tip: "k2",
      key: "alpha",
      type: i.b0,
      step: .01,
      fixed: 2,
      min: 0,
      max: 1,
      json: 1
    },
    f = {
      tip: "gw",
      type: i.b0,
      key: "rotate",
      min: -360,
      max: 360,
      json: 1
    },
    g = {
      type: i.b8
    },
    b = {
      tip: "mK",
      key: "borderdeed",
      type: i.b4,
      items: r.cO,
      json: 1
    },
    $ = {
      type: i.b8,
      _fN: ({
              bind: t
            }) => !t.id
    },
    m = {
      type: i.b8,
      _fN: () => l("getFieldUrl")
    },
    y = {
      tip: "mG",
      type: i.b4,
      key: "print",
      items: r.cP,
      json: 1
    },
    x = {
      tip: "lV",
      type: i.b9,
      key: "help"
    },
    _ = {
      tip: "mC",
      key: "link",
      type: i.b3,
      json: 1
    },
    w = {
      tip: "mz",
      key: "target",
      type: i.b4,
      json: 1,
      items: [{
        text: "mx",
        value: "tab"
      }, {
        text: "mw",
        value: "self"
      }, {
        text: "my",
        value: "win"
      }]
    },
    k = {
      ...a,
      min: 0,
      tip: "mB",
      key: "winWidth",
      _fN: ({
              target: t
            }) => "win" == t
    },
    v = {
      ...a,
      min: 0,
      tip: "mA",
      key: "winHeight",
      _fN: ({
              target: t
            }) => "win" == t
    },
    L = {
      tip: "mL",
      key: "ename",
      type: i.b6,
      json: 1
    },
    F = {
      tip: "mD",
      key: "locked",
      type: i.b2,
      free: !0,
      json: 1
    },
    S = {
      tip: "mE",
      key: "ow",
      type: i.b9
    },
    C = {
      tip: "gu",
      key: "width",
      read: s.bI,
      type: i.b7,
      json: 1
    },
    H = {
      tip: "gv",
      key: "height",
      read: s.bI,
      type: i.b7,
      json: 1
    },
    M = {
      _cX: 1,
      ...H
    },
    G = {
      key: "width",
      read: s.bI,
      json: 1
    },
    T = {
      key: "height",
      read: s.bI,
      json: 1
    },
    A = {
      ...a,
      tip: "et",
      key: "linewidth",
      min: () => 0,
      max: () => r.bF(20)
    },
    z = p("es", "color"),
    P = {
      ...a,
      tip: "mr",
      key: "dash",
      min: () => 0,
      max: () => r.bF(20)
    },
    j = c("e7", "cap"),
    I = p("fh", "fillcolor", 1, 1),
    B = c("mq", "closed"),
    D = {
      ...a,
      tip: "fn",
      key: "borderwidth",
      min: 0,
      max: () => r.bF(10)
    },
    N = {
      tip: "mv",
      key: "linejoin",
      json: 1,
      type: i.b4,
      items: [{
        text: "mt",
        value: "meter"
      }, {
        text: "ms",
        value: "bevel"
      }, {
        text: "mu",
        value: "round"
      }]
    };
  return {
    bF: [{
      key: "x",
      use: "x"
    }, {
      key: "y",
      use: "y"
    }],
    bG: n,
    bH: h,
    bI: (t = 0, e = r.bI) => {
      let i, s = `w${t}_${e}`;
      return o.has(s) ? i = o.get(s) : (i = {
        ...a,
        tip: "gu",
        key: "width",
        min: () => r.bF(t),
        max: () => r.bF(e)
      }, o.set(s, i)), i
    },
    bJ: (t = 0, e = r.bJ) => {
      let i, s = `h${t}_${e}`;
      return o.has(s) ? i = o.get(s) : (i = {
        ...a,
        tip: "gv",
        key: "height",
        min: () => r.bF(t),
        max: () => r.bF(e)
      }, o.set(s, i)), i
    },
    b5: C,
    b6: H,
    cl: M,
    b8: G,
    b9: T,
    ci: A,
    c_: z,
    ca: P,
    cb: j,
    cd: I,
    ck: B,
    bT: a,
    bK: u,
    bL: f,
    bM: g,
    bO: $,
    b0: m,
    bN: y,
    bU: S,
    bV: x,
    bW: L,
    ce: _,
    cf: w,
    cg: k,
    ch: v,
    bX: F,
    bY: {
      json: 1,
      key: "animations"
    },
    b1: (t = 1) => {
      let e, r = `b${t}`;
      return o.has(r) ? e = o.get(r) : (e = {
        tip: "en",
        key: "bind",
        type: i.ce,
        json: 1,
        max: t,
        _fN: () => l("getFieldUrl")
      }, o.set(r, e)), e
    },
    b2: (...t) => {
      let e, r = `br${t.join("-")}`;
      return o.has(r) ? e = o.get(r) : (e = {
        tip: "en",
        key: "bind",
        type: i.cN,
        json: 1,
        tips: t,
        _fN: () => l("getFieldUrl")
      }, o.set(r, e)), e
    },
    bP: c,
    bQ: p,
    bR: (t = "fontfamily") => {
      let e, s = `ff${t}`;
      return o.has(s) ? e = o.get(s) : (e = {
        tip: "fq",
        key: t,
        type: i.b4,
        items: r.cM,
        json: 1
      }, o.set(s, e)), e
    },
    cc: (t = "letterspacing") => {
      let e, r = `ls${t}`;
      return o.has(r) ? e = o.get(r) : (e = {
        ...a,
        key: t,
        tip: "k6",
        min: 0
      }, o.set(r, e)), e
    },
    bS: (t = 0, e = 0, i = "fontsize") => {
      let s, d = `fs${i}_${t}_${e}`;
      return o.has(d) ? s = o.get(d) : (s = {
        ...a,
        tip: "fp",
        min: () => r.bF(t),
        key: i
      }, e && (s.max = () => r.bF(e)), o.set(d, s)), s
    },
    bZ: {
      key: "tfs",
      _cX: 1
    },
    b4: (t = "mp") => {
      let e, s = `bt${t}`;
      return o.has(s) ? e = o.get(s) : (e = {
        tip: t,
        key: "bordertype",
        type: i.b4,
        items: r.cN,
        json: 1
      }, o.set(s, e)), e
    },
    b7: b,
    b3: D,
    cj: N
  }
})), s.d("6c/echarts", ["5u", "./9s"], (t => {
  let e = t("5u"),
    r = t("./9s"),
    {
      config: i
    } = e,
    s = i("providers"),
    d = [((null == s ? void 0 : s.echarts) || "//unpkg.com/echarts@5.4.0/dist/") + "echarts.min.js"];
  return () => r("echarts", d)
})), s.d("6c/70", ["5u", "./6d", "../6b/5r"], (t => {
  let e = t("5u"),
    r = t("./6d"),
    i = t("../6b/5r"),
    {
      Cache: s,
      toNumber: d,
      isNumber: l
    } = e,
    {
      floor: o,
      ceil: a
    } = Math,
    n = [{
      title: "\u5185\u7f6e",
      id: "builtin",
      prefix: {
        title: "\u524d\u7f00",
        custom: 1,
        list: [{
          title: "\u4eba\u6c11\u5e01",
          example: "\xa5",
          format: "\xa5"
        }, {
          title: "\u7f8e\u5143",
          example: "$",
          format: "$"
        }, {
          title: "\u6b27\u5143",
          example: "\u20ac",
          format: "\u20ac"
        }, {
          title: "\u82f1\u78c5",
          example: "\uffe1",
          format: "\uffe1"
        }, {
          title: "\u6cf0\u94e2",
          example: "\u0e3f",
          format: "\u0e3f"
        }]
      },
      postfix: {
        title: "\u540e\u7f00",
        custom: 1,
        list: [{
          title: "\u5343\u7c73",
          example: "km",
          format: "km"
        }, {
          title: "\u7c73",
          example: "m",
          format: "m"
        }, {
          title: "\u5398\u7c73",
          example: "cm",
          format: "cm"
        }, {
          title: "\u6beb\u7c73",
          example: "mm",
          format: "mm"
        }, {
          title: "\u7eb3\u7c73",
          example: "nm",
          format: "nm"
        }, {
          title: "\u5f00\u5c14\u6587",
          example: "K",
          format: "K"
        }, {
          title: "\u6444\u6c0f\u5ea6",
          example: "\u2103",
          format: "\u2103"
        }, {
          title: "\u767e\u5e15",
          example: "HPa",
          format: "HPa"
        }, {
          title: "\u5343\u5e15",
          example: "KPa",
          format: "KPa"
        }, {
          title: "\u5146\u5e15",
          example: "MPa",
          format: "MPa"
        }, {
          title: "\u5df4",
          example: "bar",
          format: "bar"
        }]
      },
      subs: [{
        title: "\u6570\u5b57",
        id: "number",
        parts: [{
          title: "\u6574\u6570",
          list: [{
            title: "\u5343\u5206\u4f4d",
            format: "#,###",
            example: "1,000"
          }, {
            title: "\u4e07\u5206\u4f4d",
            format: "#,####",
            example: "1,0000"
          }, {
            title: "\u4e07\u5206\u4f4d",
            format: "#'####",
            example: "1'0000"
          }]
        }, {
          title: "\u5c0f\u6570",
          list: [{
            title: "\u65e0\u5c0f\u6570",
            format: ".",
            example: "0"
          }, {
            title: "\u4e00\u4f4d\u5c0f\u6570",
            format: ".#",
            example: "0.1"
          }, {
            title: "\u4e24\u4f4d\u5c0f\u6570",
            format: ".##",
            example: "0.01"
          }, {
            title: "\u4e09\u4f4d\u5c0f\u6570",
            format: ".###",
            example: "0.001"
          }, {
            title: "\u56db\u4f4d\u5c0f\u6570",
            format: ".####",
            example: "0.0001"
          }]
        }]
      }, {
        title: "\u65e5\u671f",
        id: "date",
        parts: [{
          title: "\u683c\u5f0f",
          custom: 1,
          list: [{
            title: "\u5e74-\u6708-\u65e5",
            format: "YYYY-MM-DD",
            example: "2020-09-08"
          }, {
            title: "\u5e74/\u6708/\u65e5",
            format: "YYYY/MM/DD",
            example: "2020/09/08"
          }, {
            title: "\u5e74-\u6708-\u65e5 \u65f6:\u5206:\u79d2",
            format: "YYYY-MM-DD hh:mm:ss",
            example: "2020-09-08 20:00:05"
          }, {
            title: "\u5e74/\u6708/\u65e5 \u65f6:\u5206:\u79d2",
            format: "YYYY/MM/DD hh:mm:ss",
            example: "2020/09/08 20:00:05"
          }]
        }]
      }]
    }, {
      title: "\u81ea\u5b9a\u4e49",
      id: "custom",
      defaults: "/*\n    data\u662f\u6839\u636e\u6839\u636e\u5f53\u524d\u7ed1\u5b9a\u7684\u5b57\u6bb5\u53d6\u5230\u7684\u6570\u636e\n    item\u662f\u5b8c\u6574\u7684\u5355\u6761\u6570\u636e\u5bf9\u8c61\n    \u53ef\u4ee5\u628a\u4e0b\u9762\u7684console\u524d\u7684\u6ce8\u91ca\u53bb\u6389\u67e5\u770b\u76f8\u5e94\u7684\u6570\u636e\n*/\nfunction(data,item){\n    //console.log(data,item);\n    //return data+item.name;\n    return data;\n}"
    }],
    h = /d{1,4}|D{1,4}|M{1,4}|YY(?:YY)?|([Hhsmw])\1?|[aA]/g,
    c = (t, e = 3) => {
      let r = [];
      for (let i of t) r.push(i.substring(0, e));
      return r
    },
    p = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    u = ["January", "February", "March", "April", "May", "June", "July", "August", "September",
      "October", "November", "December"],
    f = {
      bF: c(p),
      bG: p,
      bH: c(u),
      bI: u,
      bJ: ["am", "pm"],
      bK: ["AM", "PM"]
    },
    g = {
      bF: ["\u5468\u65e5", "\u5468\u4e00", "\u5468\u4e8c", "\u5468\u4e09", "\u5468\u56db",
        "\u5468\u4e94", "\u5468\u516d"],
      bG: ["\u661f\u671f\u65e5", "\u661f\u671f\u4e00", "\u661f\u671f\u4e8c", "\u661f\u671f\u4e09",
        "\u661f\u671f\u56db", "\u661f\u671f\u4e94", "\u661f\u671f\u516d"],
      bH: ["1\u6708", "2\u6708", "3\u6708", "4\u6708", "5\u6708", "6\u6708", "7\u6708", "8\u6708",
        "9\u6708", "10\u6708", "11\u6708", "12\u6708"],
      bI: ["\u4e00\u6708", "\u4e8c\u6708", "\u4e09\u6708", "\u56db\u6708", "\u4e94\u6708",
        "\u516d\u6708", "\u4e03\u6708", "\u516b\u6708", "\u4e5d\u6708", "\u5341\u6708",
        "\u5341\u4e00\u6708", "\u5341\u4e8c\u6708"],
      bL: ["\u4e0a\u5348", "\u4e0b\u5348"]
    },
    b = 864e5,
    $ = {
      A: (t, e) => (e.bK || e.bL)[t.getHours() < 12 ? 0 : 1],
      a: (t, e) => (e.bJ || e.bL)[t.getHours() < 12 ? 0 : 1],
      s: t => t.getSeconds(),
      ss(t) {
        return r.bS(this.s(t), 2, "0")
      },
      m: t => t.getMinutes(),
      mm(t) {
        return r.bS(this.m(t), 2, "0")
      },
      h(t) {
        let e = t.getHours();
        return e > 12 && (e -= 12), e
      },
      hh(t) {
        return r.bS(this.h(t), 2, "0")
      },
      H: t => t.getHours(),
      HH(t) {
        return r.bS(this.H(t), 2, "0")
      },
      w(t) {
        let e = new Date(t.getFullYear(), 0, 1),
          r = e.getTime(),
          i = e.getDay(),
          s = t.getTime(),
          d = 0;
        return 0 === i && (i = 7), r += i > 4 ? (8 - i) * b : (1 - i) * b, d = o((s - r) / b) + 1,
          d = a(d / 7), d
      },
      ww(t) {
        return r.bS(this.w(t), 2, "0")
      },
      d: t => t.getDay(),
      dd(t) {
        return r.bS(this.d(t), 2, "0")
      },
      ddd(t, e) {
        return e.bF[this.d(t)]
      },
      dddd(t, e) {
        return e.bG[this.d(t)]
      },
      D: t => t.getDate(),
      DD(t) {
        return r.bS(this.D(t), 2, "0")
      },
      DDD(t) {
        let e = t.getTime(),
          r = new Date(t.getFullYear(), 0, 1).getTime();
        return o((e - r) / b) + 1
      },
      DDDD(t) {
        return r.bS(this.DDD(t), 3, "0")
      },
      M: t => t.getMonth() + 1,
      MM(t) {
        return r.bS(this.M(t), 2, "0")
      },
      MMM(t, e) {
        return e.bH[this.M(t) - 1]
      },
      MMMM(t, e) {
        return e.bI[this.M(t) - 1]
      },
      YYYY: t => t.getFullYear(),
      YY(t) {
        return ("" + this.YY(t)).slice(-2)
      }
    },
    m = t => t instanceof Date || (t = new Date(Date.parse(String(t).replace(/-/g, "/")))) instanceof Date &&
    "Invalid Date" != t.toString() ? t : void 0,
    y = new s,
    x = /\bfunction\s*\(([\s\S]*?)\)\s*\{([\s\S]*?)\}\s*;?\s*$/i;
  return {
    _jw: () => n,
    _jq(t) {
      let e;
      if (null == t) e = [];
      else {
        let r = t.indexOf(":");
        if (r > -1) {
          let e, i = t.substring(0, r),
            s = t.substring(r + 1);
          if ("builtin" == i) try {
            e = JSON.parse(s)
          } catch {
            e = {}
          } else e = s;
          return [i, e]
        }
        e = []
      }
      return e
    },
    _ju(t) {
      let e = this._jq(t),
        r = "";
      for (let t of n)
        if (t.id == e[0]) {
          if (r = t.title + ":", "custom" == t.id) r += i("hm");
          else {
            let s = e[1];
            if ((null == s ? void 0 : s.prefix) && (r += `${t.prefix.title}(${s.prefix})`),
              null == s ? void 0 : s.type)
              for (let e of t.subs)
                if (e.id == s.type) {
                  let t = "";
                  if (null == s ? void 0 : s.body) {
                    let r, d = s.body;
                    for (let i = 0; i < d.length; i++) {
                      let s = d[i],
                        l = e.parts[i].list;
                      for (let e of l)
                        if (e.format == s) {
                          t += e.title, r = 1;
                          break
                        }
                    }
                    r || (t += i("d1"))
                  }
                  t && (r += `${e.title}(${t})`);
                  break
                }(null == s ? void 0 : s.postfix) && (r +=
              `${t.postfix.title}(${s.postfix})`)
          }
          break
        } return r
    },
    _f8(t, e, ...r) {
      var i, s, o, a;
      t += "";
      let n = this._jq(t),
        c = n.shift();
      if ("date@en" == c || "date@zh" == c) {
        let t = m(e);
        if (!t) return e;
        let r = n[0],
          i = c.endsWith("@en");
        return r = r.replace(h, (e => {
          var r;
          return (null === (r = $[e]) || void 0 === r ? void 0 : r.call($, t, i ? f :
            g)) || e
        })), r
      }
      if ("builtin" == c) {
        let t = n[0],
          r = null !== (i = null == t ? void 0 : t.body) && void 0 !== i ? i : [];
        if ("number" == t.type) {
          let t = d(e);
          if (l(t)) {
            let i, d = null !== (o = null === (s = r[1]) || void 0 === s ? void 0 : s.length) &&
            void 0 !== o ? o : 1;
            i = d ? t.toFixed(d - 1) : t + "";
            let l = i.indexOf("."),
              a = "";
            l > 0 && (a = i.substring(l), i = i.substring(0, l));
            let n = r[0];
            if (n) {
              let t, e = ",",
                r = n.lastIndexOf(e);
              if (-1 == r && (e = "'", r = n.lastIndexOf(e)), -1 != r) {
                t = n.substring(r + 1).length, i = ((t, e, r) => {
                  let i = "";
                  for (; t.length > e;) i = r + t.slice(-e) + i, t = t.substring(
                    0, t.length - e);
                  return t && (i = t + i), i
                })(i, t, e)
              }
            }
            e = i + a
          }
        } else if ("date" == t.type) {
          let t = m(e);
          if (t) {
            let i = null !== (a = r[0]) && void 0 !== a ? a : "",
              s = c.endsWith("@en");
            e = i.replace(h, (e => {
              var r;
              return (null === (r = $[e]) || void 0 === r ? void 0 : r.call($, t,
                s ? f : g)) || e
            }))
          }
        }
        t.prefix && (e = t.prefix + e), t.postfix && (e += t.postfix)
      } else if ("custom" == c) {
        let t, i;
        if (n.join("").replace(x, ((e, r, s) => {
          t = r, i = s
        })), !t && !i) return e; {
          let s = [t, "\0", i].join(""),
            d = y.get(s);
          d || (d = Function(t, i), y.set(s, d));
          try {
            return d(e, ...r)
          } catch (t) {
            return t.message
          }
        }
      }
      return e
    }
  }
})), s.d("6c/9t", ["5u", "./9s"], (t => {
  let e = t("5u"),
    r = t("./9s"),
    {
      config: i
    } = e,
    s = i("providers"),
    d = [((null == s ? void 0 : s.filesaver) || "//unpkg.com/file-saver@2.0.5/dist/") +
    "FileSaver.min.js"];
  return () => r("saveAs", d)
})), s.d("6c/fs", ["../66/6l/5r", "../6b/5r", "./9t"], (t => {
  let e = t("../66/6l/5r"),
    r = t("../6b/5r"),
    i = t("./9t"),
    s = !0;
  try {
    top.location, s = !1
  } catch {}
  s || (s = !window.showOpenFilePicker && !window.showSaveFilePicker);
  let d = "Report Designer File",
    l = [".rd"];
  return {
    _d1: () => s,
    async _cR() {
      if (s && !window.saveAs) try {
        e.show(r("h3")), await i()
      } catch (t) {
        throw t
      } finally {
        e.hide()
      }
    },
    async _cP(t, e = l) {
      if (s) {
        let e = t.files[0];
        return e ? (t.value = "", await (t => new Promise(((e, r) => {
          let i = new FileReader;
          i.onload = t => {
            e(t.target.result)
          }, i.onerror = t => {
            r(t)
          }, i.readAsText(t)
        })))(e)) : ""
      }
      let [r] = await showOpenFilePicker({
        id: "_rd_write",
        excludeAcceptAllOption: !0,
        types: [{
          description: d,
          accept: {
            "text/plain": e
          }
        }]
      }), i = await r.getFile();
      return await i.text()
    },
    async _cS(t, e, r = l) {
      if (s) {
        let r = new Blob([e]);
        saveAs(r, t)
      } else {
        let i = await showSaveFilePicker({
            id: "_rd_read",
            suggestedName: t,
            startIn: "downloads",
            types: [{
              description: d,
              accept: {
                "text/plain": r
              }
            }]
          }),
          s = await i.createWritable();
        await s.write(e), await s.close()
      }
    }
  }
})), s.d("6c/fx", ["5u", "./9s"], (t => {
  let e = t("5u"),
    r = t("./9s"),
    {
      config: i
    } = e,
    s = i("providers"),
    d = [((null == s ? void 0 : s.fx) || "//unpkg.com/function-plot/dist/") + "function-plot.js"];
  return () => r("functionPlot", d)
})), s.d("6c/6d", ["5u", "../5s/62", "../6b/5r"], (t => {
  let e, r, i = t("5u"),
    s = t("../5s/62"),
    d = t("../6b/5r"),
    {
      guid: l,
      mark: o,
      now: a,
      node: n,
      State: h,
      config: c,
      isArray: p,
      isObject: u
    } = i,
    f = /<(script|style)[^>]*>[\S\s]*<\/\1[^>]*>/gi,
    g = l("_rd_bar_"),
    b = /(?:\r\n|\r|\n)/g,
    $ = {
      "&": 38,
      "<": 60,
      ">": 62,
      '"': 34,
      "'": 39,
      "`": 96
    },
    m = /[&<>"'\`]/g,
    y = t => `&#${$[t]};`,
    x = /\s/g,
    _ = t => null == t ? "" : t + "",
    w = /<[^>]+>/g,
    k = /\x1f\d+\x1f/g,
    v = t => {
      if (t)
        if (p(t)) {
          let e = [];
          for (let r of t) e.push(v(r));
          t = e
        } else if (u(t)) {
          let e = {};
          for (let r in t) e[r] = v(t[r]);
          t = e
        }
      return t
    },
    L = (t, e) => {
      let r = e.getBoundingClientRect(),
        i = t.getBoundingClientRect();
      if (!s.bH(r, i, !0)) {
        let {
          offsetHeight: t,
          offsetWidth: s,
          scrollLeft: d,
          scrollTop: l,
          scrollHeight: o,
          scrollWidth: a
        } = e, n = t / 3, h = s / 3, c = i.x + d - r.x - h, p = i.y + l - r.y - n, u = o - t, f = a -
          s;
        return c < 0 ? c = 0 : c > f && (c = f), p < 0 ? p = 0 : p > u && (p = u), {
          x: c,
          y: p
        }
      }
    },
    F = (t, e, r = 1) => {
      if (r < 5) {
        let i = n(e ? t : "_rdm_" + t);
        if (i) {
          let t = e || n("_rd_stage"),
            r = L(i, t);
          r && t.scrollTo(r.x, r.y)
        } else setTimeout(F, 20, t, e, r++)
      }
    },
    S = (t, e) => t.repeat != e.repeat ? "infinite" == t.repeat ? 1 : "infinite" == e.repeat ? -1 : t.repeat -
      e.repeat : 0;
  return {
    bJ: v,
    cO: L,
    bV: F,
    cB: t => _(t).replace(f, ""),
    bF(t, e, r = null) {
      e = e || 150;
      let i, s = l("dm_"),
        d = this;
      return (...l) => {
        clearTimeout(i);
        let a = o(d, s);
        i = setTimeout((() => {
          a() && t.apply(r, l)
        }), e)
      }
    },
    cy(t, e = 50) {
      let r, i = 0;
      return (...s) => {
        r = a(), r - i > e && (i = r, t(...s))
      }
    },
    cM(t, e = 65) {
      let r, i = "";
      for (t += 1; t;) r = (t - 1) % 26, i = String.fromCharCode(r + e) + i, t = (t - r - 1) / 26;
      return i
    },
    cA: t => (t = _(t)).replace(m, y).replace(b, "<br/>").replace(x, "&nbsp;"),
    cH: (t, e = 0) => (t = (t + e) % 180) <= 22.5 || t > 157.5 ? "ew" : t <= 67.5 ? "nwse" : t <= 112.5 ?
      "ns" : t <= 157.5 ? "nesw" : void 0,
    bS: (t, e, r) => ((t += "").length < e && (t = r.repeat(e - t.length) + t), t),
    cF() {
      if (!e) {
        let t = c("rootId"),
          r = n(t);
        e = getComputedStyle(r)
      }
      return e.getPropertyValue("--rd-bF")
    },
    bG() {
      let t = c("rootId"),
        e = n(t);
      return {
        _bP: e.offsetWidth,
        _bQ: e.offsetHeight
      }
    },
    cC(t) {
      if (!1 !== h.get("b5") && (null == t ? void 0 : t.length)) {
        let e = h.get("b4"),
          r = [],
          i = [],
          s = [],
          d = [],
          l = [],
          o = [],
          a = [];
        for (let {
          delay: n,
          repeat: h,
          fn: c,
          use: p,
          duration: u,
          direction: f,
          mode: g,
          hidden: b
        } of t) {
          if (b || !p.trim() || e < n) continue;
          let t = p.split(",");
          for (let p of t) {
            let t = e;
            if ("infinite" != h) {
              let r = n + u * h;
              e > r && (t = r)
            }
            r.push(p), i.push(`-${t-n}s`), s.push(h), d.push(c), l.push(`${u}s`), o.push(g), a.push(
              f)
          }
        }
        if (r.length) return `animation-name:${r};animation-delay:${i};animation-iteration-count:${s};animation-timing-function:${d};animation-play-state:paused;animation-duration:${l};animation-fill-mode:${o};animation-direction:${a};`
      }
      return ""
    },
    cD(t) {
      if (null == t ? void 0 : t.length) {
        let e = [],
          r = [],
          i = [],
          s = [],
          d = [],
          l = [],
          o = [];
        t.sort(S);
        for (let {
          use: a,
          delay: n,
          repeat: h,
          fn: c,
          duration: p,
          mode: u,
          direction: f,
          hidden: g
        } of t) {
          if (g || !a.trim()) continue;
          let t = a.split(",");
          for (let a of t) e.push(a), r.push(`${n}s`), i.push(h), s.push(c), d.push(`${p}s`), l.push(
            u), o.push(f)
        }
        if (e.length) return `animation-name:${e};animation-delay:${r};animation-iteration-count:${i};animation-timing-function:${s};animation-duration:${d};animation-fill-mode:${l};animation-direction:${o};`
      }
      return ""
    },
    cP() {
      if (!r) {
        let t = n(g);
        t || (t = document.createElement("div"), t.className =
          "rd-bG rd-bH rd-cI rd-eF rd-cK rd-db rd-dh rd-cQ rd-dU rd-eC rd-dJ", t.innerHTML =
          '<div class="rd-di rd-de"></div>', t.id = g, document.body.appendChild(t)), r = {
          bG: t.offsetWidth - t.clientWidth,
          bF: t.offsetHeight - t.clientHeight
        }
      }
      return r
    },
    cI(t) {
      let e = {},
        r = 0;
      return t = t.replace(w, (t => {
        let i = e[t];
        return i || (i = "\x1f" + r++ + "\x1f", e[t] = i, e[i] = t), i
      })), {
        cJ: e,
        cK: t
      }
    },
    cL: (t, e) => t.replace(k, (t => e[t] || t)),
    cz(t, e) {
      try {
        localStorage.setItem("rd." + t, e)
      } catch {}
    },
    cE(t, e) {
      var r;
      try {
        e = null !== (r = localStorage.getItem("rd." + t)) && void 0 !== r ? r : e
      } catch {}
      return e
    },
    cN: [{
      text: "\u7b49\u4e8e",
      value: "=="
    }, {
      text: "\u4e0d\u7b49\u4e8e",
      value: "!="
    }, {
      text: "\u5927\u4e8e",
      value: ">"
    }, {
      text: "\u5927\u4e8e\u7b49\u4e8e",
      value: ">="
    }, {
      text: "\u5c0f\u4e8e",
      value: "<"
    }, {
      text: "\u5c0f\u4e8e\u7b49\u4e8e",
      value: "<="
    }],
    cG: {
      "==": (t, e) => t == e,
      "!=": (t, e) => t != e,
      ">": (t, e) => t > e,
      ">=": (t, e) => t >= e,
      "<": (t, e) => t < e,
      "<=": (t, e) => t <= e
    },
    cR(t) {
      let e;
      try {
        e = JSON.parse(t)
      } finally {
        return e
      }
    },
    bM({
         title: t
       }, e) {
      let r = {};
      for (let {
        props: {
          ename: t
        }
      } of e) t && (r[t] = 1);
      let i, s = 1,
        l = d(t);
      for (; s && (i = l + s, r[i]);) s++;
      return i
    },
    cQ(t, e) {
      let r, i = t.getBoundingClientRect(),
        s = e.getBoundingClientRect();
      if (i.y < s.y) r = i.y - s.y;
      else {
        let t = i.y + i.height,
          e = s.y + s.height;
        t > e && (r = t - e)
      }
      r && (e.scrollTop += r)
    },
    _go(t, e = "textStyle") {
      let r = [],
        i = t[e + "Underline"],
        s = t[e + "Strike"],
        d = t[e + "Overline"];
      return i && r.push("underline"), s && r.push("line-through"), d && r.push("overline"), r.join(
        " ")
    }
  }
})), s.d("6c/html2canvas", ["5u", "./9s"], (t => {
  let e = t("5u"),
    r = t("./9s"),
    {
      config: i
    } = e,
    s = i("providers"),
    d = [((null == s ? void 0 : s.html2canvas) || "//unpkg.com/html2canvas@1.4.1/dist/") +
    "html2canvas.min.js"];
  return () => r("html2canvas", d)
})), s.d("6c/9u", ["5u", "./9s"], (t => {
  let e = t("5u"),
    r = t("./9s"),
    {
      config: i
    } = e,
    s = i("providers"),
    d = [((null == s ? void 0 : s.jspdf) || "//unpkg.com/jspdf@2.5.1/dist/") + "jspdf.umd.min.js"];
  return () => r("jspdf", d)
})), s.d("6c/9s", ["5u"], (t => {
  let e = t("5u"),
    {
      State: r
    } = e,
    i = {},
    s = {},
    d = "can not load: ",
    {
      head: l
    } = document,
    o = t => new Promise((e => {
      let i, s = t.endsWith(".css");
      if (r.fire("b8", {
        _eF: 1
      }), s) i = document.createElement("link"), i.onload = i.onerror = () => {
        r.fire("b8"), e()
      }, i.href = t, i.rel = "stylesheet", l.appendChild(i);
      else {
        let i = document.createElement("script");
        i.onload = i.onerror = () => {
          l.removeChild(i), r.fire("b8"), e()
        }, i.src = t, l.appendChild(i)
      }
    }));
  return (t, e, r) => new Promise(((l, a) => {
    let n = i[t] || 1,
      h = s[t] || (s[t] = []);
    if (window[t]) l();
    else if (4 & n) a(d + t);
    else if (2 & n) h.push([l, a]);
    else {
      i[t] = 2 | n, h.push([l, a]);
      let s = [];
      if (r)
        for (let t of r) s.push(o(t));
      Promise.all(s).then((() => {
        let t = [];
        for (let r of e) t.push(o(r));
        return Promise.all(t)
      })).then((() => {
        i[t] = 4 | n;
        for (let [e, r] of h) window[t] ? e() : r(d + t);
        h.length = 0
      })).catch(a)
    }
  }))
})), s.d("6c/map", ["5u", "./9s"], (t => {
  let e = t("5u"),
    r = t("./9s"),
    {
      config: i
    } = e,
    s = i("providers"),
    d = (null == s ? void 0 : s.leaflet) || "//unpkg.com/leaflet@1.9.2/dist/",
    l = [d + "leaflet.css", d + "leaflet.js"];
  return () => r("L", l)
})), s.d("6c/mathjax", ["5u", "./9s"], (t => {
  let e = t("5u"),
    r = t("./9s"),
    {
      config: i
    } = e,
    s = i("providers"),
    d = [((null == s ? void 0 : s.mathjax) || "//unpkg.com/mathjax@3.2.2/es5/") + "tex-svg.js"];
  return () => r("MathJax", d)
})), s.d("6c/qrcode", ["5u", "./9s"], (t => {
  let e = t("5u"),
    r = t("./9s"),
    {
      config: i
    } = e,
    s = i("providers"),
    d = [((null == s ? void 0 : s.qrcode) || "//unpkg.com/@keeex/qrcodejs-kx@1.0.2/") + "qrcode.min.js"];
  return {
    _fZ: [{
      text: "mN",
      value: "L"
    }, {
      text: "mO",
      value: "M"
    }, {
      text: "mP",
      value: "Q"
    }, {
      text: "mM",
      value: "H"
    }],
    _fX: () => r("QRCode", d)
  }
})), s.d("6c/signature", ["5u", "./9s"], (t => {
  let e = t("5u"),
    r = t("./9s"),
    {
      config: i
    } = e,
    s = i("providers"),
    d = [((null == s ? void 0 : s.signature) || "//unpkg.com/signature_pad@4.0.10/dist/") +
    "signature_pad.umd.min.js"];
  return () => r("SignaturePad", d)
})), s.d("6c/9j", ["5u", "../5s/60", "../5s/6o", "../5s/6d", "../5s/62", "../66/9e/5r"], (t => {
  let e, r = t("5u"),
    i = t("../5s/60"),
    s = t("../5s/6o"),
    d = t("../5s/6d"),
    l = t("../5s/62"),
    o = t("../66/9e/5r"),
    {
      node: a,
      config: n,
      guid: h,
      inside: c
    } = r,
    p = h("_rd_rp_"),
    {
      max: u
    } = Math,
    f = {
      _d8() {
        a(p) || (e = a(n("rootId")), e.insertAdjacentHTML("beforeend",
          `<div class="rd-cG rd-d7 rd-cl rd-dL" id="${p}"></div>`))
      },
      _ca(t, r) {
        let s, d = a(p).style,
          o = e.getBoundingClientRect(),
          n = getComputedStyle(e),
          h = parseInt(n.borderLeftWidth, 10) || 0,
          c = parseInt(n.borderTopWidth, 10) || 0,
          {
            props: f
          } = t,
          g = i.bU(f.x),
          b = i.bU(f.y),
          $ = i.bU(f.width),
          m = i.bU(f.height);
        if (r) {
          let t = a(r);
          if (t) {
            do {
              if (t = t.parentNode, "hod" == (null == t ? void 0 : t.dataset.as)) break
            } while (t);
            s = t.getBoundingClientRect(), s.x += g, s.y += b
          } else s = {
            x: -1e5,
            y: -1e5
          }
        } else s = l.bM({
          x: g,
          y: b
        });
        d.left = s.x - o.x - h - scrollX + "px", d.top = s.y - o.y - c - scrollY + "px", d.width =
          u($, 1) + "px", d.height = u(m, 1) + "px";
        let y = f.rotate || 0;
        d.transform = `rotate(${y}deg)`
      },
      _cb() {
        let t = a(p).style;
        t.left = "-10000px", t.top = "-10000px"
      }
    };
  return {
    _kf(t) {
      f._d8(), o._kf(), o._kv(t)
    },
    _kg(t) {
      o._kg(), o._dX(t), this._cb()
    },
    _cb() {
      f._cb()
    },
    _ku(t) {
      return c(t, this.root)
    },
    "_lF<pointerover>"(t) {
      if (!c(t.relatedTarget, t.eventTarget)) {
        let {
          element: e,
          dest: r
        } = t.params;
        f._ca(e, r)
      }
    },
    "_lG<pointerout>"(t) {
      c(t.relatedTarget, t.eventTarget) || f._cb()
    },
    "_lH<click>"(t) {
      if (!t._d2) {
        let {
          params: e,
          shiftKey: r,
          ctrlKey: i,
          metaKey: d
        } = t, {
          element: l,
          dest: o
        } = e;
        s.bI(l, r || i || d), f._ca(l, o)
      }
    },
    "_nx<click>"(t) {
      t._d2 = 1;
      let {
        element: e
      } = t.params;
      d.ci(e, "_ny"), f._cb()
    }
  }
})), s.d("6c/72", ["5u"], (t => {
  let e = t("5u"),
    {
      isArray: r
    } = e,
    {
      abs: i,
      min: s,
      max: d
    } = Math,
    l = ["head", "label", "data", "total", "foot"],
    o = (t, e) => {
      for (let r of l) e[r] && (t[r] = !0);
      return t
    },
    a = (t, e, r) => {
      let i = r;
      for (let r of t)
        for (let t of r.cols) {
          let r = t._g6 + t.colspan - 1;
          if (t._g6 <= e && r >= e) {
            let t = r - e;
            t < i && (i = t)
          }
        }
      return i
    },
    n = (t, e, r) => {
      let i = r;
      for (let r of t)
        for (let t of r.cols) {
          let r = t._i0 + t.rowspan - 1;
          if (t._i0 <= e && r >= e) {
            let t = r - e;
            t < i && (i = t)
          }
        }
      return i
    };
  return {
    bF(t, e) {
      if (!e || null == t._gj || null == t._gk) {
        let e = 0,
          r = 0,
          i = {},
          s = {},
          {
            rows: d
          } = t,
          l = 0,
          o = 0,
          a = 0;
        for (let t of d) {
          r = 0, a = 0;
          for (let d of t.cols) {
            for (; i[r] && s[r] && e < s[r];) r += i[r];
            d._dl = a++, d._dk = e, d._i0 = e, d._g6 = r, d.rowspan ? (s[r] = d.rowspan + e, d._iZ =
              e + d.rowspan - 1) : d._iZ = e, d.colspan && (i[r] = d.colspan, r += d.colspan -
              1), d._g7 = r++, r > l && (l = r)
          }
          e++, e > o && (o = e)
        }
        t._gj = o, t._gk = l
      }
      return t
    },
    bL(t, e) {
      let i, {
          focusCol: s,
          focusRow: d,
          rows: l
        } = t,
        o = 0,
        h = 0;
      if ("left" == e) i = [[d, s - 1], [d, s]], h = 1;
      else if ("right" == e) i = [[d, s], [d, s + 1]], h = 1;
      else {
        o = 1;
        let t = l[d].cols[s],
          r = t._iZ + 1,
          a = t._g7,
          n = 0;
        for (let o = 0; o <= r; o++) {
          for (let r = 0; r <= a; r++) {
            let a = l[o];
            if (a) {
              let l = a.cols[r];
              if (l && l != t) {
                let r = l._dl;
                if (l._g6 == t._g6 && l._g7 == t._g7)
                  if (l._iZ + 1 == t._i0) {
                    if ("top" == e) {
                      i = [[o, r], [d, s]], n = 1;
                      break
                    }
                  } else if (t._iZ + 1 == l._i0 && "bottom" == e) {
                    i = [[d, s], [o, r]], n = 1;
                    break
                  }
              }
            }
          }
          if (n) break
        }
      }
      let [c, p] = i;
      t.focusRow = c[0], t.focusCol = c[1];
      let u = 0,
        f = 0,
        g = -1,
        b = -1;
      for (let t of i) {
        let e = l[t[0]].cols[t[1]],
          r = e._iZ;
        r > g && (g = r);
        let i = e._g7;
        i > b && (b = i)
      }
      let $ = l[c[0]].cols[c[1]],
        m = l[p[0]].cols[p[1]];
      f = g - $._i0 + 1, u = b - $._g6 + 1, h && ($.width += m.width), o && ($.height += m.height), r(
        $.elements) ? $.elements.push(...m.elements) : !$.bindKey && m.bindKey && ($.bindKey =
        m.bindKey, $.bindName = m.bindName, $.type = m.type), $.colspan = u, $.rowspan = f;
      for (let t = i.length - 1; t > 0; t--) {
        let e = i[t];
        l[e[0]].cols.splice(e[1], 1)
      }
      let y = t._gj;
      for (let t = y; t--;) {
        l[t].cols.length || (l.splice(t, 1), y--)
      }
      for (let t = 0; t < y; t++) {
        let e = n(l, t, y);
        if (e > 0) {
          for (let r = 0; r <= t; r++) {
            let i = l[r];
            for (let r of i.cols) {
              let i = r._i0 + r.rowspan - 1;
              r._i0 <= t && i >= t && (r.rowspan -= e)
            }
          }
          break
        }
      }
      let x = t._gk;
      for (let t = 0; t < x; t++) {
        let e = a(l, t, x);
        if (e > 0) {
          for (let r of l)
            for (let i of r.cols) {
              let r = i._g6 + i.colspan - 1;
              i._g6 <= t && r >= t && (i.colspan -= e)
            }
          break
        }
      }
      return t
    },
    bM(t, e, r, i, s) {
      let {
        focusRow: d,
        focusCol: l,
        rows: a
      } = t, n = a[d], h = n.cols[l], c = this.bG(t);
      if (e) {
        let t, e;
        if (h.colspan > 1) {
          let r = h.colspan / 2 | 0,
            i = h.colspan - r,
            s = 0,
            d = h._g7;
          for (let t = d - r + 1; t <= d; t++) s += c._gl[t];
          h.colspan = i, h.width -= s, t = r, e = s
        } else {
          let r = h.width,
            s = r / 2;
          s < i && (s = i), h.width = s, e = s, t = 1;
          let d = 2 * s - r;
          for (let t of a)
            for (let e of t.cols) e != h && e._g6 <= h._g6 && e._g7 >= h._g7 && (e.colspan++, e
              .width += d)
        }
        let s = {
          ...r,
          elements: [],
          colspan: t,
          rowspan: h.rowspan,
          width: e,
          height: h.height
        };
        n.cols.splice(l + 1, 0, s)
      } else {
        let t, e;
        if (h.rowspan > 1) {
          let r = h.rowspan / 2 | 0,
            i = h.rowspan - r,
            s = 0,
            d = h._iZ;
          for (let t = d - r + 1; t <= d; t++) s += c._gm[t];
          h.rowspan = i, h.height -= s, t = r, e = s, n = a[h._i0 + i];
          let o = 0;
          for (let t of n.cols) {
            if (t._g6 > h._g6) {
              l = o;
              break
            }
            o++
          }
        } else {
          let r = h.height,
            i = r / 2;
          i < s && (i = s), h.height = i, e = i, t = 1;
          let d = 2 * i - r;
          for (let t of a)
            for (let e of t.cols) e != h && e._i0 <= h._i0 && e._iZ >= h._iZ && (e.rowspan++, e
              .height += d);
          a.splice(h._iZ + 1, 0, n = o({
            cols: []
          }, n))
        }
        let i = {
          ...r,
          elements: [],
          colspan: h.colspan,
          rowspan: t,
          width: h.width,
          height: e
        };
        n.cols.splice(l, 0, i)
      }
    },
    bH(t, e, r, i) {
      let s = {},
        {
          rows: d,
          focusRow: l,
          _gk: a
        } = t,
        n = d[l],
        h = this.bG(t);
      for (let t = 0; t < e; t++) {
        let r = d[t];
        for (let t of r.cols)
          if (t._iZ >= e) {
            t.rowspan++, t.height += i;
            let e = t._g6,
              r = e + t.colspan;
            for (let t = e; t < r; t++) s[t] = 1
          }
      }
      let c = {
        cols: []
      };
      n && o(c, n);
      for (let t = 0; t < a; t++)
        if (!s[t]) {
          let e = {
            ...r,
            elements: [],
            width: h._gl[t],
            height: i,
            rowspan: 1,
            colspan: 1
          };
          c.cols.push(e)
        } return d.splice(e, 0, c), t
    },
    bJ(t, e, r, i) {
      let {
        rows: s
      } = t, d = [], l = 0, o = this.bG(t);
      for (let t of s) {
        let s = t.cols.length,
          a = s;
        for (let r = 0; r < s; r++) {
          let s = t.cols[r];
          if (s.rowspan > 1 && d.push(s), s._g6 < e && s._g7 >= e) {
            s.colspan++, s.width += i, a = -1;
            break
          }
          if (s._g6 >= e) {
            a = r;
            break
          }
        }
        for (let t of d)
          if (t._g6 < e && t._g7 >= e && t._i0 < l && t._iZ >= l) {
            a = -1;
            break
          } if (-1 != a) {
          let e = {
            ...r,
            elements: [],
            height: o._gm[l],
            width: i,
            rowspan: 1,
            colspan: 1
          };
          t.cols.splice(a, 0, e)
        }
        l++
      }
      return t
    },
    bI(t, e) {
      let r, {
        rows: l,
        focusRow: o,
        focusCol: a
      } = t;
      if (null != e) r = [e, e];
      else {
        let t = l[o].cols[a];
        r = [t._i0, t._iZ]
      }
      let n = {},
        h = 0,
        c = r[1] - r[0] + 1,
        p = l[r[1] + 1],
        u = c / 2;
      for (let t = r[1]; t >= 0; t--) {
        let e = l[t],
          o = 0;
        for (let t = e.cols.length; t--;) {
          let l = e.cols[t],
            a = l._g6,
            p = l._iZ,
            f = l._i0,
            g = p - f + 1;
          if (1 == g && (o = l.height), g > 1) {
            let b = g / 2;
            if (i(r[0] + u - f - b) < u + b) {
              if (r[0] == l._i0 && l._iZ - l._i0 >= c && (n[a] = l, h = 1), !o)
                for (let r = t; r--;) {
                  let t = e.cols[r];
                  if (t._iZ == t._i0) {
                    o = t.height;
                    break
                  }
                }
              let i = s(p, r[1]) - d(r[0], f) + 1;
              l.rowspan -= i, l.height -= o * i
            }
          }
        }
        t <= r[1] && t >= r[0] && l.splice(t, 1)
      }
      if (h) {
        let e = t._gk;
        if (p)
          for (let t = e, r = p.cols.length; t--;) {
            let e = n[t];
            if (e) {
              let i = 0;
              for (let e = r; e--;) {
                if (p.cols[e]._g6 < t) {
                  r = e, i = e + 1;
                  break
                }
              }
              p.cols.splice(i, 0, e)
            }
          }
      }
      return t
    },
    bK(t, e, r) {
      let l, {
          focusRow: o,
          focusCol: a,
          rows: n
        } = t,
        h = 0;
      if (null != e) {
        let t;
        null == r && (r = e), l = [e, r];
        for (let i of n) {
          for (let s = i.cols.length; s--;) {
            let d = i.cols[s];
            if (d._g6 == e && d._g7 == r) {
              t = 1, h = d.width;
              break
            }
          }
          if (t) break
        }
      } else {
        let t = n[o].cols[a];
        l = [t._g6, t._g7], h = t.width
      }
      let c = (l[1] - l[0] + 1) / 2;
      for (let t of n)
        for (let e = t.cols.length; e--;) {
          let r = t.cols[e],
            o = r._g6,
            a = r._g7;
          if (o >= l[0] && a <= l[1]) t.cols.splice(e, 1);
          else if (r.colspan > 1) {
            let t = (a - o + 1) / 2;
            if (i(l[0] + c - o - t) < c + t) {
              let t = s(a, l[1]) - d(l[0], o) + 1;
              r.colspan -= t, r.width -= h
            }
          }
        }
      return t
    },
    bG(t, e) {
      let r = [],
        i = [],
        {
          rows: s
        } = t,
        l = !1,
        o = !1;
      for (let t of s)
        for (let s of t.cols) {
          if (1 == s.colspan) {
            let t = s._g6;
            (null == r[t] || !l && s.width > r[t] || e == s) && (l = l || e == s, r[t] = s.width)
          }
          if (1 == s.rowspan) {
            let t = s._i0;
            (null == i[t] || !o && s.height > i[t] || e == s) && (o = o || e == s, i[t] = s.height)
          }
        }
      for (let t of s)
        for (let s of t.cols) {
          if (s.colspan > 1) {
            let t = 0,
              i = 0,
              l = s._g6,
              o = l + s.colspan;
            for (let e = l; e < o; e++) null != r[e] && r[e] >= 0 && (t += r[e], i++);
            if (i < s.colspan) {
              let e = d(s.width - t, 0) / (s.colspan - i);
              for (let t = l; t < o; t++)(null == r[t] || r[t] < 0) && (r[t] = e)
            } else if (t < s.width && (!e || e == s) || t > s.width && e && e == s)
              for (let e = l; e < o; e++) r[e] = t > 0 ? r[e] / t * s.width : s.width / s.colspan
          }
          if (s.rowspan > 1) {
            let t = 0,
              r = 0,
              l = s._i0,
              o = l + s.rowspan;
            for (let e = l; e < o; e++) null != i[e] && i[e] >= 0 && (t += i[e], r++);
            if (r < s.rowspan) {
              let e = d(0, s.height - t) / (s.rowspan - r);
              for (let t = l; t < o; t++)(null == i[t] || i[t] < 0) && (i[t] = e)
            } else if (t < s.height && (!e || e == s) || t > s.height && e && s == e)
              for (let e = l; e < o; e++) i[e] = t > 0 ? i[e] / t * s.height : s.height / s.rowspan
          }
        }
      return {
        _gl: r,
        _gm: i
      }
    },
    bN(t, e) {
      let r = this.bG(t, e),
        {
          rows: i
        } = t;
      for (let t of i)
        for (let e of t.cols) {
          let t = e.rowspan || 1,
            i = e.colspan || 1,
            s = e._g6,
            d = e._i0,
            l = 0,
            o = 0;
          for (let t = s + i - 1; t >= s; t--) l += r._gl[t];
          for (let e = d + t - 1; e >= d; e--) o += r._gm[e];
          e.width = l, e.height = o
        }
    }
  }
})), s.d("6c/underscore", ["5u", "./9s"], (t => {
  let e = t("5u"),
    r = t("./9s"),
    {
      config: i
    } = e,
    s = i("providers"),
    d = [((null == s ? void 0 : s.underscore) || "//unpkg.com/underscore@1.13.6/") +
    "underscore-umd-min.js"];
  return () => r("_", d)
})), s.d("6c/xsheet", ["5u", "./9s"], (t => {
  let e = t("5u"),
    r = t("./9s"),
    {
      config: i
    } = e,
    s = i("providers"),
    d = (null == s ? void 0 : s.luckysheet) || "//unpkg.com/luckysheet/dist/",
    l = [d + "plugins/css/pluginsCss.css", d + "plugins/plugins.css", d + "css/luckysheet.css", d +
    "assets/iconfont/iconfont.css", d + "plugins/js/plugin.js"],
    o = [d + "luckysheet.umd.js"];
  return () => r("luckysheet", o, l)
})), s.d("66/80/alert", ["5u", "../../6b/5r"], (t => {
  let e, r, i = t("5u"),
    s = t("../../6b/5r"),
    d = "div",
    l = "button",
    o = {
      class: "rd-bT rd-c3 rd-c4 rd-ct rd-cW rd-c0 rd-c7 rd-eb"
    },
    a = {
      class: "rd-en rd-dZ rd-bJ"
    },
    n = {
      class: "rd-bW rd-du"
    },
    h = {
      class: "rd-bY rd-cW rd-dl rd-c0 rd-c3 rd-d5 rd-e_ rd-bZ rd-ct"
    },
    {
      View: c,
      node: p
    } = i;
  return c.extend({
    tmpl({
           title: t,
           body: i,
           i18n: s
         }, c, p) {
      let u, f, g;
      return u = e ? [e] : [e = c(d, {
        $: "a/",
        class: "rd-bU rd-c3 rd-ea"
      })], f = [c(0, t)], g = [c("h5", a, f)], u.push(c(d, o, g)), g = [c(0, i)], u.push(
        c(d, n, g)), f = [c(0, s("lK"))], g = [c(l, {
        _click: p + "\x1e_kH()",
        class: "rd-bQ rd-dv rd-bN rd-cE rd-do rd-bS",
        type: l,
        tabindex: 1,
        id: "_mx_o_" + p
      }, f)], u.push(c(d, h, g)), r ? u.push(r) : u.push(r = c(d, {
        $: "a;",
        class: "rd-bX rd-c3 rd-d9"
      })), c(p, 0, u)
    },
    init({
           body: t,
           title: e = s("lJ"),
           enter: r,
           _close: i
         }) {
      let d = this;
      d._cL = i, d._kE = t, d._kF = e, d._kG = r
    },
    async render() {
      let t = this;
      await t.digest({
        body: t._kE,
        title: t._kF
      });
      let e = p(`_mx_o_${this.id}`);
      e && e.focus()
    },
    "_kH<click>"() {
      var t;
      let e = this;
      e._cL(), null === (t = e._kG) || void 0 === t || t.call(e)
    }
  })
})), s.d("66/80/confirm", ["../../6b/5r", "./alert"], (t => {
  let e, r, i = t("../../6b/5r"),
    s = t("./alert"),
    d = "div",
    l = "button",
    o = {
      class: "rd-bT rd-c3 rd-c4 rd-ct rd-cW rd-c0 rd-c7 rd-eb"
    },
    a = {
      class: "rd-en rd-dZ rd-bJ"
    },
    n = {
      class: "rd-bW rd-du"
    },
    h = {
      class: "rd-bY rd-cW rd-dl rd-c0 rd-c3 rd-d5 rd-e_ rd-bZ rd-ct"
    };
  return s.extend({
    tmpl({
           title: t,
           body: i,
           i18n: s
         }, c, p) {
      let u, f, g;
      return u = e ? [e] : [e = c(d, {
        $: "a/",
        class: "rd-bU rd-c3 rd-ea"
      })], f = [c(0, t)], g = [c("h5", a, f)], u.push(c(d, o, g)), g = [c(0, i)], u.push(
        c(d, n, g)), f = [c(0, s("lK"))], g = [c(l, {
        type: l,
        _click: p + "\x1e_kH()",
        class: "rd-bQ rd-dv rd-bN rd-do rd-bS",
        tabindex: 1,
        id: "_mx_o_" + p
      }, f)], f = [c(0, s("cr"))], g.push(c(l, {
        type: l,
        _click: p + "\x1e_cM()",
        class: "rd-bQ rd-dv rd-bN rd-do rd-cb",
        tabindex: 2
      }, f)), u.push(c(d, h, g)), r ? u.push(r) : u.push(r = c(d, {
        $: "a;",
        class: "rd-bX rd-c3 rd-d9"
      })), c(p, 0, u)
    },
    init({
           _close: t,
           body: e,
           title: r = i("lJ"),
           enter: s,
           cancel: d
         }) {
      let l = this;
      l._cL = t, l._kE = e, l._kF = r, l._kG = s, l._kI = d
    },
    "_cM<click>"() {
      var t;
      let e = this;
      e._cL(), null === (t = e._kI) || void 0 === t || t.call(e)
    }
  })
})), s.d("66/80/5r", ["5u"], (t => {
  let e, r, i = t("5u"),
    s = "div",
    {
      View: d,
      applyStyle: l,
      node: o,
      dispatch: a,
      has: n,
      guid: h,
      attach: c,
      detach: p,
      delay: u
    } = i;
  l("rd-ih",
    ".rd-h5{border:1px solid #e6e6e6;margin:25px;min-height:120px}.rd-h6{opacity:.2;top:11px;right:10px;border-radius:50%;box-shadow:0 0 0 2px #fff}.rd-h6:focus,.rd-h6:hover{opacity:.5}.rd-h7{margin:auto}.rd-h8{float:right;margin:36px 32px 0 -35px}.rd-h9{background-color:#0000}.rd-i_{-webkit-animation:rd-bH .2s;animation:rd-bH .2s;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards}@-webkit-keyframes rd-bH{from{background-color:#0000}to{background-color:#0006}}@keyframes rd-bH{from{background-color:#0000}to{background-color:#0006}}.rd-ia{-webkit-animation:rd-bI .2s;animation:rd-bI .2s;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards}@-webkit-keyframes rd-bI{from{background-color:#0006}to{background-color:#0000}}@keyframes rd-bI{from{background-color:#0006}to{background-color:#0000}}.rd-ib{-webkit-animation:rd-bJ .2s;animation:rd-bJ .2s;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards}@-webkit-keyframes rd-bJ{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes rd-bJ{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}.rd-ic{-webkit-animation:rd-bK .2s;animation:rd-bK .2s;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards}@-webkit-keyframes rd-bK{from{transform:translateY(0);opacity:1}to{transform:translateY(-30px);opacity:0}}@keyframes rd-bK{from{transform:translateY(0);opacity:1}to{transform:translateY(-30px);opacity:0}}"
  );
  let f, g = 800;
  return d.extend({
    tmpl(t, i, d, l, o, a) {
      let n, h, c, p, u, {
        zIndex: f,
        width: g,
        closable: b,
        i18n: $,
        view: m
      } = t;
      return n = [i(s, {
        class: "rd-h9 rd-cI rd-dz rd-i_",
        style: "z-index:" + (f - 1),
        id: "_mx_mask_" + d
      })], p = [], b && (h = [e || (e = i(0, "\ue624"))], p.push(i("span", {
        class: "rd-bF rd-h6 rd-h8 rd-c3 rd-do rd-ec",
        title: $("lL"),
        _click: d + "\x1e_eX()"
      }, h))), r ? h = [r] : (c = [i(0, '<span class="rd-b0"></span>', 1)], h = [r = i(s, {
        $: "a/",
        class: "rd-b1 rd-cW rd-c0 rd-dk rd-cA"
      }, c)]), p.push(i(s, {
        $$: "#",
        _5: d,
        class: "rd-h5 rd-ct rd-el rd-cX",
        _: m + "?\x1e=" + a(o, t, "a/")
      }, h)), u = [i(s, {
        class: "rd-h7 rd-eu rd-cZ",
        id: "_mx_body_" + d,
        style: `width:${g}px`
      }, p)], n.push(i(s, {
        class: "rd-eD rd-cI rd-eC rd-dU rd-cz rd-cA rd-cW rd-dz rd-bN rd-cS rd-ib rd-cR",
        style: "z-index:" + f,
        tabindex: 0,
        id: "_mx_scroll_" + d
      }, u)), i(d, 0, n)
    },
    init(t) {
      let {
        root: e
      } = this;
      var r;
      this.on("destroy", (() => {
        (t => {
          let e, r = f;
          for (; r;) {
            if (r.bF == t) {
              e ? e.bG = r.bG : f = r.bG;
              break
            }
            e = r, r = r.bG
          }
        })(this), g -= 2, a(e, "_kJ"), e.remove()
      })), this.set(t), g += 2, r = this, f = f ? {
        bF: r,
        bG: f
      } : {
        bF: r
      }
    },
    async render() {
      await this.digest({
        zIndex: g
      });
      let t = o(`_mx_scroll_${this.id}`);
      null == t || t.focus()
    },
    _kK() {
      let t = this.id,
        {
          classList: e
        } = o("_mx_scroll_" + t);
      e.add("rd-ic"), ({
        classList: e
      } = o("_mx_mask_" + t)), e.add("rd-ia")
    },
    "_eX<click>"() {
      a(this.root, "_kL")
    },
    "$doc<keyup>"(t) {
      if ("Escape" == t.code) {
        let t = null == f ? void 0 : f.bF;
        t == this && t.get("closable") && a(this.root, "_kL")
      }
    }
  }).static({
    _kN(t) {
      let e = h("_mx_dlg_");
      document.body.insertAdjacentHTML("beforeend", '<div id="' + e +
        '" class="rd-bG rd-bH"/>');
      let r = o(e),
        i = this.owner.mount(r, "66/80/5r", t),
        s = async () => {
          r._kM || (r._kM = 1, i.invoke("_kK"), p(r, "_kL", s), await u(200), i.unmount())
        };
      return c(r, "_kL", s), r
    },
    alert(t, e, r) {
      this.confirm(t, e, null, r, "alert")
    },
    confirm(t, e, r, i, s = "confirm") {
      this.mxDialog({
        view: "66/80/" + s,
        body: t,
        cancel: r,
        enter: e,
        title: i,
        modal: !0
      })
    },
    mxDialog(t, e) {
      let r = this,
        {
          unlock: i,
          view: s
        } = t,
        d = "_kO" + s;
      if (i || !r[d]) {
        i || (r[d] = 1);
        let s = r._kN({
            width: 400,
            closable: !0,
            _close() {
              a(s, "_kL")
            },
            ...t
          }),
          l = () => {
            delete r[d], p(s, "_kJ", l), null == e || e()
          };
        c(s, "_kJ", l)
      }
    }
  })
})), s.d("66/6l/5r", ["5u"], (t => {
  let e = t("5u"),
    {
      applyStyle: r,
      guid: i,
      node: s,
      mark: d,
      delay: l
    } = e;
  r("rd-iA",
    ".rd-iL{z-index:2000}.rd-iM{background:#0002}.rd-iN{border-radius:5px;background:#0008;padding:6px;color:#fff;min-width:15%}@-webkit-keyframes rd-bL{from{opacity:1}to{opacity:0}}@keyframes rd-bL{from{opacity:1}to{opacity:0}}.rd-iO{-webkit-animation:rd-bL .2s;animation:rd-bL .2s;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards}"
  );
  let o = i("_mx_toast_");
  return {
    async show(t, e, r) {
      let i = s(o);
      i || (i = document.createElement("div"), i.id = o, i.className =
        "rd-iL rd-bG rd-bH rd-cI rd-dz rd-cW rd-c0 rd-dk rd-cP", i.innerHTML =
        `<div class="rd-iN rd-cE" id="${o}_c"></div>`, document.body.appendChild(i));
      let {
        classList: a
      } = i;
      d(this, "_cb");
      let n = d(this, "_ly");
      a.remove("rd-dJ", "rd-iO"), r ? (a.remove("rd-cK"), a.add("rd-iM")) : (a.add("rd-cK"), a.remove(
        "rd-iM")), s(o + "_c").innerText = t, e && (await l(e), n() && this.hide())
    },
    async hide() {
      let t = s(o),
        e = d(this, "_cb");
      null == t || t.classList.add("rd-iO"), await l(200), e() && (null == t || t.classList.add(
        "rd-cK", "rd-dJ"))
    }
  }
})), s.d("66/99/5r", ["5u", "../../6b/5r", "../9e/5r"], (t => {
  let e, r = t("5u"),
    i = t("../../6b/5r"),
    s = t("../9e/5r"),
    d = "span",
    l = "div",
    o = {
      class: "rd-bF rd-io"
    },
    a = {
      class: "rd-bF rd-io rd-dY"
    },
    n = {
      class: "rd-dP rd-eo"
    },
    h = {
      value: "value"
    },
    {
      View: c,
      applyStyle: p,
      toMap: u,
      inside: f,
      node: g,
      dispatch: b,
      isFunction: $
    } = r;
  p("rd-ik",
    ".rd-id{min-width:50px;height:22px}.rd-ie:focus,.rd-ie:focus:hover{border-color:var(--rd-bF)}.rd-if{padding:0 16px 0 3px}.rd-ig{background-color:#f5f5f5}.rd-ig .rd-if{cursor:not-allowed;color:#999}.rd-ih{top:0;width:16px;color:#ccc}.rd-ih::after{left:0;top:0;right:0;bottom:0;width:0;height:0;position:absolute;border-left:4px solid transparent;border-right:4px solid transparent;border-top:4px solid #ccc;content:'';display:block;margin:auto}.rd-ii .rd-ih{transform:rotate(180deg)}.rd-ii,.rd-ii:hover{border-color:var(--rd-bF)}.rd-ij{height:20px;line-height:21px}.rd-ik{border:1px solid #ccc;top:100%;min-width:calc(100% + 2px);max-width:160%;max-height:228px}.rd-il-left{left:-1px}.rd-il-right{right:-1px}.rd-ii .rd-ik{display:block}.rd-im{padding:0 5px;height:20px;line-height:20px}.rd-im:hover{background-color:#f0f0f0}.rd-in,.rd-in:active,.rd-in:focus,.rd-in:hover{color:#fff;background-color:var(--rd-bF)}.rd-io{padding:0 4px}.rd-ip{padding-top:0}.rd-iq{box-shadow:0 2px 2px #0002}"
  );
  return c.extend({
    tmpl({
           disabled: t,
           dt: r,
           selectedText: i,
           i18n: s,
           selected: c,
           selectedIcon: p,
           rList: u,
           dock: f,
           search: g,
           kw: b,
           list: $,
           textKey: m,
           valueKey: y,
           iconKey: x
         }, _, w, k, v, L) {
      let F, S, C, H, M, G, T;
      T = [];
      let A = r ? i : s(i);
      if (M = [], p && (H = [_(0, p, 1)], M.push(_("i", o, H))), M.push(_(0, A)), C =
        "rd-ij rd-cM rd-cT rd-dv", "" === c && (C += " rd-dP"), G = [_(d, {
        class: C
      }, M)], e ? G.push(e) : G.push(e = _(d, {
        $: "a/",
        class: "rd-ih rd-cG rd-cA rd-d3 rd-dF"
      })), T.push(_(l, {
        class: "rd-if rd-do rd-cH rd-cz",
        _click: w + "\x1e_bK()",
        title: A
      }, G)), u) {
        if (G = [], g && (M = [_("input", {
          class: "rd-bK rd-cz",
          placeholder: s("lM"),
          value: b,
          _input: w + "\x1e_dJ()",
          _change: w + "\x1e_fm()"
        }, 1, h)], G.push(_(l, {
          id: "si_" + w,
          class: "rd-c3 rd-c4 rd-ct rd-eo rd-dF"
        }, M))), null == $ ? void 0 : $.length)
          for (let t = null == $ ? void 0 : $.length, e = 0; e < t; e += 1) {
            let t = $[e],
              i = r ? t[m] : s(t[m]),
              d = t[y],
              o = t[x],
              n = d + "" == c + "";
            M = [], o && (H = [_(0, o, 1)], M.push(_("i", a, H))), M.push(_(0, i)), C =
              "rd-im rd-ci rd-eu rd-cM rd-dQ rd-do rd-cT rd-dv", n && (C += " rd-in"),
              G.push(_(l, {
                title: i,
                style: null != (F = t.style) && F,
                _click: w + `\x1e_kX({item:'${L(v,t,`a/.${e}.a;`)}'})`,
                class: C
              }, M))
          } else b && (M = [_(0, `\u672a\u641c\u7d22\u5230\u201c${b}\u201d`)], G.push(_(l,
          n, M)));
        C = `rd-ik rd-eq rd-il-${f} rd-c6 rd-ct rd-eu rd-cG rd-eN rd-dU rd-cQ rd-cS rd-d8`,
        g && (C += " rd-ip"), T.push(_(l, {
          id: "_mx_list_" + w,
          _scroll: g && w + "\x1e_cE()",
          class: C
        }, G))
      }
      return C = "rd-id rd-bN rd-eJ rd-ct rd-eu rd-cz rd-cP rd-cH", C += t ?
        " rd-ig rd-eK rd-dN" : " rd-ie", S = [_(l, {
        id: "_mx_dd_" + w,
        tabindex: !t && 0,
        class: C
      }, T)], _(w, 0, S)
    },
    init() {
      s._kf(), this.on("destroy", (() => {
        s._dX(this), s._kg()
      }))
    },
    _kV(t, e, r) {
      let s = this._kU;
      if (t) {
        let d = [];
        for (let l of s) {
          (i(l[e]).includes(t) || l[r].includes(t)) && d.push(l)
        }
        return d
      }
      return s
    },
    assign(t) {
      let {
        selected: e,
        textKey: r = "text",
        valueKey: i = "value",
        iconKey: s = "",
        disabled: d,
        dock: l = "left",
        list: o = [],
        kw: a = "",
        search: n,
        props: h,
        dt: c
      } = t;
      $(o) && (o = o(h));
      let p = u(o, i);
      p[e] || (e = o[0][i]);
      let f = p[e],
        g = f[r],
        b = s ? f[s] : "";
      this._kU = o, this.set({
        dt: c,
        dock: l,
        kw: a,
        search: n || o.length > 19,
        selected: e,
        selectedText: g,
        selectedIcon: b,
        list: this._kV(a, r, i),
        iconKey: s,
        textKey: r,
        valueKey: i,
        disabled: d
      })
    },
    render() {
      this.digest()
    },
    _ku(t) {
      return f(t, this.root)
    },
    _kW() {
      var t;
      let e = g("_mx_list_" + this.id),
        r = e.querySelector("div.rd-in");
      if (r) {
        null === (t = r.scrollIntoViewIfNeeded) || void 0 === t || t.call(r);
        let i = r.getBoundingClientRect(),
          s = e.getBoundingClientRect();
        i.y - s.y < 31 && e.scrollBy(0, i.y - s.y - 31)
      }
    },
    async _ca() {
      let {
        classList: t
      } = g("_mx_dd_" + this.id);
      if (!t.contains("rd-ii")) {
        t.add("rd-ii"), this.get("rList") || await this.digest({
          rList: !0
        }), s._kv(this), this._kW()
      }
    },
    _cb() {
      let {
        classList: t
      } = g("_mx_dd_" + this.id);
      t.contains("rd-ii") && (t.remove("rd-ii"), s._dX(this))
    },
    "_bK<click>"() {
      let {
        classList: t
      } = g("_mx_dd_" + this.id);
      t.contains("rd-ii") ? this._cb() : t.contains("rd-ig") || this._ca()
    },
    "_kX<click>"({
                   params: {
                     item: t
                   }
                 }) {
      this._cb();
      let e = this.get("valueKey"),
        r = this.get("selected"),
        i = t[e];
      if (r !== i) {
        let e = this.get("textKey"),
          r = this.get("iconKey"),
          s = t[e],
          d = t[r];
        this.digest({
          selected: i,
          selectedIcon: d,
          selectedText: s
        }), b(this.root, "change", {
          item: t,
          value: i,
          text: s
        })
      }
    },
    "_cE<scroll>&{capture:true}"({
                                   eventTarget: t
                                 }) {
      let e = g(`si_${this.id}`);
      if (e) {
        let {
          classList: r
        } = e, i = "rd-iq";
        0 != t.scrollTop ? r.add(i) : r.remove(i)
      }
    },
    async "_dJ<input>"(t) {
      let {
        value: e
      } = t.eventTarget, r = this.get("textKey"), i = this.get("valueKey");
      await this.digest({
        kw: e,
        list: this._kV(e, r, i)
      }), this._kW()
    }
  })
})), s.d("66/96/5r", ["5u", "../6a/5r"], (t => {
  let e = t("5u"),
    r = t("../6a/5r"),
    i = "span",
    {
      node: s,
      View: d,
      applyStyle: l,
      has: o,
      mark: a,
      dispatch: n,
      isFunction: h,
      delay: c
    } = e,
    p = Number.MAX_SAFE_INTEGER;
  l("rd-ip",
    ".rd-ix{border:none;background:0 0;padding:0 10px 0 0;font-size:100%}.rd-ix:disabled{cursor:not-allowed;color:#999;background:#f5f5f5}.rd-iy,.rd-iz{width:16px;height:50%;border:2px solid #fff}.rd-iy:hover,.rd-iz:hover{background-color:#f0f0f0}.rd-iy{top:1px}.rd-iz{bottom:1px}.rd-iA::after{width:0;height:0;position:absolute;left:0;top:0;right:0;bottom:0;border-left:4px solid transparent;border-right:4px solid transparent;content:'';display:block;margin:auto}.rd-iz:after{border-top:4px solid #ccc}.rd-iy:after{border-bottom:4px solid #ccc}.rd-iy.rd-iB,.rd-iz.rd-iB{border-color:#0000}.rd-iy.rd-iB:hover,.rd-iz.rd-iB:hover{background:0 0}.rd-iC{color:#e6e6e6}"
  );
  let u = t => t.shiftKey ? 1 : t.metaKey || t.ctrlKey ? 2 : 0;
  return d.extend({
    tmpl({
           disabled: t
         }, e, r) {
      let s, d;
      return s = [e("input", {
        class: "rd-ix rd-cM rd-cz rd-cA rd-bN",
        id: "_mx_ipt_" + r,
        _focusin: r + "\x1e_lh()",
        _focusout: r + "\x1e_lj()",
        _change: r + "\x1e_fm()",
        _keydown: r + "\x1e_ln()",
        disabled: t,
        autocomplete: "off",
        _input: r + "\x1e_lp()",
        _wheel: r + "\x1e_lo()"
      }, 1)], d = "rd-iy rd-eu rd-d3 rd-cG rd-iA rd-cP rd-do rd-eB", t && (d +=
        " rd-iB rd-dN "), s.push(e(i, {
        _click: r + "\x1e_ld({i:1})",
        _pointerdown: r + "\x1e_lm({i:1})",
        _contextmenu: r + "\x1e_eB()",
        class: d
      })), d = "rd-iz rd-eu rd-d3 rd-cG rd-iA rd-cP rd-do rd-eB", t && (d +=
        " rd-iB rd-dN "), s.push(e(i, {
        _click: r + "\x1e_ld()",
        _pointerdown: r + "\x1e_lm()",
        _contextmenu: r + "\x1e_eB()",
        class: d
      })), e(r, 0, s)
    },
    init() {
      this.on("destroy", (() => {
        r._bZ(this._k1)
      }))
    },
    assign({
             max: t = p,
             min: e = -p,
             fixed: r = 0,
             step: i = 1,
             props: s,
             empty: d,
             ratio: l = 10,
             value: o,
             keep: a = 1,
             disabled: n
           }) {
      let c = this,
        {
          root: {
            classList: u
          }
        } = c;
      if (u[n ? "add" : "remove"]("rd-bP"), u.contains("rd-bM")) {
        if (a) return c._k2 = c._la(o), !1
      } else delete c._k2, h(t) && ( //!important callback with props
        t = t(s)), h(e) && (e = e(s)), h(r) && (r = r(s)), h(i) && (i = i(s)), c._k3 = +
        i, c._k4 = d, c._k5 = n, c._k6 = "" === t ? p : +t, c._k7 = "" === e ? -p : +e, c._k8 = +
        l || 10, c._k9 = +r || 0, c._l_ = c._la(o)
    },
    async render() {
      let {
        root: t
      } = this, e = a(this, "_bF");
      await this.digest({
        disabled: this._k5
      }), e() && !t.classList.contains("rd-bM") && this._lb()
    },
    _lb(t) {
      var e;
      return t = null != t ? t : null !== (e = this._k2) && void 0 !== e ? e : this._l_, s(
        "_mx_ipt_" + this.id).value = t, t
    },
    _la(t) {
      if (this._k4 && "" === t) return t;
      let e = this._k7;
      if ((t = +t) || 0 === t) {
        let r = this._k6;
        t > r ? t = r : t < e && (t = e), t = +t.toFixed(this._k9)
      }
      let r = this.get("mmax");
      return isNaN(t) ? this._k4 ? "" : r(e, 0) : t
    },
    _lc(t, e) {
      if ("" !== t || !this._k4) return (t = this._la(t)) !== this._l_ && (e || this._lb(t),
        n(this.root, "input", {
          value: this._l_ = t
        })), this._l_;
      n(this.root, "input", {
        value: this._l_ = t
      })
    },
    _ld(t, e) {
      let r = this._l_;
      "" === r && (r = 0);
      let i = this._k3;
      if (e)
        if (1 == e) i *= this._k8;
        else {
          let t = this._k9,
            e = +(i / this._k8).toFixed(t);
          0 != e && (i = e)
        } t ? r += i : r -= i, this._lc(r)
    },
    _le() {
      let t = s("_mx_ipt_" + this.id);
      t && (t.focus(), t.selectionStart = t.selectionEnd = t.value.length)
    },
    _lg() {
      this.root.classList.add("rd-bM"), o(this, "_lf") || (this._lf = this._l_)
    },
    "_lh<focusin>"() {
      this._lg()
    },
    "_lj<focusout>"() {
      var t, e;
      if (!this._li) {
        let {
          root: r
        } = this;
        r.classList.remove("rd-bM");
        let i = null !== (t = this._k2) && void 0 !== t ? t : this._lf,
          s = this._l_;
        this._l_ = this._lb(), i != s && n(r, "change", {
          will: null !== (e = this._k2) && void 0 !== e ? e : s,
          value: s
        }), delete this._k2, delete this._lf
      }
    },
    "_ld<click>"(t) {
      this._k5 || this._lk || (this._ld(t.params.i, u(t)), this._le())
    },
    async "_lm<pointerdown>"(t) {
      if (!this._k5) {
        this._li = 1, this._lg();
        let e = t.params.i,
          i = a(this, "_ll");
        await c(300), i() && r._b0(30, this._k1 = () => {
          i() && (this._lk = 1, this._ld(e, u(t)), this._le())
        })
      }
    },
    "_ln<keydown>&{passive:false}"(t) {
      "ArrowUp" != t.code && "ArrowDown" != t.code || (this._ch(t), this._ld("ArrowUp" == t.code,
        u(t)))
    },
    "_lo<wheel>&{passive:false}"(t) {
      this.root.classList.contains("rd-bM") && (this._ch(t), this._ld(t.deltaY < 0, u(t)))
    },
    "_lp<input>"(t) {
      this._fl(t);
      let e = t.eventTarget;
      this._lc(e.value, 1)
    },
    async "$doc<pointerup>"() {
      a(this, "_ll"), r._bZ(this._k1), delete this._li;
      let t = a(this, "_lq");
      await c(0), t() && delete this._lk
    }
  })
})), s.d("66/96/9c", ["5u", "./5r"], (t => {
  let e = t("5u");
  t("./5r");
  let r, i = "disabled,value",
    s = "rd-db rd-bK rd-cH",
    d = "div",
    l = {
      class: "rd-cW"
    },
    {
      View: o,
      dispatch: a
    } = e;
  return o.extend({
    tmpl({
           disabled: t,
           value: e
         }, o, a, n, h, c) {
      let p, u, f;
      return f = [o(d, {
        $$: i,
        _5: a,
        class: s,
        _input: a + "\x1e_lr({i:0})",
        _change: a + "\x1e_fm()",
        _: `66/96/5r?disabled=${c(h,t,"a/")}&value=` + c(h, e[0], "a;")
      })], r ? f.push(r) : (u = [o(0, "~")], f.push(r = o("span", {
        $: "a/",
        class: "rd-cV rd-iC rd-cE"
      }, u))), f.push(o(d, {
        $$: i,
        _5: a,
        class: s,
        _input: a + "\x1e_lr({i:1})",
        _change: a + "\x1e_fm()",
        _: `66/96/5r?disabled=${c(h,t,"a/")}&value=` + c(h, e[1], "a:")
      })), p = [o(d, l, f)], o(a, 0, p)
    },
    assign(t) {
      t.value || (t.value = []), this.set(t)
    },
    render() {
      this.digest()
    },
    "_lr<input>"(t) {
      this._fl(t);
      let {
        i: e
      } = t.params, r = this.get("value");
      r[e] = t.value, a(this.root, "input", {
        pair: r
      })
    }
  })
})), s.d("66/9e/5r", ["5u"], (t => {
  let e, r, i = t("5u"),
    {
      node: s,
      attach: d,
      detach: l
    } = i,
    o = 0,
    a = ["pointerdown", "keyup", "keydown"],
    n = document,
    h = window,
    c = {
      capture: !1,
      passive: !0
    },
    p = t => {
      let e = r;
      for (; e;) {
        let r = e.bF;
        "resize" != t.type && "blur" != t.type && r._ku(t.target) || r._cb(), e = e.bG
      }
    };
  return {
    _kv: t => {
      r = r ? {
        bF: t,
        bG: r
      } : {
        bF: t
      }
    },
    _dX: t => {
      let e, i = r;
      for (; i;) {
        if (i.bF == t) {
          e ? e.bG = i.bG : r = i.bG;
          break
        }
        e = i, i = i.bG
      }
    },
    _kf() {
      if (!o) {
        e || (e = s("_rd_stage"));
        for (let t of a) d(n, t, p, c);
        d(h, "resize", p, c), d(h, "blur", p, c), d(h, "scroll", p, c), e && d(e, "scroll", p, c)
      }
      o++
    },
    _kg() {
      if (o > 0 && (o--, !o)) {
        for (let t of a) l(n, t, p, c);
        l(h, "resize", p, c), l(h, "blur", p, c), l(h, "scroll", p, c), e && l(e, "scroll", p, c)
      }
    }
  }
})), s.d("66/6a/fx", ["5u", "./5r"], (t => {
  let e = t("5u"),
    r = t("./5r"),
    {
      Base: i,
      now: s
    } = e;
  return i.extend({
    ctor(t, e) {
      this._lu = (e, r) => {
        return e + (r - e) * ((i = this._lv / t) * i);
        var i
      }, this._cw = () => {
        this._lv = s() - this._lw, this._lv > t && (this._lv = t, this._fm()), e(this._lu)
      }
    },
    _gi() {
      this._lx || (this._lx = 1, this._lw = s(), r._b0(10, this._cw))
    },
    _fm() {
      this._lx && (this._lx = 0, r._bZ(this._cw))
    }
  })
})), s.d("66/6a/5r", ["5u"], (t => {
  let e, r, i, s, d = t("5u"),
    {
      toTry: l,
      now: o
    } = d,
    {
      port1: a,
      port2: n
    } = new MessageChannel,
    h = requestAnimationFrame;
  return {
    _b0(t, r) {
      let s = {
        bF: o(),
        bG: t || 15,
        bH: r
      };
      i && (s.bI = i), i = s, (() => {
        if (!e) {
          let t = () => {
            let r = i;
            for (; r;) {
              let t = o();
              t - r.bF >= r.bG && (r.bF = t, l(r.bH)), r = r.bI
            }
            e = i ? h(t) : 0
          };
          e = h(t)
        }
      })()
    },
    _bZ(t) {
      let e, r = i;
      for (; r;) {
        if (r.bH == t) {
          e ? e.bI = r.bI : i = r.bI;
          break
        }
        e = r, r = r.bI
      }
    },
    _en(t, e) {
      let i = {
        bF: o(),
        bG: t || 15,
        bH: e
      };
      s && (i.bI = s), s = i, r || (a.onmessage = () => {
        let t = s;
        for (; t;) {
          let e = o();
          e - t.bF >= t.bG && (t.bF = e, l(t.bH)), t = t.bI
        }
        s ? n.postMessage(null) : r = 0
      }, r = 1, n.postMessage(null))
    },
    _ek(t) {
      let e, r = s;
      for (; r;) {
        if (r.bH == t) {
          e ? e.bI = r.bI : s = r.bI;
          break
        }
        e = r, r = r.bI
      }
    }
  }
})), s.d("8a/5r", ["5u", "../5s/60", "../5s/7r", "../66/80/5r", "../66/6l/5r", "../6b/5r", "../6c/83", "../6c/fs",
  "../6c/6d", "../6c/html2canvas", "../6c/9u", "./6d/5r", "./6d/9v", "./a0/5r", "./a1/5r", "./a2/a3",
  "./a2/a4", "./a2/data-celltable", "./a2/data-coltable", "./a2/data-dtable", "./a2/data-ftable",
  "./a2/data-repeater", "./a2/richtext", "66/99/5r"], (t => {
  let e = t("5u"),
    r = t("../5s/60"),
    i = t("../5s/7r"),
    s = t("../66/80/5r"),
    d = t("../66/6l/5r"),
    l = t("../6b/5r"),
    o = t("../6c/83"),
    a = t("../6c/fs"),
    n = t("../6c/6d"),
    h = t("../6c/html2canvas"),
    c = t("../6c/9u"),
    p = t("./6d/5r"),
    u = t("./6d/9v"),
    f = t("./a0/5r"),
    g = t("./a1/5r"),
    b = t("./a2/a3"),
    $ = t("./a2/a4"),
    m = t("./a2/data-celltable"),
    y = t("./a2/data-coltable"),
    x = t("./a2/data-dtable"),
    _ = t("./a2/data-ftable"),
    w = t("./a2/data-repeater"),
    k = t("./a2/richtext");
  t("66/99/5r");
  let v, L, F, S, C, H = "rd-bQ rd-dv rd-bN rd-do rd-ck",
    M = "button",
    G = "a;",
    T = "rd-kA rd-c9",
    A = "div",
    z = "rd-bQ rd-dv rd-bN rd-do rd-bS",
    P = "rd-cz rd-ky",
    j = "application/pdf",
    I = "embed",
    B = "rd-b5 rd-cB",
    D = {
      class: "rd-kC rd-cI rd-dl rd-ct rd-d8 rd-cW rd-c0"
    },
    N = {
      class: "rd-kF rd-cW rd-c0 rd-cY"
    },
    R = {
      class: "rd-kH rd-d0"
    },
    W = {
      class: "rd-kL rd-cG rd-dz rd-cW rd-c0 rd-dk rd-cK"
    },
    {
      State: O,
      View: Y,
      lowTaskFinale: E,
      has: V,
      applyStyle: U,
      parseUrl: K,
      config: J,
      mark: X,
      delay: q,
      task: Z,
      toUrl: Q
    } = e;
  let {
    min: tt
  } = Math;
  U("rd-jW",
    ".rd-kt{background:#eee}.rd-ku{page-break-after:auto;page-break-inside:avoid}.rd-kv{width:120px}.rd-kw{width:350px}.rd-kx{margin-top:20px}.rd-ky{height:calc(100vh - 45px)}.rd-kz{box-shadow:-1px -1px 4px #0000002b}.rd-kA{height:30px;background:linear-gradient(#ddd4,#ddd 30%,#ddd 70%,#ddd4);margin:4px 20px}.rd-kB{box-shadow:0 0 6px 0 rgba(0,0,0,.2);right:0;top:44px;height:calc(100vh - 50px);width:440px}@page{margin:0}@media screen{.rd-kC{box-shadow:0 0 6px 0 rgba(0,0,0,.3);height:36px;padding-right:50px;left:0;top:0;right:0;bottom:auto}.rd-kD{margin:60px 0 40px}.rd-kE{margin:38px 0 0}.rd-kF{padding:0 20px}.rd-kG{margin:44px 0 0;width:calc(100vw - 450px);height:calc(100vh - 50px);box-shadow:0 2px 6px 2px rgba(0,0,0,.2)}.rd-kH{height:120px;line-height:120px}.rd-kI{box-shadow:0 2px 6px 2px rgba(0,0,0,.2);contain:paint}.rd-kJ{background:#eee}.rd-kK{margin:5px auto}.rd-kL{opacity:0}}@media print{.rd-kC{display:none}.rd-kL{color:red;font-size:30px;opacity:1}body{min-width:auto}.rd-kK{margin:0}.rd-kD{padding:0;display:block}.rd-kG{margin:0;width:100vw;height:100vh}.rd-kJ{display:none}.rd-kI{box-shadow:none}.rd-kF{display:block;padding:0}}"
  );
  let et = document,
    rt = et.documentElement,
    it = [{
      text: "\u7f51\u9875",
      value: "web"
    }, {
      text: "\u56fe\u7247",
      value: "image"
    }, {
      text: "PDF",
      value: "pdf"
    }];
  it.push({
    text: "\u56fe\u7247-RDS\u670d\u52a1",
    value: "rdImage"
  }, {
    text: "PDF-RDS\u670d\u52a1",
    value: "rdPdf"
  });
  return Y.extend({
    tmpl({
           d: t,
           approve: e,
           inner: r,
           i18n: i,
           empty: s,
           format: d,
           sf: l,
           enable: o,
           rds: a,
           hasData: n,
           loading: h,
           page: c,
           unit: p,
           pdf: u,
           rdPdf: f,
           pages: g,
           images: b,
           rdImages: $
         }, m, y, x, _, w) {
      let k, O, Y, E, V, U, K, J, X;
      if (V = [], v ? V.push(v) : (Y = [m(0, "\u6253\u5370\u9884\u89c8")], V.push(v = m("h5", {
        $: "a/",
        class: "rd-en rd-dZ rd-bJ rd-cV rd-cb"
      }, Y))), !t && e || (r && (Y = [m(0, i("mn"))], V.push(m(M, {
        class: H,
        _click: y + "\x1e_oH()"
      }, Y))), Y = [m(0, i("mm"))], V.push(m(M, {
        class: H,
        _click: y + "\x1e_oC()"
      }, Y)), L ? V.push(L) : V.push(L = m(A, {
        $: G,
        class: T
      }))), Y = [m(0, i("mh"))], V.push(m(A, 0, Y)), E = "66/99/5r?", (k = s) && (E +=
        `disabled=${w(_,k,"a/")}&`), E += `list=${w(_,d,"a;")}&selected=` + x(l), V.push(
        m(A, {
          $$: "format,empty",
          _5: y,
          class: "rd-kv rd-ck rd-b7",
          _change: y + "\x1e_oB()",
          _: E
        })), Y = [m(0, i("da"))], V.push(m(M, {
        disabled: "pdf" != l && "rdPdf" != l && !o,
        class: "rd-bQ rd-dv rd-bN rd-do rd-bS rd-ck",
        _click: y + "\x1e_oJ()"
      }, Y)), Y = [F || (F = m(0, "Lodop\u8bbe\u7f6e"))], V.push(m(M, {
        disabled: !o,
        class: H,
        _click: y + "\x1e_ok()"
      }, Y)), Y = [S || (S = m(0, "Lodop\u6253\u5370"))], V.push(m(M, {
        disabled: !o || s,
        class: z,
        _click: y + "\x1e_on()"
      }, Y)), a && (L ? V.push(L) : V.push(L = m(A, {
        $: G,
        class: T
      })), Y = [m(0, i("ml"))], V.push(m(M, {
        disabled: !o,
        class: H,
        _click: y + "\x1e_oD()"
      }, Y)), Y = [m(0, i("mk"))], V.push(m(M, {
        disabled: !o,
        class: z,
        _click: y + "\x1e_oG()"
      }, Y))), L ? V.push(L) : V.push(L = m(A, {
        $: G,
        class: T
      })), Y = [m(0, i("mg"))], V.push(m(M, {
        disabled: !o,
        class: z,
        _click: y + "\x1e_ea()"
      }, Y)), O = [m(A, D, V)], Y = [], n)
        if (h) K = [m(0, i("mj"))], J = [m(A, R, K)], Y.push(m(A, {
          class: "rd-cH rd-kI rd-kK rd-cW rd-dk rd-dS",
          style: `width:${c.width}${p};height:${c.height}${p};border-radius:${c.radius};background:` +
            c.background
        }, J));
        else if ("pdf" == l) Y.push(m(I, {
          src: u,
          class: P,
          type: j
        }, 1));
        else if ("rdPdf" == l) Y.push(m(I, {
          src: f,
          class: P,
          type: j
        }, 1));
        else
          for (let t = null == g ? void 0 : g.length, r = t - 1, i = 0; i < t; i += 1) {
            let t = g[i],
              s = i === r;
            if (J = [], "web" == l)
              for (let e = null == t ? void 0 : t.length, r = 0; r < e; r += 1) {
                let e = t[r];
                J.push(m(A, {
                  $$: "pages,unit",
                  _5: y,
                  class: "rd-cO",
                  _: `6o/${e.type}/5r?props=${w(_,e.props,`a:.${i}.a-.${r}.b_`)}&unit=` +
                    w(_, p, "ba")
                }))
              } else "image" == l && b ? J.push(m("img", {
              class: B,
              src: b[i]
            }, 1)) : "rdImage" == l && $ && J.push(m("img", {
              class: B,
              src: $[i]
            }, 1));
            e || (K = [m(0, window.atob("dW5hdXRob3JpemVk"))], J.push(m(A, W, K))), U =
              "rd-cH rd-kI rd-kK rd-dS", s || (U += " rd-ku"), X =
              `width:${c.width}${p};height:${c.height}${p};border-radius:${c.radius};background:${c.background};`,
            !c.preformat && c.backgroundImage && (X +=
              `background-image:url(${c.backgroundImage});background-repeat:${"full"==c.backgroundRepeat?"no-repeat":c.backgroundRepeat};background-size:`,
              "full" == c.backgroundRepeat ? X += "100% 100%" : X += c.backgroundWidth +
                p +
                ` ${c.backgroundHeight}${p};background-position:${c.backgroundXOffset}${p} ` +
                c.backgroundYOffset + p), Y.push(m(A, {
              role: "page-content",
              class: U,
              style: X
            }, J))
          } else J = [m(0, i("mi"))], Y.push(m(A, R, J));
      return V = [m(A, N, Y)], U = "", U += "pdf" == l || "rdPdf" == l ? "rd-kE" :
        "rd-kD rd-cW rd-dk", O.push(m(A, {
        id: "c_" + y,
        class: U
      }, V)), C ? O.push(C) : O.push(C = m(A, {
        $: "a:",
        id: "_rd_tip",
        class: "rd-kz rd-d5 rd-cI rd-em rd-ct rd-eN rd-d3"
      })), m(y, 0, O)
    },
    init() {
      rt.classList.add("rd-cQ", "rd-dV", "rd-kt"), this._og()
    },
    _og() {
      document.title = l("cn")
    },
    async render() {
      et.rdState = 1;
      let t = top != self;
      if (this.set({
        inner: t,
        rds: !0,
        approve: !1,
        d: !1,
        format: it,
        hasData: !1,
        empty: !0,
        sf: "web"
      }), t || await this.digest(), et.rdState |= 2, J("getContentUrl") && !t) {
        (new i).all("_er", ((t, e) => {
          if (!t) {
            let t = e.get("data");
            this._oh(t)
          }
        }))
      }
    },
    async _oj(t, e, r, i, s) {
      let d = 0,
        l = this._oi,
        o = this.get("unit"),
        a = O.get("cc"),
        h = O.get("bZ"),
        c = O.get("b0");
      for (let e of t) "data-dtable" != e.type && "data-ftable" != e.type || p._ob(e);
      let u = (t, e) => {
        for (let r = t.length; r--;) {
          let i = t[r];
          if (("data-coltable" == i.type || "data-celltable" == i.type ||
            "data-dtable" == i.type || "data-rdtable" == i.type ||
            "batch-barcode" == i.type || "batch-qrcode" == i.type ||
            "batch-text" == i.type || "data-repeater" == i.type ||
            "data-ftable" == i.type || "richtext" == i.type || "html" == i.type ||
            "data-richtext" == i.type) && -1 != e[r]) return !0
        }
        return !1
      };
      for (; d < e.pages;) {
        let f = d * e.height,
          g = p._n3(e, d, t, c);
        d++;
        let v = {},
          L = async (t, e, i) => {
            var d;
            let u = [];
            for (let g = 0; g < t.length; g++) {
              let F = t[g],
                S = i ? F : {
                  type: F.type,
                  id: F.id,
                  props: n.bJ(F.props)
                };
              if (i || (S.props.x += h, S.props.y += c, S.props.y -= f),
              "pager" == F.type) S.props.ext._currentPage = r.length + 1,
              i || u.push(S), s(F.type, S, F.id);
              else if ("number" == F.type) i || u.push(S), s(F.type, S, F.id);
              else if ("data-coltable" == F.type) {
                let t = v[g] || 0; - 1 != t && (v[g] = y(S, t, e, a, u, i))
              } else if ("data-celltable" == F.type)
                if (i) m(S, 0, u, i);
                else {
                  let t = v[g] || 0; - 1 != t && (v[g] = m(S, t, u, i))
                }
              else if ("data-dtable" == F.type || "data-rdtable" == F.type) {
                let t = v[g] || 0; - 1 != t && (v[g] = await x(S, t, e, a,
                  o, u, i))
              } else if ("batch-barcode" == F.type || "batch-qrcode" == F.type ||
                "batch-text" == F.type) {
                let t = v[g] || 0; - 1 != t && (v[g] = await b(S, t, e, a,
                  u, i, o))
              } else if ("data-repeater" == F.type) {
                let t = v[g] || 0; - 1 != t && (v[g] = await w(S, t, e, a,
                  u, i))
              } else if ("data-ftable" == F.type) {
                let t = v[g] || 0; - 1 != t && (v[g] = await _(S, t, e, a,
                  l, u, i, o))
              } else if ("richtext" == F.type || "data-richtext" == F.type ||
                "html" == F.type) {
                let t = v[g] || 0; - 1 != t && (v[g] = await k(S, t, e, a,
                  l, o, u))
              } else F.props.bind ? $(S, u, l, i) : u.push(S);
              if (V(p._nY, F.type)) {
                let {
                  rows: t
                } = S.props;
                for (let r of t)
                  for (let t of r.cols)(null === (d = t.elements) || void 0 ===
                  d ? void 0 : d.length) && L(t.elements, e, 1)
              }
            }
            return await q(0), u
          };
        do {
          i && p._n0(`\u6b63\u5728\u8ba1\u7b97\u7b2c${r.length+1}\u9875`);
          let t = await L(g, e);
          r.push(t)
        } while (u(g, v))
      }
      i && p._n1()
    },
    async _oh(t) {
      if (!t) return void(et.rdState |= 4);
      let {
        page: e,
        elements: r = [],
        unit: i,
        vars: s
      } = t;
      if (!e || !i) return et.rdState |= 4, void this.digest();
      s && (rt.style.cssText = s), e.title && (et.title = e.title), d.show(
        "\u6b63\u5728\u51c6\u5907\u6570\u636e..."), o._bJ(), await this.digest({
        enable: !1,
        empty: !0,
        page: e,
        unit: i,
        hasData: !0,
        loading: !0
      });
      let l = e.xOffset,
        a = e.yOffset,
        n = [],
        h = new u;
      this._oi = h;
      let {
        _n9: c,
        _o_: f
      } = p._oa(r, h);
      O.set({
        bK: i,
        cc: c,
        bZ: l,
        b0: a
      }), await (t => {
        let e = [];
        for (let r of t) e.push(o._f6(r));
        return Promise.all(e)
      })(f), d.show("\u6b63\u5728\u51c6\u5907\u8d44\u6e90..."), await h._dM(), d.show(
        "\u6b63\u5728\u8ba1\u7b97\u5206\u9875...");
      let g = [],
        b = {};
      await this._oj(r, e, n, !0, ((t, e, r) => {
        if ("pager" == t) g.push(e);
        else if ("number" == t) {
          let t = b[r];
          t || (b[r] = t = []), t.push(e)
        }
      }));
      for (let {
        props: {
          ext: t
        }
      } of g) t._totalPage = n.length;
      for (let t in b) {
        let e = 0,
          r = b[t];
        for (let {
          props: {
            ext: t
          }
        } of r) t._fill = 1, t._index = e++, t._total = r.length
      }
      p._n6(n);
      let {
        copies: $ = 1
      } = e;
      if ($ > 1) {
        let t = n.slice();
        for (; $ > 1;) n.push(...t), $--
      }
      d.show("\u7b49\u5f85\u9875\u9762\u751f\u6210..."), await this.digest({
        stage: t,
        enable: !1,
        images: null,
        pdf: null,
        sf: "web",
        pages: n,
        loading: !1
      }), await p._oc(this.id), await q(200), await E(), d.show(
        "\u6b63\u5728\u68c0\u67e5\u56fe\u7247\u72b6\u6001..."), await p._n4(this.root),
        d.show("\u9a6c\u4e0a\u5c31\u597d..."), await this.digest({
        enable: !0,
        empty: !1
      }), d.hide(), et.rdState |= 4
    },
    "_ea<click>"() {
      print()
    },
    "_ok<click>"() {
      this.mxDialog({
        view: "8a/a0/9m",
        width: 600
      })
    },
    async "_on<click>"() {
      let t = X(this, "_ol"),
        e = this.get("page"),
        i = await f._om();
      if (t())
        if (i) {
          let t = et.getElementsByTagName("style"),
            s = ["<!DOCTYPE html>"];
          for (let e = 0; e < t.length; e++) {
            let r = t[e].innerHTML.trim();
            r && s.push(`<style>${r}</style>`)
          }
          let d = s.join(""),
            {
              width: l,
              height: o
            } = e;
          l = r.bU(l), o = r.bU(o), i.SET_PRINT_PAGESIZE(0, l + 1 + "px", o + 1 +
            "px", "report-designer"), i.SET_PRINT_MODE("POS_BASEON_PAPER", !0);
          let a = et.querySelectorAll('[role="page-content"]');
          for (let t = 0; t < a.length; t++) {
            let e = a[t];
            i.NewPage(), i.ADD_PRINT_HTM(0, 0, l + "px", o + "px",
              `${d}<div class="rd-cO rd-bG rd-bH">${e.outerHTML}</div>`)
          }
          i.PREVIEW()
        } else this.mxDialog({
          view: "8a/a0/6q",
          width: 550
        })
    },
    _op() {
      return new Promise((async t => {
        let e = this.get("images"),
          r = X(this, "_oo");
        if (e) t(e);
        else {
          "web" != this.get("sf") && (await this.digest({
            sf: "web"
          }), await E(), this.set({
            sf: "image"
          })), e = [];
          let i = {
              useCORS: !0,
              scale: devicePixelRatio
            },
            s = this.root.querySelectorAll(".rd-kI"),
            d = 0,
            l = s.length,
            o = 4;
          et.querySelectorAll("svg").length > 20 && (o = 2);
          let a = async () => {
            if (r()) {
              scrollTo(0, 0);
              let r = d + 1,
                n = tt(r + o - 1, l);
              p._n0(
                `\u8f6c\u6362\u8fdb\u5ea6\uff1a[${r}~${n}] / ${l}`
              ), await q(20);
              let h = [];
              for (; d < n;) h.push(html2canvas(s[d++], i));
              let c = await Promise.all(h);
              for (let t of c) e.push(t.toDataURL(
                "image/jpeg", 1));
              d < l ? (await q(0), a()) : (p._n1(), this.set({
                images: e
              }), t(e))
            }
          };
          a()
        }
      }))
    },
    async _or() {
      let t = this.get("images");
      if (t) this.digest({
        enable: !0
      });
      else {
        let e = X(this, "_oq");
        try {
          d.show("\u6b63\u5728\u52a0\u8f7d\u56fe\u7247\u8f6c\u6362\u63d2\u4ef6..."),
            await h(), e() && (d.show(
            "\u6b63\u5728\u8f6c\u6362\u4e3a\u56fe\u7247..."), t = await this
            ._op()), e() && (d.show(
            "\u8f6c\u6362\u56fe\u7247\u6210\u529f\uff5e", 2e3), this.digest({
            enable: !0,
            images: t
          }))
        } catch (t) {
          e() && d.show(t.message || t, 5e3)
        }
      }
    },
    _ou() {
      if (this.get("rdImages")) this.digest({
        enable: !0
      });
      else {
        let t = X(this, "_os");
        d.show("\u6b63\u5728\u4f7f\u7528RDS\u8f6c\u6362\u4e3a\u56fe\u7247...");
        let e = {
          location: location.href,
          stage: this.get("stage")
        };
        (new i).save({
          name: "_eJ",
          url: J("rdsUrl") + "image",
          _ei: Q("", {
            print: JSON.stringify(e)
          })
        }, ((e, r) => {
          t() && (e ? (d.hide(), this.alert(g._ot(e)), this.digest({
            sf: "rdImage"
          })) : (d.show("\u8f6c\u6362\u56fe\u7247\u6210\u529f\uff5e",
            2e3), this.digest({
            sf: "rdImage",
            enable: !0,
            rdImages: r.get("data", [])
          })))
        }))
      }
    },
    _ow() {
      if (this.get("rdPdf")) this.digest({
        enable: !1
      });
      else {
        let t = X(this, "_ov");
        d.show("\u6b63\u5728\u4f7f\u7528RDS\u8f6c\u6362\u4e3aPDF...");
        let e = {
          location: location.href,
          stage: this.get("stage")
        };
        (new i).save({
          name: "_eJ",
          url: J("rdsUrl") + "pdf",
          _ei: Q("", {
            print: JSON.stringify(e)
          })
        }, ((e, r) => {
          if (t())
            if (e) d.hide(), this.alert(g._ot(e)), this.digest({
              sf: "rdPdf"
            });
            else {
              d.show("\u8f6c\u6362PDF\u6210\u529f\uff5e", 2e3);
              let t = r.get("data", []),
                e = atob(t[0]),
                i = e.length,
                s = new Uint8Array(i);
              for (; i--;) s[i] = e.charCodeAt(i);
              let l = new Blob([s], {
                type: "application/pdf"
              });
              this.digest({
                sf: "rdPdf",
                enable: !1,
                rdPdf: URL.createObjectURL(l)
              })
            }
        }))
      }
    },
    async _oz() {
      let t = this.get("pdf"),
        e = this.get("page");
      if (!t && e) {
        let t = X(this, "_ox");
        try {
          let i = this.get("rdImages");
          i || (d.show(
            "\u6b63\u5728\u52a0\u8f7d\u56fe\u7247\u8f6c\u6362\u63d2\u4ef6..."
          ), await h(), d.show(
            "\u6b63\u5728\u8f6c\u6362\u4e3a\u56fe\u7247..."), i = await this
            ._op()), d.show("\u6b63\u5728\u52a0\u8f7dPDF\u63d2\u4ef6..."),
            await c(), d.show("\u6b63\u5728\u751f\u6210PDF...");
          let s = r.bU(e.width),
            o = r.bU(e.height),
            a = new jspdf.jsPDF({
              unit: "px",
              hotfixes: ["px_scaling"],
              orientation: s > o ? "l" : "p",
              format: [s, o],
              compress: !0
            });
          this._oy = a, a.setDocumentProperties({
            title: l("cn") + "<\u672a\u6388\u6743\u7248>",
            subject: "\u6253\u5370\u9875\u9762",
            author: "kooboy_li@163.com",
            keywords: "\u6253\u5370\u3001\u53ef\u89c6\u5316\u3001\u7f16\u8f91\u5668",
            creator: location.host
          });
          let n = i.length,
            u = t => {
              p._n0(`\u751f\u6210\u8fdb\u5ea6\uff1a${t+1} / ${n}`), t && a.addPage();
              let e = i[t];
              a.addImage(e, "JPEG", 0, 0, s, o, void 0, "FAST"), a.setLineWidth(2),
                a.line(0, 0, s, o), a.line(s, 0, 0, o)
            };
          for (let t = 0; t < n; t++) Z(u, [t]);
          await E(), p._n1(), t() && (d.show("\u8f6c\u6362PDF\u6210\u529f\uff5e", 2e3),
            this.digest({
              sf: "pdf",
              enable: !1,
              pdf: a.output("bloburi")
            }))
        } catch (e) {
          t() && d.show(e.message || e, 5e3)
        }
      } else this.digest({
        enable: !1
      })
    },
    _oA() {
      d.hide(), X(this, "_oo"), X(this, "_oq"), X(this, "_os"), X(this, "_ox"), X(this, "_ov"),
        p._n1()
    },
    async "_oB<change>"(t) {
      this._oA(), await this.digest({
        enable: !1
      }), this.set({
        sf: t.value
      }), "image" == t.value ? this._or() : "pdf" == t.value ? this._oz() : "rdImage" ==
      t.value ? this._ou() : "rdPdf" == t.value ? this._ow() : (d.show(
        "\u7b49\u5f85\u9875\u9762\u751f\u6210..."), await this.digest(), await p
        ._oc(this.id), await q(200), await E(), d.show(
        "\u6b63\u5728\u68c0\u67e5\u56fe\u7247\u72b6\u6001..."), await p._n4(
        this.root), d.show("\u9a6c\u4e0a\u5c31\u597d..."), await q(200), await this
        .digest({
          enable: !0
        }), d.hide())
    },
    "_oC<click>"() {
      open("//github.com/xinglie/report-designer/issues/49")
    },
    "_oD<click>"() {
      this.mxDialog({
        view: "8a/a1/9m",
        width: 550
      })
    },
    "_oG<click>"() {
      let t = X(this, "_oE");
      d.show("\u6b63\u5728\u8c03\u7528RDS\u6253\u5370\u670d\u52a1...");
      let e = g._oF(),
        r = {
          location: location.href,
          printer: e,
          stage: this.get("stage")
        };
      (new i).save({
        name: "_eJ",
        url: J("rdsUrl") + "print",
        _ei: Q("", {
          print: JSON.stringify(r)
        })
      }, (e => {
        t() && (e ? (d.hide(), this.alert(g._ot(e))) : d.show(
          "\u6253\u5370\u6210\u529f\uff5e", 2e3))
      }))
    },
    "_oH<click>"() {
      let {
        params: t,
        path: e
      } = K(location.href), r = {
        ...t
      };
      r.id || (r.id = "xl");
      let i = Q(e, r);
      open(i)
    },
    async "_oJ<click>"() {
      let t, e, r, i = this.get("sf"),
        s = X(this, "_oI");
      try {
        await a._cR()
      } catch (t) {
        return this.alert(t.message)
      }
      if (d.show(l("cm")), "web" == i) {
        let i = [],
          o = [],
          n = et.getElementsByTagName("style");
        for (let t = 0; t < n.length; t++) {
          let e = n[t].innerHTML.trim();
          e && i.push(`<style>${e}</style>`)
        }
        let h = et.querySelectorAll(".rd-kI");
        for (let t = 0; t < h.length; t++) o.push(p._n5(h[t].outerHTML));
        r = [".html"], t = `${l("cn")}-web.html`, e =
          `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${l("cn")}-web</title>${i.join("")}</head><body class="rd-cW rd-cY rd-bG rd-bH">${o.join("")}</body></html>`;
        try {
          s() && (await a._cS(t, e, r), d.show(l("co"), 3e3))
        } catch (t) {
          d.hide(), s() && "AbortError" != t.name && this.alert(t.message)
        }
      } else if ("pdf" == i && this._oy) this._oy.save(`${l("cn")}.pdf`), d.show(l("co"),
        3e3);
      else if ("rdPdf" == i && this.get("rdPdf")) {
        let t = et.createElement("a");
        t.download = `${l("cn")}.pdf`, t.href = this.get("rdPdf"), t.click()
      } else d.show(
        "\u6682\u4e0d\u652f\u6301\u5f53\u524d\u7c7b\u578b\u7684\u6587\u4ef6\u5bfc\u51fa",
        3e3)
    },
    "$win<keydown>&{passive:false}"(t) {
      let {
        code: e,
        ctrlKey: r,
        shiftKey: i,
        altKey: s,
        metaKey: d
      } = t;
      "KeyP" != e || i || s || !r && !d || (t.preventDefault(), print())
    },
    "$doc<paste>"(t) {
      let e = t.clipboardData.getData("text/plain");
      this._oh(n.cR(e))
    },
    "$win<render>"(t) {
      4 & et.rdState && (et.rdState ^= 4), 8 & et.rdState && (et.rdState ^= 8), et.rdState |=
        8, this._oh(n.cR(t.json))
    },
    "$win<message>"(t) {
      let {
        protocol: e,
        host: r
      } = location, i = e + "//" + r;
      t.source != window && t.source.postMessage("_eA", i), t.origin == i && t.data && this._oh(
        n.cR(t.data))
    }
  }).merge(s)
})), s.d("8a/a7", ["5u", "../5s/7r", "../6c/83", "./6d/5r", "./6d/9v", "./5r"], (t => {
  let e = t("5u"),
    r = t("../5s/7r"),
    i = t("../6c/83"),
    s = t("./6d/5r"),
    d = t("./6d/9v"),
    l = t("./5r"),
    {
      State: o,
      lowTaskFinale: a,
      applyStyle: n,
      delay: h
    } = e;
  return n("rd-kg",
    ".rd-kR{page-break-after:auto;page-break-inside:avoid}.rd-kS{display:block;contain:paint}"), l.extend({
    tmpl({
           page: t,
           pages: e,
           unit: r
         }, i, s, d, l, o) {
      let a, n, h, c = [];
      if (t && e)
        for (let d = null == e ? void 0 : e.length, p = d - 1, u = 0; u < d; u += 1) {
          let d = e[u],
            f = u === p;
          h = [];
          for (let t = null == d ? void 0 : d.length, e = 0; e < t; e += 1) {
            let t = d[e];
            h.push(i("div", {
              $$: "pages,unit",
              _5: s,
              class: "rd-cO",
              _: `6o/${t.type}/5r?props=${o(l,t.props,`a/.${u}.a;.${e}.a:`)}&unit=` +
                o(l, r, "a-")
            }))
          }
          a = "rd-bG rd-bH rd-cH rd-kS rd-dS", f || (a += " rd-kR"), n =
            `width:${t.width}${r};height:${t.height}${r};border-radius:${t.radius};background:${t.background};`,
          !t.preformat && t.backgroundImage && (n +=
            `background-image:url(${t.backgroundImage});background-repeat:${"full"==t.backgroundRepeat?"no-repeat":t.backgroundRepeat};background-size:`,
            "full" == t.backgroundRepeat ? n += "100% 100%" : n += t.backgroundWidth +
              r +
              ` ${t.backgroundHeight}${r};background-position:${t.backgroundXOffset}${r} ` +
              t.backgroundYOffset + r), c.push(i("div", {
            class: a,
            style: n
          }, h))
        }
      return i(s, 0, c)
    },
    init() {},
    render() {
      this.digest()
    },
    async getHTML({
                    stage: t,
                    data: e
                  }) {
      for (let t in e) {
        let s = e[t],
          {
            _eE: d,
            _eD: l
          } = r._eK(s, t);
        i._nD(t, d, l)
      }
      if (!t) return {
        styles: [],
        pages: []
      };
      let {
        page: l,
        elements: n,
        unit: c
      } = t;
      if (!l || !n || !c) return {
        styles: [],
        pages: []
      };
      let p = new d;
      this._oi = p, this.set({
        page: l,
        unit: c
      });
      let u = l.xOffset,
        f = l.yOffset,
        g = [],
        {
          _n9: b
        } = s._oa(n, p, 1);
      o.set({
        bK: c,
        cc: b,
        bZ: u,
        b0: f
      }), await p._dM();
      let $ = [],
        m = {};
      await this._oj(n, l, g, !1, ((t, e, r) => {
        if ("pager" == t) $.push(e);
        else if ("number" == t) {
          let t = m[r];
          t || (m[r] = t = []), t.push(e)
        }
      }));
      for (let {
        props: {
          ext: t
        }
      } of $) t._totalPage = g.length;
      for (let t in m) {
        let e = 0,
          r = m[t];
        for (let {
          props: {
            ext: t
          }
        } of r) t._fill = 1, t._index = e++, t._total = r.length
      }
      s._n6(g);
      let {
        copies: y = 1
      } = l;
      if (y > 1) {
        let t = g.slice();
        for (; y > 1;) g.push(...t), y--
      }
      s._n6(g), await this.digest({
        stage: t,
        pages: g
      }), await a(), await h(1e3);
      let x = [],
        _ = [],
        w = document.getElementsByTagName("style");
      for (let t = 0; t < w.length; t++) {
        let e = w[t].innerHTML.trim();
        e && x.push(`<style>${e}</style>`)
      }
      let k = document.querySelectorAll(".rd-kS");
      for (let t = 0; t < k.length; t++) _.push(s._n5(k[t].outerHTML));
      return {
        styles: x,
        pages: _
      }
    }
  })
})), s.d("8a/a0/5r", ["../../6c/6d"], (t => {
  let e = t("../../6c/6d"),
    r = "extra.lodop",
    i = () => e.cE(r, "http://127.0.0.1:8000/CLodopfuncs.js"),
    s = {};
  return {
    _oW(t) {
      e.cz(r, t)
    },
    _oX: i,
    _om: () => new Promise((t => {
      let e = i(),
        r = s[e];
      r || (r = {
        _oY: 1,
        _oZ: []
      }, s[e] = r), r._oZ.push(t);
      let d = () => {
        let t;
        r._oY |= 4, window.getCLodop && (t = getCLodop());
        for (let e of r._oZ) e(t);
        r._oZ.length = 0
      };
      if (4 & r._oY) d();
      else if (!(2 & r._oY)) {
        r._oY |= 2;
        let t = document.createElement("script");
        t.onload = t.onerror = d, t.src = e, document.head.appendChild(t)
      }
    }))
  }
})), s.d("8a/a0/9m", ["5u", "./5r"], (t => {
  let e, r, i, s = t("5u"),
    d = t("./5r"),
    l = "div",
    o = "\u6253\u5370\u63d2\u4ef6\u5730\u5740",
    a = "button",
    n = {
      class: "rd-bW"
    },
    h = {
      class: "rd-cW rd-c0"
    },
    c = {
      class: "rd-bY rd-cW rd-dl"
    },
    p = {
      value: "value"
    };
  return s.View.extend({
    tmpl({
           src: t,
           i18n: s
         }, d, u) {
      let f, g, b, $;
      return e ? f = [e] : (g = [d(0,
        '<h5 class="rd-en rd-dZ rd-bJ">Lodop\u6253\u5370\u8bbe\u7f6e</h5>', 1)], f = [
        e = d(l, {
          $: "a/",
          class: "rd-bT rd-bJ rd-ct"
        }, g)]), r ? $ = [r] : (b = [d(0, o)], $ = [r = d(l, {
        $: "a;",
        class: "rd-kv rd-cc"
      }, b)]), b = [d("input", {
        placeholder: o,
        class: "rd-bJ rd-bK rd-kw",
        value: t,
        _input: u + "\x1e_o0()"
      }, 1, p)], $.push(d(l, 0, b)), g = [d(l, h, $)], i ? g.push(i) : ($ = [d(0,
        'Lodop\u5b89\u88c5\u540e\u4f1a\u6709\u4e00\u4e2a\u901a\u8fc7http\u534f\u8bae\u6765\u63a7\u5236\u6253\u5370\u670d\u52a1\u7684javascript\u63d2\u4ef6\uff0c\u5728\u8fd9\u91cc\u8bbe\u7f6e\u8be5\u63d2\u4ef6\u7684\u5730\u5740\u3002\u5982\u679c\u6253\u5370\u670d\u52a1\u5b89\u88c5\u5728\u5f53\u524d\u7535\u8111\u4e0a\u4e14\u672a\u4fee\u6539\u8fc7\u7aef\u53e3\uff0c\u5219\u65e0\u9700\u505a\u4efb\u4f55\u8bbe\u7f6e\u3002<a class="rd-b4" href="http://www.lodop.net/download.html" target="_blank" rel="noopener noreferrer">\u53bbLodop\u5b98\u7f51\u4e86\u89e3\u66f4\u591a\u4fe1\u606f</a>',
        1)], g.push(i = d(l, {
        $: "a:",
        class: "rd-dP rd-kx"
      }, $))), f.push(d(l, n, g)), $ = [d(0, s("cq"))], g = [d(a, {
        _click: u + "\x1e_cN()",
        class: "rd-bQ rd-dv rd-bN rd-do rd-bS",
        type: a
      }, $)], $ = [d(0, s("cr"))], g.push(d(a, {
        _click: u + "\x1e_cM()",
        class: "rd-bQ rd-dv rd-bN rd-do rd-cb",
        type: a
      }, $)), f.push(d(l, c, g)), d(u, 0, f)
    },
    init({
           _close: t
         }) {
      this._cL = t
    },
    render() {
      this.digest({
        src: d._oX()
      })
    },
    "_cM<click>"() {
      this._cL()
    },
    "_o0<input>"(t) {
      let e = t.eventTarget.value;
      this.digest({
        src: e
      })
    },
    "_cN<click>"() {
      alert("\u672a\u6388\u6743\u7248\u672c\u4e0d\u652f\u6301\u8bbe\u7f6e")
    }
  })
})), s.d("8a/a0/6q", ["5u"], (t => {
  let e, r, i = t("5u"),
    s = "div",
    d = "button",
    l = {
      class: "rd-bY rd-cW rd-dl"
    };
  return i.View.extend({
    tmpl({
           i18n: t
         }, i, o) {
      let a, n, h;
      return e ? a = [e] : (n = [i(0, '<h5 class="rd-en rd-dZ rd-bJ">\u63d0\u793a</h5>', 1)],
        a = [e = i(s, {
          $: "a/",
          class: "rd-bT rd-bJ rd-ct"
        }, n)]), r ? a.push(r) : (n = [i(0,
        '\u672a\u68c0\u6d4b\u5230Lodop\u6253\u5370\u670d\u52a1\uff0c\u8bf7\u60a8\u5148\u524d\u5f80<a class="rd-b4" href="http://www.lodop.net/LodopDemo.html" target="_blank" rel="noopener noreferrer">Lodop\u5b98\u65b9\u793a\u4f8b\u9875\u9762</a>\uff0c\u6309\u76f8\u5173\u8bf4\u660e\u5b89\u88c5Lodop\u6253\u5370\u670d\u52a1\u5e76\u80fd\u6b63\u5e38\u8fd0\u884c\u5b98\u7f51\u63d0\u4f9b\u7684\u793a\u4f8b\u540e\uff0c\u518d\u6765\u8be5\u9875\u9762\u5c1d\u8bd5\u4f7f\u7528Lodop\u6253\u5370\u3002',
        1)], a.push(r = i(s, {
        $: "a;",
        class: "rd-bW"
      }, n))), h = [i(0, t("lK"))], n = [i(d, {
        _click: o + "\x1e_kH()",
        class: "rd-bQ rd-dv rd-bN rd-do rd-bS",
        type: d
      }, h)], a.push(i(s, l, n)), i(o, 0, a)
    },
    init({
           _close: t
         }) {
      this._cL = t
    },
    render() {
      this.digest()
    },
    "_kH<click>"() {
      this._cL()
    }
  })
})), s.d("8a/6d/5r", ["5u", "../../5s/62", "../../6c/83", "../../6c/72", "../../66/6a/5r"], (t => {
  let e = t("5u"),
    r = t("../../5s/62"),
    i = t("../../6c/83"),
    s = t("../../6c/72"),
    d = t("../../66/6a/5r"),
    {
      Vframe: l,
      node: o,
      has: a,
      guid: n,
      delay: h,
      lowTaskFinale: c,
      now: p,
      isArray: u,
      toMap: f
    } = e,
    g = {
      "data-coltable": 1,
      "data-dtable": 1,
      "data-rdtable": 1,
      "data-ftable": 1,
      "data-richtext": 1,
      video: 1
    },
    b = {
      xsheet: 1
    },
    $ = {
      "hod-table": 1,
      "hod-hflex": 1,
      "hod-vflex": 1,
      "hod-footer": 1,
      "hod-header": 1,
      "data-dtable": 1,
      "hod-tabs": 1,
      "data-rdtable": 1
    },
    m = {
      ...$,
      "data-repeater": 1,
      "data-ftable": 1,
      "data-celltable": 1
    },
    y = /<[^>]+>/g,
    x = /\s*(?:id|_\d?[a-z]*)\s*=\s*"[^"]+"/gi,
    _ = n("_rd_mdt"),
    w = "rd-eN",
    k = t => {
      let e = o("_rd_tip"),
        {
          classList: r
        } = e;
      r.contains(w) && r.remove(w), e.innerHTML = t
    },
    v = () => {
      let t = o("_rd_tip"),
        {
          classList: e
        } = t;
      e.contains(w) || e.add(w)
    },
    L = (t, e) => {
      var r, i;
      if (null == t ? void 0 : t.length) {
        let s;
        for (let {
          props: d
        } of t) {
          if (!(null === (i = null === (r = d.bind) || void 0 === r ? void 0 : r.fields) || void 0 ===
          i ? void 0 : i.length)) {
            s = 1;
            break
          }
          if (null != e[d.bind.fields[0].key]) {
            s = 1;
            break
          }
        }
        return s
      }
      return 1
    },
    F = (t, e, r) => {
      var i;
      for (let s = t.length; s--;) {
        let {
          id: d,
          type: l,
          props: o
        } = t[s];
        if (a(m, l)) {
          let {
            rows: t
          } = o;
          for (let s of t)
            for (let t of s.cols)(null === (i = t.elements) || void 0 === i ? void 0 : i.length) &&
            F(t.elements, e, r)
        }
        if (o.print)
          if ("odd" == o.print) e % 2 && t.splice(s, 1);
          else if ("even" == o.print) e % 2 == 0 && t.splice(s, 1);
          else if ("last" == o.print) {
            let i = `${d}:${e}`;
            r[`${d}:${e+1}`] && t.splice(s, 1), r[i] = 1
          } else if ("first" == o.print) {
            let i = `${d}:${e+1}`;
            if (r[i]) {
              for (let t of r[i]) {
                let [e, r] = t;
                e.splice(r, 1)
              }
              r[i] = null
            }
            let l = `${d}:${e}`;
            r[l] || (r[l] = []), r[l].push([t, s])
          }
      }
    },
    S = (t, e) => {
      for (; t && t.pId;) {
        if (t.pId == e) return 1;
        t = l.byId(t.pId)
      }
    };
  return {
    _nY: $,
    _nZ: m,
    _n0: k,
    _n1: v,
    _n2: async (t, e) => {
      let r = o(_);
      r || (r = document.createElement("div"), r.className =
        "rd-bG rd-bH rd-eF rd-cI rd-cK rd-dJ", r.id = _, document.body.appendChild(r));
      let i = l.root();
      for (i.unmount(r), i.mount(r, `6o/${t}/5r`, e); !r.childNodes.length;) await h(10);
      return await c(), await h(50), r
    },
    _n3: (t, e, i, s) => {
      let d = [],
        {
          width: l,
          height: o
        } = t,
        n = e * o,
        h = n + o,
        c = {
          x: 0,
          y: n,
          width: l,
          height: o
        };
      for (let t of i) {
        let {
          props: i,
          type: p
        } = t;
        if (!t.used || !b[p])
          if (t.used = 1, "hod-header" == p || "hod-footer" == p) i.x = 0, i.width = l, i.y =
            "hod-header" == p ? e * o : (e + 1) * o - i.height, d.push(t);
          else {
            let {
              x: l,
              y: o,
              width: u,
              height: f,
              rotate: b
            } = i;
            if (o += s, a(g, p))(o >= n && o <= h || o < 0 && 0 == e) && d.push(t);
            else {
              let e = r.bG({
                  x: l,
                  y: o,
                  width: u,
                  height: f,
                  rotate: b
                }),
                i = {
                  x: e._cm,
                  y: e._cn,
                  width: e._bP,
                  height: e._bQ
                };
              r.bH(i, c) && d.push(t)
            }
          }
      }
      return d
    },
    _n4: async (t, e = !0) => {
      let r = t.getElementsByTagName("img");
      for (;;) {
        let t = 1,
          i = 0;
        for (let e = r.length; e--;) {
          r[e].complete ? i++ : t = 0
        }
        if (e && k(`\u56fe\u7247\u5b8c\u6210\u8fdb\u5ea6\uff1a${i} / ${r.length}`), t) {
          e && v();
          break
        }
        await h(6)
      }
    },
    _n5: t => t.replace(y, (t => t.replace(x, ""))),
    _n6: t => {
      let e = {};
      for (let r = t.length; r--;) {
        let i = t[r];
        F(i, r, e)
      }
    },
    _oa(t, e, r) {
      let s = [],
        d = 0,
        l = {},
        o = t => {
          var h;
          for (let c of t) {
            c.id || (c.id = n("e"));
            let {
              props: t,
              type: p
            } = c, {
              bind: u
            } = t;
            if (null == u ? void 0 : u.id)
              if (r) {
                let t = i._nF(u);
                i._nE(t) || i._nD(t, null, `\u672a\u63d0\u4f9b${t}\u7684\u6570\u636e`)
              } else {
                let t = u.url + "~" + u.id;
                l[t] || (l[t] = 1, i._nG(u), s.push(u))
              } if (a(m, p)) {
              let {
                rows: r
              } = t;
              for (let t of r)
                for (let r of t.cols) "qrcode" != r.type && "barcode" != r.type || e._kv(
                  "_n7", r.type), (null === (h = r.elements) || void 0 === h ? void 0 :
                  h.length) && o(r.elements), r.bindKey && (u.fields || (u.fields = []),
                  u.fields.push({
                    key: r.bindKey,
                    name: r.bindName
                  }))
            }
            "data-richtext" == p ? p = "richtext" : p.startsWith("batch-") && (p = p.substring(
              6)), e._kv("_n8", p), "hod-footer" == p ? d = t.height : "barcode" == p ||
            "qrcode" == p || "fx" == p || "signature" == p || "bwip" == p ? e._kv("_n7", p) :
              p.startsWith("chart/") ? (p = "chart/chartjs" == p ? "chart" : "echarts", e._kv(
                "_n7", p)) : "formula" == p ? e._kv("_n7", "mathjax") : "richtext" == p ? e
                ._kv("_n7", "html2canvas") : "html" == p ? e._kv("_n7", "underscore") :
                "datetime" == p && e._kv("_n7", "qrcode")
          }
        };
      return o(t), {
        _n9: d,
        _o_: s
      }
    },
    _ob(t) {
      let {
        props: e,
        type: r
      } = t, {
        bind: d,
        rows: l,
        dynamicCols: o,
        avgDynamicColsWidth: a
      } = e;
      if (d.id && o) {
        let {
          _eD: t,
          _eE: o
        } = i._nz(d);
        if (!t) {
          let t, i = (t => {
            if (u(t)) {
              let e = {};
              for (let r of t)
                for (let t in r) null != r[t] && (e[t] = t);
              return e
            }
            return t
          })(o);
          t = "data-dtable" == r ? ((t, e) => {
            let r = [],
              i = 0,
              s = 0;
            for (let d of t) {
              if (d.data) {
                for (let t = d.cols.length; t--;) {
                  let s = d.cols[t];
                  s.bindKey && null == e[s.bindKey] && (r.push(t), i += s.width)
                }
                break
              }
              s++
            }
            return {
              bF: s,
              bG: r,
              bH: i
            }
          })(l, i) : ((t, e) => {
            let r = [],
              i = 0,
              s = 0;
            for (let d of t) {
              if (d.data) {
                for (let t = d.cols.length; t--;) {
                  let s = d.cols[t];
                  L(s.elements, e) || (r.push(t), i += s.width)
                }
                break
              }
              s++
            }
            return {
              bF: s,
              bG: r,
              bH: i
            }
          })(l, i);
          let d = t.bG,
            n = t.bH,
            h = t.bF;
          e.focusRow = h, s.bF(e);
          for (let t of d) e.focusCol = t, s.bK(e), s.bF(e);
          if ("none" == a) e.width -= n;
          else if ("direct" == a) {
            let t = n / e._gk;
            for (let e of l)
              for (let r of e.cols) {
                let e = r.colspan;
                r.width += t * e
              }
          } else {
            let t = s.bG(e)._gl,
              r = 0;
            for (let e of t) r += e;
            for (let t of l)
              for (let e of t.cols) e.width += e.width / r * n
          }
        }
      }
    },
    _oc(t, e = 3e4) {
      let r = p();
      return new Promise((i => {
        let s = () => {
          let o = l.all(),
            a = p() >= e + r;
          if (!a) {
            a = !0;
            for (let e in o) {
              let r = l.byId(e);
              if (S(r, t)) {
                let t = r._fr;
                if (!(null == t ? void 0 : t._fE)) {
                  a = !1;
                  break
                }
              }
            }
          }
          a && (d._bZ(s), i())
        };
        d._b0(400, s)
      }))
    }
  }
})), s.d("8a/6d/9v", ["5u"], (t => {
  let e = t("5u"),
    {
      use: r,
      isFunction: i,
      Base: s
    } = e,
    d = async t => {
      let [e] = await r("6c/" + t);
      i(e) ? await e() : i(e._fX) && await e._fX()
    }, l = async t => await r("6o/" + t + "/5r"), o = t => new Promise((e => {
      let r = new Image;
      r.onload = r.onerror = () => {
        e()
      }, r.src = t, r.complete && e()
    }));
  return s.extend({
    ctor() {
      this._od = {}, this._oe = []
    },
    _kv(t, e) {
      let r = t + "~" + e,
        i = this._od,
        s = this._oe;
      1 != i[r] && (i[r] = 1, s.push({
        type: t,
        src: e
      }))
    },
    _dM() {
      let t = [],
        e = this._oe;
      for (let {
        type: r,
        src: i
      } of e) "_n7" == r ? t.push(d(i)) : "_n8" == r ? t.push(l(i)) : t.push(o(i));
      return Promise.all(t)
    },
    _of() {
      this._oe.length = 0
    }
  })
})), s.d("8a/a1/5r", ["5u", "../../6c/6d"], (t => {
  let e = t("5u"),
    r = t("../../6c/6d"),
    {
      mix: i
    } = e,
    s = {
      "127.0.0.1": 1,
      localhost: 1
    },
    d = "extra.rds";
  return {
    _oF() {
      let t = {
          name: "",
          nc: 1,
          pt: 0,
          pl: 0,
          pr: 0,
          pb: 0,
          l: "portrait",
          ts: !1
        },
        e = r.cE(d);
      return e && i(t, JSON.parse(e)), t
    },
    _o1(t) {
      r.cz(d, JSON.stringify(t))
    },
    _ot(t) {
      let e = location.hostname;
      return s[e] ? `RDS\u670d\u52a1\u5f02\u5e38[${t.message||t}]` : e +
        "\u73af\u5883\u4e0d\u652f\u6301RDS\u670d\u52a1\uff0c\u8fdb\u4e00\u6b65\u4e86\u89e3\u8be6\u60c5\u53ef\u4ee5\u6dfb\u52a0\u4f5c\u8005\u5fae\u4fe1\uff1aqq84685009"
    }
  }
})), s.d("8a/a1/9m", ["5u", "../../5s/7r", "../../66/6l/5r", "./5r", "66/99/5r", "66/96/5r"], (t => {
  let e = t("5u"),
    r = t("../../5s/7r"),
    i = t("../../66/6l/5r"),
    s = t("./5r");
  t("66/99/5r"), t("66/96/5r");
  let d, l, o, a, n, h, c, p, u, f, g, b, $ = "div",
    m = "rd-kv rd-cD rd-cc",
    y = "rd-de",
    x = "printer",
    _ = "rd-bK rd-cH",
    w = "button",
    k = {
      class: "rd-bW"
    },
    v = {
      class: "rd-cW rd-c0"
    },
    L = {
      class: "rd-cW rd-c0 rd-kx"
    },
    F = {
      class: "rd-b2 rd-bR rd-cB rd-do rd-cW rd-c0"
    },
    S = {
      class: "rd-bY rd-cW rd-dl rd-c0 rd-c3 rd-d5 rd-e_ rd-bZ rd-ct"
    },
    C = {
      checked: "checked"
    },
    {
      config: H,
      mark: M,
      View: G,
      toUrl: T
    } = e,
    A = [{
      text: "\u7eb5\u5411",
      value: "portrait"
    }, {
      text: "\u6a2a\u5411",
      value: "landscape"
    }];
  return G.extend({
    tmpl({
           error: t,
           exf: e,
           list: r,
           printer: i,
           layouts: s,
           i18n: H
         }, M, G, T, A, z) {
      let P, j, I, B;
      return P = d ? [d] : [d = M($, {
        $: "a/",
        class: "rd-bU rd-c3 rd-ea"
      })], l ? P.push(l) : (j = [M(0,
        '<h5 class="rd-en rd-dZ rd-bJ">RDS\u6253\u5370\u8bbe\u7f6e</h5>', 1)], P.push(
        l = M($, {
          $: "a;",
          class: "rd-bT rd-bJ rd-ct rd-c3 rd-c4 rd-eb rd-c7"
        }, j))), j = [], t ? j.push(M(0, e(t.message))) : (o ? B = [o] : (I = [M(0,
        "\u6253\u5370\u673a")], B = [o = M($, {
        $: "a:",
        class: m
      }, I)]), B.push(M($, {
        $$: "list",
        _5: G,
        class: y,
        _change: G + "\x1e_o4({key:'name'})",
        _: `66/99/5r?list=${z(A,r,"a/")}&selected=` + T(i.name)
      })), j.push(M($, v, B)), a ? B = [a] : (I = [M(0, "\u65b9\u5411")], B = [a = M(
        $, {
          $: "a-",
          class: m
        }, I)]), B.push(M($, {
        $$: "layouts",
        _5: G,
        class: y,
        _change: G + "\x1e_o4({key:'l'})",
        _: `66/99/5r?list=${z(A,s,"a;")}&selected=` + T(i.l)
      })), j.push(M($, L, B)), n ? B = [n] : (I = [M(0, "\u53cc\u9762\u6253\u5370")],
        B = [n = M($, {
          $: "b_",
          class: m
        }, I)]), I = [M("input", {
        class: "rd-dC rd-cG",
        type: "checkbox",
        checked: i.ts,
        _change: G + "\x1e_o5()"
      }, 1, C)], h ? I.push(h) : I.push(h = M("i", {
        $: "ba",
        class: "rd-dD rd-dF rd-cP rd-cH"
      })), B.push(M("label", F, I)), j.push(M($, L, B)), c ? B = [c] : (I = [M(0,
        "\u6253\u5370\u4efd\u6570")], B = [c = M($, {
        $: "bb",
        class: m
      }, I)]), B.push(M($, {
        $$: x,
        _5: G,
        class: _,
        _input: G + "\x1e_o3({key:'nc'})",
        _: "66/96/5r?min=1&value=" + z(A, i.nc, "a:")
      })), j.push(M($, L, B)), p ? B = [p] : (I = [M(0, "\u5de6\u9875\u8fb9\u8ddd")],
        B = [p = M($, {
          $: "bc",
          class: m
        }, I)]), B.push(M($, {
        $$: x,
        _5: G,
        class: _,
        _input: G + "\x1e_o3({key:'pl'})",
        _: "66/96/5r?min=0&value=" + z(A, i.pl, "a-")
      })), j.push(M($, L, B)), u ? B = [u] : (I = [M(0, "\u4e0a\u9875\u8fb9\u8ddd")],
        B = [u = M($, {
          $: "bd",
          class: m
        }, I)]), B.push(M($, {
        $$: x,
        _5: G,
        class: _,
        _input: G + "\x1e_o3({key:'pt'})",
        _: "66/96/5r?min=0&value=" + z(A, i.pt, "b_")
      })), j.push(M($, L, B)), f ? B = [f] : (I = [M(0, "\u53f3\u9875\u8fb9\u8ddd")],
        B = [f = M($, {
          $: "be",
          class: m
        }, I)]), B.push(M($, {
        $$: x,
        _5: G,
        class: _,
        _input: G + "\x1e_o3({key:'pr'})",
        _: "66/96/5r?min=0&value=" + z(A, i.pr, "ba")
      })), j.push(M($, L, B)), g ? B = [g] : (I = [M(0, "\u4e0b\u9875\u8fb9\u8ddd")],
        B = [g = M($, {
          $: "bf",
          class: m
        }, I)]), B.push(M($, {
        $$: x,
        _5: G,
        class: _,
        _input: G + "\x1e_o3({key:'pb'})",
        _: "66/96/5r?min=0&value=" + z(A, i.pb, "bb")
      })), j.push(M($, L, B))), P.push(M($, k, j)), j = [], t || (B = [M(0, H("cq"))], j.push(
        M(w, {
          _click: G + "\x1e_cN()",
          class: "rd-bQ rd-dv rd-bN rd-do rd-bS",
          type: w
        }, B))), B = [M(0, H("cr"))], j.push(M(w, {
        _click: G + "\x1e_cM()",
        class: "rd-bQ rd-dv rd-bN rd-do rd-cb",
        type: w
      }, B)), P.push(M($, S, j)), b ? P.push(b) : P.push(b = M($, {
        $: "bg",
        class: "rd-bX rd-c3 rd-d9"
      })), M(G, 0, P)
    },
    init({
           _close: t
         }) {
      this._cL = t, this.set({
        exf: s._ot,
        layouts: A
      })
    },
    render() {
      let t = M(this, "_o2"),
        e = new r,
        i = T("", {
          print: JSON.stringify({
            width: 0,
            height: 0,
            location: location.href
          })
        });
      e.all({
        name: "_eJ",
        url: H("rdsUrl") + "printers",
        _ei: i
      }, ((e, r) => {
        if (t()) {
          let t = s._oF(),
            i = r.get("data", []),
            d = [];
          for (let t of i) d.push({
            text: t,
            value: t
          });
          t.name || (t.name = i[0]), this.digest({
            error: e,
            list: d,
            printer: t
          })
        }
      }))
    },
    "_cM<click>"() {
      this._cL()
    },
    "_o3<input>"(t) {
      let e = this.get("printer"),
        {
          key: r
        } = t.params;
      e[r] = t.value
    },
    "_o4<change>"(t) {
      let e = this.get("printer"),
        {
          key: r
        } = t.params;
      e[r] = t.value
    },
    "_o5<change>"(t) {
      this.get("printer").ts = t.eventTarget.checked
    },
    "_cN<click>"() {
      s._o1(this.get("printer")), this._cL(), i.show("\u8bbe\u7f6e\u6210\u529f~", 2e3)
    }
  })
})), s.d("8a/a2/a3", ["5u", "../../5s/60", "../../5s/62", "../../6c/83", "../../6c/6d", "../6d/5r"], (t => {
  let e = t("5u"),
    r = t("../../5s/60"),
    i = t("../../5s/62"),
    s = t("../../6c/83"),
    d = t("../../6c/6d"),
    l = t("../6d/5r"),
    {
      guid: o,
      isArray: a
    } = e,
    {
      max: n,
      abs: h
    } = Math;
  return async (t, e, h, c, p, u, f) => {
    let g, {
        props: b,
        type: $,
        id: m
      } = t,
      {
        x: y,
        y: x,
        width: _,
        hspace: w,
        vspace: k,
        rotate: v,
        bind: L
      } = b;
    if (!L || !L.id) return -1;
    $ = $.substring(6);
    let F, S, C, H = h.height - c,
      M = i.bG(b),
      G = M._bQ,
      T = M._bP,
      A = M._cm,
      z = M._cn,
      P = M._ck[0],
      j = A - y,
      I = z - x,
      B = x,
      D = y,
      N = 0,
      R = p.length,
      W = 0,
      {
        _eD: O,
        _eE: Y
      } = s._nz(L);
    for (a(Y) || (Y = [Y]), W = Y.length;;) {
      let t = d.bJ(b),
        s = t.bind;
      if (O) s._tip = O;
      else {
        let t = Y[e++];
        s._data = t, e > W && (g = -1)
      }
      if (-1 == g) break; {
        t.x = D, t.y = B;
        let s = {
          type: $,
          id: o(m),
          props: t
        };
        if (u || p.push(s), "text" == $ && t.autoHeight) {
          let s = await l._n2($, {
              props: t,
              unit: f
            }),
            d = r.bF(s.firstElementChild.offsetHeight),
            o = i.bG({
              x: y,
              y: x,
              width: _,
              rotate: v,
              height: d
            }),
            a = o._ck[0],
            c = P.x - a.x + D - y + (F ? F - o._cm + w : 0),
            u = P.y - a.y + B - x + (S ? S - o._cn + k : 0);
          if (t.x += c, t.y += u, A = o._dN + c, A > h.width) {
            C = 1, R = p.length;
            let e = z - (o._cn + u) + k,
              r = t.x - y;
            t.y += e, t.x = y, A -= r, S = z, F = A, N = o._bQ, z = o._dO + u + e
          } else z = n(z, o._dO + u), N = n(N, o._bQ), F = A;
          if (C && z > H) {
            let t = p.length - R + 1;
            g = e - t, p.splice(R - 1, t);
            break
          }
        } else if (A += T + w, D = A - j, A + T > h.width && (A = M._cm, D = A - j, z += G +
          k, B = z - I, z + G > H)) {
          g = e;
          break
        }
      }
    }
    return g == W ? -1 : g
  }
})), s.d("8a/a2/a4", ["5u", "../../6c/83"], (t => {
  let e = t("5u"),
    r = t("../../6c/83"),
    {
      isArray: i
    } = e;
  return (t, e, s, d) => {
    let {
      props: l
    } = t, {
      bind: o
    } = l;
    if (o.id && !o._tip && !o._data) {
      let {
        _eD: t,
        _eE: e
      } = r._nz(o);
      t ? o._tip = t : o._data = e
    }
    if ("repeat" == t.type) {
      let t = l.image;
      if (o._data) {
        let e = o._data;
        i(e) && (e = e[0]), t = e[o.fields[0].key]
      }
      s._kv("_o6", t)
    }
    d || e.push(t)
  }
})), s.d("8a/a2/data-celltable", ["../../6c/83"], (t => {
  let e = t("../../6c/83");
  return (t, r, i, s) => {
    s || i.push(t);
    let {
      props: d
    } = t, {
      bind: l
    } = d;
    if (l.id) {
      let {
        _eD: t,
        _eE: i
      } = e._nz(l);
      if (!t) return l._data = i[r], r == i.length - 1 ? -1 : r + 1;
      l._tip = t
    }
    return -1
  }
})), s.d("8a/a2/data-coltable", ["../../5s/60", "../../6o/data-coltable/92", "../../6c/83"], (t => {
  let e = t("../../5s/60"),
    r = t("../../6o/data-coltable/92"),
    i = t("../../6c/83"),
    {
      floor: s
    } = Math;
  return (t, d, l, o, a, n) => {
    var h;
    n || a.push(t);
    let {
      props: c
    } = t, {
      bind: p,
      columns: u
    } = c;
    if (null === (h = p.fields) || void 0 === h ? void 0 : h.length) {
      let t = 0;
      for (let e of p.fields) t += u[e.key];
      let a = e.bF(1);
      c.width = t + a;
      let {
        _eD: n,
        _eE: h
      } = i._nz(p);
      if (!n) {
        let t = l.height - c.y - c.theadRowHeight - a - c.tfootSpacing - o,
          e = s(t / (c.tbodyRowHeight + a));
        e < 1 && (e = 1);
        let r = e + d;
        return r > h.length && (r = h.length), p._data = h.slice(d, r), r == h.length ? -1 : r
      }
      c.loadingHeight = r._gB, p._tip = n
    } else c.width = r._gA;
    return -1
  }
})), s.d("8a/a2/data-dtable", ["5u", "../../5s/60", "../../6c/83", "../../6c/6d", "../../6c/72", "../6d/5r"], (t => {
  let e = t("5u"),
    r = t("../../5s/60"),
    i = t("../../6c/83"),
    s = t("../../6c/6d"),
    d = t("../../6c/72"),
    l = t("../6d/5r"),
    {
      keys: o
    } = e,
    {
      min: a,
      floor: n,
      random: h
    } = Math,
    c = {},
    p = (t, e, r, i) => {
      let s = {},
        d = o(t[0]);
      r = a(r, t.length);
      for (let i of d) {
        let d = 0,
          l = 0;
        for (let s = e; s < r; s++) {
          d += t[s][i], l++
        }
        isNaN(d) && (d = 0), s[i + "Sumpage"] = d, s[i + "Avgpage"] = l > 0 ? d / l : 0, d = 0, l =
          0;
        for (let e = 0; e < r; e++) {
          d += t[e][i], l++
        }
        isNaN(d) && (d = 0), s[i + "Acc"] = d, s[i + "Avgacc"] = l > 0 ? d / l : 0, d = 0, l = 0;
        for (let e = 0; e < t.length; e++) {
          d += t[e][i], l++
        }
        isNaN(d) && (d = 0), s[i + "Sum"] = d, s[i + "Avg"] = l > 0 ? d / l : 0
      }
      for (let t = i.cols.length; t--;) {
        i.cols[t].totalData = s
      }
    };
  return async (t, e, o, a, u, f, g) => {
    g || f.push(t);
    let {
      props: b,
      type: $
    } = t, {
      bind: m,
      rows: y,
      borderwidth: x,
      tfootSpacing: _,
      borderdeed: w,
      headFirst: k,
      footLast: v,
      hideFoot: L,
      hideHead: F,
      hideTotal: S,
      hideLabel: C,
      columnsPrint: H,
      hspace: M
    } = b, G = async (t, i, s) => {
      m._data = t.slice(e, e + 1), m._showAcc = !0, m._showFoot = !1, m._showHead = !
        1, p(t, e, i, s);
      let d = (await l._n2($, {
          props: b,
          unit: u
        })).getElementsByTagName("tr"),
        o = d[d.length - 1];
      return r.bF(o.offsetHeight)
    };
    if (m.id) {
      let {
        _eD: g,
        _eE: T
      } = i._nz(m);
      if (!g) {
        let i = !1,
          g = 0,
          A = -1,
          z = -1,
          P = -1,
          j = 0,
          I = 0;
        for (let t of y) t.label ? -1 == A && (A = g) : t.data ? z = g : t.total ? P = g :
          -1 == A ? j++ : -1 != P && I++, g++;
        let B = y[P],
          D = y[z],
          N = !1,
          R = !1,
          W = !1;
        for (let t of D.cols)
          if (t.bindKey && t.textAutoHeight) {
            N = !0;
            break
          } for (let t = A; t < z; t++) {
          let e, r = y[t];
          for (let t of r.cols)
            if (t.textAutoHeight) {
              R = !0, e = !0;
              break
            } if (e) break
        }
        let O = N || R,
          Y = [];
        if (O && (await (async (e, i) => {
          if (!c[t.id]) {
            m._data = e, m._showAcc = !1, m._showFoot = !1, m._showHead = !
              1, b.hideLabel = !1;
            let s = await l._n2(i, {
              props: b,
              unit: u
            });
            b.hideLabel = C;
            let d = s.getElementsByTagName("tr"),
              o = [];
            for (let t = d.length; t--;) {
              let e = d[t];
              o[t] = r.bF(e.offsetHeight)
            }
            c[t.id] = o
          }
        })(T, $), Y = c[t.id]), !S)
          for (let t of B.cols)
            if ("sumpage" == t.type || "sum" == t.type || "acc" == t.type || "custom" ==
              t.type || "avg" == t.type || "avgpage" == t.type || "avgacc" == t.type ||
              "text" == t.type && t.textContent) {
              i = !0;
              break
            } if (i)
          for (let t of B.cols)
            if (t.textAutoHeight) {
              W = !0;
              break
            } d.bF(b, !0);
        let E = d.bG(b)._gm,
          V = E[P] || 0,
          U = V,
          K = 0,
          J = E[z] || 0,
          X = 0,
          q = 0;
        if (R)
          for (let t = A; t < z; t++) {
            let e = y[t],
              r = Y[t - A] || 0;
            X += r;
            for (let t of e.cols) t.height = r
          } else
          for (let t = A; t < z; t++) {
            X += E[t] || 0
          }
        for (let t = 0; t < E.length; t++) !F && t < A && (K += E[t] || 0), t > P && !L &&
        (q += E[t] || 0);
        "separate" == w && (K += 2 * j, q += 2 * I, V += 2, X += 2, x = 2, J += 2);
        let Z, Q, tt, et = !1;
        for (;;) {
          let r = !0,
            d = !0;
          0 == e || b.eachPageLabel || (b.hideLabel = !0), b.hideLabel && (X = 0);
          let l, c = o.height - b.y - x - _ - a - X;
          F ? d = !1 : k ? 0 == e ? c -= K : d = !1 : c -= K, i && (c -= V);
          let u = async () => {
            for (;;) {
              if (Q < 1 && (Q = 1), Q + e > T.length && (Q = T.length - e), O) {
                let t = z - A,
                  r = Y.slice(e + t, e + Q + t);
                m._rHeights = r, l = 0;
                for (let t of r) l += t
              } else l = Q * J + x;
              if (W) {
                for (let t of B.cols) t.height = U;
                let t = await G(T, Q + e, B);
                for (let e of B.cols) e.height = t;
                c += V, c -= t, V = t
              }
              if (l > c && Q > 1 ? Q-- : tt = 1, tt) break
            }
            Z = Q + e
          };
          if (v && !L)
            if (Q = n(c / J), await u(), Z >= T.length)
              if (Z = T.length, e < Z) {
                let t = l + x + X + q + _;
                i && (t += V), b.y + t <= o.height ? et = !0 : r = !1
              } else et = !0;
            else r = !1;
          else c -= q, Q = n(c / J), await u(), Z >= T.length && (Z = T.length, et = !0);
          m._data = T.slice(e, Z), h() < .1 && m._data.length > 1 && m._data.splice(n(h() *
            m._data.length), 1), m._all = T, m._showAcc = i, m._showFoot = r, m._showHead =
            d, i && p(T, e, Z, B);
          let g = b.x + 2 * b.width + M <= o.width;
          if (et || !H || !g) break;
          e = Z, t = s.bJ(t), f.push(t), b = t.props, m = b.bind, y = b.rows, B = y[P], b
            .x += b.width + M, tt = 0
        }
        return et ? -1 : Z
      }
      m._tip = g
    } else m._showHead = !0, m._showFoot = !0;
    return -1
  }
})), s.d("8a/a2/data-ftable", ["../../5s/60", "../../5s/62", "../../6c/83", "../../6c/6d", "../../6c/72",
  "../6d/5r", "./a4"], (t => {
  let e = t("../../5s/60"),
    r = t("../../5s/62"),
    i = t("../../6c/83"),
    s = t("../../6c/6d"),
    d = t("../../6c/72"),
    l = t("../6d/5r"),
    o = t("./a4"),
    {
      floor: a
    } = Math,
    n = {};
  return async (t, h, c, p, u, f, g, b) => {
    var $, m;
    g || f.push(t);
    let y, x, {
        props: _,
        id: w
      } = t,
      {
        bind: k,
        rows: v,
        borderwidth: L,
        tfootSpacing: F,
        borderdeed: S,
        headFirst: C,
        footLast: H,
        hideFoot: M,
        hideHead: G,
        hideLabel: T,
        hideTotal: A,
        hspace: z,
        columnsPrint: P,
        autoHeight: j
      } = _,
      I = s.bJ(v);
    if (k.id) {
      let t = i._nz(k);
      y = t._eD, x = t._eE
    } else x = [];
    if (!y) {
      let i;
      j && (n[w] ? i = n[w] : (i = await (async (t, i, d, a, n) => {
        var h, c, p;
        (i = s.bJ(i)).hideLabel = !1, i.hideTotal = !1;
        let {
          rows: u,
          bind: f
        } = i;
        f._showAcc = !0, f._showHead = !0, f._showFoot = !0;
        let g = 0,
          b = -1;
        for (let t of u) {
          if (t.data) {
            b = g;
            break
          }
          g++
        }
        g = 0;
        for (let t of u) {
          if (g != b)
            for (let e of t.cols)
              if (null === (h = e.elements) || void 0 === h ?
                void 0 : h.length)
                for (let t of e.elements) t.props.bind && o(t,
                  n, a, 1);
          g++
        }
        let $ = u[b],
          m = [];
        for (let e of t) {
          let t = s.bJ($);
          for (let r of t.cols)
            if (null === (c = r.elements) || void 0 === c ? void 0 :
              c.length)
              for (let t of r.elements) t.props.bind && (t.props.bind
                ._data = e);
          m.push(t)
        }
        u.splice(b, 1, ...m);
        let y = (await l._n2("data-ftable", {
            props: i,
            unit: d
          })).querySelector("tbody").getElementsByTagName("tr"),
          x = [];
        g = 0;
        for (let t of u) {
          let i = 0,
            s = 0;
          for (let l of t.cols) {
            if (null === (p = l.elements) || void 0 === p ? void 0 :
              p.length) {
              let t = 0,
                o = y[g].cells[s].children,
                a = 0;
              for (let i of l.elements) {
                let s = r.bG(i.props)._bQ,
                  l = o[t].firstElementChild.getBoundingClientRect(),
                  n = e.bF(l.height, d) - s;
                n > a && (a = n), t++
              }
              a > i && (i = a)
            }
            s++
          }
          x[g] = i, g++
        }
        return x
      })(x, _, b, u, f), n[w] = i));
      let g = !A,
        y = 0,
        B = -1,
        D = -1,
        N = -1,
        R = -1,
        W = 0,
        O = 0;
      for (let t of v) t.label ? -1 == B && (B = y) : t.data ? D = y : t.total ? -1 == N && (
        N = y) : -1 == B ? W++ : -1 != N && (-1 == R && (R = y), O++), y++;
      let Y = v[D];
      d.bF(_, !0);
      let E, V, U, K, J = d.bG(_)._gm,
        X = 0,
        q = 0,
        Z = 0,
        Q = J[D] || 0,
        tt = 0,
        et = !1;
      j && (E = i.slice(0, D + 1).concat(i.slice(N - v.length)));
      for (let t = 0; t < J.length; t++) {
        let e = j ? E[t] : 0;
        !G && t < B ? Z += J[t] + e : t >= B && t < D && !T ? q += J[t] + e : t >= N && t <
        R && !A ? X += J[t] + e : t >= R && !M && (tt += J[t] + e)
      }
      for ("separate" == S && (Z += 2 * W, tt += 2 * O, X += 2, q += 2, L = 2, Q += 2);;) {
        let e = !0,
          r = !0,
          d = c.height - _.y - L - F - p - q;
        G ? r = !1 : C ? 0 == h ? d -= Z : r = !1 : d -= Z, g && (d -= X);
        let l, n = D + h,
          b = () => {
            for (;;) {
              if (U < 1 && (U = 1), U + h > x.length && (U = x.length - h), j) {
                l = 0;
                for (let t = n + U - 1; t >= n; t--) l += Q + i[t]
              } else l = U * Q;
              if (l > d && U > 1 ? U-- : K = 1, K) break
            }
            V = U + h
          };
        if (H && !M)
          if (U = a(d / Q), b(), V >= x.length)
            if (V = x.length, h < V) {
              let t = l + L + q + tt + F;
              g && (t += X), _.y + t <= c.height ? et = !0 : e = !1
            } else et = !0;
          else e = !1;
        else e = !M, d -= tt, U = a(d / Q), b(), V >= x.length && (V = x.length, et = !0);
        y = 0;
        for (let t of v) {
          if (y != D) {
            let e;
            e = y < D ? y : x.length + y - 1;
            for (let r of t.cols)
              if (null === ($ = r.elements) || void 0 === $ ? void 0 : $.length) {
                for (let t of r.elements) t.props.bind && o(t, f, u, 1);
                j && (r.height += i[e])
              }
          }
          y++
        }
        let w = D + h,
          S = x.slice(h, V),
          T = [];
        for (let t of S) {
          let e = s.bJ(Y);
          for (let r of e.cols) {
            if (null === (m = r.elements) || void 0 === m ? void 0 : m.length)
              for (let e of r.elements) e.props.bind && (e.props.bind._data = t);
            j && (r.height += i[w])
          }
          w++, T.push(e)
        }
        v.splice(D, 1, ...T), k._showAcc = g, k._showFoot = e, k._showHead = r;
        let A = _.x + 2 * _.width + z <= c.width;
        if (et || !P || !A) break;
        h = V, t = s.bJ(t), f.push(t), _ = t.props, k = _.bind, _.rows = s.bJ(I), v = _.rows,
          _.x += _.width + z, K = 0
      }
      return et ? -1 : V
    }
    return k._tip = y, -1
  }
})), s.d("8a/a2/data-repeater", ["5u", "../../6c/83", "../../6c/6d"], (t => {
  let e = t("5u"),
    r = t("../../6c/83"),
    i = t("../../6c/6d"),
    {
      guid: s,
      isArray: d
    } = e;
  return async (t, e, l, o, a, n) => {
    var h;
    let c, {
        props: p,
        type: u,
        id: f
      } = t,
      {
        x: g,
        y: b,
        width: $,
        height: m,
        hspace: y,
        vspace: x
      } = p,
      _ = l.height - o,
      w = g,
      k = b,
      v = m;
    for (;;) {
      let t = i.bJ(p);
      t.x = w, t.y = k;
      let o = t.bind;
      if (o.id) {
        let {
          _eD: t,
          _eE: i
        } = r._nz(o);
        if (t) o._tip = t;
        else {
          d(i) || (i = [i]);
          let t = i[e];
          o._data = t
        }
        e++, (!(null == i ? void 0 : i.length) || e >= i.length) && (c = -1)
      } else c = -1;
      for (let e of t.rows)
        for (let t of e.cols)
          if (null === (h = t.elements) || void 0 === h ? void 0 : h.length)
            for (let e of t.elements) {
              let t = e.props.bind;
              (null == t ? void 0 : t.id) == o.id && (t._data = o._data)
            }
      let b = {
        type: u,
        id: s(f),
        props: t
      };
      if (n || a.push(b), -1 == c) break;
      if (w += $ + y, w + $ > l.width) {
        if (w = g, k += v + x, k + m > _) {
          c = e;
          break
        }
        v = m
      }
    }
    return c
  }
})), s.d("8a/a2/richtext", ["5u", "../../5s/60", "../../6c/83", "../../6c/html2canvas", "../6d/5r"], (t => {
  let e = t("5u"),
    r = t("../../5s/60"),
    i = t("../../6c/83"),
    s = t("../../6c/html2canvas"),
    d = t("../6d/5r"),
    {
      task: l,
      lowTaskFinale: o,
      isArray: a,
      has: n
    } = e,
    h = {
      TD: 1,
      BR: 1,
      TH: 1,
      P: 1,
      DIV: 1
    },
    c = (t, e) => t - e,
    p = (t, e) => t.y - e.y,
    u = (t, e) => {
      let r = e.getBoundingClientRect();
      if (r.height) {
        let e = `${r.y}~${r.height}`;
        t[e] || (t[e] = 1, t.push({
          y: scrollY + r.y,
          height: r.height
        }))
      }
    },
    f = async (t, e, r) => {
      let i = devicePixelRatio,
        a = t.x,
        f = t.y;
      t.x = 0, t.y = 0, d._n0("\u5bcc\u6587\u672c:\u6b63\u5728\u68c0\u6d4b\u56fe\u7247...");
      let g = await d._n2(r, {
        props: t,
        unit: e
      });
      t.x = a, t.y = f;
      let b = g.firstElementChild;
      await d._n4(b, !1), d._n0(
        "\u5bcc\u6587\u672c:\u6b63\u5728\u51c6\u5907\u73af\u5883\u548c\u6570\u636e..."),
        await s(), scrollTo(0, 0);
      let $ = await html2canvas(b, {
        useCORS: !0,
        scale: i
      });
      d._n0("\u5bcc\u6587\u672c:\u6b63\u5728\u68c0\u6d4b\u5206\u5272\u70b9...");
      let m = b.getBoundingClientRect(),
        y = await (async (t, {
          y: e,
          height: r
        }) => {
          let i = document.createRange(),
            s = [],
            d = t => {
              if (scrollTo(0, 0), 3 == t.nodeType) {
                let e = 0;
                for (; e < t.length;) i.setStart(t, e), i.setEnd(t, e + 1), u(s,
                  i), e++
              } else i.setStartBefore(t), i.setEndAfter(t), u(s, i)
            },
            a = t => {
              for (let e of t) 3 == e.nodeType ? l(d, [e]) : 1 == e.nodeType && (
                e.childNodes.length ? l(a, e.childNodes) : n(h, e.tagName.toUpperCase()) ||
                  l(d, [e]))
            };
          a(t), await o(), s.sort(p), s.length || s.push({
            y: e,
            height: 2
          });
          let c = e + r,
            f = s[s.length - 1];
          return c - (f.y + f.height) >= 30 && s.push({
            y: c - 2,
            height: 2
          }), (t => {
            let e = [],
              r = t[0];
            for (let i = 1; i < t.length; i++) {
              e.push(r);
              let s = t[i],
                d = r.y + r.height,
                l = s.y - d,
                o = l / 30 | 0;
              if (o) {
                let t = l / o;
                for (let r = 0; r < o; r++) e.push({
                  y: d + t * (r + 1) - 2,
                  height: 4
                })
              }
              r = s
            }
            return e.push(r), e
          })(s)
        })([b], m),
        x = await (async (t, e) => {
          let r = [],
            i = i => {
              let s, d = i.y + i.height,
                l = 1;
              for (let t of e) {
                if (t.y + t.height > d && t.y < d) {
                  l = 0;
                  break
                }
                t.y > d && (null == s || t.y < s) && (s = t.y)
              }
              if (l) {
                let e = d - t.y;
                null != s && (s -= t.y, e += (s - e) / 2), -1 == r.indexOf(e) &&
                r.push(e)
              }
            };
          for (let t of e) l(i, [t]);
          return await o(), r.sort(c)
        })(m, y);
      return d._n0("\u5bcc\u6587\u672c:\u6b63\u5728\u5206\u5272..."), await (async (t, e, r) => {
        let i = [],
          s = document.createElement("canvas"),
          d = s.getContext("2d"),
          a = 0,
          n = e.width;
        s.width = n, t[t.length - 1] = e.height / r;
        let h = t => {
          let l = (t - a) * r;
          l > 0 && (s.height = l, d.drawImage(e, 0, a * r, n, l, 0, 0, n, l),
            i.push({
              _eE: s.toDataURL("image/png", 1),
              _bP: n / r,
              _bQ: l / r
            })), d.clearRect(0, 0, n, l), a = t
        };
        for (let e of t) l(h, [e]);
        return await o(), i
      })(x, $, i)
    };
  return async (t, e, s, l, o, n, h) => {
    let {
      props: c,
      type: p,
      id: u
    } = t, g = r.bU(s.height - l - c.y), b = "richtext";
    if ("data-richtext" == p) {
      t.type = b;
      let e = c.bind;
      if (e.id) {
        c.splitToPages = !0;
        let {
          _eD: t,
          _eE: r
        } = i._nz(e), s = e.fields[0];
        if (t) c.text = t;
        else {
          let t = a(r) ? r[0] : r;
          c.text = t[s.key]
        }
      } else c.height = r.bF(30)
    } else if ("html" == p) {
      let e = c.bind;
      if (c.splitToPages = !0, t.type = b, e.id) {
        let {
          _eD: t,
          _eE: r
        } = i._nz(e);
        t || (e._data = r)
      }
      b = "html"
    }
    if (c.splitToPages) try {
      let r = o[`_o7_${u}`];
      r || (r = await f(c, n, b), o[`_o7_${u}`] = r);
      let i = e,
        s = r.length,
        l = [];
      for (; i < s;) {
        let t = r[i];
        if (g < t._bQ) {
          l.length || (i++, l.push(t));
          break
        }
        g -= t._bQ, l.push(t), i++
      }
      let a = '<div style="display:flex;flex-direction:column;">';
      for (let t of l) a +=
        `<img src="${t._eE}" style="width:${t._bP}px;height:${t._bQ}px"/>`;
      return a += "</div>", c.text = a, h.push(t), i < s ? i : -1
    } catch (t) {
      c.text = t.message || t.name
    } finally {
      d._n1()
    }
    return h.push(t), -1
  }
}));
