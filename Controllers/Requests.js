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
        while (_) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Requests = void 0;
var NexecurConfiguration_1 = require("../Models/NexecurConfiguration");
var Utils_1 = require("../Helpers/Utils");
var StillPendingError_1 = require("../Models/Errors/StillPendingError");
var request = require('request');
var userConfig = require('../config.json');
var Requests = /** @class */ (function () {
    function Requests() {
    }
    Requests.getConfiguration = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var requestOptions;
            return __generator(this, function (_a) {
                requestOptions = {
                    url: NexecurConfiguration_1.NexecurConfiguration.baseURL + NexecurConfiguration_1.NexecurConfiguration.configURI,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Auth-Token': ''
                    },
                    json: {
                        os: 'android'
                    }
                };
                request.post(requestOptions, function (err, httpResponse, body) {
                    if (err)
                        throw new Error(err);
                    callback(body);
                });
                return [2 /*return*/];
            });
        });
    };
    Requests.getSalt = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var requestOptions;
            return __generator(this, function (_a) {
                requestOptions = {
                    url: NexecurConfiguration_1.NexecurConfiguration.baseURL + NexecurConfiguration_1.NexecurConfiguration.saltURI,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Auth-Token': ''
                    },
                    json: {
                        id_site: userConfig.id_site,
                        password: userConfig.password,
                        id_device: userConfig.id_device,
                        'partage': '1',
                        pin: userConfig.pin
                    }
                };
                request.post(requestOptions, function (err, httpResponse, body) {
                    if (err)
                        throw new Error(err);
                    callback(body);
                });
                return [2 /*return*/];
            });
        });
    };
    Requests.register = function (deviceName, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var requestOptions;
            return __generator(this, function (_a) {
                requestOptions = {
                    url: NexecurConfiguration_1.NexecurConfiguration.baseURL + NexecurConfiguration_1.NexecurConfiguration.registerURI,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Auth-Token': userConfig.token
                    },
                    json: {
                        "alert": "enabled",
                        "appname": "Mon+Nexecur",
                        "nom": "",
                        "badge": "enabled",
                        "options": [1],
                        "sound": "enabled",
                        "id_device": userConfig.id_device,
                        "actif": 1,
                        "plateforme": "gcm",
                        "app_version": "1.15 (30)",
                        "device_model": "SM-G315F",
                        "device_name": deviceName,
                        "device_version": "7.0"
                    }
                };
                request.post(requestOptions, function (err, httpResponse, body) {
                    if (err)
                        throw new Error(err);
                    callback(body);
                });
                return [2 /*return*/];
            });
        });
    };
    Requests.site = function (userConfig, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var requestOptions;
            return __generator(this, function (_a) {
                requestOptions = {
                    url: NexecurConfiguration_1.NexecurConfiguration.baseURL + NexecurConfiguration_1.NexecurConfiguration.siteURI,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Auth-Token': userConfig.token
                    },
                    json: {
                        id_site: userConfig.id_site,
                        password: userConfig.password,
                        id_device: userConfig.id_device,
                        'partage': '1',
                        pin: userConfig.pin
                    }
                };
                request.post(requestOptions, function (err, httpResponse, body) {
                    if (err)
                        throw new Error(err);
                    // we update the token
                    NexecurConfiguration_1.NexecurConfiguration.updateToken(body["token"], userConfig);
                    callback(body);
                });
                return [2 /*return*/];
            });
        });
    };
    Requests.panelStatus = function (callback, alarmOrder) {
        if (alarmOrder === void 0) { alarmOrder = -1; }
        return __awaiter(this, void 0, void 0, function () {
            var requestOptions;
            return __generator(this, function (_a) {
                requestOptions = {
                    url: NexecurConfiguration_1.NexecurConfiguration.baseURL + NexecurConfiguration_1.NexecurConfiguration.panelStatusURI,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Auth-Token': userConfig.token
                    },
                    json: {}
                };
                // we ask alarming or disarming the alarm
                if (alarmOrder !== -1) {
                    console.log("Arming or Disarming Alarm");
                    requestOptions.json = {
                        "status": alarmOrder
                    };
                }
                request.post(requestOptions, function (err, httpResponse, body) {
                    if (err)
                        throw new Error(err);
                    callback(body);
                });
                return [2 /*return*/];
            });
        });
    };
    Requests.panelCheckStatus = function (resolve, reject, counter) {
        if (counter === void 0) { counter = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var requestOptions;
            return __generator(this, function (_a) {
                // if the alarm is still not enabled or disabled after 60 seconds, we trigger an error
                if (counter >= NexecurConfiguration_1.NexecurConfiguration.NUMBER_SECONDS_MAX_WAIT_ACTIVATION_ALARM) {
                    throw new StillPendingError_1.StillPendingError("The order (enabling or disabling the alarm) don't seem to be applied correctly.");
                }
                requestOptions = {
                    url: NexecurConfiguration_1.NexecurConfiguration.baseURL + NexecurConfiguration_1.NexecurConfiguration.panelCheckStatusURI,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Auth-Token': userConfig.token
                    }
                };
                request.post(requestOptions, function (err, httpResponse, body) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (err)
                                        throw new Error(err);
                                    if (!(body["still_pending"] == 0)) return [3 /*break*/, 1];
                                    resolve(body);
                                    return [3 /*break*/, 3];
                                case 1: 
                                // if the status is still not 0, we make the request again
                                // we wait 1 second
                                return [4 /*yield*/, Utils_1.Utils.sleep(2000)];
                                case 2:
                                    // if the status is still not 0, we make the request again
                                    // we wait 1 second
                                    _a.sent();
                                    Requests.panelCheckStatus(resolve, reject, counter + 1);
                                    _a.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                });
                return [2 /*return*/];
            });
        });
    };
    return Requests;
}());
exports.Requests = Requests;
//# sourceMappingURL=Requests.js.map