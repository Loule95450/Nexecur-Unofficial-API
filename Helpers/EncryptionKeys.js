"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionKeys = void 0;
var crypto = require("crypto");
var EncryptionKeys = /** @class */ (function () {
    /**
     * Constructor
     * @param {string} password
     * @param {string} salt
     */
    function EncryptionKeys(password, salt) {
        this._password = password;
        this._salt = salt;
    }
    /**
     * Generate the passwordHash and the pinHash
     */
    EncryptionKeys.prototype.generateKeys = function () {
        var byte0;
        var abyte0;
        var j;
        var s_new = Buffer.from(this._password, "utf16le");
        abyte0 = new Buffer(this._salt, 'base64');
        var s2_new = new Buffer(s_new.length + abyte0.length);
        j = 0;
        var stop = false;
        while ((!stop)) {
            if (j >= s2_new.length) {
                this._pinHash = EncryptionKeys.sha1(s2_new);
                this._passwordHash = EncryptionKeys.sha256(s2_new);
                stop = true;
            }
            else {
                if (j >= abyte0.length) {
                    byte0 = s_new[j - abyte0.length];
                    s2_new[j] = byte0;
                    j++;
                }
                else {
                    byte0 = abyte0[j];
                    s2_new[j] = byte0;
                    j++;
                }
            }
        }
        ;
    };
    EncryptionKeys.sha1 = function (data) {
        return crypto.createHash("sha1").update(data).digest("base64");
    };
    EncryptionKeys.sha256 = function (data) {
        return crypto.createHash("sha256").update(data).digest("base64");
    };
    Object.defineProperty(EncryptionKeys.prototype, "password", {
        get: function () {
            return this._password;
        },
        set: function (value) {
            this._password = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EncryptionKeys.prototype, "salt", {
        get: function () {
            return this._salt;
        },
        set: function (value) {
            this._salt = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EncryptionKeys.prototype, "passwordHash", {
        get: function () {
            return this._passwordHash;
        },
        set: function (value) {
            this._passwordHash = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EncryptionKeys.prototype, "pinHash", {
        get: function () {
            return this._pinHash;
        },
        set: function (value) {
            this._pinHash = value;
        },
        enumerable: false,
        configurable: true
    });
    return EncryptionKeys;
}());
exports.EncryptionKeys = EncryptionKeys;
//# sourceMappingURL=EncryptionKeys.js.map