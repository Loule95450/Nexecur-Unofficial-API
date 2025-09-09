"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NexecurAPI = void 0;
var Requests_1 = require("./Requests");
var NexecurConfiguration_1 = require("../Models/NexecurConfiguration");
var SaltGenerationError_1 = require("../Models/Errors/SaltGenerationError");
var TokenGenerationError_1 = require("../Models/Errors/TokenGenerationError");
var RegisteringDeviceError_1 = require("../Models/Errors/RegisteringDeviceError");
var OrderAlarmError_1 = require("../Models/Errors/OrderAlarmError");
var UndefinedAPIError_1 = require("../Models/Errors/UndefinedAPIError");
var EncryptionKeys_1 = require("../Helpers/EncryptionKeys");
var userConfig = require('./../config.json');
var NexecurAPI = /** @class */ (function () {
    function NexecurAPI() {
    }
    /**
     * Check if we need creating a new device to control the alarm
     * @param {(response: string) => void} callback
     */
    NexecurAPI.checkIfNeedCreateDevice = function (callback) {
        //check if token is null
        if (userConfig.token == "") {
            // we must register a new device
            this.createDevice(userConfig.deviceName, callback);
        }
        else {
            callback("already registered");
        }
    };
    /**
     * Register a new device to control the alarm
     * @param {string} name
     * @param {(response: string) => void} callback
     */
    NexecurAPI.createDevice = function (name, callback) {
        // we get the salt
        Requests_1.Requests.getSalt(function (response) {
            if (response["message"] != "OK" || response["status"] != 0) {
                throw new SaltGenerationError_1.SaltGenerationError("Error while generating a new device. The script can't get a new salt.");
            }
            // we generate passwordHash and pinHash
            var keys = new EncryptionKeys_1.EncryptionKeys(userConfig.password, response["salt"]);
            keys.generateKeys();
            // we save the generated keys
            NexecurConfiguration_1.NexecurConfiguration.updatePassword(keys.passwordHash, userConfig);
            NexecurConfiguration_1.NexecurConfiguration.updatePinHash(keys.pinHash, userConfig);
            // we get a token
            Requests_1.Requests.site(userConfig, function (response) {
                // we check if an error occurred
                if (response["message"] != "OK" || response["status"] != 0) {
                    throw new TokenGenerationError_1.TokenGenerationError("Error while getting a token for a new device.");
                }
                // we register associated to the token a device
                Requests_1.Requests.register(name, function (response) {
                    if (response["message"] != "" || response["status"] != 0) {
                        throw new RegisteringDeviceError_1.RegisteringDeviceError("Error while registering a new device. The script can't update the id_device value. This error is normally not fatal.");
                    }
                    NexecurConfiguration_1.NexecurConfiguration.updateIdDevice(response["id_device"], userConfig);
                    callback("success");
                });
            });
        });
    };
    /**
     * Enable the alarm system
     * @return Promise{}
     */
    NexecurAPI.enableAlarm = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkIfNeedCreateDevice(function (response) {
                Requests_1.Requests.panelStatus((function (response) {
                    // we check if an error occurred
                    if (response["message"] != "OK" || response["status"] != 0) {
                        reject(new OrderAlarmError_1.OrderAlarmError("Error while activating alarm..."));
                    }
                    // if there is any error, we check if the activation was instantaneous
                    if (response["pending"] == 0) {
                        // the alarm is now activated
                        resolve();
                    }
                    else {
                        // the alarm is still not activated
                        new Promise(function (r, j) {
                            Requests_1.Requests.panelCheckStatus(r, j);
                        }).then(function (result) {
                            resolve();
                        });
                    }
                }), 1);
            });
        });
    };
    /**
     * Disable the alarm system
     * @return Promise{}
     */
    NexecurAPI.disableAlarm = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkIfNeedCreateDevice(function (response) {
                Requests_1.Requests.panelStatus((function (response) {
                    // we check if an error occurred
                    if (response["message"] != "OK" || response["status"] != 0) {
                        reject(new OrderAlarmError_1.OrderAlarmError("Error while disabling alarm..."));
                    }
                    // if there is any error, we check if the activation was instantaneous
                    if (response["pending"] == 0) {
                        // the alarm is now activated
                        resolve();
                    }
                    else {
                        // the alarm is still not activated
                        new Promise(function (r, j) {
                            Requests_1.Requests.panelCheckStatus(r, j);
                        }).then(function (result) {
                            resolve();
                        });
                    }
                }), 0);
            });
        });
    };
    /**
     * Return the current status of the Alarm
     * @return Promise<AlarmStatus>
     */
    NexecurAPI.getAlarmStatus = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkIfNeedCreateDevice(function (response) {
                // we get the status of the alarm
                Requests_1.Requests.site(userConfig, function (response) {
                    if (response["message"] != "OK" || response["status"] != 0) {
                        reject(new UndefinedAPIError_1.UndefinedAPIError("Error while getting alarm status."));
                    }
                    var result = response["panel_status"];
                    resolve(result);
                });
            });
        });
    };
    /**
     * Return the historic of the alarm usages
     * @return Promise<any>
     */
    NexecurAPI.getHistoric = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkIfNeedCreateDevice(function (response) {
                // we get the status of the alarm
                Requests_1.Requests.site(userConfig, function (response) {
                    if (response["message"] != "OK" || response["status"] != 0) {
                        reject(new UndefinedAPIError_1.UndefinedAPIError("Error while getting alarm status."));
                    }
                    resolve(response["evenements"]);
                });
            });
        });
    };
    return NexecurAPI;
}());
exports.NexecurAPI = NexecurAPI;
//# sourceMappingURL=NexecurAPI.js.map