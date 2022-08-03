import { requestChannelCreate, requestChannelJoin, requestUserSetName, requestMessageSend, requestUserEmail, requestUserHandle, requestAllUsers, requestUserProfile, requestUserStats, requestUsersStats } from './helperTests';
import { authUserReturn, requestAuthRegister, requestClear } from './helperTests';
import { removeFile } from './helperTests';

const email = 'email@gmail.com';
const password = 'password';
const nameFirst = 'firstname';
const nameLast = 'lastname';
const handleStr = 'firstnamelastname';

const email2 = 'email2@gmail.com';
const password2 = 'password2';
const nameFirst2 = 'firstname2';
const nameLast2 = 'lastname2';
const handleStr2 = 'firstname2lastname2';

const email3 = 'email3@gmail.com';
const password3 = 'password3';
const nameFirst3 = 'firstname3';
const nameLast3 = 'lastname3';
const handleStr3 = 'firstname3lastname3';

let authUser: authUserReturn;

beforeEach(() => {
  removeFile();
  requestClear();
  authUser = requestAuthRegister(email, password, nameFirst, nameLast);
});

afterEach(() => {
  removeFile();
  requestClear();
});

describe('Testing userProfileV3', () => {
  test('invalid token', () => {
    const uId = requestAuthRegister(email2, password2, nameFirst2, nameLast2, 200);
    requestUserProfile('invalidtoken', uId.authUserId, 403);
  });
  test('Valid uId', () => {
    const uId = requestAuthRegister(email2, password2, nameFirst2, nameLast2, 200);
    const profile = requestUserProfile(authUser.token, uId.authUserId, 200);
    expect(profile).toStrictEqual({
      user: {
        uId: uId.authUserId,
        email: email2,
        nameFirst: nameFirst2,
        nameLast: nameLast2,
        handleStr: handleStr2,
      }
    });
  });
  test('Invalid uId', () => {
    const uId = authUser.authUserId + 1;
    requestUserProfile(authUser.token, uId, 400);
  });
});

describe('Testing userSetNameV1', () => {
  test('invalid token', () => {
    requestUserSetName('invalidToken', nameFirst, nameLast, 403);
  });
  test('Valid Name', () => {
    requestUserSetName(authUser.token, nameFirst2, nameLast2, 200);
  });

  test('Invalid Name - Last name too long', () => {
    const authUser = requestAuthRegister('newEmail@gmail.com', 'password1', 'Dan', 'Smith');
    const nameFirst = 'A';
    const nameLast = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    requestUserSetName(authUser.token, nameFirst, nameLast, 400);
  });
  test('Invalid Name - First name too long', () => {
    const authUser = requestAuthRegister('newEmail@gmail.com', 'password1', 'Dan', 'Smith');
    const nameFirst = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    const nameLast = 'A';
    requestUserSetName(authUser.token, nameFirst, nameLast, 400);
  });
});

describe('Testing userSetEmailV1', () => {
  test('invalid token', () => {
    requestUserEmail('invalidToken', 'newEmail@gmail.com', 403);
  });
  test('Valid Email', () => {
    const setEmailValidator = requestUserEmail(authUser.token, 'newEmail@gmail.com', 200);
    expect(setEmailValidator).toStrictEqual({});
  });
  test('Invalid Email', () => {
    requestUserEmail(authUser.token, 'email@gmail,com', 400);
  });
  test('Invalid Email - Already being used by another user', () => {
    const authUser1 = requestAuthRegister('newEmail@gmail.com', 'password1', 'Dan', 'Smith', 200);
    requestAuthRegister('newEmail2@gmail.com', 'password2', 'Jason', 'Chen', 200);
    requestUserEmail(authUser1.token, 'newEmail2@gmail.com', 400);
  });
});

describe('Testing userSetHandleV2', () => {
  test('invalid token', () => {
    requestUserHandle('invalidToken', 'validhandle', 403);
  });
  test('Valid Handle', () => {
    requestUserHandle(authUser.token, 'dansmith', 200);
  });
  test('Invalid Handle - Length too short', () => {
    requestUserHandle(authUser.token, '3r', 400);
  });
  test('Invalid Handle - Length too long', () => {
    requestUserHandle(authUser.token, '3r4ef3r4ef3r4ef3r4efu', 400);
  });
  test('Invalid Handle - contains characters that are non-alphanumeric', () => {
    requestUserHandle(authUser.token, '@#^@&#*&$', 400);
  });
  test('Invalid Email - Already being used by another user', () => {
    const authUser1 = requestAuthRegister('newemail@gmail.com', 'password1', 'Dan', 'Smith', 200);
    requestAuthRegister('email1@gmail.com', 'password2', 'Jason', 'Chen', 200);
    requestUserEmail(authUser1.token, 'jasonchen', 400);
  });
  test('Same handle as updated handle', () => {
    requestUserHandle(authUser.token, 'firstnamelastname', 400);
  });
});

describe('Testing usersAllV2', () => {
  test('invalid token', () => {
    requestAllUsers('invalidtoken', 403);
  });
  describe('Valid Token', () => {
    test('one user', () => {
      const users = requestAllUsers(authUser.token, 200);
      expect(users).toStrictEqual({
        users: [
          {
            uId: authUser.authUserId,
            email: email,
            nameFirst: nameFirst,
            nameLast: nameLast,
            handleStr: handleStr
          }
        ]
      });
    });

    test('multiple users', () => {
      const authUser2 = requestAuthRegister(email2, password2, nameFirst2, nameLast2, 200);
      const authUser3 = requestAuthRegister(email3, password3, nameFirst3, nameLast3, 200);
      const users = requestAllUsers(authUser.token, 200);
      expect(users).toStrictEqual({
        users: [
          {
            uId: authUser.authUserId,
            email: email,
            nameFirst: nameFirst,
            nameLast: nameLast,
            handleStr: handleStr
          },
          {
            uId: authUser2.authUserId,
            email: email2,
            nameFirst: nameFirst2,
            nameLast: nameLast2,
            handleStr: handleStr2,
          },
          {
            uId: authUser3.authUserId,
            email: email3,
            nameFirst: nameFirst3,
            nameLast: nameLast3,
            handleStr: handleStr3,
          }
        ]
      });
    });
  });

  test('Invalid uId', () => {
    const uId = authUser.authUserId + 1;
    requestUserProfile(authUser.token, uId, 400);
  });
});

describe('Testing usersStats', () => {
  test('equal 0', () => {
    const stats = requestUsersStats(authUser.token, 200);
    expect(stats.workspaceStats.utilizationRate).toStrictEqual(0);
  });
  test('Pass situation equal 1', () => {
    const authUser2 = requestAuthRegister(email2, password2, nameFirst2, nameLast2);
    const authUser3 = requestAuthRegister(email3, password3, nameFirst3, nameLast3);
    const channel = requestChannelCreate(authUser.token, 'name', true);
    requestChannelJoin(authUser2.token, channel.channelId);
    requestChannelJoin(authUser3.token, channel.channelId);
    const stats = requestUsersStats(authUser.token);
    expect(stats.utilizationRate).toStrictEqual('1');
  });
  test('Pass situation equal 1/2', () => {
    const authUser2 = requestAuthRegister(email2, password2, nameFirst2, nameLast2);
    requestAuthRegister(email3, password3, nameFirst3, nameLast3);
    const channel = requestChannelCreate(authUser.token, 'name', true);
    requestChannelJoin(authUser2.token, channel.channelId);
    const stats = requestUsersStats(authUser.token);
    expect(stats.utilizationRate).toStrictEqual('1/2');
  });
});

describe('Testing userStats', () => {
  test('equal 0', () => {
    const stats = requestUserStats(authUser.token, 200);
    expect(stats.userStats.involvementRate).toStrictEqual(0);
  });
  test('more than 1', () => {
    requestAuthRegister(email2, password2, nameFirst2, nameLast2, 200);
    requestAuthRegister(email3, password3, nameFirst3, nameLast3, 200);
    const channel = requestChannelCreate(authUser.token, 'name', true, 200);
    requestChannelCreate(authUser.token, 'name1', true, 200);
    requestChannelCreate(authUser.token, 'name2', true, 200);
    requestChannelCreate(authUser.token, 'name3', true, 200);
    requestMessageSend(authUser.token, channel.channelId, 'message4', 200);
    requestMessageSend(authUser.token, channel.channelId, 'message5', 200);
    const stats = requestUserStats(authUser.token, 200);
    expect(stats.involvementRate).toStrictEqual(1);
  });
//   test('more than 0 less than 1', () => {
//     const authUser2 = requestAuthRegister(email2, password2, nameFirst2, nameLast2, 200);
//     requestAuthRegister(email3, password3, nameFirst3, nameLast3, 200);
//     const channel = requestChannelCreate(authUser.token, 'name', true, 200);
//     requestChannelCreate(authUser.token, 'name1', true, 200);
//     requestChannelCreate(authUser2.token, 'name2', true, 200);
//     requestChannelCreate(authUser2.token, 'name3', true, 200);
//     requestMessageSend(authUser.token, channel.channelId, 'message4', 200);
//     requestMessageSend(authUser.token, channel.channelId, 'message5', 200);
//     const stats = requestUserStats(authUser.token, 200);
//     expect(stats.involvementRate).any(Number);
//   });
});
