import { channelsListallV1 } from "./channels.js"
import { clearV1 } from "./other.js"
import { getData } from "./dataStore.js"
import { authRegisterV1 } from "./auth.js"
import { channelMessagesV1 } from "./channel.js"
import { channelsCreateV1, channelsListV1 } from "./channels.js";
import { userProfileV1 } from "./users.js"
// return type { messages, start, end }
// channelId does not refer to a valid channel, start is greater than the total number of messages in the channel, 
// channelId is valid and the authorised user is not a member of the channel

describe('Pass scenarios', () => {
    test('1 channels', () => {
        const id = authRegisterV1(
          'hayden@gmail.com',
          'hayden123',
          'Hayden',
          'Smith'
        );
    
        const channelId = channelsCreateV1(id.authUserId, 'Hayden', true);
    
        expect(channelsListallV1(id)).toEqual([
          {
            channelId: channelId.channelId,
            name: 'Hayden',
          },
        ]);
      });
})