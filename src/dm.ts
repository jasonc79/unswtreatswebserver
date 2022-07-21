import { getData, setData, error, errorMsg, Message, Dm, DmInfo, userReturn, UserInfo, dmReturn } from './dataStore';
import { checkValidToken, checkValidUser, returnValidUser, checkValidDm, returnValidDm, getIdfromToken, isMemberDm, isOwnerDm } from './helper';
import { userProfileV1 } from './users';

/**
 * dmCreateV1
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
type dmId = { dmId: number };
const dmCreateV1 = (token: string, uIds: number[]): dmId | error => {
  if (!checkValidToken(token)) {
    return errorMsg;
  }

  const authUserId = returnValidUser(token);
  const authUser = userProfileV1(token, authUserId.uId) as userReturn;

  // Any uId in uIds does not refer to a valid user
  for (const u of uIds) {
    if (!checkValidUser(u)) {
      return errorMsg;
    }
  }
  // There are duplicate uIds in uIds
  const uniqueIds = Array.from(new Set(uIds));
  if (uIds.length !== uniqueIds.length) {
    return errorMsg;
  }

  const data = getData();
  const dmId = data.dms.length;

  const DmMembers = [];
  DmMembers.push(authUser.user);
  for (const uId of uIds) {
    const DmMember = userProfileV1(token, uId) as userReturn;
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
  return { dmId: dmId };
};

/**
 * dmDetailsV1
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
const dmDetailsV1 = (token: string, dmId: number): dmDetails | error => {
  // Check if dmId  is valid
  if (!checkValidDm(dmId) || !checkValidToken(token)) {
    return errorMsg;
  }

  // Check if authorised user is member of dm
  if (!isMemberDm(token, dmId)) {
    return errorMsg;
  }

  const dm = returnValidDm(dmId);
  return {
    name: dm.name,
    members: dm.members as UserInfo[],
  };
};

/**
 * dmListV1
 *
 * Returns the array of DMs that the user is a member of.
 *
 * Arguments:
 * @param {string} token is a unique identifier for the authorised user's current session
 *
 * Return Values:
 * @returns { } on no error
 */
const dmListV1 = (token: string): dmReturn | error => {
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
 * dmRemoveV1
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
const dmRemoveV1 = (token: string, dmId: number): Record<string, never> | error => {
  if (!checkValidDm(dmId) || !checkValidToken(token)) {
    return errorMsg;
  }

  if (!isOwnerDm(token, dmId) || !isMemberDm(token, dmId)) {
    return errorMsg;
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
 * dmLeaveV1
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
const dmLeaveV1 = (token: string, dmId: number) : error | object => {
  if (!checkValidToken(token) || !checkValidDm(dmId) || !isMemberDm(token, dmId)) {
    return errorMsg;
  }
  const data = getData();
  const dm = returnValidDm(dmId);
  const user = userProfileV1(token, getIdfromToken(token)) as userReturn;
  dm.members = dm.members.filter((item) => {
    return item.uId !== user.user.uId;
  });
  if (isOwnerDm(token, dmId)) {
    dm.owners = dm.owners.filter((item) => {
      return item.uId !== user.user.uId;
    });
    setData(data);
  }
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
function dmMessagesV1(token: string, dmId: number, start: number): (error | messagesUnder50 | messagesOver50) {
  if (!checkValidDm(dmId) || !checkValidToken(token)) {
    return errorMsg;
  }

  if (!isMemberDm(token, dmId)) {
    return errorMsg;
  }

  const currDm = returnValidDm(dmId);
  const dmMsg = currDm.messages;
  const messages: Array<Message> = [];
  const final = start + 50;

  if (dmMsg.length < start) {
    return errorMsg;
  }

  for (let i = start; i < final; i++) {
    if (i >= dmMsg.length) {
      return {
        messages: messages,
        start: start,
        end: -1,
      };
    }
    messages.push(dmMsg[i]);
  }
  return {
    messages: messages,
    start: start,
    end: final,
  };
}

export { dmCreateV1, dmLeaveV1, dmMessagesV1, dmDetailsV1, dmListV1, dmRemoveV1 };
