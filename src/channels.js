import { getData, setData } from './dataStore.js'
import { checkValidId } from './helper.js'

function channelsCreateV1(authUserId, name, isPublic) {
    if (name.length < 1 || name.length > 20 || !checkValidId(authUserId)) {
        return { error: 'error' };
    }

    let data = getData();
    // let channels = data.channels;
    let user;
    const channelId = data.channels.length;

    for (let person of data.users) {
        if (person.uId === authUserId) {
            user = person;
        }
    }

    let newChannel = {
        channelId: channelId,
        name: name,
        messages: [],
        allMembers: [user],
        ownerMembers: [user],
        isPublic: isPublic,
    }

    data.channels.push(newChannel);
    setData(data);

    return {
        channelId: channelId,
    };
}

function channelsListV1(authUserId) {
    if (!checkValidId(authUserId)) {
        return { error: 'error' };
    }
    let data = getData();
    let user;
    for (let person of data.users) {
        if (person.uId === authUserId) {
            user = person;
        }
    }

    let channels = [];
    
    for (let channel of data.channels) {
        if (channel.allMembers.includes(user)) {
            channels.push({
                channelId: channel.channelId,
                name: channel.name,
            })
        }
    }

    return channels;
}

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

  return channelList;
}
  
export { channelsCreateV1, channelsListV1, channelsListallV1 };
