import { authUserReturn, requestAuthRegister, errorMsg, requestClear } from './helperTests';
import { requestDmCreate, requestDmLeave, requestDmList, requestDmDetails, requestDmRemove } from './helperTests';

const email = 'email@email.com';
const password = 'password';
const nameFirst = 'first';
const nameLast = 'last';
const handleStr = 'firstlast';

const email2 = 'email2@email.com';
const password2 = 'password2';
const nameFirst2 = 'first2';
const nameLast2 = 'last2';

const uIdEmail = 'uid@email.com';
const uIdPassword = 'password2';
const uIdFirst = 'uid1First';
const uIdLast = 'uid1Last';
const uIdHandleStr = 'uid1firstuid1last';

const uId2Email = 'uid2@email.com';
const uId2Password = 'password2';
const uId2First = 'uid2First';
const uId2Last = 'uid2Last';
const uId2HandleStr = 'uid2firstuid2last';
const handleStr23 = 'firstlast, uid1firstuid1last, uid2firstuid2last';


let authUser: authUserReturn;

beforeEach(() => {
  requestClear();
  authUser = requestAuthRegister(email, password, nameFirst, nameLast);
});

function generateUserIds() {
  const uId = requestAuthRegister(uIdEmail, uIdPassword, uIdFirst, uIdLast);
  const uId2 = requestAuthRegister(uId2Email, uId2Password, uId2First, uId2Last);
  const uIds = [];
  uIds.push(uId.authUserId);
  uIds.push(uId2.authUserId);
  return uIds;
}
// ========================================================================= //
// Testing

describe('Testing dm/create/v1', () => {
  test('Any uId in uIds does not refer to a valid user', () => {
    const uId = authUser.authUserId + 1;
    const uIds = []; 
    uIds.push(uId);
    const dm = requestDmCreate(authUser.token, uIds);
    expect(dm).toStrictEqual(errorMsg);
  });

  test('There are duplicate uIds in uIds', () => {
    const uId = requestAuthRegister(uIdEmail, uIdPassword, uIdFirst, uIdLast);
    const uIds = [];
    uIds.push(uId.authUserId);
    uIds.push(uId.authUserId);
    const dm = requestDmCreate(authUser.token, uIds);
    expect(dm).toStrictEqual(errorMsg);
  });

  test('Valid inputs', () => {
    const uIds = generateUserIds();
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
    const uIds = generateUserIds();
    const dmId = requestDmCreate(authUser.token, uIds);
    const dmDetail = requestDmDetails(authUser.token, dmId + 1);
    expect(dmDetail).toStrictEqual(errorMsg);
  });

  test('dmId is valid and the authorised user is not a member of the DM', () => {
    const uIds = generateUserIds();
    const authUser2 = requestAuthRegister(email2, password2, nameFirst2, nameLast2);
    const dm = requestDmCreate(authUser.token, uIds);
    const dmDetail = requestDmDetails(authUser2.token, dm.dmId);
    expect(dmDetail).toStrictEqual(errorMsg);
  });

  test('Valid inputs', () => {
    const uIds = generateUserIds();
    const dm = requestDmCreate(authUser.token, uIds);
    const dmDetail = requestDmDetails(authUser.token, dm.dmId);
    expect(dmDetail).toStrictEqual(
      expect.objectContaining({
        name: handleStr23,
        members: [
          {
            email: uIdEmail,
            handleStr: uIdHandleStr,
            nameFirst: uIdFirst,
            nameLast: uIdLast,
            uId: expect.any(Number),
          },
          {
            email: uId2Email,
            handleStr: uId2HandleStr,
            nameFirst: uId2First,
            nameLast: uId2Last,
            uId: expect.any(Number),
          },
        ],
      })
    );
  });
});
*/

describe('Testing dm/list/v1', () => {
  test('0 dms, empty list', () => {
    const dmList = requestDmList(authUser.token);
    expect(dmList).toStrictEqual({dms:[]});
  });

  test('1 dm', () => {
    const uIds = generateUserIds();
    const dm = requestDmCreate(authUser.token, uIds);
    const dmList = requestDmList(authUser.token);
    expect(dmList).toStrictEqual({ 
      dms: [{
        dmId: dm.dmId,
        name: handleStr23,
      }]
    });
  });

  test('2 dms', () => {
    const uIds1 = generateUserIds();
    const dm1 = requestDmCreate(authUser.token, uIds1);

    const uId2 = requestAuthRegister('email3@email.com', 'password3', 'nameFirst3', 'nameLast3');
    const uIds2 = [];
    uIds2.push(uId2.authUserId);
    const dm2 = requestDmCreate(authUser.token, uIds2);

    const dmList = requestDmList(authUser.token);
    expect(dmList).toStrictEqual({ 
      dms : [{
        dmId: dm1.dmId,
        name: handleStr23,
      },
      {
        dmId: dm2.dmId,
        name: 'firstlast, namefirst3namelast3',
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
    const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds = [];
    uIds.push(uId1.authUserId);
    const dm = requestDmCreate(authUser.token, uIds);
    const dmRemove = requestDmRemove(authUser.token, dm);
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

/*
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
      const uId1 = requestAuthRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
      const uIds = [];
      uIds.push(uId1.authUserId);
      const dm = requestDmCreate(authUser.token, uIds);
      const dmLeave = requestDmLeave(authUser.token, dm.dmId);
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
*/