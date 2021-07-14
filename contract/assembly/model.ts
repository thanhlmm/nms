import { env, PersistentVector, PersistentMap } from "near-sdk-as";

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

export const messages = new PersistentVector<Message>("psms");
export const sentInfos = new PersistentMap<string, PersistentVector<i32>>("psent");
export const inboxInfos = new PersistentMap<string, PersistentVector<i32>>("pinbox");