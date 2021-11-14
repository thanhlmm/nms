import { getSentMsgNum, getSentMessages, getInboxMsgNum, getInboxMessages, sendMessage, getStatics, getMessage } from '..'
import { logging, Context } from 'near-sdk-as'

describe('Send Message ', () => {
    it('should be set and read', () => {
        let now = Date.now().toString();
        let fromAccount = Context.sender;
        let toAccount = "a.testnet";
        // let toAccount = Context.sender;
        sendMessage(toAccount, "Testing", 'QmcT7Jwz5Ckt7dfnMdcNsvRiYEf3H5xn8No5JkqoKPP3uy', "https://nms.kiemtienonline360.com", 0, 0);
        logging.log(`sentMsgNum of ${fromAccount}: ${getSentMsgNum(fromAccount)}`);
        logging.log(`inboxMsgNum of ${toAccount}: ${getInboxMsgNum(toAccount)}`);
        getSentMessages(fromAccount, 0, 0);
        getInboxMessages(toAccount, 0, 0);
        getMessage(0);
        getStatics();
    })
})
