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
  return requestHelper('POST', '/auth/register/v2', {
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast
  });
}

function requestUserProfile(token: string, uId: number) {
  return requestHelper('GET', '/user/profile/v2', { token, uId });
}

function requestAllUsers(token: string) {
  return requestHelper('GET', '/users/all/v1', { token });
}
function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

beforeEach(() => {
  requestClear();
});

describe('Testing userProfileV1', () => {
  test('Valid uId', () => {
    const res1 = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const res2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const uId = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const res3 = requestUserProfile(authUser.token, uId.authUserId);
    const profile = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
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
    const res1 = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const uId = authUser.authUserId + 1;
    const res2 = requestUserProfile(authUser.token, uId);
    const profile = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    expect(profile).toStrictEqual(errorMsg);
  });
});

describe('Testing usersAllV1', () => {
  describe('Valid Token', () => {
    test('one user', () => {
      const res1 = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
      const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
      expect(res1.statusCode).toBe(OK);
      const res2 = requestAllUsers(authUser.token);
      const users = JSON.parse(String(res2.getBody(('utf-8'))));
      expect(res2.statusCode).toBe(OK);
      expect(users).toStrictEqual({
        users: [
          {
            uId: authUser.authUserId,
            email: 'email1@gmail.com',
            nameFirst: 'firstname1',
            nameLast: 'lastname1',
            handleStr: 'firstname1lastname1',
            token: authUser.token,
            password: 'password1',
            permissionId: 1,
          }
        ]
      });
    });

    test('multiple users', () => {
      const res1 = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
      const authUser1 = JSON.parse(String(res1.getBody(('utf-8'))));
      expect(res1.statusCode).toBe(OK);
      const res2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
      const authUser2 = JSON.parse(String(res2.getBody(('utf-8'))));
      expect(res2.statusCode).toBe(OK);
      const res3 = requestAuthRegister('email3@gmail.com', 'password3', 'firstname3', 'lastname3');
      const authUser3 = JSON.parse(String(res3.getBody(('utf-8'))));
      expect(res3.statusCode).toBe(OK);
      const res4 = requestAllUsers(authUser1.token);
      const users = JSON.parse(String(res4.getBody(('utf-8'))));
      expect(res4.statusCode).toBe(OK);
      expect(users).toStrictEqual({
        users: [
          {
            uId: authUser1.authUserId,
            email: 'email1@gmail.com',
            nameFirst: 'firstname1',
            nameLast: 'lastname1',
            handleStr: 'firstname1lastname1',
            token: authUser1.token,
            password: 'password1',
            permissionId: 1,
          },
          {
            uId: authUser2.authUserId,
            email: 'email2@gmail.com',
            nameFirst: 'firstname2',
            nameLast: 'lastname2',
            handleStr: 'firstname2lastname2',
            token: authUser2.token,
            password: 'password2',
            permissionId: 2,
          },
          {
            uId: authUser3.authUserId,
            email: 'email3@gmail.com',
            nameFirst: 'firstname3',
            nameLast: 'lastname3',
            handleStr: 'firstname3lastname3',
            token: authUser3.token,
            password: 'password3',
            permissionId: 2,
          }
        ]
      });
    });
  })
  
  test('Invalid uId', () => {
    const res1 = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const uId = authUser.authUserId + 1;
    const res2 = requestUserProfile(authUser.token, uId);
    const profile = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    expect(profile).toStrictEqual(errorMsg);
  });
});
