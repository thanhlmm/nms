import { Context, PersistentVector, logging, storage } from 'near-sdk-as'
import { Message, messages, sentInfos, inboxInfos } from './model';

export function getSentMsgNum(accountId: string): i32 {
    let items = sentInfos.get(accountId, null);
    return (items ? items.length : 0);
}

export function getSentMessages(accountId: string, fromIndex: i32, toIndex: i32): Message[] {
    let sentMsgIndexes = sentInfos.get(accountId, null);
    let numMsg = (sentMsgIndexes?sentMsgIndexes.length:0);
    if (fromIndex>numMsg) fromIndex = numMsg-1;
    if (fromIndex<0) fromIndex = 0;
    if (toIndex>numMsg) toIndex = numMsg-1;
    if (toIndex<0) toIndex = 0;
    if (toIndex<fromIndex) toIndex = fromIndex;

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

export function getInboxMsgNum(accountId: string): i32 {
    let items = inboxInfos.get(accountId, null);
    return (items ? items.length : 0);
}

export function getInboxMessages(accountId: string, fromIndex: i32, toIndex: i32): Message[] {
    let inboxMsgIndexes = inboxInfos.get(accountId, null);
    let numMsg = (inboxMsgIndexes?inboxMsgIndexes.length:0);
    if (fromIndex>numMsg) fromIndex = numMsg-1;
    if (fromIndex<0) fromIndex = 0;
    if (toIndex>numMsg) toIndex = numMsg-1;
    if (toIndex<0) toIndex = 0;
    if (toIndex<fromIndex) toIndex = fromIndex;

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

export function sendMessage(to: string, title: string, content: string): void {
    // Insert to messages
    let accountId = Context.sender;
    let msg = new Message(accountId, to, title, content);
    messages.push(msg);

    // Add to sentInfos
    let index = messages.length - 1;
    let items = sentInfos.get(accountId, null);
    if (items) {
        items.push(index);
    } else {
        items = new PersistentVector<i32>("psentinfos");
        items.push(index);
    }
    sentInfos.set(accountId, items);

    // Add to inboxInfos
    items = inboxInfos.get(to, null);
    if (items) {
        items.push(index);
    } else {
        items = new PersistentVector<i32>("pinboxinfos");
        items.push(index);
    }
    inboxInfos.set(to, items);
}