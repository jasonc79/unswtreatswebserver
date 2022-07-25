import { error, errorMsg, UserInfo, Message, userReturn } from './dataStore';
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
    return errorMsg;
  } else if (!checkValidToken(token)) {
    return errorMsg;
  } else if (!isMember(token, channelId)) {
    return errorMsg;
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
  channel.allMembers.push(user);
  updateChannel(channelId, channel);
  return {};
}
/**
 * channelInviteV1
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

function channelInviteV1(token: string, channelId: number, uId: number): (error | object) {
  if (!checkValidToken(token)) {
    return errorMsg;
  }
  // Checking if channelID and uId are valid
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

function channelMessagesV3(token: string, channelId: number, start: number): (messagesUnder50 | messagesOver50) {
  // const uId = returnValidUser(token);
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  if (!checkValidChannel(channelId)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }
  if (!isMember(token, channelId)) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }
  const currChannel = returnValidChannel(channelId);
  const channelMsg = currChannel.messages;
  const messages: Array<Message> = [];
  const final = start + 50;

  if (channelMsg.length < start) {
    throw HTTPError(400, 'start is greater than the total number of messages in the channel');
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

function channelLeaveV2(token: string, channelId: number): (object) {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  } else if (!checkValidChannel(channelId)) {
    throw HTTPError(400, 'ChannelId does not refer to a valid channel');
  } else if (!isMember(token, channelId)) {
    throw HTTPError(403, 'ChannelId is valid and the authorised user is not a member of the channel');
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

function channelAddOwnerV2(token: string, channelId: number, uId: number): (object) {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  if (!checkValidUser(uId)) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }
  if (!checkValidChannel(channelId)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }
  if (!isOwner(token, channelId) && !isGlobalOwner(token)) {
    throw HTTPError(403, 'channelId is valid and the authorised user does not have owner permissions in the channel');
  }
  if (isOwnerFromId(uId, channelId)) {
    throw HTTPError(400, 'uId refers to a user who is already an owner of the channel');
  }
  if (!isMemberFromId(uId, channelId)) {
    throw HTTPError(400, 'uId refers to a user who is not a member of the channel');
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

function channelRemoveOwnerV2(token: string, channelId: number, uId: number): (object) {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  if (!checkValidUser(uId)) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }
  if (!checkValidChannel(channelId)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }
  if (!isOwner(token, channelId) && !isGlobalOwner(token)) {
    throw HTTPError(403, 'channelId is valid and the authorised user does not have owner permissions in the channel');
  }
  if (!isOwnerFromId(uId, channelId)) {
    throw HTTPError(400, 'uId refers to a user who is not an owner of the channel');
  }
  const user = userProfileV1(token, uId) as userReturn;
  const currChannel = returnValidChannel(channelId);
  if (currChannel.ownerMembers.length === 1) {
    throw HTTPError(400, 'uId refers to a user who is currently the only owner of the channel');
  }

  currChannel.ownerMembers = currChannel.ownerMembers.filter((temp) => temp.uId !== user.user.uId);
  updateChannel(channelId, currChannel);
  return {};
}

export { channelDetailsV2, channelJoinV1, channelInviteV1, channelMessagesV3, channelLeaveV2, channelAddOwnerV2, channelRemoveOwnerV2 };
