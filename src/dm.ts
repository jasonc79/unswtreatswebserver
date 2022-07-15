import { getData, setData, error, errorMsg, Dm, userReturn, Message } from './dataStore';
import { checkValidToken, checkValidUser, returnValidUser, checkValidDm, returnValidDm, getIdfromToken, isMemberDm, isOwnerDm } from './helper';
import { userProfileV1 } from './users';

// Stubbed dm functions
type dmId = { dmId: number };
const dmCreateV1 = (token: string, uIds: number[]): dmId | error => {
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
  for (const uId of uIds) {
    const DmMember = userProfileV1(token, uId) as userReturn;
    DmMembers.push(DmMember.user);
  }
  DmMembers.push(authUser.user);

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
  dmName.slice(0, -2); // Remove final comma and space

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
/*
type dmReturn = {
  dmId: number,
  name: string,
};
type dmsList = { dms: dmReturn[] };

type dmDetails = { name: string, members: UserInfo[] };
const dmDetailsV1 = (token: string, dmId: number): dmDetails | error | number => {
  // Check if dmId  is valid
  if (!checkValidDm(dmId)) {
    return 1;
  }

  // Check if authorised user is member of dm
  const dm = returnValidDm(dmId);
  const authUser = returnValidUser(token);
  let validMember = false;
  for (const member of dm.members) {
    if (member.uId === authUser.uId) {
      validMember = true;
    }
  }
  if (validMember === false) {
    return 2;
  }

  const dmDetail = {
    name: dm.name,
    members: dm.members as UserInfo[],
  };
  return dmDetail;
};

type dms = { dms: Dm[] };
const dmListV1 = (token: string): dms | error => {
  if (!checkValidToken(token)) {
    return errorMsg;
  }

  const data = getData();
  const uId = returnValidUser(token);
  const user = userProfileV1(token, uId.uId) as userReturn;
  const dms = [];

  for (const dm of data.dms) {
    for (const member of dm.members) {
      if (member.uId === user.user.uId) {
        dms.push({
          dmId: dm.dmId,
          name: dm.name,
        });
      }
    }
  }

  return { dms: dms };
};

const dmRemoveV1 = (token: string, dmId: number): Record<string, never> | error => {
  return {};
};
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

/**
 * channelMessagesV2
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

export { dmCreateV1, dmLeaveV1, dmMessagesV1 }; //, dmDetailsV1, dmListV1, dmRemoveV1 };
