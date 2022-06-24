import { channelsListallV1 } from "./channels.js"
import { clearV1 } from "./other.js"
import { authRegisterV1 } from "./auth.js"
import { channelDetailsV1, channelInviteV1, channelJoinV1, channelMessagesV1 } from "./channel.js"
import { channelsCreateV1, channelsListV1 } from "./channels.js";
beforeEach(() => {
    clearV1();
});

describe('Testing channelDetailsV1', () => {
    test('channelId is valid and the authorised user is not a member of the channel', () => {
        const authUser = authRegisterV1('hayden@gmail.com', 'password', 'Hayden', 'Smith');
        const authUser2 = authRegisterV1('john@gmail.com', 'password', 'John', 'Smith');
        const createChannel = channelsCreateV1(authUser2.authUserId, 'crazyTown', true);
        const channelDetail = channelDetailsV1(authUser.authUserId, createChannel.channelId);
        expect(channelDetail).toStrictEqual({error: 'error'});
    });
    test('Invalid ChannelId', () => {
        const authUser = authRegisterV1('jason@gmail.com', 'password', 'Jason', 'Smith');
        const channelId = 2; // this channelId is invalid as no channel is created
        const channelDetail = channelDetailsV1(authUser.authUserId, channelId);
        expect(channelDetail).toStrictEqual({error: 'error'});
    });
    test('Positive test case', () => {
        const authUser = authRegisterV1('hayden@gmail.com', 'password', 'Hayden', 'Smith');
        const createChannel = channelsCreateV1(authUser.authUserId, 'crazyTown', true);
        const channelDetail = channelDetailsV1(authUser.authUserId, createChannel.channelId);
        const channelList = channelsListV1(authUser.authUserId);
        let user = {
            uId: authUser.authUserId,
            email: 'hayden@gmail.com',
            nameFirst: 'hayden',
            nameLast: 'smith',
            handleStr: 'haydensmith',
        }
        expect(channelDetail).toStrictEqual({
             name: 'crazyTown',
             isPublic: true,
             ownerMembers: [user],
             allMembers: [user],
        });
    });
});

describe('Testing channelJoinV1', () => {
    test('Invalid ChannelId', () => {
        const authUser = authRegisterV1('jason@gmail.com', 'password', 'Jason', 'Smith');
        const channelId = 2; // this channelId is invalid as no channel is created
        const channelJoin = channelJoinV1(authUser.authUserId, channelId);
        expect(channelJoin).toStrictEqual({error: 'error'});
    });
    test('the authorised user is already a member of the channel', () => {
        const authUser = authRegisterV1('jason@gmail.com', 'password', 'Jason', 'Smith');
        const createChannel = channelsCreateV1(authUser, 'crazyTown', true);
        const channelJoin = channelJoinV1(authUser.authUserId, createChannel.channelId);
        expect(channelJoin).toStrictEqual({error: 'error'});
    });
    test('Adding non-global user to a private channel', () => {
        const authUser2 = authRegisterV1('jason@gmail.com', 'password', 'Jason', 'Smith');
        // Create private channel
        const authUser = authRegisterV1('john@gmail.com', 'password', 'John', 'Smith');
        const createChannel = channelsCreateV1(authUser2.authUserId, 'crazyTown', false);
        const channelJoin = channelJoinV1(authUser.authUserId, createChannel.channelId);
        // Auth user is not channel member or global owner
        expect(channelJoin).toStrictEqual({error: 'error'});
    });
    test('positive case', () => {
        const authUser = authRegisterV1('jason@gmail.com', 'password', 'Jason', 'Smith');
        const authUser2 = authRegisterV1('john@gmail.com', 'password', 'John', 'Smith');
        const createChannel = channelsCreateV1(authUser2.authUserId, 'crazyTown', true);
        const channelJoin = channelJoinV1(authUser.authUserId, createChannel.channelId);
        // Auth user is not channel member or global owner
        expect(channelJoin).toStrictEqual({});
    });
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

    expect(channelMessagesV1(id.authUserId, invalidId, 0)).toEqual({
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

    expect(channelMessagesV1(id2.authUserId, channel1.channelId, 0)).toEqual({
      error: "error",
    });
  });
});
