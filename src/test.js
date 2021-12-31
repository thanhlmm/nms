const IpfsClient = require("ipfs-http-client");
const aes256 = require("aes256");
const axios = require("axios").default;
const NodeRSA = require("node-rsa");
axios.defaults.adapter = require("axios/lib/adapters/http");
const stream = require("stream");

const clientConfig = {
  aesKey: "fc2f83976ad1342659c989ff91bc09d4efb891fd877e77fa03f61006467cff0e", // SHA256("near-message-service")
  isSupportIpfs: false,
};

const publicKeyGEN =
  "2d2d2d2d2d424547494e205055424c4943204b45592d2d2d2d2d0a4d4947664d413047435371475349623344514542415155414134474e4144434269514b4267514365597079513273332f54514958673778664c615461783545540a4471424278704951514c522b59696f72792f6658706369524e3153555641337a5038505a484a75573670356d647349476b756a72384e46647434444d595965490a52474c4f3936527454377a5651426b786169765a7a6c6d7a4e366357566f38775230554977426c71634d77477155577a67676f45393756725035714835564c520a6c63543841736c764d59686a474b37734f774944415141420a2d2d2d2d2d454e44205055424c4943204b45592d2d2d2d2d";
const privateKeyGEN =
  "2d2d2d2d2d424547494e205253412050524956415445204b45592d2d2d2d2d0a4d4949435867494241414b4267514365597079513273332f54514958673778664c615461783545544471424278704951514c522b59696f72792f6658706369520a4e3153555641337a5038505a484a75573670356d647349476b756a72384e46647434444d5959654952474c4f3936527454377a5651426b786169765a7a6c6d7a0a4e366357566f38775230554977426c71634d77477155577a67676f45393756725035714835564c526c63543841736c764d59686a474b37734f774944415141420a416f474241494877474d356d453759746356666c526263333952566677453949496f5754364f54596b4c74577759346f79653372486e3630532f6c63644131700a394c7937305a4767626339574170767544705479666e464b534b6b57466a3957735a4e4d3069724237543067656267747a2b4d494f315731704773592b6f44480a534f4f6a776135675668534358304f4a626e5756466974366c727057617169766f4a7947365053437135677872523378416b4541365a722f746a3756485068470a724835324f386d72656c656e6b5167622f4c307263372f6765422f77422f4e4247424b772f524859625761702b47467962465046785246314f56724b4e6732460a5a4c7266575a62626c774a42414b32526d6e747147663358726e4473367766354462527832632b4d5778752b78445562643243504437424f4f52744d306157720a79534c75694741623375743541395058445a6a556d646a354a62576132586c45575030435147767575596379734c535a3463324241492f504e664e6f334873650a444242534e756c6346684a71627a53394a36342f744a613430413538434c7843436551544d4b56453036795554696c3752633673714e567a356a4543515143710a7a526e6b554f6a3637332f754348625242626b43315061755530526b37546c50755a4f6b4a61516572787472546845516f7866766c4351487a2b5679653066550a38302b694562544432346e4d5348477838427852416b45417a426e4b7178304c5144656e52535474344539592b334c483768465a386f6e396d5834487a32704f0a62636532423048513849593059474f747434736e624b6b704258614958474a63626353706a6136387152385a37773d3d0a2d2d2d2d2d454e44205253412050524956415445204b45592d2d2d2d2d";

function generateAESKey256() {
  let key = "";
  let hex = "0123456789abcdef";
  for (i = 0; i < 64; i++) {
    key += hex.charAt(Math.floor(Math.random() * 16));
  }
  return key;
}

function packMessage(msg) {
  console.log("msg: ", msg);
  let isPrivateMsg = msg.type && msg.type == "PRIVATE";
  let aesKey = clientConfig.aesKey;
  if (isPrivateMsg) {
    aesKey = generateAESKey256();
  }

  let buffer = Buffer.from(JSON.stringify(msg.content), "utf8");
  buffer = aes256.encrypt(aesKey, buffer);

  depackMessagePUBLIC(buffer.toString("hex"));
  //   depackMessagePRIVATE(buffer.toString("hex"));
}

function sendMessage(type) {
  if (type === "PRIVATE") {
    packMessage({
      type: type,
      key: publicKeyGEN,
      content: "NguyenNgocThanhBinh",
    });
  }
  if (type === "PUBLIC") {
    packMessage({
      type: type,
      key: null,
      content: "NguyenNgocThanhBinh",
    });
  }
}
sendMessage("PUBLIC");
// sendMessage("PRIVATE");

function decryptWithPrivateKey(privateKey, data) {
  let priKey = Buffer.from(privateKey, "hex").toString("utf8");
  let key = new NodeRSA(priKey, "private");
  let buffer = Buffer.from(data, "hex");
  const decrypted = key.decrypt(buffer, "utf8");
  return decrypted;
}

function decodeMsgBody(bodyBuffer, aesKey) {
  let buffer = aes256.decrypt(aesKey, bodyBuffer);
  let strBody = buffer.toString("utf8");
  return JSON.parse(strBody);
}

function depackMessagePUBLIC(data) {
  let aesKey = clientConfig.aesKey;
  let bodyBuffer = Buffer.from(data, "hex");
  let bodyInfo = decodeMsgBody(bodyBuffer, aesKey);
  console.log("bodyContent PBULIC: ", bodyInfo);
}

function depackMessagePRIVATE(data) {
  //case in Sent Screen
  let aesKey = decryptWithPrivateKey(privateKeyGEN, publicKeyGEN);
  let bodyBuffer = Buffer.from(data, "hex");
  let bodyInfo = decodeMsgBody(bodyBuffer, aesKey);
  console.log("bodyContent PRIVATE", bodyInfo);
}
