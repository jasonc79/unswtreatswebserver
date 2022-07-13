import { error, errorMsg, UserInfo, Message } from './dataStore';
import { getData, setData } from './dataStore';
import { checkValidChannel, returnValidChannel, returnValidId, checkValidId, returnValidUser, checkValidToken, returnIsMember, returnIsOwner } from './helper';
import { userProfileV1 } from './users';
import { channelsListV1 } from './channels';

// UNCOMMENT WHEN implementing CHANNEL/JOIN OR CHANNELS/LIST
/*
import { userReturn, ChannelInfo } from './dataStore';
import { userProfileV1 } from './users';
type channelsList = { channels: ChannelInfo[] };
*/

type channelDetails = { name: string, isPublic: boolean, ownerMembers: UserInfo[], allMembers: UserInfo[] };

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
function channelDetailsV2(token: string, channelId: number) : (error | channelDetails) {
  const data = getData();
  const uId = returnValidUser(token);
  const user = userProfileV1(token, uId.uId) as userReturn;  
  if (!checkValidChannel(channelId) || !checkValidToken(token)) {
    return errorMsg;
  }
  let authUserValid = false;
  const currChannel = returnValidChannel(channelId)

  let isMember = false;
  for (const member of currChannel.allMembers) {
    if (user.uId === member.uId) {
      isMember = true;
    }
  }

  if (isMember === false) {
    return errorMsg;
  }

  const channelDetail = {
    name: channel.name,
    isPublic: channel.isPublic,
    ownerMembers: channel.ownerMembers,
    allMembers: channel.allMembers
  };
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
function channelJoinV1(authUserId: number, channelId: number): (error | object) {
  /* // Check if channelId and authUserId is valid
  if (!checkValidId(authUserId) || !checkValidChannel(channelId)) {
    return errorMsg;
  }
  const user = returnValidId(authUserId);
  const channel = returnValidChannel(channelId);
  if (channel.isPublic === false && user.permissionId === 2) {
    return errorMsg;
  }
  // Add user to the selected channel, update channel list in data, append authUser to allMembers array.
  const data = getData();
  const newUser = userProfileV1(authUserId, authUserId) as userReturn;
  channel.allMembers.push(newUser.user);
  setData(data); */
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
function channelInviteV1(authUserId: number, channelId: number, uId: number): (error | object) {
  // Checking if channelID and uId are valid
  const data = getData();
  const channel = returnValidChannel(channelId);
  const user = returnValidId(uId);
  if (channel === undefined || user === undefined) {
    return errorMsg;
  }
  // Checking if uId and authUserID are members
  let uIdMember = false;
  let authUserIdMember = false;
  for (const member of channel.allMembers) {
    if (member.uId === uId) {
      uIdMember = true;
    } else if (member.uId === authUserId) {
      authUserIdMember = true;
    }
  }
  if (uIdMember === true || authUserIdMember === false) {
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

type messagesUnder50 = { messages: Message[], start: number, end: -1 };
type messagesOver50 = { messages: Message[], start: number, end: number };


function channelMessagesV2(token: string, channelId: number, start: number): (error | messagesUnder50 | messagesOver50) {
  //uId becomes valid user from returnValidUser
  const uId = returnValidUser(token);
  if (!checkValidChannel(channelId) || !checkValidToken(token)) {
    return errorMsg;
  }
  const currChannel = returnValidChannel(channelId);
  if (!returnIsMember(uId.uId, channelId)) {
    return errorMsg;
  }

  const channelMsg = currChannel.messages;
  if (channelMsg.length < start) {
    return errorMsg;
  }

  const messages: Array<Message> = [];
  const final = start + 50;
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

function channelLeaveV1(token: string, channelId: number): (error | {}) {
  const data = getData();
  const uId = returnValidUser(token);
  const user = userProfileV1(token, uId.uId) as userReturn;
  if (!checkValidChannel(channelId) || !checkValidToken(token) || !returnIsMember(uId.uId, channelId)) {
    return errorMsg;
  }
  const currChannel = returnValidChannel(channelId);
  let i = 0
  if (returnIsOwner(uId.uId, channelId)) {
    let j = 0
    for (const member of currChannel.ownerMembers) {
      if (member.uId = uId.uId) {
        currChannel.ownerMembers.splice(j, 1)
      }
      j++;
    }
  }
  for (const member of currChannel.allMembers) {
    if (member.uId = uId.uId) {
      currChannel.allMembers.splice(i, 1)
    }
    i++;
  }
  return {};
}

function channelAddOwnerV1(token: string, channelId: number, uId: number): (error | {}) {
  const data = getData();
  const tempuId = returnValidUser(token);
  const user = userProfileV1(token, tempuId.uId) as userReturn;
  if (!checkValidChannel(channelId) || !checkValidToken(token) || !checkValidId(uId) ||
      !returnIsOwner(user.user.uId, channelId) || !returnIsMember(uId, channelId)) {
    return errorMsg;
  }
  const currChannel = returnValidChannel(channelId);
  currChannel.ownerMembers.push(user);
  return {};
}

function channelRemoveOwnerV1(token: string, channelId: number, uId: number): (error | {}) {
  const data = getData();
  const tempuId = returnValidUser(token);
  const user = userProfileV1(token, tempuId.uId) as userReturn;
  if (!checkValidChannel(channelId) || !checkValidToken(token) || !checkValidId(uId) ||
      !returnIsOwner(uId, channelId) || !returnIsOwner(user.user.uId, channelId)) {
    return errorMsg;
  }
  const currChannel = returnValidChannel(channelId);
  if (currChannel.ownerMembers.length === 1) {
    return errorMsg
  }
  const i = 0
  for (const member of currChannel.allMembers) {
    if (member.uId = uId) {
      currChannel.allMembers.splice(i, 1)
    }
    i++;
  }
}

export { channelDetailsV2, channelJoinV1, channelInviteV1, channelMessagesV2 };