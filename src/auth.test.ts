import { requestAuthRegister, requestAuthLogin, requestAuthLogout, requestChannelCreate, errorMsg, requestClear } from './helperTests';
import { requestUserProfile } from './helperTests';
import { removeFile } from './helperTests';

const email0 = 'email@gmail.com';
const password0 = 'password';
const nameFirst0 = 'firstname'; // 17 characters
const nameLast0 = 'lastname';

const email1 = 'email1@gmail.com';
const password1 = 'password2';
const nameFirst1 = 'firstname2'; // 17 characters
const nameLast1 = 'lastname2';

const longName = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy';
const exactly50CharName = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx';

beforeEach(() => {
  removeFile();
  requestClear();
});

afterEach(() => {
  removeFile();
  requestClear();
});
// ========================================================================= //
// Testing handle
function testHandle(password: string, email: string, nameFirst: string, nameLast: string) {
  const authUser = requestAuthRegister(email, password, nameFirst, nameLast);
  return requestUserProfile(authUser.token, authUser.authUserId);
}

// ========================================================================= //
// Testing

describe('Testing auth/register/v2', () => {
  test('Invalid email (no @)', () => {
    const authUser = requestAuthRegister('invalidEmail', password0, nameFirst0, nameLast0);
    expect(authUser).toEqual(errorMsg);
  });

  test('Invalid email (nothing after @)', () => {
    const authUser = requestAuthRegister('invalidEmail@', password0, nameFirst0, nameLast0);
    expect(authUser).toEqual(errorMsg);
  });

  test('Email already exists', () => {
    requestAuthRegister(email0, password0, nameFirst0, nameLast0);
    const authUser = requestAuthRegister(email0, password1, nameFirst1, nameLast1);
    expect(authUser).toEqual(errorMsg);
  });

  test('Password is less than 6 characters (5 characters)', () => {
    const authUser = requestAuthRegister(email0, 'apple', nameFirst0, nameLast0);
    expect(authUser).toEqual(errorMsg);
  });

  test('Length of nameFirst is exactly 51 characters', () => {
    const authUser = requestAuthRegister(email0, password0, longName, nameLast0);
    expect(authUser).toEqual(errorMsg);
  });

  test('nameFirst is an empty string', () => {
    const authUser = requestAuthRegister(email0, password0, '', nameLast0);
    expect(authUser).toEqual(errorMsg);
  });

  test('Length of nameLast is exactly 51 characters', () => {
    const authUser = requestAuthRegister(email0, password0, nameFirst0, longName);
    expect(authUser).toEqual(errorMsg);
  });

  test('nameLast is an empty string', () => {
    const authUser = requestAuthRegister(email0, password0, nameFirst0, '');
    expect(authUser).toEqual(errorMsg);
  });

  test('Testing handle generation (exactly 20 characters)', () => {
    const nameFirst20 = 'abcdefghijklmnopqr';
    const nameLast20 = 'st';
    const email2 = 'email2@email.com';
    const handle0 = 'abcdefghijklmnopqrst0';
    const handle1 = 'abcdefghijklmnopqrst1';
    requestAuthRegister(email0, password0, nameFirst20, nameLast20);
    const profile1 = testHandle(password0, email1, nameFirst20, nameLast20);
    const profile2 = testHandle(password0, email2, nameFirst20, nameLast20);

    expect(profile1).toStrictEqual({
      user: expect.objectContaining(
        {
          uId: expect.any(Number),
          email: email1,
          nameFirst: nameFirst20,
          nameLast: nameLast20,
          handleStr: handle0,
        }
      )
    }
    );

    expect(profile2).toStrictEqual({
      user: expect.objectContaining(
        {
          uId: expect.any(Number),
          email: email2,
          nameFirst: nameFirst20,
          nameLast: nameLast20,
          handleStr: handle1,
        }
      )
    }
    );
  });

  test('Testing handle generation (non-alphanumeric characters and > 20 characters)', () => {
    const nameFirstNonAlpha = '@bcdefgh!j';
    const nameLastNonAlpha = 'klmn opqrst';
    const email2 = 'email2@email.com';
    const handle0 = 'bcdefghjklmnopqrst0';
    const handle1 = 'bcdefghjklmnopqrst1';
    requestAuthRegister(email0, password0, nameFirstNonAlpha, nameLastNonAlpha);
    const profile1 = testHandle(password0, email1, nameFirstNonAlpha, nameLastNonAlpha);
    const profile2 = testHandle(password0, email2, nameFirstNonAlpha, nameLastNonAlpha);

    expect(profile1).toStrictEqual({
      user: expect.objectContaining(
        {
          uId: expect.any(Number),
          email: email1,
          nameFirst: nameFirstNonAlpha,
          nameLast: nameLastNonAlpha,
          handleStr: handle0,
        }
      )
    }
    );

    expect(profile2).toStrictEqual({
      user: expect.objectContaining(
        {
          uId: expect.any(Number),
          email: email2,
          nameFirst: nameFirstNonAlpha,
          nameLast: nameLastNonAlpha,
          handleStr: handle1,
        }
      )
    }
    );
  });

  test('Testing handle generation (name ends in a number)', () => {
    const nameFirst = 'abc';
    const nameLast = 'def0';
    const email2 = 'email2@email.com';
    const handle0 = 'abcdef00';
    const handle1 = 'abcdef01';
    requestAuthRegister(email0, password0, nameFirst, nameLast);
    const profile1 = testHandle(password0, email1, nameFirst, nameLast);
    const profile2 = testHandle(password0, email2, nameFirst, nameLast);

    expect(profile1).toStrictEqual({
      user: expect.objectContaining(
        {
          uId: expect.any(Number),
          email: email1,
          nameFirst: nameFirst,
          nameLast: nameLast,
          handleStr: handle0,
        }
      )
    }
    );

    expect(profile2).toStrictEqual({
      user: expect.objectContaining(
        {
          uId: expect.any(Number),
          email: email2,
          nameFirst: nameFirst,
          nameLast: nameLast,
          handleStr: handle1,
        }
      )
    }
    );
  });

  test('Correct return (nameFirst is exactly 50 characters)', () => {
    const authUser = requestAuthRegister(email0, password0, exactly50CharName, nameLast0);
    expect(authUser).toEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
  });

  test('Correct return (nameLast is exactly 50 characters)', () => {
    const authUser = requestAuthRegister(email0, password0, nameFirst0, exactly50CharName);
    expect(authUser).toStrictEqual(
      expect.objectContaining({
        token: expect.any(String),
        authUserId: expect.any(Number)
      })
    );
  });

  test('Correct return (Password is exactly 6 characters)', () => {
    const authUser = requestAuthRegister(email0, 'apples', nameFirst0, nameLast0);
    expect(authUser).toStrictEqual(
      expect.objectContaining({
        token: expect.any(String),
        authUserId: expect.any(Number)
      })
    );
  });

  test('Correct return (password is more than 6 characters)', () => {
    const authUser = requestAuthRegister(email0, password0, nameFirst0, nameLast0);
    expect(authUser).toStrictEqual(
      expect.objectContaining({
        token: expect.any(String),
        authUserId: expect.any(Number)
      })
    );
  });
});

describe('Testing authLoginV1', () => {
  test('Email does not exist', () => {
    const authUser = requestAuthLogin(email0, password0);
    expect(authUser).toStrictEqual(errorMsg);
  });

  test('Incorrect password', () => {
    requestAuthRegister(email0, password0, nameFirst0, nameLast0);
    const authUser = requestAuthLogin(email0, 'wrongPassword');
    expect(authUser).toStrictEqual(errorMsg);
  });

  test('Correct return', () => {
    requestAuthRegister(email0, password0, nameFirst0, nameLast0);
    const authUser = requestAuthLogin(email0, password0);
    expect(authUser).toStrictEqual(
      expect.objectContaining({
        token: expect.any(String),
        authUserId: expect.any(Number)
      })
    );
  });
});

describe('Testing auth/logout/v2', () => {
  test('Testing successful logout', () => {
    const authUser = requestAuthRegister('email@email.com', 'password', 'name', 'name2');
    const authLogoutReturn = requestAuthLogout(authUser.token);
    expect(authLogoutReturn).toStrictEqual({});
    const channel = requestChannelCreate(authUser.token, 'channel', true);
    expect(channel).toStrictEqual(errorMsg);
  });
});
