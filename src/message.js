const IPFS = require('ipfs');
const zlib = require('zlib');

let ipfsNode = null;
let isSupportZip = true;

async function getIpfsNode() {
    if (ipfsNode == null) {
        ipfsNode = await IPFS.create();
    }
    return ipfsNode;
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

async function encodeMsgData(msgData) {
    let buffer = Buffer.from(JSON.stringify(msgData), 'utf8');
    if (isSupportZip) {
        buffer = await compressData(buffer);
    }
    return buffer;
}

async function decodeMsgData(buffer) {
    if (isSupportZip) {
        buffer = await decompressData(buffer);
    }
    return JSON.parse(buffer.toString("utf8"));
}

export async function storeMesageData(msgData) {
    let ret = {
        success: false,
        message: null,
        cid: null
    };
    try {
        // Encode data
        let buffer = await encodeMsgData(message);

        // Store data on IPFS
        let node = await getIpfsNode();
        let result = await node.add(buffer);

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

export async function getMesageData(cid) {
    let ret = {
        success: false,
        message: null,
        data: null
    };
    try {
        // Get data from IPFS
        let node = await getIpfsNode();
        let stream = node.cat(cid);
        let buffer = null;
        for await (const chunk of stream) {
            if (buffer==null) buffer = chunk;
            else buffer += Buffer.concat(buffer, chunk);
        }

        if (buffer) {
            // Decode data
            let data = await decodeMsgData(buffer);
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