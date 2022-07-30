import { error, userReturn, getData, allUserReturn, UserInfo } from './dataStore';
import { returnValidId, checkValidToken, checkValidUser, updateUser, returnValidUser } from './helper';
import { checkValidEmail } from './auth';
import HTTPError from 'http-errors';

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
  if (!checkValidUser(uId)) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }

  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
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
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }
  if (firstNameLength > 50 || firstNameLength < 1) {
    throw HTTPError(400, 'length of nameFirst is not between 1 and 50 characters inclusive');
  }
  if (lastNameLength > 50 || lastNameLength < 1) {
    throw HTTPError(400, 'length of nameLast is not between 1 and 50 characters inclusive');
  }
  const user = returnValidUser(token);
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;
  updateUser(user.uId, user);
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
  email = email.toLowerCase();
  if (!checkValidEmail(email)) {
    throw HTTPError(400, 'email entered is not a valid email');
  }
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }
  const user = returnValidUser(token);
  user.email = email;
  updateUser(user.uId, user);
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
  if (handleLength > 20 || handleLength < 3) {
    throw HTTPError(400, 'length of handleStr is not between 3 and 20 characters inclusive');
  }
  if (handleStr.match(/^[0-9A-Za-z]+$/) === null) {
    throw HTTPError(400, 'handleStr contains characters that are not alphanumeric');
  }
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }
  const user = returnValidUser(token);
  // Cannot update handle str (same handlestr)
  if (handleStr.localeCompare(user.handleStr) === 0) {
    throw HTTPError(400, 'the handle is already used by another user');
  }
  user.handleStr = handleStr;
  updateUser(user.uId, user);
  return {};
}

function usersAllV1(token: string) : error | allUserReturn {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
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
