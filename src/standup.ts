import { timeReturn, activeReturn, getData, setData } from './dataStore';
import {
  checkValidToken,
  checkValidChannel,
  isMember,
  isActive
} from './helper';
import { messageSendV1 } from './message';
import HTTPError from 'http-errors';

function standupStartV1(token: string, channelId: number, length: number) : timeReturn {
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

  setTimeout(() => packMessage(token, channelId), seconds * 1000);
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

}

function packMessage(token: string, id: number) {
  const data = getData();
  let packedMessage = '';
  for (const standup of data.standups) {
    if (standup.channelId === id) {
      for (const msg of standup.messages) {
        packedMessage = packMessage + msg.handle + ': ' + msg.message + '\n';
      }
    }
  }
  data.standups = data.standups.filter(function(a) { return a.channelId != id; });
  messageSendV1(token, id, packedMessage);
  setData(data);
}

export { standupStartV1, standupActiveV1, standupSendV1 };
