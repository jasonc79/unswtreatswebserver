// Populate each array in data with a user and channel object.
// Declaring types
type error = { error: 'error' };
type authUserId = { authUserId: number }; 
type channelId = { channelId: number };
type uId = { uId: number }; 
type data = {
  users: Array<user>,
  channels: Array<channel>,
}

type user = {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  password: string, 
  permissionId: number,
}; 

type channel = {
  channelId: channelId,
  name: string
  messages: [
    {
      messageId: number,
      uId: number,
      message: string,
      timeSent: number
    }
  ],
  allMembers: [
    {
      uId: number,
      email: string,
      nameFirst: string,
      nameLast: string,
      handleStr: string
    }
  ],
  ownerMembers: [
    {
      uId: number,
      email: string,
      nameFirst: string,
      nameLast: string,
      handleStr: string
    }
  ],
  isPublic: boolean
}

let data: data = {
  users: [],
  channels: [],
}

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
function getData(): data {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: data) {
  data = newData;
}

export { getData, setData };
export { error, authUserId, channelId, uId, data, user, channel };