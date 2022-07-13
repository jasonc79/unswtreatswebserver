import { Channel, getData, User, Data, token, Message, uId } from './dataStore';
/**
 * returns true if the id corresponds to a valid user, and false otherwise
 */
function checkValidId(id: number) : boolean {
  const data: Data = getData();
  for (const user of data.users) {
    if (user.uId === id) {
      return true;
    }
  }
  return false;
}

/**
 * returns true if the id corresponds to a valid channel, and false otherwise
 */
function checkValidChannel(id: number) : boolean {
  const data: Data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === id) {
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
    if (user.token === token) {
      return true;
    }
  }
  return false;
}

/**
 * return true if the id corresponds to a valid message, and false otherwise
 * for the message to be valid
 *    the user needs to be in the channel/dm with the message
 */
function checkValidMessage(token: string, messageId: number) : boolean {
  const data: Data = getData();
  // get channelId from messageId
  const channel = getChannelfromMessage(messageId);
  // if messageId doesn't exist or if the user is not in the channel, return false
  if (channel.channelId === undefined || !isMember(token, channel.channelId)) {
    return false;
  }
  
  // check that messageId refers to a message in that channel
  for (const message of channel.messages) {
    if (message.messageId === messageId) {
      return true;
    }
  }
  return false;
}

/**
 * returns true if the current user is the user who sent the message
 */
function checkMessageSender(token: string, messageId: number) : boolean {
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
    if (user.token === token) {
      return user;
    }
  }
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
}

/**
 * returns the user id given the token
 */
function getIdfromToken(token: string) : number {
  const data: Data = getData();
  for (const user of data.users) {
    if (user.token === token) {
      return user.uId;
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
 * returns true if the user is a member of the channel, and false otherwise
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

/**
 * returns true if the current user is an owner of the channel
 * or if the user is a global owner, and returns false otherwise
 */
 function isOwner(token: string, channelId: number) : boolean {
  const channel = returnValidChannel(channelId);
  const user = returnValidId(getIdfromToken(token));
  if (user.permissionId === 2) {
    return true;
  }
  for (const owner of channel.ownerMembers) {
    if (owner.uId === user.uId) {
      return true;
    }
  }
  return false;
}

export {
  checkValidId,
  checkValidChannel,
  checkValidToken,
  checkValidMessage,
  checkMessageSender,
  returnValidId,
  returnValidChannel,
  returnValidUser,
  returnValidMessage,
  getIdfromToken,
  getChannelfromMessage,
  isMember,
  isOwner,
};
