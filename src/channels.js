import { getData, setData } from './dataStore.js'
import { checkValidId } from './helper.js'

/*
channelsCreateV1 creates a new channel which is added to the dataStore
The channel is named the given name and created if the name is greater than 0 and less than 20 characters long

Arguments:
    authUserId (number)     - holds the id of the user creating the channel
    name (string)           - contains the string which is set to be the channel name
    idPublic (boolean)      - value determining if the channel will be private or public

Return Value:
    Returns { channelId : channelId } on if the authUserId 
*/

function channelsCreateV1(authUserId, name, isPublic) {
    if (name.length < 1 || name.length > 20 || !checkValidId(authUserId)) {
        return { error: 'error' };
    }

    let data = getData();
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

    return { channelId: channelId };
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

    return { channels: channels };
}
  
function channelsListallV1(authUserId) {
    return {
        channels: [] // see interface for contents
    };
}
  
export { channelsCreateV1, channelsListV1, channelsListallV1 };
