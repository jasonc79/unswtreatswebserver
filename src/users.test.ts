import { authUserReturn, requestAuthRegister, errorMsg, requestClear } from './helperTests';
import { requestUserSetName, requestUserEmail, requestUserHandle, requestAllUsers, requestUserProfile } from './helperTests';
import { removeSavedFile } from './helperTests';

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
  removeSavedFile();
  requestClear();
  authUser = requestAuthRegister(email, password, nameFirst, nameLast);
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
    const authUser = requestAuthRegister('email@gmail.com', 'password1', 'Dan', 'Smith');
    const nameFirst = 'A';
    const nameLast = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    const setNameValidator = requestUserSetName(authUser.token, nameFirst, nameLast);
    expect(setNameValidator).toStrictEqual(errorMsg);
  });
});

describe('Testing userSetEmailV1', () => {
  test('Valid Email', () => {
    const setEmailValidator = requestUserEmail(authUser.token, 'email@gmail.com');
    expect(setEmailValidator).toStrictEqual({});
  });
  test('Invalid Email', () => {
    const authUser1 = requestAuthRegister('email@gmail.com', 'password1', 'Dan', 'Smith');
    const setEmailValidator = requestUserEmail(authUser1.token, 'email@gmail,com');
    expect(setEmailValidator).toStrictEqual(errorMsg);
  });
  test('Invalid Email - Already being used by another user', () => {
    const authUser1 = requestAuthRegister('email@gmail.com', 'password1', 'Dan', 'Smith');
    requestAuthRegister('email1@gmail.com', 'password2', 'Jason', 'Chen');
    const setEmailValidator = requestUserEmail(authUser1.token, 'email1@gmail.com');
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
    const authUser1 = requestAuthRegister('email@gmail.com', 'password1', 'Dan', 'Smith');
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
