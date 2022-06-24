import {getData, setData} from './dataStore.js';
import validator from 'validator';
import {userProfileV1} from './users.js';

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

function authRegisterV1(email, password, nameFirst, nameLast) {
    email = email.toLowerCase();
    nameFirst = removeNonAlphaNumeric(nameFirst);
    nameLast = removeNonAlphaNumeric(nameLast);
    let data = getData();
    let handle = createHandle(nameFirst, nameLast);

    // Error Checking
    if (!checkNameLength(nameFirst) || !checkNameLength(nameLast)) {
      return {error: 'error'};
    }
    if (password.length < 6) {
      return {error: 'error'};
    }
    if (!checkValidEmail(email)) {
      return {error: 'error'};
    }

    // Generate uId using the size of array users and default permission 2
    let user = {
      uId: data.users.length,
      email: email,
      nameFirst: nameFirst,
      nameLast: nameLast,
      handleStr: handle,
      password: password, 
      permissionId: 2,
    }
    // Global member
    if (user.uId === 0) {
      user.permissionId = 1;
    }

    // Update data
    data.users.push(user);
    setData(data);

    return {
      authUserId: user.uId
    }
}
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
  function authLoginV1(email, password) {
    let user = checkEmailExists(email);

    if (!user) {
      return {error: 'error'};
    }

    if (user.password !== password) {
      return {error: 'error'};
    }

    return {
      authUserId: user.uId
    }
  }

  // HELPER FUNCTIONS
  
  // Check if name has a length between 1 and 50 inclusive.
  function checkNameLength(name) {
    if (name.length < 1 || name.length > 50) {
      return false;
    }
    else {
      return true;
    }
  }

  // Check if an email is valid. Returns true if valid and false otherwise.
  function checkValidEmail(email) {
    if (!validator.isEmail(email)) {
      return false;
    }

    if (checkEmailExists(email) !== false) {
      return false;
    }

    return true;
  }

  // Check if a valid email exists. Returns an email if it exists.
  // Otherwise, returns false.
  function checkEmailExists(email) {
    let data = getData();
    for (let user of data.users) {
      if (user.email === email) {
        return user;
      }
    }
    return false;
  }
  

  // Takes in first name and last name (both lower case) and creates a handle
  function createHandle(firstName, lastName) {
    let data = getData();
    let handleNumber = 0;
    let handleExists = false;

    // Concatenate the names and cut off characters if necessary
    let handle = firstName.concat(lastName);
    if (handle.length > 20) {
      handle = handle.slice(0, 20);
    }
    // Check if the handle already exists 
    for (let user of data.users) {
      if (user.handleStr.slice(0, handle.length) === handle) {
        // Slice the number off the end, if it exists and compare it with
        // the highest number found
        let extractedNum = parseInt(user.handleStr.slice(handle.length));
        if (extractedNum != NaN && extractedNum >= handleNumber) {
          handleNumber = extractedNum;
        }
        handleExists = true;
      }
    }
    // Add the number to the string if the handle already exists
    if (handleExists === true) {
      if (handleNumber != 0) {
        handleNumber += 1;
      }
      handle = handle.concat(handleNumber.toString());
    }

    return handle;
  }
  
  // Removes alphanumeric values from a string. Returns the string in lower
  // case
  function removeNonAlphaNumeric(string) {
    /* This code removes non alphanumeric characters
    https://bobbyhadz.com/blog/javascript-remove-non-alphanumeric-characters-
    //from-string#:~:text=To%20remove%20all%20non%2Dalphanumeric,string%20with
    %20all%20matches%20replaced.&text=Copied!*/
    string = string.replace(/[^a-zA-Z0-9]/gi, '');
    return string.toLowerCase();
    
  }
  export { authLoginV1, authRegisterV1 };


function test() {
  const authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
  const authUserId2 = authRegisterV1('email2@gmail.com', 'password', 'firstname', 'lastname');
  let data = getData();
  return data.users;
}

