import { getData } from './dataStore.js'

function checkValidId(id) {
    let data = getData();
    for (let user of data.users) {
        if (user.uId === id) {
            return true;
        }
    }
    return false;
}

function checkValidChannel(id) {
    let data = getData();
    for (const channel of data.channels) {
        if (channel.channelId === id) {
            return true;
        }
    }
    return false;
}

function returnValidId(id) {
    let data = getData();
    for (let user of data.users) {
        if (user.uId === id) {
            return user;
        }
    }
}

function returnValidChannel(id) {
    let data = getData();
    for (const channel of data.channels) {
        if (channel.channelId === id) {
            return channel;
        }
    }
}

export { checkValidId, checkValidChannel, returnValidId, returnValidChannel };
