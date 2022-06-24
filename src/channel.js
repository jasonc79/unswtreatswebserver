import {getData, setData} from './dataStore.js';
import {channelsListV1, channelsListallV1} from './channels.js';
import { checkValidChannel, returnValidChannel } from './helper.js'

function channelDetailsV1(authUserId, channelId) {
    let data = getData();
    // Check if channel is valid
    let validChannel = checkValidChannel(channelId);
    if (validChannel === false) {
        return {error: 'error'};
    }
    // Check if authorised user is member of channel
    const authUserChannelList = channelsListV1(authUserId);
    let authUserValid = false;
    for (let i = 0; i < authUserChannelList.length; i++) {
        if (channelId === authUserChannelList[i].channelId) {
            authUserValid = true;
        }
    }
    if (authUserValid === false) {
      return {error: 'error'};
    }
    // All error test passes; return channel details
    for (let channel of data.channels) {
        if (channelId === channel.channelId) {
            let channelDetail = {
                name: channel.Name,
                isPublic : channel.isPublic,
                ownerMembers: channel.ownerMembers,
                allMembers: channel.allMembers,
            }
            break;
        }
    }
    return {channelDetail};
  }
  
  function channelJoinV1(authUserId, channelId) {
    let data = getData();
    // Check if channel is valid channel 
    let validChannel = checkValidChannel(channelId);
    if (validChannel === false) {
        return {error: 'error'};
    }
    // Check if authUser is a member of channel
    const authUserChannelList = channelsListV1(authUserId);
    let authUserValid = false;
    for (let channelList of authUserChannelList) {
        if (channelId === channelList.channelId) {
            authUserValid = true;
            break;
        }
    }
    if (authUserValid === true) {
        return {error: 'error'};
    }
    // Check if channelId refers to a channel that is private
    // And authUser is not already a channel member and not a global owner. 
    let user;
    for (let person of data.users) {
        if (person.uId === authUserId) {
            user = person;
        }
    }

    const allChannelsList = channelsListallV1(authUserId);
    let memberValid = false;
    let ownerValid = false;
    for (let j = 0; j < allChannelsList.length; j++) {
        if (channelId === allChannelsList[j].channelId) {
            if (allChannelsList[j].isPublic === false) {
                for (let ownerMembers of allChannelsList[j].ownerMembers) {
                    if (ownerMembers === user) {
                        ownerValid = true;
                    }
                }
                for (let allMembers of allChannelsList[j].allMembers) {
                    if (allMembers === user) {
                        memberValid = true;
                    }
                }
                if (!memberValid || !ownerValid) {
                  return {error: 'error'};
                }
            }
        }
    }
    
    // Add user to the selected channel, update channel list in data, append authUser to allMembers array.
    for (let channel of data.channels) {
        if (channelId === channel.channelId) {
            channel.allMembers.push(user);
            setData(data);
            break;
        }
    }
    return {};
  }

  // Helper Functions
  function checkValidChannelId(authUserId, channelId) {
    // Check if channelId is valid channel
    let channelList = channelsListallV1(authUserId);
    let valid = false;
    for (let i = 0; i < channelList.length; i++) {
        if (channelId === channelList[i].channelId) {
            valid = true;
        }
    }
    if (valid === false) {
        return false;
    }
    return true;
  }

  function channelInviteV1(authUserId, channelId, uId) {
    return {};
  }
  
  function channelMessagesV1(authUserId, channelId, start) {
    const data = getData();
    if (!checkValidChannel(channelId)) {
      return { error: "error" };
    }
    const currChannel = returnValidChannel(channelId);
    const channelMsg = currChannel.messages;
    if (channelMsg.length < start) {
      return { error: "error" };
    }
    if (!currChannel.allMembers.include(authUserId)) {
      return { error: "error" };
    }
    const messages = [];
    let final = start + 50;
    for (let i = start; i < final; i++) {
      if (i >= channelMsg.length) {
        return {
          'messages': messages,
          'start': start,
          'end': -1,
        };
      }
      messages.push(channelMsg[i]);
    }
    return {
      'messages': messages,
      'start': start,
      'end': final,
    };
  }

  export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };
