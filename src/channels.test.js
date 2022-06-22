import { authRegisterV1 } from "./auth.js"
import { channelsCreateV1, channelsListV1 } from "./channels.js";
import { clearV1 } from "./other.js"
import { userProfileV1 } from "./users.js"
import { getData } from "./dataStore.js"

beforeEach(() => {
    clearV1();
});

describe("Testing channelsCreateV1", () => {
    test('Correct Name, is public', () => {
        const authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
        expect(channelsCreateV1(authUserId.authUserId, 'correct name', true)).toStrictEqual(
            expect.objectContaining({
                channelId: expect.any(Number)
            })
        );
    });
    test('Correct Name, is private', () => {
        const authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
        expect(channelsCreateV1(authUserId.authUserId, 'correct name', false)).toStrictEqual(
            expect.objectContaining({
                channelId: expect.any(Number)
            })
        );
    });
    test('Incorrect Name (too small)', () => {
        const authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
        expect(channelsCreateV1(authUserId.authUserId, '', true)).toStrictEqual({ error: 'error' });
    });
    test('Incorrect Name (too large)', () => {
        const authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
        expect(channelsCreateV1(authUserId.authUserId, 'very long channel name', true)).toStrictEqual({ error: 'error' });
    });
});

describe("Testing channelsListV1", () => {
    test('Correct return all channels', () => {
        const authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
        const channel1 = channelsCreateV1(authUserId.authUserId, 'name1', true);
        const channel2 = channelsCreateV1(authUserId.authUserId, 'name2', true);
        const data = getData();
        expect(channelsListV1(authUserId.authUserId)).toStrictEqual(data.channels);
    });
    test('Correct return no channels', () => {
        const authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
        expect(channelsListV1(authUserId.authUserId)).toStrictEqual([]);
    });
    test('Correct return some channels', () => {
        const authUserId1 = authRegisterV1('email1@gmail.com', 'password1', 'firstname1', 'lastname1');
        const authUserId2 = authRegisterV1('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        const channel1 = channelsCreateV1(authUserId1.authUserId, 'name1', true);
        const channel2 = channelsCreateV1(authUserId2.authUserId, 'name2', true);
        expect(channelsListV1(authUserId1.authUserId)).toStrictEqual({
            channelId: channel1.channelId,
            name: 'name1',
            messages: [],
            allMembers: [userProfileV1(authUserId2.authUserId, authUserId1.authUserId)],
            staffMembers:[userProfileV1(authUserId2.authUserId, authUserId1.authUserId)],
            isPublic: true,
        });
    });
});
