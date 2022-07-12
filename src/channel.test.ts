test('remove test', () => {
  expect(1 + 1).toEqual(2);
});
/*import { clearV1 } from "./other.js"
import { authRegisterV1 } from "./auth.js"
import { channelDetailsV1, channelInviteV1, channelJoinV1, channelMessagesV1 } from "./channel.js"
import { channelsCreateV1, channelsListV1, channelsListallV1 } from "./channels.js";
import { userProfileV1 } from "./users.js";

beforeEach(() => {
    clearV1(); 
});


// Tests for channelInviteV1
describe('Testing channelInviteV1', () =>  {
    
    const authUserID1 = authRegisterV1('test1@gmail.com', '123abc!@#', 'Test1', 'Smith'); 
    const authUserID2 = authRegisterV1('test2@gmail.com', '123abc!@#', 'Test2', 'Smith'); 
    const channelID = channelsCreateV1(authUserID1.authUserId, 'Channel1', true);
    
    test ('Valid inputs', () => {
        const authUserID1 = authRegisterV1('test1@gmail.com', '123abc!@#', 'Test1', 'Smith'); 
        const authUserID2 = authRegisterV1('test2@gmail.com', '123abc!@#', 'Test2', 'Smith'); 
        const channelID = channelsCreateV1(authUserID1.authUserId, 'Channel1', true);
        const validInput = channelInviteV1(authUserID1.authUserId, channelID.channelId, authUserID2.authUserId); 
        expect(validInput).toEqual({}); 
    }); 
    
    test ('Invalid channelID', () => {
        const invalidChannelID = channelInviteV1(authUserID1.authUserId, -1, authUserID2.authUserId); 
        expect(invalidChannelID).toEqual({ error: 'error' }); 
    }); 
    
    test ('Invalid userID', () => {
        const invalidUserID = channelInviteV1(authUserID1.authUserId, channelID.channelId, -1); 
        expect(invalidUserID).toEqual({ error: 'error' }); 
    }); 
    
    test ('User is already a member', () => {
        channelJoinV1(authUserID2.authUserId, channelID.channelId); 
        const alreadyMember = channelInviteV1(authUserID1.authUserId, channelID.channelId, authUserID2.authUserId); 
        expect(alreadyMember).toEqual({ error: 'error' }); 
    }); 
    
    test ('Authorised user is not a member', () => {
        const notMember = channelInviteV1(authUserID1.authUserId, channelID.channelId, authUserID2.authUserId); 
        expect(notMember).toEqual({ error: 'error' }); 
    })
})

// Tests for channelMessagesV1
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

*/

import request, { HttpVerb } from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const errorMsg = { error: 'error' };

function requestHelper(method: HttpVerb, path: string, payload: object) {
    let qs = {};
    let json = {};
    if (['GET', 'DELETE'].includes(method)) {
      qs = payload;
    } else {
      json = payload;
    }
    return request(method, url + ':' + port + path, { qs, json });
  }

// ========================================================================= //
// Wrapper Functions

function requestChannelMessages(token: string, channelId: number, start: number) {
  return requestHelper('GET', 'channel/messages/v2', { token, channelId, start });
}

function requestChannelDetails(token: string, channelId: number) {
  return requestHelper('GET', 'channel/details/v2', { token, channelId });
}

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v2', {
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast
  });
}

function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

beforeEach(() => {
  requestClear();
});

////

describe('Testing channelMessagesV1', () => {
  test('Empty messages', () => {
    const res1 = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const res2 = requestChannelMessages(authUser.token, 1, 1);
    const messages = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    expect(messages).toStrictEqual(
      expect.objectContaining({
        messages: [],
        start: 0,
        end: -1,
      })
    );
  });
  test('Contains messages', () => {
    // Waiting for message/send to finish writing this test.
    const res1 = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const res2 = requestChannelMessages(authUser.token, 1, 1);
    const messages = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    expect(messages).toStrictEqual(
      expect.objectContaining({
        messages: [],
        start: 0,
        end: -1,
      })
    );
  });
  test('Start is greater than messages', () => {
    const res1 = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const res2 = requestChannelMessages(authUser.token, 1, 1);
    const messages = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    expect(messages).toStrictEqual(errorMsg);
  });
  test('ChannelId is invalid', () => {
    const res1 = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const res2 = requestChannelMessages(authUser.token, 1, 1);
    const messages = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    expect(messages).toStrictEqual(errorMsg);
  });
  test('ChannelId is valid but user is not part of channel', () => {
    const res1 = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const res2 = requestChannelMessages(authUser.token, 1, 1);
    const messages = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    expect(messages).toStrictEqual(errorMsg);
  });
})


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



describe('Testing channelDetailsV2', () => {
  test('Success', () => {
    const res1 = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const res2 = requestChannelDetails(authUser.token, 1);
    const details = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    expect(messages).toStrictEqual(
      expect.objectContaining({
        channelId: channelId,
        name: name,
        messages: [],
        allMembers: [],
        ownerMembers: [],
        isPublic: isPublic,
      })
    );
  });
  test('ChannelId is invalid', () => {
    const res1 = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const res2 = requestChannelDetails(authUser.token, 1);
    const details = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    expect(messages).toStrictEqual(errorMsg);
  });
  test('ChannelId is valid but user is not part of channel', () => {
    const res1 = requestAuthRegister('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
    const authUser = JSON.parse(String(res1.getBody(('utf-8'))));
    expect(res1.statusCode).toBe(OK);
    const res2 = requestChannelDetails(authUser.token, 1);
    const details = JSON.parse(String(res2.getBody(('utf-8'))));
    expect(res2.statusCode).toBe(OK);
    expect(messages).toStrictEqual(errorMsg);
  });
})