import { getData, error, errorMsg, userReturn, allUserReturn } from './dataStore';
import { checkValidUser, returnValidId, checkValidToken } from './helper';

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

function usersAllV1(token: string) : error | allUserReturn {
  if (!checkValidToken(token)) {
    return errorMsg;
  }
  const users = getData().users;
  const userDetails = [];
  for (const member of users) {
    const current = userProfileV1(token, member.uId) as userReturn;
    userDetails.push(current.user);
  }
  return { users: userDetails };
}

export { userProfileV1, usersAllV1 };
