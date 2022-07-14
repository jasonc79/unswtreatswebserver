import request, { HttpVerb } from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

// Return types
export type authUser = {
  token: string,
  authUserId: number
}
export const errorMsg = { error: 'error' };


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
// WRAPPER FUNCTIONS
// ==========================================================================//

// Auth Functions
export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = requestHelper('POST', '/auth/register/v2', {
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast
  });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

export function requestAuthLogin(email: string, password: string) {
  const res = requestHelper('POST', '/auth/login/v2', {
    email: email,
    password: password,
  });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}
// Channels functions
export function requestChannelCreate(token: string, name: string, isPublic: boolean) {
  const res = requestHelper('POST', '/channels/create/v2', { token, name, isPublic });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

export function requestChannelsList(token: string) {
  const res = requestHelper('GET', '/channels/list/v2', { token });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

export function requestChannelsListAll(token: string) {
  const res = requestHelper('GET', '/channels/listall/v2', { token });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

// User
export function requestUserProfile(token: string, uId: number) {
  const res = requestHelper('GET', '/user/profile/v2', { token, uId });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

export function requestAllUsers(token: string) {
  const res =  requestHelper('GET', '/users/all/v1', { token });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

// Other
export function requestClear() {
  const res = requestHelper('DELETE', '/clear/v1', {});
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}
