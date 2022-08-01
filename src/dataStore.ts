import fs from 'fs';

// USER TYPES AND INTERFACES
type uId = { uId: number };
type token = string;
type authUserId = {
  token: token,
  authUserId: number
};

interface channelsJoined {
  numChannelsJoined: number,
  timeStamp: number,
}

interface dmsJoined {
  numDmsJoined: number,
  timeStamp: number,
}

interface messagesSent {
  numMessagesSent: number,
  timeStamp: number,
}

interface channelsExist {
  numChannelsExist: number,
  timeStamp: number,
}

interface dmsExist {
  numDmsExist: number,
  timeStamp: number,
}

interface messagesExist {
  numMessagesExist: number,
  timeStamp: number,
}

interface User {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  token: token[],
  password: string,
  permissionId: number,
  channelsJoined: channelsJoined[],
  dmsJoined: dmsJoined[],
  messagesSent: messagesSent[],
  totalChannelsJoined: number,
  totalDmsJoined: number,
  totalMessagesSent: number,
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
  isPinned: boolean,
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

// RESET CODES
interface Codes {
  code: string,
  uId: number
}

// ERROR TYPES AND CONSTANTS
type error = { error: string };

type Data = {
  users: User[],
  channels: Channel[],
  dms: Dm[],
  channelsExist: channelsExist[],
  dmsExist: dmsExist[],
  messagesExist: messagesExist[],
  totalMessagesExist: number,
  totalDmsExist: number,
  totalChannelsExist: number,
  resetCodes: Codes[]
}

// EMPTY RETURN
type empty = object;

// CONSTANTS //
const errorMsg = { error: 'error' };
const fileName = 'data.json';
const OWNER = 1;
const MEMBER = 2;

let data: Data = {
  users: [],
  channels: [],
  dms: [],
  channelsExist: [],
  dmsExist: [],
  messagesExist: [],
  totalMessagesExist: 0,
  totalDmsExist: 0,
  totalChannelsExist: 0,
  resetCodes: []
};

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
export { channelId, ChannelInfo, Data, Channel, Message, Dm, DmInfo, dmReturn };
export { channelsJoined, dmsJoined, messagesSent, channelsExist, dmsExist, messagesExist };
export { authUserId, User, UserInfo, userReturn, allUserReturn, uId, token, Codes };
export { error, errorMsg, empty, OWNER, MEMBER };