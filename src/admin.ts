import { getData, setData } from './dataStore';
import { returnUserPermission, checkValidToken, isGlobalOwner, checkValidUser, isGlobalOwnerFromId, removeUser } from './helper';
import HTTPError from 'http-errors';

/**
 * adminRemoveV1
 * Given a user by their uId, remove them from the Treats. This means
 * they should be removed from all channels/DMs, and will not be
 * included in the array of users returned by users/all. Treats
 * owners can remove other Treats owners (including the original first
 * owner). Once users are removed, the contents of the messages
 * they sent will be replaced by 'Removed user'. Their profile must
 * still be retrievable with user/profile, however nameFirst should
 * be 'Removed' and nameLast should be 'user'. The user's email and
 * handle should be reusable.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} uId is the id of the user
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Invalid channelId
 *    - uId does not refer to a valid user
 *    - uId refers to a user who is the only global owner
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - the authorised user is not a global owner
 * Returns:
 * @returns {} if pass with no errors
 */

function adminRemoveV1(token: string, uId: number) {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  if (!checkValidUser(uId)) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }
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

/**
 * adminPermissionChangeV1
 * Given a user by their user ID, set their permissions to new
 * permissions described by permissionId.
 *
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} uId is the id of the user
 * @param {number} permissionId is the permission of the user
 *
 * Error throwing:
 * @throws { HTTPError(400) }
 *    - Invalid channelId
 *    - uId does not refer to a valid user
 *    - uId refers to a user who is the only global owner and they are being demoted to a user
 *    - permissionId is invalid
 *    - the user already has the permissions level of permissionId
 * @throws { HttpError(403) }
 *    - Invalid token
 *    - the authorised user is not a global owner
 * Returns:
 * @returns {} if pass with no errors
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

export { adminRemoveV1, adminPermissionChangeV1 };
