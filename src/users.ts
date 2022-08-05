import { error, userReturn, getData, allUserReturn, UserInfo, channelsJoined, dmsJoined, messagesSent, channelsExist, dmsExist, messagesExist } from './dataStore';
import { returnValidId, checkValidToken, checkValidUser, updateUser, returnValidUser, getIdfromToken } from './helper';
import { checkValidEmail } from './auth';
import HTTPError from 'http-errors';

/**
 * userProfileV3
 * For a valid user, returns information about their userId, email, first name, last name, and handle
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} uId the id of the user that's details are being searched for
 *
 * Return Values:
 * @returns { error }
 *    if token is invalid
 *    if uId does not refer to a valid user
 * @returns { user } if there is no error
 */

function userProfileV3(token: string, uId: number) : error | userReturn {
  if (!checkValidUser(uId)) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }

  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }
  const user = returnValidId(uId);
  return {
    user: {
      uId: user.uId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.handleStr,
      profileImgUrl: user.profileImgUrl,
    }
  };
}

/**
 * userSetNameV2
 * Update the authorised user's first and last name
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {string} nameFirst The first name of the user
 * @param {string} nameLast The last name of the user
 *
 * Return Values:
 * @returns { error }
 *    if token is invalid
 *    if length of nameFirst is not between 1 and 50 characters inclusive
 *    if length of nameLast is not between 1 and 50 characters inclusive
 * @returns {} if there is no error
 */

function userSetNameV2(token: string, nameFirst: string, nameLast: string) : object | error {
  const firstNameLength = nameFirst.length;
  const lastNameLength = nameLast.length;
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }
  if (firstNameLength > 50 || firstNameLength < 1) {
    throw HTTPError(400, 'length of nameFirst is not between 1 and 50 characters inclusive');
  }
  if (lastNameLength > 50 || lastNameLength < 1) {
    throw HTTPError(400, 'length of nameLast is not between 1 and 50 characters inclusive');
  }
  const user = returnValidUser(token);
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;
  updateUser(user.uId, user);
  return {};
}

/**
 * userSetEmailV2
 * Update the authorised user's email address
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {string} email the email of the user
 *
 * Return Values:
 * @returns { error }
 *    if token is invalid
 *    if invalid user email
 *    if the email is already used by another user
 * @returns {} if there is no error
 */

function userSetEmailV2(token: string, email: string) {
  email = email.toLowerCase();
  if (!checkValidEmail(email)) {
    throw HTTPError(400, 'email entered is not a valid email');
  }
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }
  const user = returnValidUser(token);
  user.email = email;
  updateUser(user.uId, user);
  return {};
}

/**
 * userSetHandleV2
 * Update the authorised user's handle (i.e. display name)
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {string} handleStr the handle string of the user
 *
 * Return Values:
 * @returns { error }
 *    if token is invalid
 *    if invalid user handlestr
 *    if on handle without non-alphanumeric characters
 *    if when handle length is less than 3 or greater than 20 characters
 *    iv the handle is already used by another user
 * @returns {} if there is no error
 */

function userSetHandleV2(token: string, handleStr: string) {
  const handleLength = handleStr.length;
  if (handleLength > 20 || handleLength < 3) {
    throw HTTPError(400, 'length of handleStr is not between 3 and 20 characters inclusive');
  }
  if (handleStr.match(/^[0-9A-Za-z]+$/) === null) {
    throw HTTPError(400, 'handleStr contains characters that are not alphanumeric');
  }
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }
  const user = returnValidUser(token);
  // Cannot update handle str (same handlestr)
  if (handleStr.localeCompare(user.handleStr) === 0) {
    throw HTTPError(400, 'the handle is already used by another user');
  }
  user.handleStr = handleStr;
  updateUser(user.uId, user);
  return {};
}

/**
 * usersAllV2
 * Returns an array of all users and their associated details.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 *
 * Return Values:
 * @returns { error }
 *    if token is invalid
 * @returns { users: userDetails } if there is no error
 */

function usersAllV2(token: string) : error | allUserReturn {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }
  const users = getData().users;
  const userDetails: UserInfo[] = [];
  for (const member of users) {
    const current = userProfileV3(token, member.uId) as userReturn;
    userDetails.push(current.user);
  }
  return { users: userDetails };
}

interface workspaceStats {
  channelsExist: channelsExist[],
  dmsExist: dmsExist[],
  messagesExist: messagesExist[],
  utilizationRate: number,
}

type returnWorkspaceStats = { workspaceStats: workspaceStats};

/**
 * usersStatsV1
 * Fetch the required statistics about the workspace's use of UNSW Treats.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 *
 * Return Values:
 * @returns { error }
 *    if token is invalid
 * @returns {returnWorkspaceStats} if there is no error
 */

function usersStatsV1(token: string) : (returnWorkspaceStats) {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  const data = getData();
  let top = 0;
  const bottom = data.users.length;
  for (const object of data.users) {
    if (object.totalChannelsJoined > 0 || object.totalDmsJoined > 0) {
      top++;
    }
  }
  const utilizationRate = top / bottom;
  const temp = {
    channelsExist: data.channelsExist,
    dmsExist: data.dmsExist,
    messagesExist: data.messagesExist,
    utilizationRate: utilizationRate
  };
  return { workspaceStats: temp };
}

interface userStats {
  channelsJoined: channelsJoined[],
  dmsJoined: dmsJoined[],
  messagesSent: messagesSent[],
  involvementRate: number,
}

type returnUserStats = { userStats: userStats};

/**
 * userStatsV1
 * Fetch the required statistics about this user's use of UNSW Treats.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 *
 * Return Values:
 * @returns { error }
 *    if token is invalid
 * @returns {returnUserStats} if there is no error
 */

function userStatsV1(token: string) : (returnUserStats) {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  const data = getData();
  const uId = getIdfromToken(token);
  const top = data.users[uId].totalChannelsJoined + data.users[uId].totalDmsJoined + data.users[uId].totalMessagesSent;
  const bottom = data.totalMessagesExist + data.totalDmsExist + data.totalChannelsExist;
  let involvementRate = top / bottom;
  if (bottom === 0) {
    involvementRate = 0;
  } else if (involvementRate > 1) {
    involvementRate = 1;
  }
  if (isNaN(involvementRate)) involvementRate = 0;
  const temp = {
    channelsJoined: data.users[uId].channelsJoined,
    dmsJoined: data.users[uId].dmsJoined,
    messagesSent: data.users[uId].messagesSent,
    involvementRate: involvementRate
  };
  return { userStats: temp };
}
export { userProfileV3, userSetNameV2, userSetEmailV2, userSetHandleV2, usersAllV2, usersStatsV1, userStatsV1 };
