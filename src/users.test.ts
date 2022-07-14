import { authUser, requestAuthRegister, requestUserProfile, requestAllUsers, errorMsg, requestClear } from './helperTests';

const email = 'email@gmail.com';
const password = 'password';
const nameFirst =  'firstname';
const nameLast = 'lastname';
const handleStr = 'firstnamelastname';

const email2 = 'email2@gmail.com';
const password2 = 'password2';
const nameFirst2 =  'firstname2';
const nameLast2 = 'lastname2';
const handleStr2 = 'firstname2lastname2';

const email3 = 'email3@gmail.com';
const password3 = 'password3';
const nameFirst3 =  'firstname3';
const nameLast3 = 'lastname3';
const handleStr3 = 'firstname3lastname3';

let authUser: authUser;

beforeEach(() => {
  requestClear();
  authUser = requestAuthRegister(email, password, nameFirst, nameLast);
});

describe('Testing userProfileV1', () => {
  test('Valid uId', () => {
    const uId = requestAuthRegister(email2, password2, nameFirst2, nameLast2);
    const profile = requestUserProfile(authUser.token, uId.authUserId);
    expect(profile).toStrictEqual({
      user: {
        uId: uId.authUserId,
        email: email2,
        nameFirst: nameFirst2,
        nameLast: nameLast2,
        handleStr: handleStr2,
      }
    });
  });
  test('Invalid uId', () => {
    const uId = authUser.authUserId + 1;
    const profile = requestUserProfile(authUser.token, uId);
    expect(profile).toStrictEqual(errorMsg);
  });
});

describe('Testing usersAllV1', () => {
  describe('Valid Token', () => {
    test('one user', () => {
      const users = requestAllUsers(authUser.token);
      expect(users).toStrictEqual({
        users: [
          {
            uId: authUser.authUserId,
            email: email,
            nameFirst: nameFirst,
            nameLast: nameLast,
            handleStr: handleStr
          }
        ]
      });
    });

    test('multiple users', () => {
      const authUser2 = requestAuthRegister(email2, password2, nameFirst2, nameLast2);
      const authUser3 = requestAuthRegister(email3, password3, nameFirst3, nameLast3);
      const users = requestAllUsers(authUser.token);
      expect(users).toStrictEqual({
        users: [
          {
            uId: authUser.authUserId,
            email: email,
            nameFirst: nameFirst,
            nameLast: nameLast,
            handleStr: handleStr
          },
          {
            uId: authUser2.authUserId,
            email: email2,
            nameFirst: nameFirst2,
            nameLast: nameLast2,
            handleStr: handleStr2,
          },
          {
            uId: authUser3.authUserId,
            email: email3,
            nameFirst: nameFirst3,
            nameLast: nameLast3,
            handleStr: handleStr3,
          }
        ]
      });
    });
  });

  test('Invalid uId', () => {
    const uId = authUser.authUserId + 1;
    const profile = requestUserProfile(authUser.token, uId);
    expect(profile).toStrictEqual(errorMsg);
  });
});
