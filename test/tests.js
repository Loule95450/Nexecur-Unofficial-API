"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NexecurAPI_1 = require("../Controllers/NexecurAPI");
var assert = require('assert');
describe('NexecurAPI', function () {
    describe('getAlarmStatus', function () {
        it('should get a response', function (done) {
            NexecurAPI_1.NexecurAPI.getAlarmStatus().then(function () {
                done();
            }).catch(function () {
                done("error");
            });
        });
    });
    describe('getHistoric', function () {
        it('should get a response', function (done) {
            NexecurAPI_1.NexecurAPI.getHistoric().then(function (res) {
                done();
            }).catch(function () {
                done("error");
            });
        });
    });
});
//# sourceMappingURL=tests.js.map