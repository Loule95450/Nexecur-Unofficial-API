/**
 * Mock responses for Hikvision/GuardingVision API tests
 * Based on the HACS-Nexecur implementation
 */

export const mockLoginResponse = {
    meta: {
        code: "200",
        message: "Login successful"
    },
    loginSession: {
        sessionId: "test-session-id-12345"
    },
    loginUser: {
        username: "330612345678",
        customno: "custom123",
        areaId: 1
    },
    loginArea: {
        apiDomain: "apiieu.guardingvision.com"
    }
};

export const mockDevicesResponse = {
    deviceInfos: [
        {
            deviceSerial: "DSI12345678",
            name: "AX PRO",
            deviceId: 123456,
            picture: "",
            online: 1,
            deviceType: "camera",
            channelNum: 0,
            picUrl: "https://example.com/pic.jpg"
        }
    ]
};

export const mockSecurityInfoResponse = `HTTP/1.1 200 OK
Content-Type: application/json

{"nonce":"test-nonce-12345","realm":"DVRNVRDVS","List":[{"CloudUserManage":{"salt":"test-salt","salt2":"test-salt2","userNameSessionAuthInfo":"test-auth-hash"}}]}`;

export const mockAlarmStatusResponse = `HTTP/1.1 200 OK
Content-Type: application/json

{
    "AlarmHostStatus": {
        "communiStatus": "online",
        "SubSysList": [
            {
                "SubSys": {
                    "id": 1,
                    "arming": "away"
                }
            }
        ]
    }
}`;

export const mockAlarmStatusDisarmed = `HTTP/1.1 200 OK
Content-Type: application/json

{
    "AlarmHostStatus": {
        "communiStatus": "online",
        "SubSysList": [
            {
                "SubSys": {
                    "id": 1,
                    "arming": "disarm"
                }
            }
        ]
    }
}`;

export const mockAlarmStatusStay = `HTTP/1.1 200 OK
Content-Type: application/json

{
    "AlarmHostStatus": {
        "communiStatus": "online",
        "SubSysList": [
            {
                "SubSys": {
                    "id": 1,
                    "acking": "stay"
                }
            }
        ]
    }
}`;

export const mockArmSuccessResponse = `HTTP/1.1 200 OK
Content-Type: application/json

{"errorCode": 0, "message": "success"}`;

export const mockDisarmSuccessResponse = `HTTP/1.1 200 OK
Content-Type: application/json

{"errorCode": 0, "message": "success"}`;

export const mockErrorResponses = {
    invalidCredentials: {
        meta: {
            code: "401",
            message: "Invalid credentials"
        }
    },
    sessionExpired: {
        meta: {
            code: "403",
            message: "Session expired"
        }
    },
    deviceNotFound: {
        meta: {
            code: "404",
            message: "Device not found"
        }
    },
    serverError: {
        meta: {
            code: "500",
            message: "Internal server error"
        }
    }
};
