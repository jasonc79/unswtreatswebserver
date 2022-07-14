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
  return JSON.parse(String(res.getBody()));
}

function requestChannelJoin(token: string, channelId: number) {
  const res = requestHelper('POST', '/channel/join/v2', { token, channelId });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

function requestChannelInvite(token: string, channelId: number, uId: number) {
  const res = requestHelper('POST', '/channel/invite/v2', { token, channelId, uId });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

beforeEach(() => {
  requestClear();
});

// Tests for channelInviteV1
describe('Testing channelInviteV1', () => {
  const authUserID1 = requestAuthRegister('test1@gmail.com', '123abc!@#', 'Test1', 'Smith');
  const authUserID2 = requestAuthRegister('test2@gmail.com', '123abc!@#', 'Test2', 'Smith');
  const channelID = requestChannelCreate(authUserID1.authUserId, 'Channel1', true);

  test('Valid inputs', () => {
    const authUserID1 = requestAuthRegister('test1@gmail.com', '123abc!@#', 'Test1', 'Smith');
    const authUserID2 = requestAuthRegister('test2@gmail.com', '123abc!@#', 'Test2', 'Smith');
    const channelID = requestChannelCreate(authUserID1.authUserId, 'Channel1', true);
    const validInput = requestChannelInvite(authUserID1.authUserId, channelID.channelId, authUserID2.authUserId);
    expect(validInput).toStrictEqual({});
  });

  test('Invalid channelID', () => {
    const invalidChannelID = requestChannelInvite(authUserID1.authUserId, -1, authUserID2.authUserId);
    expect(invalidChannelID).toStrictEqual({ error: 'error' });
  });

  test('Invalid userID', () => {
    const invalidUserID = requestChannelInvite(authUserID1.authUserId, channelID.channelId, -1);
    expect(invalidUserID).toStrictEqual({ error: 'error' });
  });

  test('User is already a member', () => {
    const channelJoin = requestChannelJoin(authUserID2.authUserId, channelID.channelId);
    const alreadyMember = requestChannelInvite(authUserID1.authUserId, channelID.channelId, authUserID2.authUserId);
    expect(alreadyMember).toStrictEqual({ error: 'error' });
  });

  test('Authorised user is not a member', () => {
    const notMember = requestChannelInvite(authUserID1.authUserId, channelID.channelId, authUserID2.authUserId);
    expect(notMember).toStrictEqual({ error: 'error' });
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
