import { authUserReturn, requestAuthRegister, requestChannelCreate, requestDmCreate, requestChannelJoin, requestClear } from './helperTests';
import { requestMessageSend, requestMessageSenddm, requestMessageEdit, requestMessageRemove } from './helperTests';
import { removeFile } from './helperTests';

let authUser: authUserReturn;

const email = 'hayden@gmail.com';
const password = 'hayden123';
const nameFirst = 'Hayden';
const nameLast = 'Smith';

beforeEach(() => {
  removeFile();
  requestClear();
  authUser = requestAuthRegister(email, password, nameFirst, nameLast);
});

afterEach(() => {
  removeFile();
  requestClear();
});

describe('Testing messageSendV1', () => {
  describe('error', () => {
    test('invalid token', () => {
      const channel = requestChannelCreate(authUser.token, 'name', false);
      requestMessageSend('bad', channel.channelId, 'message', 403);
    });
    test('channelId is invalid', () => {
      requestMessageSend(authUser.token, 1, 'message', 400);
    });
    test('length of message is less than 1', () => {
      const channel = requestChannelCreate(authUser.token, 'name', false);
      requestMessageSend(authUser.token, channel.channelId, '', 400);
    });
    test('length of message is more than 1000', () => {
      const channel = requestChannelCreate(authUser.token, 'name', false);
      const message = 'a'.repeat(1001);
      requestMessageSend(authUser.token, channel.channelId, message, 400);
    });
    test('user is not a member of channel', () => {
      const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
      const channel = requestChannelCreate(authUser.token, 'name', false);
      requestMessageSend(authUser2.token, channel.channelId, 'message', 403);
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
      requestMessageSenddm('bad', dm.dmId, 'message', 403);
    });
    test('dmId is invalid', () => {
      requestMessageSenddm(authUser.token, -7, 'message', 400);
    });
    test('length of message is less than 1', () => {
      const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
      const uIds = [];
      uIds.push(uId1.authUserId);
      const dm = requestDmCreate(authUser.token, uIds);
      requestMessageSenddm(authUser.token, dm.dmId, '', 400);
    });
    test('length of message is more than 1000', () => {
      const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
      const uIds = [];
      uIds.push(uId1.authUserId);
      const dm = requestDmCreate(authUser.token, uIds);
      const message = 'a'.repeat(1001);
      requestMessageSenddm(authUser.token, dm.dmId, message, 400);
    });
    test('user is not a member of channel', () => {
      const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
      const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
      const uIds = [];
      uIds.push(uId1.authUserId);
      const dm = requestDmCreate(authUser.token, uIds);
      requestMessageSenddm(authUser2.token, dm.dmId, 'message', 403);
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
        requestMessageEdit('bad', messageId.messageId, 'new message', 403);
      });
      test('message length is over 1000', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
        const message = 'a'.repeat(1001);
        requestMessageEdit(authUser.token, messageId.messageId, message, 400);
      });
      test('invalid messageId for channel', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const message = requestMessageSend(authUser.token, channel.channelId, 'message');
        const messageId = message.messageId + 1;
        requestMessageEdit(authUser.token, messageId, 'new message', 400);
      });
      test('user is not in the channel', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
        const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        requestMessageEdit(authUser2.token, messageId.messageId, 'new message', 400);
      });
      test('user has no owner permissions and is not sender', () => {
        const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        const channel = requestChannelCreate(authUser.token, 'name', true);
        requestChannelJoin(authUser2.token, channel.channelId);
        const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
        requestMessageEdit(authUser2.token, messageId.messageId, 'message', 403);
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
      test('not sender, but has owner permissions', () => {
        const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        const channel = requestChannelCreate(authUser.token, 'name', true);
        requestChannelJoin(authUser2.token, channel.channelId);
        const messageId = requestMessageSend(authUser2.token, channel.channelId, 'message');
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
        requestMessageEdit('bad', messageId.messageId, 'new message', 403);
      });
      test('message length is over 1000', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const messageId = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const message = 'a'.repeat(1001);
        requestMessageEdit(authUser.token, messageId.messageId, message, 400);
      });
      test('invalid messageId for dm', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const message = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const messageId = message.messageId + 1;
        requestMessageEdit(authUser.token, messageId, 'new message', 400);
      });
      test('user is not in the dm', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const messageId = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        requestMessageEdit(authUser2.token, messageId.messageId, 'new message', 400);
      });
      test('user has no owner permissions and is not sender', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const messageId = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        requestMessageEdit(uId1.token, messageId.messageId, 'message', 403);
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
      test('not sender, but has owner permissions', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const messageId = requestMessageSenddm(uId1.token, dm.dmId, 'message');
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
        requestMessageRemove('bad', messageId, 403);
      });
      test('invalid messageId for channel', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const message = requestMessageSend(authUser.token, channel.channelId, 'message');
        const messageId = message.messageId + 1;
        requestMessageRemove(authUser.token, messageId, 400);
      });
      test('user is not in the channel', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
        const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        requestMessageRemove(authUser2.token, messageId.messageId, 400);
      });
      test('user has no owner permissions and is not sender', () => {
        const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        const channel = requestChannelCreate(authUser.token, 'name', true);
        requestChannelJoin(authUser2.token, channel.channelId);
        const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
        requestMessageRemove(authUser2.token, messageId.messageId, 403);
      });
    });
    describe('passes', () => {
      test('deletes message (1 message)', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const messageId = requestMessageSend(authUser.token, channel.channelId, 'message');
        const newMessage = requestMessageRemove(authUser.token, messageId.messageId);
        expect(newMessage).toStrictEqual({});
      });
      test('deletes message (multiple messages)', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const message1 = requestMessageSend(authUser.token, channel.channelId, 'message1');
        requestMessageSend(authUser.token, channel.channelId, 'message2');
        const newMessage = requestMessageRemove(authUser.token, message1.messageId);
        expect(newMessage).toStrictEqual({});
      });
      test('not sender, but has owner permissions', () => {
        const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        const channel = requestChannelCreate(authUser.token, 'name', true);
        requestChannelJoin(authUser2.token, channel.channelId);
        const messageId = requestMessageSend(authUser2.token, channel.channelId, 'message');
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
        requestMessageRemove('bad', messageId, 403);
      });
      test('invalid messageId for channel', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const message = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const messageId = message.messageId + 1;
        requestMessageRemove(authUser.token, messageId, 400);
      });
      test('user is not in the dm', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const messageId = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        requestMessageRemove(authUser2.token, messageId.messageId, 400);
      });
      test('user has no owner permissions and is not sender', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const messageId = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        requestMessageRemove(uId1.token, messageId.messageId, 403);
      });
    });
    describe('passes', () => {
      test('deletes message (only 1 message)', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const messageId = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const newMessage = requestMessageRemove(authUser.token, messageId.messageId);
        expect(newMessage).toStrictEqual({});
      });
      test('deletes message (multiple messages)', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const message1 = requestMessageSenddm(authUser.token, dm.dmId, 'message1');
        requestMessageSenddm(authUser.token, dm.dmId, 'message2');
        const newMessage = requestMessageRemove(authUser.token, message1.messageId);
        expect(newMessage).toStrictEqual({});
      });
      test('not sender, but has owner permissions', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const messageId = requestMessageSenddm(uId1.token, dm.dmId, 'message');
        const newMessage = requestMessageRemove(authUser.token, messageId.messageId);
        expect(newMessage).toStrictEqual({});
      });
    });
  });
});
