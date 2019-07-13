var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
System.register("compiler", [], function (exports_1, context_1) {
    "use strict";
    var OutputType, Compiler, DummyCompiler, CompilerClient;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            /** The type of output HTML desired. */
            (function (OutputType) {
                /** Output HTML intended to be interpreted by the browser. */
                OutputType[OutputType["PREVIEW"] = 0] = "PREVIEW";
                /** Output HTML intended to be displayed to the user as source code. */
                OutputType[OutputType["DISPLAY_HTML"] = 1] = "DISPLAY_HTML";
                /** Output HTML intended to be downloaded by the user. */
                OutputType[OutputType["EXPORT_HTML"] = 2] = "EXPORT_HTML";
            })(OutputType || (OutputType = {}));
            exports_1("OutputType", OutputType);
            /** Base class for compiler implementations. */
            Compiler = /** @class */ (function () {
                function Compiler() {
                }
                return Compiler;
            }());
            exports_1("Compiler", Compiler);
            /** Dummy compiler implementation that just yields the original document. */
            DummyCompiler = /** @class */ (function (_super) {
                __extends(DummyCompiler, _super);
                function DummyCompiler(compileDelayMs) {
                    var _this = _super.call(this) || this;
                    _this.compileDelayMs = compileDelayMs;
                    return _this;
                }
                DummyCompiler.prototype.compile = function (request) {
                    var _this = this;
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            return resolve({
                                requestId: request.requestId,
                                compiledBody: request.body,
                                elapsedTimeMs: _this.compileDelayMs
                            });
                        }, _this.compileDelayMs);
                    });
                };
                return DummyCompiler;
            }(Compiler));
            exports_1("DummyCompiler", DummyCompiler);
            /** Client interface to document compilers.
             *
             * An instance of CompilerClient manages the compilation of a single document
             * and implements simple debouncing. If multiple changes occur while an earlier
             * compilation process is executing, all pending requests except the last would
             * be dropped.
             */
            CompilerClient = /** @class */ (function () {
                function CompilerClient(
                /** The compiler to use. */
                compiler, 
                /** A callback to be invoked every time there is a new compilation result
                 * available. */
                compileResultCallback) {
                    this.compiler = compiler;
                    this.compileResultCallback = compileResultCallback;
                    /** Request sequence ID. */
                    this.seq = 0;
                    /** The currently executing request. */
                    this.activeRequest = null;
                    /** The next request to be executed. */
                    this.nextRequest = null;
                }
                /** Request a new compilation.
                 *
                 * This request will not be executed if a previous request is currently being
                 * executed and another request comes in before it finishes. */
                CompilerClient.prototype.addRequest = function (request) {
                    var seq = this.seq++;
                    if (this.activeRequest == null) {
                        this.activeRequest = __assign({}, request, { requestId: seq });
                        this.compile(this.activeRequest);
                    }
                    else {
                        if (this.nextRequest != null) {
                            this.log(this.nextRequest, 'Discarded');
                        }
                        this.nextRequest = __assign({}, request, { requestId: seq });
                        this.log(this.nextRequest, 'Queued');
                    }
                };
                CompilerClient.prototype.onCompileDone = function (request, result) {
                    var _this = this;
                    this.log(request, 'Completed');
                    setTimeout(function () { return _this.compileResultCallback(result, request); }, 0);
                    if (this.nextRequest != null) {
                        this.activeRequest = this.nextRequest;
                        this.nextRequest = null;
                        this.compile(this.activeRequest);
                    }
                };
                CompilerClient.prototype.compile = function (request) {
                    var _this = this;
                    this.log(request, 'Running');
                    this.compiler
                        .compile(request)
                        .then(function (result) { return _this.onCompileDone(request, result); });
                };
                CompilerClient.prototype.log = function (request, message) {
                    console.log("[DebouncingCompilerClient] [" + request.requestId + "] " + message);
                };
                return CompilerClient;
            }());
            exports_1("CompilerClient", CompilerClient);
        }
    };
});
System.register("asciidoc-compiler", ["compiler"], function (exports_2, context_2) {
    "use strict";
    var compiler_1, asciidoctor, BlockingAsciidocCompiler, AsyncAsciidocCompiler;
    var __moduleName = context_2 && context_2.id;
    function asciidocCompile(request) {
        var isInline = request.outputType == compiler_1.OutputType.PREVIEW;
        var shouldBeautify = request.outputType == compiler_1.OutputType.DISPLAY_HTML ||
            request.outputType == compiler_1.OutputType.EXPORT_HTML;
        var beautifyOptions = {
            indent_size: 2,
            wrap_line_length: 80
        };
        var shouldHighlight = request.outputType == compiler_1.OutputType.DISPLAY_HTML;
        if (asciidoctor == null) {
            asciidoctor = Asciidoctor();
        }
        var startTs = new Date();
        var compiledBody;
        if (isInline) {
            compiledBody = asciidoctor.convert(request.body, Opal.hash2(['attributes'], {
                attributes: ['showtitle']
            }));
        }
        else {
            var cssPath = '/assets/asciidoctor.js/css/asciidoctor.css';
            compiledBody = asciidoctor.convert(request.body, Opal.hash2(['header_footer', 'attributes'], {
                header_footer: true,
                attributes: ['nofooter', 'copycss', 'stylesheet=' + cssPath]
            }));
        }
        if (shouldBeautify) {
            compiledBody = html_beautify(compiledBody, beautifyOptions);
        }
        if (shouldHighlight) {
            compiledBody = hljs.highlight('html', compiledBody, true /* allow malformed input */).value;
        }
        return {
            requestId: request.requestId,
            compiledBody: compiledBody,
            elapsedTimeMs: new Date().getTime() - startTs.getTime()
        };
    }
    exports_2("asciidocCompile", asciidocCompile);
    return {
        setters: [
            function (compiler_1_1) {
                compiler_1 = compiler_1_1;
            }
        ],
        execute: function () {
            asciidoctor = null;
            ;
            BlockingAsciidocCompiler = /** @class */ (function (_super) {
                __extends(BlockingAsciidocCompiler, _super);
                function BlockingAsciidocCompiler() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                BlockingAsciidocCompiler.prototype.compile = function (request) {
                    return Promise.resolve(asciidocCompile(request));
                };
                return BlockingAsciidocCompiler;
            }(compiler_1.Compiler));
            exports_2("BlockingAsciidocCompiler", BlockingAsciidocCompiler);
            AsyncAsciidocCompiler = /** @class */ (function (_super) {
                __extends(AsyncAsciidocCompiler, _super);
                function AsyncAsciidocCompiler() {
                    var _this = _super.call(this) || this;
                    _this.worker = new Worker('/assets/worker/asciidoc-compiler-worker-loader.js');
                    _this.pendingRequests = new Map();
                    _this.worker.addEventListener('message', _this.onMessage.bind(_this));
                    return _this;
                }
                AsyncAsciidocCompiler.prototype.compile = function (request) {
                    var _this = this;
                    return new Promise(function (resolve) {
                        _this.pendingRequests.set(request.requestId, resolve);
                        _this.log("Issuing request with requestId " + request.requestId);
                        _this.worker.postMessage(request);
                    });
                };
                AsyncAsciidocCompiler.prototype.onMessage = function (ev) {
                    var result = ev.data;
                    if (!this.pendingRequests.has(result.requestId)) {
                        this.log("Discarding result for unexpected requestId " + result.requestId);
                        return;
                    }
                    this.log("Received result for requestId " + result.requestId);
                    this.pendingRequests.get(result.requestId)(result);
                    this.pendingRequests["delete"](result.requestId);
                };
                AsyncAsciidocCompiler.prototype.log = function (message) {
                    console.log("[AsyncAsciidocCompiler] " + message);
                };
                return AsyncAsciidocCompiler;
            }(compiler_1.Compiler));
            exports_2("AsyncAsciidocCompiler", AsyncAsciidocCompiler);
        }
    };
});
System.register("asciidoc-compiler-worker", ["asciidoc-compiler"], function (exports_3, context_3) {
    "use strict";
    var asciidoc_compiler_1, AsciidocCompilerWorker;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (asciidoc_compiler_1_1) {
                asciidoc_compiler_1 = asciidoc_compiler_1_1;
            }
        ],
        execute: function () {
            AsciidocCompilerWorker = /** @class */ (function () {
                function AsciidocCompilerWorker() {
                    this.log('Starting Asciidoc compile worker');
                    self.addEventListener('message', this.onMessage.bind(this));
                }
                AsciidocCompilerWorker.prototype.onMessage = function (ev) {
                    this.log('Received compile request');
                    var request = ev.data;
                    var result = asciidoc_compiler_1.asciidocCompile(request);
                    this.log('Completed compile request');
                    self.postMessage(result);
                };
                AsciidocCompilerWorker.prototype.log = function (message) {
                    self.console && self.console.info("[AsciidocCompilerWorker] " + message);
                };
                return AsciidocCompilerWorker;
            }());
            self['asciidocCompilerWorker'] = new AsciidocCompilerWorker();
        }
    };
});
