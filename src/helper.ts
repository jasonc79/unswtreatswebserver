import { error, message, channel, userInfo, channelId, getData, setData, user, data } from "./dataStore";


function checkValidId(id: number): boolean {
    let data: data = getData();
    for (let user of data.users) {
        if (user.uId === id) {
            return true;
        }
    }
    return false;
}

function checkValidChannel(id: number): boolean {
    let data: data = getData();
    for (let channel of data.channels) {
        if (channel.channelId === id) {
            return true;
        }
    }
    return false;
}

function returnValidId(id: number): user {
    let data: data = getData();
    for (let user of data.users) {
        if (user.uId === id) {
            return user;
        }
    }
}

function returnValidChannel(id: number): channel {
    let data: data = getData();
    for (let channel of data.channels) {
        if (channel.channelId === id) {
            return channel;
        }
    }
}

export { checkValidId, checkValidChannel, returnValidId, returnValidChannel };
