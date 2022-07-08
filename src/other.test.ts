import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const errorMsg = {error: 'error'};

const email0 = 'email@gmail.com';
const password0 = 'password';
const nameFirst0 = 'firstname'; // 17 characters
const nameLast0 = 'lastname';


function getReqAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
    const res = request(
      'POST',
      `${url}:${port}/auth/register/v2`, {
        body: JSON.stringify({
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast
        }),
        headers: { 'Content-type': 'application/json'}
      }
    );
    return res;
}

function getReqAuthLogin(email: string, password: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/login/v2`, {
      body: JSON.stringify({
        email: email,
        password: password,
      }),
      headers: { 'Content-type': 'application/json'}
    }
  );
  return res;
}

function getReqClear() {
  const res = request(
    'DELETE',
    `${url}:${port}/clear/v1`
  );
  return res;
}

describe(('Testing clearV1'), () => {
    test('Cleared successfully', () => {
      let res = getReqAuthRegister(email0, password0, nameFirst0, nameLast0);
      expect(res.statusCode).toBe(OK);

      res = getReqClear();
      expect(res.statusCode).toBe(OK);
      const clearReturn = JSON.parse(String(res.getBody()));

      let res2 = getReqAuthLogin(email0, password0);
      expect(res2.statusCode).toBe(OK);
      const authUser = JSON.parse(String(res2.getBody()));
      expect(authUser).toStrictEqual(errorMsg);
      expect(clearReturn).toStrictEqual({});
    });
});