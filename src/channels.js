import { getData, setData } from './dataStore.js'
import { checkValidId } from './helper.js'
import { userProfileV1 } from "./users.js";

/*
channelsCreateV1 creates a new channel which is added to the dataStore
The channel is named the given name and created if the name is greater than 0 and less than 21 characters long

Arguments:
    authUserId (number)     - holds the id of the user creating the channel
    name (string)           - contains the string which is set to be the channel name
    idPublic (boolean)      - value determining if the channel will be private or public

Return Value:
    Returns { channelId : channelId } on no errors, where channelId is a number
    Returns { error: 'error' } on an invalid authUserId and if the name is less than 1 
        or greater than 20 characters long
*/

function channelsCreateV1(authUserId, name, isPublic) {
    if (name.length < 1 || name.length > 20 || !checkValidId(authUserId)) {
        return { error: 'error' };
    }

    let data = getData();
    const channelId = data.channels.length;
    const user = userProfileV1(authUserId, authUserId);
    let newChannel = {
        channelId: channelId,
        name: name,
        messages: [],
        allMembers: [user.user],
        ownerMembers: [user.user],
        isPublic: isPublic,
    }
    data.channels.push(newChannel);
    setData(data);

    return { channelId: channelId };
}

/*
channelsListV1 checks if the authUserId is valid and then returns an object containing 
an array of channels that the user is apart of

Arguments:
    authUserId (number)     - holds the id of the user that is being searched for

Return Value:
    Returns { channels: channels } on if the authUserId is valid, where channels is an array of objects 
        containing the channelId and name
    Returns { error: 'error' } on an invalid authUserId
*/

function channelsListV1(authUserId) {
    if (!checkValidId(authUserId)) {
        return { error: 'error' };
    }
    let data = getData();
    const user = userProfileV1(authUserId, authUserId);
    let channels = [];
    
    for (let channel of data.channels) {
        for (let person of channel.allMembers) {
            if (person.uId === user.user.uId) {
                channels.push({
                    channelId: channel.channelId,
                    name: channel.name,
                })
            }
        }
    }

    return { channels: channels };
}


/*
This function goes through all channels in channels then returns
all channels and their associated details
*/ 
function channelsListallV1(authUserId) {
  const data = getData();
  let channelList = [];
  for (let channel of data.channels) {
    let tempChannel = {
      channelId: channel.channelId,
      name: channel.name,
    };
    channelList.push(tempChannel);
  }
  return { 'channels': channelList };
}
  
export { channelsCreateV1, channelsListV1, channelsListallV1 };