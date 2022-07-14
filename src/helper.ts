import { Channel, getData, User, Data, token, Dm, Message } from './dataStore';

/**
 * returns true if the id corresponds to a valid user or channel, and false otherwise
 * property : users | channels
 */

function checkValidUser(id: number) : boolean {
  const data = getData();
  for (const item of data.users) {
    if (item.uId === id) {
      return true;
    }
  }
  return false;
}

function checkValidChannel(id: number) : boolean {
  const data = getData();
  for (const item of data.channels) {
    if (item.channelId === id) {
      return true;
    }
  }
  return false;
}

/**
 * returns true if the id corresponds to a valid token, and false otherwise
 */
function checkValidToken(token: token) : boolean {
  const data: Data = getData();
  for (const user of data.users) {
    for (const userToken of user.token) {
      if (token === userToken) {
        return true;
      }
    }
  }
  return false;
}

function checkValidDm(id: number): boolean {
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
function checkValidMessage(messageId: number) : boolean {
  const data: Data = getData();
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        return true;
      }
    }
  }
}

/**
 * returns true if the current user is the user who sent the message
 */
function checkMessageSender(token: string, messageId: number) : boolean {
  // if (!checkChannelfromMessage(messageId)) {
  //   return false;
  // }
  const message = returnValidMessage(messageId);
  const uId = getIdfromToken(token);
  if (message.uId === uId) {
    return true;
  }
  return false;
}

/**
 * returns the details about a user given their id
 */
function returnValidId(id: number) : User {
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
function returnValidChannel(id: number) : Channel {
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
function returnValidUser(token: string) : User {
  const data: Data = getData();
  for (const user of data.users) {
    for (const userToken of user.token) {
      if (userToken === token) {
        return user;
      }
    }
  }
  throw new Error('User was not found in returnValidUser');
}

function returnValidDm(id: number): Dm {
  const data: Data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === id) {
      return dm;
    }
  }
  throw new Error('Dm was not found in returnValidDm');
}

/**
 * returns the details about a message given the channel and messageId
 */
function returnValidMessage(messageId: number) : Message {
  const channel = getChannelfromMessage(messageId);
  for (const message of channel.messages) {
    if (message.messageId === messageId) {
      return message;
    }
  }
  throw new Error('Message was not found in returnValidMessage');
}

/**
 * returns the user id given the token
 */
function getIdfromToken(token: string) : number {
  const data: Data = getData();
  for (const user of data.users) {
    for (const userToken of user.token) {
      if (userToken === token) {
        return user.uId;
      }
    }
  }
}

/**
 * returns the channel details given the id of a message from the channel
 */
function getChannelfromMessage(messageId: number) : Channel {
  const data: Data = getData();
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        return channel;
      }
    }
  }
}

/**
 * returns true if the user is a member of the channel or an owner of a channel, and false otherwise
 */
function isMember(token: string, channelId: number) : boolean {
  const uId = getIdfromToken(token);
  const channel = returnValidChannel(channelId);
  for (const user of channel.allMembers) {
    if (uId === user.uId) {
      return true;
    }
  }
  return false;
}

function isOwner(token: string, channelId: number) : boolean {
  const uId = getIdfromToken(token);
  const channel = returnValidChannel(channelId);
  for (const user of channel.ownerMembers) {
    const item = returnValidId(user.uId);
    if (uId === user.uId) {
      return true;
    } else if (item.permissionId === 2) {
      return true;
    }
  }
  return false;
}

function isMemberDm(token: string, dmId: number): boolean {
  const uId = getIdfromToken(token);
  const dm = returnValidDm(dmId);
  for (const member of dm.members) {
    if (uId === member.uId) {
      return true;
    }
  }
  return false;
}

function isOwnerDm(token: string, dmId: number): boolean {
  const uId = getIdfromToken(token);
  const dm = returnValidDm(dmId);
  for (const owner of dm.owners) {
    if (uId === owner.uId) {
      return true;
    }
  }
  return false;
}

export {
  checkValidUser,
  checkValidChannel,
  checkValidToken,
  checkValidDm,
  returnValidId,
  returnValidChannel,
  returnValidUser,
  returnValidDm,
  checkValidMessage,
  checkMessageSender,
  returnValidMessage,
  getIdfromToken,
  getChannelfromMessage,
  isMember,
  isOwner,
  isMemberDm,
  isOwnerDm,
};
