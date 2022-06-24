import { channelInviteV1, channelJoinV1 } from './channel.js'; 
import { authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js';
import { clearV1 } from './other.js'

beforeEach(() => {
    clearV1(); 
});

describe('Testing channelInviteV1', () =>  {
    
    const authUserID1 = authRegisterV1('test1@gmail.com', '123abc!@#', 'Test1', 'Smith'); 
    const authUserID2 = authRegisterV1('test2@gmail.com', '123abc!@#', 'Test2', 'Smith'); 
    const channelID = channelsCreateV1(authUserID1, 'Channel1', true);
    
    test ('Valid inputs', () => {
        channelJoinV1(authUserID1.authUserId, channelID.channelId); 
        const validInput = channelInviteV1(authUserID1.authUserId, channelID.channelId, authUserID2.authUserId); 
        expect(validInput).toEqual({}); 
    }); 
    
    test ('Invalid channelID', () => {
        channelJoinV1(authUserID1.authUserId, channelID.channelId);
        const invalidChannelID = channelInviteV1(authUserID1.authUserId, -1, authUserID2.authUserId); 
        expect(invalidChannelID).toEqual({ error: 'error' }); 
    }); 
    
    test ('Invalid userID', () => {
        channelJoinV1(authUserID1.authUserId, channelID.channelId);
        const invalidUserID = channelInviteV1(authUserID1.authUserId, channelID.channelId, -1); 
        expect(invalidUserID).toEqual({ error: 'error' }); 
    }); 
    
    test ('User is already a member', () => {
        channelJoinV1(authUserID1.authUserId, channelID.channelId);
        channelJoinV1(authUserID2.authUserId, channelID.channelId); 
        const alreadyMember = channelInviteV1(authUserID1.authUserId, channelID.channelId, authUserID2.authUserId); 
        expect(alreadyMember).toEqual({ error: 'error' }); 
    }); 
    
    test ('Authorised user is not a member', () => {
        const notMember = channelInviteV1(authUserID1.authUserId, channelID.channelId, authUserID2.authUserId); 
        expect(notMember).toEqual({ error: 'error' }); 
    })
})
