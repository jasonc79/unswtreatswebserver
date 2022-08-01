import { Channel, getData, setData, User, Data, token, Dm, Message, channelsJoined, dmsJoined, messagesSent, channelsExist, dmsExist, messagesExist } from './dataStore';
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

export function isGlobalOwner(token: string) : boolean {
  const user = returnValidUser(token);
  if (user.permissionId === 1) {
    return true;
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

/// if not remove 1 by one make uId an array(uId[])

/// helper function to change metric values
export function addMetric(metricType: string, metricValue: number, uId?: number) {
  const data = getData();
  const currTime = Math.floor((new Date()).getTime() / 1000);
  /// Check for metricType
  if (metricType === 'channelsJoined') {
    /// If metricType is channelsJoined
    // const currValue = data.users[uId].channelsJoined.length - 1;
    /// Add metricValue to totalChannelsJoined
    const temp: channelsJoined = {
      numChannelsJoined: data.users[uId].totalChannelsJoined += metricValue,
      timeStamp: currTime,
    };
    console.log(temp);
    data.users[uId].totalChannelsJoined += metricValue;
    console.log(data.users[uId].totalChannelsJoined)
    data.users[uId].channelsJoined.push(temp);
    console.log(data.users[uId].channelsJoined)
  } else if (metricType === 'dmsJoined') {
    /// If metricType is dmsJoined
    // const currValue = data.users[uId].dmsJoined.length - 1;
    /// Add metricValue to totalDmsJoined
    const temp: dmsJoined = {
      numDmsJoined: data.users[uId].totalDmsJoined += metricValue,
      timeStamp: currTime,
    };
    data.users[uId].totalDmsJoined += metricValue;
    data.users[uId].dmsJoined.push(temp);
  } else if (metricType === 'messagesSent') {
    /// If metricType is messagesSent
    // const currValue = data.users[uId].messagesSent.length - 1;
    /// Add metricValue to totalMessagesSent
    const temp: messagesSent = {
      numMessagesSent: data.users[uId].totalMessagesSent += metricValue,
      timeStamp: currTime,
    };
    data.users[uId].totalMessagesSent += metricValue;
    data.users[uId].messagesSent.push(temp);
  } else if (metricType === 'channelsExist') {
    /// If metricType is channelsExist
    // const currValue = data.channelsExist.length - 1;
    /// Add metricValue to totalChannelsExist
    const temp: channelsExist = {
      numChannelsExist: data.totalChannelsExist += metricValue,
      timeStamp: currTime,
    };
    console.log(temp);
    data.totalChannelsExist += metricValue;
    console.log(data.totalChannelsExist);
    data.channelsExist.push(temp);
    console.log(data.channelsExist)
  } else if (metricType === 'dmsExist') {
    /// If metricType is dmsExist
    // const currValue = data.dmsExist.length - 1;
    /// Add metricValue to totalDmsExist
    const temp: dmsExist = {
      numDmsExist: data.totalDmsExist += metricValue,
      timeStamp: currTime,
    };
    data.totalDmsExist += metricValue;
    data.dmsExist.push(temp);
  } else if (metricType === 'messagesExist') {
    /// If metricType is messagesExist
    // const currValue = data.messagesExist.length - 1;
    /// Add metricValue to totalMessagesExist
    const temp: messagesExist = {
      numMessagesExist: data.totalMessagesExist += metricValue,
      timeStamp: currTime,
    };
    data.totalMessagesExist += metricValue;
    data.messagesExist.push(temp);
  }
  setData(data);
}
