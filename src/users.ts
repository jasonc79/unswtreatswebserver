import { error, errorMsg, userReturn, getData, setData, allUserReturn, UserInfo } from './dataStore';
import { returnValidId, checkValidToken, checkValidUser } from './helper';
import validator from 'validator';

/**
 * userProfileV1 
 * returns an object containing the user's details
 * 
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {number} uId is the id of the user beign accessed
 * 
 * Return Values:
 * @returns { error }
 *    if token is inValid
 *    if uId is invalid
 * @returns { users: userReturn } when no errors, where userReturn contains
 *    uId, email, nameFirst, nameLast and handleStr
 */
function userProfileV1(token: string, uId: number) : error | userReturn {
  if (!checkValidUser(uId) || !checkValidToken(token)) {
    return errorMsg;
  }
  const user = returnValidId(uId);
  return {
    user: {
      uId: user.uId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.handleStr,
    }
  };
}

/*
Update the authorised user's first and last name

Arguments:
    token (string)     -  The token of the user
    nameFirst (string) - The first name of the user
    nameLast (string)  - The last name of the user

Return Value:
    Returns {error: 'error'}  on invalid email
    Returns {error: 'error'}  when email is already being used by another user
    Returns {} on no error
*/

function userSetNameV1(token: string, nameFirst: string, nameLast: string) : object | error {
  const firstNameLength = nameFirst.length;
  const lastNameLength = nameLast.length;
  if (!checkValidToken(token) || firstNameLength > 50 || firstNameLength < 1 || lastNameLength > 50 || lastNameLength < 1) {
    return errorMsg;
  }
  const data = getData();
  for (const user of data.users) {
    if (token === user.token) {
      user.nameFirst = nameFirst;
      user.nameLast = nameLast;
    }
  }
  setData(data);
  return {};
}
/*
Update the authorised user's email address

Arguments:
    token (string)     -  The token of the user
    email (string)     - The email of the user

Return Value:
    Returns {error: 'error'}  on invalid email
    Returns {error: 'error'}  when email is already being used by another user
    Returns {} on no error
 */
function userSetEmailV1(token: string, email: string) {
  if (!validator.isEmail(email)) {
    return errorMsg;
  }
  const data = getData();
  for (const user of data.users) {
    if (token !== user.token && email === user.email) {
      return errorMsg;
    }
  }
  for (const user of data.users) {
    if (token === user.token) {
      user.email = email;
    }
  }
  setData(data);
  return {};
}

/*
Update the authorised user's handle (i.e. display name)

Arguments:
    token (string)     -  The token of the user
    handleStr (string)  - The handle string of the user

Return Value:
    Returns {error: 'error'}  on invalid user handle
    Returns {error: 'error'}  when handle length is less than 3 or greater than 3 characters
    Returns {error: 'error'}  on handle without non-alphanumeric characters
    Returns {} on no error
 */
function userSetHandleV1(token: string, handleStr: string) {
  const handleLength = handleStr.length;
  if (handleLength > 20 || handleLength < 3 || handleStr.match(/^[0-9A-Za-z]+$/) === null) {
    return errorMsg;
  }
  const data = getData();
  for (const user of data.users) {
    if (token !== user.token && handleStr === user.handleStr) {
      return errorMsg;
    }
  }
  for (const user of data.users) {
    if (token === user.token) {
      user.handleStr = handleStr;
    }
  }
  setData(data);
  return {};
}

/**
 * usersAllV1
 * returns an array with details about all users
 * 
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * 
 * Return Value:
 * @returns { error } 
 *    if token is invalid
 * @returns { users: userReturn[] } when there are no errors, where userReturn contains
 *    uId, email, nameFirst, nameLast and handleStr
 */
function usersAllV1(token: string) : error | allUserReturn {
  if (!checkValidToken(token)) {
    return errorMsg;
  }
  const users = getData().users;
  const userDetails: UserInfo[] = [];
  for (const member of users) {
    const current = userProfileV1(token, member.uId) as userReturn;
    userDetails.push(current.user);
  }
  return { users: userDetails };
}

export { userProfileV1, userSetNameV1, userSetEmailV1, userSetHandleV1, usersAllV1 };
