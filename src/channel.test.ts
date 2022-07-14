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

function requestChannelLeave(token: string, channelId: number) {
  return requestHelper('POST', '/channel/leave/v1', { token, channelId });
}

function requestChannelDetails(token: string, channelId: number) {
  return requestHelper('GET', '/channel/details/v2', { token, channelId });
}

function requestUserProfile(token: string, uId: number) {
  return requestHelper('GET', '/user/profile/v2', { token, uId });
}

function requestChannelCreate(token: string, name: string, isPublic: boolean) {
  const res = requestHelper('POST', '/channels/create/v2', { token, name, isPublic });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
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
  return JSON.parse(String(res.getBody()));
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

describe('Testing channelMessagesV1', () => {
  test('Empty messages', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const res3 = requestChannelMessages(authUser.token, channel.channelId, 0);
    const messages = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
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
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const res3 = requestChannelMessages(authUser.token, channel.channelId, 1);
    const messages = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(messages).toStrictEqual(errorMsg);
  });
  test('ChannelId is invalid', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const res3 = requestChannelMessages(authUser.token, channel.channelId + 1, 0);
    const messages = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(messages).toStrictEqual(errorMsg);
  });
  test('ChannelId is valid but user is not part of channel', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const res3 = requestChannelMessages(authUser2.token, channel.channelId, 1);
    const messages = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(messages).toStrictEqual(errorMsg);
  });
});

/// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('Testing channelDetailsV2', () => {
  test('Success', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
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
          nameLast: userInfo.user.nameLast
        }],
        ownerMembers: [{
          uId: userInfo.user.uId,
          email: userInfo.user.email,
          handleStr: userInfo.user.handleStr,
          nameFirst: userInfo.user.nameFirst,
          nameLast: userInfo.user.nameLast
        }],
      })
    );
  });
  test('ChannelId is invalid', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const res3 = requestChannelDetails(authUser.token, 1);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual(errorMsg);
  });
  test('ChannelId is valid but user is not part of channel', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const res3 = requestChannelDetails(authUser2.token, channel.channelId);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual(errorMsg);
  });
});

/// //////////////////////////////////////////////////////////////////////////

describe('Testing channelLeaveV1', () => {
  test('Pass scenario', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
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
          nameLast: userInfo.user.nameLast
        }],
      })
    );
  });
  test('ChannelId is invalid', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const res3 = requestChannelLeave(authUser.token, channel.channelId + 1);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual(errorMsg);
  });
  test('ChannelId is valid but user is not part of channel', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const res3 = requestChannelLeave(authUser2.token, channel.channelId);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual(errorMsg);
  });
});

/// ////////////////////////////////////////////////////////////////////////////////////////////////

describe('Testing channelAddOwnerV1', () => {
  test('Pass scenario', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const res5 = requestUserProfile(authUser.token, authUser.authUserId);
    const userInfo = JSON.parse(String(res5.getBody(('utf-8'))));
    expect(res5.statusCode).toBe(OK);
    const res6 = requestUserProfile(authUser2.token, authUser2.authUserId);
    const userInfo2 = JSON.parse(String(res6.getBody(('utf-8'))));
    expect(res6.statusCode).toBe(OK);
    const channelJoin = requestChannelJoin(authUser2.token, channel.channelId);
    const res9 = requestChannelDetails(authUser2.token, channel.channelId);
    const channeldetails2 = JSON.parse(String(res9.getBody(('utf-8'))));
    expect(res9.statusCode).toBe(OK);
    console.log(channeldetails2);
    expect(channeldetails2).toStrictEqual(
      expect.objectContaining({
        name: 'correct name',
        isPublic: true,
        ownerMembers: [{
          uId: userInfo.user.uId,
          email: userInfo.user.email,
          handleStr: userInfo.user.handleStr,
          nameFirst: userInfo.user.nameFirst,
          nameLast: userInfo.user.nameLast}],
        allMembers: [{
          uId: userInfo.user.uId,
          email: userInfo.user.email,
          handleStr: userInfo.user.handleStr,
          nameFirst: userInfo.user.nameFirst,
          nameLast: userInfo.user.nameLast
        },
          {
          uId: userInfo2.user.uId,
          email: userInfo2.user.email,
          handleStr: userInfo2.user.handleStr,
          nameFirst: userInfo2.user.nameFirst,
          nameLast: userInfo2.user.nameLast}],
      })
    );
    const res4 = requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId);
    const details = JSON.parse(String(res4.getBody(('utf-8'))));
    expect(res4.statusCode).toBe(OK);
    expect(details).toStrictEqual({});
    const res3 = requestChannelDetails(authUser2.token, channel.channelId);
    const channeldetails = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    console.log(channeldetails)
    expect(channeldetails).toStrictEqual(
      expect.objectContaining({
        name: 'correct name',
        isPublic: true,
        ownerMembers: [{
          uId: userInfo.user.uId,
          email: userInfo.user.email,
          handleStr: userInfo.user.handleStr,
          nameFirst: userInfo.user.nameFirst,
          nameLast: userInfo.user.nameLast
        },
        {
          uId: userInfo2.user.uId,
          email: userInfo2.user.email,
          handleStr: userInfo2.user.handleStr,
          nameFirst: userInfo2.user.nameFirst,
          nameLast: userInfo2.user.nameLast
        }],
        allMembers: [{
          uId: userInfo.user.uId,
          email: userInfo.user.email,
          handleStr: userInfo.user.handleStr,
          nameFirst: userInfo.user.nameFirst,
          nameLast: userInfo.user.nameLast
        },
        {
          uId: userInfo2.user.uId,
          email: userInfo2.user.email,
          handleStr: userInfo2.user.handleStr,
          nameFirst: userInfo2.user.nameFirst,
          nameLast: userInfo2.user.nameLast
        }],
      })
    );
  });
  test('ChannelId is invalid', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const channelJoin = requestChannelJoin(authUser2.token, channel.channelId);
    const res3 = requestChannelAddOwner(authUser.token, channel.channelId + 1, authUser2.authUserId);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual(errorMsg);
  });
  test('uId is invalid', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const channelJoin = requestChannelJoin(authUser2.token, channel.channelId);
    const res3 = requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId + 1);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual(errorMsg);
  });
  test('uId is not part of channel', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const res3 = requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual(errorMsg);
  });
  test('uId is already owner', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const res3 = requestChannelAddOwner(authUser.token, channel.channelId, authUser.authUserId);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual(errorMsg);
  });
  test('token is not owner', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const channelJoin = requestChannelJoin(authUser2.token, channel.channelId);
    const res3 = requestChannelAddOwner(authUser2.token, channel.channelId, authUser.authUserId);
    const details = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    expect(details).toStrictEqual(errorMsg);
  });
});

/// /////////////////////////////////

describe('Testing channelRemoveOwnerV1', () => {
  //
  test('Pass scenario', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const channelJoin = requestChannelJoin(authUser2.token, channel.channelId);
    const res4 = requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId);
    const details = JSON.parse(String(res4.getBody(('utf-8'))));
    expect(res4.statusCode).toBe(OK);
    expect(details).toStrictEqual({});
    const res7 = requestChannelRemoveOwner(authUser2.token, channel.channelId, authUser.authUserId);
    const RemoveOwner = JSON.parse(String(res7.getBody(('utf-8'))));
    expect(res7.statusCode).toBe(OK);
    expect(RemoveOwner).toStrictEqual({});
    const res5 = requestUserProfile(authUser.token, authUser.authUserId);
    const userInfo = JSON.parse(String(res5.getBody(('utf-8'))));
    expect(res5.statusCode).toBe(OK);
    const res6 = requestUserProfile(authUser2.token, authUser2.authUserId);
    const userInfo2 = JSON.parse(String(res6.getBody(('utf-8'))));
    expect(res6.statusCode).toBe(OK);
    const res3 = requestChannelDetails(authUser2.token, channel.channelId);
    const channeldetails = JSON.parse(String(res3.getBody(('utf-8'))));
    expect(res3.statusCode).toBe(OK);
    // console.log(channeldetails);
    expect(channeldetails).toStrictEqual(
      expect.objectContaining({
        name: 'correct name',
        isPublic: true,
        ownerMembers: [{
          uId: userInfo2.user.uId,
          email: userInfo2.user.email,
          handleStr: userInfo2.user.handleStr,
          nameFirst: userInfo2.user.nameFirst,
          nameLast: userInfo2.user.nameLast
        }],
        allMembers: [{
          uId: userInfo.user.uId,
          email: userInfo.user.email,
          handleStr: userInfo.user.handleStr,
          nameFirst: userInfo.user.nameFirst,
          nameLast: userInfo.user.nameLast
        },
        {
          uId: userInfo2.user.uId,
          email: userInfo2.user.email,
          handleStr: userInfo2.user.handleStr,
          nameFirst: userInfo2.user.nameFirst,
          nameLast: userInfo2.user.nameLast
        }],
      })
    );
  });
  test('ChannelId is invalid', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
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
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
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
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
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
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const res5 = requestChannelRemoveOwner(authUser.token, channel.channelId, authUser.authUserId);
    const RemoveOwner = JSON.parse(String(res5.getBody(('utf-8'))));
    expect(res5.statusCode).toBe(OK);
    expect(RemoveOwner).toStrictEqual(errorMsg);
  });
  test('token is not owner', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const channelJoin = requestChannelJoin(authUser2.token, channel.channelId);
    const res5 = requestChannelRemoveOwner(authUser2.token, channel.channelId, authUser2.authUserId);
    const RemoveOwner = JSON.parse(String(res5.getBody(('utf-8'))));
    expect(res5.statusCode).toBe(OK);
    expect(RemoveOwner).toStrictEqual(errorMsg);
  });
});

// Tests for channelInviteV1
// describe('Testing channelInviteV1', () =>  {

//     const authUserID1 = authRegisterV1('test1@gmail.com', '123abc!@#', 'Test1', 'Smith');
//     const authUserID2 = authRegisterV1('test2@gmail.com', '123abc!@#', 'Test2', 'Smith');
//     const channelID = channelsCreateV1(authUserID1.authUserId, 'Channel1', true);

//     test ('Valid inputs', () => {
//         const authUserID1 = authRegisterV1('test1@gmail.com', '123abc!@#', 'Test1', 'Smith');
//         const authUserID2 = authRegisterV1('test2@gmail.com', '123abc!@#', 'Test2', 'Smith');
//         const channelID = channelsCreateV1(authUserID1.authUserId, 'Channel1', true);
//         const validInput = channelInviteV1(authUserID1.authUserId, channelID.channelId, authUserID2.authUserId);
//         expect(validInput).toEqual({});
//     });

//     test ('Invalid channelID', () => {
//         const invalidChannelID = channelInviteV1(authUserID1.authUserId, -1, authUserID2.authUserId);
//         expect(invalidChannelID).toEqual({ error: 'error' });
//     });

//     test ('Invalid userID', () => {
//         const invalidUserID = channelInviteV1(authUserID1.authUserId, channelID.channelId, -1);
//         expect(invalidUserID).toEqual({ error: 'error' });
//     });

//     test ('User is already a member', () => {
//         channelJoinV1(authUserID2.authUserId, channelID.channelId);
//         const alreadyMember = channelInviteV1(authUserID1.authUserId, channelID.channelId, authUserID2.authUserId);
//         expect(alreadyMember).toEqual({ error: 'error' });
//     });

//     test ('Authorised user is not a member', () => {
//         const notMember = channelInviteV1(authUserID1.authUserId, channelID.channelId, authUserID2.authUserId);
//         expect(notMember).toEqual({ error: 'error' });
//     })
// })

// Tests for channelMessagesV1

// describe("channelMessages Pass scenarios", () => {
//   test("Empty messages", () => {
//     const id = authRegisterV1(
//       "hayden@gmail.com",
//       "hayden123",
//       "Hayden",
//       "Smith"
//     );
//     const channel1 = channelsCreateV1(id.authUserId, "Hayden", true);

//     expect(channelMessagesV1(id.authUserId, channel1.channelId, 0)).toEqual({
//       messages: [],
//       start: 0,
//       end: -1,
//     });
//   });
// });

// describe("channelMessages Fail scenarios", () => {
//   test("Start is greater than messages", () => {
//     const id = authRegisterV1(
//       "hayden@gmail.com",
//       "hayden123",
//       "Hayden",
//       "Smith"
//     );

//     const channel1 = channelsCreateV1(id.authUserId, "Hayden", true);

//     expect(channelMessagesV1(id.authUserId, channel1.channelId, 1)).toEqual({
//       error: "error",
//     });
//   });
//   test("ChannelId is invalid", () => {
//     const id = authRegisterV1(
//       "hayden@gmail.com",
//       "hayden123",
//       "Hayden",
//       "Smith"
//     );

//     const channel1 = channelsCreateV1(id.authUserId, "Hayden", true);
//     let invalidId = channel1.channelId + 1;

//     expect(channelMessagesV1(id.authUserId, invalidId, 0)).toEqual({
//       error: "error",
//     });
//   });
//   test("ChannelId is valid but user is not part of channel", () => {
//     const id = authRegisterV1(
//       "hayden@gmail.com",
//       "hayden123",
//       "Hayden",
//       "Smith"
//     );

//     const id2 = authRegisterV1(
//       "nathan@gmail.com",
//       "nathan123",
//       "Nathan",
//       "Brown"
//     );

//     const channel1 = channelsCreateV1(id.authUserId, "Hayden", true);

//     expect(channelMessagesV1(id2.authUserId, channel1.channelId, 0)).toEqual({
//       error: "error",
//     });
//   });
// });

// describe('Testing channelDetailsV1', () => {
//     test('channelId is valid and the authorised user is not a member of the channel', () => {
//         const authUser = authRegisterV1('hayden@gmail.com', 'password', 'Hayden', 'Smith');
//         const authUser2 = authRegisterV1('john@gmail.com', 'password', 'John', 'Smith');
//         const createChannel = channelsCreateV1(authUser2.authUserId, 'crazyTown', true);
//         const channelDetail = channelDetailsV1(authUser.authUserId, createChannel.channelId);
//         expect(channelDetail).toStrictEqual({error: 'error'});
//     });
//     test('Invalid ChannelId', () => {
//         const authUser = authRegisterV1('jason@gmail.com', 'password', 'Jason', 'Smith');
//         const channelId = 2; // this channelId is invalid as no channel is created
//         const channelDetail = channelDetailsV1(authUser.authUserId, channelId);
//         expect(channelDetail).toStrictEqual({error: 'error'});
//     });
//     test('Positive test case', () => {
//         const authUser = authRegisterV1('hayden@gmail.com', 'password', 'Hayden', 'Smith');
//         const createChannel = channelsCreateV1(authUser.authUserId, 'crazyTown', true);
//         const channelDetail = channelDetailsV1(authUser.authUserId, createChannel.channelId);
//         const channelList = channelsListV1(authUser.authUserId);
//         let user = {
//             uId: authUser.authUserId,
//             email: 'hayden@gmail.com',
//             nameFirst: 'hayden',
//             nameLast: 'smith',
//             handleStr: 'haydensmith',
//         }
//         expect(channelDetail).toStrictEqual({
//              name: 'crazyTown',
//              isPublic: true,
//              ownerMembers: [user],
//              allMembers: [user],
//         });
//     });
// });

describe('Testing channelJoinV1', () => {
  test('Invalid ChannelId', () => {
    const authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channelJoin = requestChannelJoin(authUser.token, 1);
    expect(channelJoin).toStrictEqual(errorMsg);
  });
  test('the authorised user is already a member of the channel', () => {
    const authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channel = requestChannelCreate(authUser.token, 'name', true);
    const channelJoin = requestChannelJoin(authUser.token, channel.channelId);
    expect(channelJoin).toStrictEqual(errorMsg);
  });
  test('Adding non-global user to a private channel', () => {
    const authUser1 = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser1.token, 'name', false);
    const channelJoin = requestChannelJoin(authUser2.token, channel.channelId);
    // Auth user is not channel member or global owner
    expect(channelJoin).toStrictEqual(errorMsg);
  });
  test('positive case', () => {
    const authUser1 = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser2.token, 'name', false);
    const channelJoin = requestChannelJoin(authUser1.token, channel.channelId);
    expect(channelJoin).toStrictEqual({});
  });
});

// describe("channelMessages Pass scenarios", () => {
//   test("Empty messages", () => {
//     const id = authRegisterV1(
//       "hayden@gmail.com",
//       "hayden123",
//       "Hayden",
//       "Smith"
//     );
//     const channel1 = channelsCreateV1(id.authUserId, "Hayden", true);

//     expect(channelMessagesV1(id.authUserId, channel1.channelId, 0)).toEqual({
//       messages: [],
//       start: 0,
//       end: -1,
//     });
//   });
// });

// describe("channelMessages Fail scenarios", () => {
//   test("Start is greater than messages", () => {
//     const id = authRegisterV1(
//       "hayden@gmail.com",
//       "hayden123",
//       "Hayden",
//       "Smith"
//     );

//     const channel1 = channelsCreateV1(id.authUserId, "Hayden", true);

//     expect(channelMessagesV1(id.authUserId, channel1.channelId, 1)).toEqual({
//       error: "error",
//     });
//   });
//   test("ChannelId is invalid", () => {
//     const id = authRegisterV1(
//       "hayden@gmail.com",
//       "hayden123",
//       "Hayden",
//       "Smith"
//     );

//     const channel1 = channelsCreateV1(id.authUserId, "Hayden", true);
//     let invalidId = channel1.channelId + 1;

//     expect(channelMessagesV1(id.authUserId, invalidId, 0)).toEqual({
//       error: "error",
//     });
//   });
//   test("ChannelId is valid but user is not part of channel", () => {
//     const id = authRegisterV1(
//       "hayden@gmail.com",
//       "hayden123",
//       "Hayden",
//       "Smith"
//     );

//     const id2 = authRegisterV1(
//       "nathan@gmail.com",
//       "nathan123",
//       "Nathan",
//       "Brown"
//     );

//     const channel1 = channelsCreateV1(id.authUserId, "Hayden", true);

//     expect(channelMessagesV1(id2.authUserId, channel1.channelId, 0)).toEqual({
//       error: "error",
//     });
//   });
// });
