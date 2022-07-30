import { authUserReturn, requestAuthRegister, requestChannelCreate, requestDmCreate, requestChannelJoin, requestChannelMessages, requestDmMessages, requestClear } from './helperTests';
import { requestMessageSend, requestMessageSenddm, requestMessageEdit, requestMessageRemove } from './helperTests';
import { removeFile } from './helperTests';

let authUser: authUserReturn;

beforeEach(() => {
  removeFile();
  requestClear();
  authUser = requestAuthRegister('email1@gmail.com', 'password1', 'firstname1', 'lastname1', 200);
});

afterEach(() => {
  removeFile();
  requestClear();
});

describe('Testing userStats', () => {
  test('equal 0', () => {
    const stats = requestUserStats(authUser.token, 200);
    expect(stats).toStrictEqual(0);
  });
  test('more than 1', () => {
    const authUser2 = requestAuthRegister(email2, password2, nameFirst2, nameLast2, 200);
    const authUser3 = requestAuthRegister(email3, password3, nameFirst3, nameLast3, 200);
    const authUser4 = requestAuthRegister(email4, password4, nameFirst4, nameLast4, 200);
    const channel = requestChannelCreate(authUser.token, 'name', true, 200);
    const channel2 = requestChannelCreate(authUser.token, 'name1', true, 200);
    const channel3 = requestChannelCreate(authUser.token, 'name2', true, 200);
    const channel4 = requestChannelCreate(authUser.token, 'name3', true, 200);
    requestMessageSend(authUser.token, channel.channelId, 'message4', 200);
    requestMessageSend(authUser.token, channel.channelId, 'message5', 200);
    const stats = requestUserStats(authUser.token, 200);
    expect(stats).toStrictEqual(1);
  });
  test('more than 0 less than 1', () => {
    const authUser2 = requestAuthRegister(email2, password2, nameFirst2, nameLast2, 200);
    const authUser3 = requestAuthRegister(email3, password3, nameFirst3, nameLast3, 200);
    const authUser4 = requestAuthRegister(email4, password4, nameFirst4, nameLast4, 200);
    const channel = requestChannelCreate(authUser.token, 'name', true, 200);
    const channel2 = requestChannelCreate(authUser.token, 'name1', true, 200);
    const channel3 = requestChannelCreate(authUser2.token, 'name2', true, 200);
    const channel4 = requestChannelCreate(authUser2.token, 'name3', true, 200);
    requestMessageSend(authUser.token, channel.channelId, 'message4', 200);
    requestMessageSend(authUser.token, channel.channelId, 'message5', 200);
    const stats = requestUserStats(authUser.token, 200);
    expect(stats).toStrictEqual(any(Number));
  });
});
