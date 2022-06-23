import {getData, setData} from './dataStore.js';
import validator from 'validator';


/** Create an account for a new user. Additionally, it generates a handle
 * and an authUserId which is stored as the user's details.
 *
 * @param {string} email      - The email adress of the user registering
 * @param {string} password   - The password of the user registering
 * @param {string} nameFirst  - The user's first name, with non-alphanumeric characters
 * @param {string} nameLast   - The user's last name, with non-alphanumeric characters
 * @returns {error: 'error'}    when email is invalid
 * @returns {error: 'error'}    when length of password is less than 6 characters
 * @returns {error: 'error'}    when length of nameFirst or nameLast is not between 1 and 50 characters
 * @returns {authUserId: 'authUserId'}  on no error
 * 
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

    // Generate uId using the size of array users
    let user = {
      uId: data.users.length,
      email: email,
      nameFirst: nameFirst,
      nameLast: nameLast,
      handleStr: handle,
      password: password
    }

    // Update data
    data.users.push(user);
    setData(data);

    return {
      authUserId: user.uId
    }
}
  
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
        if (extractedNum != NaN && extractedNum > handleNumber) {
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
