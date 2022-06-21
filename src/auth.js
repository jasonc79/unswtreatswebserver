import {getData, setData} from './dataStore.js';

function authRegisterV1(email, password, nameFirst, nameLast) {
    return {
      authUserId: 1,
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
  
  function test() {
    let data = getData(); 
    let user = {
      uId: 0,
      email: "email@email.com",
      password: 'password',
      nameFirst: "Sam",
      nameLast: "Kim",
      handleStr: "samkim"
    };
    return authLoginV1('email@email.com', 'password');
  }

  console.log(test()); 
  export { authLoginV1, authRegisterV1 };

  