import { requestChannelCreate, requestChannelMessages, requestChannelInvite, requestChannelAddOwner, requestChannelRemoveOwner, requestChannelJoin, requestChannelLeave, requestChannelDetails, requestMessageSend } from './helperTests';
import { authUserReturn, requestAuthRegister, requestUserProfile, requestClear, errorMsg } from './helperTests';
import { removeFile } from './helperTests';

import {requestChannelsListAll,requestAllUsers} from './helperTests';

let authUser: authUserReturn;

beforeEach(() => {
  removeFile();
  requestClear();
  authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
});

afterEach(() => {
  removeFile();
  requestClear();
});

describe('Testing channelMessagesV1', () => {
  test('Empty messages', () => {
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const messages = requestChannelMessages(authUser.token, channel.channelId, 0);
    expect(messages).toStrictEqual(
      expect.objectContaining({
        messages: [],
        start: 0,
        end: -1,
      })
    );
  });
  test('Contains 50 messages', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    for (let i = 0; i < 60; i++) {
      requestMessageSend(authUser.token, channel.channelId, 'message');
    }
    const messages = requestChannelMessages(authUser.token, channel.channelId, 5);
    expect(messages.end).toStrictEqual(55);
  });
  test('Start is greater than messages', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const messages = requestChannelMessages(authUser.token, channel.channelId, 1);
    expect(messages).toStrictEqual(errorMsg);
  });
  test('ChannelId is invalid', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const messages = requestChannelMessages(authUser.token, channel.channelId + 1, 0);
    expect(messages).toStrictEqual(errorMsg);
  });
  test('ChannelId is valid but user is not part of channel', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const messages = requestChannelMessages(authUser2.token, channel.channelId, 1);
    expect(messages).toStrictEqual(errorMsg);
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
  test('ChannelId is invalid', () => {
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const details = requestChannelDetails(authUser.token, channel.channelId + 1);
    expect(details).toStrictEqual(errorMsg);
  });
  test('ChannelId is valid but user is not part of channel', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const details = requestChannelDetails(authUser2.token, channel.channelId);
    expect(details).toStrictEqual(errorMsg);
  });
});

/// //////////////////////////////////////////////////////////////////////////

describe('Testing channelLeaveV1', () => {
  test('Pass scenario, user leaves channel', () => {
    const user = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    requestChannelJoin(user.token, channel.channelId);
    requestChannelLeave(authUser.token, channel.channelId);
    const userInfo = requestUserProfile(user.token, user.authUserId);
    const channeldetails = requestChannelDetails(user.token, channel.channelId);
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
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const details = requestChannelLeave(authUser.token, channel.channelId + 1);
    expect(details).toStrictEqual(errorMsg);
  });
  test('ChannelId is valid but user is not part of channel', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const details = requestChannelLeave(authUser2.token, channel.channelId);
    expect(details).toStrictEqual(errorMsg);
  });
});

/// ////////////////////////////////////////////////////////////////////////////////////////////////

describe('Testing channelAddOwnerV1', () => {
  test('Pass scenario', () => {
    const newOwner = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const userInfo = requestUserProfile(authUser.token, authUser.authUserId);
    const newUserInfo = requestUserProfile(newOwner.token, newOwner.authUserId);
    // Add the new potential owner to the channel
    requestChannelJoin(newOwner.token, channel.channelId);
    const channeldetails2 = requestChannelDetails(newOwner.token, channel.channelId);
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
    const details = requestChannelAddOwner(authUser.token, channel.channelId, newOwner.authUserId);
    expect(details).toStrictEqual({});
    const channeldetails = requestChannelDetails(newOwner.token, channel.channelId);
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
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    requestChannelJoin(authUser2.token, channel.channelId);
    const details = requestChannelAddOwner(authUser.token, channel.channelId + 1, authUser2.authUserId);
    expect(details).toStrictEqual(errorMsg);
  });
  test('uId is invalid', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    requestChannelJoin(authUser2.token, channel.channelId);
    const details = requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId + 1);
    expect(details).toStrictEqual(errorMsg);
  });
  test('uId is not part of channel', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const details = requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId);
    expect(details).toStrictEqual(errorMsg);
  });
  test('uId is already owner', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const details = requestChannelAddOwner(authUser.token, channel.channelId, authUser.authUserId);
    expect(details).toStrictEqual(errorMsg);
  });
  test('token is not owner', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    requestChannelJoin(authUser2.token, channel.channelId);
    const details = requestChannelAddOwner(authUser2.token, channel.channelId, authUser.authUserId);
    expect(details).toStrictEqual(errorMsg);
  });
});

/// /////////////////////////////////

describe('Testing channelRemoveOwnerV1', () => {
  //
  test('Pass scenario - 2 owners, remove 1', () => {
    const removeOwner = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    requestChannelJoin(removeOwner.token, channel.channelId);
    const details = requestChannelAddOwner(authUser.token, channel.channelId, removeOwner.authUserId);
    expect(details).toStrictEqual({});
    const details2 = requestChannelRemoveOwner(authUser.token, channel.channelId, removeOwner.authUserId);
    expect(details2).toStrictEqual({});
    
    const userInfo = requestUserProfile(authUser.token, authUser.authUserId);
    const removeUserInfo = requestUserProfile(removeOwner.token, removeOwner.authUserId);
    const channeldetails = requestChannelDetails(removeOwner.token, channel.channelId);
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
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    requestChannelJoin(authUser2.token, channel.channelId);
    requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId);
    const RemoveOwner = requestChannelRemoveOwner(authUser.token, channel.channelId + 1, authUser2.authUserId);
    expect(RemoveOwner).toStrictEqual(errorMsg);
  });
  test('uId is invalid', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    requestChannelJoin(authUser2.token, channel.channelId);
    requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId);
    const RemoveOwner = requestChannelRemoveOwner(authUser.token, channel.channelId, authUser2.authUserId + 9);
    expect(RemoveOwner).toStrictEqual(errorMsg);
  });
  test('uId is not part of channel', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const authUser3 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId);
    const RemoveOwner = requestChannelRemoveOwner(authUser.token, channel.channelId, authUser3.authUserId);
    expect(RemoveOwner).toStrictEqual(errorMsg);
  });
  test('uId is only owner', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const RemoveOwner = requestChannelRemoveOwner(authUser.token, channel.channelId, authUser.authUserId);
    expect(RemoveOwner).toStrictEqual(errorMsg);
  });
  test('token is not owner', () => {
    const authUser = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    requestChannelJoin(authUser2.token, channel.channelId);
    const RemoveOwner = requestChannelRemoveOwner(authUser2.token, channel.channelId, authUser2.authUserId);
    expect(RemoveOwner).toStrictEqual(errorMsg);
  });
});

// Tests for channelInviteV1
describe('Testing channelInviteV1', () => {
  test('Valid inputs', () => {
    const authUserId2 = requestAuthRegister('test2@gmail.com', '123abc!@#', 'Test2', 'Smith');
    const channelId = requestChannelCreate(authUser.token, 'Channel1', true);
    const validInput = requestChannelInvite(authUser.token, channelId.channelId, authUserId2.authUserId);
    expect(validInput).toEqual({});
  });

  test('Invalid channelID', () => {
    const authUserId2 = requestAuthRegister('test2@gmail.com', '123abc!@#', 'Test2', 'Smith');
    const invalidChannelId = requestChannelInvite(authUser.token, -1, authUserId2.authUserId);
    expect(invalidChannelId).toEqual({ error: 'error' });
  });

  test('Invalid userID', () => {
    const channelId = requestChannelCreate(authUser.token, 'Channel1', true);
    const invalidUserId = requestChannelInvite(authUser.token, channelId.channelId, -1);
    expect(invalidUserId).toEqual({ error: 'error' });
  });

  test('User is already a member', () => {
    const authUserId2 = requestAuthRegister('test2@gmail.com', '123abc!@#', 'Test2', 'Smith');
    const channelId = requestChannelCreate(authUser.token, 'Channel1', true);
    requestChannelJoin(authUserId2.token, channelId.channelId);
    const alreadyMember = requestChannelInvite(authUser.token, channelId.channelId, authUserId2.authUserId);
    expect(alreadyMember).toEqual({ error: 'error' });
  });

  test('Authorised user is not a member', () => {
    const authUserId2 = requestAuthRegister('test2@gmail.com', '123abc!@#', 'Test2', 'Smith');
    const channelId = requestChannelCreate(authUserId2.token, 'Channel1', true);
    const notMember = requestChannelInvite(authUser.token, channelId.channelId, authUserId2.authUserId);
    expect(notMember).toEqual({ error: 'error' });
  });
});

describe('Testing channelJoinV1', () => {
  test('Invalid ChannelId', () => {
    const channelJoin = requestChannelJoin(authUser.token, 1);
    expect(channelJoin).toStrictEqual(errorMsg);
  });
  test('the authorised user is already a member of the channel', () => {
    const channel = requestChannelCreate(authUser.token, 'name', true);
    const channelJoin = requestChannelJoin(authUser.token, channel.channelId);
    expect(channelJoin).toStrictEqual(errorMsg);
  });
  test('Adding non-global user to a private channel', () => {
    const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'name', false);
    const channelJoin = requestChannelJoin(authUser2.token, channel.channelId);
    // Auth user is not channel member or global owner
    expect(channelJoin).toStrictEqual(errorMsg);
  });
  test('positive case', () => {
    const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser2.token, 'name', true);
    const channelJoin = requestChannelJoin(authUser.token, channel.channelId);
    const channelDetails = requestChannelDetails(authUser.token, channel.channelId);
    expect(channelJoin).toStrictEqual({});
    expect(channelDetails).toStrictEqual(
      {
        name: 'name',
        isPublic: true,
        ownerMembers: [
          {
            uId: authUser2.authUserId,
            email:'email2@gmail.com',
            nameFirst: 'firstname2',
            nameLast: 'lastname2',
            handleStr: 'firstname2lastname2'
          }
        ],
        allMembers: [
          {
            uId: authUser2.authUserId,
            email:'email2@gmail.com',
            nameFirst: 'firstname2',
            nameLast: 'lastname2',
            handleStr: 'firstname2lastname2'
          },
          {
            uId: authUser.authUserId,
            email:'email1@gmail.com',
            nameFirst: 'firstname1',
            nameLast: 'lastname1',
            handleStr: 'firstname1lastname1'
          }
        ]
      }
    );
  });
});

