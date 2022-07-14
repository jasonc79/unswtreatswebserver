import { Channel, getData, User, Data, token } from './dataStore';

function checkValidId(id: number): boolean {
  const data: Data = getData();
  for (const user of data.users) {
    if (user.uId === id) {
      return true;
    }
  }
  return false;
}

function checkValidChannel(id: number): boolean {
  const data: Data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === id) {
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

function checkValidToken(token: token): boolean {
  const data: Data = getData();
  for (const user of data.users) {
    if (user.token === token) {
      return true;
    }
  }
  return false;
}

function returnValidId(id: number): User {
  const data: Data = getData();
  for (const user of data.users) {
    if (user.uId === id) {
      return user;
    }
  }
}

function returnValidChannel(id: number): Channel {
  const data: Data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === id) {
      return channel;
    }
  }
}

function returnValidUser(token: string): User {
  const data: Data = getData();
  for (const user of data.users) {
    if (user.token === token) {
      return user;
    }
  }
}

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

export { checkValidId, checkValidChannel, checkValidToken, returnValidId, returnValidChannel, returnValidUser, returnIsMember, returnIsOwner };