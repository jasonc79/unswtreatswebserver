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
type uId = { uId: number };
function getRequestDmCreate(token: number, uIds: uId[]) {
  return requestHelper('POST', '/dm/create/v1', { token, uIds });
}

function getRequestDmDetails(token: number, dmId: number) {
  return requestHelper('GET', 'dm/details/v1', { token, dmId });
}

function getRequestDmRemove(token: number, dmId: number) {
  return requestHelper('DELETE', 'dm/remove/v1', { token, dmId });
}

function getRequestRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v2', {
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast
  });
}

function getReqClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

beforeEach(() => {
  getReqClear();
});

// ========================================================================= //
// Testing

describe('Testing dm/create/v1', () => {
  test('Any uId in uIds does not refer to a valid user', () => {
    const res1 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const uId1 = authUser.authUserId + 1;
    const uId2 = authUser.authUserId + 2;
    const uIds = [];
    uIds.push(uId1);
    uIds.push(uId2);
    const res2 = getRequestDmCreate(authUser.token, uIds);
    const dm = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    expect(dm).toStrictEqual(errorMsg);
  });

  test('There are duplicate uIds in uIds', () => {
    const res1 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const uId1 = authUser.authUserId + 1;
    const uId2 = authUser.authUserId + 1;
    const uIds = [];
    uIds.push(uId1);
    uIds.push(uId2);
    const res2 = getRequestDmCreate(authUser.token, uIds);
    const dm = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    expect(dm).toStrictEqual(errorMsg);
  });

  test('Valid inputs', () => {
    const res1 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const res2 = getRequestRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uId1 = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const res3 = getRequestRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
    const uId2 = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    const uIds = [];
    uIds.push(uId1);
    uIds.push(uId2);
    const res4 = getRequestDmCreate(authUser.token, uIds);
    const dm = JSON.parse(String(res4.getBody(('utf-8'))));
    expect(res4.statusCode).toBe(OK);
    expect(dm).toStrictEqual(
      expect.objectContaining({
        dmId: expect.any(Number),
      })
    );
  });
});

describe('Testing dm/details/v1', () => {
  test('dmId does not refer to a valid DM', () => {
    const res1 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const dm = -1;
    const res2 = getRequestDmDetails(authUser.token, dm);
    const dmDetail = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    expect(dmDetail).toStrictEqual(errorMsg);
  });

  test('dmId is valid and the authorised user is not a member of the DM', () => {
    const res1 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const authUser1 = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const res2 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const authUser2 = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const res3 = getRequestRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uId1 = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    const uIds = [];
    uIds.push(uId1);
    const res4 = getRequestDmCreate(authUser1.token, uIds);
    const dm = JSON.parse(String(res4.getBody(('utf-8'))));
    expect(res4.statusCode).toBe(OK);
    const res5 = getRequestDmDetails(authUser2.token, dm);
    const dmDetail = JSON.parse(String(res5.getBody(('utf-8'))));
    expect(res5.statusCode).toBe(OK);
    expect(dmDetail).toStrictEqual(errorMsg);
  });

  test('Valid inputs', () => {
    const res1 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const res3 = getRequestRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uId1 = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    const uIds = [];
    uIds.push(uId1);
    const res4 = getRequestDmCreate(authUser.token, uIds);
    const dm = JSON.parse(String(res4.getBody(('utf-8'))));
    expect(res4.statusCode).toBe(OK);
    const res5 = getRequestDmDetails(authUser.token, dm);
    const dmDetail = JSON.parse(String(res5.getBody(('utf-8'))));
    expect(res5.statusCode).toBe(OK);
    expect(dmDetail).toStrictEqual({
      dm: {
        name: 'nameFirst0nameLast0, nameFirst1nameLast1',
        members: [authUser, uId1],
      }
    });
  });
});

describe('Testing dm/remove/v1', () => {
  test('dmId does not refer to a valid DM', () => {
    const res1 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const dm = -1;
    const res2 = getRequestDmRemove(authUser.token, dm);
    const dmRemove = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    expect(dmRemove).toStrictEqual(errorMsg);
  });

  test('dmId is valid and the autyhorised user is not the original DM creator', () => {
    const res1 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const authUser1 = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const res2 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const authUser2 = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const res3 = getRequestRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uId1 = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    const uIds = [];
    uIds.push(uId1);
    const res4 = getRequestDmCreate(authUser1.token, uIds);
    const dm = JSON.parse(String(res4.getBody(('utf-8'))));
    expect(res4.statusCode).toBe(OK);
    const res5 = getRequestDmRemove(authUser2.token, dm);
    const dmRemove = JSON.parse(String(res5.getBody(('utf-8'))));
    expect(res5.statusCode).toBe(OK);
    expect(dmRemove).toStrictEqual(errorMsg);
  });

  test('dmId is valid and the authorised user is no longer in the DM', () => {
    // Not sure how to do this test
  });

  test('Valid inputs', () => {
    const res1 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const res3 = getRequestRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uId1 = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    const uIds = [];
    uIds.push(uId1);
    const res4 = getRequestDmCreate(authUser.token, uIds);
    const dm = JSON.parse(String(res4.getBody(('utf-8'))));
    expect(res4.statusCode).toBe(OK);
    const res5 = getRequestDmRemove(authUser.token, dm);
    const dmRemove = JSON.parse(String(res5.getBody(('utf-8'))));
    expect(res5.statusCode).toBe(OK);
    expect(dmRemove).toStrictEqual({});
  });
});
