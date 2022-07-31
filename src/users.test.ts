import { authUserReturn, requestAuthRegister, errorMsg, requestClear } from './helperTests';
import { requestUserSetName, requestUserEmail, requestUserHandle, requestAllUsers, requestUserProfile } from './helperTests';
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

describe('Testing userProfileV1', () => {
  test('Valid uId', () => {
    const uId = requestAuthRegister(email2, password2, nameFirst2, nameLast2);
    const profile = requestUserProfile(authUser.token, uId.authUserId);
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
    const profile = requestUserProfile(authUser.token, uId);
    expect(profile).toStrictEqual(errorMsg);
  });
});

describe('Testing userSetNameV1', () => {
  test('Valid Name', () => {
    const setNameValidator = requestUserSetName(authUser.token, 'Dan', 'Smith');
    expect(setNameValidator).toStrictEqual({});
  });

  test('Invalid Name', () => {
    const authUser = requestAuthRegister('newEmail@gmail.com', 'password1', 'Dan', 'Smith');
    const nameFirst = 'A';
    const nameLast = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    const setNameValidator = requestUserSetName(authUser.token, nameFirst, nameLast);
    expect(setNameValidator).toStrictEqual(errorMsg);
  });
});

describe('Testing userSetEmailV1', () => {
  test('Valid Email', () => {
    const setEmailValidator = requestUserEmail(authUser.token, 'newEmail@gmail.com');
    expect(setEmailValidator).toStrictEqual({});
  });
  test('Invalid Email', () => {
    const authUser1 = requestAuthRegister('newEmail@gmail.com', 'password1', 'Dan', 'Smith');
    const setEmailValidator = requestUserEmail(authUser1.token, 'email@gmail,com');
    expect(setEmailValidator).toStrictEqual(errorMsg);
  });
  test('Invalid Email - Already being used by another user', () => {
    const authUser1 = requestAuthRegister('newEmail@gmail.com', 'password1', 'Dan', 'Smith', 200);
    requestAuthRegister('newEmail2@gmail.com', 'password2', 'Jason', 'Chen', 200);
    const setEmailValidator = requestUserEmail(authUser1.token, 'newEmail2@gmail.com');
    expect(setEmailValidator).toStrictEqual(errorMsg);
  });
});

describe('Testing userSetHandleV1', () => {
  test('Valid Handle', () => {
    const setHandleValidator = requestUserHandle(authUser.token, 'dansmith');
    expect(setHandleValidator).toStrictEqual({});
  });
  test('Invalid Handle - Length too short', () => {
    const setHandleValidator = requestUserHandle(authUser.token, '3r');
    expect(setHandleValidator).toStrictEqual(errorMsg);
  });
  test('Invalid Handle - Length too long', () => {
    const setHandleValidator = requestUserHandle(authUser.token, '3r4ef3r4ef3r4ef3r4efu');
    expect(setHandleValidator).toStrictEqual(errorMsg);
  });
  test('Invalid Handle - contains characters that are non-alphanumeric', () => {
    const setHandleValidator = requestUserHandle(authUser.token, '@#^@&#*&$');
    expect(setHandleValidator).toStrictEqual(errorMsg);
  });
  test('Invalid Email - Already being used by another user', () => {
    const authUser1 = requestAuthRegister('newemail@gmail.com', 'password1', 'Dan', 'Smith');
    requestAuthRegister('email1@gmail.com', 'password2', 'Jason', 'Chen');
    const sethandleValidator = requestUserEmail(authUser1.token, 'jasonchen');
    expect(sethandleValidator).toStrictEqual(errorMsg);
  });
});

describe('Testing usersAllV1', () => {
  describe('Valid Token', () => {
    test('one user', () => {
      const users = requestAllUsers(authUser.token);
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
      const authUser2 = requestAuthRegister(email2, password2, nameFirst2, nameLast2);
      const authUser3 = requestAuthRegister(email3, password3, nameFirst3, nameLast3);
      const users = requestAllUsers(authUser.token);
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
    const profile = requestUserProfile(authUser.token, uId);
    expect(profile).toStrictEqual(errorMsg);
  });
});

describe('Testing usersStats', () => {
  test('equal 0', () => {
    const stats = requestUsersStats(authUser.token, 200);
    expect(stats.utilizationRate).toStrictEqual(0);
  });
  test('Pass situation equal 1', () => {
    const authUser2 = requestAuthRegister(email2, password2, nameFirst2, nameLast2);
    const authUser3 = requestAuthRegister(email3, password3, nameFirst3, nameLast3);
    const authUser4 = requestAuthRegister(email4, password4, nameFirst4, nameLast4);
    const channel = requestChannelCreate(authUser.token, 'name', true);
    requestChannelJoin(authUser2.token, channel.channelId);
    requestChannelJoin(authUser3.token, channel.channelId);
    requestChannelJoin(authUser4.token, channel.channelId);
    const stats = requestUsersStats(authUser.token);
    expect(stats.utilizationRate).toStrictEqual('1');
  });
  test('Pass situation equal 1/2', () => {
    const authUser2 = requestAuthRegister(email2, password2, nameFirst2, nameLast2);
    const authUser3 = requestAuthRegister(email3, password3, nameFirst3, nameLast3);
    const authUser4 = requestAuthRegister(email4, password4, nameFirst4, nameLast4);
    const channel = requestChannelCreate(authUser.token, 'name', true);
    requestChannelJoin(authUser2.token, channel.channelId);
    const stats = requestUsersStats(authUser.token);
    expect(stats.utilizationRate).toStrictEqual('1/2');
  });
});

describe('Testing userStats', () => {
  test('equal 0', () => {
    const stats = requestUserStats(authUser.token, 200);
    expect(stats.involvementRate).toStrictEqual(0);
  });
  test('more than 1', () => {
    const authUser2 = requestAuthRegister(email2, password2, nameFirst2, nameLast2, 200);
    const authUser3 = requestAuthRegister(email3, password3, nameFirst3, nameLast3, 200);
    const authUser4 = requestAuthRegister(email4, password4, nameFirst4, nameLast4, 200);
    const channel = requestChannelCreate(authUser.token, 'name', true, 200);
    const channel2 = requestChannelCreate(authUser.token, 'name1', true, 200);
    const channel3 = requestChannelCreate(authUser.token, 'name2', true, 200);
    const channel4 = requestChannelCreate(authUser.token, 'name3', true, 200);
    requestMessageSend(authUser.token, channel.channelId, 'message4', 200);
    requestMessageSend(authUser.token, channel.channelId, 'message5', 200);
    const stats = requestUserStats(authUser.token, 200);
    expect(stats.involvementRate).toStrictEqual(1);
  });
  test('more than 0 less than 1', () => {
    const authUser2 = requestAuthRegister(email2, password2, nameFirst2, nameLast2, 200);
    const authUser3 = requestAuthRegister(email3, password3, nameFirst3, nameLast3, 200);
    const authUser4 = requestAuthRegister(email4, password4, nameFirst4, nameLast4, 200);
    const channel = requestChannelCreate(authUser.token, 'name', true, 200);
    const channel2 = requestChannelCreate(authUser.token, 'name1', true, 200);
    const channel3 = requestChannelCreate(authUser2.token, 'name2', true, 200);
    const channel4 = requestChannelCreate(authUser2.token, 'name3', true, 200);
    requestMessageSend(authUser.token, channel.channelId, 'message4', 200);
    requestMessageSend(authUser.token, channel.channelId, 'message5', 200);
    const stats = requestUserStats(authUser.token, 200);
    expect(stats.involvementRate).toStrictEqual(any(Number));
  });
});