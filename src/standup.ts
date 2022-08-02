import { timeReturn, activeReturn, getData, setData, standupMsg } from './dataStore';
import {requestMessageSend} from './helperTests';
import {
  checkValidToken,
  checkValidChannel,
  isMember,
  isActive,
  returnValidUser
} from './helper';
import { messageSendV1 } from './message';
import HTTPError from 'http-errors';

function sleep(ms: number) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  );
}

function standupStartV1(token: string, channelId: number, length: number) : timeReturn {
  console.log(getData().standups);
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  if (!checkValidChannel(channelId)) {
    throw HTTPError(400, 'Channel ID does not refer to a valid channel');
  }
  if (length < 0) {
    throw HTTPError(400, 'Length cannot be a negative number');
  }
  if (isActive(channelId)) {
    throw HTTPError(400, 'There is already an active standup in this channel');
  }
  if (!isMember(token, channelId)) {
    throw HTTPError(403, 'The authorised user is not a member of the channel');
  }
  const data = getData();
  const finish = Math.floor((new Date()).getTime() / 1000) + length;
  const seconds = finish - Math.floor((new Date()).getTime() / 1000);
  const newStandup = {
    channelId: channelId,
    messages: [],
    timeFinish: finish,
    isActive: true
  };
  data.standups.push(newStandup);
  setData(data);
  setTimeout(() => {
    packMessage(token, channelId);
    const index = data.standups.findIndex(standup => standup.channelId === channelId);
    data.standups.splice(index);
    setData(data);
  }, seconds * 1000);
  
  // setTimeout(() => {
  //   packMessage(token, channelId)
  // }, seconds * 1000);
  //console.log('return', token);
  return { timeFinish: finish };
}

function standupActiveV1(token: string, channelId: number) : activeReturn {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  if (!checkValidChannel(channelId)) {
    throw HTTPError(400, 'Channel ID does not refer to a valid channel');
  }
  if (!isMember(token, channelId)) {
    throw HTTPError(403, 'The authorised user is not a member of the channel');
  }
  const data = getData();
  for (const standup of data.standups) {
    if (standup.channelId === channelId) {
      if (standup.isActive === true) {
        return {
          isActive: true,
          timeFinish: standup.timeFinish
        };
      }
    }
  }
  
  return {
    isActive: false,
    timeFinish: null
  };
}

function standupSendV1(token: string, channelId: number, message: string) {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  } else if (!checkValidChannel(channelId)) {
    throw HTTPError(400, 'Channel ID does not refer to a valid channel');
  } else if (message.length > 1000) {
    throw HTTPError(400, 'The length of the message is over 1000 characters');
  } else if (!isActive(channelId)) {
    throw HTTPError(400, 'An active standup is not currently running in the channel');
  } else if (!isMember(token, channelId)) {
    throw HTTPError(403, 'The authorised user is not a member of the channel');
  }
  //TO DO:  Ignore notifications
  const user = returnValidUser(token);
  let newMsg = {
    handle: user.handleStr,
    message: message
  };
  updateStandupMsg(channelId, newMsg);
  return {};
}

function updateStandupMsg(channelId: number, newMsg: standupMsg) {
  let data = getData();
  let index = 0;
  const standupLength = data.standups.length;
  for (let i = 0 ; i < standupLength; i++) {
    if (data.standups[i].channelId === channelId) {
      data.standups[i].messages.push(newMsg);
      index = i;
    }
  }
  setData(data);
}

function packMessage(token: string, id: number) {
  const data = getData();
  
  let packedMessage = '';
  let isMessage = false;
  for (const standup of data.standups) {
    if (standup.channelId === id) {
      isMessage = true;
      for (const msg of standup.messages) {
        packedMessage = packedMessage + msg.handle + ': ' + msg.message + '\n';
      }
    }
  }
  data.standups = data.standups.filter(function(a) { return a.channelId != id; });
  const newMessage = {
    messageId: Math.floor(Math.random() * Date.now()),
    uId: 0,
    message: packedMessage,
    timeSent: Math.floor((new Date()).getTime() / 1000),
  };
  data.channels[id].messages.push(newMessage);
  // if (isMessage) {
    
  //   // messageSendV1(token, id, packedMessage);
  // }
  console.log(data.channels[id].messages);
  setData(data);
}

export { standupStartV1, standupActiveV1, standupSendV1 };
