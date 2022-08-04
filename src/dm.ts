import { getData, setData, error, errorMsg, Message, Dm, DmInfo, userReturn, UserInfo, dmReturn, dmId } from './dataStore';
import { checkValidToken, checkValidUser, returnValidUser, checkValidDm, returnValidDm, getIdfromToken, isMemberDm, isOwnerDm } from './helper';
import { userProfileV3 } from './users';
import {notifyUserInvite} from './notifications'
import HTTPError from 'http-errors';

/**
 * dmCreateV2
 *
 * Creates a DM where uIds contains the user(s) that this DM is directed to.
 * The user with the token is the owner of the DM.
 *
 * Arguments:
 * @param {string} token is a unique identifier for the authorised user's current session
 * @param {number[]} uIds is an array of user's uIds, not including the creator of the DM
 *
 * Return Values:
 * @returns { error: 'error' }
 *    when any uId in uIds does not refer to a valid user
 *    when there are duplicate 'uId's in uIds
 * @returns { dmId } on no error
 */
const dmCreateV2 = (token: string, uIds: number[]): dmId | error => {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  const authUserId = returnValidUser(token);
  const authUser = userProfileV3(token, authUserId.uId) as userReturn;

  // Any uId in uIds does not refer to a valid user
  for (const u of uIds) {
    if (!checkValidUser(u)) {
      throw HTTPError(400, 'uId does not refer to a valid user');
    }
  }
  // There are duplicate uIds in uIds
  const uniqueIds = Array.from(new Set(uIds));
  if (uIds.length !== uniqueIds.length) {
    throw HTTPError(400, 'Duplicate uIds');
  }

  const data = getData();
  const dmId = data.dms.length;

  const DmMembers = [];
  DmMembers.push(authUser.user);
  for (const uId of uIds) {
    const DmMember = userProfileV3(token, uId) as userReturn;
    DmMembers.push(DmMember.user);
  }
  const dmName: string = generateDmName(DmMembers);

  const newDm : Dm = {
    dmId: dmId,
    name: dmName,
    members: DmMembers,
    owners: [authUser.user],
    messages: [],
  };
  data.dms.push(newDm);
  setData(data);
  for (const uId of uIds) {
    notifyUserInvite(token, uId, -1, dmId);
  }

  return { dmId: dmId };
};

/**
 * dmDetailsV2
 *
 * Given a DM with ID dmId that the authorised user is a member of,
 * provide basic details about the DM.
 *
 * Arguments:
 * @param {string} token is a unique identifier for the authorised user's current session
 * @param {number} dmId is a unique identifier for a DM
 *
 * Return Values:
 * @returns { error: 'error' }
 *    when dmId does not refer to a valid DM
 *    when dmId is valid and the authorised user is not a member of the DM
 * @returns { name, members } on no error
 */
type dmDetails = { name: string, members: UserInfo[] };
const dmDetailsV2 = (token: string, dmId: number): dmDetails | error => {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  // Check if dmId  is valid
  if (!checkValidDm(dmId)) {
    throw HTTPError(400, 'dmId is invalid');
  }

  // Check if authorised user is member of dm and token is vaild
  if (!isMemberDm(token, dmId)) {
    throw HTTPError(403, 'Authorised user is not a member of the DM');
  }

  const dm = returnValidDm(dmId);
  return {
    name: dm.name,
    members: dm.members as UserInfo[],
  };
};

/**
 * dmListV2
 *
 * Returns the array of DMs that the user is a member of.
 *
 * Arguments:
 * @param {string} token is a unique identifier for the authorised user's current session
 *
 * Return Values:
 * @returns { } on no error
 */
const dmListV2 = (token: string): dmReturn | error => {
  if (!checkValidToken(token)) {
    return errorMsg;
  }

  const data = getData();
  const user = returnValidUser(token);
  const dms: DmInfo[] = [];

  for (const dm of data.dms) {
    for (const member of dm.members) {
      if (member.uId === user.uId) {
        dms.push({
          dmId: dm.dmId,
          name: dm.name,
        });
      }
    }
  }
  return { dms: dms };
};

/**
 * dmRemoveV2
 *
 * Remove an existing DM, so all members are no longer in the DM.
 * This can only be done by the original creator of the DM.
 *
 * Arguments:
 * @param {string} token is a unique identifier for the authorised user's current session
 * @param {number} dmId is a unique identifier for a DM
 *
 * Return Values:
 * @returns { error: 'error' }
 *    when dmId does not refer to a valid DM
 *    when dmId is valid and the authorised user is not the original DM creator
 *    when dmId is valid and the authorised user is no longer in the DM
 * @returns { } on no error
 */
const dmRemoveV2 = (token: string, dmId: number): Record<string, never> | error => {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  if (!checkValidDm(dmId)) {
    throw HTTPError(400, 'dmId is invalid');
  }

  if (!isOwnerDm(token, dmId)) {
    throw HTTPError(403, 'Authorised user is not the original DM creator');
  }

  if (!isMemberDm(token, dmId)) {
    throw HTTPError(403, 'Authorised user is no longer in the DM');
  }

  const data = getData();
  const dmDetails = returnValidDm(dmId);
  data.dms = data.dms.filter((item) => {
    return item !== dmDetails;
  });
  setData(data);
  return {};
};

/**
 * dmLeaveV2
 *
 * Given a DM ID, the user is removed as a member of this DM
 * The creator is allowed to leave and the DM will still exist if this happens.
 *
 * Arguments:
 * @param {string} token is a unique identifier for the authorised user's current session
 * @param {number} dmId is a unique identifier for a DM
 *
 * Return Values:
 * @returns { error: 'error' }
 *    when dmId does not refer to a valid DM
 *    when dmId is valid and the authorised user is not the original DM creator
 *    when dmId is valid and the authorised user is no longer in the DM
 * @returns { } on no error
 */
const dmLeaveV2 = (token: string, dmId: number) : error | object => {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  if (!checkValidDm(dmId)) {
    throw HTTPError(400, 'dmId is not valid');
  }

  if (!isMemberDm(token, dmId)) {
    throw HTTPError(403, 'Authorised user is not a member of the DM');
  }

  const data = getData();
  const user = userProfileV3(token, getIdfromToken(token)) as userReturn;

  let leaveDm: Dm;
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      leaveDm = dm;
    }
  }

  leaveDm.members = leaveDm.members.filter((item) => {
    return item.uId !== user.user.uId;
  });
  if (isOwnerDm(token, dmId)) {
    leaveDm.owners = leaveDm.owners.filter((item) => {
      return item.uId !== user.user.uId;
    });
  }
  setData(data);
  return {};
};

/// /// HELPER FUNCTIONS ///////
const generateDmName = (DmMembers: UserInfo[]): string => {
  const DmHandles = [];
  for (const member of DmMembers) {
    DmHandles.push(member.handleStr);
  }
  const sortedHandles = DmHandles.sort();

  let dmName = '';
  for (const handle of sortedHandles) {
    dmName += handle;
    dmName += ', ';
  }
  const dmNameFinal = dmName.slice(0, -2); // Remove final comma and space
  return dmNameFinal;
};

/**
 * dmMessagesV1
 * Given a DM with ID dmId that the authorised user is a member of,
 * return up to 50 messages between index "start" and "start + 50".
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} dmId is the id of the dm being accessed
 * @param {number} start where messages will start printing from
 *
 * Return Values:
 * @returns { error }
 *    if token is invalid
 *    if the dmId is invalid
 *    start is greater than number of messages
 *    token is not part of dm
 * @returns { messagesUnder50 } if there is no error and if less than 50 messages
 * @returns { messagesOver50 } if there is no error and there is 50 messages
 */

type messagesUnder50 = { messages: Message[], start: number, end: -1 };
type messagesOver50 = { messages: Message[], start: number, end: number };
function dmMessagesV2(token: string, dmId: number, start: number): (messagesUnder50 | messagesOver50) {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  if (!checkValidDm(dmId)) {
    throw HTTPError(400, 'dmlId does not refer to a valid DM');
  }
  if (!isMemberDm(token, dmId)) {
    throw HTTPError(403, 'dmId is valid and the authorised user is not a member of the DM');
  }

  const currDm = returnValidDm(dmId);
  const dmMsg = currDm.messages;
  const messages: Array<Message> = [];
  const final = start + 50;

  if (dmMsg.length < start) {
    throw HTTPError(400, 'start is greater than the total number of messages in the channel');
  }

  for (let i = start; i < final; i++) {
    if (i >= dmMsg.length) {
      return {
        messages: messages,
        start: start,
        end: -1,
      };
    }
    messages.unshift(dmMsg[i]);
  }
  return {
    messages: messages,
    start: start,
    end: final,
  };
}
export { dmCreateV2, dmLeaveV2, dmMessagesV2, dmDetailsV2, dmListV2, dmRemoveV2 };
