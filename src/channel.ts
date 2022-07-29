import { error, errorMsg, UserInfo, Message, userReturn, OWNER, empty } from './dataStore';
import { checkValidChannel, returnValidChannel, checkValidToken, isGlobalOwner, returnValidUser, isMemberFromId, isOwnerFromId, isMember, isOwner, returnValidId, checkValidUser, getIdfromToken } from './helper';
import { updateChannel } from './helper';
import { userProfileV1 } from './users';
import HTTPError from 'http-errors';

type channelDetails = { name: string, isPublic: boolean, ownerMembers: UserInfo[], allMembers: UserInfo[] };

/**
 * ChannelDetailsV2
 * Given a channel with ID channelId that the authorised user is a member of, provide basic details about the channel.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId is the id of the channel being accessed
 *
 * @returns { error }
 *    channelId is invalid
 *    token is invalid
 *    function caller isnt part of channel
 * @returns { channelDetails } if there is no error
 */

function channelDetailsV2(token: string, channelId: number) : (error | channelDetails) {
  if (!checkValidChannel(channelId)) {
    throw HTTPError(400, 'Invalid channelId');
  } else if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  } else if (!isMember(token, channelId)) {
    throw HTTPError(403, 'Authorisd user is not a member of the channel');
  }

  const currChannel = returnValidChannel(channelId);
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
function channelJoinV1(token: string, channelId: number): (error | empty) {
  // Check if channelId and token is valid
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  } else if (!checkValidChannel(channelId)) {
    throw HTTPError(400, 'Invalid channelId');
  }
  const user = returnValidUser(token);
  const channel = returnValidChannel(channelId);
  const userIsMember = isMember(token, channel.channelId);

  if (userIsMember) {
    throw HTTPError(400, 'The authorised user is already a member of the channel');
  }
  if (channel.isPublic === false && user.permissionId !== OWNER && !userIsMember) {
    throw HTTPError(403, 'The authorised user is not a global owner and has no access to a private channel');
  }

  // Add user to the selected channel, update channel list in data, append authUser to allMembers array.
  channel.allMembers.push(user);
  updateChannel(channelId, channel);
  return {};
}
/**
 * channelInviteV3
 * Invites a user with ID uId to join a channel with ID channelId.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId is the id of the channel being accessed
 * @param {number} uId the id of the user who wants to join the channel
 *
 * Return Values:
 * @returns { error }
 *    if token is invalid
 *    if the chnnelId is invalid
 *    if uId not valid
 *    if user is not part of channel
 *    if user is already part of channel
 * @returns {} if there is no error
 */

function channelInviteV3(token: string, channelId: number, uId: number): (error | object) {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invvalid token');
  }
  // Checking if channelID and uId are valid
  const channel = returnValidChannel(channelId);
  const user = returnValidId(uId);
  if (channel === undefined) {
    throw HTTPError(400, 'Invalid channelId');
  } else if (user === undefined) {
    throw HTTPError(400, 'Invalid userId');
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
  if (uIdMember === true) {
    throw HTTPError(400, 'User is already a member of the channel');
  } else if (authUserIdMember === false) {
    throw HTTPError(403, 'Authorised user is not a member of the channel');
  }

  channel.allMembers.push(user);
  updateChannel(channelId, channel);
  return {};
}

/**
 * channelMessagesV2
 * Given a channel with ID channelId that the authorised user is a member of, return up to 50 messages
 * between index "start" and "start + 50".
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId is the id of the channel being accessed
 * @param {number} start where messages will start printing from
 *
 * Return Values:
 * @returns { error }
 *    if token is invalid
 *    if the chnnelId is invalid
 *    start is greater than number of messages
 *    token is not part of channel
 * @returns { messagesUnder50 } if there is no error and if less than 50 messages
 * @returns { messagesOver50 } if there is no error and there is 50 messages
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
    messages.unshift(channelMsg[i]);
  }
  return {
    messages: messages,
    start: start,
    end: final,
  };
}

/**
 * channelLeaveV1
 * Given a channel with ID channelId that the authorised user is a member of, remove them as a member of the channel.
 *
 * Arguments
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId is the id of the channel being accessed
 *
 * Return values
 * @returns { error }
 *    token invalid
 *    channelId is invalid
 *    user is not part of channel
 * @returns { object } on no error
 */

function channelLeaveV1(token: string, channelId: number): (error | object) {
  if (!checkValidChannel(channelId)) {
    return errorMsg;
  } else if (!checkValidToken(token) || !isMember(token, channelId)) {
    return errorMsg;
  }
  const user = returnValidUser(token);
  const currChannel = returnValidChannel(channelId);
  currChannel.ownerMembers = currChannel.ownerMembers.filter((temp) => temp.uId !== user.uId);
  currChannel.allMembers = currChannel.allMembers.filter((temp) => temp.uId !== user.uId);
  updateChannel(channelId, currChannel);
  return {};
}

/**
 * channelAddOwnerV1
 * Make user with user id uId an owner of the channel.
 *
 * Arguments
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId is the id of the channel being accessed
 * @param {number} uId the user to become owner
 *
 * Return values
 * @returns { error }
 *    channelId invalid
 *    uId is invalid
 *    uId is already owner
 *    uId is not member
 *    token is not owner
 *    token is invalid
 *
 * @returns { object } when no error
 */

function channelAddOwnerV1(token: string, channelId: number, uId: number): (error | object) {
  if (!checkValidToken(token) || !checkValidUser(uId) || !checkValidChannel(channelId)) {
    return errorMsg;
  }
  if (!isOwner(token, channelId) && !isGlobalOwner(token)) {
    return errorMsg;
  }
  if (isOwnerFromId(uId, channelId) || !isMemberFromId(uId, channelId)) {
    return errorMsg;
  }
  const newOwnerProfile = userProfileV1(token, uId) as userReturn;
  const currChannel = returnValidChannel(channelId);
  currChannel.ownerMembers.push(newOwnerProfile.user);
  updateChannel(channelId, currChannel);
  return {};
}

/**
 * channelRemoveOwnerV1
 * Remove user with user id uId as an owner of the channel.
 *
 * Arguments
 * @param {string} token tells the server who is currently accessing it
 * @param {number} channelId is the id of the channel being accessed
 * @param {number} uId the user to remove owner
 *
 * Return values
 * @returns { error }
 *    channelId invalid
 *    uId is invalid
 *    uId is not owner
 *    uId is only owner
 *    token is not owner
 *    token is invalid
 *
 * @returns { object } when no error
 */

function channelRemoveOwnerV1(token: string, channelId: number, uId: number): (error | object) {
  if (!checkValidToken(token) || !checkValidUser(uId) || !checkValidChannel(channelId)) {
    return errorMsg;
  }
  if (!isOwner(token, channelId) && !isGlobalOwner(token)) {
    return errorMsg;
  }
  if (!isOwnerFromId(uId, channelId)) {
    return errorMsg;
  }
  const user = userProfileV1(token, uId) as userReturn;
  const currChannel = returnValidChannel(channelId);
  if (currChannel.ownerMembers.length === 1) {
    return errorMsg;
  }

  currChannel.ownerMembers = currChannel.ownerMembers.filter((temp) => temp.uId !== user.user.uId);
  updateChannel(channelId, currChannel);
  return {};
}

export { channelDetailsV2, channelJoinV1, channelInviteV3, channelMessagesV2, channelLeaveV1, channelAddOwnerV1, channelRemoveOwnerV1 };
