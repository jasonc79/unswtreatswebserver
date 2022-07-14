import { error, errorMsg, Channel, userReturn, channelId, getData, setData } from './dataStore';
import { checkValidToken, returnValidUser } from './helper';
import { userProfileV1 } from './users';

type channelReturn = {
  channelId: number,
  name: string,
};
type channelsList = { channels: channelReturn[] };

/**
 * channelsCreateV1
 * creates a new channel is named the given name and created if the name is 
 * greater than 0 and less than 21 characters long
 * 
 * Arguments:
 * @param {string} token tells the server who is currently accessing it
 * @param {string} name contains the string which is set to be the channel name
 * @param {boolean} isPublic determines if the channel will be private or public
 * 
 * Return Value:
 * @returns { error } 
 *    if the token is invalid
 *    if the name is less than 1 or greater than 20 characters
 * @returns { channelId : channelId } on no errors, where channelId is a number
 */
function channelsCreateV1(token: string, name: string, isPublic: boolean) : error | channelId {
  const uId = returnValidUser(token);
  const user = userProfileV1(token, uId.uId) as userReturn;

  if (name.length < 1 || name.length > 20 || !checkValidToken(token)) {
    return errorMsg;
  }

  const data = getData();
  const channelId = data.channels.length;
  const newChannel : Channel = {
    channelId: channelId,
    name: name,
    messages: [],
    allMembers: [user.user],
    ownerMembers: [user.user],
    isPublic: isPublic,
  };
  data.channels.push(newChannel);
  setData(data);

  return { channelId: channelId };
}

/*
channelsListV1 checks if the authUserId is valid and then returns an object containing
an array of channels that the user is apart of

Arguments:
    token (string)     - holds the session token for the user

Return Value:
    Returns { channels: channels } on if the authUserId is valid, where channels is an array of objects
        containing the channelId and name
    Returns { error: 'error' } on an invalid authUserId
*/

function channelsListV1(token: string) : channelsList | error {
  if (!checkValidToken(token)) {
    return errorMsg;
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

/*
This function returns an object containing an array of objects, the array contains objects
containing information about each channel.

Arguments:
    token (number)       - Holds the session token for the user
Return Value:
    Returns {error: 'error'}  on invalid authUserId
    Returns {channels: channelList} on no error
 */
function channelsListallV1(token: string) : channelsList | error {
  if (!checkValidToken(token)) {
    return errorMsg;
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
