import { authUserReturn, requestAuthRegister, requestChannelCreate, requestDmCreate, requestChannelJoin, errorMsg, requestClear } from './helperTests';
import { requestMessageSend, requestMessageSenddm, requestMessageEdit, requestMessageRemove, removeSavedFile } from './helperTests';

let authUser: authUserReturn;

const email = 'hayden@gmail.com';
const password = 'hayden123';
const nameFirst = 'Hayden';
const nameLast = 'Smith';

beforeEach(() => {
  removeSavedFile();
  requestClear();
  authUser = requestAuthRegister(email, password, nameFirst, nameLast);
});

describe('Testing messageSendV1', () => {
  describe('error', () => {
    test('invalid token', () => {
      requestChannelCreate(authUser.token, 'name', false);
      const token = 'bad';
      const messageId = requestMessageSend(token, 1, 'message');
      expect(messageId).toStrictEqual(errorMsg);
    });
    test('channelId is invalid', () => {
      const messageId = requestMessageSend(authUser.token, 1, 'message');
      expect(messageId).toStrictEqual(errorMsg);
    });
    test('length of message is less than 1', () => {
      const channel = requestChannelCreate(authUser.token, 'name', false);
      const messageId = requestMessageSend(authUser.token, channel.channelId, '');
      expect(messageId).toStrictEqual(errorMsg);
    });
    test('length of message is more than 1000', () => {
      const channel = requestChannelCreate(authUser.token, 'name', false);
      const message = 'a'.repeat(1001);
      const messageId = requestMessageSend(authUser.token, channel.channelId, message);
      expect(messageId).toStrictEqual(errorMsg);
    });
    test('user is not a member of channel', () => {
      const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
      const channel = requestChannelCreate(authUser.token, 'name', false);
      const messageId = requestMessageSend(authUser2.token, channel.channelId, 'message');
      expect(messageId).toStrictEqual(errorMsg);
    });
  });

  describe('passes', () => {
    test('1 message - 1 channel', () => {
      const channel = requestChannelCreate(authUser.token, 'name', false);
      const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
      expect(messageId).toStrictEqual(
        expect.objectContaining({
          messageId: expect.any(Number),
        })
      );
    });
    test('2 messages - 2 channels', () => {
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

describe('Testing messageSenddmV1', () => {
  describe('error', () => {
    test('invalid token', () => {
      const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
      const uIds = [];
      uIds.push(uId1.authUserId);
      const dm = requestDmCreate(authUser.token, uIds);
      const token = 'bad';
      const messageId = requestMessageSenddm(token, dm.dmId, 'message');
      expect(messageId).toStrictEqual(errorMsg);
    });
    test('dmId is invalid', () => {
      const messageId = requestMessageSenddm(authUser.token, 404, 'message');
      expect(messageId).toStrictEqual(errorMsg);
    });
    test('length of message is less than 1', () => {
      const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
      const uIds = [];
      uIds.push(uId1.authUserId);
      const dm = requestDmCreate(authUser.token, uIds);
      const messageId = requestMessageSenddm(authUser.token, dm.dmId, '');
      expect(messageId).toStrictEqual(errorMsg);
    });
    test('length of message is more than 1000', () => {
      const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
      const uIds = [];
      uIds.push(uId1.authUserId);
      const dm = requestDmCreate(authUser.token, uIds);
      const message = 'a'.repeat(1001);
      const messageId = requestMessageSenddm(authUser.token, dm.dmId, message);
      expect(messageId).toStrictEqual(errorMsg);
    });
    test('user is not a member of channel', () => {
      const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
      const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
      const uIds = [];
      uIds.push(uId1.authUserId);
      const dm = requestDmCreate(authUser.token, uIds);
      const messageId = requestMessageSenddm(authUser2.token, dm.dmId, 'message');
      expect(messageId).toStrictEqual(errorMsg);
    });
  });

  describe('passes', () => {
    test('1 message - 1 channel', () => {
      const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
      const uIds = [];
      uIds.push(uId1.authUserId);
      const dm = requestDmCreate(authUser.token, uIds);
      const messageId = requestMessageSenddm(authUser.token, dm.dmId, 'message');
      expect(messageId).toStrictEqual(
        expect.objectContaining({
          messageId: expect.any(Number),
        })
      );
    });
  });
});

describe('Testing messageEditV1', () => {
  describe('channel tests', () => {
    describe('error', () => {
      test('invalid token', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
        const token = 'bad';
        const newMessage = requestMessageEdit(token, messageId.messageId, 'new message');
        expect(newMessage).toStrictEqual(errorMsg);
      });
      test('message length is over 1000', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
        const message = 'a'.repeat(1001);
        const newMessage = requestMessageEdit(authUser.token, messageId.messageId, message);
        expect(newMessage).toStrictEqual(errorMsg);
      });
      test('invalid messageId for channel', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const message = requestMessageSend(authUser.token, channel.channelId, 'message');
        const messageId = message.messageId + 1;
        const newMessage = requestMessageEdit(authUser.token, messageId, 'new message');
        expect(newMessage).toStrictEqual(errorMsg);
      });
      test('not sent by authUser making request', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
        const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        const newMessage = requestMessageEdit(authUser2.token, messageId.messageId, 'new message');
        expect(newMessage).toStrictEqual(errorMsg);
      });
      test('authUser has no owner permissions', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
        const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        requestChannelJoin(authUser2.token, channel.channelId);
        const newMessage = requestMessageEdit(authUser2.token, messageId.messageId, 'message');
        expect(newMessage).toStrictEqual(errorMsg);
      });
    });
    describe('passes', () => {
      test('deletes message', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
        const newMessage = requestMessageEdit(authUser.token, messageId.messageId, '');
        expect(newMessage).toStrictEqual({});
      });
      test('edits message', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
        const newMessage = requestMessageEdit(authUser.token, messageId.messageId, 'new message');
        expect(newMessage).toStrictEqual({});
      });
    });
  });
  describe('dm tests', () => {
    describe('error', () => {
      test('invalid token', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const messageId = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const token = 'bad';
        const newMessage = requestMessageEdit(token, messageId.messageId, 'new message');
        expect(newMessage).toStrictEqual(errorMsg);
      });
      test('message length is over 1000', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const messageId = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const message = 'a'.repeat(1001);
        const newMessage = requestMessageEdit(authUser.token, messageId.messageId, message);
        expect(newMessage).toStrictEqual(errorMsg);
      });
      test('invalid messageId for dm', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const message = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const messageId = message.messageId + 1;
        const newMessage = requestMessageEdit(authUser.token, messageId, 'new message');
        expect(newMessage).toStrictEqual(errorMsg);
      });
      test('not sent by authUser making request', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const messageId = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        const newMessage = requestMessageEdit(authUser2.token, messageId.messageId, 'new message');
        expect(newMessage).toStrictEqual(errorMsg);
      });
      test('authUser has no owner permissions', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const messageId = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const newMessage = requestMessageEdit(uId1.token, messageId.messageId, 'message');
        expect(newMessage).toStrictEqual(errorMsg);
      });
    });
    describe('passes', () => {
      test('deletes message', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const messageId = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const newMessage = requestMessageEdit(authUser.token, messageId.messageId, '');
        expect(newMessage).toStrictEqual({});
      });
      test('edits message', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const messageId = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const newMessage = requestMessageEdit(authUser.token, messageId.messageId, 'new message');
        expect(newMessage).toStrictEqual({});
      });
    });
  });
});

describe('Testing messageRemoveV1', () => {
  describe('channel tests', () => {
    describe('error', () => {
      test('invalid token', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
        const token = 'bad';
        const newMessage = requestMessageRemove(token, messageId);
        expect(newMessage).toStrictEqual(errorMsg);
      });
      test('invalid messageId for channel', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const message = requestMessageSend(authUser.token, channel.channelId, 'message');
        const messageId = message.messageId + 1;
        const newMessage = requestMessageRemove(authUser.token, messageId);
        expect(newMessage).toStrictEqual(errorMsg);
      });
      test('not sent by authUser making request', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
        const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        const newMessage = requestMessageRemove(authUser2.token, messageId.messageId);
        expect(newMessage).toStrictEqual(errorMsg);
      });
      test('authUser has no owner permissions', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
        const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        requestChannelJoin(authUser2.token, channel.channelId);
        const newMessage = requestMessageRemove(authUser2.token, messageId.messageId);
        expect(newMessage).toStrictEqual(errorMsg);
      });
    });
    describe('passes', () => {
      test('deletes message', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
        const newMessage = requestMessageRemove(authUser.token, messageId.messageId);
        expect(newMessage).toStrictEqual({});
      });
    });
  });
  describe('dm tests', () => {
    describe('error', () => {
      test('invalid token', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const messageId = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const token = 'bad';
        const newMessage = requestMessageRemove(token, messageId);
        expect(newMessage).toStrictEqual(errorMsg);
      });
      test('invalid messageId for channel', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const message = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const messageId = message.messageId + 1;
        const newMessage = requestMessageRemove(authUser.token, messageId);
        expect(newMessage).toStrictEqual(errorMsg);
      });
      test('not sent by authUser making request', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const messageId = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        const newMessage = requestMessageRemove(authUser2.token, messageId.messageId);
        expect(newMessage).toStrictEqual(errorMsg);
      });
      test('authUser has no owner permissions', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const messageId = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const newMessage = requestMessageRemove(uId1.token, messageId.messageId);
        expect(newMessage).toStrictEqual(errorMsg);
      });
    });
    describe('passes', () => {
      test('deletes message', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const messageId = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const newMessage = requestMessageRemove(authUser.token, messageId.messageId);
        expect(newMessage).toStrictEqual({});
      });
    });
  });
});
