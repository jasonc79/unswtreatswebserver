import { error, errorMsg, authUserId, channelId, channelInfo, uId, user, userInfo, userReturn, channel, message, data} from './dataStore';
import { getData, setData } from './dataStore';
import { checkValidChannel, returnValidChannel, returnValidId, checkValidId } from './helper';
import { authRegisterV1 } from './auth';
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import { userProfileV1 } from './users';

type channelsList = { channels: channelInfo[] };
type channelDetails = { name: string, isPublic: boolean, ownerMembers: userInfo[], allMembers: userInfo[] }; 

/*
ChannelDetailsV1 Function
Given a channel with ID channelId that the authorised user is a member of, provide basic details about the channel.
Arguments:
    authUserId (number) - A unique identifier for the authorised user
    channelId (number) - A unique identifier for the channel 
Return Value: 
    Returns {error: 'error'} on invalid channel
    Returns {error: 'error'} if authorised user is not already a member of channel
    Returns {name, isPublic, ownerMembers, allMembers} on no error
*/
function channelDetailsV1(authUserId: number, channelId: number) : (error | channelDetails) {
    // Check if channelId and authUserId is valid
    if (!checkValidId(authUserId) || !checkValidChannel(channelId)) {
      return errorMsg;
    }
    // Check if authorised user is member of channel
    const channelList = channelsListV1(authUserId) as channelsList;
    let authUserValid = false;
    for (let channels of channelList.channels) {
      if (channelId === channels.channelId) {
        authUserValid = true;
      }
    }
    if (authUserValid === false) {
      return errorMsg;
    }
    let channel = returnValidChannel(channelId);
    let channelDetail = {
      name: channel.name,
      isPublic: channel.isPublic,
      ownerMembers: channel.ownerMembers,
      allMembers: channel.allMembers
    }
    return channelDetail;
  }

/*
ChannelJoinV1 Function
Given a channelId of a channel that the authorised user can join, adds them to that channel.
Arguments:
    authUserId (number) - A unique identifier for the authorised user
    channelId (number) - A unique identifier for the channel 
Return Value: 
    Returns {error: 'error'} on invalid channel
    Returns {error: 'error'} if authorised user is already a member of channel
    Returns {error: 'error'} on a private channel and auth user is not a global owner
    Returns {} on no error
*/
  function channelJoinV1(authUserId: number, channelId: number): (error | {}) {
      // Check if channelId and authUserId is valid
      if (!checkValidId(authUserId) || !checkValidChannel(channelId)) {
        return errorMsg;
      }
      let user = returnValidId(authUserId);
      let channel = returnValidChannel(channelId);
      if (channel.isPublic === false && user.permissionId === 2) {
        return errorMsg;
      }
      // Add user to the selected channel, update channel list in data, append authUser to allMembers array.
      let data = getData();
      const newUser = userProfileV1(authUserId, authUserId) as userReturn;
      channel.allMembers.push(newUser.user);
      setData(data);
      return {};
  }

/*
Invites a user with ID uId to join a channel with ID channelId. 
Once invited, the user is added to the channel immediately.

Arguments:
    authUserId (number)         - A unique identifier for the authorised user 
    channelId (number)          - A unique identifier for the channel
    uId (uId)                   - The user's first name, with non-alphanumeric characters

Return Value:
    Returns {error: 'error'}    when uId does not refer to a valid user
    Returns {error: 'error'}    when uId refers to a user who is already a member of the channel
    Returns {error: 'error'}    when channelId is valid and the authorised user is not a member of the channel
    Returns {} on no error
 */
function channelInviteV1(authUserId: number, channelId: number, uId: number): (error | {}) {
  // Checking if channelID and uId are valid
  let data = getData(); 
  const channel = returnValidChannel(channelId); 
  const user = returnValidId(uId); 
  if (channel === undefined || user === undefined) {
    return errorMsg;
  } 

  // Checking if uId and authUserID are members
  let uIdMember = false; 
  let authUserIdMember = false; 
  for (let member of channel.allMembers) {
    if (member.uId === uId) {
      uIdMember = true; 
    } else if (member.uId === authUserId) {
      authUserIdMember = true; 
    }
  }
  if (uIdMember === true || authUserIdMember === false ) {
    return errorMsg;
  }

  channel.allMembers.push(user); 
  setData(data); 
  return {};
}

/*
This function checks if authUserId, channelId are valid then starting from start 
returns 50 messages from a specified channel. If there are less than start+50
messages it returns -1 in the "end: " 

Arguments:
    authUserId (number)   - The userId of the user calling the function
    channelId (number)    - The channelId that user wishes to examine
    start(number)         - The index of messages you wish to start from

Return Value:
    Returns {error: 'error'} on invalid authUserId
    Returns {error: 'error'} on invalid channelId
    Returns {error: 'error'} on valid channelId but authUserId is not part of members
    Returns {error: 'error'} on start is greater than ammount of messages in messages
    Returns {messages: messages, start: start, end: -1} when all inputs are valid but 
    there are less than start+50 messages in messages
    Returns {messages: messages, start: start, end: start+50} when all inputs are 
    valid and there are more or start+50 messages in messages 
*/

type messagesUnder50 = { messages: message[], start: number, end: -1 }; 
type messagesOver50 = { messages: message[], start: number, end: number };

function channelMessagesV1(authUserId: number, channelId: number, start: number): (error | messagesUnder50 | messagesOver50) {
  if (!checkValidId(authUserId)) {
    return errorMsg;
  }
  const data = getData();
  if (!checkValidChannel(channelId)) {
    return errorMsg;
  }
  const currChannel = returnValidChannel(channelId);
  let isMember = false;
  for (let member of currChannel.allMembers) {
    if (authUserId === member.uId) {
      isMember = true;
    }
  }

  if (isMember === false) {
    return errorMsg;
  }
  const channelMsg = currChannel.messages;
  if (channelMsg.length < start) {
    return errorMsg;
  }
  
  const messages: Array<message> = [];
  let final = start + 50;
  for (let i = start; i < final; i++) {
    if (i >= channelMsg.length) {
      return {
        messages: messages,
        start: start,
        end: -1,
      };
    }
    messages.push(channelMsg[i]);
  }
  return {
    messages: messages,
    start: start,
    end: final,
  };
}
export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };

