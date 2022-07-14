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
function getRequestDmCreate(token: string, uIds: number[]) {
  const res = requestHelper('POST', '/dm/create/v1', { token, uIds });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody(('utf-8'))));
}

function getRequestDmDetails(token: string, dmId: number) {
  const res = requestHelper('GET', '/dm/details/v1', { token, dmId });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody(('utf-8'))));
}

function getRequestDmList(token: string) {
  const res = requestHelper('GET', '/dm/list/v1', { token });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody(('utf-8'))));
}

function getRequestDmRemove(token: number, dmId: number) {
  const res = requestHelper('DELETE', '/dm/remove/v1', { token, dmId });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody(('utf-8'))));
}

function getRequestRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = requestHelper('POST', '/auth/register/v2', {
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast
  });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody(('utf-8'))));
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
    const authUser = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const uId1 = authUser.authUserId + 1;
    const uIds = [];
    uIds.push(uId1);
    const dm = getRequestDmCreate(authUser.token, uIds);
    expect(dm).toStrictEqual(errorMsg);
  });

  test('There are duplicate uIds in uIds', () => {
    const authUser = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const uId1 = getRequestRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uId2 = uId1;
    const uIds = [];
    uIds.push(uId1.authUserId);
    uIds.push(uId2.authUserId);
    const dm = getRequestDmCreate(authUser.token, uIds);
    expect(dm).toStrictEqual(errorMsg);
  });

  test('Valid inputs', () => {
    const authUser = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const uId1 = getRequestRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uId2 = getRequestRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
    const uIds = [];
    uIds.push(uId1.authUserId);
    uIds.push(uId2.authUserId);
    const dm = getRequestDmCreate(authUser.token, uIds);
    expect(dm).toStrictEqual(
      expect.objectContaining({
        dmId: expect.any(Number),
      })
    );
  });
});

describe('Testing dm/details/v1', () => {
  test('dmId does not refer to a valid DM', () => {
    const authUser = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const dm = -1;
    const dmDetail = getRequestDmDetails(authUser.token, dm);
    expect(dmDetail).toStrictEqual(errorMsg);
  });

  test('dmId is valid and the authorised user is not a member of the DM', () => {
    const authUser1 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const authUser2 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const uId1 = getRequestRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds = [];
    uIds.push(uId1.authUserId);
    const dm = getRequestDmCreate(authUser1.token, uIds);
    const dmDetail = getRequestDmDetails(authUser2.token, dm);
    expect(dmDetail).toStrictEqual(errorMsg);
  });

  test('Valid inputs', () => {
    const authUser = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const uId1 = getRequestRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds = [];
    uIds.push(uId1.authUserId);
    const dm = getRequestDmCreate(authUser.token, uIds);
    const dmDetail = getRequestDmDetails(authUser.token, dm);
    expect(dmDetail).toEqual(
      {
        dm: {
          name: 'namefirst0namelast0, namefirst1namelast1',
          members: [
            {
              email: 'email0@email.com',
              handleStr: 'namefirst0namelast0',
              nameFirst: 'namefirst0',
              nameLast: 'namelast0',
              uId: 0,
            },
            {
              email: 'email1@email.com',
              handleStr: 'namefirst1namelast1',
              nameFirst: 'namefirst1',
              nameLast: 'namelast1',
              uId: 1,
            },
          ],
        }
      });
  });
});

describe('Testing dm/list/v1', () => {
  test('0 dms, empty list', () => {
    const authUser = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const dmList = getRequestDmList(authUser.token);
    expect(dmList).toStrictEqual([]);
  });

  test('1 dm', () => {
    const authUser = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const uId1 = getRequestRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds = [];
    uIds.push(uId1.authUserId);
    const dm = getRequestDmCreate(authUser.token, uIds);
    const dmList = getRequestDmList(authUser.token);
    expect(dmList).toStrictEqual([
      {
        dmId: dm.dmId,
        name: 'namefirst0namelast0, namefirst1namelast1',
      }]
    );
  });

  test('2 dms', () => {
    const authUser1 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const uId1 = getRequestRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds1 = [];
    uIds1.push(uId1.authUserId);
    const dm1 = getRequestDmCreate(authUser1.token, uIds1);

    const authUser2 = getRequestRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
    const uId2 = getRequestRegister('email3@email.com', 'password3', 'nameFirst3', 'nameLast3');
    const uIds2 = [];
    uIds2.push(uId2.authUserId);
    const dm2 = getRequestDmCreate(authUser2.token, uIds2);

    const dmList = getRequestDmList(authUser1.token);
    expect(dmList).toStrictEqual([
      {
        dmId: dm1.dmId,
        name: 'namefirst0namelast0, namefirst1namelast1',
      },
      {
        dmId: dm2.dmId,
        name: 'namefirst2namelast2, namefirst3namelast3',
      }]
    );
  });
});

describe('Testing dm/remove/v1', () => {
  test('dmId does not refer to a valid DM', () => {
    const authUser = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const dm = -1;
    const dmRemove = getRequestDmRemove(authUser.token, dm);
    expect(dmRemove).toStrictEqual(errorMsg);
  });

  test('dmId is valid and the authorised user is not the original DM creator', () => {
    const authUser1 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const authUser2 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const uId1 = getRequestRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds = [];
    uIds.push(uId1.authUserId);
    const dm = getRequestDmCreate(authUser1.token, uIds);
    const dmRemove = getRequestDmRemove(authUser2.token, dm);
    expect(dmRemove).toStrictEqual(errorMsg);
  });

  test('dmId is valid and the authorised user is no longer in the DM', () => {
    // Need dm/leave for it to work
    const authUser = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const uId1 = getRequestRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds = [];
    uIds.push(uId1.authUserId);
    const dm = getRequestDmCreate(authUser.token, uIds);
    // const dmLeave = getRequestDmLeaveV1(authUser.token, dm.dmId); // UNCOMMENT AFTER IMPLEMENTING DM/LEAVE
    const dmRemove = getRequestDmRemove(authUser.token, dm);
    expect(dmRemove).toStrictEqual(errorMsg);
  });

  test('Valid inputs', () => {
    const authUser = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const uId1 = getRequestRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds = [];
    uIds.push(uId1.authUserId);
    const dm = getRequestDmCreate(authUser.token, uIds);
    const dmRemove = getRequestDmRemove(authUser.token, dm);
    expect(dmRemove).toStrictEqual({});
  });
});
