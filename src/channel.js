import {getData, setData} from './dataStore.js';
import {channelsListV1, channelsListallV1} from './channels.js';

function channelDetailsV1(authUserId, channelId) {
    let data = getData();
    // Check if channel is valid
    let validChannel = checkValidChannelId(authUserId, channelId);
    if (validChannel === false) {
        return {error: 'error'};
    }
    // Check if authorised user is member of channel
    const authUserChannelList = channelsListV1(authUserId);
    let authUserValid = false;
    for (let i = 0; i < authUserChannelList.length; i++) {
        if (channelId === authUserChannelList.id) {
            authUserValid = true;
            break;
        }
    }
    if (authUserValid === false) {
        return {error: 'error'};
    }
    // All error test passes; return channel details
    for (let i = 0; i < data.channels.length; i++) {
        if (channelId === data.channels[i].id) {
            let channelName = data.channels[i].name;
            let channelIsPublic = data.channels[i].isPublic;
            let channelOwnerMembers = data.channels[i].ownerMembers;
            let channelAllMembers = datta.channels[i].allMembers;
            break;
        }
    }
    return {
      name: channelName,
      isPublic: channelIsPublic,
      ownerMembers: channelOwnerMembers,
      allMembers: channelAllMembers,
    };
  }
  
  function channelJoinV1(authUserId, channelId) {
    let data = getData();
    // Check if channel is valid channel 
    let validChannel = checkValidChannelId(authUserId, channelId);
    if (validChannel === false) {
        return {error: 'error'};
    }
    // Check if authUser is a member of channel
    const authUserChannelList = channelsListV1(authUserId);
    let authUserValid = false;
    for (let i = 0; i < authUserChannelList.length; i++) {
        if (channelId === authUserChannelList.id) {
            authUserValid = true;
            break;
        }
    }
    if (authUserValid === true) {
        return {error: 'error'};
    }
    // Check if channelId refers to a channel that is private
    // And authUser is not already a channel member and not a global owner. 
    const allChannelsList = channelsListallV1(authUserId);
    // Assume that ownerMembers and allMembers hold authUserIds in their respective arrays.
    let valid = true;
    for (let j = 0; j < allChannelsList.length; j++) {
        if (channelId === allChannelsList[j].id) {
            if (allChannelsList[j].isPublic === false) {
                for (let k = 0; k < allChannelsList[j].ownerMembers.length; k++) {
                    if (allChannelsList[j].ownerMembers[k] === authUserId) {
                        valid = false;
                    }
                }
                for (let a = 0; a < allChannelsList[j].ownerMembers.length; a++) {
                    if (allChannelsList[j].allMembers[a] === authUserId) {
                        valid = false;
                    }
                }
            }
        }
    }
    if (valid === false) {
        return {error: 'error'};
    }
    // Add authUser to the selected channel, update channel list in data, append authUser to allMembers array.
    for (let b = 0; b < data.channels.length; b++) {
        if (channelId === data.channels[b].id) {
            data.channels[b].allMembers.push(authUserId);
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
    return {
      messages: [],
      start: 0,
      end: -1,
    };
  }

  export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };
