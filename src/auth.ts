import { getData, setData, error, errorMsg, authUserId, token } from './dataStore';
import { checkValidToken } from './helper';
import validator from 'validator';

/*
Create an account for a new user. Additionally, it generates a handle
and an authUserId which is stored as the user's details.

Arguments:
    email (string)     - The email adress of the user registering
    password (string)  - The password of the user registering
    nameFirst (string) - The user's first name, with non-alphanumeric characters
    nameLast (string)  - The user's last name, with non-alphanumeric characters

Return Value:
    Returns {error: 'error'}  on invalid email
    Returns {error: 'error'}  on a password with less than 6 characters
    Returns {error: 'error'}  when length of nameFirst or nameLast is not
                              between 1 and 50 characters
    Returns {authUserId: authUserId} on no error
 */
const authRegisterV1 = (email: string, password: string, nameFirst: string, nameLast: string): authUserId | error => {
  // Error Checking
  if (!checkNameLength(nameFirst) || !checkNameLength(nameLast)) {
    return errorMsg;
  }
  if (password.length < 6) {
    return errorMsg;
  }
  if (!checkValidEmail(email)) {
    return errorMsg;
  }
  email = email.toLowerCase();
  nameFirst = nameFirst.toLowerCase();
  nameLast = nameLast.toLowerCase();
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
/*
This function checks if the user's email and password is valid and returns
their authUserId to login

Arguments:
    email (string)    - The email inputted by the user
    password (string)    - The password inputted by the user

Return Value:
    Returns {error: 'error'} on an email not belonging to the user
    Returns {error: 'error'} on an incorrect password
    Returns {authUserId:  'authUserId'} when the email and password are valid
*/
const authLoginV1 = (email: string, password: string) : authUserId | error => {
  const user = checkEmailExists(email);
  const data = getData();
  const token = generateToken();
  if (!user) {
    return errorMsg;
  }

  if (user.password !== password) {
    return errorMsg;
  }

  for (const user of data.users) {
    if (user.email === email && user.password === password) {
      user.token.push(token);
    }
  }
  setData(data);
  return {
    token: token,
    authUserId: user.uId
  };
};

const authLogoutV1 = (token: token) : object | error => {
  if (!checkValidToken) {
    return errorMsg;
  }
  const data = getData();
  for (const user of data.users) {
    for (let i = 0; i < user.token.length; i++) {
      if (user.token[i] === token) {
        user.token.splice(i, 1);
      }
    }
    setData(data);
  }

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
const checkValidEmail = (email: string): boolean => {
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
