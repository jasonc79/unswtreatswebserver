import fs from 'fs';

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
  token: token[],
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
  timeSent: number, 
  reactId?: number // Empty or 0 for no react, 1 for like react
}

// DM TYPES AND INTERFACES
interface Dm {
  dmId: number,
  name: string,
  members: UserInfo[],
  owners: UserInfo[],
  messages: Message[],
}

interface DmInfo {
  dmId: number,
  name: string,
}

type dmReturn = { dms: DmInfo[] };

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

type channelReturn = { channels: ChannelInfo[] }; 

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

const fileName = 'data.json';

// Use get() to access the data
function getData(): Data {
  loadData();
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: Data) {
  data = newData;
  saveData();
}

function saveData() {
  fs.writeFileSync(fileName, JSON.stringify(data));
}

function loadData() {
  if (fs.existsSync(fileName)) {
    data = JSON.parse(fs.readFileSync(fileName, 'utf8'));
  }
}

export { getData, setData };
export { channelId, ChannelInfo, Data, Channel, Message, Dm, DmInfo, dmReturn, channelReturn };
export { authUserId, User, UserInfo, userReturn, allUserReturn, uId, token };
export { error, errorMsg };
