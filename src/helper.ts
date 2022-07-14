import { Channel, getData, User, Data, token, Message } from './dataStore';
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
// function checkValidId(id: number, property: string) : boolean {
//   const data: Data = getData();
//   for (const item of data[property]) {
//     if (property === 'users') {
//       if (item.uId === id) {
//         return true;
//       }
//     } else if (property === 'channels') {
//       if (item.channelId === id) {
//         return true;
//       }
//     }
//   }
//   return false;
// }

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
  return false;
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
    if (user.token === token) {
      return user;
    }
  }
}

//Remove
function returnIsMember(uId: number, channelId: number): boolean {
  const data: Data = getData();
  const currChannel = returnValidChannel(channelId);
  for (const member of currChannel.allMembers) {
    if (uId === member.uId) {
      return true;
    }
  }
  return false;
}
//

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

///Remove
function returnIsOwner(uId: number, channelId: number): boolean {
  const data: Data = getData();
  const currChannel = returnValidChannel(channelId);
  for (const member of currChannel.ownerMembers) {
    if (uId === member.uId) {
      return true;
    }
  }
  return false;
}
///
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

export {
  checkValidUser,
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