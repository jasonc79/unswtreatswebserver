import { getData } from './dataStore.js'

function userProfileV1(authUserId, uId) {
    let data = getData();

    for (let user of data.users) {
        if (user.uId === uId) {
            return {
                uId: user.uId, 
                email: user.email,
                nameFirst: user.nameFirst, 
                nameLast: user.nameLast, 
                handleStr: user.handleStr,
                password: user.password,
            }
        }
    }
    return { error: 'error' };
}

export { userProfileV1 }