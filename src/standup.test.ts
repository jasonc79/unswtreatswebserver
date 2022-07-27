import { authUserReturn, requestAuthRegister, requestChannelCreate } from './helperTests';
import { requestStandupStart, requestStandupActive } from './helperTests';
import { removeFile, requestClear } from './helperTests';

let authUser: authUserReturn;

const email = 'hayden@gmail.com';
const password = 'hayden123';
const nameFirst = 'Hayden';
const nameLast = 'Smith';

beforeEach(() => {
    removeFile();
    requestClear();
    authUser = requestAuthRegister(email, password, nameFirst, nameLast);
});
  
afterEach(() => {
    removeFile();
    requestClear();
});

describe('Testing standupStartV1', () => {
    describe('error cases', () => {
        test('invalid token', () => {
            const channel = requestChannelCreate(authUser.token, 'name', false);
            requestStandupStart('bad', channel.channelId, 5, 403);
        });
        test('channelId is invalid', () => {
            requestStandupStart(authUser.token, 1, 5, 400);
        });
        test('length is a negative number', () => {
            const channel = requestChannelCreate(authUser.token, 'name', false);
            requestStandupStart(authUser.token, channel.channelId, -5, 400);
        });
        test('active standup is already running in the channel', () => {
            const channel = requestChannelCreate(authUser.token, 'name', false);
            requestStandupStart(authUser.token, channel.channelId, 5);
            requestStandupStart(authUser.token, channel.channelId, 5, 400);
        });
        test('user is not a member of the channel', () => {
            const user = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
            const channel = requestChannelCreate(authUser.token, 'name', false);
            requestStandupStart(user.token, channel.channelId, 5, 403);
        });
    });

    describe('passes', () => {
        test('standup is started', () => {
            const channel = requestChannelCreate(authUser.token, 'name', false);
            const standup = requestStandupStart(authUser.token, channel.channelId, 5);
            expect(standup).toStrictEqual(
                expect.objectContaining({
                    timeFinish: expect.any(Number),
                })
            );
        });
    });
});

// describe('Testing standupActiveV1', () => {
//     describe('error cases', () => {
//         test('invalid token', () => {
//             const channel = requestChannelCreate(authUser.token, 'name', false);
//             requestStandupActive('bad', channel.channelId, 403);
//         });
//         test('channelId is invalid', () => {
//             requestStandupActive(authUser.token, 1, 400);
//         });
//         test('user is not a member of the channel', () => {
//             const user = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
//             const channel = requestChannelCreate(authUser.token, 'name', false);
//             requestStandupActive(user.token, channel.channelId, 403);
//         });
//     });

//     describe('passes', () => {
//         test('standup is active', () => {
//             const channel = requestChannelCreate(authUser.token, 'name', false);
//             requestStandupStart(authUser.token, channel.channelId, 60);
//             const active = requestStandupActive(authUser.token, channel.channelId);
//             expect(active).toStrictEqual(
//                 expect.objectContaining({ 
//                     isActive: true, 
//                     timeFinish: expect.any(Number)
//                 })
//             );
//         });
//         test('standup is inactive', () => {
//             const channel = requestChannelCreate(authUser.token, 'name', false);
//             const active = requestStandupActive(authUser.token, channel.channelId);
//             expect(active).toStrictEqual(
//                 expect.objectContaining({ 
//                     isActive: false, 
//                     timeFinish: null
//                 })
//             );
//         });
//     });
// });