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

function requestChannelsList(token: string) {
  const res = requestHelper('GET', '/channels/list/v2', { token });
  expect(res.statusCode).toBe(OK);
  return JSON.parse(String(res.getBody()));
}

function requestChannelsListAll(token: string) {
  const res = requestHelper('GET', '/channels/listall/v2', { token });
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

function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

beforeEach(() => {
  requestClear();
});

describe('Testing for channelsListallV1', () => {
  test('Correct return, no channels', () => {
    const authUser = requestAuthRegister('hayden@gmail.com', 'hayden123', 'Hayden', 'Smith');
    expect(requestChannelsListAll(authUser.token)).toEqual({
      channels: []
    });
  });

  test('Correct, return a single channel', () => {
    const authUser = requestAuthRegister('hayden@gmail.com', 'hayden123', 'Hayden', 'Smith');
    const channelId = requestChannelCreate(authUser.token, 'Channel', true);
    expect(requestChannelsListAll(authUser.token)).toEqual({
      channels: [
        {
          channelId: channelId.channelId,
          name: 'Channel',
        },
      ],
    });
  });

  test('More than one channel', () => {
    const authUser = requestAuthRegister('hayden@gmail.com', 'hayden123', 'Hayden', 'Smith');
    const channel1 = requestChannelCreate(authUser.token, 'Channel1', true);
    const channel2 = requestChannelCreate(authUser.token, 'Channel2', true);

    expect(requestChannelsListAll(authUser.token)).toEqual({
      channels: [
        {
          channelId: channel1.channelId,
          name: 'Channel1',
        },
        {
          channelId: channel2.channelId,
          name: 'Channel2',
        },
      ],
    });
  });
});

describe('Testing channelsCreateV1', () => {
  test('Correct Name, is public', () => {
    const authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    expect(channel).toStrictEqual(
      expect.objectContaining({
        channelId: expect.any(Number),
      })
    );
  });
  test('Correct Name, is private', () => {
    const authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channel = requestChannelCreate(authUser.token, 'correct name', false);
    expect(channel).toStrictEqual(
      expect.objectContaining({
        channelId: expect.any(Number),
      })
    );
  });
  test('Incorrect Name (too small)', () => {
    const authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channel = requestChannelCreate(authUser.token, '', true);
    expect(channel).toStrictEqual(errorMsg);
  });
  test('Incorrect Name (too large)', () => {
    const authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channel = requestChannelCreate(authUser.token, 'very long channel name', true);
    expect(channel).toStrictEqual(errorMsg);
  });
});

describe('Testing channelsListV1', () => {
  test('Correct return no channels', () => {
    const authUser = requestAuthRegister('email@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channelsList = requestChannelsList(authUser.token);
    expect(channelsList).toStrictEqual({ channels: [] });
  });

  test('Correct return some channels', () => {
    const authUser1 = requestAuthRegister('email@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser2 = requestAuthRegister('email2@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channel1 = requestChannelCreate(authUser1.token, 'name1', true);
    requestChannelCreate(authUser2.token, 'name2', true);
    const channelsList = requestChannelsList(authUser1.token);

    expect(channelsList).toStrictEqual(
      {
        channels: [
          {
            channelId: channel1.channelId,
            name: 'name1',
          }
        ]
      }
    );
  });

  test('Correct return all channels', () => {
    const authUser = requestAuthRegister('email@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channel1 = requestChannelCreate(authUser.token, 'name1', true);
    const channel2 = requestChannelCreate(authUser.token, 'name2', true);
    const channelsList = requestChannelsList(authUser.token);

    expect(channelsList).toStrictEqual({
      channels: [
        {
          channelId: channel1.channelId,
          name: 'name1',
        },
        {
          channelId: channel2.channelId,
          name: 'name2',
        },
      ]
    });
  });
});
