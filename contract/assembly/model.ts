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

// An array that stores messages on the blockchain
export const messages = new PersistentVector<Message>("psms");

// Store list of message indexes for each sender's account.\
// Note: This avoids using a for loop to search for data, and also reduces duplication of message data
export const sentInfos = new PersistentMap<string, PersistentVector<i32>>("psent");

// Store list of message indexes for each sender's account.\
// Note: This avoids using a for loop to search for data, and also reduces duplication of message data
export const inboxInfos = new PersistentMap<string, PersistentVector<i32>>("pinbox");