// Populate each array in data with a user and channel object.

let data = {
  users: [],
  channels: [],
  messages: []
};

/* Data objects
user = {
  uId: uId,
  email: email,
  nameFirst: nameFirst,
  nameLast: nameLast,
  handleStr: handleStr
}

channel = {
  channelId: channelId,
  name: name
}

messages = {
  messageId: messageId
  uId: uId,
  message: message,
  timeSent: timeSent
}

*/
// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData) {
  data = newData;
}

export { getData, setData };
