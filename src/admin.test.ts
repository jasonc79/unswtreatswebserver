import { authUserReturn, requestAuthRegister, requestClear, requestChannelCreate, requestDmCreate, requestMessageSend, requestChannelJoin } from './helperTests';
import { removeFile } from './helperTests';
import { requestUserPermissionChange, requestAdminRemove, requestMessageSenddm, requestChannelMessages, requestUserProfile, requestDmMessages } from './helperTests';

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

describe('Testing admin remove', () => {
  describe('Error Cases', () => {
    test('Invalid Token', () => {
      const user = requestAuthRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
      requestAdminRemove('Invalid Token', user.uId, 403);
    });
    test('uId does not refer to a valid user', () => {
      requestAdminRemove(authUser.token, -1, 400);
    });
    test('uId refers to user who is the only global owner', () => {
      requestAdminRemove(authUser.token, authUser.authUserId, 400);
    });
    test('User is not a global owner', () => {
      const user = requestAuthRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
      requestAdminRemove(user.token, authUser.authUserId, 403);
    });
  });
  describe('Success cases', () => {
    test('Removing single user', () => {
      const user = requestAuthRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
      const channel1 = requestChannelCreate(authUser.token, 'channel1', true);
      requestChannelJoin(user.token, channel1.channelId);
      const message = requestMessageSend(user.token, channel1.channelId, 'message');
      requestAdminRemove(authUser.token, user.authUserId, 200);
      const channelMessages = requestChannelMessages(authUser.token, channel1.channelId, 0);
      expect(channelMessages).toStrictEqual(
        expect.objectContaining({
          messages: [
            {
              messageId: message.messageId,
              uId: user.authUserId,
              message: 'Removed User',
              timeSent: expect.any(Number),
              isPinned: false
            },
          ],
          start: 0,
          end: -1
        })
      );
      const userProfile = requestUserProfile(authUser.token, user.authUserId);
      expect(userProfile).toStrictEqual(
        expect.objectContaining({
          user: {
            uId: user.authUserId,
            email: '',
            nameFirst: 'Removed',
            nameLast: 'user',
            handleStr: ''
          }
        })
      );
    });
  });
  test('Removing multiple users', () => {
    const user = requestAuthRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
    const user2 = requestAuthRegister('email3@email.com', 'password3', 'nameFirst3', 'nameLast3');
    const dm = requestDmCreate(authUser.token, [user2.authUserId, user.authUserId]);
    const channel1 = requestChannelCreate(authUser.token, 'channel1', true);
    requestChannelJoin(user.token, channel1.channelId);
    requestChannelJoin(user2.token, channel1.channelId);
    const message1 = requestMessageSend(user.token, channel1.channelId, 'message');
    const message2 = requestMessageSend(user2.token, channel1.channelId, 'message1');
    const dmMessage1 = requestMessageSenddm(user.token, dm.dmId, 'message2');
    const dmMessage2 = requestMessageSenddm(user2.token, dm.dmId, 'message3');
    requestAdminRemove(authUser.token, user.authUserId, 200);
    requestAdminRemove(authUser.token, user2.authUserId, 200);
    const channelMessages = requestChannelMessages(authUser.token, channel1.channelId, 0);
    expect(channelMessages).toStrictEqual(
      expect.objectContaining({
        messages: [
          {
            messageId: message2.messageId,
            uId: user2.authUserId,
            message: 'Removed User',
            timeSent: expect.any(Number),
            isPinned: false
          },
          {
            messageId: message1.messageId,
            uId: user.authUserId,
            message: 'Removed User',
            timeSent: expect.any(Number),
            isPinned: false
          }
        ],
        start: 0,
        end: -1
      })
    );
    const dmMessages = requestDmMessages(authUser.token, dm.dmId, 0);
    expect(dmMessages).toStrictEqual(
      expect.objectContaining({
        messages: [
          {
            messageId: dmMessage2.messageId,
            uId: user2.authUserId,
            message: 'Removed User',
            timeSent: expect.any(Number),
            isPinned: false
          },
          {
            messageId: dmMessage1.messageId,
            uId: user.authUserId,
            message: 'Removed User',
            timeSent: expect.any(Number),
            isPinned: false
          }
        ],
        start: 0,
        end: -1
      })
    );
    const userProfile = requestUserProfile(authUser.token, user.authUserId);
    expect(userProfile).toStrictEqual(
      expect.objectContaining({
        user: {
          uId: user.authUserId,
          email: '',
          nameFirst: 'Removed',
          nameLast: 'user',
          handleStr: ''
        }
      })
    );
    const userProfile2 = requestUserProfile(authUser.token, user2.authUserId);
    expect(userProfile2).toStrictEqual(
      expect.objectContaining({
        user: {
          uId: user2.authUserId,
          email: '',
          nameFirst: 'Removed',
          nameLast: 'user',
          handleStr: ''
        }
      })
    );
  });
});

describe('Testing admin permission change', () => {
  describe('Error Cases', () => {
    test('Invalid Token', () => {
      const user = requestAuthRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
      requestUserPermissionChange('invalidToken', user.authUserId, 1, 403);
    });
    test('uId does not refer to a valid user', () => {
      requestUserPermissionChange(authUser.token, -1, 1, 400);
    });
    test('uId refers to user who is the only global owner and being demoted to user', () => {
      requestUserPermissionChange(authUser.token, authUser.authUserId, 2, 400);
    });
    test('PermissionId is invalid', () => {
      const user = requestAuthRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
      requestUserPermissionChange(authUser.token, user.authUserId, -1, 400);
    });
    test('User already has the permissions level of permissionId', () => {
      const user = requestAuthRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
      requestUserPermissionChange(authUser.token, user.authUserId, 2, 400);
    });
    test('Authorised user is not a global owner', () => {
      const user2 = requestAuthRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
      const user3 = requestAuthRegister('email3@email.com', 'password3', 'nameFirst3', 'nameLast3');
      requestUserPermissionChange(user2.token, user3.authUserId, 1, 403);
    });
  });
  describe('Success Cases', () => {
    test('Changing permission of single user', () => {
      const user2 = requestAuthRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
      requestUserPermissionChange(authUser.token, user2.authUserId, 1, 200);
    });
    test('Changing permission of multiple user', () => {
      const user2 = requestAuthRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
      const user3 = requestAuthRegister('email3@email.com', 'password3', 'nameFirst3', 'nameLast3');
      requestUserPermissionChange(authUser.token, user2.authUserId, 1, 200);
      requestUserPermissionChange(user2.token, user3.authUserId, 1, 200);
    });
  });
});
