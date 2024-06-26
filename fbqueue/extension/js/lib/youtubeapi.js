if (!window['YT']) {
  var YT = {
    loading: 0,
    loaded: 0
  };
}
if (!window['YTConfig']) {
  var YTConfig = {
    'host': 'http://www.youtube.com'
  };
}
if (!YT.loading) {
  YT.loading = 1;
  (function() {
    var l = [];
    YT.ready = function(f) {
      if (YT.loaded) {
        f();
      } else {
        l.push(f);
      }
    };
    window.onYTReady = function() {
      YT.loaded = 1;
      for (var i = 0; i < l.length; i++) {
        try {
          l[i]();
        } catch (e) {}
      }
    };
    YT.setConfig = function(c) {
      for (var k in c) {
        if (c.hasOwnProperty(k)) {
          YTConfig[k] = c[k];
        }
      }
    };
  })();
}

(function() {
  var g, h = this;

  function m(a) {
    a = a.split(".");
    for (var b = h, c; c = a.shift();)
      if (null != b[c]) b = b[c];
      else return null;
    return b
  }

  function n(a) {
    var b = typeof a;
    if ("object" == b)
      if (a) {
        if (a instanceof Array) return "array";
        if (a instanceof Object) return b;
        var c = Object.prototype.toString.call(a);
        if ("[object Window]" == c) return "object";
        if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice")) return "array";
        if ("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call")) return "function"
      } else return "null";
    else if ("function" == b && "undefined" == typeof a.call) return "object";
    return b
  }

  function p(a) {
    return "string" == typeof a
  }

  function aa(a) {
    var b = typeof a;
    return "object" == b && null != a || "function" == b
  }
  var q = "closure_uid_" + (1E9 * Math.random() >>> 0),
    ba = 0;

  function ca(a, b, c) {
    return a.call.apply(a.bind, arguments)
  }

  function da(a, b, c) {
    if (!a) throw Error();
    if (2 < arguments.length) {
      var d = Array.prototype.slice.call(arguments, 2);
      return function() {
        var c = Array.prototype.slice.call(arguments);
        Array.prototype.unshift.apply(c, d);
        return a.apply(b, c)
      }
    }
    return function() {
      return a.apply(b, arguments)
    }
  }

  function r(a, b, c) {
    r = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? ca : da;
    return r.apply(null, arguments)
  }

  function t(a, b) {
    var c = a.split("."),
      d = h;
    c[0] in d || !d.execScript || d.execScript("var " + c[0]);
    for (var e; c.length && (e = c.shift());) c.length || void 0 === b ? d[e] ? d = d[e] : d = d[e] = {} : d[e] = b
  }

  function u(a, b) {
    function c() {}
    c.prototype = b.prototype;
    a.J = b.prototype;
    a.prototype = new c;
    a.base = function(a, c, f) {
      for (var k = Array(arguments.length - 2), l = 2; l < arguments.length; l++) k[l - 2] = arguments[l];
      return b.prototype[c].apply(a, k)
    }
  }
  Function.prototype.bind = Function.prototype.bind || function(a, b) {
    if (1 < arguments.length) {
      var c = Array.prototype.slice.call(arguments, 1);
      c.unshift(this, a);
      return r.apply(null, c)
    }
    return r(this, a)
  };
  var ea = String.prototype.trim ? function(a) {
    return a.trim()
  } : function(a) {
    return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
  };

  function v(a, b) {
    return a < b ? -1 : a > b ? 1 : 0
  };
  var w = Array.prototype,
    fa = w.indexOf ? function(a, b, c) {
      return w.indexOf.call(a, b, c)
    } : function(a, b, c) {
      c = null == c ? 0 : 0 > c ? Math.max(0, a.length + c) : c;
      if (p(a)) return p(b) && 1 == b.length ? a.indexOf(b, c) : -1;
      for (; c < a.length; c++)
        if (c in a && a[c] === b) return c;
      return -1
    },
    x = w.forEach ? function(a, b, c) {
      w.forEach.call(a, b, c)
    } : function(a, b, c) {
      for (var d = a.length, e = p(a) ? a.split("") : a, f = 0; f < d; f++) f in e && b.call(c, e[f], f, a)
    };

  function ga(a, b) {
    var c;
    t: {
      c = a.length;
      for (var d = p(a) ? a.split("") : a, e = 0; e < c; e++)
        if (e in d && b.call(void 0, d[e], e, a)) {
          c = e;
          break t
        }
      c = -1
    }
    return 0 > c ? null : p(a) ? a.charAt(c) : a[c]
  }

  function ha(a) {
    return w.concat.apply(w, arguments)
  }

  function ia(a) {
    var b = a.length;
    if (0 < b) {
      for (var c = Array(b), d = 0; d < b; d++) c[d] = a[d];
      return c
    }
    return []
  };

  function ja(a) {
    var b = y,
      c;
    for (c in b)
      if (a.call(void 0, b[c], c, b)) return c
  }

  function z(a) {
    var b = arguments.length;
    if (1 == b && "array" == n(arguments[0])) return z.apply(null, arguments[0]);
    for (var c = {}, d = 0; d < b; d++) c[arguments[d]] = !0;
    return c
  };
  z("area base br col command embed hr img input keygen link meta param source track wbr".split(" "));
  z("action", "cite", "data", "formaction", "href", "manifest", "poster", "src");
  z("embed", "iframe", "link", "object", "script", "style", "template");
  var A;
  t: {
    var ka = h.navigator;
    if (ka) {
      var la = ka.userAgent;
      if (la) {
        A = la;
        break t
      }
    }
    A = ""
  };
  var ma = -1 != A.indexOf("Opera") || -1 != A.indexOf("OPR"),
    B = -1 != A.indexOf("Trident") || -1 != A.indexOf("MSIE"),
    C = -1 != A.indexOf("Gecko") && -1 == A.toLowerCase().indexOf("webkit") && !(-1 != A.indexOf("Trident") || -1 != A.indexOf("MSIE")),
    na = -1 != A.toLowerCase().indexOf("webkit");

  function oa() {
    var a = h.document;
    return a ? a.documentMode : void 0
  }
  var pa = function() {
      var a = "",
        b;
      if (ma && h.opera) return a = h.opera.version, "function" == n(a) ? a() : a;
      C ? b = /rv\:([^\);]+)(\)|;)/ : B ? b = /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/ : na && (b = /WebKit\/(\S+)/);
      b && (a = (a = b.exec(A)) ? a[1] : "");
      return B && (b = oa(), b > parseFloat(a)) ? String(b) : a
    }(),
    qa = {};

  function ra(a) {
    if (!qa[a]) {
      for (var b = 0, c = ea(String(pa)).split("."), d = ea(String(a)).split("."), e = Math.max(c.length, d.length), f = 0; 0 == b && f < e; f++) {
        var k = c[f] || "",
          l = d[f] || "",
          Xa = RegExp("(\\d*)(\\D*)", "g"),
          Ya = RegExp("(\\d*)(\\D*)", "g");
        do {
          var J = Xa.exec(k) || ["", "", ""],
            K = Ya.exec(l) || ["", "", ""];
          if (0 == J[0].length && 0 == K[0].length) break;
          b = v(0 == J[1].length ? 0 : parseInt(J[1], 10), 0 == K[1].length ? 0 : parseInt(K[1], 10)) || v(0 == J[2].length, 0 == K[2].length) || v(J[2], K[2])
        } while (0 == b)
      }
      qa[a] = 0 <= b
    }
  }
  var sa = h.document,
    ta = sa && B ? oa() || ("CSS1Compat" == sa.compatMode ? parseInt(pa, 10) : 5) : void 0;
  var D;
  if (!(D = !C && !B)) {
    var E;
    if (E = B) E = B && 9 <= ta;
    D = E
  }
  D || C && ra("1.9.1");
  B && ra("9");

  function ua(a) {
    var b, c, d, e;
    b = document;
    if (b.querySelectorAll && b.querySelector && a) return b.querySelectorAll("" + (a ? "." + a : ""));
    if (a && b.getElementsByClassName) {
      var f = b.getElementsByClassName(a);
      return f
    }
    f = b.getElementsByTagName("*");
    if (a) {
      e = {};
      for (c = d = 0; b = f[c]; c++) {
        var k = b.className,
          l;
        if (l = "function" == typeof k.split) l = 0 <= fa(k.split(/\s+/), a);
        l && (e[d++] = b)
      }
      e.length = d;
      return e
    }
    return f
  }

  function va(a, b) {
    for (var c = 0; a;) {
      if (b(a)) return a;
      a = a.parentNode;
      c++
    }
    return null
  };

  function wa(a) {
    a = String(a);
    if (/^\s*$/.test(a) ? 0 : /^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g, "@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g, ""))) try {
      return eval("(" + a + ")")
    } catch (b) {}
    throw Error("Invalid JSON string: " + a);
  }

  function xa() {}

  function F(a, b, c) {
    switch (typeof b) {
      case "string":
        ya(b, c);
        break;
      case "number":
        c.push(isFinite(b) && !isNaN(b) ? b : "null");
        break;
      case "boolean":
        c.push(b);
        break;
      case "undefined":
        c.push("null");
        break;
      case "object":
        if (null == b) {
          c.push("null");
          break
        }
        if ("array" == n(b)) {
          var d = b.length;
          c.push("[");
          for (var e = "", f = 0; f < d; f++) c.push(e), F(a, b[f], c), e = ",";
          c.push("]");
          break
        }
        c.push("{");
        d = "";
        for (e in b) Object.prototype.hasOwnProperty.call(b, e) && (f = b[e], "function" != typeof f && (c.push(d), ya(e, c), c.push(":"), F(a, f, c), d = ","));
        c.push("}");
        break;
      case "function":
        break;
      default:
        throw Error("Unknown type: " + typeof b);
    }
  }
  var G = {
      '"': '\\"',
      "\\": "\\\\",
      "/": "\\/",
      "\b": "\\b",
      "\f": "\\f",
      "\n": "\\n",
      "\r": "\\r",
      "\t": "\\t",
      "\x0B": "\\u000b"
    }

  var za = /\uffff/.test("\uffff") ? (/[\\\"\x00-\x1f\x7f-\uffff]/g) : (/[\\\"\x00-\x1f\x7f-\xff]/g);

  function ya(a, b) {
    b.push('"', a.replace(za, function(a) {
      if (a in G) return G[a];
      var b = a.charCodeAt(0),
        e = "\\u";
      16 > b ? e += "000" : 256 > b ? e += "00" : 4096 > b && (e += "0");
      return G[a] = e + b.toString(16)
    }), '"')
  };

  function H() {
    this.k = this.k;
    this.t = this.t
  }
  H.prototype.k = !1;
  H.prototype.dispose = function() {
    this.k || (this.k = !0, this.I())
  };
  H.prototype.I = function() {
    if (this.t)
      for (; this.t.length;) this.t.shift()()
  };

  function I() {
    H.call(this);
    this.d = [];
    this.j = {}
  }
  u(I, H);
  g = I.prototype;
  g.P = 1;
  g.C = 0;
  g.subscribe = function(a, b, c) {
    var d = this.j[a];
    d || (d = this.j[a] = []);
    var e = this.P;
    this.d[e] = a;
    this.d[e + 1] = b;
    this.d[e + 2] = c;
    this.P = e + 3;
    d.push(e);
    return e
  };
  g.unsubscribe = function(a, b, c) {
    if (a = this.j[a]) {
      var d = this.d;
      if (a = ga(a, function(a) {
          return d[a + 1] == b && d[a + 2] == c
        })) return Aa(this, a)
    }
    return !1
  };

  function Aa(a, b) {
    if (0 != a.C) return a.o || (a.o = []), a.o.push(b), !1;
    var c = a.d[b];
    if (c) {
      var d = a.j[c];
      if (d) {
        var e = fa(d, b);
        0 <= e && w.splice.call(d, e, 1)
      }
      delete a.d[b];
      delete a.d[b + 1];
      delete a.d[b + 2]
    }
    return !!c
  }
  g.publish = function(a, b) {
    var c = this.j[a];
    if (c) {
      this.C++;
      for (var d = Array(arguments.length - 1), e = 1, f = arguments.length; e < f; e++) d[e - 1] = arguments[e];
      e = 0;
      for (f = c.length; e < f; e++) {
        var k = c[e];
        this.d[k + 1].apply(this.d[k + 2], d)
      }
      this.C--;
      if (this.o && 0 == this.C)
        for (; c = this.o.pop();) Aa(this, c);
      return 0 != e
    }
    return !1
  };
  g.I = function() {
    I.J.I.call(this);
    delete this.d;
    delete this.j;
    delete this.o
  };
  var Ba = /^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#(.*))?$/;

  function Ca(a) {
    if (L) {
      L = !1;
      var b = h.location;
      if (b) {
        var c = b.href;
        if (c && (c = (c = Ca(c)[3] || null) ? decodeURI(c) : c) && c != b.hostname) throw L = !0, Error();
      }
    }
    return a.match(Ba)
  }
  var L = na;

  function Da(a, b, c) {
    if ("array" == n(b))
      for (var d = 0; d < b.length; d++) Da(a, String(b[d]), c);
    else null != b && c.push("&", a, "" === b ? "" : "=", encodeURIComponent(String(b)))
  }
  var Ea = /#|$/;
  var Fa = {};

  function Ga(a) {
    return Fa[a] || (Fa[a] = String(a).replace(/\-([a-z])/g, function(a, c) {
      return c.toUpperCase()
    }))
  };
  var M = m("yt.dom.getNextId_");
  if (!M) {
    M = function() {
      return ++Ha
    };
    t("yt.dom.getNextId_", M);
    var Ha = 0
  };
  var N = window.yt && window.yt.config_ || {};
  t("yt.config_", N);
  t("yt.tokens_", window.yt && window.yt.tokens_ || {});
  t("yt.msgs_", window.yt && window.yt.msgs_ || {});

  function Ia(a) {
    var b = arguments;
    if (1 < b.length) {
      var c = b[0];
      N[c] = b[1]
    } else
      for (c in b = b[0], b) N[c] = b[c]
  }

  function Ja(a) {
    "function" == n(a) && (a = Ka(a));
    return window.setInterval(a, 250)
  }

  function Ka(a) {
    return a && window.yterr ? function() {
      try {
        return a.apply(this, arguments)
      } catch (b) {
        throw La(b), b;
      }
    } : a
  }

  function La(a, b) {
    var c = m("yt.www.errors.log");
    c ? c(a, b) : (c = ("ERRORS" in N ? N.ERRORS : void 0) || [], c.push([a, b]), Ia("ERRORS", c))
  };

  function Ma(a) {
    if (a = a || window.event) {
      for (var b in a) b in Na || (this[b] = a[b]);
      (b = a.target || a.srcElement) && 3 == b.nodeType && (b = b.parentNode);
      this.target = b;
      if (b = a.relatedTarget) try {
        b = b.nodeName ? b : null
      } catch (c) {
        b = null
      } else "mouseover" == this.type ? b = a.fromElement : "mouseout" == this.type && (b = a.toElement);
      this.relatedTarget = b;
      this.clientX = void 0 != a.clientX ? a.clientX : a.pageX;
      this.clientY = void 0 != a.clientY ? a.clientY : a.pageY;
      this.keyCode = a.keyCode ? a.keyCode : a.which;
      this.charCode = a.charCode || ("keypress" == this.type ?
        this.keyCode : 0);
      this.altKey = a.altKey;
      this.ctrlKey = a.ctrlKey;
      this.shiftKey = a.shiftKey;
      "MozMousePixelScroll" == this.type ? (this.wheelDeltaX = a.axis == a.HORIZONTAL_AXIS ? a.detail : 0, this.wheelDeltaY = a.axis == a.HORIZONTAL_AXIS ? 0 : a.detail) : window.opera ? (this.wheelDeltaX = 0, this.wheelDeltaY = a.detail) : 0 == a.wheelDelta % 120 ? "WebkitTransform" in document.documentElement.style ? window.chrome && 0 == navigator.platform.indexOf("Mac") ? (this.wheelDeltaX = a.wheelDeltaX / -30, this.wheelDeltaY = a.wheelDeltaY / -30) : (this.wheelDeltaX =
        a.wheelDeltaX / -1.2, this.wheelDeltaY = a.wheelDeltaY / -1.2) : (this.wheelDeltaX = 0, this.wheelDeltaY = a.wheelDelta / -1.6) : (this.wheelDeltaX = a.wheelDeltaX / -3, this.wheelDeltaY = a.wheelDeltaY / -3)
    }
  }
  g = Ma.prototype;
  g.type = "";
  g.target = null;
  g.relatedTarget = null;
  g.currentTarget = null;
  g.data = null;
  g.keyCode = 0;
  g.charCode = 0;
  g.altKey = !1;
  g.ctrlKey = !1;
  g.shiftKey = !1;
  g.clientX = 0;
  g.clientY = 0;
  g.wheelDeltaX = 0;
  g.wheelDeltaY = 0;
  var Na = {
    stopImmediatePropagation: 1,
    stopPropagation: 1,
    preventMouseEvent: 1,
    preventManipulation: 1,
    preventDefault: 1,
    layerX: 1,
    layerY: 1,
    scale: 1,
    rotation: 1
  };
  var y = m("yt.events.listeners_") || {};
  t("yt.events.listeners_", y);
  var Oa = m("yt.events.counter_") || {
    count: 0
  };
  t("yt.events.counter_", Oa);

  function Pa(a, b, c) {
    return ja(function(d) {
      return d[0] == a && d[1] == b && d[2] == c && 0 == d[4]
    })
  }

  function Qa(a, b, c) {
    if (a && (a.addEventListener || a.attachEvent)) {
      var d = Pa(a, b, c);
      if (!d) {
        var d = ++Oa.count + "",
          e = !("mouseenter" != b && "mouseleave" != b || !a.addEventListener || "onmouseenter" in document),
          f;
        f = e ? function(d) {
          d = new Ma(d);
          if (!va(d.relatedTarget, function(b) {
              return b == a
            })) return d.currentTarget = a, d.type = b, c.call(a, d)
        } : function(b) {
          b = new Ma(b);
          b.currentTarget = a;
          return c.call(a, b)
        };
        f = Ka(f);
        y[d] = [a, b, c, f, !1];
        a.addEventListener ? "mouseenter" == b && e ? a.addEventListener("mouseover", f, !1) : "mouseleave" == b && e ? a.addEventListener("mouseout",
          f, !1) : "mousewheel" == b && "MozBoxSizing" in document.documentElement.style ? a.addEventListener("MozMousePixelScroll", f, !1) : a.addEventListener(b, f, !1) : a.attachEvent("on" + b, f)
      }
    }
  }

  function Ra(a) {
    a && ("string" == typeof a && (a = [a]), x(a, function(a) {
      if (a in y) {
        var c = y[a],
          d = c[0],
          e = c[1],
          f = c[3],
          c = c[4];
        d.removeEventListener ? d.removeEventListener(e, f, c) : d.detachEvent && d.detachEvent("on" + e, f);
        delete y[a]
      }
    }))
  };

  function Sa(a) {
    var b = [],
      c;
    for (c in a) Da(c, a[c], b);
    b[0] = "";
    return b.join("")
  };
  var O = {},
    Ta = [],
    P = new I,
    Ua = {};

  function Va() {
    x(Ta, function(a) {
      a()
    })
  }

  function Wa(a) {
    var b = ia(document.getElementsByTagName("yt:" + a));
    a = "yt-" + a;
    var c = document;
    a = c.querySelectorAll && c.querySelector ? c.querySelectorAll("." + a) : ua(a);
    a = ia(a);
    return ha(b, a)
  }

  function Q(a, b) {
    return "yt:" == a.tagName.toLowerCase().substr(0, 3) ? a.getAttribute(b) : a ? a.dataset ? a.dataset[Ga(b)] : a.getAttribute("data-" + b) : null
  }

  function Za(a, b) {
    P.publish.apply(P, arguments)
  };

  function R(a, b, c) {
    this.j = b;
    this.t = this.d = null;
    this.H = this[q] || (this[q] = ++ba);
    this.k = 0;
    this.G = !1;
    this.F = [];
    this.o = null;
    this.M = c;
    this.N = {};
    b = document;
    if (a = p(a) ? b.getElementById(a) : a)
      if ("iframe" != a.tagName.toLowerCase() && (b = $a(this, a), this.t = a, (c = a.parentNode) && c.replaceChild(b, a), a = b), this.d = a, this.d.id || (b = a = this.d, b = b[q] || (b[q] = ++ba), a.id = "widget" + b), O[this.d.id] = this, window.postMessage) {
        this.o = new I;
        ab(this);
        a = S(this.j, "events");
        for (var d in a) a.hasOwnProperty(d) && this.addEventListener(d, a[d]);
        for (var e in Ua) bb(this,
          e)
      }
  }
  g = R.prototype;
  g.Y = function(a, b) {
    this.d.width = a;
    this.d.height = b;
    return this
  };
  g.X = function() {
    return this.d
  };
  g.R = function(a) {
    this.A(a.event, a)
  };
  g.addEventListener = function(a, b) {
    var c = b;
    "string" == typeof b && (c = function() {
      window[b].apply(window, arguments)
    });
    this.o.subscribe(a, c);
    cb(this, a);
    return this
  };

  function bb(a, b) {
    var c = b.split(".");
    if (2 != !c.length) {
      var d = c[1];
      a.M == c[0] && cb(a, d)
    }
  }
  g.destroy = function() {
    this.d.id && (O[this.d.id] = null);
    var a = this.o;
    a && "function" == typeof a.dispose && a.dispose();
    if (this.t) {
      var a = this.d,
        b = a.parentNode;
      b && b.replaceChild(this.t, a)
    } else(a = this.d) && a.parentNode && a.parentNode.removeChild(a);
    T && (T[this.H] = null);
    this.j = null;
    var a = this.d,
      c;
    for (c in y) y[c][0] == a && Ra(c);
    this.t = this.d = null
  };
  g.D = function() {
    return {}
  };

  function U(a, b, c) {
    c = c || [];
    c = Array.prototype.slice.call(c);
    b = {
      event: "command",
      func: b,
      args: c
    };
    a.G ? a.K(b) : a.F.push(b)
  }
  g.A = function(a, b) {
    if (!this.o.k) {
      var c = {
        target: this,
        data: b
      };
      this.o.publish(a, c);
      Za(this.M + "." + a, c)
    }
  };

  function $a(a, b) {
    for (var c = document.createElement("iframe"), d = b.attributes, e = 0, f = d.length; e < f; e++) {
      var k = d[e].value;
      null != k && "" != k && "null" != k && c.setAttribute(d[e].name, k)
    }
    c.setAttribute("frameBorder", 0);
    c.setAttribute("allowfullscreen", 1);
    c.setAttribute("title", "YouTube " + S(a.j, "title"));
    (d = S(a.j, "width")) && c.setAttribute("width", d);
    (d = S(a.j, "height")) && c.setAttribute("height", d);
    var l = a.D();
    l.enablejsapi = window.postMessage ? 1 : 0;
    window.location.host && (l.origin = window.location.protocol + "//" + window.location.host);
    window.location.href && x(["debugjs", "debugcss"], function(a) {
      var b;
      b = window.location.href;
      var c = b.search(Ea),
        d;
      i: {
        d = 0;
        for (var e = a.length; 0 <= (d = b.indexOf(a, d)) && d < c;) {
          var f = b.charCodeAt(d - 1);
          if (38 == f || 63 == f)
            if (f = b.charCodeAt(d + e), !f || 61 == f || 38 == f || 35 == f) break i;
          d += e + 1
        }
        d = -1
      }
      if (0 > d) b = null;
      else {
        e = b.indexOf("&", d);
        if (0 > e || e > c) e = c;
        d += a.length + 1;
        b = decodeURIComponent(b.substr(d, e - d).replace(/\+/g, " "))
      }
      null === b || (l[a] = b)
    });
    c.src = S(a.j, "host") + a.L() + "?" + Sa(l);
    return c
  }
  g.O = function() {
    this.d && this.d.contentWindow ? this.K({
      event: "listening"
    }) : window.clearInterval(this.k)
  };

  function ab(a) {
    db(a.j, a, a.H);
    a.k = Ja(r(a.O, a));
    Qa(a.d, "load", r(function() {
      window.clearInterval(this.k);
      this.k = Ja(r(this.O, this))
    }, a))
  }

  function cb(a, b) {
    a.N[b] || (a.N[b] = !0, U(a, "addEventListener", [b]))
  }
  g.K = function(a) {
    a.id = this.H;
    var b = [];
    F(new xa, a, b);
    a = b.join("");
    var b = this.j,
      c, d = Ca(this.d.src);
    c = d[1];
    var e = d[2],
      f = d[3],
      d = d[4],
      k = "";
    c && (k += c + ":");
    f && (k += "//", e && (k += e + "@"), k += f, d && (k += ":" + d));
    c = k;
    b = 0 == c.indexOf("https:") ? [c] : b.d ? [c.replace("http:", "https:")] : b.k ? [c] : [c, c.replace("http:", "https:")];
    for (c = 0; c < b.length; c++) try {
      this.d.contentWindow.postMessage(a, b[c])
    } catch (l) {
      if (l.name && "SyntaxError" == l.name) La(l, "WARNING");
      else throw l;
    }
  };
  var eb = "StopIteration" in h ? h.StopIteration : Error("StopIteration");

  function fb() {}
  fb.prototype.next = function() {
    throw eb;
  };
  fb.prototype.j = function() {
    return this
  };

  function gb() {};

  function hb() {}
  u(hb, gb);

  function V(a) {
    this.d = a
  }
  u(V, hb);
  V.prototype.isAvailable = function() {
    if (!this.d) return !1;
    try {
      return this.d.setItem("__sak", "1"), this.d.removeItem("__sak"), !0
    } catch (a) {
      return !1
    }
  };
  V.prototype.j = function(a) {
    var b = 0,
      c = this.d,
      d = new fb;
    d.next = function() {
      if (b >= c.length) throw eb;
      var d;
      d = c.key(b++);
      if (a) return d;
      d = c.getItem(d);
      if (!p(d)) throw "Storage mechanism: Invalid value was encountered";
      return d
    };
    return d
  };
  V.prototype.key = function(a) {
    return this.d.key(a)
  };

  function ib() {
    var a = null;
    try {
      a = window.localStorage || null
    } catch (b) {}
    this.d = a
  }
  u(ib, V);

  function jb() {
    var a = null;
    try {
      a = window.sessionStorage || null
    } catch (b) {}
    this.d = a
  }
  u(jb, V);
  (new ib).isAvailable();
  (new jb).isAvailable();

  function kb(a) {
    return (0 == a.search("cue") || 0 == a.search("load")) && "loadModule" != a
  }

  function lb(a) {
    return 0 == a.search("get") || 0 == a.search("is")
  };
  var mb = "corp.google.com googleplex.com youtube.com youtube-nocookie.com youtubeeducation.com borg.google.com prod.google.com sandbox.google.com docs.google.com drive.google.com mail.google.com photos.google.com plus.google.com play.google.com googlevideo.com talkgadget.google.com survey.g.doubleclick.net youtube.googleapis.com vevo.com".split(" "),
    nb = "";

  function W(a) {
    this.j = a || {};
    this.defaults = {};
    this.defaults.host = "http://www.youtube.com";
    this.defaults.title = "";
    this.k = this.d = !1;
    a = document.getElementById("www-widgetapi-script");
    if (this.d = !!("https:" == document.location.protocol || a && 0 == a.src.indexOf("https:"))) {
      a = [this.j, window.YTConfig || {}, this.defaults];
      for (var b = 0; b < a.length; b++) a[b].host && (a[b].host = a[b].host.replace("http://", "https://"))
    }
  }
  var T = null;

  function S(a, b) {
    for (var c = [a.j, window.YTConfig || {}, a.defaults], d = 0; d < c.length; d++) {
      var e = c[d][b];
      if (void 0 != e) return e
    }
    return null
  }

  function db(a, b, c) {
    T || (T = {}, Qa(window, "message", r(a.o, a)));
    T[c] = b
  }
  W.prototype.o = function(a) {
    var b;
    (b = a.origin == S(this, "host")) || ((b = a.origin) && b == nb ? b = !0 : (new RegExp("^(https?:)?//([a-z0-9-]{1,63}\\.)*(" + mb.join("|").replace(/\./g, ".") + ")(:[0-9]+)?([/?#]|$)", "i")).test(b) ? (nb = b, b = !0) : b = !1);
    if (b) {
      var c;
      try {
        c = wa(a.data)
      } catch (d) {
        return
      }
      this.k = !0;
      this.d || 0 != a.origin.indexOf("https:") || (this.d = !0);
      if (a = T[c.id]) a.G = !0, a.G && (x(a.F, a.K, a), a.F.length = 0), a.R(c)
    }
  };

  function ob(a) {
    W.call(this, a);
    this.defaults.title = "video player";
    this.defaults.videoId = "";
    this.defaults.width = 640;
    this.defaults.height = 360
  }
  u(ob, W);

  function X(a, b) {
    var c = new ob(b);
    R.call(this, a, c, "player");
    this.B = {};
    this.v = {}
  }
  u(X, R);

  function pb(a) {
    if ("iframe" != a.tagName.toLowerCase()) {
      var b = Q(a, "videoid");
      if (b) {
        var c = Q(a, "width"),
          d = Q(a, "height");
        new X(a, {
          videoId: b,
          width: c,
          height: d
        })
      }
    }
  }
  g = X.prototype;
  g.L = function() {
    return "/embed/" + S(this.j, "videoId")
  };
  g.D = function() {
    var a;
    if (S(this.j, "playerVars")) {
      a = S(this.j, "playerVars");
      var b = {},
        c;
      for (c in a) b[c] = a[c];
      a = b
    } else a = {};
    return a
  };
  g.R = function(a) {
    var b = a.event;
    a = a.info;
    switch (b) {
      case "apiInfoDelivery":
        if (aa(a))
          for (var c in a) this.v[c] = a[c];
        break;
      case "infoDelivery":
        qb(this, a);
        break;
      case "initialDelivery":
        window.clearInterval(this.k);
        this.B = {};
        this.v = {};
        rb(this, a.apiInterface);
        qb(this, a);
        break;
      default:
        this.A(b, a)
    }
  };

  function qb(a, b) {
    if (aa(b))
      for (var c in b) a.B[c] = b[c]
  }

  function rb(a, b) {
    x(b, function(a) {
      this[a] || (kb(a) ? this[a] = function() {
        this.B = {};
        this.v = {};
        U(this, a, arguments);
        return this
      } : lb(a) ? this[a] = function() {
        var b = 0;
        0 == a.search("get") ? b = 3 : 0 == a.search("is") && (b = 2);
        return this.B[a.charAt(b).toLowerCase() + a.substr(b + 1)]
      } : this[a] = function() {
        U(this, a, arguments);
        return this
      })
    }, a)
  }
  g.aa = function() {
    var a = this.d.cloneNode(!1),
      b = this.B.videoData,
      c = S(this.j, "host");
    a.src = b && b.video_id ? c + "/embed/" + b.video_id : a.src;
    b = document.createElement("div");
    b.appendChild(a);
    return b.innerHTML
  };
  g.$ = function(a) {
    return this.v.namespaces ? a ? this.v[a].options || [] : this.v.namespaces || [] : []
  };
  g.Z = function(a, b) {
    if (this.v.namespaces && a && b) return this.v[a][b]
  };

  function sb(a) {
    W.call(this, a);
    this.defaults.title = "Thumbnail";
    this.defaults.videoId = "";
    this.defaults.width = 120;
    this.defaults.height = 68
  }
  u(sb, W);

  function Y(a, b) {
    var c = new sb(b);
    R.call(this, a, c, "thumbnail")
  }
  u(Y, R);

  function tb(a) {
    if ("iframe" != a.tagName.toLowerCase()) {
      var b = Q(a, "videoid");
      if (b) {
        b = {
          videoId: b,
          events: {}
        };
        b.width = Q(a, "width");
        b.height = Q(a, "height");
        b.thumbWidth = Q(a, "thumb-width");
        b.thumbHeight = Q(a, "thumb-height");
        b.thumbAlign = Q(a, "thumb-align");
        var c = Q(a, "onclick");
        c && (b.events.onClick = c);
        new Y(a, b)
      }
    }
  }
  Y.prototype.L = function() {
    return "/embed/" + S(this.j, "videoId")
  };
  Y.prototype.D = function() {
    return {
      player: 0,
      thumb_width: S(this.j, "thumbWidth"),
      thumb_height: S(this.j, "thumbHeight"),
      thumb_align: S(this.j, "thumbAlign")
    }
  };
  Y.prototype.A = function(a, b) {
    Y.J.A.call(this, a, b ? b.info : void 0)
  };

  function ub(a) {
    W.call(this, a);
    this.defaults.host = "https://www.youtube.com";
    this.defaults.title = "upload widget";
    this.defaults.width = 640;
    this.defaults.height = .67 * S(this, "width")
  }
  u(ub, W);

  function Z(a, b) {
    var c = new ub(b);
    R.call(this, a, c, "upload")
  }
  u(Z, R);
  g = Z.prototype;
  g.L = function() {
    return "/upload_embed"
  };
  g.D = function() {
    var a = {},
      b = S(this.j, "webcamOnly");
    null != b && (a.webcam_only = b);
    return a
  };
  g.A = function(a, b) {
    Z.J.A.call(this, a, b);
    "onApiReady" == a && U(this, "hostWindowReady")
  };
  g.S = function(a) {
    U(this, "setVideoDescription", arguments)
  };
  g.U = function(a) {
    U(this, "setVideoKeywords", arguments)
  };
  g.V = function(a) {
    U(this, "setVideoPrivacy", arguments)
  };
  g.T = function(a) {
    U(this, "setVideoDraftPrivacy", arguments)
  };
  g.W = function(a) {
    U(this, "setVideoTitle", arguments)
  };
  t("YT.PlayerState.UNSTARTED", -1);
  t("YT.PlayerState.ENDED", 0);
  t("YT.PlayerState.PLAYING", 1);
  t("YT.PlayerState.PAUSED", 2);
  t("YT.PlayerState.BUFFERING", 3);
  t("YT.PlayerState.CUED", 5);
  t("YT.UploadWidgetEvent.API_READY", "onApiReady");
  t("YT.UploadWidgetEvent.UPLOAD_SUCCESS", "onUploadSuccess");
  t("YT.UploadWidgetEvent.PROCESSING_COMPLETE", "onProcessingComplete");
  t("YT.UploadWidgetEvent.STATE_CHANGE", "onStateChange");
  t("YT.UploadWidgetState.IDLE", 0);
  t("YT.UploadWidgetState.PENDING", 1);
  t("YT.UploadWidgetState.ERROR", 2);
  t("YT.UploadWidgetState.PLAYBACK", 3);
  t("YT.UploadWidgetState.RECORDING", 4);
  t("YT.UploadWidgetState.STOPPED", 5);
  t("YT.get", function(a) {
    return O[a]
  });
  t("YT.scan", Va);
  t("YT.subscribe", function(a, b, c) {
    P.subscribe(a, b, c);
    Ua[a] = !0;
    for (var d in O) bb(O[d], a)
  });
  t("YT.unsubscribe", function(a, b, c) {
    P.unsubscribe(a, b, c)
  });
  t("YT.Player", X);
  t("YT.Thumbnail", Y);
  t("YT.UploadWidget", Z);
  R.prototype.destroy = R.prototype.destroy;
  R.prototype.setSize = R.prototype.Y;
  R.prototype.getIframe = R.prototype.X;
  R.prototype.addEventListener = R.prototype.addEventListener;
  X.prototype.getVideoEmbedCode = X.prototype.aa;
  X.prototype.getOptions = X.prototype.$;
  X.prototype.getOption = X.prototype.Z;
  Z.prototype.setVideoDescription = Z.prototype.S;
  Z.prototype.setVideoKeywords = Z.prototype.U;
  Z.prototype.setVideoPrivacy = Z.prototype.V;
  Z.prototype.setVideoTitle = Z.prototype.W;
  Z.prototype.setVideoDraftPrivacy = Z.prototype.T;
  Ta.push(function() {
    var a = Wa("player");
    x(a, pb)
  });
  Ta.push(function() {
    var a = Wa("thumbnail");
    x(a, tb)
  });
  "undefined" != typeof YTConfig && YTConfig.parsetags && "onload" != YTConfig.parsetags || Va();
  var vb = m("onYTReady");
  vb && vb();
  var wb = m("onYouTubeIframeAPIReady");
  wb && wb();
  var xb = m("onYouTubePlayerAPIReady");
  xb && xb();
})();
