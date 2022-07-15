import { authUserReturn, requestAuthRegister, errorMsg, requestClear } from './helperTests';
import { requestDmCreate, requestDmLeave, requestDmList, requestDmDetails, requestDmRemove } from './helperTests';

const email = 'hayden@gmail.com';
const password = 'hayden123';
const nameFirst = 'Hayden';
const nameLast = 'Smith';

let authUser: authUserReturn;

beforeEach(() => {
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

describe('Testing dm/details/v1', () => {
  test('dmId does not refer to a valid DM', () => {
    const dm = -1;
    const dmDetail = requestDmDetails(authUser.token, dm);
    expect(dmDetail).toStrictEqual(errorMsg);
  });

  test('dmId is valid and the authorised user is not a member of the DM', () => {
    const authUser2 = requestAuthRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds = [];
    uIds.push(uId1.authUserId);
    const dm = requestDmCreate(authUser.token, uIds);
    const dmDetail = requestDmDetails(authUser2.token, dm);
    expect(dmDetail).toStrictEqual(errorMsg);
  });

  test('Valid inputs', () => {
    const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds = [];
    uIds.push(uId1.authUserId);
    const dm = requestDmCreate(authUser.token, uIds);
    const dmDetail = requestDmDetails(authUser.token, dm.dmId);
    expect(dmDetail).toStrictEqual({
      name: 'haydensmith, namefirst1namelast1',
      members: [
        {
          email: 'hayden@gmail.com',
          handleStr: 'haydensmith',
          nameFirst: 'Hayden',
          nameLast: 'Smith',
          uId: 0,
        },
        {
          email: 'email1@email.com',
          handleStr: 'namefirst1namelast1',
          nameFirst: 'nameFirst1',
          nameLast: 'nameLast1',
          uId: 1,
        },
      ],
    });
  });
});

describe('Testing dm/list/v1', () => {
  test('0 dms, empty list', () => {
    const dmList = requestDmList(authUser.token);
    console.log(dmList);
    expect(dmList).toStrictEqual([]);
  });

  test('1 dm', () => {
    const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds = [];
    uIds.push(uId1.authUserId);
    const dm = requestDmCreate(authUser.token, uIds);
    const dmList = requestDmList(authUser.token);
    expect(dmList).toStrictEqual({ 
      dms: [{
        dmId: dm.dmId,
        name: 'namefirst0namelast0, namefirst1namelast1',
      }]
    });
  });

  test('2 dms', () => {
    const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds1 = [];
    uIds1.push(uId1.authUserId);
    const dm1 = requestDmCreate(authUser.token, uIds1);

    const uId2 = requestAuthRegister('email3@email.com', 'password3', 'nameFirst3', 'nameLast3');
    const uIds2 = [];
    uIds2.push(uId2.authUserId);
    const dm2 = requestDmCreate(authUser.token, uIds2);

    const dmList = requestDmList(authUser.token);
    expect(dmList).toStrictEqual({ 
      dms : [{
        dmId: dm1.dmId,
        name: 'namefirst0namelast0, namefirst1namelast1',
      },
      {
        dmId: dm2.dmId,
        name: 'namefirst2namelast2, namefirst3namelast3',
      }]
    });
  });
});

describe('Testing dm/remove/v1', () => {
  test('dmId does not refer to a valid DM', () => {
    const dm = -1;
    const dmRemove = requestDmRemove(authUser.token, dm);
    expect(dmRemove).toStrictEqual(errorMsg);
  });

  test('dmId is valid and the autyhorised user is not the original DM creator', () => {
    const authUser2 = requestAuthRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds = [];
    uIds.push(uId1.authUserId);
    const dm = requestDmCreate(authUser.token, uIds);
    const dmRemove = requestDmRemove(authUser2.token, dm);
    expect(dmRemove).toStrictEqual(errorMsg);
  });

  test('dmId is valid and the authorised user is no longer in the DM', () => {
    // Need dm/leave for it to work
    const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds = [];
    uIds.push(uId1.authUserId);
    const dm = requestDmCreate(authUser.token, uIds);
    // const dmLeave = getRequestDmLeaveV1(authUser.token, dm.dmId); // UNCOMMENT AFTER IMPLEMENTING DM/LEAVE
    const dmRemove = requestDmRemove(authUser.token, dm);
    expect(dmRemove).toStrictEqual(errorMsg);
  });

  test('Valid inputs', () => {
    const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds = [];
    uIds.push(uId1.authUserId);
    const dm = requestDmCreate(authUser.token, uIds);
    const dmRemove = requestDmRemove(authUser.token, dm);
    expect(dmRemove).toStrictEqual({});
  });
});

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
