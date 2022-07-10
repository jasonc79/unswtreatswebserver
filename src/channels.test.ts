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
  return requestHelper('POST', '/channels/create/v2', { token, name, isPublic });
}

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v2', {
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast
  });
}

function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

beforeEach(() => {
  requestClear();
});

// describe("Testing for channelsListallV1", () => {

//   test("No channels", () => {
//     const id = authRegisterV1(
//       "hayden@gmail.com",
//       "hayden123",
//       "Hayden",
//       "Smith"
//     );

//     expect(channelsListallV1(id.authUserId)).toEqual({
//       channels: [],
//     });
//   });

//   test("Single channel", () => {
//     const id = authRegisterV1(
//       "hayden@gmail.com",
//       "hayden123",
//       "Hayden",
//       "Smith"
//     );

//     const channelId = channelsCreateV1(id.authUserId, "Hayden", true);

//     expect(channelsListallV1(id.authUserId)).toEqual({
//       channels: [
//         {
//           channelId: channelId.channelId,
//           name: "Hayden",
//         },
//       ],
//     });
//   });

//   test("More than one channel", () => {
//     const id = authRegisterV1(
//       "hayden@gmail.com",
//       "hayden123",
//       "Hayden",
//       "Smith"
//     );

//     const channel1 = channelsCreateV1(id.authUserId, "Hayden", true);
//     const channel2 = channelsCreateV1(id.authUserId, "Hayden2", true);

//     expect(channelsListallV1(id.authUserId)).toEqual({
//       channels: [
//         {
//           channelId: channel1.channelId,
//           name: "Hayden",
//         },
//         {
//           channelId: channel2.channelId,
//           name: "Hayden2",
//         },
//       ],
//     });
//   });
// });

describe('Testing channelsCreateV1', () => {
  test('Correct Name, is public', () => {
    const res1 = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const res2 = requestChannelCreate(authUser.token, 'correct name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    expect(channel).toStrictEqual(
      expect.objectContaining({
        channelId: expect.any(Number),
      })
    );
  });
  test('Correct Name, is private', () => {
    const res1 = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const res2 = requestChannelCreate(authUser.token, 'correct name', false);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    expect(channel).toStrictEqual(
      expect.objectContaining({
        channelId: expect.any(Number),
      })
    );
  });
  test('Incorrect Name (too small)', () => {
    const res1 = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const res2 = requestChannelCreate(authUser.token, '', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    expect(channel).toStrictEqual(errorMsg);
  });
  test('Incorrect Name (too large)', () => {
    const res1 = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const res2 = requestChannelCreate(authUser.token, 'very long channel name', true);
    const channel = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    expect(channel).toStrictEqual(errorMsg);
  });
});

// describe("Testing channelsListV1", () => {
//     test('Correct return all channels', () => {
//         const authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
//         const channel1 = channelsCreateV1(authUserId.authUserId, 'name1', true);
//         const channel2 = channelsCreateV1(authUserId.authUserId, 'name2', true);
//         expect(channelsListV1(authUserId.authUserId)).toStrictEqual({
//             channels: [
//                 {
//                     channelId: channel1.channelId,
//                     name: 'name1',
//                 },
//                 {
//                     channelId: channel2.channelId,
//                     name: 'name2',
//                 },
//             ]
//         });
//     });
//     test('Correct return no channels', () => {
//         const authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
//         expect(channelsListV1(authUserId.authUserId)).toStrictEqual({ channels: [] });
//     });
//     test('Correct return some channels', () => {
//         const authUserId1 = authRegisterV1('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
//         const authUserId2 = authRegisterV1('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
//         const channel1 = channelsCreateV1(authUserId1.authUserId, 'name1', true);
//         const channel2 = channelsCreateV1(authUserId2.authUserId, 'name2', true);
//         expect(channelsListV1(authUserId1.authUserId)).toStrictEqual({
//             channels: [
//                 {
//                     channelId: channel1.channelId,
//                     name: 'name1',
//                 }
//             ]
//         });
//     });
// });
