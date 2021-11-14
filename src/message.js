const IpfsClient = require('ipfs-http-client');
const aes256 = require('aes256');
const axios = require('axios').default;
axios.defaults.adapter = require('axios/lib/adapters/http');
const stream = require('stream');

// Variables
const clientConfig = {
    aesKey: "fc2f83976ad1342659c989ff91bc09d4efb891fd877e77fa03f61006467cff0e",         // SHA256("near-message-service")
    isSupportIpfs: false,
}
let ipfsClient = null;

async function getIpfsClient() {
    if (ipfsClient == null) {
        ipfsClient = await IpfsClient.create({
            host: "ipfs.infura.io",
            port: 5001,
            protocol: "https",
            timeout: '1m'
        });
    }
    return ipfsClient;
}

async function getIpfsData(cid) {
    // return await getIpfsData1(cid);
    // return await getIpfsData2(cid);
    return await getIpfsData3(cid);
}

// Unable to get data after a long time
async function getIpfsData1(cid) {
    let client = await getIpfsClient();
    let stream = client.cat(cid);
    let buffer = null;
    for await (const chunk of stream) {
        if (buffer==null) buffer = chunk;
        else buffer = Buffer.concat(buffer, chunk);
    }
    return buffer;
}

// Only run on Nodejs, not run on client
async function getIpfsData2(cid) {
    let resp = await axios.get(`https://gateway.ipfs.io/ipfs/${cid}`, { timeout: 60*1000, responseType: 'stream' });
    if (!resp || !resp.status || resp.status!=200) {
        console.error("Unable to get data from IPFS", resp);
        return null;
    }
    let buffer = null;
    var writer = new stream.Writable({
        write: function(chunk, encoding, next) {
            if (buffer==null) buffer = chunk;
            else buffer = Buffer.concat(buffer, chunk);
            next();
        }
    });
    resp.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', function() {
            resolve(buffer);
        })
        writer.on('error', function(err) {
            console.log("Error to get data:", err);
            resolve(null);
        })
    });
}

// Only run on Browser
async function getIpfsData3(cid) {
    let promise = new Promise(function(resolve, reject) {
        try {
            const data = null;
            const url = `https://gateway.ipfs.io/ipfs/${cid}`;
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
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
    return (await promise);
}

function encodeMsgTitle(msgTitle) {
    let buffer = Buffer.from(msgTitle, 'utf8');
    buffer = aes256.encrypt(clientConfig.aesKey, buffer);
    return buffer.toString('hex');
}

function decodeMsgTitle(hexaTitle) {
    if (!hexaTitle) return "";
    let buffer = Buffer.from(hexaTitle, "hex");
    buffer = aes256.decrypt(clientConfig.aesKey, buffer);
    return buffer.toString('utf8');
}

function encodeMsgBody(msgBody) {
    let buffer = Buffer.from(JSON.stringify(msgBody), 'utf8');
    buffer = aes256.encrypt(clientConfig.aesKey, buffer);
    return buffer;
}

function decodeMsgBody(bodyBuffer) {
    let buffer = aes256.decrypt(clientConfig.aesKey, bodyBuffer);
    let strBody = buffer.toString("utf8");
    return JSON.parse(strBody);
}

async function decodeMsgData(buffer, aesKey) {
    if (isSupportZip) {
        buffer = await decompressData(buffer);
    }
    if (aesKey) {
        buffer = aes256.decrypt(aesKey, buffer);
    }
    return JSON.parse(buffer.toString("utf8"));
}

async function getMesageData(cid, aesKey) {
    let ret = {
        success: false,
        message: null,
        data: null
    };
    try {
        // Get data from IPFS
        let buffer = await getIpfsData(cid);
        if (buffer) {
            // Decode data
            let data = await decodeMsgData(buffer, aesKey);
            if (data) {
                ret.success = true;
                ret.message = "SUCCESS";
                ret.data = data;
            } else {
                ret.message = "Unable to decode message";
            }
        } else {
            ret.message = "Unable to get data on IPFS for cid: " + cid;
        }
    
    } catch(ex) {
        console.error("Store message on IPFS error", ex);
        ret.message = ex.toString();
    }
    return ret;
}
exports.getMesageData = getMesageData;

// msg: { title, content, attachmentFiles }
// return: { code, message, title, data}
async function packMessage(msg) {
    let resp = {
        code: 1,
        message: "Unknow error"
    };
    try {
        // Encode title
        resp.title = encodeMsgTitle(msg.title);

        // Encode body
        let msgBody = {
            content: msg.content,
            attachmentFiles: content.attachmentFiles
        };
        let bodyBuffer = await encodeMsgBody(msgBody);

        // Check is support IPFS or not?
        if (clientConfig.isSupportIpfs) {
            // Support IPFS => Store body on IPFS
            let client = await getIpfsClient();
            const result = await client.add(bodyBuffer);
            if (result && result.cid) {
                resp.data = "#IPFS:" + result.cid.toString();
                resp.code = 0;
                resp.message = "SUCCESS";
                
            } else {
                resp.message = "Unable to store data on IPFS"
            }
        } else {
            // Not support IPFS
            resp.data = "#NONE:" + bodyBuffer.toString('hex');
            resp.code = 0;
            resp.message = "SUCCESS";
        }
    } catch(ex) {
        console.error("Error to pack message", ex);
        resp.message = ex.toString();
    }
    return resp;
}
exports.packMessage = packMessage;

// msg: { title, data }
// return: { code, message, title, content, attachmentFiles}
async function depackMessage(msg, isLoadFromIpfs=false) {
    let resp = {
        code: 1,
        message: "Unknown error"
    };
    try {
        // Decode title
        resp.title = decodeMsgTitle(msg.title);

        // Decode body
        let data = msg.data;
        if (data) {
            if (data.startsWith("#EXPIRED")) {
                msg.content = "The message has been expired!";
            } else if (data.startsWith("#NONE")) {
                let bodyData = data.substring(6);
                let bodyBuffer = Buffer.from(bodyData, "hex");
                let bodyInfo = decodeMsgBody(bodyBuffer);
                console.log("bodyInfo", bodyInfo);
                resp.content = bodyInfo.content;
                resp.attachmentFiles = bodyInfo.attachmentFiles;
                resp.code = 0;
                resp.message = "SUCCESS";
            } else if (data.startsWith("#IPFS")) {
                if (isLoadFromIpfs) {
                    let cid = data.substring(6);
                }
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
    } catch(ex) {
        console.error("Error to depack message", ex);
        resp.message = ex.toString();
    }
    return resp;
}
exports.depackMessage = depackMessage;