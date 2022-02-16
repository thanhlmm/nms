import { env, u128, PersistentVector, PersistentMap } from "near-sdk-as";

const DEFAULT_USER_RATE =  u128.from("970");         // 970:30
const DEFAULT_FEE_ADDRESS = "learnnear-nms-sputnikdao.testnet";

/**
 * A data structure that stores the near amount
 */
@nearBindgen
export class MoneyInfo {
    totalDeposit: u128;
    appFee: u128;
    canReceivedAmount: u128;
    receivedAmount: u128;
    receivedTime: u64;
    sendBackAmount: u128;
    sendBackTime: u64;

    constructor(_depositAmount: u128, _userRate: u128) {
        this.totalDeposit = _depositAmount;
        this.canReceivedAmount = (_depositAmount *_userRate)/u128.from(1000);
        this.appFee = _depositAmount - this.canReceivedAmount;
        this.receivedAmount = u128.from(0);
        this.receivedTime = 0;
        this.sendBackAmount = u128.from(0);
        this.sendBackTime = 0;
    }
};

/**
 * A data structure that stores the information of a message
 */
@nearBindgen
export class Message {
    id: i32;                                // Must be greater than 0
    from: string;
    to: string;
    title: string;
    data: string;
    baseSite: string;
    prevMsgId: i32;                         // 0: No previous message
    timestamp: u64;
    expiredTime: u64;
    moneyInfo: MoneyInfo;

    constructor(_id: i32, _from: string, _to: string, _title: string, _data: string, _baseSite: string, _prevMsgId: i32, _expiredTime: u64, _moneyInfo: MoneyInfo) {
        this.id = _id;
        this.from = _from;
        this.to = _to;
        this.title = _title;
        this.data = _data;
        this.baseSite = _baseSite;
        this.timestamp = env.block_timestamp();
        this.prevMsgId = _prevMsgId;
        this.expiredTime = _expiredTime;
        this.moneyInfo = _moneyInfo;
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
    feeAddress: string;
    userRate: u128;
    ownerAddress: string;

    constructor() {
        this.messageNum = 0;
        this.sentAccountNum = 0;
        this.inboxAccountNum = 0;
        this.accountNum = 0;
        this.feeAddress = DEFAULT_FEE_ADDRESS;
        this.userRate = DEFAULT_USER_RATE;
        this.ownerAddress = "";
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

// Store list of public keys by account
export const publicKeys = new PersistentMap<string, string>("ppublickey");