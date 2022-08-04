import { authUserReturn, requestAuthRegister, requestClear } from './helperTests';
import { removeFile } from './helperTests';
import { requestUserPermissionChange } from './helperTests';

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
/*
describe('Testing admin remove', () => {
    describe('Error Cases', () => {
        test('Invalid Token', () => {
            const user = requestAuthRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
            const channel1 = requestChannelCreate(authUser.token, 'channel1', true);
            requestChannelJoin(user.token, channel1.channelId);
            const channelMessage = requestMessageSend(authUser.token, channel1.channelId, 'message');
            requestAdminRemove('Invalid Token', user.uId, 403);
        });
        test('uId does not refer to a valid user', () => {
            const user = requestAuthRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
            const channel1 = requestChannelCreate(authUser.token, 'channel1', true);
            requestChannelJoin(user.token, channel1.channelId);
            const channelMessage = requestMessageSend(authUser.token, channel1.channelId, 'message');
            requestAdminRemove(authUser.token, -1, 400);
        });
        test('uId refers to user who is the only global owner', () => {
            const channel1 = requestChannelCreate(authUser.token, 'channel1', true);
            const channelMessage = requestMessageSend(authUser.token, channel1.channelId, 'message');
            requestAdminRemove(authUser.token, authUser.authUserId, 400);
        });
        test('User is not a global owner', () => {
            const user = requestAuthRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
            const channel1 = requestChannelCreate(authUser.token, 'channel1', true);
            requestChannelJoin(user.token, channel1.channelId);
            const channelMessage = requestMessageSend(authUser.token, channel1.channelId, 'message');
            requestAdminRemove(user.token, authUser.authUserId, 403);
        });
    });
    describe('Success cases', () => {
        test('Removing single user', () => {
            const user = requestAuthRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
            const channel1 = requestChannelCreate(authUser.token, 'channel1', true);
            requestChannelJoin(user.token, channel1.channelId);
            const channelMessage = requestMessageSend(user.token, channel1.channelId, 'message');
            requestAdminRemove(authUser.token, user.authUserId, 200);
        });
        test('Removing multiple users', () => {
            const user = requestAuthRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
            const user2 = requestAuthRegister('email3@email.com', 'password3', 'nameFirst3', 'nameLast3');
            const dm = requestDmCreate(authUser.token, [authUser.authUserId, user.authUserId]);
            const channel1 = requestChannelCreate(authUser.token, 'channel1', true);
            requestChannelJoin(user.token, channel1.channelId);
            const channelMessage = requestMessageSend(user.token, channel1.channelId, 'message');
            requestAdminRemove(authUser.token, user.authUserId, 200);

        });
    });
});
*/
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
