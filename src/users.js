import { getData } from './dataStore.js'

function userProfileV1(authUserId, uId) {
    let data = getData();

    for (let id in data.users.uId) {
        if (id === uId) {
            return {
                uId: uId, 
                email: uId.email,
                nameFirst: uId.nameFirst, 
                nameLast: uId.nameLast, 
                handleStr: uId.handleStr,
            }
        }
    }
    return { error: 'error' };
}

export { userProfileV1 }