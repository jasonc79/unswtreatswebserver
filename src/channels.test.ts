import { authUserReturn, requestAuthRegister, errorMsg, requestClear } from './helperTests';
import { requestChannelsList, requestChannelsListAll, requestChannelCreate } from './helperTests';

const email = 'hayden@gmail.com';
const password = 'hayden123';
const nameFirst = 'Hayden';
const nameLast = 'Smith';

let authUser: authUserReturn;

beforeEach(() => {
  requestClear();
  authUser = requestAuthRegister(email, password, nameFirst, nameLast);
});

describe('Testing for channelsListallV1', () => {
  test('Correct return, no channels', () => {
    expect(requestChannelsListAll(authUser.token)).toEqual({
      channels: []
    });
  });

  test('Correct, return a single channel', () => {
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
    const channel = requestChannelCreate(authUser.token, 'correct name', true);
    expect(channel).toStrictEqual(
      expect.objectContaining({
        channelId: expect.any(Number),
      })
    );
  });
  test('Correct Name, is private', () => {
    const channel = requestChannelCreate(authUser.token, 'correct name', false);
    expect(channel).toStrictEqual(
      expect.objectContaining({
        channelId: expect.any(Number),
      })
    );
  });
  test('Incorrect Name (too small)', () => {
    const channel = requestChannelCreate(authUser.token, '', true);
    expect(channel).toStrictEqual(errorMsg);
  });
  test('Incorrect Name (too large)', () => {
    const channel = requestChannelCreate(authUser.token, 'very long channel name', true);
    expect(channel).toStrictEqual(errorMsg);
  });
});

describe('Testing channelsListV1', () => {
  test('Correct return no channels', () => {
    const channelsList = requestChannelsList(authUser.token);
    expect(channelsList).toStrictEqual({ channels: [] });
  });

  test('Correct return some channels', () => {
    const authUser2 = requestAuthRegister('email2@gmail.com', 'password1', 'firstname1', 'lastname1');
    const channel1 = requestChannelCreate(authUser.token, 'name1', true);
    requestChannelCreate(authUser2.token, 'name2', true);
    const channelsList = requestChannelsList(authUser.token);

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
