import { env, PersistentVector, PersistentMap } from "near-sdk-as";

/**
 * A data structure that stores the information of a message
 */
@nearBindgen
export class Message {
    from: string;
    to: string;
    title: string;
    content: string;
    timestamp: u64;

    constructor(_from: string, _to: string, _title: string, _content: string) {
        this.from = _from;
        this.to = _to;
        this.title = _title;
        this.content = _content;
        this.timestamp = env.block_timestamp();
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