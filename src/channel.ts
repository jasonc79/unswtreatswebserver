import { error, errorMsg, UserInfo, Message, userReturn } from './dataStore';
import { getData, setData } from './dataStore';
import { checkValidChannel, returnValidChannel, checkValidToken, returnValidUser, isMember, isOwner, returnValidId, checkValidUser, getIdfromToken } from './helper';
import { userProfileV1 } from './users';

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
  if (!checkValidChannel(channelId) || !checkValidToken(token)) {
    return errorMsg;
  }
  const uId = returnValidUser(token);
  const user = userProfileV1(token, uId.uId) as userReturn;
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
    messages.push(channelMsg[i]);
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
  const data = getData();
  // const tempuId = returnValidUser(token);
  // const user = userProfileV1(token, tempuId.uId) as userReturn;
  const tempUser = returnValidId(uId);
  if (!checkValidChannel(channelId) || !checkValidToken(token) || !checkValidUser(uId) ||
  !isOwner(token, channelId) || !isMember(tempUser.token, channelId) || isOwner(tempUser.token, channelId)) {
    return errorMsg;
  }
  const newOwnerProfile = userProfileV1(token, uId) as userReturn;
  const currChannel = returnValidChannel(channelId);
  currChannel.ownerMembers.push(newOwnerProfile.user);
  setData(data);
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
  const data = getData();
  // const tempuId = returnValidUser(token);
  const user = userProfileV1(token, uId) as userReturn;
  // const user2 = userProfileV1(token, tempuId.uId) as userReturn;
  const tempUser = returnValidId(uId);
  if (!checkValidChannel(channelId) || !checkValidToken(token) || !checkValidUser(uId) ||
      !isOwner(tempUser.token, channelId) || !isOwner(token, channelId)) {
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
