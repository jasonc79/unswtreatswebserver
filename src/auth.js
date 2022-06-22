import {getData, setData} from './dataStore.js';
import validator from 'validator';

function authRegisterV1(email, password, nameFirst, nameLast) {
    email = email.toLowerCase();
    nameFirst = nameFirst.toLowerCase();
    nameLast = nameLast.toLowerCase();

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
    
    let data = getData();
    let handle = createHandle(nameFirst, nameLast);

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
  function checkNameLength(name) {
    if (name.length < 1 || name.length > 50) {
      return false;
    }
    else {
      return true;
    }
  }

  function checkValidEmail(email) {
    if (!validator.isEmail(email)) {
      return false;
    }

    let data = getData();
    for (let user of data.users) {
      if (user.email === email) {
        return false;
      }
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

    // Concatenate the names and cut off characters if necessary
    let concatenatedStr = firstName.concat(lastName);
    let handle = concatenatedStr;

    if (concatenatedStr.length > 20) {
      handle = concatenatedStr.slice(0, 20);
    }

    let handleNumber = 0;
    let handleExists = false;
    // Check if the handle already exists 
    for (let user of data.users) {
      if (user.handleStr.slice(0, handle.length) === handle) {
        // Slice the number off the end, if it exists
        let extractedNum = parseInt(user.handleStr.slice(handle.length));
        if (extractedNum != NaN && extractedNum > handleNumber) {
          handleNumber = extractedNum;
        }
        handleExists = true;
      }
    }
    // Add the number if handle already exists
    if (handleExists === true) {
      handleNumber += 1;
      handle = handle.concat(handleNumber.toString());
    }

    return handle;
  }
  
 
  export { authLoginV1, authRegisterV1 };
