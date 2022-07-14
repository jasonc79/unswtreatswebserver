import { error, errorMsg, userReturn, getData, setData } from './dataStore';
import { checkValidId, returnValidId, checkValidToken } from './helper';
import validator from 'validator';

/*
userProfileV1 checks if authUserId and uId are valid and then returns an object containing
an array of objects containing the user's details

Arguments:
    authUserId (number)     - holds the id of the user that is searching for the infomation
    uId (number)            - holds the id of the user that's details are being searched for

Return Value:
    Returns
        { users:
            uId: user.uId,
            email: user.email,
            nameFirst: user.nameFirst,
            nameLast: user.nameLast,
            handleStr: user.handleStr,
        }
        on if authUserId and uId are valid
    Returns { error: 'error' } on an invalid authUserId or uId
*/

function userProfileV1(token: string, uId: number) : error | userReturn {
  if (!checkValidId(uId) || !checkValidToken(token)) {
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

export { userProfileV1, userSetNameV1, userSetEmailV1, userSetHandleV1 };
