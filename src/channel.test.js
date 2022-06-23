import { channelsListallV1 } from "./channels.js";
import { clearV1 } from "./other.js";
import { getData } from "./dataStore.js";
import { authRegisterV1 } from "./auth.js";
import { channelMessagesV1 } from "./channel.js";
import { channelsCreateV1, channelsListV1 } from "./channels.js";
import { userProfileV1 } from "./users.js";

beforeEach(() => {
  clearV1();
});

describe("channelMessages Pass scenarios", () => {
  test("Empty messages", () => {
    const id = authRegisterV1(
      "hayden@gmail.com",
      "hayden123",
      "Hayden",
      "Smith"
    );
    const channel1 = channelsCreateV1(id.authUserId, "Hayden", true);

    expect(channelMessagesV1(id.authUserId, channel1.channelId, 0)).toEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });
});

describe("channelMessages Fail scenarios", () => {
  test("Start is greater than messages", () => {
    const id = authRegisterV1(
      "hayden@gmail.com",
      "hayden123",
      "Hayden",
      "Smith"
    );

    const channel1 = channelsCreateV1(id.authUserId, "Hayden", true);

    expect(channelMessagesV1(id.authUserId, channel1.channelId, 1)).toEqual({
      error: "error",
    });
  });
  test("ChannelId is invalid", () => {
    const id = authRegisterV1(
      "hayden@gmail.com",
      "hayden123",
      "Hayden",
      "Smith"
    );

    const channel1 = channelsCreateV1(id.authUserId, "Hayden", true);
    let invalidId = channel1.channelId + 1;

    expect(channelMessagesV1(id.authUserId, invalidId, 1)).toEqual({
      error: "error",
    });
  });
  test("ChannelId is valid but user is not part of channel", () => {
    const id = authRegisterV1(
      "hayden@gmail.com",
      "hayden123",
      "Hayden",
      "Smith"
    );

    const id2 = authRegisterV1(
      "nathan@gmail.com",
      "nathan123",
      "Nathan",
      "Brown"
    );

    const channel1 = channelsCreateV1(id.authUserId, "Hayden", true);

    expect(channelMessagesV1(id2.authUserId, channel1, 1)).toEqual({
      error: "error",
    });
  });
});
