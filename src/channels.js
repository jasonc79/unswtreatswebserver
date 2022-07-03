"use strict";
exports.__esModule = true;
exports.channelsListallV1 = exports.channelsListV1 = exports.channelsCreateV1 = void 0;
var dataStore_js_1 = require("./dataStore.js");
var helper_js_1 = require("./helper.js");
var users_js_1 = require("./users.js");
/*
channelsCreateV1 creates a new channel which is added to the dataStore
The channel is named the given name and created if the name is greater than 0 and less than 21 characters long

Arguments:
    authUserId (number)     - holds the id of the user creating the channel
    name (string)           - contains the string which is set to be the channel name
    idPublic (boolean)      - value determining if the channel will be private or public

Return Value:
    Returns { channelId : channelId } on no errors, where channelId is a number
    Returns { error: 'error' } on an invalid authUserId and if the name is less than 1
        or greater than 20 characters long
*/
function channelsCreateV1(authUserId, name, isPublic) {
    if (name.length < 1 || name.length > 20 || !(0, helper_js_1.checkValidId)(authUserId)) {
        return { error: "error" };
    }
    var data = (0, dataStore_js_1.getData)();
    var channelId = data.channels.length;
    var user = (0, users_js_1.userProfileV1)(authUserId, authUserId);
    var newChannel = {
        channelId: channelId,
        name: name,
        messages: [],
        allMembers: [user.user],
        ownerMembers: [user.user],
        isPublic: isPublic
    };
    data.channels.push(newChannel);
    (0, dataStore_js_1.setData)(data);
    return { channelId: channelId };
}
exports.channelsCreateV1 = channelsCreateV1;
/*
channelsListV1 checks if the authUserId is valid and then returns an object containing
an array of channels that the user is apart of

Arguments:
    authUserId (number)     - holds the id of the user that is being searched for

Return Value:
    Returns { channels: channels } on if the authUserId is valid, where channels is an array of objects
        containing the channelId and name
    Returns { error: 'error' } on an invalid authUserId
*/
function channelsListV1(authUserId) {
    if (!(0, helper_js_1.checkValidId)(authUserId)) {
        return { error: "error" };
    }
    var data = (0, dataStore_js_1.getData)();
    var user = (0, users_js_1.userProfileV1)(authUserId, authUserId);
    var channels = [];
    for (var _i = 0, _a = data.channels; _i < _a.length; _i++) {
        var channel = _a[_i];
        for (var _b = 0, _c = channel.allMembers; _b < _c.length; _b++) {
            var person = _c[_b];
            if (person.uId === user.user.uId) {
                channels.push({
                    channelId: channel.channelId,
                    name: channel.name
                });
            }
        }
    }
    return { channels: channels };
}
exports.channelsListV1 = channelsListV1;
/*
This function returns an object containing an array of objects, the array contains objects
containing information about each channel.

Arguments:
    authUserId (number)       - The userId of the user calling the function

Return Value:
    Returns {error: 'error'}  on invalid authUserId
    Returns {channels: channelList} on no error
 */
function channelsListallV1(authUserId) {
    if (!(0, helper_js_1.checkValidId)(authUserId)) {
        return { error: "error" };
    }
    var data = (0, dataStore_js_1.getData)();
    var channelList = [];
    for (var _i = 0, _a = data.channels; _i < _a.length; _i++) {
        var channel = _a[_i];
        var tempChannel = {
            channelId: channel.channelId,
            name: channel.name
        };
        channelList.push(tempChannel);
    }
    return { channels: channelList };
}
exports.channelsListallV1 = channelsListallV1;
