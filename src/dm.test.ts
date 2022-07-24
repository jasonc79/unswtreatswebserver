import { authUserReturn, requestAuthRegister, errorMsg, requestClear, requestDmList, requestDmCreate, requestDmMessages, requestMessageSenddm, requestDmDetails } from './helperTests';
import { requestDmLeave, requestDmRemove } from './helperTests';
import { removeFile } from './helperTests';

// requestDmDetails
const email = 'email@email.com';
const password = 'password';
const nameFirst = 'first';
const nameLast = 'last';

const uIdEmail = 'uid@email.com';
const uIdPassword = 'password2';
const uIdFirst = 'uid1First';
const uIdLast = 'uid1Last';

const uId2Email = 'uid2@email.com';
const uId2Password = 'password2';
const uId2First = 'uid2First';
const uId2Last = 'uid2Last';

const handleStr23 = 'firstlast, uid1firstuid1last, uid2firstuid2last';

let authUser: authUserReturn;

beforeEach(() => {
  removeFile();
  requestClear();
  authUser = requestAuthRegister(email, password, nameFirst, nameLast);
});

afterEach(() => {
  removeFile();
  requestClear();
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

  test('Invalid token', () => {
    const uIds = generateUserIds();
    const token = 'bad';
    const dm = requestDmCreate(token, uIds);
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

describe('Testing dm/details/v1', () => {
  test('dmId does not refer to a valid DM', () => {
    const authUser = requestAuthRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const dm = -1;
    const dmDetail = requestDmDetails(authUser.token, dm);
    expect(dmDetail).toStrictEqual(errorMsg);
  });

  test('dmId is valid and the authorised user is not a member of the DM', () => {
    const authUser2 = requestAuthRegister('email1@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const uId1 = requestAuthRegister('email2@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds = [];
    uIds.push(uId1.authUserId);
    const dm = requestDmCreate(authUser.token, uIds);
    const dmDetail = requestDmDetails(authUser2.token, dm);
    expect(dmDetail).toStrictEqual(errorMsg);
  });

  test('Valid inputs', () => {
    const authUser = requestAuthRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    const uId1 = requestAuthRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    const uIds = [];
    uIds.push(uId1.authUserId);
    const dm = requestDmCreate(authUser.token, uIds);
    const dmDetail = requestDmDetails(authUser.token, dm.dmId);
    expect(dmDetail).toStrictEqual(
      {
        name: 'namefirst0namelast0, namefirst1namelast1',
        members: [{
          email: 'email0@email.com',
          handleStr: 'namefirst0namelast0',
          nameFirst: 'nameFirst0',
          nameLast: 'nameLast0',
          uId: authUser.authUserId,
        }, {
          email: 'email1@email.com',
          handleStr: 'namefirst1namelast1',
          nameFirst: 'nameFirst1',
          nameLast: 'nameLast1',
          uId: uId1.authUserId,
        }],
      }
    );
  });
});

describe('Testing dm/list/v1', () => {
  test('0 dms, empty list', () => {
    const dmList = requestDmList(authUser.token);
    expect(dmList).toStrictEqual({ dms: [] });
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
      dms: [{
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
    const dmRemove = requestDmRemove(authUser.token, dm.dmId);
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

describe('Testing dmMessagesV1', () => {
  test('Empty messages', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const uIds = [];
    uIds.push(authUser2.authUserId);
    const dm = requestDmCreate(authUser.token, uIds);
    expect(dm).toStrictEqual({ dmId: dm.dmId });
    const messages = requestDmMessages(authUser2.token, dm.dmId, 0);
    expect(messages).toStrictEqual(
      expect.objectContaining({
        messages: [],
        start: 0,
        end: -1,
      })
    );
  });
  test('Contains 50 messages', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const uIds = [];
    uIds.push(authUser2.authUserId);
    const dm = requestDmCreate(authUser.token, uIds);
    expect(dm).toStrictEqual({ dmId: dm.dmId });
    for (let i = 0; i < 60; i++) {
      requestMessageSenddm(authUser.token, dm.dmId, 'message');
    }
    const messages = requestDmMessages(authUser2.token, dm.dmId, 5);
    expect(messages.end).toStrictEqual(55);
  });
  test('Start is greater than messages', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const uIds = [];
    uIds.push(authUser2.authUserId);
    const dm = requestDmCreate(authUser.token, uIds);
    const messages = requestDmMessages(authUser.token, dm.dmId, 1);
    expect(messages).toStrictEqual(errorMsg);
  });
  test('ChannelId is invalid', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const uIds = [];
    uIds.push(authUser2.authUserId);
    const dm = requestDmCreate(authUser.token, uIds);
    const messages = requestDmMessages(authUser.token, dm.dmId + 1, 0);
    expect(messages).toStrictEqual(errorMsg);
  });
  test('ChannelId is valid but user is not part of channel', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const uIds = [];
    uIds.push(authUser2.authUserId);
    const dm = requestDmCreate(authUser.token, uIds);
    const authUser3 = requestAuthRegister('emai3@gmail.com', 'password2', 'firstname2', 'lastname2');
    const messages = requestDmMessages(authUser3.token, dm.dmId, 0);
    expect(messages).toStrictEqual(errorMsg);
  });
});
