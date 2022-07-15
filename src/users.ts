import { error, errorMsg, userReturn, getData, setData, allUserReturn, UserInfo } from './dataStore';
import { returnValidId, checkValidToken, checkValidUser } from './helper';
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

/** Update the authorised user's first and last name
*
* Arguments:
*     @param {string} token is the token of the user
*     @param {string} nameFirst is the first name of the user
*     @param {string} nameLast is the last name of the user
* Return Value:
*     @returns { error }
*         on invalid token
*         when first of last name is greater than 50 or less than 1 character
*     @returns {} if name is sent without errors
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

/** Update the authorised user's email address
*
* Arguments:
*     @param {string} token is the token of the user
*     @param {string} email is the email of the user
*
* Return Value:
*     @returns { error }
          on invalid token
*         on invalid email
*         when hemail is already being used by another user
*     @returns {} if email is sent without errors
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

/** Update the authorised user's handle (i.e. display name)
*
* Arguments:
*     @param {string} token is the token of the user
*     @param {string} handleStr is the handle string of the user
*
* Return Value:
*     @returns { error }
          on invalid token
*         on invalid user handle
*         when handle length is less than 3 or greater than 3 characters
*         on handle without non-alphanumeric characters
*     @returns {} if handleStr is sent without errors
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
