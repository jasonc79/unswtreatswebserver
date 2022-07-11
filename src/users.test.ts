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
  return requestHelper('GET', '/user/profile/v2', { token, uId });
}

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v2', {
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast
  });
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
