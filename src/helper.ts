import { Channel, getData, setData, User, Data, token, Dm, Message, Standup } from './dataStore';
import { ELEMENT } from './auth';
import crypto from 'crypto';

// INCLUDES FUNCTIONS FOR:
// - Get hash of a token
// - Checking whether a function exits
// - Returning an object
// - Getting/returning using ids
// - Checking whether a property is satisfied
// - Updating objects in the datastore

export function getHashOf(plaintext: string) {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}

//= ==========================================================================//
// CHECKING FUNCTIONS - RETURNS BOOLEAN                                      //
//= ==========================================================================//
/**
 * returns true if the id corresponds to a valid user or channel, and false otherwise
 * property : users | channels
 */
export function checkValidUser(id: number) : boolean {
  const data = getData();
  for (const item of data.users) {
    if (item.uId === id) {
      return true;
    }
  }
  return false;
}

export function checkValidChannel(id: number) : boolean {
  const data = getData();
  for (const item of data.channels) {
    if (item.channelId === id) {
      return true;
    }
  }
  return false;
}

/**
 * returns true if the id corresponds to a valid token. Throws an error otherwise
 */
export function checkValidToken(token: token) : boolean {
  const data: Data = getData();
  for (const user of data.users) {
    for (const existToken of user.token) {
      if (getHashOf(existToken + ELEMENT) === token) {
        return true;
      }
    }
  }
  return false;
}

export function checkValidDm(id: number): boolean {
  const data: Data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === id) {
      return true;
    }
  }
  return false;
}

/**
 * returns true if the message exists in some channel, and false otherwise
 */
export function checkValidChannelMessage(id: number) : boolean {
  const data: Data = getData();
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === id) {
        return true;
      }
    }
  }
  return false;
}

/**
 * returns true if the message exists in some dm, and false otherwise
 */
export function checkValidDmMessage(id: number) : boolean {
  const data: Data = getData();
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === id) {
        return true;
      }
    }
  }
  return false;
}

/**
 * returns true if the current user is the user who sent the message
 */
export function checkChannelMessageSender(token: string, messageId: number) : boolean {
  const message = returnValidMessagefromChannel(messageId);
  const uId = getIdfromToken(token);
  if (message.uId === uId) {
    return true;
  }
  return false;
}

/**
 * returns true if the current user is the user who sent the message
 */
export function checkDmMessageSender(token: string, messageId: number) : boolean {
  const message = returnValidMessagefromDm(messageId);
  const uId = getIdfromToken(token);
  if (message.uId === uId) {
    return true;
  }
  return false;
}

export function checkReactId(id: number) {
  const validReacts = [1]; // 1 for like react, can add more in the future
  for (const react of validReacts) {
    if (react === id) {
      return true;
    }
  }
  return false;
}

export function checkMessageSource(messageId: number): number {
  let messageSource: number;
  if (!checkValidChannelMessage(messageId)) {
    messageSource = 0; // Message is located in a DM
  }
  if (!checkValidDmMessage(messageId)) {
    messageSource = 1; // Message is located in a channel
  }
  return messageSource;
}

export function returnValidMessage(messageId: number): Message {
  let message;
  if (!checkValidChannelMessage(messageId)) {
    message = returnValidMessagefromDm(messageId);
  }
  if (!checkValidDmMessage(messageId)) {
    message = returnValidMessagefromChannel(messageId);
  }
  return message;
}

/**
 *
 * @param token
 * @param messageId
 * @param reactId
 * @returns // 0 : No current reacts in that reactId
            // 1 : Already reacts with that reactId but not from the authorised user
            // 2 : Already reacts with that reactId, including authorised user
 */
export function checkAlreadyReacted(token: string, messageId: number, reactId: number): number {
  const message = returnValidMessage(messageId);
  const user = returnValidUser(token);
  if ('reacts' in message) {
    for (const react of message.reacts) {
      if (react.reactId === reactId) {
        if (react.uIds.includes(user.uId)) {
          react.isThisUserReacted = true;
          return 2;
        }
        return 1;
      }
    }
  }
  return 0;
}

//= ==========================================================================//
// RETURN FUNCTIONS - RETURNS AN OBJECT                                      //
//= ==========================================================================//
/**
 * returns the details about a user given their id
 */
export function returnValidId(id: number) : User {
  const data: Data = getData();
  for (const user of data.users) {
    if (user.uId === id) {
      return user;
    }
  }
}

/**
 * returns the details about a channel given its id
 */
export function returnValidChannel(id: number) : Channel {
  const data: Data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === id) {
      return channel;
    }
  }
}

/**
 * returns the details about a user given their token
 */
export function returnValidUser(token: string) : User {
  const data: Data = getData();
  for (const user of data.users) {
    for (const existToken of user.token) {
      if (getHashOf(existToken + ELEMENT) === token) {
        return user;
      }
    }
  }
  throw new Error('User does not exist from token');
}

export function returnValidDm(id: number): Dm {
  const data: Data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === id) {
      return dm;
    }
  }
}

/**
 * returns the details about a message given the channel and messageId
 */
export function returnValidMessagefromChannel(messageId: number) : Message {
  const channel = getChannelfromMessage(messageId);
  for (const message of channel.messages) {
    if (message.messageId === messageId) {
      return message;
    }
  }
}

/**
 * returns the details about a message given the channel and messageId
 */
export function returnValidMessagefromDm(messageId: number) : Message {
  const dm = getDmfromMessage(messageId);
  for (const message of dm.messages) {
    if (message.messageId === messageId) {
      return message;
    }
  }
}
// Return a list of channels with same uId
export function returnChannelListFromUId(uId: number) : Channel[] {
  const data: Data = getData();
  const channelList: Channel[] = [];
  for (const channel of data.channels) {
    for (const user of channel.allMembers) {
      if (user.uId === uId) {
        channelList.push(channel);
        break;
      }
    }
  }
  return channelList;
}
// Returns a list of dms with same uId
export function returnDmListFromUId(uId: number) : Dm[] {
  const data: Data = getData();
  const dmList: Dm[] = [];
  for (const dm of data.dms) {
    for (const user of dm.members) {
      if (user.uId === uId) {
        dmList.push(dm);
        break;
      }
    }
  }
  return dmList;
}

export function removeUser(uId: number) {
  const data: Data = getData();
  for (const user of data.users) {
    // Remove user, but still retrivable with user/profile
    if (user.uId === uId) {
      user.nameFirst = 'Removed';
      user.nameLast = 'user';
      user.email = '';
      user.handleStr = '';
    }
  }
  // Remove user from all channel
  for (const user of data.channels) {
    let memberList = [];
    for (const members of user.allMembers) {
      if (members.uId !== uId) {
        memberList.push(members);
      }
    }
    user.allMembers = memberList;
    memberList = [];
    for (const members of user.ownerMembers) {
      if (members.uId !== uId) {
        memberList.push(members);
      }
    }
    user.ownerMembers = memberList;
  }
  // Remove user from all dm
  for (const dm of data.dms) {
    let memberList = [];
    for (const members of dm.members) {
      if (members.uId !== uId) {
        memberList.push(members);
      }
    }
    dm.members = memberList;
    memberList = [];
    for (const members of dm.owners) {
      if (members.uId !== uId) {
        memberList.push(members);
      }
    }
    dm.members = memberList;
  }
  // Remove user messages
  for (const user of data.channels) {
    for (const message of user.messages) {
      if (message.uId === uId) {
        message.message = 'Removed User';
      }
    }
  }
  for (const user of data.dms) {
    for (const message of user.messages) {
      if (message.uId === uId) {
        message.message = 'Removed User';
      }
    }
  }
  setData(data);
}
export function returnUserPermission(uId: number) {
  const data: Data = getData();
  for (const user of data.users) {
    if (user.uId === uId) {
      return user.permissionId;
    }
  }
}

export function returnActiveStandup(channelId: number) : Standup {
  const data = getData();
  for (const standup of data.standups) {
    if (standup.channelId === channelId) {
      return standup;
    }
  }
}
//= ==========================================================================//
// GET OR RETURN OBJECTS USING IDS                                                                   //
//= ==========================================================================//
/**
 * returns the user id given the token
 */
export function getIdfromToken(token: string) : number {
  const data: Data = getData();
  for (const user of data.users) {
    for (const existToken of user.token) {
      if (getHashOf(existToken + ELEMENT) === token) {
        return user.uId;
      }
    }
  }
}

/**
 * returns the channel details given the id of a message from the channel
 */
export function getChannelfromMessage(id: number) : Channel {
  const data: Data = getData();
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === id) {
        return channel;
      }
    }
  }
}

export function getDmfromMessage(id: number): Dm {
  const data: Data = getData();
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === id) {
        return dm;
      }
    }
  }
}

//= ==========================================================================//
// CHECKING WHETHER A PROPERTY IS SATISFIED                                  //
//= ==========================================================================//

/**
 * returns true if the user is a member of the channel or an owner of a channel, and false otherwise
 */
export function isMember(token: string, channelId: number) : boolean {
  const uId = getIdfromToken(token);
  const channel = returnValidChannel(channelId);
  for (const user of channel.allMembers) {
    if (uId === user.uId) {
      return true;
    }
  }
  return false;
}

export function isOwner(token: string, channelId: number) : boolean {
  const uId = getIdfromToken(token);
  const channel = returnValidChannel(channelId);
  for (const user of channel.ownerMembers) {
    if (uId === user.uId) {
      return true;
    }
  }
  return false;
}

export function isMemberDm(token: string, dmId: number): boolean {
  const uId = getIdfromToken(token);
  const dm = returnValidDm(dmId);
  for (const member of dm.members) {
    if (uId === member.uId) {
      return true;
    }
  }
  return false;
}

export function isOwnerDm(token: string, dmId: number): boolean {
  const uId = getIdfromToken(token);
  const dm = returnValidDm(dmId);
  for (const owner of dm.owners) {
    if (uId === owner.uId) {
      return true;
    }
  }
  return false;
}

export function isMemberFromId(uId: number, channelId: number) : boolean {
  const channel = returnValidChannel(channelId);
  for (const user of channel.allMembers) {
    if (uId === user.uId) {
      return true;
    }
  }
  return false;
}

export function isOwnerFromId(uId: number, channelId: number) : boolean {
  const channel = returnValidChannel(channelId);
  for (const user of channel.ownerMembers) {
    if (uId === user.uId) {
      return true;
    }
  }
  return false;
}

export function isDmMemberFromId(uId: number, dmId: number) : boolean {
  const dm = returnValidDm(dmId);
  for (const user of dm.members) {
    if (uId === user.uId) {
      return true;
    }
  }
  return false;
}

export function isGlobalOwner(token: string) : boolean {
  const user = returnValidUser(token);
  if (user.permissionId === 1) {
    return true;
  }
  return false;
}
export function isGlobalOwnerFromId(uId: number) : boolean {
  const user = returnValidId(uId);
  if (user.permissionId === 1) {
    return true;
  }
  return false;
}

export function isActive(channelId: number) : boolean {
  const data = getData();
  for (const standup of data.standups) {
    if (standup.channelId === channelId) {
      return true;
    }
  }
  return false;
}

//= ==========================================================================//
// UPDATES THE DATASTORE                                                     //
//= ==========================================================================//

// Update a user using their uid
export function updateUser(uId: number, user: User) {
  const data = getData();
  for (let i = 0; i < data.users.length; i++) {
    if (data.users[i].uId === uId) {
      data.users[i] = user;
    }
  }
  setData(data);
}

export function updateChannel(channelId: number, channel: Channel) {
  const data = getData();
  for (let i = 0; i < data.channels.length; i++) {
    if (data.channels[i].channelId === channelId) {
      data.channels[i] = channel;
    }
  }
  setData(data);
}
