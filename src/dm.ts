import { getData, setData, error, errorMsg, Dm, userReturn, UserInfo } from './dataStore';
import { checkValidUser, returnValidUser, checkValidDm, returnValidDm, checkValidToken, isMemberDm, isOwnerDm } from './helper';
import { userProfileV1 } from './users';

type dmId = { dmId: number };
const dmCreateV1 = (token: string, uIds: number[]): dmId | error => {
  const authUserId = returnValidUser(token);
  const authUser = userProfileV1(token, authUserId.uId) as userReturn;
  if (!checkValidToken) {
    return errorMsg;
  }

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
  const dmName = generateDmName(DmMembers);

  const newDm : Dm = {
    dmId: dmId,
    name: dmName,
    members: DmMembers,
    owners: [authUser.user]
  };
  data.dms.push(newDm);
  setData(data);
  return { dmId: dmId };
};

type dmReturn = {
  dmId: number,
  name: string,
};

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
  if (!checkValidDm(dmId) || !checkValidToken(token)) {
    return errorMsg;
  }

  if (!isOwnerDm(token, dmId) || !isMemberDm(token, dmId)) {
    return errorMsg;
  }

  const data = getData();
  const dm = returnValidDm(dmId);
  data.dms = data.dms.filter((item) => {
    return item !== dm;
  });
  setData(data);
  return {};
};

/// /// HELPER FUNCTIONS ///////
const generateDmName = (DmMembers: userReturn[]): string => {
  const DmHandles = [];
  for (const member of DmMembers) {
    DmHandles.push(member.user.handleStr);
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
/// ////////////////////////////

export { dmCreateV1, dmDetailsV1, dmListV1, dmRemoveV1 };
