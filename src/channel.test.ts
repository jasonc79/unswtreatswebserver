import { requestChannelCreate, requestChannelMessages, requestChannelInvite, requestChannelAddOwner, requestChannelRemoveOwner, requestChannelJoin, requestChannelLeave, requestChannelDetails, requestMessageSend } from './helperTests';
import { authUserReturn, requestAuthRegister, requestUserProfile, requestClear } from './helperTests';
import { removeFile } from './helperTests';

let authUser: authUserReturn;

beforeEach(() => {
  removeFile();
  requestClear();
  authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1', 200);
});

afterEach(() => {
  removeFile();
  requestClear();
});

describe('Testing channelMessagesV1', () => {
  test('Invalid token', () => {
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelMessages('bad', channel.channelId, 0, 403);
  });
  test('Empty messages', () => {
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    const messages = requestChannelMessages(authUser.token, channel.channelId, 0, 200);
    expect(messages).toStrictEqual(
      expect.objectContaining({
        messages: [],
        start: 0,
        end: -1,
      })
    );
  });
  test('Contains 50 messages', () => {
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    for (let i = 0; i < 60; i++) {
      requestMessageSend(authUser.token, channel.channelId, 'message', 200);
    }
    const messages = requestChannelMessages(authUser.token, channel.channelId, 5, 200);
    expect(messages.end).toStrictEqual(55);
  });
  test('Start is greater than messages', () => {
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelMessages(authUser.token, channel.channelId, 1, 400);
  });
  test('ChannelId is invalid', () => {
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelMessages(authUser.token, channel.channelId + 1, 0, 400);
  });
  test('Token is invalid', () => {
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelMessages(authUser.token + 1, channel.channelId, 0, 403);
  });

  test('ChannelId is valid but user is not part of channel', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelMessages(authUser2.token, channel.channelId, 1, 403);
  });
});

/// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('Testing channelDetailsV2', () => {
  test('Success', () => {
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const userInfo = requestUserProfile(authUser.token, authUser.authUserId);
    const details = requestChannelDetails(authUser.token, channel.channelId);
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
  test('Testing invalid token (403)', () => {
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelDetails(authUser.token + 1, channel.channelId, 403);
  });
  test('ChannelId is invalid', () => {
    requestChannelDetails(authUser.token, 0, 400);
  });
  test('ChannelId is valid but user is not part of channel', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelDetails(authUser2.token, channel.channelId, 403);
  });
});

/// //////////////////////////////////////////////////////////////////////////

describe('Testing channelLeaveV2', () => {
  test('Pass scenario, user leaves channel', () => {
    const user = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelJoin(user.token, channel.channelId, 200);
    requestChannelLeave(authUser.token, channel.channelId, 200);
    const userInfo = requestUserProfile(user.token, user.authUserId, 200);
    const channeldetails = requestChannelDetails(user.token, channel.channelId, 200);
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
  test('Token is invalid', () => {
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelLeave(authUser.token + 1, channel.channelId, 403);
  });
  test('ChannelId is invalid', () => {
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelLeave(authUser.token, channel.channelId + 1, 400);
  });
  test('ChannelId is valid but user is not part of channel', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelLeave(authUser2.token, channel.channelId, 403);
  });
  /*
  Add test for standup
  */
});

/// ////////////////////////////////////////////////////////////////////////////////////////////////

describe('Testing channelAddOwnerV1', () => {
  test('Pass scenario', () => {
    const newOwner = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    const userInfo = requestUserProfile(authUser.token, authUser.authUserId, 200);
    const newUserInfo = requestUserProfile(newOwner.token, newOwner.authUserId, 200);
    // Add the new potential owner to the channel
    requestChannelJoin(newOwner.token, channel.channelId, 200);
    const channeldetails2 = requestChannelDetails(newOwner.token, channel.channelId, 200);
    expect(channeldetails2).toStrictEqual(
      expect.objectContaining({
        name: 'correct name',
        isPublic: true,
        ownerMembers: [{
          uId: userInfo.user.uId,
          email: userInfo.user.email,
          handleStr: userInfo.user.handleStr,
          nameFirst: userInfo.user.nameFirst,
          nameLast: userInfo.user.nameLast
        }],
        allMembers: [{
          uId: userInfo.user.uId,
          email: userInfo.user.email,
          handleStr: userInfo.user.handleStr,
          nameFirst: userInfo.user.nameFirst,
          nameLast: userInfo.user.nameLast
        },
        {
          uId: newUserInfo.user.uId,
          email: newUserInfo.user.email,
          handleStr: newUserInfo.user.handleStr,
          nameFirst: newUserInfo.user.nameFirst,
          nameLast: newUserInfo.user.nameLast
        }],
      })
    );
    requestChannelAddOwner(authUser.token, channel.channelId, newOwner.authUserId, 200);
    const channeldetails = requestChannelDetails(newOwner.token, channel.channelId, 200);
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
          uId: newUserInfo.user.uId,
          email: newUserInfo.user.email,
          handleStr: newUserInfo.user.handleStr,
          nameFirst: newUserInfo.user.nameFirst,
          nameLast: newUserInfo.user.nameLast
        }],
        allMembers: [{
          uId: userInfo.user.uId,
          email: userInfo.user.email,
          handleStr: userInfo.user.handleStr,
          nameFirst: userInfo.user.nameFirst,
          nameLast: userInfo.user.nameLast
        },
        {
          uId: newUserInfo.user.uId,
          email: newUserInfo.user.email,
          handleStr: newUserInfo.user.handleStr,
          nameFirst: newUserInfo.user.nameFirst,
          nameLast: newUserInfo.user.nameLast
        }],
      })
    );
  });
  test('ChannelId is invalid', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelJoin(authUser2.token, channel.channelId, 200);
    requestChannelAddOwner(authUser.token, channel.channelId + 1, authUser2.authUserId, 400);
  });
  test('uId is invalid', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    requestChannelJoin(authUser2.token, channel.channelId, 200);
    requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId + 1, 400);
  });
  test('uId is not part of channel', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId, 400);
  });
  test('uId is already owner', () => {
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelAddOwner(authUser.token, channel.channelId, authUser.authUserId, 400);
  });
  test('token is invalid', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelJoin(authUser2.token, channel.channelId, 200);
    requestChannelAddOwner('invalid token', channel.channelId, authUser2.authUserId, 403);
  });
  test('token is not owner', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelJoin(authUser2.token, channel.channelId, 200);
    requestChannelAddOwner(authUser2.token, channel.channelId, authUser.authUserId, 403);
  });
});

/// /////////////////////////////////

describe('Testing channelRemoveOwnerV1', () => {
  //
  test('Pass scenario - 2 owners, remove 1', () => {
    const removeOwner = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelJoin(removeOwner.token, channel.channelId, 200);
    requestChannelAddOwner(authUser.token, channel.channelId, removeOwner.authUserId, 200);
    requestChannelRemoveOwner(authUser.token, channel.channelId, removeOwner.authUserId, 200);
    const userInfo = requestUserProfile(authUser.token, authUser.authUserId, 200);
    const removeUserInfo = requestUserProfile(removeOwner.token, removeOwner.authUserId, 200);
    const channeldetails = requestChannelDetails(removeOwner.token, channel.channelId, 200);
    expect(channeldetails).toStrictEqual(
      {
        name: 'correct name',
        isPublic: true,
        ownerMembers: [{
          uId: userInfo.user.uId,
          email: userInfo.user.email,
          handleStr: userInfo.user.handleStr,
          nameFirst: userInfo.user.nameFirst,
          nameLast: userInfo.user.nameLast
        }],
        allMembers: [
          {
            uId: userInfo.user.uId,
            email: userInfo.user.email,
            handleStr: userInfo.user.handleStr,
            nameFirst: userInfo.user.nameFirst,
            nameLast: userInfo.user.nameLast
          },
          {
            uId: removeUserInfo.user.uId,
            email: removeUserInfo.user.email,
            handleStr: removeUserInfo.user.handleStr,
            nameFirst: removeUserInfo.user.nameFirst,
            nameLast: removeUserInfo.user.nameLast
          }],
      }
    );
  });
  test('ChannelId is invalid', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelJoin(authUser2.token, channel.channelId, 200);
    requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId, 200);
    requestChannelRemoveOwner(authUser.token, channel.channelId + 1, authUser2.authUserId, 400);
  });
  test('uId is invalid', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelJoin(authUser2.token, channel.channelId, 200);
    requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId, 200);
    requestChannelRemoveOwner(authUser.token, channel.channelId, authUser2.authUserId + 9, 400);
  });
  test('uId is not part of channel', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    // const authUser3 = requestAuthRegister('emai3@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    // requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId, 200);
    requestChannelRemoveOwner(authUser.token, channel.channelId, authUser2.authUserId, 400);
  });
  test('uId is only owner', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1', 200);
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelRemoveOwner(authUser.token, channel.channelId, authUser.authUserId, 400);
  });
  test('token is not owner', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelJoin(authUser2.token, channel.channelId, 200);
    requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId, 200);
    requestChannelRemoveOwner('invalid token', channel.channelId, authUser.authUserId, 403);
  });
  test('token is not owner', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1', 200);
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelJoin(authUser2.token, channel.channelId, 200);
    requestChannelRemoveOwner(authUser2.token, channel.channelId, authUser2.authUserId, 403);
  });
  test('invalid token', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1', 200);
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
    requestChannelJoin(authUser2.token, channel.channelId, 200);
    requestChannelRemoveOwner('bad', channel.channelId, authUser2.authUserId, 403);
  });
});

// Tests for channelInviteV3
describe('Testing channelInviteV3', () => {
  test('Valid inputs', () => {
    const authUserId2 = requestAuthRegister('test2@gmail.com', '123abc!@#', 'Test2', 'Smith');
    const channelId = requestChannelCreate(authUser.token, 'Channel1', true);
    const validInput = requestChannelInvite(authUser.token, channelId.channelId, authUserId2.authUserId);
    expect(validInput).toEqual({});
  });

  test('Invalid Token', () => {
    const authUserId2 = requestAuthRegister('test2@gmail.com', '123abc!@#', 'Test2', 'Smith');
    const channelId = requestChannelCreate(authUser.token, 'Channel1', true);
    requestChannelInvite(authUser.token + 1, channelId.channelId, authUserId2.authUserId2, 403);
  });
  test('Invalid channelID', () => {
    const authUserId2 = requestAuthRegister('test2@gmail.com', '123abc!@#', 'Test2', 'Smith');
    requestChannelInvite(authUser.token, -1, authUserId2.authUserId, 400);
  });

  test('Invalid userID', () => {
    const channelId = requestChannelCreate(authUser.token, 'Channel1', true);
    requestChannelInvite(authUser.token, channelId.channelId, -1, 400);
  });

  test('User is already a member', () => {
    const authUserId2 = requestAuthRegister('test2@gmail.com', '123abc!@#', 'Test2', 'Smith');
    const channelId = requestChannelCreate(authUser.token, 'Channel1', true);
    requestChannelJoin(authUserId2.token, channelId.channelId);
    requestChannelInvite(authUser.token, channelId.channelId, authUserId2.authUserId, 400);
  });

  test('Authorised user is not a member', () => {
    const authUserId2 = requestAuthRegister('test2@gmail.com', '123abc!@#', 'Test2', 'Smith');
    const authUserId3 = requestAuthRegister('test3@gmail.com', '123abc!@#', 'Test3', 'Smith');
    const channelId = requestChannelCreate(authUserId2.token, 'Channel1', true);
    requestChannelInvite(authUser.token, channelId.channelId, authUserId3.authUserId, 403);
  });
});

describe('Testing channelJoinV1', () => {
  test('Testing invalid token (403)', () => {
    const channel = requestChannelCreate(authUser.token, 'name', true, 200);
    requestChannelJoin(authUser.token + 1, channel.channelId, 403);
  });
  test('Invalid ChannelId', () => {
    requestChannelJoin(authUser.token, 1, 400);
  });
  test('the authorised user is already a member of the channel', () => {
    const channel = requestChannelCreate(authUser.token, 'name', true, 200);
    requestChannelJoin(authUser.token, channel.channelId, 400);
  });
  test('Adding non-global user to a private channel', () => {
    const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    const channel = requestChannelCreate(authUser.token, 'name', false, 200);
    // Auth user is not channel member or global owner
    requestChannelJoin(authUser2.token, channel.channelId, 403);
  });
  test('positive case', () => {
    const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
    const channel = requestChannelCreate(authUser2.token, 'name', true, 200);
    const channelJoin = requestChannelJoin(authUser.token, channel.channelId, 200);
    const channelDetails = requestChannelDetails(authUser.token, channel.channelId, 200);
    expect(channelJoin).toStrictEqual({});
    expect(channelDetails).toStrictEqual(
      {
        name: 'name',
        isPublic: true,
        ownerMembers: [
          {
            uId: authUser2.authUserId,
            email: 'email2@gmail.com',
            nameFirst: 'firstname2',
            nameLast: 'lastname2',
            handleStr: 'firstname2lastname2'
          }
        ],
        allMembers: [
          {
            uId: authUser2.authUserId,
            email: 'email2@gmail.com',
            nameFirst: 'firstname2',
            nameLast: 'lastname2',
            handleStr: 'firstname2lastname2'
          },
          {
            uId: authUser.authUserId,
            email: 'email1@gmail.com',
            nameFirst: 'firstname1',
            nameLast: 'lastname1',
            handleStr: 'firstname1lastname1'
          }
        ]
      }
    );
  });
});
