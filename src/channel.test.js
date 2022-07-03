import { clearV1 } from "./other.js"
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

describe('Testing user output in channelDetails', () => {
  test('Testing handle generation', () => {
    const u1 = authRegisterV1('sheriff.woody@andysroom.com', 'password', 'sheriff', 'woody');
    const u2 = authRegisterV1('somerando@gmail.com', 'terriblepw', 'some', 'rando');
    const u3 = authRegisterV1('blah@email.com', 'terriblepw', 'abcfghij', 'klmnopqrs');
    const u4 = authRegisterV1('blah1@email.com', 'terriblepw', 'abcdefghij', 'klmnopqrs');
    const u5 = authRegisterV1('blah2@email.com', 'terriblepw', 'abcdefghij', 'klmnopqrs');
    const cId = channelsCreateV1(u1.authUserId, 'channel', true);
    channelJoinV1(u4.authUserId, cId.channelId);
    channelJoinV1(u5.authUserId, cId.channelId);
   
    const channelDet = channelDetailsV1(u4.authUserId, cId.channelId);
    const expected1 = {uId: u4.authUserId, email: 'blah1@email.com', 'nameFirst': 'abcdefghij', 'nameLast': 'klmnopqrs', 'handleStr': 'abcdefghijklmnopqrs'};
    const expected2 = {uId: u5.authUserId, email: 'blah2@email.com', 'nameFirst': 'abcdefghij', 'nameLast': 'klmnopqrs', 'handleStr': 'abcdefghijklmnopqrs0'};
      
    expect(channelDet['allMembers']).toContainEqual(expected1);
    expect(channelDet['allMembers']).toContainEqual(expected2);
  });

  test('Testing handle generation for alphanumeric characters', () => {
    const nameFirst = '@bcdefgh!j';
    const nameLast = 'klmn opqrst';
    const handleStr1 = 'bcdefghjklmnopqrst0';
    const handleStr2 = 'bcdefghjklmnopqrst1'

    const u1 = authRegisterV1('sheriff.woody@andysroom.com', 'password', 'sheriff', 'woody');
    const u2 = authRegisterV1('somerando@gmail.com', 'terriblepw', 'some', 'rando');
    const u3 = authRegisterV1('blah@email.com', 'terriblepw', nameFirst, nameLast);
    const u4 = authRegisterV1('blah1@email.com', 'terriblepw', nameFirst, nameLast);
    const u5 = authRegisterV1('blah2@email.com', 'terriblepw',  nameFirst, nameLast);
    const cId = channelsCreateV1(u1.authUserId, 'channel', true);
    channelJoinV1(u4.authUserId, cId.channelId);
    channelJoinV1(u5.authUserId, cId.channelId);

    const channelDet = channelDetailsV1(u4.authUserId, cId.channelId);
    const expected1 = {uId: u4.authUserId, email: 'blah1@email.com', 'nameFirst': nameFirst, 'nameLast':nameLast, 'handleStr': handleStr1};
    const expected2 = {uId: u5.authUserId, email: 'blah2@email.com', 'nameFirst':nameFirst, 'nameLast': nameLast, 'handleStr': handleStr2};
      
    expect(channelDet['allMembers']).toContainEqual(expected1);
    expect(channelDet['allMembers']).toContainEqual(expected2);
  });

  
  test('Testing handle generation for names with a number at the end', () => {
    const nameFirst = 'abc';
    const nameLast = 'def0';
    const handleStr1 = 'abcdef00';
    const handleStr2 = 'abcdef01'

    const u1 = authRegisterV1('sheriff.woody@andysroom.com', 'password', 'sheriff', 'woody');
    const u2 = authRegisterV1('somerando@gmail.com', 'terriblepw', 'some', 'rando');
    const u3 = authRegisterV1('blah@email.com', 'terriblepw', nameFirst, nameLast);
    const u4 = authRegisterV1('blah1@email.com', 'terriblepw', nameFirst, nameLast);
    const u5 = authRegisterV1('blah2@email.com', 'terriblepw',  nameFirst, nameLast);
    const cId = channelsCreateV1(u1.authUserId, 'channel', true);
    channelJoinV1(u4.authUserId, cId.channelId);
    channelJoinV1(u5.authUserId, cId.channelId);

    const channelDet = channelDetailsV1(u4.authUserId, cId.channelId);
    const expected1 = {uId: u4.authUserId, email: 'blah1@email.com', 'nameFirst': nameFirst, 'nameLast':nameLast, 'handleStr': handleStr1};
    const expected2 = {uId: u5.authUserId, email: 'blah2@email.com', 'nameFirst':nameFirst, 'nameLast': nameLast, 'handleStr': handleStr2};
      
    expect(channelDet['allMembers']).toContainEqual(expected1);
    expect(channelDet['allMembers']).toContainEqual(expected2);
  });
});
