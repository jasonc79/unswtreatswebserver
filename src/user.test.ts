// import { authUserReturn, requestAuthRegister, requestChannelCreate, requestDmCreate, requestChannelJoin, requestChannelMessages, requestDmMessages, requestClear } from './helperTests';
// import { requestMessageSend, requestMessageSenddm, requestMessageEdit, requestMessageRemove } from './helperTests';
// import { removeFile } from './helperTests';

// let authUser: authUserReturn;

// beforeEach(() => {
//   removeFile();
//   requestClear();
//   authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1', 200);
// });

// afterEach(() => {
//   removeFile();
//   requestClear();
// });

// describe('Testing userStats', () => {
//   test('', () => {
//     const authUser2 = requestAuthRegister('email2@gmail.com', 'password2', 'firstname2', 'lastname2', 200);
//     const channel = requestChannelCreate(authUser.token, 'correct name', true, 200);
//     requestChannelJoin(authUser2.token, channel.channelId, 200);
//     const uIds = [];
//     uIds.push(authUser.authUserId);
//     const dm = requestDmCreate(authUser.token, uIds);
//   });
// });
