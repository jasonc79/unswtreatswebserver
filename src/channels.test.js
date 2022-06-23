import { channelsListallV1 } from "./channels.js";
import { clearV1 } from "./other.js";
import { getData } from "./dataStore.js";
import { authRegisterV1 } from "./auth.js";
import { channelMessagesV1 } from "./channel.js";
import { channelsCreateV1, channelsListV1 } from "./channels.js";
import { userProfileV1 } from "./users.js";

// need to return array of objects
// Array of object, where each objects contains types { channelId, name }
// Provide an array of all channels, including private channels, (and their associated details)
beforeEach(() => {
  clearV1();
});

describe("Pass scenario", () => {
  test("1 channels", () => {
    const id = authRegisterV1(
      "hayden@gmail.com",
      "hayden123",
      "Hayden",
      "Smith"
    );

    const channelId = channelsCreateV1(id.authUserId, "Hayden", true);

    expect(channelsListallV1(id)).toEqual({
      channels: [
        {
          channelId: channelId.channelId,
          name: "Hayden",
        },
      ],
    });
  });

  test("More than 1 channel", () => {
    const id = authRegisterV1(
      "hayden@gmail.com",
      "hayden123",
      "Hayden",
      "Smith"
    );

    const channel1 = channelsCreateV1(id.authUserId, "Hayden", true);
    const channel2 = channelsCreateV1(id.authUserId, "Hayden2", true);

    expect(channelsListallV1(id)).toEqual({
      channels: [
        {
          channelId: channel1.channelId,
          name: "Hayden",
        },
        {
          channelId: channel2.channelId,
          name: "Hayden2",
        },
      ],
    });
  });
  // expect(channelsListallV1(id)).toEqual([
  //   {
  //     channelId: channel1.channelId,
  //     name: 'Hayden',
  //   },
  //   {
  //     channelId: channel2.channelId,
  //     name: 'Hayden2',
  //   },
  // ]);
});
beforeEach(() => {
  clearV1();
});

describe("Testing channelsCreateV1", () => {
  test("Correct Name, is public", () => {
    const authUserId = authRegisterV1(
      "email@gmail.com",
      "password",
      "firstname",
      "lastname"
    );
    expect(
      channelsCreateV1(authUserId.authUserId, "correct name", true)
    ).toStrictEqual(
      expect.objectContaining({
        channelId: expect.any(Number),
      })
    );
  });
  test("Correct Name, is private", () => {
    const authUserId = authRegisterV1(
      "email@gmail.com",
      "password",
      "firstname",
      "lastname"
    );
    expect(
      channelsCreateV1(authUserId.authUserId, "correct name", false)
    ).toStrictEqual(
      expect.objectContaining({
        channelId: expect.any(Number),
      })
    );
  });
  test("Incorrect Name (too small)", () => {
    const authUserId = authRegisterV1(
      "email@gmail.com",
      "password",
      "firstname",
      "lastname"
    );
    expect(channelsCreateV1(authUserId.authUserId, "", true)).toStrictEqual({
      error: "error",
    });
  });
  test("Incorrect Name (too large)", () => {
    const authUserId = authRegisterV1(
      "email@gmail.com",
      "password",
      "firstname",
      "lastname"
    );
    expect(
      channelsCreateV1(authUserId.authUserId, "very long channel name", true)
    ).toStrictEqual({ error: "error" });
  });
});

describe("Testing channelsListV1", () => {
  test("Correct return all channels", () => {
    const authUserId = authRegisterV1(
      "email@gmail.com",
      "password",
      "firstname",
      "lastname"
    );
    const channel1 = channelsCreateV1(authUserId.authUserId, "name1", true);
    const channel2 = channelsCreateV1(authUserId.authUserId, "name2", true);
    const data = getData();
    expect(channelsListV1(authUserId.authUserId)).toStrictEqual([
      {
        channelId: channel1.channelId,
        name: "name1",
      },
      {
        channelId: channel2.channelId,
        name: "name2",
      },
    ]);
  });
  test("Correct return no channels", () => {
    const authUserId = authRegisterV1(
      "email@gmail.com",
      "password",
      "firstname",
      "lastname"
    );
    expect(channelsListV1(authUserId.authUserId)).toStrictEqual([]);
  });
  test("Correct return some channels", () => {
    const authUserId1 = authRegisterV1(
      "email1@gmail.com",
      "password1",
      "firstname1",
      "lastname1"
    );
    const authUserId2 = authRegisterV1(
      "email2@gmail.com",
      "password2",
      "firstname2",
      "lastname2"
    );
    const channel1 = channelsCreateV1(authUserId1.authUserId, "name1", true);
    const channel2 = channelsCreateV1(authUserId2.authUserId, "name2", true);
    expect(channelsListV1(authUserId1.authUserId)).toStrictEqual([
      {
        channelId: channel1.channelId,
        name: "name1",
      },
    ]);
  });
});
