import { requestAuthRegister, requestAuthLogin, errorMsg, requestClear, removeFile } from './helperTests';

const email0 = 'email@gmail.com';
const password0 = 'password';
const nameFirst0 = 'firstname'; // 17 characters
const nameLast0 = 'lastname';

beforeEach(() => {
  removeFile();
});

afterEach(() => {
  removeFile();
});

describe(('Testing clearV1'), () => {
  test('Cleared successfully', () => {
    requestAuthRegister(email0, password0, nameFirst0, nameLast0);
    const clearReturn = requestClear();
    const authUser = requestAuthLogin(email0, password0);
    expect(authUser).toStrictEqual(errorMsg);
    expect(clearReturn).toStrictEqual({});
  });
});
