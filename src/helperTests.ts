import request, { HttpVerb } from 'sync-request';
import config from './config.json';
import fs from 'fs';

const OK = 200;
const port = config.port;
const url = config.url;

// Return types
export type authUserReturn = {
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

export function removeFile() {
  if (fs.existsSync('data.json')) {
    fs.unlinkSync('data.json');
  }
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

export function requestAuthLogout(token: string) {
  const res = requestHelper('POST', '/auth/logout/v1', { token: token });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}
// Channels functions
export function requestChannelCreate(token: string, name: string, isPublic: boolean) {
  const res = requestHelper('POST', '/channels/create/v2', { token, name, isPublic });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

export function requestChannelInvite(token: string, channelId: number, uId: number) {
  const res = requestHelper('POST', '/channel/invite/v2', { token, channelId, uId });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

export function requestChannelJoin(token: string, channelId: number) {
  const res = requestHelper('POST', '/channel/join/v2', { token, channelId });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}
export function requestChannelMessages(token: string, channelId: number, start: number) {
  const res = requestHelper('GET', '/channel/messages/v2', { token, channelId, start });
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

export function requestChannelAddOwner(token: string, channelId: number, uId: number) {
  const res = requestHelper('POST', '/channel/addowner/v1', { token, channelId, uId });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

export function requestChannelRemoveOwner(token: string, channelId: number, uId: number) {
  const res = requestHelper('POST', '/channel/removeowner/v1', { token, channelId, uId });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

export function requestChannelLeave(token: string, channelId: number) {
  const res = requestHelper('POST', '/channel/leave/v1', { token, channelId });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

export function requestChannelDetails(token: string, channelId: number) {
  const res = requestHelper('GET', '/channel/details/v2', { token, channelId });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

// Dm functions
export function requestDmCreate(token: string, uIds: number[]) {
  const res = requestHelper('POST', '/dm/create/v1', { token, uIds });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody(('utf-8'))));
}

export function requestDmLeave(token: string, dmId: number) {
  const res = requestHelper('POST', '/dm/leave/v1', { token, dmId });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody(('utf-8'))));
}

export function requestDmDetails(token: string, dmId: number) {
  const res = requestHelper('GET', '/dm/details/v1', { token, dmId });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody(('utf-8'))));
}

export function requestDmList(token: string) {
  const res = requestHelper('GET', '/dm/list/v1', { token });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody(('utf-8'))));
}

export function requestDmRemove(token: string, dmId: number) {
  const res = requestHelper('DELETE', '/dm/remove/v1', { token, dmId });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody(('utf-8'))));
}

export function requestDmMessages(token: string, dmId: number, start: number) {
  const res = requestHelper('GET', '/dm/messages/v1', { token, dmId, start });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

// User functions
export function requestUserProfile(token: string, uId: number) {
  const res = requestHelper('GET', '/user/profile/v2', { token, uId });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

export function requestAllUsers(token: string) {
  const res = requestHelper('GET', '/users/all/v1', { token });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

export function requestUserSetName(token: string, nameFirst: string, nameLast: string) {
  const res = requestHelper('PUT', '/user/profile/setname/v1', { token, nameFirst, nameLast });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

export function requestUserEmail(token: string, email: string) {
  const res = requestHelper('PUT', '/user/profile/setemail/v1', { token, email });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

export function requestUserHandle(token: string, handleStr: string) {
  const res = requestHelper('PUT', '/user/profile/sethandle/v1', { token, handleStr });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

// Message functions
export function requestMessageSend(token: string, channelId: number, message: string) {
  const res = requestHelper('POST', '/message/send/v1', { token, channelId, message });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

export function requestMessageSenddm(token: string, dmId: number, message: string) {
  const res = requestHelper('POST', '/message/senddm/v1', { token, dmId, message });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

export function requestMessageEdit(token: string, messageId: number, message: string) {
  const res = requestHelper('PUT', '/message/edit/v1', { token, messageId, message });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

export function requestMessageRemove(token: string, messageId: number) {
  const res = requestHelper('DELETE', '/message/remove/v1', { token, messageId });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

// Other functions
export function requestClear() {
  const res = requestHelper('DELETE', '/clear/v1', {});
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}
