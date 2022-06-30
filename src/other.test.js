import {clearV1} from './other';
import {authRegisterV1, authLoginV1} from './auth';

describe(('Testing clearV1'), () => {
    test('Cleared successfully', () => {
        let authUserId = authRegisterV1('email@gmail.com', 'password', 'firstname', 'lastname');
        clearV1();
        expect(authLoginV1('email@gmail.com', 'password')).toStrictEqual(
            {error: 'error'}
        );
    });
    test('Correct return', () => {
        expect(clearV1({})).toStrictEqual({});
    });
});