import { error, errorMsg, UserInfo, Message, userReturn } from './dataStore';
import { getData, setData } from './dataStore';
import { checkValidChannel, returnValidChannel, checkValidToken, returnValidUser, isMember, isOwner, returnValidId, checkValidUser, getIdfromToken } from './helper';
import { userProfileV1 } from './users';

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
  const uId = returnValidUser(token);
  const user = userProfileV1(token, uId.uId) as userReturn;
  if (!checkValidChannel(channelId) || !checkValidToken(token)) {
    return errorMsg;
  }
  const currChannel = returnValidChannel(channelId);

  let isMember = false;
  for (const member of currChannel.allMembers) {
    if (user.user.uId === member.uId) {
      isMember = true;
    }
  }

  if (isMember === false) {
    return errorMsg;
  }

  const owners = [];
  const members = [];

  for (const owner of currChannel.ownerMembers) {
    const tempUser = {
      uId: owner.uId,
      email: owner.email,
      handleStr: owner.handleStr,
      nameFirst: owner.nameFirst,
      nameLast: owner.nameLast,
    };
    owners.push(tempUser);
  }

  for (const member of currChannel.allMembers) {
    const tempUser = {
      uId: member.uId,
      email: member.email,
      handleStr: member.handleStr,
      nameFirst: member.nameFirst,
      nameLast: member.nameLast,
    };
    members.push(tempUser);
  }

  const channelDetail = {
    name: currChannel.name,
    isPublic: currChannel.isPublic,
    ownerMembers: owners,
    allMembers: members
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
/**
 * channelJoinV1
 * Adds the current user to the channel
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId is the id of the channel beign accessed
 *
 * Return Values:
 * @returns { error }
 *    if token is invalid
 *    if the cahnnelId is invalid
 * @returns {} if there is no error
 */
function channelJoinV1(token: string, channelId: number): (error | object) {
  // Check if channelId and token is valid
  if (!checkValidToken(token) || !checkValidChannel(channelId)) {
    return errorMsg;
  }
  const user = returnValidUser(token);
  const channel = returnValidChannel(channelId);

  if ((channel.isPublic === false && user.permissionId === 2) || isMember(token, channel.channelId)) {
    return errorMsg;
  }
  // Add user to the selected channel, update channel list in data, append authUser to allMembers array.
  const data = getData();
  const newUser = userProfileV1(token, user.uId) as userReturn;
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
function channelInviteV1(token: string, channelId: number, uId: number): (error | object) {
  if (!checkValidToken(token)) {
    return errorMsg;
  }
  // Checking if channelID and uId are valid
  const data = getData();
  const channel = returnValidChannel(channelId);
  const user = returnValidId(uId);
  if (channel === undefined || user === undefined) {
    return errorMsg;
  }
  // Checking if uId and authUserID are members
  const authUserId = getIdfromToken(token);
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
  // const uId = returnValidUser(token);

  if (!checkValidChannel(channelId) || !checkValidToken(token)) {
    return errorMsg;
  }

  if (!isMember(token, channelId)) {
    return errorMsg;
  }

  const currChannel = returnValidChannel(channelId);
  const channelMsg = currChannel.messages;
  const messages: Array<Message> = [];
  const final = start + 50;

  if (channelMsg.length < start) {
    return errorMsg;
  }

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

function channelLeaveV1(token: string, channelId: number): (error | object) {
  const data = getData();
  const uId = returnValidUser(token);
  const user = userProfileV1(token, uId.uId) as userReturn;
  if (!checkValidChannel(channelId) || !checkValidToken(token) || !isMember(token, channelId)) {
    return errorMsg;
  }
  const currChannel = returnValidChannel(channelId);
  currChannel.ownerMembers = currChannel.ownerMembers.filter((temp) => temp.uId !== user.user.uId);
  currChannel.allMembers = currChannel.allMembers.filter((temp) => temp.uId !== user.user.uId);
  setData(data);
  return {};
}

function channelAddOwnerV1(token: string, channelId: number, uId: number): (error | object) {
  const data = getData();
  // const tempuId = returnValidUser(token);
  // const user = userProfileV1(token, tempuId.uId) as userReturn;
  if (!checkValidChannel(channelId) || !checkValidToken(token) || !checkValidUser(uId) ||
  !isOwner(token, channelId) || !isMember(token, channelId) || isOwner(token, channelId)) {
    return errorMsg;
  }
  const newOwnerProfile = userProfileV1(token, uId) as userReturn;
  const currChannel = returnValidChannel(channelId);
  currChannel.ownerMembers.push(newOwnerProfile.user);
  setData(data);
  return {};
}

function channelRemoveOwnerV1(token: string, channelId: number, uId: number): (error | object) {
  const data = getData();
  // const tempuId = returnValidUser(token);
  const user = userProfileV1(token, uId) as userReturn;
  // const user2 = userProfileV1(token, tempuId.uId) as userReturn;
  if (!checkValidChannel(channelId) || !checkValidToken(token) || !checkValidUser(uId) ||
      !isOwner(token, channelId) || !isOwner(token, channelId)) {
    return errorMsg;
  }

  const currChannel = returnValidChannel(channelId);
  if (currChannel.ownerMembers.length === 1) {
    return errorMsg;
  }
  currChannel.ownerMembers = currChannel.ownerMembers.filter((temp) => temp.uId !== user.user.uId);
  setData(data);
  return {};
}

export { channelDetailsV2, channelJoinV1, channelInviteV1, channelMessagesV2, channelLeaveV1, channelAddOwnerV1, channelRemoveOwnerV1 };
