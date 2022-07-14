import { authUserReturn, requestAuthRegister, errorMsg, requestClear } from './helperTests';
import { requestDmCreate, requestDmLeave } from './helperTests';
import { removeSavedFile } from './helperTests';

const email = 'hayden@gmail.com';
const password = 'hayden123';
const nameFirst = 'Hayden';
const nameLast = 'Smith';

let authUser: authUserReturn;

// ========================================================================= //
// Wrapper Functions

// function getRequestDmDetails(token: number, dmId: number) {
//   const res = requestHelper('GET', '/dm/details/v1', { token, dmId });
//   expect(res.statusCode).toBe(OK);
//   return JSON.parse(String(res.getBody(('utf-8'))));
// }

// function getRequestDmRemove(token: number, dmId: number) {
//   const res = requestHelper('DELETE', '/dm/remove/v1', { token, dmId });
//   expect(res.statusCode).toBe(OK);
//   return JSON.parse(String(res.getBody(('utf-8'))));
// }

beforeEach(() => {
  removeSavedFile();
  requestClear();
  authUser = requestAuthRegister(email, password, nameFirst, nameLast);
});

// ========================================================================= //
// Testing

describe('Testing dm/create/v1', () => {
  test('Any uId in uIds does not refer to a valid user', () => {
    const uId1 = authUser.authUserId + 1;
    const uIds = [];
    uIds.push(uId1);
    const dm = requestDmCreate(authUser.token, uIds);
    expect(dm).toStrictEqual(errorMsg);
  });

  test('There are duplicate uIds in uIds', () => {
    const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uId2 = uId1;
    const uIds = [];
    uIds.push(uId1.authUserId);
    uIds.push(uId2.authUserId);
    const dm = requestDmCreate(authUser.token, uIds);
    expect(dm).toStrictEqual(errorMsg);
  });

  test('Valid inputs', () => {
    const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uId2 = requestAuthRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
    const uIds = [];
    uIds.push(uId1.authUserId);
    uIds.push(uId2.authUserId);
    const dm = requestDmCreate(authUser.token, uIds);
    expect(dm).toStrictEqual(
      expect.objectContaining({
        dmId: expect.any(Number),
      })
    );
  });
});
/*
describe('Testing dm/details/v1', () => {
  test('dmId does not refer to a valid DM', () => {
    const authUser = requestAuthRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const dm = -1;
    const dmDetail = getRequestDmDetails(authUser.token, dm);
    expect(dmDetail).toStrictEqual(1);
  });

  test('dmId is valid and the authorised user is not a member of the DM', () => {
    const authUser1 = requestAuthRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const authUser2 = requestAuthRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds = [];
    uIds.push(uId1.authUserId);
    const dm = requestDmCreate(authUser1.token, uIds);
    const dmDetail = getRequestDmDetails(authUser2.token, dm);
    expect(dmDetail).toStrictEqual(2);
  });

  test('Valid inputs', () => {
    const authUser = requestAuthRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds = [];
    uIds.push(uId1.authUserId);
    const dm = requestDmCreate(authUser.token, uIds);
    const dmDetail = getRequestDmDetails(authUser.token, dm.dmId);
    expect(dmDetail).toStrictEqual({
      dm: {
        name: 'namefirst0namelast0, namefirst1namelast1',
        members: [{
            "email": "email0@email.com",
            "handleStr": "namefirst0namelast0",
            "nameFirst": "namefirst0",
            "nameLast": "namelast0",
            "uId": 0,
          }, {
            "email": "email1@email.com",
            "handleStr": "namefirst1namelast1",
            "nameFirst": "namefirst1",
            "nameLast": "namelast1",
            "uId": 1,
          }],
      }
    });
  });
});

describe('Testing dm/remove/v1', () => {
  test('dmId does not refer to a valid DM', () => {
    const authUser = requestAuthRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const dm = -1;
    const dmRemove = getRequestDmRemove(authUser.token, dm);
    expect(dmRemove).toStrictEqual(1);
  });

  test('dmId is valid and the autyhorised user is not the original DM creator', () => {
    const authUser1 = requestAuthRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const authUser2 = requestAuthRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds = [];
    uIds.push(uId1.authUserId);
    const dm = requestDmCreate(authUser1.token, uIds);
    const dmRemove = getRequestDmRemove(authUser2.token, dm);
    expect(dmRemove).toStrictEqual(2);
  });

  // test('dmId is valid and the authorised user is no longer in the DM', () => {
  //   // Not sure how to do this test
  // });

  test('Valid inputs', () => {
    const authUser = requestAuthRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds = [];
    uIds.push(uId1.authUserId);
    const dm = requestDmCreate(authUser.token, uIds);
    const dmRemove = getRequestDmRemove(authUser.token, dm);
    expect(dmRemove).toStrictEqual({});
  });
});
*/

describe('Testing dm/leave/v1', () => {
  describe('errors', () => {
    test('invalid token', () => {
      const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
      const uIds = [];
      uIds.push(uId1.authUserId);
      const dm = requestDmCreate(authUser.token, uIds);
      const token = 'bad';
      const dmLeave = requestDmLeave(token, dm.dmId);
      expect(dmLeave).toStrictEqual(errorMsg);
    });
    test('invalid dmId', () => {
      const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
      const uIds = [];
      uIds.push(uId1.authUserId);
      const dm = requestDmCreate(authUser.token, uIds);
      const dmLeave = requestDmLeave(authUser.token, dm.dmId + 1);
      expect(dmLeave).toStrictEqual(errorMsg);
    });
    test('authUser1 is not a member', () => {
      const authUser1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
      const uId1 = requestAuthRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
      const uIds = [];
      uIds.push(uId1.authUserId);
      const dm = requestDmCreate(authUser.token, uIds);
      const dmLeave = requestDmLeave(authUser1.token, dm.dmId);
      expect(dmLeave).toStrictEqual(errorMsg);
    });
  });
  describe('passes', () => {
    test('user leaves dm (is creator)', () => {
      const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
      const uIds = [];
      uIds.push(uId1.authUserId);
      const dm = requestDmCreate(authUser.token, uIds);
      const dmLeave = requestDmLeave(authUser.token, dm.dmId);
      expect(dmLeave).toStrictEqual({});
    });
    test('user leaves dm (not creator)', () => {
      const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
      const uIds = [];
      uIds.push(uId1.authUserId);
      const dm = requestDmCreate(authUser.token, uIds);
      const dmLeave = requestDmLeave(uId1.token, dm.dmId);
      expect(dmLeave).toStrictEqual({});
    });
  });
});
