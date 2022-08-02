import { authUserReturn, requestAuthRegister, requestChannelCreate, requestDmCreate, requestChannelJoin, requestChannelMessages, requestDmMessages, requestClear } from './helperTests';
import { requestMessageSend, requestMessageSenddm, requestMessageEdit, requestMessageRemove, requestMessageShare} from './helperTests';
import { removeFile } from './helperTests';

let authUser: authUserReturn;

const email = 'hayden@gmail.com';
const password = 'hayden123';
const nameFirst = 'Hayden';
const nameLast = 'Smith';


// ===========================================================================// 
// HELPER FUNCTIONS
//============================================================================//
function generateTimeStamp() {
  return Math.floor(Date.now() / 1000);
}

function checkTimestamp(timestamp: number, expectedTimestamp: number) {
  /**
   * Allow for 3 seconds offset
   */
  expect(timestamp).toBeGreaterThanOrEqual(expectedTimestamp - 3);
  expect(timestamp).toBeLessThan(expectedTimestamp + 3);
}

function sendMessage(messageStr: string) : {channelId: number, ogMessageId: number} {
  const channel = requestChannelCreate(authUser.token, 'name', false);
  const message = requestMessageSend(authUser.token, channel.channelId, messageStr);
  return {
    channelId: channel.channelId,
    ogMessageId: message.messageId
  }
}

function sendDmMessage(messageStr: string) : {dmId: number, ogMessageIdDm: number} {
  const user = requestAuthRegister('email@email.com', password, nameFirst, nameLast);
  const uIds = [user.authUserId];
  const dm = requestDmCreate(authUser.token, uIds);
  const channel = requestChannelCreate(authUser.token, 'name', false);
  const message = requestMessageSenddm(authUser.token, dm.dmId, messageStr);
  return {
    dmId: dm.dmId,
    ogMessageIdDm: message.messageId
  }
}

beforeEach(() => {
  removeFile();
  requestClear();
  authUser = requestAuthRegister(email, password, nameFirst, nameLast);
});

afterEach(() => {
  removeFile();
  requestClear();
});


// ===========================================================================// 
// Tests
//============================================================================//
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
      const message = requestMessageSend(authUser.token, channel.channelId, 'message');
      const expectedTime = generateTimeStamp();
      const messages = requestChannelMessages(authUser.token, channel.channelId, 0);
      expect(message).toStrictEqual(
        expect.objectContaining({
          messageId: expect.any(Number),
        })
      );
      expect(messages).toStrictEqual(
        expect.objectContaining({
          messages: [{
            messageId: message.messageId,
            uId: authUser.authUserId,
            message: 'message',
            timeSent: expect.any(Number)
          }],
          start: 0,
          end: -1
        })
      );
      checkTimestamp(messages.messages[0].timeSent, expectedTime);
    });
    test('2 messages - 2 channels', () => {
      const channel1 = requestChannelCreate(authUser.token, 'name1', false);
      const channel2 = requestChannelCreate(authUser.token, 'name2', false);
      const message1 = requestMessageSend(authUser.token, channel1.channelId, 'message1');
      const expectedTime1 = generateTimeStamp();
      const message2 = requestMessageSend(authUser.token, channel2.channelId, 'message2');
      const expectedTime2 = generateTimeStamp();
      const messages1 = requestChannelMessages(authUser.token, channel1.channelId, 0);
      const messages2 = requestChannelMessages(authUser.token, channel2.channelId, 0);
      expect(message1).toStrictEqual(
        expect.objectContaining({
          messageId: expect.any(Number),
        })
      );
      expect(message2).toStrictEqual(
        expect.objectContaining({
          messageId: expect.any(Number),
        })
      );
      expect(message2).toStrictEqual(
        expect.not.objectContaining({
          messageId: message1.messageId,
        })
      );
      expect(messages1).toStrictEqual(
        expect.objectContaining({
          messages: [
            {
              messageId: message1.messageId,
              uId: authUser.authUserId,
              message: 'message1',
              timeSent: expect.any(Number)
            },
          ],
          start: 0,
          end: -1
        })
      );
      expect(messages2).toStrictEqual(
        expect.objectContaining({
          messages: [
            {
              messageId: message2.messageId,
              uId: authUser.authUserId,
              message: 'message2',
              timeSent: expect.any(Number)
            },
          ],
          start: 0,
          end: -1
        })
      );
      checkTimestamp(messages1.messages[0].timeSent, expectedTime1);
      checkTimestamp(messages2.messages[0].timeSent, expectedTime2);
    });
    test('2 messages - 1 channel', () => {
      const channel = requestChannelCreate(authUser.token, 'name', false);
      const message1 = requestMessageSend(authUser.token, channel.channelId, 'message1');
      const expectedTime1 = generateTimeStamp();
      const message2 = requestMessageSend(authUser.token, channel.channelId, 'message2');
      const expectedTime2 = generateTimeStamp();
      const messages = requestChannelMessages(authUser.token, channel.channelId, 0);
      expect(message1).toStrictEqual(
        expect.objectContaining({
          messageId: expect.any(Number),
        })
      );
      expect(message2).toStrictEqual(
        expect.objectContaining({
          messageId: expect.any(Number),
        })
      );
      expect(message2).toStrictEqual(
        expect.not.objectContaining({
          messageId: message1.messageId,
        })
      );
      expect(messages).toStrictEqual(
        expect.objectContaining({
          messages: [
            {
              messageId: message2.messageId,
              uId: authUser.authUserId,
              message: 'message2',
              timeSent: expect.any(Number)
            },
            {
              messageId: message1.messageId,
              uId: authUser.authUserId,
              message: 'message1',
              timeSent: expect.any(Number)
            }
          ],
          start: 0,
          end: -1
        })
      );
      checkTimestamp(messages.messages[0].timeSent, expectedTime1);
      checkTimestamp(messages.messages[1].timeSent, expectedTime2);
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
      const message = requestMessageSenddm(authUser.token, dm.dmId, 'message');
      const expectedTime = generateTimeStamp();
      const messages = requestDmMessages(authUser.token, dm.dmId, 0);
      expect(message).toStrictEqual(
        expect.objectContaining({
          messageId: expect.any(Number),
        })
      );
      expect(messages).toStrictEqual(
        expect.objectContaining({
          messages: [{
            messageId: message.messageId,
            uId: authUser.authUserId,
            message: 'message',
            timeSent: expect.any(Number)
          }],
          start: 0,
          end: -1
        })
      );
      checkTimestamp(messages.messages[0].timeSent, expectedTime);
    });
    test('2 messages - 1 channel', () => {
      const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
      const uIds = [];
      uIds.push(uId1.authUserId);
      const dm = requestDmCreate(authUser.token, uIds);
      const message1 = requestMessageSenddm(authUser.token, dm.dmId, 'message1');
      const expectedTime1 = generateTimeStamp();
      const message2 = requestMessageSenddm(authUser.token, dm.dmId, 'message2');
      const expectedTime2 = generateTimeStamp();
      const messages = requestDmMessages(authUser.token, dm.dmId, 0);
      expect(message1).toStrictEqual(
        expect.objectContaining({
          messageId: expect.any(Number),
        })
      );
      expect(message2).toStrictEqual(
        expect.objectContaining({
          messageId: expect.any(Number),
        })
      );
      expect(message2).toStrictEqual(
        expect.not.objectContaining({
          messageId: message1.messageId,
        })
      );
      expect(messages).toStrictEqual(
        expect.objectContaining({
          messages: [
            {
              messageId: message2.messageId,
              uId: authUser.authUserId,
              message: 'message2',
              timeSent: expect.any(Number)
            },
            {
              messageId: message1.messageId,
              uId: authUser.authUserId,
              message: 'message1',
              timeSent: expect.any(Number)
            }
          ],
          start: 0,
          end: -1
        })
      );
      checkTimestamp(messages.messages[0].timeSent, expectedTime1);
      checkTimestamp(messages.messages[1].timeSent, expectedTime2);
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
        const messages = requestChannelMessages(authUser.token, channel.channelId, 0);
        expect(newMessage).toStrictEqual({});
        expect(messages).toStrictEqual(
          expect.objectContaining({
            messages: [],
            start: 0,
            end: -1
          })
        );
      });
      test('edits message', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const message = requestMessageSend(authUser.token, channel.channelId, 'message');
        const expectedTime = generateTimeStamp();
        const newMessage = requestMessageEdit(authUser.token, message.messageId, 'new message');
        const messages = requestChannelMessages(authUser.token, channel.channelId, 0);
        expect(newMessage).toStrictEqual({});
        expect(messages).toStrictEqual(
          expect.objectContaining({
            messages: [{
              messageId: message.messageId,
              uId: authUser.authUserId,
              message: 'new message',
              timeSent: expect.any(Number)
            }],
            start: 0,
            end: -1
          })
        );
        checkTimestamp(messages.messages[0].timeSent, expectedTime);
      });
      test('not sender, but has owner permissions', () => {
        const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        const channel = requestChannelCreate(authUser.token, 'name', true);
        requestChannelJoin(authUser2.token, channel.channelId);
        const message = requestMessageSend(authUser2.token, channel.channelId, 'message');
        const expectedTime = generateTimeStamp();
        const newMessage = requestMessageEdit(authUser.token, message.messageId, 'new message');
        const messages = requestChannelMessages(authUser.token, channel.channelId, 0);
        expect(newMessage).toStrictEqual({});
        expect(messages).toStrictEqual(
          expect.objectContaining({
            messages: [{
              messageId: message.messageId,
              uId: authUser2.authUserId,
              message: 'new message',
              timeSent: expect.any(Number)
            }],
            start: 0,
            end: -1
          })
        );
        checkTimestamp(messages.messages[0].timeSent, expectedTime);
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
        const messages = requestDmMessages(authUser.token, dm.dmId, 0);
        expect(newMessage).toStrictEqual({});
        expect(messages).toStrictEqual(
          expect.objectContaining({
            messages: [],
            start: 0,
            end: -1
          })
        );
      });
      test('edits message', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const message = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const expectedTime = generateTimeStamp();
        const newMessage = requestMessageEdit(authUser.token, message.messageId, 'new message');
        const messages = requestDmMessages(authUser.token, dm.dmId, 0);
        expect(newMessage).toStrictEqual({});
        expect(messages).toStrictEqual(
          expect.objectContaining({
            messages: [{
              messageId: message.messageId,
              uId: authUser.authUserId,
              message: 'new message',
              timeSent: expect.any(Number)
            }],
            start: 0,
            end: -1
          })
        );
        checkTimestamp(messages.messages[0].timeSent, expectedTime);
      });
      test('not sender, but has owner permissions', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const message = requestMessageSenddm(uId1.token, dm.dmId, 'message');
        const expectedTime = generateTimeStamp();
        const newMessage = requestMessageEdit(authUser.token, message.messageId, 'new message');
        const messages = requestDmMessages(authUser.token, dm.dmId, 0);
        expect(newMessage).toStrictEqual({});
        expect(messages).toStrictEqual(
          expect.objectContaining({
            messages: [{
              messageId: message.messageId,
              uId: uId1.authUserId,
              message: 'new message',
              timeSent: expect.any(Number)
            }],
            start: 0,
            end: -1
          })
        );
        checkTimestamp(messages.messages[0].timeSent, expectedTime);
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
        const message = requestMessageSend(authUser.token, channel.channelId, 'message');
        const newMessage = requestMessageRemove(authUser.token, message.messageId);
        const messages = requestChannelMessages(authUser.token, channel.channelId, 0);
        expect(newMessage).toStrictEqual({});
        expect(messages).toStrictEqual(
          expect.objectContaining({
            messages: [],
            start: 0,
            end: -1
          })
        );
      });
      test('deletes message (multiple messages)', () => {
        const channel = requestChannelCreate(authUser.token, 'name', false);
        const message = requestMessageSend(authUser.token, channel.channelId, 'message1');
        const message1 = requestMessageSend(authUser.token, channel.channelId, 'message2');
        const expectedTime = generateTimeStamp();
        const newMessage = requestMessageRemove(authUser.token, message.messageId);
        const messages = requestChannelMessages(authUser.token, channel.channelId, 0);
        expect(newMessage).toStrictEqual({});
        expect(messages).toStrictEqual(
          expect.objectContaining({
            messages: [{
              messageId: message1.messageId,
              uId: authUser.authUserId,
              message: 'message2',
              timeSent: expect.any(Number)
            }],
            start: 0,
            end: -1
          })
        );
        checkTimestamp(messages.messages[0].timeSent, expectedTime);
      });
      test('not sender, but has owner permissions', () => {
        const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        const channel = requestChannelCreate(authUser.token, 'name', true);
        requestChannelJoin(authUser2.token, channel.channelId);
        const messageId = requestMessageSend(authUser2.token, channel.channelId, 'message');
        const newMessage = requestMessageRemove(authUser.token, messageId.messageId);
        const messages = requestChannelMessages(authUser.token, channel.channelId, 0);
        expect(newMessage).toStrictEqual({});
        expect(messages).toStrictEqual(
          expect.objectContaining({
            messages: [],
            start: 0,
            end: -1
          })
        );
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
        const message = requestMessageSenddm(authUser.token, dm.dmId, 'message');
        const newMessage = requestMessageRemove(authUser.token, message.messageId);
        const messages = requestDmMessages(authUser.token, dm.dmId, 0);
        expect(newMessage).toStrictEqual({});
        expect(messages).toStrictEqual(
          expect.objectContaining({
            messages: [],
            start: 0,
            end: -1
          })
        );
      });
      test('deletes message (multiple messages)', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const message = requestMessageSenddm(authUser.token, dm.dmId, 'message1');
        const message1 = requestMessageSenddm(authUser.token, dm.dmId, 'message2');
        const expectedTime = generateTimeStamp();
        const newMessage = requestMessageRemove(authUser.token, message.messageId);
        const messages = requestDmMessages(authUser.token, dm.dmId, 0);
        expect(newMessage).toStrictEqual({});
        expect(messages).toStrictEqual(
          expect.objectContaining({
            messages: [{
              messageId: message1.messageId,
              uId: authUser.authUserId,
              message: 'message2',
              timeSent: expect.any(Number)
            }],
            start: 0,
            end: -1
          })
        );
        checkTimestamp(messages.messages[0].timeSent, expectedTime);
      });
      test('not sender, but has owner permissions', () => {
        const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uIds = [];
        uIds.push(uId1.authUserId);
        const dm = requestDmCreate(authUser.token, uIds);
        const message = requestMessageSenddm(uId1.token, dm.dmId, 'message');
        const newMessage = requestMessageRemove(authUser.token, message.messageId);
        const messages = requestDmMessages(authUser.token, dm.dmId, 0);
        expect(newMessage).toStrictEqual({});
        expect(messages).toStrictEqual(
          expect.objectContaining({
            messages: [],
            start: 0,
            end: -1
          })
        );
      });
    });
  });
});

describe('Testing messageShare', () => {
  const optionalMsg = 'optional message'; 
  const messageStr = 'message';
  describe('Error cases', () => {
    test('invalid token', () => {
      const {channelId, ogMessageId} = sendMessage(messageStr);
      requestMessageShare(authUser.token + 1, ogMessageId, optionalMsg, channelId, -1, 403);
    });
    test('Both channelId and dmId are invalid', () => {
      const {channelId, ogMessageId} = sendMessage(messageStr);
      requestMessageShare(authUser.token, ogMessageId, optionalMsg, channelId + 1, 1, 400);
    });
    test('Neither channelId nor dmId are -1', () => {
      const {channelId, ogMessageId} = sendMessage(messageStr);
      const {dmId, ogMessageIdDm} = sendDmMessage(messageStr);
      requestMessageShare(authUser.token, ogMessageId, optionalMsg, channelId + 1, dmId + 1, 400);
    });
    test('OgMessageId is not valid for channel', () => {
      const {channelId, ogMessageId} = sendMessage(messageStr);
      requestMessageShare(authUser.token, ogMessageId + 1, optionalMsg, channelId, -1, 400);
    });
    test('OgMessageId is not valid for dm', () => {
      const {dmId, ogMessageIdDm} = sendDmMessage(messageStr);
      requestMessageShare(authUser.token, ogMessageIdDm + 1, optionalMsg, -1, dmId, 400);
    });
    test('Length of message is more than 1000 characters (channel)', () => {
      const longMessage = 'a'.repeat(1001);
      const {channelId, ogMessageId} = sendMessage(messageStr);
      requestMessageShare(authUser.token, ogMessageId, longMessage, channelId, -1, 400);
    });
    test('ChannelId is valid but authorised user has not joined channel', () => {
      const authUser2 = requestAuthRegister('email@email.com', password, nameFirst, nameLast);
      const channel = requestChannelCreate(authUser2.token, 'name', false);
      const channel2 = requestChannelCreate(authUser.token, 'name', false);
      const message = requestMessageSend(authUser.token, channel2.channelId, messageStr);
      requestMessageShare(authUser.token, message.messageId, optionalMsg, channel.channelId, -1, 403);
    });
    test('DmId is valid but authorised user has not joined dm', () => {
      const user = requestAuthRegister('email@email.com', password, nameFirst, nameLast);
      const notMember = requestAuthRegister('email2@email.com', password, nameFirst, nameLast);
      const uIds = [user.authUserId];
      const {dmId} = requestDmCreate(authUser.token, uIds);
      const {channelId} = requestChannelCreate(notMember.token, 'name', false);
      const {messageId} = requestMessageSend(notMember.token, channelId, messageStr);
      requestMessageShare(notMember.token, messageId, optionalMsg, -1, dmId, 403);
    });
    
  });
  describe('Success', () => {
    test('New messag from channel is sent to channel', () => {
      const {channelId, ogMessageId} = sendMessage(messageStr);
      const {sharedMessageId} = requestMessageShare(authUser.token, ogMessageId, optionalMsg, channelId, -1, 200);
      const messages = requestChannelMessages(authUser.token, channelId, 0);
      expect(messages).toStrictEqual(
        expect.objectContaining({
          messages: [
            {
              messageId: sharedMessageId,
              uId: authUser.authUserId,
              message: expect.any(String),
              timeSent: expect.any(Number)
            },
            {
              messageId: ogMessageId,
              uId: authUser.authUserId,
              message: expect.any(String),
              timeSent: expect.any(Number)
            }
          ],
          start: 0,
          end: -1
        })
      );
    });
    test('New message from dm is sent to channel', () => {
      const {channelId} = requestChannelCreate(authUser.token, 'name', false);
      const {dmId, ogMessageIdDm} = sendDmMessage(messageStr);
      const {sharedMessageId} = requestMessageShare(authUser.token, ogMessageIdDm, optionalMsg, channelId, -1, 200);
      const messages = requestChannelMessages(authUser.token, channelId, 0);
      expect(messages).toStrictEqual(
        expect.objectContaining({
          messages: [
            {
              messageId: sharedMessageId,
              uId: authUser.authUserId,
              message: expect.any(String),
              timeSent: expect.any(Number)
            },
          ],
          start: 0,
          end: -1
        })
      );
    });
    test('New message from dm is sent to dm', () => {
      const {dmId, ogMessageIdDm} = sendDmMessage(messageStr);
      const {sharedMessageId} = requestMessageShare(authUser.token, ogMessageIdDm, optionalMsg, -1, dmId, 200);
      const messages = requestDmMessages(authUser.token, dmId, 0);
      expect(messages).toStrictEqual(
        expect.objectContaining({
          messages: [
            {
              messageId: sharedMessageId,
              uId: authUser.authUserId,
              message: expect.any(String),
              timeSent: expect.any(Number)
            },
            {
              messageId: ogMessageIdDm,
              uId: authUser.authUserId,
              message: expect.any(String),
              timeSent: expect.any(Number)
            }
          ],
          start: 0,
          end: -1
        })
      );
    });
    test('No change to new message when og message is removed', () => {
      const {channelId, ogMessageId} = sendMessage(messageStr);
      const {sharedMessageId} = requestMessageShare(authUser.token, ogMessageId, optionalMsg, channelId, -1, 200);
      requestMessageRemove(authUser.token, ogMessageId);
      const messages = requestChannelMessages(authUser.token, channelId, 0);
      expect(messages).toStrictEqual(
        expect.objectContaining({
          messages: [
            {
              messageId: sharedMessageId,
              uId: authUser.authUserId,
              message: expect.any(String),
              timeSent: expect.any(Number)
            },
          ],
          start: 0,
          end: -1
        })
      );
    });
    
  });
  

});