import { getData, setData } from './dataStore.js'

function channelsCreateV1(authUserId, name, isPublic) {
    if (name.length < 1 || name.length > 20) {
        return { error: 'error' };
    }

    let data = getData();
    let channels = data.channels;
    //console.log(channels);
    let user;
    const channelId = channels.length;

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

    channels.push(newChannel);

    return {
        channelId: channelId,
    };
}

function channelsListV1(authUserId) {
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
            channels.push(channel);
        }
    }

    return channels;
}
  
function channelsListallV1(authUserId) {
    return {
        channels: [] // see interface for contents
    };
}
  
export { channelsCreateV1, channelsListV1, channelsListallV1 };
