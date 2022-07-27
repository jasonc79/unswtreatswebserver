import { error, Channel, userReturn, channelId, getData, setData } from './dataStore';
import { checkValidToken, returnValidUser } from './helper';
import { userProfileV1 } from './users';
import HTTPError from 'http-errors';

type channelReturn = {
  channelId: number,
  name: string,
};
type channelsList = { channels: channelReturn[] };
/**
 * channelsCreateV1
 * Creates a new channel with the given name that is either a public or private channel.
 * The user who created it automatically joins the channel.
 *
 * Arguments
 * @param token tells the server who is currently accessing it
 * @param name contains the string which is set to be the channel name
 * @param isPublic value determining if the channel will be private or public
 *
 * Return values
 * @returns { error }
 *    invalid token
 *    invald name length
 * @returns { channelId } when no error
 */
function channelsCreateV1(token: string, name: string, isPublic: boolean) : error | channelId {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  if (name.length < 1 || name.length > 20) {
    throw HTTPError(400, 'Length of name must be 1-20 inclusive');
  }
  const data = getData();
  const user = returnValidUser(token);
  const channelId = data.channels.length;

  const newChannel : Channel = {
    channelId: channelId,
    name: name,
    messages: [],
    allMembers: [user],
    ownerMembers: [user],
    isPublic: isPublic,
  };
  data.channels.push(newChannel);
  setData(data);

  return { channelId: channelId };
}

/**
 * channelsListV1
 * Provide an array of all channels (and their associated details) that the authorised user is part of.
 *
 * Arguments
 * @param token tells the server who is currently accessing it
 *
 * Return values
 * @returns { error }
 *    invalid token
 * @returns { channelsList } when no error
 */

function channelsListV1(token: string) : channelsList | error {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  const data = getData();
  const uId = returnValidUser(token);
  const user = userProfileV1(token, uId.uId) as userReturn;
  const channels = [];

  for (const channel of data.channels) {
    for (const person of channel.allMembers) {
      if (person.uId === user.user.uId) {
        channels.push({
          channelId: channel.channelId,
          name: channel.name,
        });
      }
    }
  }

  return { channels: channels };
}

/**
 * channelsListallV1
 * Provide an array of all channels, including private channels, (and their associated details)
 *
 * Arguments
 * @param token tells the server who is currently accessing it
 *
 * Return values
 * @returns { error }
 *    invalid token
 * @returns { channelsList } when no errors
 */

function channelsListallV1(token: string) : channelsList | error {
  if (!checkValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  const data = getData();
  const channelList = [];
  for (const channel of data.channels) {
    const tempChannel = {
      channelId: channel.channelId,
      name: channel.name,
    };
    channelList.push(tempChannel);
  }
  return { channels: channelList };
}

export { channelsCreateV1, channelsListV1, channelsListallV1 };
