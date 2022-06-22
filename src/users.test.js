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
        expect(userProfileV1(authUserId.authUserId, uId.authUserId)).toStrictEqual(
            expect.objectContaining({
                uId: uIdauthUserId, 
                email: uId.email,
                nameFirst: uId.nameFirst, 
                nameLast: uId.nameLast, 
                handleStr: uId.handleStr,
            })
        );
    });
    test('Invalid uId', () => {
        const data = getData();
        const uId = data.users.length * 100;
        const authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
        expect(userProfileV1(authUserId.authUserId, uId)).toStrictEqual({ error: 'error'});
    });
});