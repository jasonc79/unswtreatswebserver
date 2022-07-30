import { getData, setData, error, authUserId, token } from './dataStore';
import { checkValidToken, updateUser, returnValidUser } from './helper';
import validator from 'validator';
import HTTPError from 'http-errors';

/**
 * authRegisterV1
 * Given a user's first and last name, email address, and password, create a new account for
 * them and return a new `authUserId`.
 *
 * Arguments
 * @param email The email adress of the user registering
 * @param password The password of the user registering
 * @param nameFirst The user's first name, with non-alphanumeric characters
 * @param nameLast The user's last name, with non-alphanumeric characters
 *
 * Return Values:
 * @returns { error }
 *    invalid email
 *    email already used
 *    pass length is invalid
 *    firstname length invalid
 *    lastname length invalid
 * @returns { authUserId } when no error
 */

const authRegisterV1 = (email: string, password: string, nameFirst: string, nameLast: string): authUserId | error => {
  // Error Checking
  if (!checkNameLength(nameFirst) || !checkNameLength(nameLast)) {
    throw HTTPError(400, 'Length of name is not between 1 and 50 characters inclusive');
  }
  if (password.length < 6) {
    throw HTTPError(400, 'Password length is less than 6 characters');
  }
  if (!checkValidEmail(email)) {
    throw HTTPError(400, 'Email is not valid, or is already being used');
  }
  email = email.toLowerCase();
  const data = getData();
  const handle = createHandle(nameFirst, nameLast);
  const token = generateToken();

  // Generate uId using the size of array users and default permission 2
  const user = {
    uId: data.users.length,
    email: email,
    nameFirst: nameFirst,
    nameLast: nameLast,
    handleStr: handle,
    password: password,
    token: [token],
    permissionId: 2,
    channelsJoined: 0,
    dmsJoined: 0,
    msgsSent: 0.
  };
  // Global owner
  if (user.uId === 0) {
    user.permissionId = 1;
  }
  // Update data
  data.users.push(user);
  setData(data);

  return {
    token: token,
    authUserId: user.uId
  };
};

/**
 * authLoginV1
 * This function checks if the user's email and password is valid and returns their authUserId to login
 *
 * Arguments:
 * @param email The email inputted by the user
 * @param password The password inputted by the user
 *
 * Return Values:
 * @returns { error }
 *    email invalid
 *    password incorrect
 * @returns { authUserId } on no error
 */

const authLoginV1 = (email: string, password: string) : authUserId | error => {
  const user = checkEmailExists(email);
  const token = generateToken();
  if (!user) {
    throw HTTPError(400, 'Email does not belong to a user');
  }

  if (user.password !== password) {
    throw HTTPError(400, 'Password is not correct');
  }
  const uId = user.uId;
  user.token.push(token);
  updateUser(uId, user);

  return {
    token: token,
    authUserId: user.uId
  };
};

/**
 * authLogoutV1
 * Given an active token, invalidates the token to log the user out.
 *
 * Arguments:
 * @param token tells the server who is currently accessing it
 *
 * Return values:
 * @returns { error }
 *    invalid token
 * @returns { object } when no error
 */

const authLogoutV1 = (token: token) : object | error => {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  const user = returnValidUser(token);
  user.token = user.token.filter((temp: token) => temp !== token);
  updateUser(user.uId, user);
  return {};
};

// HELPER FUNCTIONS

// Check if name has a length between 1 and 50 inclusive.
const checkNameLength = (name: string) : boolean => {
  if (name.length < 1 || name.length > 50) {
    return false;
  } else {
    return true;
  }
};

// Check if an email is valid. Returns true if valid and false otherwise.
export const checkValidEmail = (email: string): boolean => {
  if (!validator.isEmail(email)) {
    return false;
  }

  if (checkEmailExists(email) !== false) {
    return false;
  }

  return true;
};

// Check if a valid email exists. Returns an email if it exists.
// Otherwise, returns false.
const checkEmailExists = (email: string) => {
  const data = getData();
  for (const user of data.users) {
    if (user.email === email) {
      return user;
    }
  }
  return false;
};

// Takes in first name and last name (both lower case) and creates a handle
const createHandle = (firstName: string, lastName: string): string => {
  firstName = removeNonAlphaNumeric(firstName);
  lastName = removeNonAlphaNumeric(lastName);
  const data = getData();
  let handleNumber = -1;
  let handleExists = false;

  // Concatenate the names and cut off characters if necessary
  let handle = firstName.concat(lastName);
  if (handle.length > 20) {
    handle = handle.slice(0, 20);
  }

  // Check if the handle already exists
  for (const user of data.users) {
    if (user.handleStr.slice(0, handle.length) === handle) {
      // Slice the number off the end, if it exists and compare it with
      // the highest number found
      const extractedNum = parseInt(user.handleStr.slice(handle.length));
      if (!isNaN(extractedNum) && extractedNum >= handleNumber) {
        handleNumber = extractedNum;
      }
      handleExists = true;
    }
  }
  // Add the number to the string if the handle already exists
  if (handleExists === true) {
    handleNumber += 1;
    handle = handle.concat(handleNumber.toString());
  }

  return handle;
};

// Removes alphanumeric values from a string. Returns the string in lower
// case
const removeNonAlphaNumeric = (string: string) : string => {
  /* This code removes non alphanumeric characters
    https://bobbyhadz.com/blog/javascript-remove-non-alphanumeric-characters-
    //from-string#:~:text=To%20remove%20all%20non%2Dalphanumeric,string%20with
    %20all%20matches%20replaced.&text=Copied! */
  string = string.replace(/[^a-zA-Z0-9]/gi, '');
  return string.toLowerCase();
};

const generateToken = () : token => {
  let isValidToken = false;
  let token = (Math.floor((Math.random() * 10000) + 1)).toString();
  while (!isValidToken) {
    // Generate another token
    if (checkValidToken(token)) {
      token = (Math.floor((Math.random() * 10000) + 1)).toString();
    } else {
      isValidToken = true;
    }
  }
  return token;
};

export { authLoginV1, authRegisterV1, authLogoutV1 };
