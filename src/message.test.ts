import request, { HttpVerb } from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const errorMsg = { error: 'error' };

function requestHelper(method: HttpVerb, path: string, payload: object) {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    json = payload;
  }
  return request(method, url + ':' + port + path, { qs, json });
}

// ========================================================================= //
// Wrapper Functions

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
    const res = requestHelper('POST', '/auth/register/v2', {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast
    });
    expect(res.statusCode).toBe(OK);
    return JSON.parse(String(res.getBody()));
}

function requestChannelCreate(token: string, name: string, isPublic: boolean) {
    const res = requestHelper('POST', '/channels/create/v2', { token, name, isPublic });
    expect(res.statusCode).toBe(OK);
    return JSON.parse(String(res.getBody()));
}

function requestChannelJoin(token: string, channelId: number) {
    const res = requestHelper('POST', '/channel/join/v2', { token, channelId });
    expect(res.statusCode).toBe(OK);
    return JSON.parse(String(res.getBody()));
}

function requestMessageSend(token: string, channelId: number, message: string) {
    const res = requestHelper('POST', '/message/send/v1', { token, channelId, message });
    expect(res.statusCode).toBe(OK);
    return JSON.parse(String(res.getBody()));
}

// function requestMessageEdit(token: string, messageId: number, message: string) {
//     return requestHelper('PUT', '/message/edit/v1', { token, messageId, message });
// }

// function requestMessageRemove(token: string, messageId: number) {
//     return requestHelper('DELETE', '/message/remove/v1', { token, messageId });
// }

function requestClear() {
    return requestHelper('DELETE', '/clear/v1', {});
}

beforeEach(() => {
    requestClear();
});

describe('Testing messageSendV1', () => {
    describe('error', () => {
        test('channelId is invalid', () => {
            const authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
            const messageId = requestMessageSend(authUser.token, 1, 'message');
            expect(messageId).toStrictEqual(errorMsg);
        });
        test('length of message is less than 1', () => {
            const authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
            const channel = requestChannelCreate(authUser.token, 'name', false);
            requestChannelJoin(authUser.token, channel.channelId);
            const messageId = requestMessageSend(authUser.token, channel.channelId, '');
            expect(messageId).toStrictEqual(errorMsg);
        });
        test('length of message is more than 1000', () => {
            const authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
            const channel = requestChannelCreate(authUser.token, 'name', false);
            requestChannelJoin(authUser.token, channel.channelId);
            const message = 'a'.repeat(1001);
            const messageId = requestMessageSend(authUser.token, channel.channelId, message);
            expect(messageId).toStrictEqual(errorMsg);
        });
        test('user is not a member of channel', () => {
            const authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
            const channel = requestChannelCreate(authUser.token, 'name', false);
            const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
            expect(messageId).toStrictEqual(errorMsg);
        });
    });

    describe('passes', () => {
        test('1 message - 1 channel', () => {
            const authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
            const channel = requestChannelCreate(authUser.token, 'name', false);
            requestChannelJoin(authUser.token, channel.channelId);
            const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
            expect(messageId).toStrictEqual(
                expect.objectContaining({
                    messageId: expect.any(Number),
                })
            );
        });
        test('2 messages - 2 channels', () => {
            const authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
            const channel1 = requestChannelCreate(authUser.token, 'name1', false);
            const channel2 = requestChannelCreate(authUser.token, 'name2', false);
            requestChannelJoin(authUser.token, channel1.channelId);
            requestChannelJoin(authUser.token, channel2.channelId);
            const messageId = requestMessageSend(authUser.token, channel.channelId, 'message1');
            const messageId = requestMessageSend(authUser.token, channel.channelId, 'message2');
            expect(messageId1).toStrictEqual(
                expect.objectContaining({
                    messageId: expect.any(Number),
                })
            );
            expect(messageId2).toStrictEqual(
                expect.objectContaining({
                    messageId: expect.any(Number).not(messageId1),
                })
            );
        });
    });
});

// describe('Testing messageEditV1', () => {
//     describe('error', () => {
//         test('message length is over 1000', () => {
//             const res1 = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
//             const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
//             expect(res1.statusCode).toBe(OK);
//             const res2 = requestChannelCreate(authUser.token, 'correct name', false);
//             const channel = JSON.parse(String(res2.getBody(('utf-8'))));
//             expect(res2.statusCode).toBe(OK);
//             // add user to channel
//             const res3 = requestChannelJoin(authUser.token, channel.channelId);
//             // const join = JSON.parse(String(res3.getBody(('utf-8'))));
//             expect(res3.statusCode).toBe(OK);
//             //
//             const res4 = requestMessageSend(authUser.token, channel.channelId, 'message');
//             const messageId = JSON.parse(String(res4.getBody(('utf-8'))));
//             expect(res4.statusCode).toBe(OK);

//             const message = 'a'.repeat(1001);
//             const res5 = requestMessageEdit(authUser.token, messageId.messageId, message);
//             const newMessage = JSON.parse(String(res5.getBody(('utf-8'))));
//             expect(res5.statusCode).toBe(OK);
//             expect(newMessage).toStrictEqual(errorMsg);
//         });

//         test('invalid messageId for channel/dm', () => {
//             const res1 = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
//             const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
//             expect(res1.statusCode).toBe(OK);
//             const res2 = requestChannelCreate(authUser.token, 'correct name', false);
//             const channel = JSON.parse(String(res2.getBody(('utf-8'))));
//             expect(res2.statusCode).toBe(OK);
//             // add user to channel
//             const res3 = requestChannelJoin(authUser.token, channel.channelId);
//             // const join = JSON.parse(String(res3.getBody(('utf-8'))));
//             expect(res3.statusCode).toBe(OK);
//             //
//             const res4 = requestMessageEdit(authUser.token, 1, 'message');
//             const messageId = JSON.parse(String(res4.getBody(('utf-8'))));
//             expect(res4.statusCode).toBe(OK);
//             expect(messageId).toStrictEqual(errorMsg);
//         });

//         test('not sent by authUser making request', () => {
//             const res1 = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
//             const authUser1 = JSON.parse(String(res1.getBody(('utf-8'))));
//             expect(res1.statusCode).toBe(OK);
//             const res2 = requestChannelCreate(authUser1.token, 'correct name', false);
//             const channel = JSON.parse(String(res2.getBody(('utf-8'))));
//             expect(res2.statusCode).toBe(OK);
//             // add user to channel
//             const res3 = requestChannelJoin(authUser1.token, channel.channelId);
//             // const join = JSON.parse(String(res3.getBody(('utf-8'))));
//             expect(res3.statusCode).toBe(OK);
//             //
//             const res4 = requestMessageSend(authUser1.token, channel.channelId, 'message1');
//             const messageId = JSON.parse(String(res4.getBody(('utf-8'))));
//             expect(res4.statusCode).toBe(OK);

//             const res5 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
//             const authUser2 = JSON.parse(String(res5.getBody(('utf-8'))));
//             expect(res5.statusCode).toBe(OK);

//             const res6 = requestMessageEdit(authUser2.token, messageId.messageId, 'message2');
//             const newMessage = JSON.parse(String(res6.getBody(('utf-8'))));
//             expect(res6.statusCode).toBe(OK);
//             expect(newMessage).toStrictEqual(errorMsg);
//         });

//         test('authUser has no owner permissions', () => {
            
//         });
//     });

//     describe('passes', () => {
//         test('deletes message', () => {

//         });
//     });
// });

// describe('Testing messageRemoveV1', () => {
//     describe('error', () => {
//         test('invalid messageId for channel/dm', () => {

//         });

//         test('not sent by authUser making request', () => {
            
//         });

//         test('authUser has no owner permissions', () => {
            
//         });
//     });

//     describe('passes', () => {
//         test('deletes message', () => {

//         });
//     });
// });
