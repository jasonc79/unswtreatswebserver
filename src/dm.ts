// import { getData, setData, error, errorMsg, authUserId, token, uId, Dm, User } from './dataStore';
// import { checkValidId, checkValidToken, returnValidUser } from './helper';
// import { userProfileV1 } from './users';
import { uId, error } from './dataStore';

// Stubbed dm functions
type dmId = string; // number;
const dmCreateV1 = (token: string, uIds: uId[]): dmId | error => {
  // const authUserId = returnValidUser(token);
  // const authUser = userProfileV1(token, authUserId.uId);
  // // Error cases
  //     // Any uId in uIds does not refer to a valid user
  //     // There are duplicate uIds in uIds
  // for (const u of uIds) {
  //     if (!checkValidId(u.uId)) {
  //         return errorMsg;
  //     }
  // }

  // const data = getData();
  // const dmId = data.dms.length;

  // const sorted = uIds.sort();
  // let dmName = "";
  // for (const u of sorted) {
  //     let userHandle = userProfileV1(token, u.uId);
  //     if (userHandle != errorMsg) {
  //         dmName += userHandle.handleStr; // Bcos of error type
  //         dmName += ',';
  //     }
  // };
  // const newDm : Dm = {
  //     dmId: dmId,
  //     name: dmName,
  //     members: uIds,
  //     owners: [ authUserId ]
  // };
  // return { dmId: dmId };
  return 'token' + 'uIds';
};

type dmDetails = string; // { name: string, members: User[] };
const dmDetailsV1 = (token: string, dmId: number): dmDetails | error => {
  return 'token' + 'dmId';
};

type dms = string; // { dms: Dm[] };
const dmListV1 = (token: string): dms | error => {
  return 'token';
};

const dmRemoveV1 = (token: string, dmId: number): Record<string, never> | error => {
  return {};
};

export { dmCreateV1, dmDetailsV1, dmListV1, dmRemoveV1 };
