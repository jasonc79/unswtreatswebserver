import { authRegisterV1 } from "./auth.js";
import { channelsCreateV1, channelsListV1, channelsListallV1} from "./channels.js";
import { channelDetailsV1, channelJoinV1} from "./channel.js";
import { clearV1 } from "./other.js";

beforeEach(() => {
    clearV1();
});

describe('Testing channelDetailsV1', () => {
    test('channelId is valid and the authorised user is not a member of the channel', () => {
        const authUser = authRegisterV1('hayden@gmail.com', 'password', 'Hayden', 'Smith');
        const authUser2 = authRegisterV1('john@gmail.com', 'password', 'John', 'Smith')
        const createChannel = channelsCreateV1(authUser2.authUserId, 'crazyTown', true);
        const channelDetail = channelDetailsV1(authUser.authUserId, createChannel);
        expect(channelDetail).toStrictEqual({error: 'error'});
    });
    test('Invalid ChannelId', () => {
        const authUser = authRegisterV1('jason@gmail.com', 'password', 'Jason', 'Smith');
        const channelId = 2; // this channelId is invalid as no channel is created
        const channelDetail = channelDetailsV1(authUser, channelId);
        expect(channelDetail).toStrictEqual({error: 'error'});
    });
    test('Positive test case', () => {
        const authUser = authRegisterV1('hayden@gmail.com', 'password', 'Hayden', 'Smith');
        const createChannel = channelsCreateV1(authUser, 'crazyTown', true);
        const channelDetail = channelDetailsV1(authUser, createChannel);
        expect(channelDetail).toStrictEqual({ name, isPublic, ownerMembers, allMembers });
    });

});

describe('Testing channelJoinV1', () => {
    test('Invalid ChannelId', () => {
        const authUser = authRegisterV1('jason@gmail.com', 'password', 'Jason', 'Smith');
        const channelId = 2; // this channelId is invalid as no channel is created
        const channelJoin = channelJoinV1(authUser, channelId);
        expect(channelJoin).toStrictEqual({error: 'error'});
    });
    test('the authorised user is already a member of the channel', () => {
        const authUser = authRegisterV1('jason@gmail.com', 'password', 'Jason', 'Smith');
        const createChannel = channelsCreateV1(authUser, 'crazyTown', true);
        const channelJoin = channelJoinV1(authUser, createChannel);
        expect(channelJoin).toStrictEqual({error: 'error'});
    });
    test('Adding user to a private channel', () => {
        const authUser = authRegisterV1('jason@gmail.com', 'password', 'Jason', 'Smith');
        // Create private channel
        const createChannel = channelsCreateV1(1234, 'crazyTown', false);
        const channelJoin = channelJoinV1(authUser, createChannel);
        // Auth user is not channel member or global owner
        expect(channelJoin).toStrictEqual({error: 'error'});
    });
    test('positive case', () => {
        const authUser = authRegisterV1('jason@gmail.com', 'password', 'Jason', 'Smith');
        const createChannel = channelsCreateV1(1234, 'crazyTown', true);
        const channelJoin = channelJoinV1(authUser, createChannel);
        // Auth user is not channel member or global owner
        expect(channelJoin).toStrictEqual({});
    });
});

