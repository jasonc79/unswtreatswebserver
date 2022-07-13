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

function requestMessageEdit(token: string, messageId: number, message: string) {
  const res = requestHelper('PUT', '/message/edit/v1', { token, messageId, message });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

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
      const messageId = requestMessageSend(authUser.token, channel.channelId, '');
      expect(messageId).toStrictEqual(errorMsg);
    });
    test('length of message is more than 1000', () => {
      const authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
      const channel = requestChannelCreate(authUser.token, 'name', false);
      const message = 'a'.repeat(1001);
      const messageId = requestMessageSend(authUser.token, channel.channelId, message);
      expect(messageId).toStrictEqual(errorMsg);
    });
    test('user is not a member of channel', () => {
      const authUser1 = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
      const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
      const channel = requestChannelCreate(authUser1.token, 'name', false);
      const messageId = requestMessageSend(authUser2.token, channel.channelId, 'message');
      expect(messageId).toStrictEqual(errorMsg);
    });
  });

  describe('passes', () => {
    test('1 message - 1 channel', () => {
      const authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
      const channel = requestChannelCreate(authUser.token, 'name', false);
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
      const messageId1 = requestMessageSend(authUser.token, channel1.channelId, 'message1');
      const messageId2 = requestMessageSend(authUser.token, channel2.channelId, 'message2');
      expect(messageId1).toStrictEqual(
        expect.objectContaining({
          messageId: expect.any(Number),
        })
      );
      expect(messageId2).toStrictEqual(
        expect.objectContaining({
          messageId: expect.any(Number),
        })
      );
      expect(messageId2).toStrictEqual(
        expect.not.objectContaining({
          messageId: messageId1.messageId,
        })
      );
    });
  });
});

describe('Testing messageEditV1', () => {
  describe('error', () => {
    test('message length is over 1000', () => {
      const authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
      const channel = requestChannelCreate(authUser.token, 'name', false);
      const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
      const message = 'a'.repeat(1001);
      const newMessage = requestMessageEdit(authUser.token, messageId.messageId, message);
      expect(newMessage).toStrictEqual(errorMsg);
    });
    test('invalid messageId for channel/dm', () => {
      const authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
      const channel = requestChannelCreate(authUser.token, 'name', false);
      const message = requestMessageSend(authUser.token, channel.channelId, 'message');
      const messageId = message.messageId + 1;
      // const messageId = message.messageId;
      const newMessage = requestMessageEdit(authUser.token, messageId, 'new message');
      expect(newMessage).toStrictEqual(errorMsg);
    });
    test('not sent by authUser making request', () => {
      const authUser1 = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
      const channel = requestChannelCreate(authUser1.token, 'name', false);
      const messageId = requestMessageSend(authUser1.token, channel.channelId, 'message');
      const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
      const newMessage = requestMessageEdit(authUser2.token, messageId.messageId, 'new message');
      expect(newMessage).toStrictEqual(errorMsg);
    });
    test('authUser has no owner permissions', () => {
      const authUser1 = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
      const channel = requestChannelCreate(authUser1.token, 'name', false);
      const messageId = requestMessageSend(authUser1.token, channel.channelId, 'message');
      const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
      requestChannelJoin(authUser2.token, channel.channelId);
      const newMessage = requestMessageEdit(authUser2.token, messageId.messageId, 'message');
      expect(newMessage).toStrictEqual(errorMsg);
    });
  });

  describe('passes', () => {
    test('deletes message', () => {
      const authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
      const channel = requestChannelCreate(authUser.token, 'name', false);
      const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
      const newMessage = requestMessageEdit(authUser.token, messageId.messageId, 'new message');
      expect(newMessage).toStrictEqual({});
    });
  });
});

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
