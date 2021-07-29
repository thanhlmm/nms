import { Context, PersistentVector, logging, storage } from 'near-sdk-as'
import { Message, messages, sentInfos, inboxInfos } from './model';

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
 * Sends new message to other account.
 * NOTE: This is a change method. Which means it will modify the state.
 * @param to The account id that will receive the message
 * @param title Title of message
 * @param content Content of message
 */
export function sendMessage(to: string, title: string, content: string): void {
    // Store new message into blockchain
    let accountId = Context.sender;
    let msg = new Message(accountId, to, title, content);
    messages.push(msg);

    // Store the index of new message for sender account
    let index = messages.length - 1;
    let items = sentInfos.get(accountId, null);
    if (items) {
        items.push(index);
    } else {
        items = new PersistentVector<i32>("psentinfos");
        items.push(index);
    }
    sentInfos.set(accountId, items);

    // Store the index of new message for receive account
    items = inboxInfos.get(to, null);
    if (items) {
        items.push(index);
    } else {
        items = new PersistentVector<i32>("pinboxinfos");
        items.push(index);
    }
    inboxInfos.set(to, items);
}