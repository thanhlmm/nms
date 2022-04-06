import { Context, PersistentVector, ContractPromiseBatch, env, u128, logging } from 'near-sdk-as'
import { Message, StaticsInfo, messages, staticsInfos, sentInfos, inboxInfos, publicKeys, MoneyInfo } from './model';

const STATICS_KEY = "statics";
const NEAR_SEND_MIN = u128.from("5000000000000000000000");
const ONE_HOUR = u64(3600*10**9);
const ONE_DAY = u64(24)*ONE_HOUR;
const TWO_DAY = u64(2*24)*ONE_HOUR;

// Get StaticsInfo, auto created if not existed in the Map
function getStaticsInfo(): StaticsInfo {
    let staticsInfo = staticsInfos.get(STATICS_KEY, null);
    if (staticsInfo==null) {
        staticsInfo = new StaticsInfo();
    }
    return staticsInfo;
}

// Set owner of the contract
export function setOwnerAddress(address: string): boolean {
    let staticsInfo = getStaticsInfo();
    if (!staticsInfo.ownerAddress) {
        staticsInfo.ownerAddress = address;
        staticsInfos.set(STATICS_KEY, staticsInfo);
        return true;
    } else if (staticsInfo.ownerAddress==Context.sender) {
        staticsInfo.ownerAddress = address;
        staticsInfos.set(STATICS_KEY, staticsInfo);
        return true;
    }
    return false;
}

// Set fee address
export function setFeeAddress(address: string): boolean {
    let staticsInfo = getStaticsInfo();
    if (staticsInfo.ownerAddress==Context.sender) {
        staticsInfo.feeAddress = address;
        staticsInfos.set(STATICS_KEY, staticsInfo);
        return true;
    }
    return false;
}

// Set user rate
export function setUserRate(userRate: u128): boolean {
    let staticsInfo = getStaticsInfo();
    if (staticsInfo.ownerAddress==Context.sender) {
        staticsInfo.userRate = userRate;
        staticsInfos.set(STATICS_KEY, staticsInfo);
        return true;
    }
    return false;
}

/**
 * Get number of sent messages corresponding to account id.\
 * NOTE: This is a view method. Which means it should NOT modify the state.
 * @param accountId Account id
 * @returns Number of sent messages
 */
export function getSentMsgNum(accountId: string): i32 {
    let items = sentInfos.get(accountId, null);
    return (items ? items.length : 0);
}

/**
 * Returns an array of sent messages corresponding to account id.\
 * NOTE: This is a view method. Which means it should NOT modify the state.
 * @param accountId Account id
 * @param fromIndex The starting position to get data
 * @param toIndex The ending position to get data
 * @returns Array of sent messages
 */
export function getSentMessages(accountId: string, fromIndex: i32, toIndex: i32): Message[] {
    // Checking fromIndex anđ toIndex
    let sentMsgIndexes = sentInfos.get(accountId, null);
    let numMsg = (sentMsgIndexes?sentMsgIndexes.length:0);
    if (fromIndex>numMsg) fromIndex = numMsg-1;
    if (fromIndex<0) fromIndex = 0;
    if (toIndex>numMsg) toIndex = numMsg-1;
    if (toIndex<0) toIndex = 0;
    if (toIndex<fromIndex) toIndex = fromIndex;

    // Get sent messages
    let itemNum = 0;
    if (numMsg>0) itemNum = toIndex - fromIndex + 1;
    let results = new Array<Message>(itemNum);
    if (numMsg>0 && sentMsgIndexes!=null) {
        let now = env.block_timestamp();
        for (let idx=fromIndex; idx<=toIndex; idx++) {
            let item = messages[sentMsgIndexes[idx]];
            if (item.expiredTime>0 && item.expiredTime<now) {
                // Message exprired
                item = new Message(item.id, item.from, item.to, item.title, "#EXPIRED", item.baseSite, item.prevMsgId, item.expiredTime, item.moneyInfo);
            }
            results[idx-fromIndex] = item;
        }
    }
    return results;
}

/**
 * Get number of inbox messages corresponding to account id.\
 * NOTE: This is a view method. Which means it should NOT modify the state.
 * @param accountId Account id
 * @returns Number of inbox messages
 */
export function getInboxMsgNum(accountId: string): i32 {
    let items = inboxInfos.get(accountId, null);
    return (items ? items.length : 0);
}

/**
 * Returns an array of inbox messages corresponding to account id.\
 * NOTE: This is a view method. Which means it should NOT modify the state.
 * @param accountId Account id
 * @param fromIndex The starting position to get data
 * @param toIndex The ending position to get data
 * @returns Array of inbox messages
 */
export function getInboxMessages(accountId: string, fromIndex: i32, toIndex: i32): Message[] {
    // Checking fromIndex anđ toIndex
    let inboxMsgIndexes = inboxInfos.get(accountId, null);
    let numMsg = (inboxMsgIndexes?inboxMsgIndexes.length:0);
    if (fromIndex>numMsg) fromIndex = numMsg-1;
    if (fromIndex<0) fromIndex = 0;
    if (toIndex>numMsg) toIndex = numMsg-1;
    if (toIndex<0) toIndex = 0;
    if (toIndex<fromIndex) toIndex = fromIndex;

    // Get inbox messages
    let itemNum = 0;
    if (numMsg>0) itemNum = toIndex - fromIndex + 1;
    let results = new Array<Message>(itemNum);
    if (numMsg>0 && inboxMsgIndexes!=null) {
        let now = env.block_timestamp();
        for (let idx=fromIndex; idx<=toIndex; idx++) {
            let item = messages[inboxMsgIndexes[idx]];
            if (item.expiredTime>0 && item.expiredTime<now) {
                // Message exprired
                item = new Message(item.id, item.from, item.to, item.title, "#EXPIRED", item.baseSite, item.prevMsgId, item.expiredTime, item.moneyInfo);
            }
            results[idx-fromIndex] = item;
        }
    }
    return results;
}

/**
 * Get message from index
 * @param msgId ID of message 
 * @returns Return a message or null
 */
 export function getMessage(msgId: i32): Message | null {
    // Checking msgIndex
    let index = msgId - 1;
    if (index<0 || index>=messages.length) {
        // Invalid input
        return null
    };

    // Return message
    return messages[index];
}

/**
 * Sends new message to other account.
 * NOTE: This is a change method. Which means it will modify the state.
 * @param to The account id that will receive the message
 * @param title Title of message
 * @param data Content of message
 * @param baseSite
 * @param prevMsgId 
 * @param expiredTime
 */
export function sendMessage(to: string, title: string, data: string, baseSite: string, prevMsgId: i32, expiredTime: u64): boolean {
    // Checking to account
    assert(env.isValidAccountID(to), "Invalid account");

    // Checking attached deposit
    let attachedDeposit = Context.attachedDeposit;
    assert(u128.ge(attachedDeposit, NEAR_SEND_MIN), "Attached deposit is too small");

    // Get static info
    let staticsInfo = getStaticsInfo();

    // Create message object
    let accountId = Context.sender;
    let msgId = messages.length + 1;
    let moneyInfo = new MoneyInfo(attachedDeposit, staticsInfo.userRate);
    let msg = new Message(msgId, accountId, to, title, data, baseSite, prevMsgId, expiredTime, moneyInfo);

    // Store new message into blockchain
    let index = messages.push(msg);
    staticsInfo.messageNum = messages.length;

    // Store the index of new message for sender account
    let items1 = sentInfos.get(accountId, null);
    if (items1) {
        items1.push(index);
    } else {
        items1 = new PersistentVector<i32>("psentinfos-" + accountId);
        items1.push(index);
        staticsInfo.sentAccountNum++;
        if (inboxInfos.get(accountId, null)==null) staticsInfo.accountNum++;
    }
    sentInfos.set(accountId, items1);

    // Store the index of new message for receive account
    let items2 = inboxInfos.get(to, null);
    if (items2) {
        items2.push(index);
    } else {
        items2 = new PersistentVector<i32>("pinboxinfos-" + to);
        items2.push(index);
        staticsInfo.inboxAccountNum++;
        if (sentInfos.get(to, null)==null) staticsInfo.accountNum++;
    }
    inboxInfos.set(to, items2);

    // Store StaticInfo
    staticsInfos.set(STATICS_KEY, staticsInfo);

    // Send NEAR Fee to DAO account
    if (!attachedDeposit.isZero()) {
        ContractPromiseBatch.create(staticsInfo.feeAddress).transfer(moneyInfo.appFee);
    }

    // Check prevMsgId and send fund
    if (prevMsgId>0 && prevMsgId<messages.length) {
        let msgIdx = prevMsgId-1;
        let preMsg = messages[msgIdx];
        if (preMsg.to==accountId && preMsg.from==to && preMsg.moneyInfo && preMsg.moneyInfo.receivedAmount.isZero() && preMsg.moneyInfo.sendBackAmount.isZero()) {
            let receivedAmount = u128.from(0);
            let receivedTime = env.block_timestamp();
            let period = u64(receivedTime - preMsg.timestamp);
            if (period<=ONE_HOUR) {
                receivedAmount = preMsg.moneyInfo.canReceivedAmount;                                    // 100%
            } else if (period<=ONE_DAY) {
                receivedAmount = preMsg.moneyInfo.canReceivedAmount/u128.from(2);                       // 50%
            } else {
                receivedAmount = preMsg.moneyInfo.canReceivedAmount/u128.from(10);                      // 10%
            }
            if (!receivedAmount.isZero()) {
                preMsg.moneyInfo.receivedAmount = receivedAmount;
                preMsg.moneyInfo.receivedTime = receivedTime;
                messages.replace(msgIdx, preMsg);
                ContractPromiseBatch.create(accountId).transfer(receivedAmount);
            }
        }
    }

    return true;
}

/**
 * Send back NEAR to sender
 * @param msgId ID of message 
 * @returns Return true or false
 */
 export function sendBack(msgId: i32): bool {
    // Checking msgIndex
    let index = msgId - 1;
    assert(index>=0 && index<messages.length, "Invalid msgId");

    // Checking MoneyInfo
    let msg = messages[index];
    assert(msg.moneyInfo, "No MoneyInfo");
    assert(msg.moneyInfo.sendBackAmount.isZero(), "The message is claimed");

    // Check time
    let backTime = env.block_timestamp();
    let period = u64(backTime - msg.timestamp);
    assert(period>TWO_DAY, "Only claim after two days");

    // Check NEAR amount
    let backAmount = msg.moneyInfo.canReceivedAmount - msg.moneyInfo.receivedAmount;
    assert(backAmount>u128.from(0), "No remain NEAR to claim");

    // Process
    msg.moneyInfo.sendBackAmount = backAmount;
    msg.moneyInfo.sendBackTime = backTime;
    messages.replace(index, msg);
    ContractPromiseBatch.create(msg.from).transfer(backAmount);
    return true;
}

export function getStatics(): StaticsInfo | null {
    return staticsInfos.get(STATICS_KEY, null);
}

/**
 * Update public key
 * Use for private message
 */
export function updatePublicKey(publicKey: string): boolean {
    publicKeys.set(Context.sender, publicKey);
    return true;
}

/**
 * Get public key
 */
export function getPublicKey(accountId: string): string | null {
    return publicKeys.get(accountId, "");
}
