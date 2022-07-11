import request, { HttpVerb } from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const errorMsg = { error: 'error' };

const email0 = 'email@gmail.com';
const password0 = 'password';
const nameFirst0 = 'firstname'; // 17 characters
const nameLast0 = 'lastname';

const email1 = 'email1@gmail.com';
const password1 = 'password2';
const nameFirst1 = 'firstname2'; // 17 characters
const nameLast1 = 'lastname2';

const longName = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy';
const exactly50CharName = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx';

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

function getRequestRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v2', {
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast
  });
}

function getReqAuthLogin(email: string, password: string) {
  return requestHelper('POST', '/auth/login/v2', {
    email: email,
    password: password,
  });
}

function requestUserProfile(token: string, uId: number) {
  return requestHelper('GET', '/user/profile/v2', { token, uId });
}

function getReqClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

beforeEach(() => {
  getReqClear();
});

// ========================================================================= //
// Testing handle
function testHandle(password: string, email: string, nameFirst: string, nameLast: string) {
  const res = getRequestRegister(email, password, nameFirst, nameLast);
  const authUser = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  const res2 = requestUserProfile(authUser.token, authUser.authUserId);
  expect(res2.statusCode).toBe(OK);
  return JSON.parse(String(res2.getBody()));
}

// ========================================================================= //
// Testing

describe('Testing auth/register/v2', () => {
  test('Invalid email (no @)', () => {
    const res = getRequestRegister('invalidEmail', password0, nameFirst0, nameLast0);
    const authUser = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(authUser).toEqual(errorMsg);
  });

  test('Invalid email (nothing after @)', () => {
    const res = getRequestRegister('invalidEmail@', password0, nameFirst0, nameLast0);
    const authUser = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(authUser).toEqual(errorMsg);
  });

  test('Email already exists', () => {
    const res = getRequestRegister(email0, password0, nameFirst0, nameLast0);
    const res2 = getRequestRegister(email0, password1, nameFirst1, nameLast1);
    const authUser = JSON.parse(String(res2.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(res2.statusCode).toBe(OK);
    expect(authUser).toEqual(errorMsg);
  });

  test('Password is less than 6 characters (5 characters)', () => {
    const res = getRequestRegister(email0, 'apple', nameFirst0, nameLast0);
    const authUser = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(authUser).toEqual(errorMsg);
  });

  test('Length of nameFirst is exactly 51 characters', () => {
    const res = getRequestRegister(email0, password0, longName, nameLast0);
    const authUser = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(authUser).toEqual(errorMsg);
  });

  test('nameFirst is an empty string', () => {
    const res = getRequestRegister(email0, password0, '', nameLast0);
    const authUser = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(authUser).toEqual(errorMsg);
  });

  test('Length of nameLast is exactly 51 characters', () => {
    const res = getRequestRegister(email0, password0, nameFirst0, longName);
    const authUser = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(authUser).toEqual(errorMsg);
  });

  test('nameLast is an empty string', () => {
    const res = getRequestRegister(email0, password0, nameFirst0, '');
    const authUser = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(authUser).toEqual(errorMsg);
  });

  test('Testing handle generation (exactly 20 characters)', () => {
    const nameFirst20 = 'abcdefghijklmnopqr';
    const nameLast20 = 'st';
    const email2 = 'email2@email.com';
    const handle0 = 'abcdefghijklmnopqrst0';
    const handle1 = 'abcdefghijklmnopqrst1';
    const res = getRequestRegister(email0, password0, nameFirst20, nameLast20);
    expect(res.statusCode).toBe(OK);
    const profile1 = testHandle(password0, email1, nameFirst20, nameLast20);
    const profile2 = testHandle(password0, email2, nameFirst20, nameLast20);

    expect(profile1).toStrictEqual({
      user: expect.objectContaining(
        {
          uId: expect.any(Number),
          email: email1,
          nameFirst: nameFirst20,
          nameLast: nameLast20,
          handleStr: handle0,
        }
      )
    }
    );

    expect(profile2).toStrictEqual({
      user: expect.objectContaining(
        {
          uId: expect.any(Number),
          email: email2,
          nameFirst: nameFirst20,
          nameLast: nameLast20,
          handleStr: handle1,
        }
      )
    }
    );
  });

  test('Testing handle generation (non-alphanumeric characters and > 20 characters)', () => {
    const nameFirstNonAlpha = '@bcdefgh!j';
    const nameLastNonAlpha = 'klmn opqrst';
    const email2 = 'email2@email.com';
    const handle0 = 'bcdefghjklmnopqrst0';
    const handle1 = 'bcdefghjklmnopqrst1';
    const res = getRequestRegister(email0, password0, nameFirstNonAlpha, nameLastNonAlpha);
    expect(res.statusCode).toBe(OK);
    const profile1 = testHandle(password0, email1, nameFirstNonAlpha, nameLastNonAlpha);
    const profile2 = testHandle(password0, email2, nameFirstNonAlpha, nameLastNonAlpha);

    expect(profile1).toStrictEqual({
      user: expect.objectContaining(
        {
          uId: expect.any(Number),
          email: email1,
          nameFirst: nameFirstNonAlpha,
          nameLast: nameLastNonAlpha,
          handleStr: handle0,
        }
      )
    }
    );

    expect(profile2).toStrictEqual({
      user: expect.objectContaining(
        {
          uId: expect.any(Number),
          email: email2,
          nameFirst: nameFirstNonAlpha,
          nameLast: nameLastNonAlpha,
          handleStr: handle1,
        }
      )
    }
    );
  });

  test('Testing handle generation (name ends in a number)', () => {
    const nameFirst = 'abc';
    const nameLast = 'def0';
    const email2 = 'email2@email.com';
    const handle0 = 'abcdef00';
    const handle1 = 'abcdef01';
    const res = getRequestRegister(email0, password0, nameFirst, nameLast);
    expect(res.statusCode).toBe(OK);
    const profile1 = testHandle(password0, email1, nameFirst, nameLast);
    const profile2 = testHandle(password0, email2, nameFirst, nameLast);

    expect(profile1).toStrictEqual({
      user: expect.objectContaining(
        {
          uId: expect.any(Number),
          email: email1,
          nameFirst: nameFirst,
          nameLast: nameLast,
          handleStr: handle0,
        }
      )
    }
    );

    expect(profile2).toStrictEqual({
      user: expect.objectContaining(
        {
          uId: expect.any(Number),
          email: email2,
          nameFirst: nameFirst,
          nameLast: nameLast,
          handleStr: handle1,
        }
      )
    }
    );
  });

  test('Correct return (nameFirst is exactly 50 characters)', () => {
    const res = getRequestRegister(email0, password0, exactly50CharName, nameLast0);
    const authUser = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(authUser).toEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
  });

  test('Correct return (nameLast is exactly 50 characters)', () => {
    const res = getRequestRegister(email0, password0, nameFirst0, exactly50CharName);
    const authUser = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(authUser).toStrictEqual(
      expect.objectContaining({
        token: expect.any(String),
        authUserId: expect.any(Number)
      })
    );
  });

  test('Correct return (Password is exactly 6 characters)', () => {
    const res = getRequestRegister(email0, 'apples', nameFirst0, nameLast0);
    const authUser = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(authUser).toStrictEqual(
      expect.objectContaining({
        token: expect.any(String),
        authUserId: expect.any(Number)
      })
    );
  });

  test('Correct return (password is more than 6 characters)', () => {
    const res = getRequestRegister(email0, password0, nameFirst0, nameLast0);
    const authUser = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(authUser).toStrictEqual(
      expect.objectContaining({
        token: expect.any(String),
        authUserId: expect.any(Number)
      })
    );
  });
});

describe('Testing authLoginV1', () => {
  test('Email does not exist', () => {
    const res = getReqAuthLogin(email0, password0);
    const authUser = JSON.parse(String(res.getBody()));
    expect(res.statusCode).toBe(OK);
    expect(authUser).toStrictEqual(errorMsg);
  });

  test('Incorrect password', () => {
    const res = getRequestRegister(email0, password0, nameFirst0, nameLast0);
    expect(res.statusCode).toBe(OK);

    const res2 = getReqAuthLogin(email0, 'wrongPassword');
    const authUser = JSON.parse(String(res2.getBody()));
    expect(res2.statusCode).toBe(OK);
    expect(authUser).toStrictEqual(errorMsg);
  });

  test('Correct return', () => {
    const res = getRequestRegister(email0, password0, nameFirst0, nameLast0);
    expect(res.statusCode).toBe(OK);

    const res2 = getReqAuthLogin(email0, password0);
    const authUser = JSON.parse(String(res2.getBody()));
    expect(res2.statusCode).toBe(OK);
    expect(authUser).toStrictEqual(
      expect.objectContaining({
        token: expect.any(String),
        authUserId: expect.any(Number)
      })
    );
  });
});
