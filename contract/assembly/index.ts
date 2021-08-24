import { Context, PersistentVector, logging, storage } from 'near-sdk-as'
import { Message, StaticsInfo, messages, staticsInfos, sentInfos, inboxInfos } from './model';

const STATICS_KEY = "statics";

// Get StaticsInfo, auto created if not existed in the Map
function getStaticsInfo(): StaticsInfo {
    let staticsInfo = staticsInfos.get(STATICS_KEY, null);
    if (staticsInfo==null) {
        staticsInfo = new StaticsInfo();
    }
    return staticsInfo;
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
        for (let idx=fromIndex; idx<=toIndex; idx++) {
            results[idx-fromIndex] = messages[sentMsgIndexes[idx]];
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
        for (let idx=fromIndex; idx<=toIndex; idx++) {
            results[idx-fromIndex] = messages[inboxMsgIndexes[idx]];
        }
    }
    return results;
}

/**
 * Get message from index
 * @param index Index of message 
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
 * @param content Content of message
 */
export function sendMessage(to: string, title: string, content: string, prevMsgId: i32): void {
    let staticsInfo = getStaticsInfo();

    // Store new message into blockchain
    let accountId = Context.sender;
    if (accountId==to) {
        // Don't allow sender to yourself
        return;
    }
    let msgId = messages.length + 1;
    let msg = new Message(msgId, accountId, to, title, content, prevMsgId);
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
}

export function getStatics(): StaticsInfo | null {
    return staticsInfos.get(STATICS_KEY, null);
}