import { env, PersistentVector, PersistentMap } from "near-sdk-as";

/**
 * A data structure that stores the information of a message
 */
@nearBindgen
export class Message {
    id: i32;                // Must be greater than 0
    from: string;
    to: string;
    title: string;
    content: string;
    link: string;
    prevMsgId: i32;           // 0: No previous message
    timestamp: u64;

    constructor(_id: i32, _from: string, _to: string, _title: string, _content: string, _prevMsgId: i32, _serviceLink: string) {
        this.id = _id;
        this.from = _from;
        this.to = _to;
        this.title = _title;
        this.content = _content;
        this.link = _serviceLink;
        this.timestamp = env.block_timestamp();
        this.prevMsgId = _prevMsgId;
    }
}

/**
 * A data structure that stores statics information
 */
@nearBindgen
export class StaticsInfo {
    messageNum: i32;
    sentAccountNum: i32;
    inboxAccountNum: i32;
    accountNum: i32;

    constructor() {
        this.messageNum = 0;
        this.sentAccountNum = 0;
        this.inboxAccountNum = 0;
        this.accountNum = 0;
    }
}

// An array that stores messages on the blockchain
export const messages = new PersistentVector<Message>("psms");

// Stores static information
export const staticsInfos = new PersistentMap<string, StaticsInfo>("pstatics");

// Store list of message indexes for each sender's account.\
// Note: This avoids using a for loop to search for data, and also reduces duplication of message data
export const sentInfos = new PersistentMap<string, PersistentVector<i32>>("psent");

// Store list of message indexes for each sender's account.\
// Note: This avoids using a for loop to search for data, and also reduces duplication of message data
export const inboxInfos = new PersistentMap<string, PersistentVector<i32>>("pinbox");