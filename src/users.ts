import { error, errorMsg, userReturn, getData, allUserReturn, UserInfo } from './dataStore';
import { returnValidId, checkValidToken, checkValidUser, updateUser, returnValidUser, getIdfromToken } from './helper';
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
    return errorMsg;
  } else if (!checkValidToken(token)) {
    return errorMsg;
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
  if (handleLength > 20 || handleLength < 3 || handleStr.match(/^[0-9A-Za-z]+$/) === null) {
    return errorMsg;
  } else if (!checkValidToken(token)) {
    return errorMsg;
  }
  const user = returnValidUser(token);
  // Cannot update handle str (same handlestr)
  if (handleStr.localeCompare(user.handleStr) === 0) {
    return errorMsg;
  }

  user.handleStr = handleStr;
  updateUser(user.uId, user);

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

function usersStats(token: string) {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  const data = getData();
  let top = 0;
  const bottom = data.users.length;
  for (const object of data.users) {
    if (object.totalChannelsJoined > 0) {
      top++;
    } else if (object.totalDmsJoined > 0) {
      top++;
    }
  }
  const utilizationRate = top / bottom;
  const temp = {
    channelsExist: data.channelsExist,
    dmsExist: data.dmExist,
    messagesExist: data.messagesExist,
    utilizationRate: utilizationRate
  };
  console.log(temp);
}

function userStats(token: string) {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  const data = getData();
  const uId = getIdfromToken(token);
  const top = data.users[uId].totalChannelsJoined + data.users[uId].totalDmsJoined + data.users[uId].totalMessagesSent;
  const bottom = data.totalMessagesExist + data.totalDmsExist + data.totalChannelsExist;
  const involvementRate = top / bottom;
  const temp = {
    channelsJoined: data.users[uId].totalChannelsJoined,
    dmsJoined: data.users[uId].totalDmsJoined,
    messagesSent: data.users[uId].totalMessagesSent,
    involvementRate: involvementRate
  };
  console.log(temp);
}

export { userProfileV1, userSetNameV1, userSetEmailV1, userSetHandleV1, usersAllV1, usersStats, userStats };
