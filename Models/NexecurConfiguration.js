"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NexecurConfiguration = void 0;
var fs = require('fs');
var NexecurConfiguration = /** @class */ (function () {
    function NexecurConfiguration() {
    }
    /**
     * Update the token in the config.json file
     * @param {string} token
     * @param userConfig
     */
    NexecurConfiguration.updateToken = function (token, userConfig) {
        var file_content = fs.readFileSync(NexecurConfiguration.fileName);
        var content = JSON.parse(file_content);
        content.token = token;
        userConfig.token = token;
        fs.writeFileSync(NexecurConfiguration.fileName, JSON.stringify(content));
    };
    /**
     * Update the pin in the config.json file
     * @param {string} pin
     * @param userConfig
     */
    NexecurConfiguration.updatePinHash = function (pin, userConfig) {
        var file_content = fs.readFileSync(NexecurConfiguration.fileName);
        var content = JSON.parse(file_content);
        content.pin = pin;
        userConfig.pin = pin;
        fs.writeFileSync(NexecurConfiguration.fileName, JSON.stringify(content));
    };
    /**
     * Update the password in the config.json
     * @param {string} password
     * @param userConfig
     */
    NexecurConfiguration.updatePassword = function (password, userConfig) {
        var file_content = fs.readFileSync(NexecurConfiguration.fileName);
        var content = JSON.parse(file_content);
        content.password = password;
        userConfig.password = password;
        fs.writeFileSync(NexecurConfiguration.fileName, JSON.stringify(content));
    };
    /**
     * Update the id_device in config.json file
     * @param {string} idDevice
     * @param userConfig
     */
    NexecurConfiguration.updateIdDevice = function (idDevice, userConfig) {
        var file_content = fs.readFileSync(NexecurConfiguration.fileName);
        var content = JSON.parse(file_content);
        content.id_device = idDevice;
        userConfig.id_device = idDevice;
        fs.writeFileSync(NexecurConfiguration.fileName, JSON.stringify(content));
    };
    NexecurConfiguration.baseURL = "https://monnexecur-prd.nexecur.fr";
    NexecurConfiguration.configURI = "/webservices/configuration";
    NexecurConfiguration.saltURI = "/webservices/salt";
    NexecurConfiguration.siteURI = "/webservices/site";
    NexecurConfiguration.registerURI = "/webservices/register";
    NexecurConfiguration.panelStatusURI = "/webservices/panel-status";
    NexecurConfiguration.panelCheckStatusURI = "/webservices/check-panel-status";
    NexecurConfiguration.fileName = __dirname + "/../config.json";
    /**
     * When we send the order to activate the alarm, the order can take times before being applied.
     * The following variable define how many seconds we are ready to wait for before triggering an error.
     * @type {number}
     */
    NexecurConfiguration.NUMBER_SECONDS_MAX_WAIT_ACTIVATION_ALARM = 60;
    return NexecurConfiguration;
}());
exports.NexecurConfiguration = NexecurConfiguration;
//# sourceMappingURL=NexecurConfiguration.js.map