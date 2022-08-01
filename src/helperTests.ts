import request, { HttpVerb } from 'sync-request';
import config from './config.json';
import fs from 'fs';

const port = config.port;
const url = config.url;

// Error Types
const OK = 200;
const BAD = 400;
const FORBIDDEN = 403;

// Return types
export type authUserReturn = {
  token: string,
  authUserId: number
}
export const errorMsg = { error: 'error' };

/**
 * requestHelper
 *
 * @param {string } method  are the HTTP methods 'GET', 'DELETE', 'PUT', 'POST'
 * @param {string } path    the path for your http route
 * @param payload
 * @param {number} err      is the status code of the error '400' or '403' or '200'
 *                          you may leave undefined if no error (status code 200)
 * @returns request
 */
function requestHelper(method: HttpVerb, path: string, payload: object, err?: number) {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    json = payload;
  }
  const res = request(method, url + ':' + port + path, { qs, json });
  if (err === FORBIDDEN) {
    expect(res.statusCode).toEqual(FORBIDDEN);
  } else if (err === BAD) {
    expect(res.statusCode).toEqual(BAD);
  } else {
    expect(res.statusCode).toEqual(OK);
    return JSON.parse(String(res.getBody()));
  }
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
export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string, err?: number) {
  return requestHelper('POST', '/auth/register/v3', {
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast
  }, err);
}

export function requestAuthLogin(email: string, password: string, err?: number) {
  return requestHelper('POST', '/auth/login/v3', {
    email: email,
    password: password,
  }, err);
}

export function requestAuthLogout(token: string, err?: number) {
  return requestHelper('POST', '/auth/logout/v2', { token: token }, err);
}
// Channels functions
export function requestChannelCreate(token: string, name: string, isPublic: boolean, err?: number) {
  return requestHelper('POST', '/channels/create/v3', { token, name, isPublic }, err);
}

export function requestChannelInvite(token: string, channelId: number, uId: number, err?: number) {
  return requestHelper('POST', '/channel/invite/v3', { token, channelId, uId }, err);
}

export function requestChannelJoin(token: string, channelId: number, err?: number) {
  return requestHelper('POST', '/channel/join/v3', { token, channelId }, err);
}

export function requestChannelMessages(token: string, channelId: number, start: number, err?: number) {
  return requestHelper('GET', '/channel/messages/v3', { token, channelId, start }, err);
}

export function requestChannelsList(token: string, err?: number) {
  return requestHelper('GET', '/channels/list/v3', { token }, err);
}

export function requestChannelsListAll(token: string, err?: number) {
  return requestHelper('GET', '/channels/listall/v3', { token }, err);
}

export function requestChannelAddOwner(token: string, channelId: number, uId: number, err?: number) {
  return requestHelper('POST', '/channel/addowner/v2', { token, channelId, uId }, err);
}

export function requestChannelRemoveOwner(token: string, channelId: number, uId: number, err?: number) {
  return requestHelper('POST', '/channel/removeowner/v2', { token, channelId, uId }, err);
}

export function requestChannelLeave(token: string, channelId: number, err?: number) {
  return requestHelper('POST', '/channel/leave/v2', { token, channelId }, err);
}

export function requestChannelDetails(token: string, channelId: number, err?: number) {
  return requestHelper('GET', '/channel/details/v3', { token, channelId }, err);
}

// Dm functions
export function requestDmCreate(token: string, uIds: number[], err? : number) {
  return requestHelper('POST', '/dm/create/v2', { token, uIds }, err);
}

export function requestDmLeave(token: string, dmId: number, err?: number) {
  return requestHelper('POST', '/dm/leave/v2', { token, dmId }, err);
}

export function requestDmDetails(token: string, dmId: number, err?: number) {
  return requestHelper('GET', '/dm/details/v2', { token, dmId }, err);
}

export function requestDmList(token: string, err?: number) {
  return requestHelper('GET', '/dm/list/v2', { token }, err);
}

export function requestDmRemove(token: string, dmId: number, err?: number) {
  return requestHelper('DELETE', '/dm/remove/v2', { token, dmId }, err);
}

export function requestDmMessages(token: string, dmId: number, start: number, err?: number) {
  return requestHelper('GET', '/dm/messages/v2', { token, dmId, start }, err);
}

// User functions
export function requestUserProfile(token: string, uId: number, err?: number) {
  return requestHelper('GET', '/user/profile/v2', { token, uId }, err);
}

export function requestAllUsers(token: string, err?: number) {
  return requestHelper('GET', '/users/all/v1', { token }, err);
}

export function requestUserSetName(token: string, nameFirst: string, nameLast: string, err?: number) {
  return requestHelper('PUT', '/user/profile/setname/v1', { token, nameFirst, nameLast }, err);
}

export function requestUserEmail(token: string, email: string, err?: number) {
  return requestHelper('PUT', '/user/profile/setemail/v1', { token, email }, err);
}

export function requestUserHandle(token: string, handleStr: string, err?: number) {
  return requestHelper('PUT', '/user/profile/sethandle/v1', { token, handleStr }, err);
}

// Message functions
export function requestMessageSend(token: string, channelId: number, message: string, err?: number) {
  return requestHelper('POST', '/message/send/v2', { token, channelId, message }, err);
}

export function requestMessageSenddm(token: string, dmId: number, message: string, err?: number) {
  return requestHelper('POST', '/message/senddm/v2', { token, dmId, message }, err);
}

export function requestMessageEdit(token: string, messageId: number, message: string, err?: number) {
  return requestHelper('PUT', '/message/edit/v2', { token, messageId, message }, err);
}

export function requestMessageRemove(token: string, messageId: number, err?: number) {
  return requestHelper('DELETE', '/message/remove/v2', { token, messageId }, err);
}

export function requestMessageSendlater(token: string, channelId: number, message: string, timeSent: number, err?: number) {
  return requestHelper('POST', '/message/sendlater/v1', { token, channelId, message, timeSent }, err);
}

export function requestMessageSendlaterdm(token: string, dmId: number, message: string, timeSent: number, err?: number) {
  return requestHelper('POST', '/message/sendlaterdm/v1', { token, dmId, message, timeSent }, err);
}

//============================================================================//
// Standup functions 
//============================================================================//
export function requestStandupStart(token: string, channelId: number, length: number, err?: number) {
  return requestHelper('POST', '/standup/start/v1', { token, channelId, length }, err);
}

export function requestStandupActive(token: string, channelId: number, err?: number) {
  return requestHelper('GET', '/standup/active/v1', { token, channelId }, err);
}

export function requestStandupSend(token: string, channelId: number, message: string, err?: number) {
  return requestHelper('POST', '/standup/send/v1', { token, channelId, message}, err);
}


// Other functions
export function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}
