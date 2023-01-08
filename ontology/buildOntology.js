"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
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
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
exports.__esModule = true;
var fs_1 = require("fs");
var stream = require("stream");
var n3_1 = require("n3");
var jsonld = require("jsonld");
// const rdf = readFileSync("./ontology/cocktail.rdf").toString("utf-8");
// jsonld
//   .fromRDF(rdf as any, { format: "application/n-quads" })
//   .then((json) => console.log(json));
var out = (0, fs_1.createWriteStream)("./ontology/ontology.rdf");
var parser = new n3_1.StreamParser();
var writer = new n3_1.StreamWriter({
    format: "N-Triples"
});
parser.pipe(writer);
// writer.pipe(out);
var cocktails = (0, fs_1.createReadStream)("./ontology/cocktail.ttl");
var bevon = (0, fs_1.createReadStream)("./ref/bevon.ttl");
var readIter = concatStreams([cocktails, bevon]);
var combined = stream.Readable.from(readIter);
combined.pipe(parser);
streamToString(writer).then(function (rdf) {
    jsonld
        .fromRDF(rdf)
        .then(function (json) {
        return (0, fs_1.writeFileSync)("./ontology/ontology.json", JSON.stringify(json));
    });
});
function concatStreams(readables) {
    return __asyncGenerator(this, arguments, function concatStreams_1() {
        var _i, readables_1, readable, _a, readable_1, readable_1_1, chunk, e_1_1;
        var _b, e_1, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _i = 0, readables_1 = readables;
                    _e.label = 1;
                case 1:
                    if (!(_i < readables_1.length)) return [3 /*break*/, 18];
                    readable = readables_1[_i];
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 11, 12, 17]);
                    _a = true, readable_1 = (e_1 = void 0, __asyncValues(readable));
                    _e.label = 3;
                case 3: return [4 /*yield*/, __await(readable_1.next())];
                case 4:
                    if (!(readable_1_1 = _e.sent(), _b = readable_1_1.done, !_b)) return [3 /*break*/, 10];
                    _d = readable_1_1.value;
                    _a = false;
                    _e.label = 5;
                case 5:
                    _e.trys.push([5, , 8, 9]);
                    chunk = _d;
                    return [4 /*yield*/, __await(chunk)];
                case 6: return [4 /*yield*/, _e.sent()];
                case 7:
                    _e.sent();
                    return [3 /*break*/, 9];
                case 8:
                    _a = true;
                    return [7 /*endfinally*/];
                case 9: return [3 /*break*/, 3];
                case 10: return [3 /*break*/, 17];
                case 11:
                    e_1_1 = _e.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 17];
                case 12:
                    _e.trys.push([12, , 15, 16]);
                    if (!(!_a && !_b && (_c = readable_1["return"]))) return [3 /*break*/, 14];
                    return [4 /*yield*/, __await(_c.call(readable_1))];
                case 13:
                    _e.sent();
                    _e.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 16: return [7 /*endfinally*/];
                case 17:
                    _i++;
                    return [3 /*break*/, 1];
                case 18: return [2 /*return*/];
            }
        });
    });
}
function streamToString(stream) {
    var _a, stream_1, stream_1_1;
    var _b, e_2, _c, _d;
    return __awaiter(this, void 0, void 0, function () {
        var chunks, chunk, e_2_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    chunks = [];
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 6, 7, 12]);
                    _a = true, stream_1 = __asyncValues(stream);
                    _e.label = 2;
                case 2: return [4 /*yield*/, stream_1.next()];
                case 3:
                    if (!(stream_1_1 = _e.sent(), _b = stream_1_1.done, !_b)) return [3 /*break*/, 5];
                    _d = stream_1_1.value;
                    _a = false;
                    try {
                        chunk = _d;
                        chunks.push(Buffer.from(chunk));
                    }
                    finally {
                        _a = true;
                    }
                    _e.label = 4;
                case 4: return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_2_1 = _e.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _e.trys.push([7, , 10, 11]);
                    if (!(!_a && !_b && (_c = stream_1["return"]))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _c.call(stream_1)];
                case 8:
                    _e.sent();
                    _e.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12: return [2 /*return*/, Buffer.concat(chunks).toString("utf-8")];
            }
        });
    });
}
