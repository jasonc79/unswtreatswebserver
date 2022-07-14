// USER TYPES AND INTERFACES
type uId = { uId: number };
type token = string;
type authUserId = {
  token: token,
  authUserId: number
};

interface User {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  token: token,
  password: string,
  permissionId: number,
}

interface UserInfo {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
}

type userReturn = { user: UserInfo };
type allUserReturn = { users: UserInfo[] };

// MESSAGE TYPES AND INTERFACES
interface Message {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number
}

// DM TYPES AND INTERFACES
interface Dm {
  dmId: number,
  name: string,
  members: UserInfo[],
  owners: UserInfo[],
}

// CHANNEL TYPES AND INTERFACES
type channelId = { channelId: number };

interface Channel {
  channelId: number,
  name: string,
  messages: Message[],
  allMembers: UserInfo[],
  ownerMembers: UserInfo[],
  isPublic: boolean
}

interface ChannelInfo {
  channelId: number,
  name: string,
}

// ERROR TYPES AND CONSTANTS
type error = { error: string };

type Data = {
  users: User[],
  channels: Channel[],
  dms: Dm[],
}

// CONSTANTS //
const errorMsg = { error: 'error' };

let data: Data = {
  users: [],
  channels: [],
  dms: [],
};

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
function getData(): Data {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: Data) {
  data = newData;
}

export { getData, setData };
export { channelId, ChannelInfo, Data, Channel, Message, Dm };
export { authUserId, User, UserInfo, userReturn, allUserReturn, uId, token };
export { error, errorMsg };
