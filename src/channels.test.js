"use strict";
exports.__esModule = true;
var channels_js_1 = require("./channels.js");
var other_js_1 = require("./other.js");
var auth_js_1 = require("./auth.js");
beforeEach(function () {
    (0, other_js_1.clearV1)();
});
describe("Testing for channelsListallV1", function () {
    test("No channels", function () {
        var id = (0, auth_js_1.authRegisterV1)("hayden@gmail.com", "hayden123", "Hayden", "Smith");
        expect((0, channels_js_1.channelsListallV1)(id.authUserId)).toEqual({
            channels: []
        });
    });
    test("Single channel", function () {
        var id = (0, auth_js_1.authRegisterV1)("hayden@gmail.com", "hayden123", "Hayden", "Smith");
        var channelId = (0, channels_js_1.channelsCreateV1)(id.authUserId, "Hayden", true);
        expect((0, channels_js_1.channelsListallV1)(id.authUserId)).toEqual({
            channels: [
                {
                    channelId: channelId.channelId,
                    name: "Hayden"
                },
            ]
        });
    });
    test("More than one channel", function () {
        var id = (0, auth_js_1.authRegisterV1)("hayden@gmail.com", "hayden123", "Hayden", "Smith");
        var channel1 = (0, channels_js_1.channelsCreateV1)(id.authUserId, "Hayden", true);
        var channel2 = (0, channels_js_1.channelsCreateV1)(id.authUserId, "Hayden2", true);
        expect((0, channels_js_1.channelsListallV1)(id.authUserId)).toEqual({
            channels: [
                {
                    channelId: channel1.channelId,
                    name: "Hayden"
                },
                {
                    channelId: channel2.channelId,
                    name: "Hayden2"
                },
            ]
        });
    });
});
describe("Testing channelsCreateV1", function () {
    test("Correct Name, is public", function () {
        var authUserId = (0, auth_js_1.authRegisterV1)("email@gmail.com", "password", "firstname", "lastname");
        expect((0, channels_js_1.channelsCreateV1)(authUserId.authUserId, "correct name", true)).toStrictEqual(expect.objectContaining({
            channelId: expect.any(Number)
        }));
    });
    test("Correct Name, is private", function () {
        var authUserId = (0, auth_js_1.authRegisterV1)("email@gmail.com", "password", "firstname", "lastname");
        expect((0, channels_js_1.channelsCreateV1)(authUserId.authUserId, "correct name", false)).toStrictEqual(expect.objectContaining({
            channelId: expect.any(Number)
        }));
    });
    test("Incorrect Name (too small)", function () {
        var authUserId = (0, auth_js_1.authRegisterV1)("email@gmail.com", "password", "firstname", "lastname");
        expect((0, channels_js_1.channelsCreateV1)(authUserId.authUserId, "", true)).toStrictEqual({
            error: "error"
        });
    });
    test("Incorrect Name (too large)", function () {
        var authUserId = (0, auth_js_1.authRegisterV1)("email@gmail.com", "password", "firstname", "lastname");
        expect((0, channels_js_1.channelsCreateV1)(authUserId.authUserId, "very long channel name", true)).toStrictEqual({ error: "error" });
    });
});
describe("Testing channelsListV1", function () {
    test('Correct return all channels', function () {
        var authUserId = (0, auth_js_1.authRegisterV1)('email@gmail.com', 'password', 'firstname', 'lastname');
        var channel1 = (0, channels_js_1.channelsCreateV1)(authUserId.authUserId, 'name1', true);
        var channel2 = (0, channels_js_1.channelsCreateV1)(authUserId.authUserId, 'name2', true);
        expect((0, channels_js_1.channelsListV1)(authUserId.authUserId)).toStrictEqual({
            channels: [
                {
                    channelId: channel1.channelId,
                    name: 'name1'
                },
                {
                    channelId: channel2.channelId,
                    name: 'name2'
                },
            ]
        });
    });
    test('Correct return no channels', function () {
        var authUserId = (0, auth_js_1.authRegisterV1)('email@gmail.com', 'password', 'firstname', 'lastname');
        expect((0, channels_js_1.channelsListV1)(authUserId.authUserId)).toStrictEqual({ channels: [] });
    });
    test('Correct return some channels', function () {
        var authUserId1 = (0, auth_js_1.authRegisterV1)('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
        var authUserId2 = (0, auth_js_1.authRegisterV1)('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        var channel1 = (0, channels_js_1.channelsCreateV1)(authUserId1.authUserId, 'name1', true);
        var channel2 = (0, channels_js_1.channelsCreateV1)(authUserId2.authUserId, 'name2', true);
        expect((0, channels_js_1.channelsListV1)(authUserId1.authUserId)).toStrictEqual({
            channels: [
                {
                    channelId: channel1.channelId,
                    name: 'name1'
                }
            ]
        });
    });
});
