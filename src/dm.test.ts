import request, { HttpVerb } from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const errorMsg = { error: 'error' };

function requestHelper(method: HttpVerb, path: string, payload: object) {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    json = payload;
  }
  return request(method, url + ':' + port + path, { qs, json });
}

// ========================================================================= //
// Wrapper Functions
type uId = { uId: number };
function getRequestDmCreate(token: number, uIds: uId[]) {
    return requestHelper('POST', '/dm/create/v1', { token, uIds });
}

function getRequestRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v2', {
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast
  });
}

function getReqClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

beforeEach(() => {
  getReqClear();
});

// ========================================================================= //
// Testing

describe('Testing dm/create/v1', () => {
    // beforeEach(() => {
    //     // Register 2 users (one owner, one member)
    //     const res1 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
    //     const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    //     expect(res1.statusCode).toBe(OK);
    //     const res2 = getRequestRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
    //     const uId = JSON.parse(String(res2.getBody(('utf-8'))));
    //     expect(res1.statusCode).toBe(OK);
    // });

    test('Any uId in uIds does not refer to a valid user', () => {
        const res1 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
        const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
        expect(res1.statusCode).toBe(OK);
        const uId1 = authUser.authUserId + 1; 
        const uId2 = authUser.authUserId + 2; 
        const uIds = []; 
        uIds.push(uId1); 
        uIds.push(uId2); 
        const res2 = getRequestDmCreate(authUser.token, uIds); 
        const dm = JSON.parse(String(res2.getBody(('utf-8'))));
        expect(res2.statusCode).toBe(OK); 
        expect(dm).toStrictEqual(errorMsg); 
    });

    test('There are duplicate uIds in uIds', () => {
        const res1 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
        const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
        expect(res1.statusCode).toBe(OK);
        const uId1 = authUser.authUserId + 1; 
        const uId2 = authUser.authUserId + 1; 
        const uIds = []; 
        uIds.push(uId1); 
        uIds.push(uId2); 
        const res2 = getRequestDmCreate(authUser.token, uIds); 
        const dm = JSON.parse(String(res2.getBody(('utf-8'))));
        expect(res2.statusCode).toBe(OK); 
        expect(dm).toStrictEqual(errorMsg); 
    });

    test('Valid inputs', () => {
        const res1 = getRequestRegister('email0@email.com', 'password0', 'nameFirst0', 'nameLast0');
        const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
        expect(res1.statusCode).toBe(OK);
        const res2 = getRequestRegister('email1@email.com', 'password1', 'nameFirst1', 'nameLast1');
        const uId1 = JSON.parse(String(res2.getBody(('utf-8'))));
        expect(res2.statusCode).toBe(OK);
        const res3 = getRequestRegister('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
        const uId2 = JSON.parse(String(res3.getBody(('utf-8'))));
        expect(res3.statusCode).toBe(OK);
        const uIds = []; 
        uIds.push(uId1); 
        uIds.push(uId2); 
        const res4 = getRequestDmCreate(authUser.token, uIds); 
        const dm = JSON.parse(String(res4.getBody(('utf-8'))));
        expect(res4.statusCode).toBe(OK); 
        expect(dm).toStrictEqual(
          expect.objectContaining({
            dmId: expect.any(Number),
          })
        );
    }); 


});

