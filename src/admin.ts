import { getData, setData } from './dataStore';
import { returnUserPermission, checkValidToken, isGlobalOwner, checkValidUser, isGlobalOwnerFromId } from './helper';
import HTTPError from 'http-errors';

/*
function adminRemoveV1(token: string, uId: number) {
    if (!checkValidToken(token)) {
        throw HTTPError(403, 'Token is invalid');
      }
    if (!checkValidUser(uId)) {
        throw HTTPError(400, "uId does not refer to a valid user");
    }
    const uIdFromToken = getIdfromToken(token);
    if (!isGlobalOwner(token)) {
        throw HTTPError(403, 'the authorised user is not a global owner');
    }
    // Check if there is only one global owner
    const data = getData();
    let counter = 0;
    for (const user of data.users) {
        if (user.permissionId === 1) {
            counter++;
        }
    }
    if (counter === 1 && isGlobalOwnerFromId(uId)) {
        throw HTTPError(400, 'uId refers to a user who is the only global owner');
    }
    removeUser(uId);
    return {};

}
*/
function adminPermissionChangeV1(token: string, uId: number, permissionId: number) {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  if (!checkValidUser(uId)) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }
  const data = getData();
  let counter = 0;
  for (const user of data.users) {
    if (user.permissionId === 1) {
      counter++;
    }
  }
  if (counter === 1 && isGlobalOwnerFromId(uId)) {
    throw HTTPError(400, 'uId refers to a user who is the only global owner and they are being demoted to a user');
  }
  if (permissionId !== 1 && permissionId !== 2) {
    throw HTTPError(400, 'permissionId is invalid');
  }
  if (returnUserPermission(uId) === permissionId) {
    throw HTTPError(400, 'the user already has the permissions level of permissionId');
  }
  if (!isGlobalOwner(token)) {
    throw HTTPError(403, 'the authorised user is not a global owner');
  }
  // Change permissionId after no error
  for (const user of data.users) {
    if (user.uId === uId) {
      user.permissionId = permissionId;
    }
  }
  setData(data);
  return {};
}

export { adminPermissionChangeV1 };
