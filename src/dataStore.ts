import fs from 'fs';

// NOTIFICATIONS
interface Notification {
  channelId: number,
  dmId: number,
  notificationMessage: string
}

// USER TYPES AND INTERFACES
type id = number;
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
  notifications: Notification[],
  messagesTagged: id[];
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
interface React {
  reactId: number,
  uIds: number[],
  isThisUserReacted: boolean
}

interface Message {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  reacts?: React[]
}
type MessageId = { messageId: number };

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

type dmId = { dmId: number };

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

// STANDUP TYPES AND INTERFACES
type timeReturn = { timeFinish: number };
type activeReturn = {
    isActive: boolean,
    timeFinish: number
};

type standupMsg = {
  handle: string,
  message: string
}

interface Standup {
  channelId: number,
  messages: standupMsg[],
  timeFinish: number,
  isActive: boolean,
}

type channelReturn = { channels: ChannelInfo[] };

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
  standups: Standup[]
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
  standups: [],
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
export { channelId, ChannelInfo, channelReturn, Data, Channel, Message, MessageId, Dm, dmId, DmInfo, dmReturn, Notification };
export { timeReturn, activeReturn, Standup, standupMsg };
export { React };
export { authUserId, User, UserInfo, userReturn, allUserReturn, uId, token, Codes };
export { error, errorMsg, empty, OWNER, MEMBER };
