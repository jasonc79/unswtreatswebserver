test('remove test', () => {
  expect(1 + 1).toEqual(2);
});

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

function requestChannelMessages(token: string, channelId: number, start: number) {
  return requestHelper('GET', '/channel/messages/v2', { token, channelId, start });
}

function requestChannelAddOwner(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/addowner/v1', { token, channelId, uId });
}

function requestChannelRemoveOwner(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/removeowner/v1', { token, channelId, uId });
}

function requestChannelLeave(token: string, channelId: number ) {
  return requestHelper('POST', '/channel/leave/v1', { token, channelId });
}

function requestChannelDetails(token: string, channelId: number) {
  return requestHelper('GET', '/channel/details/v2', { token, channelId });
}

function requestChannelCreate(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v2', { token, name, isPublic });
}

function requestUserProfile(token: string, uId: number) {
  return requestHelper('GET', '/user/profile/v2', { token, uId });
}

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = requestHelper('POST', '/auth/register/v2', {
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast
  });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody(('utf-8'))));
}

function requestChannelJoin(token: string, channelId: number) {
  const res = requestHelper('POST', '/channel/join/v2', { token, channelId });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}


function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

beforeEach(() => {
  requestClear();
});

////

describe('Testing channelMessagesV1', () => {
  test('Empty messages', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const res3 = requestChannelMessages(authUser.token, channel.channelId, 0);
    const messages = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    expect(messages).toStrictEqual(
      expect.objectContaining({
        messages: [],
        start: 0,
        end: -1,
      })
    );
  });
  // test('Contains messages', () => {
  //   // Waiting for message/send to finish writing this test.
  //   const res1 = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
  //   const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
  //   expect(res1.statusCode).toBe(OK);
  //   const res2 = requestChannelCreate(authUser.token, 'correct name', true);
  //   const channel = JSON.parse(String(res2.getBody(('utf-8'))));
  //   expect(res2.statusCode).toBe(OK);
  //   const res3 = requestChannelMessages(authUser.token, channel, 1);
  //   const messages = JSON.parse(String(res3.getBody(('utf-8'))));
  //   expect(messages).toStrictEqual(
  //     expect.objectContaining({
  //       messages: [],
  //       start: 0,
  //       end: -1,
  //     })
  //   );
  // });
  test('Start is greater than messages', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const res3 = requestChannelMessages(authUser.token, channel.channelId, 1);
    const messages = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(messages).toStrictEqual(errorMsg);
  });
  test('ChannelId is invalid', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const res3 = requestChannelMessages(authUser.token, channel.channelId + 1, 0);
    const messages = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(messages).toStrictEqual(errorMsg);
  });
  test('ChannelId is valid but user is not part of channel', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const res3 = requestChannelMessages(authUser2.token, channel.channelId, 1);
    const messages = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(messages).toStrictEqual(errorMsg);
  });
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



describe('Testing channelDetailsV2', () => {
  test('Success', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const res4 = requestUserProfile(authUser.token, authUser.authUserId);
    const userInfo = JSON.parse(String(res4.getBody(('utf-8'))));
    expect(res4.statusCode).toBe(OK);
    const res3 = requestChannelDetails(authUser.token, channel.channelId);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual(
      expect.objectContaining({
        name: 'correct name',
        isPublic: true,
        allMembers: [{
          uId: userInfo.user.uId,
          email: userInfo.user.email,
          handleStr: userInfo.user.handleStr,
          nameFirst: userInfo.user.nameFirst,
          nameLast: userInfo.user.nameLast}],
        ownerMembers: [{
          uId: userInfo.user.uId,
          email: userInfo.user.email,
          handleStr: userInfo.user.handleStr,
          nameFirst: userInfo.user.nameFirst,
          nameLast: userInfo.user.nameLast}],
      })
    );
  });
  test('ChannelId is invalid', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const res3 = requestChannelDetails(authUser.token, 1);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual(errorMsg);
  });
  test('ChannelId is valid but user is not part of channel', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const res3 = requestChannelDetails(authUser2.token, channel.channelId);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual(errorMsg);
  });
});



/////////////////////////////////////////////////////////////////////////////



describe('Testing channelLeaveV1', () => {
  test('Pass scenario', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const channelJoin = requestChannelJoin(authUser2.token, channel.channelId);
    const res3 = requestChannelLeave(authUser.token, channel.channelId);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual({});
    const res4 = requestUserProfile(authUser2.token, authUser2.authUserId);
    const userInfo = JSON.parse(String(res4.getBody(('utf-8'))));
    expect(res4.statusCode).toBe(OK);
    const res5 = requestChannelDetails(authUser2.token, channel.channelId);
    const channeldetails = JSON.parse(String(res5.getBody(('utf-8'))));
    expect(res5.statusCode).toBe(OK);
    // console.log(channeldetails);
    expect(channeldetails).toStrictEqual(
      expect.objectContaining({
        name: 'correct name',
        isPublic: true,
        ownerMembers: [],
        allMembers: [{
          uId: userInfo.user.uId,
          email: userInfo.user.email,
          handleStr: userInfo.user.handleStr,
          nameFirst: userInfo.user.nameFirst,
          nameLast: userInfo.user.nameLast}],
      })
    );
  });
  test('ChannelId is invalid', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const res3 = requestChannelLeave(authUser.token, channel.channelId + 1);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual(errorMsg);
  });
  test('ChannelId is valid but user is not part of channel', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const res3 = requestChannelLeave(authUser2.token, channel.channelId);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual(errorMsg);
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////

describe('Testing channelAddOwnerV1', () => {
  test('Pass scenario', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const channelJoin = requestChannelJoin(authUser2.token, channel.channelId);
    const res4 = requestChannelAddOwner(authUser.token, channel, authUser2.authUserId);
    const details = JSON.parse(String(res4.getBody(('utf-8'))));
    expect(res4.statusCode).toBe(OK);
    expect(details).toStrictEqual(errorMsg);
  });
  test('ChannelId is invalid', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const channelJoin = requestChannelJoin(authUser2.token, channel.channelId);
    const res3 = requestChannelAddOwner(authUser.token, channel.channelId + 1, authUser2.authUserId);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual(errorMsg);
  });
  test('uId is invalid', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const channelJoin = requestChannelJoin(authUser2.token, channel.channelId);
    const res3 = requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId + 1);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual(errorMsg);
  });
  test('uId is not part of channel', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const res3 = requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual(errorMsg);
  });
  test('uId is already owner', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const res3 = requestChannelAddOwner(authUser.token, channel.channelId, authUser.authUserId);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual(errorMsg);
  });
  test('token is not owner', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK); 
    const channelJoin = requestChannelJoin(authUser2.token, channel.channelId);
    const res3 = requestChannelAddOwner(authUser2.token, channel.channelId, authUser.authUserId);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual(errorMsg);
  });
});

////////////////////////////////////

describe('Testing channelRemoveOwnerV1', () => {
  test('Pass scenario', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const channelJoin = requestChannelJoin(authUser2.token, channel.channelId);
    const res3 = requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual({});
    const res5 = requestChannelRemoveOwner(authUser.token, channel.channelId, authUser2.authUserId);
    const RemoveOwner = JSON.parse(String(res5.getBody(('utf-8'))));
    expect(res5.statusCode).toBe(OK);
    expect(RemoveOwner).toStrictEqual({});
  });
  test('ChannelId is invalid', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const channelJoin = requestChannelJoin(authUser2.token, channel.channelId);
    const res3 = requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    const res5 = requestChannelRemoveOwner(authUser.token, channel.channelId + 1, authUser2.authUserId);
    const RemoveOwner = JSON.parse(String(res5.getBody(('utf-8'))));
    expect(res5.statusCode).toBe(OK);
    expect(RemoveOwner).toStrictEqual(errorMsg);
  });
  test('uId is invalid', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const channelJoin = requestChannelJoin(authUser2.token, channel.channelId);
    const res3 = requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    const res5 = requestChannelRemoveOwner(authUser.token, channel.channelId, authUser2.authUserId + 9);
    const RemoveOwner = JSON.parse(String(res5.getBody(('utf-8'))));
    expect(res5.statusCode).toBe(OK);
    expect(RemoveOwner).toStrictEqual(errorMsg);
  });
  test('uId is not part of channel', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const authUser3 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const res3 = requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    const res5 = requestChannelRemoveOwner(authUser.token, channel.channelId, authUser3.authUserId);
    const RemoveOwner = JSON.parse(String(res5.getBody(('utf-8'))));
    expect(res5.statusCode).toBe(OK);
    expect(RemoveOwner).toStrictEqual(errorMsg);
  });
  test('uId is only owner', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const res5 = requestChannelRemoveOwner(authUser.token, channel.channelId, authUser.authUserId);
    const RemoveOwner = JSON.parse(String(res5.getBody(('utf-8'))));
    expect(res5.statusCode).toBe(OK);
    expect(RemoveOwner).toStrictEqual(errorMsg);
  });
  test('token is not owner', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    const channelJoin = requestChannelJoin(authUser2.token, channel.channelId);
    const res5 = requestChannelRemoveOwner(authUser2.token, channel.channelId, authUser2.authUserId);
    const RemoveOwner = JSON.parse(String(res5.getBody(('utf-8'))));
    expect(res5.statusCode).toBe(OK);
    expect(RemoveOwner).toStrictEqual(errorMsg);
  });
});