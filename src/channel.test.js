import {channelDetailsV1, channelJoinV1} from './channel.js';
import {channelsCreateV1, channelsListV1, channelsListallV1} from './channels';
import {authRegisterV1} from './auth.js';
import {clearV1} from './other';

beforeEach(() => {
    clearV1();
});
describe('Testing channelDetailsV1', () => {
    test('channelId is valid and the authorised user is not a member of the channel', () => {
        let authUser = authRegisterV1('hayden@gmail.com', 'password', 'Hayden', 'Smith');
        let authUser2 = authRegisterV1('john@gmail.com', 'password', 'John', 'Smith');
        let createChannel = channelsCreateV1(authUser2.authUserId, 'crazyTown', true);
        let channelDetail = channelDetailsV1(authUser.authUserId, createChannel.channelId);
        expect(channelDetail).toStrictEqual({error: 'error'});
    });
    test('Invalid ChannelId', () => {
        let authUser = authRegisterV1('jason@gmail.com', 'password', 'Jason', 'Smith');
        let channelId = 2; // this channelId is invalid as no channel is created
        let channelDetail = channelDetailsV1(authUser.authUserId, channelId);
        expect(channelDetail).toEqual({error: 'error'});
    });
    test('Positive test case', () => {
        let authUser = authRegisterV1('hayden@gmail.com', 'password', 'Hayden', 'Smith');
        let createChannel = channelsCreateV1(authUser.authUserId, 'crazyTown', true);
        let channelDetail = channelDetailsV1(authUser.authUserId, createChannel.channelId);
        expect(channelDetail).toStrictEqual({ name, isPublic, ownerMembers, allMembers });
    });

});

describe('Testing channelJoinV1', () => {
    test('Invalid ChannelId', () => {
        let authUser = authRegisterV1('jason@gmail.com', 'password', 'Jason', 'Smith');
        let channelId = 2; // this channelId is invalid as no channel is created
        let channelJoin = channelJoinV1(authUser.authUserId, channelId);
        expect(channelJoin).toEqual({error: 'error'});
    });
    test('the authorised user is already a member of the channel', () => {
        let authUser = authRegisterV1('jason@gmail.com', 'password', 'Jason', 'Smith');
        let createChannel = channelsCreateV1(authUser, 'crazyTown', true);
        let channelJoin = channelJoinV1(authUser.authUserId, createChannel.channelId);
        expect(channelJoin).toEqual({error: 'error'});
    });
    test('Adding user to a private channel', () => {
        let authUser = authRegisterV1('jason@gmail.com', 'password', 'Jason', 'Smith');
        // Create private channel
        let createChannel = channelsCreateV1(1234, 'crazyTown', false);
        let channelJoin = channelJoinV1(authUser.authUserId, createChannel.channelId);
        // Auth user is not channel member or global owner
        expect(channelJoin).toEqual({error: 'error'});
    });
    test('positive case', () => {
        let authUser = authRegisterV1('jason@gmail.com', 'password', 'Jason', 'Smith');
        let createChannel = channelsCreateV1(1234, 'crazyTown', true);
        let channelJoin = channelJoinV1(authUser.authUserId, createChannel.channelId);
        // Auth user is not channel member or global owner
        expect(channelJoin).toEqual({});
    });
});

