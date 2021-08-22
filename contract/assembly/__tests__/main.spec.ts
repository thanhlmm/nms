import { getSentMsgNum, getSentMessages, getInboxMsgNum, getInboxMessages, sendMessage, getStatics } from '..'
import { logging, Context } from 'near-sdk-as'

describe('Send Message ', () => {
    it('should be set and read', () => {
        let now = Date.now().toString();
        let fromAccount = Context.sender;
        let toAccount = "a.testnet";
        // let toAccount = Context.sender;
        sendMessage(toAccount, 'Testing ' + now, " Only for testing:" + now);
        logging.log(`sentMsgNum of ${fromAccount}: ${getSentMsgNum(fromAccount)}`);
        logging.log(`inboxMsgNum of ${toAccount}: ${getInboxMsgNum(toAccount)}`);
        getSentMessages(fromAccount, 0, 0);
        getInboxMessages(toAccount, 0, 0);
        getStatics();
    })
})
