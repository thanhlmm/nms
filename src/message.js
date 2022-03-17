const IpfsClient = require("ipfs-http-client");
const aes256 = require("aes256");
const axios = require("axios").default;
const NodeRSA = require("node-rsa");
axios.defaults.adapter = require("axios/lib/adapters/http");
const stream = require("stream");

// Variables
const clientConfig = {
  aesKey: "fc2f83976ad1342659c989ff91bc09d4efb891fd877e77fa03f61006467cff0e", // SHA256("near-message-service")
  isSupportIpfs: true,
};
exports.clientConfig = clientConfig;

let ipfsClient = null;

async function getIpfsClient() {
  if (ipfsClient == null) {
    ipfsClient = await IpfsClient.create({
      host: "ipfs.infura.io",
      port: 5001,
      protocol: "https",
      timeout: "1m",
    });
  }
  return ipfsClient;
}

async function getIpfsData(cid) {
  return await getIpfsData1(cid);
  // return await getIpfsData2(cid);
  // return await getIpfsData3(cid);
}

// Unable to get data after a long time
async function getIpfsData1(cid) {
  let client = await getIpfsClient();
  let stream = client.cat(cid);
  let buffer = null;
  for await (const chunk of stream) {
    if (buffer == null) buffer = chunk;
    else buffer = Buffer.concat(buffer, chunk);
  }
  return Buffer.from(buffer);
}

// Only run on Nodejs, not run on client
async function getIpfsData2(cid) {
  let resp = await axios.get(`https://gateway.ipfs.io/ipfs/${cid}`, {
    timeout: 60 * 1000,
    responseType: "stream",
  });
  if (!resp || !resp.status || resp.status != 200) {
    console.error("Unable to get data from IPFS", resp);
    return null;
  }
  let buffer = null;
  var writer = new stream.Writable({
    write: function (chunk, encoding, next) {
      if (buffer == null) buffer = chunk;
      else buffer = Buffer.concat(buffer, chunk);
      next();
    },
  });
  resp.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", function () {
      resolve(buffer);
    });
    writer.on("error", function (err) {
      console.log("Error to get data:", err);
      resolve(null);
    });
  });
}

// Only run on Browser
async function getIpfsData3(cid) {
  let promise = new Promise(function (resolve, reject) {
    try {
      const data = null;
      const url = `https://gateway.ipfs.io/ipfs/${cid}`;
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.overrideMimeType("application/octet-stream");
      xhr.responseType = "arraybuffer";
      xhr.timeout = 60000;
      xhr.onload = function (v) {
        resolve(Buffer.from(xhr.response));
      };
      xhr.onerror = function (e) {
        console.error(`ERROR to get data ${cid}`, e);
        resolve(null);
      };
      xhr.send(data);
    } catch (ex) {
      console.error("Unable to get avatar", ex);
    }
  });
  return await promise;
}

function encodeMsgTitle(msgTitle) {
  let buffer = Buffer.from(msgTitle, "utf8");
  buffer = aes256.encrypt(clientConfig.aesKey, buffer);
  return buffer.toString("base64");
}

function decodeMsgTitle(hexaTitle) {
  if (!hexaTitle) return "";
  let buffer = Buffer.from(hexaTitle, "base64");
  buffer = aes256.decrypt(clientConfig.aesKey, buffer);
  return buffer.toString("utf8");
}

function encodeMsgBody(msgBody, aesKey) {
  let buffer = Buffer.from(JSON.stringify(msgBody), "utf8");
  buffer = aes256.encrypt(aesKey, buffer);
  return buffer;
}

function decodeMsgBody(bodyBuffer, aesKey) {
  let buffer = aes256.decrypt(aesKey, bodyBuffer);
  let strBody = buffer.toString("utf8");
  return JSON.parse(strBody);
}

function generateAESKey256() {
  let key = "";
  let hex = "0123456789abcdef";
  for (i = 0; i < 64; i++) {
    key += hex.charAt(Math.floor(Math.random() * 16));
  }
  return key;
}

function encryptWithPublicKey(publicKey, data) {
  let pubKey = Buffer.from(publicKey, "base64").toString("utf8");
  let key = new NodeRSA(pubKey, "public");
  const encrypted = key.encrypt(data, "base64");
  return encrypted;
}

function decryptWithPrivateKey(privateKey, data) {
  let priKey = Buffer.from(privateKey, "base64").toString("utf8");
  let key = new NodeRSA(priKey, "private");
  let buffer = Buffer.from(data, "base64");
  const decrypted = key.decrypt(buffer, "utf8");
  return decrypted;
}

// msg: { title, content, attachmentFiles, type, keys: { sender, receiver } }
// return: { code, message, title, data}
async function packMessage(msg) {
  let resp = {
    code: 1,
    message: "Unknow error",
  };
  try {
    // Encode title
    resp.title = encodeMsgTitle(msg.title);

    // AES Key
    let isPrivateMsg = msg.type && msg.type == "PRIVATE";
    let aesKey = clientConfig.aesKey;
    if (isPrivateMsg) {
      aesKey = generateAESKey256();
    }

    // Encode body
    let msgBody = {
      content: msg.content,
      attachmentFiles: msg.attachmentFiles,
    };
    let bodyBuffer = await encodeMsgBody(msgBody, aesKey);

    // Check is support IPFS or not?
    if (clientConfig.isSupportIpfs) {
      // Support IPFS => Store body on IPFS
      let client = await getIpfsClient();
      const result = await client.add(bodyBuffer);
      if (result && result.cid) {
        let cid = await client.pin.add(result.cid);
        if (cid) {
          if (isPrivateMsg) {
            let senderKey = encryptWithPublicKey(msg.keys.sender, aesKey);
            let receiverKey = encryptWithPublicKey(msg.keys.receiver, aesKey);
            resp.data =
              `#IPFS-PRI:${senderKey}-${receiverKey}-` + result.cid.toString();
          } else {
            resp.data = "#IPFS:" + result.cid.toString();
          }
          resp.code = 0;
          resp.message = "SUCCESS";
        } else {
          resp.message = "Unable to pin message on IPFS";
        }
      } else {
        resp.message = "Unable to store data on IPFS";
      }
    } else {
      // Support direct
      if (isPrivateMsg) {
        let senderKey = encryptWithPublicKey(msg.keys.sender, aesKey);
        let receiverKey = encryptWithPublicKey(msg.keys.receiver, aesKey);
        resp.data =
          `#DIRECT-PRI:${senderKey}-${receiverKey}-` +
          bodyBuffer.toString("base64");
      } else {
        resp.data = "#DIRECT:" + bodyBuffer.toString("base64");
      }
      resp.code = 0;
      resp.message = "SUCCESS";
    }
  } catch (ex) {
    console.error("Error to pack message", ex);
    resp.message = ex.toString();
  }
  return resp;
}
exports.packMessage = packMessage;

// msg: { baseSite, expiredTime, from, to, timestamp, id, prevMsgId }
// opts: { isLoadFromIpfs, isInboxMsg, privateKey }
// return: { code, message, title, content, attachmentFiles}
async function depackMessage(msg, opts) {
  let resp = {
    baseSite: msg.baseSite,
    expiredTime: msg.expiredTime,
    from: msg.from,
    to: msg.to,
    timestamp: new Date(msg.timestamp / 10 ** 6),
    id: msg.id,
    prevMsgId: msg.prevMsgId,
    code: 1,
    message: "Unknown error",
    title: null,
    content: null,
    moneyInfo: msg.moneyInfo,
    isPrivate: msg.isPrivate,
  };
  try {
    // Decode title
    resp.title = decodeMsgTitle(msg.title);

    // Decode body
    let data = msg.data;
    if (data) {
      if (data.startsWith("#EXPIRED")) {
        msg.content = "The message has been expired!";
      } else if (data.startsWith("#DIRECT-PRI")) {
        if (!opts || !opts.privateKey) {
          resp.message = "Missing parameters!!!";
          resp.title = "Missing Private Key";
          resp.content = "Can not decrypt this message";
          return resp;
        }
        let items = data.substring(12).split("-");
        let bodyData = items[2];
        let senderKey = items[0];
        let receiverKey = items[1];
        let aesKey = null;
        if (opts && opts.isInboxMsg) {
          aesKey = decryptWithPrivateKey(opts.privateKey, receiverKey);
        } else {
          aesKey = decryptWithPrivateKey(opts.privateKey, senderKey);
        }
        let bodyBuffer = Buffer.from(bodyData, "base64");
        let bodyInfo = decodeMsgBody(bodyBuffer, aesKey);
        // console.log("bodyInfo #DIRECT-PRI", bodyInfo);
        resp.content = bodyInfo.content;
        resp.attachmentFiles = bodyInfo.attachmentFiles;
        resp.code = 0;
        resp.message = "SUCCESS";
      } else if (data.startsWith("#DIRECT")) {
        let bodyData = data.substring(8);
        let bodyBuffer = Buffer.from(bodyData, "base64");
        let bodyInfo = decodeMsgBody(bodyBuffer, clientConfig.aesKey);
        // console.log("bodyInfo #DIRECT", bodyInfo);
        resp.content = bodyInfo.content;
        resp.attachmentFiles = bodyInfo.attachmentFiles;
        resp.code = 0;
        resp.message = "SUCCESS";
      } else if (data.startsWith("#IPFS-PRI")) {
        // console.log("#IPFS-PRI data", data);
        let items = data.substring(10).split("-");
        let cid = items[2];
        let senderKey = items[0];
        let receiverKey = items[1];
        let aesKey = null;
        if (opts && opts.isInboxMsg) {
          aesKey = decryptWithPrivateKey(opts.privateKey, receiverKey);
        } else {
          aesKey = decryptWithPrivateKey(opts.privateKey, senderKey);
        }
        let bodyBuffer = await getIpfsData(cid);
        // console.log("bodyInfo #bodyBuffer", bodyBuffer);
        let bodyInfo = decodeMsgBody(bodyBuffer, aesKey);
        // console.log("bodyInfo #IPFS", bodyInfo);
        resp.content = bodyInfo.content;
        resp.attachmentFiles = bodyInfo.attachmentFiles;
        resp.code = 0;
        resp.message = "SUCCESS";
      } else if (data.startsWith("#IPFS")) {
        let cid = data.substring(6);
        let bodyBuffer = await getIpfsData(cid);
        // console.log("bodyInfo #bodyBuffer", bodyBuffer);
        let bodyInfo = decodeMsgBody(bodyBuffer, clientConfig.aesKey);
        // console.log("bodyInfo #IPFS", bodyInfo);
        resp.content = bodyInfo.content;
        resp.attachmentFiles = bodyInfo.attachmentFiles;
        resp.code = 0;
        resp.message = "SUCCESS";
      } else {
        resp.message = "Message is invalid format!!!";
      }
    } else {
      resp.content = "";
      resp.code = 0;
      resp.message = "SUCCESS";
    }
  } catch (ex) {
    console.error("Error to depack message", ex);
    resp.message = ex.toString();
    resp.content = "Can not decrypt this message";
  }
  return resp;
}
exports.depackMessage = depackMessage;

// Generate RSA Keypair
function generateRSAKey() {
  let key = new NodeRSA({ b: 1024 });
  let publicKey = key.exportKey("public");
  let strPublicKey = Buffer.from(publicKey, "utf8").toString("base64");
  let privateKey = key.exportKey("private");
  let strPrivateKey = Buffer.from(privateKey, "utf8").toString("base64");
  return {
    publicKey: strPublicKey,
    privateKey: strPrivateKey,
  };
}
exports.generateRSAKey = generateRSAKey;

// Get public key from private key
function privateKeyToPublicKey(strPrivateKey) {
  let privateKey = Buffer.from(strPrivateKey, "base64").toString("utf8");
  let key = new NodeRSA(privateKey, "private");
  let publicKey = key.exportKey("public");
  let strPublicKey = Buffer.from(publicKey, "utf8").toString("base64");
  return strPublicKey;
}
exports.privateKeyToPublicKey = privateKeyToPublicKey;

// Encrypt PrivateKey with Password Confirm
function encryptPrivateKeyWithPasswordConfirm(password, privateKey) {
  const encrypt = aes256.encrypt(password, `TEST-${privateKey}`);
  return encrypt;
}
exports.encryptPrivateKeyWithPasswordConfirm =
  encryptPrivateKeyWithPasswordConfirm;

// Decrypt PrivateKey with Password Confirm
function decryptPrivateKeyWithPasswordConfirm(password, buffer) {
  const decrypt = aes256.decrypt(password, buffer);
  return decrypt;
}
exports.decryptPrivateKeyWithPasswordConfirm =
  decryptPrivateKeyWithPasswordConfirm;
