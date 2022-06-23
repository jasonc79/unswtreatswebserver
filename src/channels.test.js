import { channelsListallV1 } from "./channels.js";

// need to return array of objects
// Array of object, where each objects contains types { channelId, name }
// Provide an array of all channels, including private channels, (and their associated details)

describe("Pass scenario", () => {
  test('1 channels', () => {
    const id = authRegisterV1(
      'hayden@gmail.com',
      'hayden123',
      'Hayden',
      'Smith'
    );

    const channelId = channelsCreateV1(id, 'Hayden', true);

    expect(channelsListallV1(id)).toEqual([
      {
        channelId: channelId,
        name: 'Hayden',
      },
    ]);
  });
  test('More than 1 channel', () => {
    const id = authRegisterV1(
      'hayden@gmail.com',
      'hayden123',
      'Hayden',
      'Smith'
    );

    const channelId = channelsCreateV1(id, 'Hayden', true);
    const channelId2 = channelsCreateV1(id, 'Hayden2', true);

    expect(channelsListallV1(id)).toEqual([
      {
        channelId: channelId,
        name: 'Hayden',
      },
      {
        channelId: channelId2,
        name: 'Hayden2',
      },
    ]);
  });
});