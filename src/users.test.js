import { authRegisterV1 } from "./auth.js"
import { userProfileV1 } from "./users.js"
import { clearV1 } from "./other.js"
import { getData } from "./dataStore.js"

beforeEach(() => {
    clearV1();
});

describe("Testing userProfileV1", () => {
    test('Valid uId', () => {
        const authUserId = authRegisterV1('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
        const uId = authRegisterV1('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        const data = getData();
        expect(userProfileV1(authUserId.authUserId, uId.authUserId)).toStrictEqual({
            user: {
                uId: uId.authUserId, 
                email: 'email2@gmail.com',
                nameFirst: 'firstname2', 
                nameLast: 'lastname2', 
                handleStr: data.users[1].handleStr
            }
        });
    });
    test('Invalid uId', () => {
        const data = getData();
        const uId = (data.users.length + 1) * 100;
        const authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
        expect(userProfileV1(authUserId.authUserId, uId)).toStrictEqual({ error: 'error'});
    });
});