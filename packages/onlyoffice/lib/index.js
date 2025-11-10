'use strict';

var vue = require('vue');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/*
* (c) Copyright Ascensio System SIA 2024
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var loadScript = function (url, id) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                try {
                    // If DocsAPI is defined return resolve.
                    //@ts-ignore
                    if (window.DocsAPI)
                        return resolve(null);
                    var existedScript_1 = document.getElementById(id);
                    if (existedScript_1) {
                        // If the script element is found, wait for it to load.
                        var intervalHandler_1 = setInterval(function () {
                            var loading = existedScript_1.getAttribute("loading");
                            if (loading) {
                                // If the download is not completed, continue to wait.
                                return;
                            }
                            else {
                                // If the download is completed, stop the wait.
                                clearInterval(intervalHandler_1);
                                // If DocsAPI is defined, after loading return resolve.
                                //@ts-ignore
                                if (window.DocsAPI)
                                    return resolve(null);
                                // If DocsAPI is not defined, delete the existing script and create a new one.
                                var script = _createScriptTag(id, url, resolve, reject);
                                existedScript_1.remove();
                                document.body.appendChild(script);
                            }
                        }, 500);
                    }
                    else {
                        // If the script element is not found, create it.
                        var script = _createScriptTag(id, url, resolve, reject);
                        document.body.appendChild(script);
                    }
                }
                catch (e) {
                    console.error(e);
                }
            })];
    });
}); };
var _createScriptTag = function (id, url, resolve, reject) {
    var script = document.createElement("script");
    script.id = id;
    script.type = "text/javascript";
    script.src = url;
    script.async = true;
    script.onload = function () {
        // Remove attribute loading after loading is complete.
        script.removeAttribute("loading");
        resolve(null);
    };
    script.onerror = function (error) {
        // Remove attribute loading after loading is complete.
        script.removeAttribute("loading");
        reject(error);
    };
    script.setAttribute("loading", "");
    return script;
};

var script = vue.defineComponent({
    name: 'DocumentEditor',
    props: {
        id: {
            type: String,
            required: true
        },
        documentServerUrl: {
            type: String,
            required: true
        },
        config: {
            type: Object,
            required: true
        },
        document_fileType: String,
        document_title: String,
        documentType: String,
        editorConfig_lang: String,
        height: String,
        type: String,
        width: String,
        onLoadComponentError: Function,
        events_onAppReady: Function,
        events_onDocumentStateChange: Function,
        events_onMetaChange: Function,
        events_onDocumentReady: Function,
        events_onInfo: Function,
        events_onWarning: Function,
        events_onError: Function,
        events_onRequestSharingSettings: Function,
        events_onRequestRename: Function,
        events_onMakeActionLink: Function,
        events_onRequestInsertImage: Function,
        events_onRequestSaveAs: Function,
        /**
         * @deprecated Deprecated since version 7.5, please use events_onRequestSelectSpreadsheet instead.
         */
        events_onRequestMailMergeRecipients: Function,
        /**
         * @deprecated Deprecated since version 7.5, please use events_onRequestSelectDocument instead.
         */
        events_onRequestCompareFile: Function,
        events_onRequestEditRights: Function,
        events_onRequestHistory: Function,
        events_onRequestHistoryClose: Function,
        events_onRequestHistoryData: Function,
        events_onRequestRestore: Function,
        events_onRequestSelectSpreadsheet: Function,
        events_onRequestSelectDocument: Function,
    },
    mounted: function () {
        var _this = this;
        var url = this.documentServerUrl;
        if (!url.endsWith("/"))
            url += "/";
        var docApiUrl = "".concat(url, "web-apps/apps/api/documents/api.js");
        loadScript(docApiUrl, "onlyoffice-api-script")
            .then(function () { return _this.onLoad(); })
            .catch(function () { _this.onError(-2); });
    },
    unmounted: function () {
        var _a;
        var id = this.id || "";
        if ((_a = window === null || window === void 0 ? void 0 : window.DocEditor) === null || _a === void 0 ? void 0 : _a.instances[id]) {
            window.DocEditor.instances[id].destroyEditor();
            window.DocEditor.instances[id] = undefined;
        }
    },
    watch: {
        config: {
            handler: function (newVal, oldVal) {
                this.onChangeProps();
            },
            deep: true
        },
        document_fileType: function (newVal, oldVal) { this.onChangeProps(); },
        document_title: function (newVal, oldVal) { this.onChangeProps(); },
        documentType: function (newVal, oldVal) { this.onChangeProps(); },
        editorConfig_lang: function (newVal, oldVal) { this.onChangeProps(); },
        height: function (newVal, oldVal) { this.onChangeProps(); },
        type: function (newVal, oldVal) { this.onChangeProps(); },
        width: function (newVal, oldVal) { this.onChangeProps(); }
    },
    methods: {
        onLoad: function () {
            var _a, _b;
            try {
                var id = this.id || "";
                if (!window.DocsAPI)
                    this.onError(-3);
                if ((_a = window === null || window === void 0 ? void 0 : window.DocEditor) === null || _a === void 0 ? void 0 : _a.instances[id]) {
                    console.log("Skip loading. Instance already exists", id);
                    return;
                }
                if (!((_b = window === null || window === void 0 ? void 0 : window.DocEditor) === null || _b === void 0 ? void 0 : _b.instances)) {
                    window.DocEditor = { instances: {} };
                }
                var initConfig = Object.assign({
                    document: {
                        fileType: this.document_fileType,
                        title: this.document_title,
                    },
                    documentType: this.documentType,
                    editorConfig: {
                        lang: this.editorConfig_lang,
                    },
                    events: {
                        onAppReady: this.onAppReady,
                        onDocumentStateChange: this.events_onDocumentStateChange,
                        onMetaChange: this.events_onMetaChange,
                        onDocumentReady: this.events_onDocumentReady,
                        onInfo: this.events_onInfo,
                        onWarning: this.events_onWarning,
                        onError: this.events_onError,
                        onRequestSharingSettings: this.events_onRequestSharingSettings,
                        onRequestRename: this.events_onRequestRename,
                        onMakeActionLink: this.events_onMakeActionLink,
                        onRequestInsertImage: this.events_onRequestInsertImage,
                        onRequestSaveAs: this.events_onRequestSaveAs,
                        onRequestMailMergeRecipients: this.events_onRequestMailMergeRecipients,
                        onRequestCompareFile: this.events_onRequestCompareFile,
                        onRequestEditRights: this.events_onRequestEditRights,
                        onRequestHistory: this.events_onRequestHistory,
                        onRequestHistoryClose: this.events_onRequestHistoryClose,
                        onRequestHistoryData: this.events_onRequestHistoryData,
                        onRequestRestore: this.events_onRequestRestore,
                        onRequestSelectSpreadsheet: this.events_onRequestSelectSpreadsheet,
                        onRequestSelectDocument: this.events_onRequestSelectDocument
                    },
                    height: this.height,
                    type: this.type,
                    width: this.width,
                }, this.config || {});
                var editor = window.DocsAPI.DocEditor(id, initConfig);
                window.DocEditor.instances[id] = editor;
            }
            catch (err) {
                console.error(err);
                this.onError(-1);
            }
        },
        onError: function (errorCode) {
            var message;
            switch (errorCode) {
                case -2:
                    message = "Error load DocsAPI from " + this.documentServerUrl;
                    break;
                case -3:
                    message = "DocsAPI is not defined";
                    break;
                default:
                    message = "Unknown error loading component";
                    errorCode = -1;
            }
            if (typeof this.onLoadComponentError == "undefined") {
                console.error(message);
            }
            else {
                this.onLoadComponentError(errorCode, message);
            }
        },
        onAppReady: function () {
            var id = this.id || "";
            this.events_onAppReady(window.DocEditor.instances[id]);
        },
        onChangeProps: function () {
            var _a;
            var id = this.id || "";
            if ((_a = window === null || window === void 0 ? void 0 : window.DocEditor) === null || _a === void 0 ? void 0 : _a.instances[id]) {
                window.DocEditor.instances[id].destroyEditor();
                window.DocEditor.instances[id] = undefined;
                console.log("Important props have been changed. Load new Editor.");
                this.onLoad();
            }
        }
    }
});

const _hoisted_1 = ["id"];

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", { id: _ctx.id }, null, 8 /* PROPS */, _hoisted_1))
}

script.render = render;
script.__file = "src/components/DocumentEditor.vue";

exports.DocumentEditor = script;
//# sourceMappingURL=index.js.map
