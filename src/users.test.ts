import request, { HttpVerb } from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const errorMsg = { error: 'error' };

function requestHelper(method: HttpVerb, path: string, payload: object) {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    json = payload;
  }
  return request(method, url + ':' + port + path, { qs, json });
}

// ========================================================================= //
// Wrapper Functions

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = requestHelper('POST', '/auth/register/v2', {
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast
  });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}
function requestUserSetName(token: string, nameFirst: string, nameLast: string) {
  const res = requestHelper('PUT', '/user/profile/setname/v1', { token, nameFirst, nameLast });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}
function requestUserEmail(token: string, email: string) {
  const res = requestHelper('PUT', '/user/profile/setemail/v1', { token, email });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}
function requestUserHandle(token: string, handleStr: string) {
  const res = requestHelper('PUT', '/user/profile/sethandle/v1', { token, handleStr });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

function requestUserProfile(token: string, uId: number) {
  const res = requestHelper('GET', '/user/profile/v2', { token, uId });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

function requestAllUsers(token: string) {
  const res = requestHelper('GET', '/users/all/v1', { token });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}
function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

beforeEach(() => {
  requestClear();
});

describe('Testing userProfileV1', () => {
  test('Valid uId', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const uId = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const profile = requestUserProfile(authUser.token, uId.authUserId);
    expect(profile).toStrictEqual({
      user: {
        uId: uId.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'firstname2',
        nameLast: 'lastname2',
        handleStr: 'firstname2lastname2',
      }
    });
  });
  test('Invalid uId', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const uId = authUser.authUserId + 1;
    const profile = requestUserProfile(authUser.token, uId);
    expect(profile).toStrictEqual(errorMsg);
  });
});

describe('Testing userSetNameV1', () => {
  test('Valid Name', () => {
    const authUser = requestAuthRegister('email@gmail.com', 'password1', 'Dan', 'Smith');
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
    const authUser = requestAuthRegister('email@gmail.com', 'password1', 'Dan', 'Smith');
    const setEmailValidator = requestUserEmail(authUser.token, 'email@gmail.com');
    expect(setEmailValidator).toStrictEqual({});
  });
  test('Invalid Email', () => {
    const authUser = requestAuthRegister('email@gmail.com', 'password1', 'Dan', 'Smith');
    const setEmailValidator = requestUserEmail(authUser.token, 'email@gmail,com');
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
    const authUser = requestAuthRegister('email@gmail.com', 'password1', 'Dan', 'Smith');
    const setHandleValidator = requestUserHandle(authUser.token, 'dansmith');
    expect(setHandleValidator).toStrictEqual({});
  });
  test('Invalid Handle - Length too short', () => {
    const authUser = requestAuthRegister('email@gmail.com', 'password1', 'Dan', 'Smith');
    const setHandleValidator = requestUserHandle(authUser.token, '3r');
    expect(setHandleValidator).toStrictEqual(errorMsg);
  });
  test('Invalid Handle - Length too long', () => {
    const authUser = requestAuthRegister('email@gmail.com', 'password1', 'Dan', 'Smith');
    const setHandleValidator = requestUserHandle(authUser.token, '3r4ef3r4ef3r4ef3r4efu');
    expect(setHandleValidator).toStrictEqual(errorMsg);
  });
  test('Invalid Handle - contains characters that are non-alphanumeric', () => {
    const authUser = requestAuthRegister('email@gmail.com', 'password1', 'Dan', 'Smith');
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
      const authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
      const users = requestAllUsers(authUser.token);
      expect(users).toStrictEqual({
        users: [
          {
            uId: authUser.authUserId,
            email: 'email1@gmail.com',
            nameFirst: 'firstname1',
            nameLast: 'lastname1',
            handleStr: 'firstname1lastname1',
          }
        ]
      });
    });

    test('multiple users', () => {
      const authUser1 = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
      const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
      const authUser3 = requestAuthRegister('email3@gmail.com', 'password3', 'firstname3', 'lastname3');
      const users = requestAllUsers(authUser1.token);
      expect(users).toStrictEqual({
        users: [
          {
            uId: authUser1.authUserId,
            email: 'email1@gmail.com',
            nameFirst: 'firstname1',
            nameLast: 'lastname1',
            handleStr: 'firstname1lastname1',
          },
          {
            uId: authUser2.authUserId,
            email: 'email2@gmail.com',
            nameFirst: 'firstname2',
            nameLast: 'lastname2',
            handleStr: 'firstname2lastname2',
          },
          {
            uId: authUser3.authUserId,
            email: 'email3@gmail.com',
            nameFirst: 'firstname3',
            nameLast: 'lastname3',
            handleStr: 'firstname3lastname3',
          }
        ]
      });
    });
  });

  test('Invalid uId', () => {
    const authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const uId = authUser.authUserId + 1;
    const profile = requestAllUsers(uId);
    expect(profile).toStrictEqual(errorMsg);
  });
});
