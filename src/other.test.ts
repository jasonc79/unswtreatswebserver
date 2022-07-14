import { requestAuthRegister, requestAuthLogin, errorMsg, requestClear } from './helperTests';
import { removeSavedFile } from './helperTests';

const email0 = 'email@gmail.com';
const password0 = 'password';
const nameFirst0 = 'firstname'; // 17 characters
const nameLast0 = 'lastname';

describe(('Testing clearV1'), () => {
  test('Cleared successfully', () => {
    removeSavedFile();
    requestAuthRegister(email0, password0, nameFirst0, nameLast0);
    const clearReturn = requestClear();
    const authUser = requestAuthLogin(email0, password0);
    expect(authUser).toStrictEqual(errorMsg);
    expect(clearReturn).toStrictEqual({});
  });
});
