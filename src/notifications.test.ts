import { authUserReturn, channelReturn, requestAuthRegister, requestNotifications } from './helperTests';
import { requestChannelCreate, requestChannelInvite, requestChannelJoin, requestDmCreate} from './helperTests';
import {requestMessageSend, requestMessageEdit, requestMessageSenddm, requestMessageShare} from './helperTests';
import {  } from './helperTests';
import { removeFile, requestClear} from './helperTests';
//import { channelId, MessageId, dmId } from './dataStore';

let authUser: authUserReturn;
let user: authUserReturn;
let channel: channelReturn;

const email = 'hayden@gmail.com';
const password = 'hayden123';
const nameFirst = 'Hayden';
const nameLast = 'Smith';
const handleStr = 'haydensmith';
const handleStr2 = 'haydensmith0';
const channelName = 'Channel';
const dmName = "haydensmith, haydensmith0";

// ===========================================================================//
// HELPER FUNCTIONS
//= ===========================================================================//

beforeEach(() => {
    removeFile();
    requestClear();
    authUser = requestAuthRegister(email, password, nameFirst, nameLast);
    user = requestAuthRegister('user@email.com', password, nameFirst, nameLast);
    channel = requestChannelCreate(authUser.token, channelName, true);
    //channel = requestChannelCreate(authUser.token, channelName, true);
  });
  
  afterEach(() => {
    removeFile();
    requestClear();
  });

  /**
   * 
   * @returns dmId, dmName, userToken, uId
   */
  function createDm(): {dmId: number, userToken: string, uId: number} {
    const uIds = [user.authUserId];
    const dm = requestDmCreate(authUser.token, uIds);
    return {
      dmId: dm.dmId,
      userToken: user.token,
      uId: user.authUserId 
    }
  }
  
  /** When method is:
   *  - Send  id is undefined
   *  - Edit  id is the id of the message to edit
   *  - Share id is the id of the og message
   * 
   * @param tagMsg 
   * @param expectedMsg 
   * @param {string} method     'send' | 'edit' | 'share'
   * @param {number | undefined} id   
   * @returns {messageId: number}
   */
  function testTagChannel(token: string, tagMsg: string, expectedMsg: string, method: string, id?: number) : {messageId: number} {
    requestChannelJoin(token, channel.channelId);
    if (method === 'send') {
      const {messageId} = requestMessageSend(authUser.token, channel.channelId, tagMsg);
      id = messageId;
    } else if (method === 'edit') {
      requestMessageEdit(authUser.token, id, tagMsg);
    } else if (method === 'share') { 
      // Shares with a channel
      requestMessageShare(authUser.token, id, tagMsg, channel.channelId, -1);
    }
    expect(requestNotifications(token)).toStrictEqual({
      notifications: [
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: `${handleStr} tagged you in ${channelName}: ${expectedMsg}`
        }
      ]
    });
    return {
      messageId: id
    }
  }

// ===========================================================================//
// TESTS
//= ===========================================================================//

describe('Testing notifications', () => {
  describe('Error cases', () => {
    test('Invalid token', () => {
      requestNotifications(authUser.token + 1, 403);
    });
  });
  describe('Receives notifications', () => {
    describe('Upon tagging', () => {
      test('User is notified when tagged once in a channel', () => {
        const tagMsg = '@haydensmith0, here';
        const expectedMsg = tagMsg;
        testTagChannel(user.token, tagMsg, expectedMsg,'send');
      });
      test('User is notified when tagged once in a dm', () => {
        const tagMsg = '@haydensmith0, here';
        const expectedMsg = tagMsg;
        const {dmId} = createDm();
        requestMessageSenddm(authUser.token, dmId, tagMsg);
         expect(requestNotifications(user.token)).toStrictEqual({
          notifications: [
            {
              channelId: -1,
              dmId: dmId,
              notificationMessage: `${handleStr} tagged you in ${dmName}: ${expectedMsg}`
            }
          ]
        });
      });
      test('User is notified once when tagged twice in a channel', () => {
        const tagMsg = '@haydensmith0, here';
        const expectedMsg = tagMsg;
        testTagChannel(user.token, tagMsg, expectedMsg, 'send');
        testTagChannel(user.token, tagMsg, expectedMsg, 'send');
      });
      test('User is notified once when message in channel is edited', () => {
        const tagMsg = 'edit@haydensmith0';
        const expectedMsg = tagMsg;
        const {messageId} = requestMessageSend(authUser.token, channel.channelId, 'anything');
        testTagChannel(user.token, tagMsg, expectedMsg, 'edit', messageId);
      });
      test('User is notified once when the optional message in message/share tags them', () => {
        const tagMsg = 'good @haydensmith0';
        const expectedMsg = tagMsg;
        const {messageId} = requestMessageSend(authUser.token, channel.channelId, 'anything');
        testTagChannel(user.token, tagMsg, expectedMsg, 'share', messageId);
      });
      test('Multiple people are notified when tagged', () => {
        const user2 = requestAuthRegister('user2@email.com', password, 'c', 'c');
        const tagMsg = '@haydensmith0@cc good';
        const expectedMsg = tagMsg;
        testTagChannel(user.token, tagMsg, expectedMsg, 'send');
        testTagChannel(user2.token, tagMsg, expectedMsg, 'send');
      });
      test('User is notified when tagging themselves', () => {
        const tagMsg = '@haydensmith, here';
        const expectedMsg = tagMsg;
        testTagChannel(authUser.token, tagMsg, expectedMsg, 'send');
      });
      test('First 20 characters of the message', () => {
        const tagMsg = 'gooood @haydensmith0, well done';
        const expectedMsg = 'gooood @haydensmith0';
        testTagChannel(user.token, tagMsg, expectedMsg, 'send');

      });
    });
    describe('Upon being invited to a channel/dm', () => {
      test('User is notified when added to a channel', () => {
        requestChannelInvite(authUser.token, channel.channelId, user.authUserId);
        expect(requestNotifications(user.token)).toStrictEqual({
          notifications: [
            {
              channelId: channel.channelId,
              dmId: -1,
              notificationMessage: `${handleStr} added you to ${channelName}`
            }]
        });
      });
      test('User is notified when added to a dm', () => {
        const {dmId, userToken, uId} = createDm();
        expect(requestNotifications(user.token)).toStrictEqual({
          notifications: [
            {
              channelId: -1,
              dmId: dmId,
              notificationMessage: `${handleStr} added you to ${dmName}`
            }
          ]
        });
      });
    });
    
    describe('Upon receiving a reaction to their message', () => {
      test('User is notified when someone reacts to a channel', () => {
        
      });
      test('User is notified when someone reacts to a dm they are in', () => {
  
      });
    });
  });
  describe('No notifications expected', () => {
    test('Handle is invalid when tagged', () => {
      const tagMsg = '@invalid';
      expect(requestNotifications(authUser.token)).toStrictEqual({notifications:[]});
      expect(requestNotifications(user.token)).toStrictEqual({notifications:[]});
    });
    test('User is not a member of the channel they are tagged in', () => {
      const tagMsg = 'good @haydensmith0';
      const expectedMsg = tagMsg;
      requestMessageSend(authUser.token, channel.channelId, tagMsg);
      expect(requestNotifications(user.token)).toStrictEqual({notifications:[]});
    });
    test('User is not a member of the dm they are tagged in', () => {
      const tagMsg = 'good @haydensmith1';
      const user2 = requestAuthRegister('user2@email.com', password, nameFirst, nameLast);
      const {dmId, userToken, uId} = createDm();
      requestMessageSenddm(authUser.token, dmId, tagMsg);
      expect(requestNotifications(user2.token)).toStrictEqual({notifications:[]});
    });
    test('No notifications for reactions when user is removed from a channel', () => {

    });
    test('No notifications for reactions when user is removed from a dm', () => {

    });
  });
  describe('Correct order', () => {
    test('Notifications are arranged from most recent to least recent', () => {
      const tagMsg = '@haydensmith0, here';
      const expectedMsg = tagMsg;
      requestChannelInvite(authUser.token, channel.channelId, user.authUserId);
      requestMessageSend(authUser.token, channel.channelId, tagMsg);
      expect(requestNotifications(user.token)).toStrictEqual({
        notifications: [
          {
            channelId: channel.channelId,
            dmId: -1,
            notificationMessage: `${handleStr} tagged you in ${channelName}: ${expectedMsg}`
          },
          {
            channelId: channel.channelId,
            dmId: -1,
            notificationMessage: `${handleStr} added you to ${channelName}`
          }
        ]
      });
    });
    
    test('20 notifications are received', () => {
      requestChannelInvite(authUser.token, channel.channelId, user.authUserId);
      let name = 'channel';
      for (let i = 0; i < 19; i++) {
        let newName = name + i.toString();
        let newChannel = requestChannelCreate(authUser.token, newName, true);
        requestChannelInvite(authUser.token, newChannel.channelId, user.authUserId);
      }
      const {notifications} = requestNotifications(user.token);
      expect(notifications.length).toStrictEqual(20);
    });
    test('21 notifications are sent but only most recent 20 are returned', () => {
      requestChannelInvite(authUser.token, channel.channelId, user.authUserId);
      let name = 'channel';
      let lastChannelId: number;
      for (let i = 0; i < 20; i++) {
        let newName = name + i.toString();
        let newChannel = requestChannelCreate(authUser.token, newName, true);
        if (i === 0) {
          lastChannelId = newChannel.channelId;
        }
        requestChannelInvite(authUser.token, newChannel.channelId, user.authUserId);
      }
      const {notifications} = requestNotifications(user.token);
      // Checks the oldest notification is the second notification (first message is ignored)
      expect(notifications.length).toStrictEqual(20);
      expect(notifications[19].channelId).toStrictEqual(lastChannelId);
    });
  });

});