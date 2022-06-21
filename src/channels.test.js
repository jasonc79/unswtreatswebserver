import { authRegisterV1 } from "./auth.js"
import { channelsCreateV1, channelsListV1 } from "./channels.js";
import { clearV1 } from "./other.js"

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
    test('Correct return', () => {
        const authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
        expect(channelsCreateV1(authUserId.authUserId)).toStrictEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    channelId: expect.any(Number),
                    name: expect.any(String),
                })
            ])
        );
    });
});