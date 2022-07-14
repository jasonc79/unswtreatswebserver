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

function requestUserProfile(token: string, uId: number) {
  const res = requestHelper('GET', '/user/profile/v2', { token, uId });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

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
