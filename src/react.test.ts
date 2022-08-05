
import { authUserReturn, channelReturn, dmReturn, requestDmCreate, requestClear } from './helperTests';
import { requestAuthRegister } from './helperTests';
import { requestChannelCreate } from './helperTests';
import { requestMessageSend, requestMessageSenddm, requestMessageReact, requestMessageUnreact } from './helperTests';
import { removeFile } from './helperTests';

let authUser: authUserReturn;
let channel: channelReturn;
let dm: dmReturn;

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

describe('Testing message/react/v1', () => {
  describe('Testing in channel messages', () => {
    beforeEach(() => {
      channel = requestChannelCreate(authUser.token, 'name', true);
    });

    test('messageId is not a valid message', () => {
      const message = requestMessageSend(authUser.token, channel.channelId, 'message');
      const messageId = message.messageId + 1;
      requestMessageReact(authUser.token, messageId, 1, 400);
    });

    test('reactId is not valid', () => {
      const message = requestMessageSend(authUser.token, channel.channelId, 'message');
      requestMessageReact(authUser.token, message.messageId, -1, 400);
    });

    test('Message already contains a react', () => {
      const message = requestMessageSend(authUser.token, channel.channelId, 'message');
      requestMessageReact(authUser.token, message.messageId, 1);
      requestMessageReact(authUser.token, message.messageId, 1, 400);
    });

    test('1 react', () => {
      const message = requestMessageSend(authUser.token, channel.channelId, 'message');
      const react = requestMessageReact(authUser.token, message.messageId, 1);
      expect(react).toStrictEqual({});
    });

    test('2 reacts', () => {
      const authUser1 = requestAuthRegister('email@email.com', 'password', 'John', 'Apples');
      const message = requestMessageSend(authUser.token, channel.channelId, 'message');
      requestMessageReact(authUser1.token, message.messageId, 1);
      const react = requestMessageReact(authUser.token, message.messageId, 1);
      expect(react).toStrictEqual({});
    });
  });

  describe('Testing in dm messsages', () => {
    beforeEach(() => {
      const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
      const uIds = [];
      uIds.push(uId1.authUserId);
      dm = requestDmCreate(authUser.token, uIds);
    });

    test('messageId is not a valid message', () => {
      const message = requestMessageSenddm(authUser.token, dm.dmId, 'message');
      const messageId = message.messageId + 1;
      requestMessageReact(authUser.token, messageId, 1, 400);
    });

    test('reactId is not valid', () => {
      const message = requestMessageSenddm(authUser.token, dm.dmId, 'message');
      requestMessageReact(authUser.token, message.messageId, -1, 400);
    });

    test('Message already contains a react', () => {
      const message = requestMessageSenddm(authUser.token, dm.dmId, 'message');
      requestMessageReact(authUser.token, message.messageId, 1);
      requestMessageReact(authUser.token, message.messageId, 1, 400);
    });

    test('Valid inputs', () => {
      const message = requestMessageSenddm(authUser.token, dm.dmId, 'message');
      const react = requestMessageReact(authUser.token, message.messageId, 1);
      expect(react).toStrictEqual({});
    });
  });
});

describe('Testing message/unreact/v1', () => {
  describe('Testing in channel messages', () => {
    beforeEach(() => {
      channel = requestChannelCreate(authUser.token, 'name', true);
    });

    test('messageId is not a valid message', () => {
      const message = requestMessageSend(authUser.token, channel.channelId, 'message');
      requestMessageReact(authUser.token, message.messageId, 1);
      const messageId = message.messageId + 1;
      requestMessageUnreact(authUser.token, messageId, 1, 400);
    });

    test('reactId is not valid', () => {
      const message = requestMessageSend(authUser.token, channel.channelId, 'message');
      requestMessageReact(authUser.token, message.messageId, 1);
      requestMessageUnreact(authUser.token, message.messageId, -1, 400);
    });

    test('Message does not contain a react', () => {
      const message = requestMessageSend(authUser.token, channel.channelId, 'message');
      requestMessageUnreact(authUser.token, message.messageId, 1, 400);
    });

    test('Valid inputs', () => {
      const message = requestMessageSend(authUser.token, channel.channelId, 'message');
      requestMessageReact(authUser.token, message.messageId, 1);
      const unreact = requestMessageUnreact(authUser.token, message.messageId, 1);
      expect(unreact).toStrictEqual({});
    });
  });

  describe('Testing in dm messsages', () => {
    beforeEach(() => {
      const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
      const uIds = [];
      uIds.push(uId1.authUserId);
      dm = requestDmCreate(authUser.token, uIds);
    });

    test('messageId is not a valid message', () => {
      const message = requestMessageSenddm(authUser.token, dm.dmId, 'message');
      requestMessageReact(authUser.token, message.messageId, 1);
      const messageId = message.messageId + 1;
      requestMessageUnreact(authUser.token, messageId, 1, 400);
    });

    test('reactId is not valid', () => {
      const message = requestMessageSenddm(authUser.token, dm.dmId, 'message');
      requestMessageReact(authUser.token, message.messageId, -1, 400);
      requestMessageUnreact(authUser.token, message.messageId, -1, 400);
    });

    test('Message does not contain a react', () => {
      const message = requestMessageSenddm(authUser.token, dm.dmId, 'message');
      requestMessageUnreact(authUser.token, message.messageId, 1, 400);
    });

    test('Valid inputs', () => {
      const message = requestMessageSenddm(authUser.token, dm.dmId, 'message');
      requestMessageReact(authUser.token, message.messageId, 1);
      const unreact = requestMessageUnreact(authUser.token, message.messageId, 1);
      expect(unreact).toStrictEqual({});
    });
  });
});
