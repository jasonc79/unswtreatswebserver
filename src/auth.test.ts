import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const errorMsg = {error: 'error'};

const email0 = 'email@gmail.com';
const password0 = 'password';
const nameFirst0 = 'firstname'; // 17 characters
const nameLast0 = 'lastname';

const email1 = 'email2@gmail.com';
const password1 = 'password2';
const nameFirst1 = 'firstname2'; // 17 characters
const nameLast1 = 'lastname2';

const longName = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy';
const exactly50CharName = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx';

function getRequestRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v2`, {
      body: JSON.stringify({
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast
      }),
      headers: { 'Content-type': 'application/json'}
    }
  );
  return res;
}

function getReqAuthLogin(email: string, password: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/login/v2`, {
      body: JSON.stringify({
        email: email,
        password: password,
      }),
      headers: { 'Content-type': 'application/json'}
    }
  );
  return res;
}


function getReqClear() {
  const res = request(
    'DELETE',
    `${url}:${port}/clear/v1`
  );
  return res;
}

beforeEach(()=> {
  getReqClear();
});


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
    const authUser =JSON.parse(String(res2.getBody()));
    expect(res2.statusCode).toBe(OK);
    expect(authUser).toStrictEqual(
      expect.objectContaining({
        token: expect.any(String),
        authUserId: expect.any(Number)
      })
    );
  })
});
  