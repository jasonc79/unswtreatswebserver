import { Channel, getData, User, Data } from './dataStore';

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

export { checkValidId, checkValidChannel, returnValidId, returnValidChannel };
