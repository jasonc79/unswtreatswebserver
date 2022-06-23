import { authRegisterV1 } from "./auth.js"
import { userProfileV1 } from "./users.js"
import { clearV1 } from "./other.js"

beforeEach(() => {
    clearV1();
});

describe("Testing userProfileV1", () => {
    test('Valid uId', () => {
        const authUserId = authRegisterV1('emai1@gmail.com', 'password1', 'firstname1', 'lastname1');
        const uId = authRegisterV1('email2@gmail.com', 'password2', 'firstname2', 'lastname2');
        expect(userProfileV1(authUserId.authUserId, uId.authUserId)).toStrictEqual({
            users: {
                uId: uId.authUserId, 
                email: 'email2@gmail.com',
                nameFirst: 'firstname2', 
                nameLast: 'lastname2', 
                handleStr: 'firstname2lastname2',
            }
        });
    });
    test('Invalid uId', () => {
        const authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
        const uId = authUserId.authUserId + 1;
        expect(userProfileV1(authUserId.authUserId, uId)).toStrictEqual({ error: 'error'});
    });
});