import {u as ri, bN as si, D as wt, ad as Qe, o as oi, X as di, f as $e, g as Ze, i as Lt, r as et, bU as tt} from "./CGW_Asfn.js";
function _i(xe) {
    return xe && xe.__esModule && Object.prototype.hasOwnProperty.call(xe, "default") ? xe.default : xe
}
var _t = {
    exports: {}
}, Mt;
function li() {
    return Mt || (Mt = 1,
    (function(xe, ut) {
        (function(fe, te) {
            xe.exports = te()
        }
        )(window, (function() {
            return (function(fe) {
                var te = {};
                function B(U) {
                    if (te[U])
                        return te[U].exports;
                    var L = te[U] = {
                        i: U,
                        l: !1,
                        exports: {}
                    };
                    return fe[U].call(L.exports, L, L.exports, B),
                    L.l = !0,
                    L.exports
                }
                return B.m = fe,
                B.c = te,
                B.d = function(U, L, f) {
                    B.o(U, L) || Object.defineProperty(U, L, {
                        enumerable: !0,
                        get: f
                    })
                }
                ,
                B.r = function(U) {
                    typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(U, Symbol.toStringTag, {
                        value: "Module"
                    }),
                    Object.defineProperty(U, "__esModule", {
                        value: !0
                    })
                }
                ,
                B.t = function(U, L) {
                    if (1 & L && (U = B(U)),
                    8 & L || 4 & L && typeof U == "object" && U && U.__esModule)
                        return U;
                    var f = Object.create(null);
                    if (B.r(f),
                    Object.defineProperty(f, "default", {
                        enumerable: !0,
                        value: U
                    }),
                    2 & L && typeof U != "string")
                        for (var v in U)
                            B.d(f, v, (function(m) {
                                return U[m]
                            }
                            ).bind(null, v));
                    return f
                }
                ,
                B.n = function(U) {
                    var L = U && U.__esModule ? function() {
                        return U.default
                    }
                    : function() {
                        return U
                    }
                    ;
                    return B.d(L, "a", L),
                    L
                }
                ,
                B.o = function(U, L) {
                    return Object.prototype.hasOwnProperty.call(U, L)
                }
                ,
                B.p = "",
                B(B.s = 20)
            }
            )([function(fe, te, B) {
                var U = B(9)
                  , L = B.n(U)
                  , f = (function() {
                    function v() {}
                    return v.e = function(m, g) {
                        m && !v.FORCE_GLOBAL_TAG || (m = v.GLOBAL_TAG);
                        var T = "[".concat(m, "] > ").concat(g);
                        v.ENABLE_CALLBACK && v.emitter.emit("log", "error", T),
                        v.ENABLE_ERROR && (console.error ? console.error(T) : console.warn ? console.warn(T) : console.log(T))
                    }
                    ,
                    v.i = function(m, g) {
                        m && !v.FORCE_GLOBAL_TAG || (m = v.GLOBAL_TAG);
                        var T = "[".concat(m, "] > ").concat(g);
                        v.ENABLE_CALLBACK && v.emitter.emit("log", "info", T),
                        v.ENABLE_INFO && (console.info ? console.info(T) : console.log(T))
                    }
                    ,
                    v.w = function(m, g) {
                        m && !v.FORCE_GLOBAL_TAG || (m = v.GLOBAL_TAG);
                        var T = "[".concat(m, "] > ").concat(g);
                        v.ENABLE_CALLBACK && v.emitter.emit("log", "warn", T),
                        v.ENABLE_WARN && (console.warn ? console.warn(T) : console.log(T))
                    }
                    ,
                    v.d = function(m, g) {
                        m && !v.FORCE_GLOBAL_TAG || (m = v.GLOBAL_TAG);
                        var T = "[".concat(m, "] > ").concat(g);
                        v.ENABLE_CALLBACK && v.emitter.emit("log", "debug", T),
                        v.ENABLE_DEBUG && (console.debug ? console.debug(T) : console.log(T))
                    }
                    ,
                    v.v = function(m, g) {
                        m && !v.FORCE_GLOBAL_TAG || (m = v.GLOBAL_TAG);
                        var T = "[".concat(m, "] > ").concat(g);
                        v.ENABLE_CALLBACK && v.emitter.emit("log", "verbose", T),
                        v.ENABLE_VERBOSE && console.log(T)
                    }
                    ,
                    v
                }
                )();
                f.GLOBAL_TAG = "mpegts.js",
                f.FORCE_GLOBAL_TAG = !1,
                f.ENABLE_ERROR = !0,
                f.ENABLE_INFO = !0,
                f.ENABLE_WARN = !0,
                f.ENABLE_DEBUG = !0,
                f.ENABLE_VERBOSE = !0,
                f.ENABLE_CALLBACK = !1,
                f.emitter = new L.a,
                te.a = f
            }
            , function(fe, te, B) {
                var U;
                (function(L) {
                    L.IO_ERROR = "io_error",
                    L.DEMUX_ERROR = "demux_error",
                    L.INIT_SEGMENT = "init_segment",
                    L.MEDIA_SEGMENT = "media_segment",
                    L.LOADING_COMPLETE = "loading_complete",
                    L.RECOVERED_EARLY_EOF = "recovered_early_eof",
                    L.MEDIA_INFO = "media_info",
                    L.METADATA_ARRIVED = "metadata_arrived",
                    L.SCRIPTDATA_ARRIVED = "scriptdata_arrived",
                    L.TIMED_ID3_METADATA_ARRIVED = "timed_id3_metadata_arrived",
                    L.SYNCHRONOUS_KLV_METADATA_ARRIVED = "synchronous_klv_metadata_arrived",
                    L.ASYNCHRONOUS_KLV_METADATA_ARRIVED = "asynchronous_klv_metadata_arrived",
                    L.SMPTE2038_METADATA_ARRIVED = "smpte2038_metadata_arrived",
                    L.SCTE35_METADATA_ARRIVED = "scte35_metadata_arrived",
                    L.PES_PRIVATE_DATA_DESCRIPTOR = "pes_private_data_descriptor",
                    L.PES_PRIVATE_DATA_ARRIVED = "pes_private_data_arrived",
                    L.STATISTICS_INFO = "statistics_info",
                    L.RECOMMEND_SEEKPOINT = "recommend_seekpoint"
                }
                )(U || (U = {})),
                te.a = U
            }
            , function(fe, te, B) {
                B.d(te, "c", (function() {
                    return L
                }
                )),
                B.d(te, "b", (function() {
                    return f
                }
                )),
                B.d(te, "a", (function() {
                    return v
                }
                ));
                var U = B(3)
                  , L = {
                    kIdle: 0,
                    kConnecting: 1,
                    kBuffering: 2,
                    kError: 3,
                    kComplete: 4
                }
                  , f = {
                    OK: "OK",
                    EXCEPTION: "Exception",
                    HTTP_STATUS_CODE_INVALID: "HttpStatusCodeInvalid",
                    CONNECTING_TIMEOUT: "ConnectingTimeout",
                    EARLY_EOF: "EarlyEof",
                    UNRECOVERABLE_EARLY_EOF: "UnrecoverableEarlyEof"
                }
                  , v = (function() {
                    function m(g) {
                        this._type = g || "undefined",
                        this._status = L.kIdle,
                        this._needStash = !1,
                        this._onContentLengthKnown = null,
                        this._onURLRedirect = null,
                        this._onDataArrival = null,
                        this._onError = null,
                        this._onComplete = null
                    }
                    return m.prototype.destroy = function() {
                        this._status = L.kIdle,
                        this._onContentLengthKnown = null,
                        this._onURLRedirect = null,
                        this._onDataArrival = null,
                        this._onError = null,
                        this._onComplete = null
                    }
                    ,
                    m.prototype.isWorking = function() {
                        return this._status === L.kConnecting || this._status === L.kBuffering
                    }
                    ,
                    Object.defineProperty(m.prototype, "type", {
                        get: function() {
                            return this._type
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    Object.defineProperty(m.prototype, "status", {
                        get: function() {
                            return this._status
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    Object.defineProperty(m.prototype, "needStashBuffer", {
                        get: function() {
                            return this._needStash
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    Object.defineProperty(m.prototype, "onContentLengthKnown", {
                        get: function() {
                            return this._onContentLengthKnown
                        },
                        set: function(g) {
                            this._onContentLengthKnown = g
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    Object.defineProperty(m.prototype, "onURLRedirect", {
                        get: function() {
                            return this._onURLRedirect
                        },
                        set: function(g) {
                            this._onURLRedirect = g
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    Object.defineProperty(m.prototype, "onDataArrival", {
                        get: function() {
                            return this._onDataArrival
                        },
                        set: function(g) {
                            this._onDataArrival = g
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    Object.defineProperty(m.prototype, "onError", {
                        get: function() {
                            return this._onError
                        },
                        set: function(g) {
                            this._onError = g
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    Object.defineProperty(m.prototype, "onComplete", {
                        get: function() {
                            return this._onComplete
                        },
                        set: function(g) {
                            this._onComplete = g
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    m.prototype.open = function(g, T) {
                        throw new U.c("Unimplemented abstract function!")
                    }
                    ,
                    m.prototype.abort = function() {
                        throw new U.c("Unimplemented abstract function!")
                    }
                    ,
                    m
                }
                )()
            }
            , function(fe, te, B) {
                B.d(te, "d", (function() {
                    return f
                }
                )),
                B.d(te, "a", (function() {
                    return v
                }
                )),
                B.d(te, "b", (function() {
                    return m
                }
                )),
                B.d(te, "c", (function() {
                    return g
                }
                ));
                var U, L = (U = function(T, R) {
                    return (U = Object.setPrototypeOf || {
                        __proto__: []
                    }instanceof Array && function(w, O) {
                        w.__proto__ = O
                    }
                    || function(w, O) {
                        for (var M in O)
                            Object.prototype.hasOwnProperty.call(O, M) && (w[M] = O[M])
                    }
                    )(T, R)
                }
                ,
                function(T, R) {
                    if (typeof R != "function" && R !== null)
                        throw new TypeError("Class extends value " + String(R) + " is not a constructor or null");
                    function w() {
                        this.constructor = T
                    }
                    U(T, R),
                    T.prototype = R === null ? Object.create(R) : (w.prototype = R.prototype,
                    new w)
                }
                ), f = (function() {
                    function T(R) {
                        this._message = R
                    }
                    return Object.defineProperty(T.prototype, "name", {
                        get: function() {
                            return "RuntimeException"
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    Object.defineProperty(T.prototype, "message", {
                        get: function() {
                            return this._message
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    T.prototype.toString = function() {
                        return this.name + ": " + this.message
                    }
                    ,
                    T
                }
                )(), v = (function(T) {
                    function R(w) {
                        return T.call(this, w) || this
                    }
                    return L(R, T),
                    Object.defineProperty(R.prototype, "name", {
                        get: function() {
                            return "IllegalStateException"
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    R
                }
                )(f), m = (function(T) {
                    function R(w) {
                        return T.call(this, w) || this
                    }
                    return L(R, T),
                    Object.defineProperty(R.prototype, "name", {
                        get: function() {
                            return "InvalidArgumentException"
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    R
                }
                )(f), g = (function(T) {
                    function R(w) {
                        return T.call(this, w) || this
                    }
                    return L(R, T),
                    Object.defineProperty(R.prototype, "name", {
                        get: function() {
                            return "NotImplementedException"
                        },
                        enumerable: !1,
                        configurable: !0
                    }),
                    R
                }
                )(f)
            }
            , function(fe, te, B) {
                var U;
                (function(L) {
                    L.ERROR = "error",
                    L.LOADING_COMPLETE = "loading_complete",
                    L.RECOVERED_EARLY_EOF = "recovered_early_eof",
                    L.MEDIA_INFO = "media_info",
                    L.METADATA_ARRIVED = "metadata_arrived",
                    L.SCRIPTDATA_ARRIVED = "scriptdata_arrived",
                    L.TIMED_ID3_METADATA_ARRIVED = "timed_id3_metadata_arrived",
                    L.SYNCHRONOUS_KLV_METADATA_ARRIVED = "synchronous_klv_metadata_arrived",
                    L.ASYNCHRONOUS_KLV_METADATA_ARRIVED = "asynchronous_klv_metadata_arrived",
                    L.SMPTE2038_METADATA_ARRIVED = "smpte2038_metadata_arrived",
                    L.SCTE35_METADATA_ARRIVED = "scte35_metadata_arrived",
                    L.PES_PRIVATE_DATA_DESCRIPTOR = "pes_private_data_descriptor",
                    L.PES_PRIVATE_DATA_ARRIVED = "pes_private_data_arrived",
                    L.STATISTICS_INFO = "statistics_info",
                    L.DESTROYING = "destroying"
                }
                )(U || (U = {})),
                te.a = U
            }