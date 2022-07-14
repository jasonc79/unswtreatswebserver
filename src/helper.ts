import { Channel, getData, User, Data, token /* Message */ } from './dataStore';

function checkValidId(id: number) : boolean {
  const data: Data = getData();
  for (const user of data.users) {
    if (user.uId === id) {
      return true;
    }
  }
  return false;
}

function checkValidChannel(id: number) : boolean {
  const data: Data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === id) {
      return true;
    }
  }
  return false;
}

function checkValidToken(token: token) : boolean {
  const data: Data = getData();
  for (const user of data.users) {
    if (user.token === token) {
      return true;
    }
  }
  return false;
}

// function checkValidMessage(messageId: number) : boolean {
//   const data: Data = getData();
//   for (const message of data.channels.messages) {
//     if (message.messageId === messageId) {
//       return true;
//     }
//   }
//   return false;
// }

function returnValidId(id: number) : User {
  const data: Data = getData();
  for (const user of data.users) {
    if (user.uId === id) {
      return user;
    }
  }
}

function returnValidChannel(id: number) : Channel {
  const data: Data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === id) {
      return channel;
    }
    // for (const message of data.channels.messages) {
    //   if (message.messageId === messageId) {
    //     return true;
    //   }
    // }
  }
}

function returnValidUser(token: string) : User {
  const data: Data = getData();
  for (const user of data.users) {
    if (user.token === token) {
      return user;
    }
  }
}

// function returnValidMessage(messageId: number) : Message {
//   const data: Data = getData();
//   for (const message of data.channels.messages) {
//     if (message.messageId === messageId) {
//       return message;
//     }
//   }
// }

function getIdfromToken(token: string) : number {
  const data: Data = getData();
  for (const user of data.users) {
    if (user.token === token) {
      return user.uId;
    }
  }
}

function isMember(channelId: number, token: string) : boolean {
  // const data: Data = getData();
  const uId = getIdfromToken(token);
  const channel = returnValidChannel(channelId);
  for (const user of channel.allMembers) {
    if (uId === user.uId) {
      return true;
    }
  }
  return false;
}

export {
  checkValidId,
  checkValidChannel,
  checkValidToken,
  // checkValidMessage,
  returnValidId,
  returnValidChannel,
  returnValidUser,
  // returnValidMessage,
  getIdfromToken,
  isMember,
};
