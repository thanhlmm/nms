const message = require('./message');

const clientConfig = {
  aesKey: "fc2f83976ad1342659c989ff91bc09d4efb891fd877e77fa03f61006467cff0e", // SHA256("near-message-service")
  isSupportIpfs: false,
};

const from = "thanhle.testnet";
const to = "near.testnet";
const senderKey = message.generateRSAKey();
const receiverKey = message.generateRSAKey();

console.log("Sender key", senderKey);
console.log("Receiver key", receiverKey);

const messageObj = {
  title: "This is title",
  content: "This is content",
  attachmentFiles: [],
  type: "PRIVATE",
  keys: { sender: senderKey.publicKey, receiver: receiverKey.publicKey }
}

const runPrivate = async () => {
  const encryptMsg = await message.packMessage(messageObj);
  console.log({ encryptMsg });

  const decryptMsg = await message.depackMessage({
    baseSite: "localhost:8080",
    expiredTime: 0,
    from,
    to,
    timestamp: 10000,
    id: 1,
    prevMsgId: null,
    title: encryptMsg.title,
    data: encryptMsg.data
  }, {
    isLoadFromIpfs: clientConfig.isSupportIpfs,
    isInboxMsg: true,
    privateKey: receiverKey.privateKey
  })

  console.log({ decryptMsg });
}

const runPublic = async () => {
  messageObj.type = "PUBLIC"
  const encryptMsg = await message.packMessage(messageObj);
  console.log({ encryptMsg });

  const decryptMsg = await message.depackMessage({
    baseSite: "localhost:8080",
    expiredTime: 0,
    from,
    to,
    timestamp: 10000,
    id: 1,
    prevMsgId: null,
    title: encryptMsg.title,
    data: encryptMsg.data
  }, {
    isLoadFromIpfs: clientConfig.isSupportIpfs,
    isInboxMsg: true,
  });

  console.log({ decryptMsg });
}

console.log("START TEST PRIVATE");
runPrivate().then(() => {
  console.log("START TEST PUBLIC");
  runPublic();
});

