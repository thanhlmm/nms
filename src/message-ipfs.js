const IpfsClient = require('ipfs-http-client');
const zlib = require('zlib');
const aes256 = require('aes256');
const axios = require('axios').default;
axios.defaults.adapter = require('axios/lib/adapters/http');
const stream = require('stream');

// Variables
let ipfsClient = null;
let isSupportZip = true;

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

async function compressData(buffer) {
    let promise = new Promise(function(resolve, reject) {
        zlib.deflate(buffer, function(error, result) {
            if (error) {
                console.error(error);
                resolve(null);
                return;
            }
            resolve(result);
        });
    });
    return (await promise);
}

async function decompressData(buffer) {
    let promise = new Promise(function(resolve, reject) {
        zlib.inflate(buffer, function(error, result) {
            if (error) {
                console.error(error);
                resolve(null);
                return;
            }
            resolve(result);
        });
    });
    return (await promise);
}

async function encodeMsgData(msgData, aesKey) {
    let buffer = Buffer.from(JSON.stringify(msgData), 'utf8');
    if (aesKey) {
        buffer = aes256.encrypt(aesKey, buffer);
    }
    if (isSupportZip) {
        buffer = await compressData(buffer);
    }
    return buffer;
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

async function storeMesageData(msgData, aesKey) {
    let ret = {
        success: false,
        message: null,
        cid: null
    };
    try {
        // Encode data
        let buffer = await encodeMsgData(msgData, aesKey);

        // Store data on IPFS
        let client = await getIpfsClient();
        const result = await client.add(buffer);
        let  = await client.add(buffer);

        // Output
        if (result && result.cid) {
            ret.success = true;
            ret.message = "SUCCESS";
            ret.cid = result.cid.toString();
        }
    } catch(ex) {
        console.error("Store message on IPFS error", ex);
        ret.message = ex.toString();
    }
    return ret;
}
exports.storeMesageData = storeMesageData;

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

async function test() {
    let msgData = {
        title: "Testing",
        content: "This is only for testing...",
        attachmentFiles: {
            "file01.zip": "filename-00001.zip",
            "file01.pdf": "filename-00002.pdf"
        }
    };
    let aesKey = 'my passphrase';
    // console.log("storeMesageData", await storeMesageData(msgData, aesKey));
    // https://ipfs.io/ipfs/QmZGwtHnHP8RhsDgwotmGUMeDCo6P2jy4Syu5R5R4uut81
    console.log("getMesageData", await getMesageData("Qmc7ADqdWWyhuKBHeP4NNuTh2A6njnEuXHDNXk3RVS5iHt", ""));
}
test();