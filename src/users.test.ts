import { authUser, requestAuthRegister, errorMsg, requestClear } from './helperTests';
import { requestUserProfile } from './helperTests';

let authUser: authUser;

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
