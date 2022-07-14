import { getData, setData, error, errorMsg, Dm, userReturn, UserInfo } from './dataStore';
import { checkValidUser, returnValidUser, checkValidDm, returnValidDm, checkValidToken } from './helper';
import { userProfileV1 } from './users';

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
  const dmNameFinal = dmName.slice(0, -2); // Remove final comma and space

  const newDm : Dm = {
    dmId: dmId,
    name: dmNameFinal,
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
// type dmsList = { dms: dmReturn[] };

type dmDetails = { name: string, members: UserInfo[] };
const dmDetailsV1 = (token: string, dmId: number): dmDetails | error | number => {
  // Check if dmId  is valid
  if (!checkValidDm(dmId)) {
    return errorMsg;
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
    return errorMsg;
  }

  // const dmDetail = {
  //   name: dm.name,
  //   members: dm.members as UserInfo[],
  // };
  return errorMsg;
  // return dmDetail;
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
  return errorMsg;
  // return { dms: dms };
};

const dmRemoveV1 = (token: string, dmId: number): Record<string, never> | error => {
  if (!checkValidDm) {
    return errorMsg; 
  }

  const dm = returnValidDm(dmId); 
  for (const owner of dm.owners) {
    if (returnValidUser(token).uId !== owner.uId) {
      return errorMsg; 
    }
  }

  let isMember = false; 
  for (const member of dm.members) {
    if (returnValidUser(token).uId !== member.uId) {
      isMember = true; 
    }
  }
  if (isMember === false) {
    return errorMsg; 
  }

  const data = getData(); 
  data.dms = data.dms.filter((item) => {
    return item !== dm; 
  });  
  setData(data); 
  return {}; 
};

export { dmCreateV1, dmDetailsV1, dmListV1, dmRemoveV1 };
