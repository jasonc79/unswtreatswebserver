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
export type channelReturn = {
  channelId: number,
  name: string
}

export type dmReturn = {
  dmId: number,
  name: string,
}

type headers = {
  token?: string
}
export const errorMsg = { error: 'error' };

/**
 * requestHelper
 *
 * @param {string } method  are the HTTP methods 'GET', 'DELETE', 'PUT', 'POST'
 * @param {string } path    the path for your http route
 * @param {headers} headers an object which contains a token
 * @param payload
 * @param {number} err      is the status code of the error '400' or '403' or '200'
 *                          you may leave undefined if no error (status code 200)
 * @returns request
 */
function requestHelper(method: HttpVerb, path: string, headers: headers, payload: object, err?: number) {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    json = payload;
  }
  const res = request(method, url + ':' + port + path, { qs, json, headers });
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
  return requestHelper('POST', '/auth/register/v3', {}, {
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast
  }, err);
}

export function requestAuthLogin(email: string, password: string, err?: number) {
  return requestHelper('POST', '/auth/login/v3', {}, {
    email: email,
    password: password,
  }, err);
}

export function requestAuthLogout(token: string, err?: number) {
  return requestHelper('POST', '/auth/logout/v2', { token: token }, {}, err);
}

export function requestAuthPasswordRequest(email: string, err?: number) {
  return requestHelper('POST', '/auth/passwordreset/request/v1', {}, { email }, err);
}

export function requestAuthPasswordReset(resetCode: string, newPassword: string, err?: number) {
  return requestHelper('POST', '/auth/passwordreset/reset/v1', {}, { resetCode, newPassword }, err);
}

// Channels functions
export function requestChannelCreate(token: string, name: string, isPublic: boolean, err?: number) {
  return requestHelper('POST', '/channels/create/v3', { token: token }, { name, isPublic }, err);
}

export function requestChannelInvite(token: string, channelId: number, uId: number, err?: number) {
  return requestHelper('POST', '/channel/invite/v3', { token: token }, { channelId, uId }, err);
}

export function requestChannelJoin(token: string, channelId: number, err?: number) {
  return requestHelper('POST', '/channel/join/v3', { token: token }, { channelId }, err);
}

export function requestChannelMessages(token: string, channelId: number, start: number, err?: number) {
  return requestHelper('GET', '/channel/messages/v3', { token }, { channelId, start }, err);
}

export function requestChannelsList(token: string, err?: number) {
  return requestHelper('GET', '/channels/list/v3', { token: token }, {}, err);
}

export function requestChannelsListAll(token: string, err?: number) {
  return requestHelper('GET', '/channels/listall/v3', { token: token }, {}, err);
}

export function requestChannelAddOwner(token: string, channelId: number, uId: number, err?: number) {
  return requestHelper('POST', '/channel/addowner/v2', { token: token }, { channelId, uId }, err);
}

export function requestChannelRemoveOwner(token: string, channelId: number, uId: number, err?: number) {
  return requestHelper('POST', '/channel/removeowner/v2', { token: token }, { channelId, uId }, err);
}

export function requestChannelLeave(token: string, channelId: number, err?: number) {
  return requestHelper('POST', '/channel/leave/v2', { token: token }, { channelId }, err);
}

export function requestChannelDetails(token: string, channelId: number, err?: number) {
  return requestHelper('GET', '/channel/details/v3', { token: token }, { channelId }, err);
}

// Dm functions
export function requestDmCreate(token: string, uIds: number[], err? : number) {
  return requestHelper('POST', '/dm/create/v2', { token: token }, { uIds }, err);
}

export function requestDmLeave(token: string, dmId: number, err?: number) {
  return requestHelper('POST', '/dm/leave/v2', { token: token }, { dmId }, err);
}

export function requestDmDetails(token: string, dmId: number, err?: number) {
  return requestHelper('GET', '/dm/details/v2', { token: token }, { dmId }, err);
}

export function requestDmList(token: string, err?: number) {
  return requestHelper('GET', '/dm/list/v2', { token: token }, {}, err);
}

export function requestDmRemove(token: string, dmId: number, err?: number) {
  return requestHelper('DELETE', '/dm/remove/v2', { token: token }, { dmId }, err);
}

export function requestDmMessages(token: string, dmId: number, start: number, err?: number) {
  return requestHelper('GET', '/dm/messages/v2', { token }, { dmId, start }, err);
}

// User functions
export function requestUserProfile(token: string, uId: number, err?: number) {
  return requestHelper('GET', '/user/profile/v3', { token: token }, { uId }, err);
}

export function requestAllUsers(token: string, err?: number) {
  return requestHelper('GET', '/users/all/v2', { token: token }, {}, err);
}

export function requestUserSetName(token: string, nameFirst: string, nameLast: string, err?: number) {
  return requestHelper('PUT', '/user/profile/setname/v2', { token: token }, { nameFirst, nameLast }, err);
}

export function requestUserEmail(token: string, email: string, err?: number) {
  return requestHelper('PUT', '/user/profile/setemail/v2', { token: token }, { email }, err);
}

export function requestUserHandle(token: string, handleStr: string, err?: number) {
  return requestHelper('PUT', '/user/profile/sethandle/v2', { token: token }, { handleStr }, err);
}

export function requestUserStats(token: string, err?: number) {
  return requestHelper('GET', '/user/stats/v1', { token: token }, {}, err);
}

export function requestUsersStats(token: string, err?: number) {
  return requestHelper('GET', '/users/stats/v1', { token: token }, {}, err);
}

// Message functions
export function requestMessageSend(token: string, channelId: number, message: string, err?: number) {
  return requestHelper('POST', '/message/send/v2', { token: token }, { channelId, message }, err);
}

export function requestMessageSenddm(token: string, dmId: number, message: string, err?: number) {
  return requestHelper('POST', '/message/senddm/v2', { token: token }, { dmId, message }, err);
}

export function requestMessageEdit(token: string, messageId: number, message: string, err?: number) {
  return requestHelper('PUT', '/message/edit/v2', { token: token }, { messageId, message }, err);
}

export function requestMessageRemove(token: string, messageId: number, err?: number) {
  return requestHelper('DELETE', '/message/remove/v2', { token: token }, { messageId }, err);
}

export function requestMessagePin(token: string, messageId: number, err?: number) {
  return requestHelper('POST', '/message/pin/v1', { token: token }, { messageId }, err);
}

export function requestMessageUnpin(token: string, messageId: number, err?: number) {
  return requestHelper('POST', '/message/unpin/v1', { token: token }, { messageId }, err);
}

export function requestMessageSendlater(token: string, channelId: number, message: string, timeSent: number, err?: number) {
  return requestHelper('POST', '/message/sendlater/v1', { token: token }, { channelId, message, timeSent }, err);
}

export function requestMessageSendlaterdm(token: string, dmId: number, message: string, timeSent: number, err?: number) {
  return requestHelper('POST', '/message/sendlaterdm/v1', { token: token }, { dmId, message, timeSent }, err);
}

export function requestMessageShare(token: string, ogMessageId: number, message: string, channelId: number, dmId: number, err?: number) {
  return requestHelper('POST', '/message/share/v1', { token: token }, { ogMessageId, message, channelId, dmId }, err);
}
export function requestSearch(token: string, queryStr: string, err?: number) {
  return requestHelper('GET', '/search/v1', { token: token }, { queryStr }, err);
}

// Admin functions

export function requestAdminRemove(token: string, uId: number, err?: number) {
  return requestHelper('DELETE', '/admin/user/remove/v1', { token: token }, { uId }, err);
}
export function requestUserPermissionChange(token: string, uId: number, permissionId: number, err?: number) {
  return requestHelper('POST', '/admin/userpermission/change/v1', { token: token }, { uId, permissionId }, err);
}

//= ===========================================================================//
// Standup functions
//= ===========================================================================//
export function requestStandupStart(token: string, channelId: number, length: number, err?: number) {
  return requestHelper('POST', '/standup/start/v1', { token: token }, { channelId, length }, err);
}

export function requestStandupActive(token: string, channelId: number, err?: number) {
  return requestHelper('GET', '/standup/active/v1', { token: token }, { channelId }, err);
}

export function requestStandupSend(token: string, channelId: number, message: string, err?: number) {
  return requestHelper('POST', '/standup/send/v1', { token: token }, { channelId, message }, err);
}

//= ===========================================================================//
// React functions
//= ===========================================================================//
export function requestMessageReact(token: string, messageId: number, reactId: number, err?: number) {
  return requestHelper('POST', '/message/react/v1', { token: token }, { messageId, reactId }, err);
}

export function requestMessageUnreact(token: string, messageId: number, reactId: number, err?: number) {
  return requestHelper('POST', '/message/unreact/v1', { token: token }, { messageId, reactId }, err);
}

//= ===========================================================================//
// Notifications functions
//= ===========================================================================//

export function requestNotifications(token: string, err?: number) {
  return requestHelper('GET', '/notifications/get/v1', { token: token }, {}, err);
}

// Other functions
export function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {}, {});
}
