import { requestChannelCreate, requestChannelMessages, requestChannelInvite, requestChannelAddOwner, requestChannelRemoveOwner, requestChannelJoin, requestChannelLeave, requestChannelDetails } from './helperTests';
import { authUserReturn, requestAuthRegister, requestUserProfile, requestClear, errorMsg } from './helperTests';

let authUser: authUserReturn;

beforeEach(() => {
  requestClear();
  authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
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
  test('Pass scenario', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    requestChannelJoin(authUser2.token, channel.channelId);
    requestChannelLeave(authUser.token, channel.channelId);
    const userInfo = requestUserProfile(authUser2.token, authUser2.authUserId);
    const channeldetails = requestChannelDetails(authUser2.token, channel.channelId);
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
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    const userInfo = requestUserProfile(authUser.token, authUser.authUserId);
    const userInfo2 = requestUserProfile(authUser2.token, authUser2.authUserId);
    requestChannelJoin(authUser2.token, channel.channelId);
    const channeldetails2 = requestChannelDetails(authUser2.token, channel.channelId);
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
          uId: userInfo2.user.uId,
          email: userInfo2.user.email,
          handleStr: userInfo2.user.handleStr,
          nameFirst: userInfo2.user.nameFirst,
          nameLast: userInfo2.user.nameLast
        }],
      })
    );
    const details = requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId);
    expect(details).toStrictEqual({});
    const channeldetails = requestChannelDetails(authUser2.token, channel.channelId);
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
  test('Pass scenario', () => {
    const authUser2 = requestAuthRegister('emai2@gmail.com', 'password2', 'firstname2', 'lastname2');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    requestChannelJoin(authUser2.token, channel.channelId);
    const details = requestChannelAddOwner(authUser.token, channel.channelId, authUser2.authUserId);
    expect(details).toStrictEqual({});
    const RemoveOwner = requestChannelRemoveOwner(authUser2.token, channel.channelId, authUser.authUserId);
    expect(RemoveOwner).toStrictEqual({});
    const userInfo = requestUserProfile(authUser.token, authUser.authUserId);
    const userInfo2 = requestUserProfile(authUser2.token, authUser2.authUserId);
    const channeldetails = requestChannelDetails(authUser2.token, channel.channelId);
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
    const channel = requestChannelCreate(authUser2.token, 'name', false);
    const channelJoin = requestChannelJoin(authUser.token, channel.channelId);
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
