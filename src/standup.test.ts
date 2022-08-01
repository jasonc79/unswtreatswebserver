import { authUserReturn, requestAuthRegister, requestChannelCreate, requestChannelMessages } from './helperTests';
import { requestStandupStart, requestStandupActive, requestStandupSend } from './helperTests';
import { removeFile, requestClear } from './helperTests';

let authUser: authUserReturn;
type channelIdReturn = {
  channelId: number
}
type activeStandup = {
  isActive: boolean,
  timeFinish: number
}


const email = 'hayden@gmail.com';
const password = 'hayden123';
const nameFirst = 'Hayden';
const nameLast = 'Smith';
const handleStr = 'haydensmith';

const email2 = 'hayden2@gmail.com';
const password2 = 'hayden1234';
const nameFirst2 = 'Hayden2';
const nameLast2 = 'Smith2';

beforeEach(() => {
  removeFile();
  requestClear();
  authUser = requestAuthRegister(email, password, nameFirst, nameLast);
});

afterEach(() => {
  removeFile();
  requestClear();
});

describe('Testing standupStartV1', () => {
  describe('error cases', () => {
    test('invalid token', () => {
      const channel = requestChannelCreate(authUser.token, 'name', false);
      requestStandupStart('bad', channel.channelId, 1, 403);
    });
    test('channelId is invalid', () => {
      requestStandupStart(authUser.token, 1, 1, 400);
    });
    test('length is a negative number', () => {
      const channel = requestChannelCreate(authUser.token, 'name', false);
      requestStandupStart(authUser.token, channel.channelId, -1, 400);
    });
    test('user is not a member of the channel', () => {
      const user = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
      const channel = requestChannelCreate(authUser.token, 'name', false);
      requestStandupStart(user.token, channel.channelId, 1, 403);
    });
    test('active standup is already running in the channel', () => {
      const channel = requestChannelCreate(authUser.token, 'name', false);
      requestStandupStart(authUser.token, channel.channelId, 1);
      requestStandupStart(authUser.token, channel.channelId, 1, 400);
    });
  });

  describe('passes', () => {
    test('standup is started', () => {
      const channel = requestChannelCreate(authUser.token, 'name', false);
      const standup = requestStandupStart(authUser.token, channel.channelId, 5);
      expect(standup).toStrictEqual(
        expect.objectContaining({
          timeFinish: expect.any(Number),
        })
      );
    });
  });
});

describe('Testing standupActiveV1', () => {
  describe('error cases', () => {
    test('invalid token', () => {
      const channel = requestChannelCreate(authUser.token, 'name', false);
      requestStandupActive('bad', channel.channelId, 403);
    });
    test('channelId is invalid', () => {
      requestStandupActive(authUser.token, 1, 400);
    });
    test('user is not a member of the channel', () => {
      const user = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
      const channel = requestChannelCreate(authUser.token, 'name', false);
      requestStandupActive(user.token, channel.channelId, 403);
    });
  });

  describe('passes', () => {
    test('standup is inactive', () => {
      const channel = requestChannelCreate(authUser.token, 'name', false);
      const active = requestStandupActive(authUser.token, channel.channelId);
      expect(active).toStrictEqual(
        expect.objectContaining({
          isActive: false,
          timeFinish: null
        })
      );
    });
    test('standup is active', () => {
      const channel = requestChannelCreate(authUser.token, 'name', false);
      requestStandupStart(authUser.token, channel.channelId, 5);
      const active = requestStandupActive(authUser.token, channel.channelId);
      expect(active).toStrictEqual(
        expect.objectContaining({
          isActive: true,
          timeFinish: expect.any(Number)
        })
      );
    });
  });
});



describe('Testing standupSendV1', () => {
  const msg =  'Standup starting :)';
  describe('Active standups', () => {
    let channel: channelIdReturn;
    let isActiveStandup: activeStandup;

    beforeEach(() => {
      channel = requestChannelCreate(authUser.token, 'name', false);
      requestStandupStart(authUser.token, channel.channelId, 10, 200);
      isActiveStandup = requestStandupActive(authUser.token, channel.channelId, 200);
      expect(isActiveStandup.isActive).toStrictEqual(true);
    });
    describe('Error cases', () => {
      test('invalid token', () => {
        requestStandupSend('bad', channel.channelId, msg, 403);
      });
      test('channelId is valid but auth user is not a member of the channel', () => {
        const authUser2 = requestAuthRegister(email2, password2, nameFirst2, nameLast2);
        requestStandupSend(authUser2.token, channel.channelId, msg, 403); 
      });
      test('invalid channelId', () => {
        requestStandupSend(authUser.token, channel.channelId + 1, msg, 400);
      });
      test('length of message is more than 1000', () => {
        const longMsg = 'a'.repeat(1001);
        requestStandupSend(authUser.token, channel.channelId, longMsg, 400);
      });
    });
    describe('Passes cases', () => {
      test('Message is sent by the user', () => {
        expect(requestStandupSend(authUser.token, channel.channelId, msg, 200)).toStrictEqual({});
        const channelMsg = requestChannelMessages(authUser.token, channel.channelId, 0, 200);
        const packedMsg = `${handleStr}: ${msg}`;
        // CHANGE THIS CASE WHEN NESSAGE/PIN IS IMPLEMENTED
        expect(channelMsg).toStrictEqual({
          messages: [{
            messageId: expect.any(Number),
            uId: authUser.authUserId,
            message: packedMsg,
            timeSent: expect.any(Number)
          }],
          start: 0,
          end: -1
        });
        // TEST CASE NO @ should be parsed as proper tags
      });
    });
  });
  describe('Inactive standups', () => {
    const channel = requestChannelCreate(authUser.token, 'name', false);
    const isActiveStandup = requestStandupActive(authUser.token, channel.channelId, 200);
    expect(isActiveStandup.isActive).toStrictEqual(false);
    requestStandupSend(authUser.token, channel.channelId, msg, 400);
  });
});
