import { getData, setData, error, errorMsg, Dm, userReturn, UserInfo, dmReturn } from './dataStore';
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
  const dmName: string = generateDmName(DmMembers);

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
  const dmDetail = {
    name: dm.name,
    members: dm.members as UserInfo[],
  };
  return dmDetail;
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
type dms = { dms: dmReturn[] };
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
  const dm = returnValidDm(dmId);
  data.dms = data.dms.filter((item) => {
    return item !== dm;
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

export { dmCreateV1, dmLeaveV1, dmDetailsV1, dmListV1, dmRemoveV1 };
