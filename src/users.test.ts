import { authUser, requestAuthRegister, errorMsg, requestClear } from './helperTests';
import { requestUserProfile , requestAllUsers} from './helperTests';

let authUser: authUser;

const email = 'email@gmail.com';
const password = 'password';
const nameFirst = 'firstname';
const nameLast = 'lastname';
const handleStr = 'firstnamelastname';

const email2 = 'email2@gmail.com';
const password2 = 'password2';
const nameFirst2 = 'firstname2';
const nameLast2 = 'lastname2';
const handleStr2 = 'firstname2lastname2';

const email3 = 'email3@gmail.com';
const password3 = 'password3';
const nameFirst3 = 'firstname3';
const nameLast3 = 'lastname3';
const handleStr3 = 'firstname3lastname3';

beforeEach(() => {
  requestClear();
  authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
});

describe('Testing userProfileV1', () => {
  test('Valid uId', () => {
    const uId = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const profile = requestUserProfile(authUser.token, uId.authUserId);
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
    const uId = authUser.authUserId + 1;
    const profile = requestUserProfile(authUser.token, uId);
    expect(profile).toStrictEqual(errorMsg);
  });
});

describe('Testing usersAllV1', () => {
  describe('Valid Token', () => {
    test('one user', () => {
      const users= requestAllUsers(authUser.token);
      expect(users).toStrictEqual({
        users: [
          {
            uId: authUser.authUserId,
            email: email,
            nameFirst: nameFirst,
            nameLast: nameLast,
            handleStr: handleStr,
          }
        ]
      });
    });

    test('multiple users', () => {
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
