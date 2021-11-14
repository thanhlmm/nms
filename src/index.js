import 'regenerator-runtime/runtime'

import { initContract, login, logout, isAccountExist, getTransaction, getAvatar } from './utils';
import message from './message';
import getConfig from './config';
// const { networkId } = getConfig(process.env.NODE_ENV || 'development');
const { networkId } = getConfig('development');

let APP_FEE = "1000000000000000000000";
const ONE_YOCTO_NEAR = 1;
const BOATLOAD_OF_GAS = (60*10**12).toFixed();

const submitButton = document.querySelector('form button');
let appInfo = {
    currentMenu: "INBOX",
    itemPerPage: 5,
    inbox: {
        currentPage: 1,
        messages: [],
        msgNum: 0
    },
    sent: {
        currentPage: 1,
        messages: [],
        msgNum: 0
    }
};

window.addEventListener('resize', function(e) {
    updateWidthForDivColumn2();
});
window.onPageChange = function(type, page) {
    if (type=="inbox") {
        appInfo.inbox.currentPage = page;
        updateInboxUI();
    } else if (type=="sent") {
        appInfo.sent.currentPage = page;
        updateSentUI();
    }
}
window.onClickMenuItem = function(type) {
    if (type=="inbox") {
        appInfo.currentMenu = "INBOX";
        updateInboxUI();
    } else if (type=="sent") {
        appInfo.currentMenu = "SENT";
        updateSentUI();
    } else if (type=="compose") {
        appInfo.currentMenu = "COMPOSE";
        updateComposeUI();
    }
}
window.replyMessage = function(type, msgIndex) {
    updateComposeUI("reply", type, msgIndex);
}
window.forwardMessage = function(type, msgIndex) {
    updateComposeUI("forward", type, msgIndex);
}

let initTransHash = findGetParameter("transactionHashes");

document.querySelector('form').onsubmit = async (event) => {
    event.preventDefault()

    // get elements from the form using their id attribute
    const { toAccount, title, content } = event.target.elements
    let attachedNear = document.querySelector('input[name="attachedNear"]:checked').value;

    // Check input
    if (title.value==null || title.value.length<=0) {
        alert("Please enter the field 'Title'!");
        return;
    }
    if (content.value==null || content.value.length<=0) {
        alert("Please enter the field 'Content'!");
        return;
    }
    if (toAccount.value==null || toAccount.value.length<=0) {
        alert("Please enter the field 'To Account'!");
        return;
    }
    if (window.accountId==toAccount.value) {
        alert("Don't allow sender to yourself!");
        return;
    }
    if (!await isAccountExist(toAccount.value)) {
        alert(`The account '${toAccount.value}' is not existed. Please enter the other account!`);
        return;
    }
    let originMsgId = Number(document.querySelector('input#originMsgId').value);
    if (originMsgId==null) originMsgId = 0;

    // disable the save button, since it now matches the persisted value
    submitButton.disabled = true

    let ret = false;
    try {
        // Send message
        ret = await sendMessage(toAccount.value, title.value, content.value, attachedNear, originMsgId);
    } catch(ex) {
        console.log("ERROR", ex);
    }

    await showNotificationByResult(ret);
}

// Listen for user input events
document.querySelector('input#toAccount').oninput = (event) => { checkSubmitButton(); }
document.querySelector('input#title').oninput = (event) => { checkSubmitButton(); }
document.querySelector('textarea#content').oninput = (event) => { checkSubmitButton(); }

// Handle user action events
document.querySelector('#sign-in-button').onclick = login;
document.querySelector('#sign-out-button').onclick = logout;

// Check user input to enable/disable submit button
function checkSubmitButton() {
    let value1 = document.querySelector('input#toAccount').value;
    let value2 = document.querySelector('input#title').value;
    let value3 = document.querySelector('textarea#content').value;

    if (value1 && value2 && value3) {
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
    }
}

function standardHtmlData(text) {
    text = text.replace(/<script[^>]*>(?:(?!<\/script>)[^])*<\/script>/gi, "");
    text = text.replace(/<iframe[^>]*>(?:(?!<\/iframe>)[^])*<\/iframe>/gi, "");
    text = text.replace(/\n/g, "<br />");
    return text;
}

// Reset "new message" box
function resetNewMsgBox() {
    document.querySelector('input#toAccount').value = "";
    document.querySelector('input#title').value = "";
    document.querySelector('textarea#content').value = "";
    submitButton.disabled = false;
}

function updateWidthForDivColumn2() {
    let obj = document.querySelector('.div-column2');
    let width = document.getElementById("signed-in-flow").clientWidth;
    obj.style.width = (width - 230 - 20) + "px";
}

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

async function showNotificationByTransHash(transHash) {
    let result = await getTransaction(transHash);
    let ret = false;
    if (result && result.status && result.status.SuccessValue) {
        let returnValue = (new Buffer.from(result.status.SuccessValue, "base64")).toString();
        if (returnValue=="true" || returnValue=="TRUE") {
            ret = true;
        }
    }
    await showNotificationByResult(ret);
}

async function showNotificationByResult(isSuccess) {
    if (isSuccess) {
        // Reset message box if sucess
        resetNewMsgBox();
                
        // Show sucess notification
        document.querySelector('[data-behavior=notification]').style.display = 'block';

        // Remove notification again after css animation completes
        setTimeout(() => {
            document.querySelector('[data-behavior=notification]').style.display = 'none';
        }, 11000);

        // Update the messages in the UI
        await updateAppUI();
    } else {
        submitButton.disabled = false;
        
        // Show error notification
        document.querySelector('[data-behavior=notification-error]').style.display = 'block';
        
        // Remove notification again after css animation completes
        setTimeout(() => {
            document.querySelector('[data-behavior=notification-error]').style.display = 'none';
        }, 11000);
    }
}

// Display the signed-out-flow container
function signedOutFlow() {
    document.querySelector('#signed-out-flow').style.display = 'block';
}

// Displaying the signed in flow container and fill in account-specific data
function signedInFlow() {
    document.querySelector('#signed-in-flow').style.display = 'block';
    updateWidthForDivColumn2();

    document.querySelectorAll('[data-behavior=account-id]').forEach(el => {
        el.innerText = window.accountId
    })

    // populate links in the notification box
    let accountLink = document.querySelector('[data-behavior=notification] a:nth-of-type(1)')
    accountLink.href = accountLink.href + window.accountId
    accountLink.innerText = '@' + window.accountId
    let contractLink = document.querySelector('[data-behavior=notification] a:nth-of-type(2)')
    contractLink.href = contractLink.href + window.contract.contractId
    contractLink.innerText = '@' + window.contract.contractId

    // populate links in the error notification box
    accountLink = document.querySelector('[data-behavior=notification-error] a:nth-of-type(1)')
    accountLink.href = accountLink.href + window.accountId
    accountLink.innerText = '@' + window.accountId
    contractLink = document.querySelector('[data-behavior=notification-error] a:nth-of-type(2)')
    contractLink.href = contractLink.href + window.contract.contractId
    contractLink.innerText = '@' + window.contract.contractId;

    // Update avatar
    getAvatar(window.accountId, function(imageData) {
        window.accountAvatar = imageData;
        if (imageData) {
            document.querySelector('#userAvatar').src = imageData;
            
        }
    });

    // update with selected networkId
    accountLink.href = accountLink.href.replace('testnet', networkId)
    contractLink.href = contractLink.href.replace('testnet', networkId);

    updateAppUI();

    if (initTransHash) {
        showNotificationByTransHash(initTransHash).then(function() {
            initTransHash = null;
        });
    }
}

function getSiteLink() {
    let link = window.location.href;
    return link.toString().replace(/^(.*\/\/[^\/?#]*).*$/,"$1");
}

// Send new message
async function sendMessage(toAccount, title, content, attachedNear, originMsgId=0, expiredTime=0) {
    let ret = false;
    try {
        let msg = {
            title: title,
            content: content,
            attachmentFiles: {
            }
        };
        let resp = await message.packMessage(msg);
        let strExpiredTime = "" + expiredTime;
        if (resp.code==0) {
            if (attachedNear) {
                ret = await contract.sendMessage({
                    to: toAccount,
                    title: resp.title,
                    data: resp.data,
                    baseSite: getSiteLink(),
                    prevMsgId: originMsgId,
                    expiredTime: strExpiredTime
                }, BOATLOAD_OF_GAS, attachedNear);
            } else {
                ret = await contract.sendMessage({
                    to: toAccount,
                    title: resp.title,
                    data: resp.data,
                    baseSite: getSiteLink(),
                    prevMsgId: originMsgId,
                    expiredTime: strExpiredTime
                });
            }
        } else {
            console.error("Error when packing messsage", resp);
        }
    } catch(ex) {
        console.error("Error to send message", ex);
    }
    
    return ret;
}

function getIndexInfo(messageNum, currentPage, itemPerPage) {
    let ret = {
        fromIndex: 0,
        toIndex: -1
    };
    if (messageNum>0) {
        // Page 1 corresponding the lastest messages
        ret.toIndex = messageNum - 1 - (currentPage-1)*itemPerPage;
        ret.fromIndex = ret.toIndex - itemPerPage + 1;
        if (ret.fromIndex<0) ret.fromIndex = 0;
    }
    return ret;
}

async function updateAppUI() {
    if (appInfo.currentMenu=="INBOX") {
        // Update UI for Inbox
        await updateInboxUI();
    } else if (appInfo.currentMenu=="SENT") {
        // Update UI for Sent
        await updateSentUI();
    } else if (appInfo.currentMenu=="COMPOSE") {
        await updateComposeUI();
    }
}

async function updateDataMessage(msg, isLoadPreItem=false) {
    let msgInfo = await message.depackMessage({ title: msg.title, data: msg.data });
    if (msgInfo && msgInfo.code==0) {
        msg.msgData = {
            title: msgInfo.title,
            content: msgInfo.content,
            attachmentFiles: msgInfo.attachmentFiles
        };

        if (msg.prevMsgId>0 && isLoadPreItem) {
            let prevItem = await contract.getMessage({
                msgId: msg.prevMsgId
            });
            if (prevItem!=null) {
                await updateDataMessage(prevItem, false);
                msg.prevMsgItem = prevItem;
            }
        }
        console.log(msg);
    } else {
        msg.msgData = {
            title: "Unable to get message",
            content: "",
            attachmentFiles: {}
        };
    }
}

async function updateDataMessages(messages) {
    // Get data of the messages
    let promises = [];
    for (let idx=0; idx<messages.length; idx++) {
        promises.push(updateDataMessage(messages[idx], true));
    }
    await Promise.all(promises);
}

async function updateInboxUI() {
    // Show inbox block and hide others
    document.querySelector('#inboxMessages').style.display = 'block';
    document.querySelector('#sentMessages').style.display = 'none';
    document.querySelector('#newMsgBoard').style.display = 'none';
    
    // Update title
    document.querySelector('#bodyTitle').innerText = "Inbox";
    document.querySelector('#bodyTitleInfo').innerText = "";
    document.querySelector('#pagingInfo').innerHTML = "";

    // Fetch inbox messages and show messages to UI
    let inboxMsgNum = await contract.getInboxMsgNum({
        accountId: window.accountId
    });
    let inboxMessages = [];
    let indexInfo = getIndexInfo(inboxMsgNum, appInfo.inbox.currentPage, appInfo.itemPerPage);
    if (indexInfo.toIndex>=indexInfo.fromIndex) {
        inboxMessages = await contract.getInboxMessages({
            accountId: window.accountId,
            fromIndex: indexInfo.fromIndex,
            toIndex: indexInfo.toIndex
        });
    }
    console.log("inboxMessages", inboxMessages);
    await updateDataMessages(inboxMessages);
    console.log("inboxMessages 1", inboxMessages);
    
    console.log("Inbox:", inboxMsgNum, inboxMessages);
    appInfo.inbox.messages = inboxMessages;
    appInfo.inbox.msgNum = inboxMsgNum;
    showInboxMessages(inboxMsgNum, inboxMessages);
    await updateStaticInfoUI();
}

async function updateSentUI() {
    // Show sent block and hide others
    document.querySelector('#inboxMessages').style.display = 'none';
    document.querySelector('#sentMessages').style.display = 'block';
    document.querySelector('#newMsgBoard').style.display = 'none';
    
    // Update title
    document.querySelector('#bodyTitle').innerText = "Sent";
    document.querySelector('#bodyTitleInfo').innerText = "";
    document.querySelector('#pagingInfo').innerHTML = "";

    // Fetch sent messages and show messages to UI
    let sentMsgNum = await contract.getSentMsgNum({
        accountId: window.accountId
    });
    let sentMessages = [];
    let indexInfo = getIndexInfo(sentMsgNum, appInfo.sent.currentPage, appInfo.itemPerPage);
    if (indexInfo.toIndex>=indexInfo.fromIndex) {
        sentMessages = await contract.getSentMessages({
            accountId: window.accountId,
            fromIndex: indexInfo.fromIndex,
            toIndex: indexInfo.toIndex
        });
    }
    console.log("sentMessages", indexInfo, sentMessages);
    await updateDataMessages(sentMessages);
    
    // console.log("Sent:", sentMsgNum, sentMessages);
    appInfo.sent.messages = sentMessages;
    appInfo.sent.msgNum = sentMsgNum;
    showSentMessages(sentMsgNum, sentMessages);
    await updateStaticInfoUI();
}

// Sort messages so that recent messages show first
function sortMessages(messages) {
    if (!messages) return;

    messages.sort(function(item1, item2) {
        return item2.timestamp - item1.timestamp;
    });
}

function getPageLinkStr(type, msgNum) {
    let page = "Page: ";
    let currentPage = appInfo[type].currentPage;
    let pageNum = 0;
    if (msgNum>0) {
        pageNum = Math.trunc((msgNum - 1)/appInfo.itemPerPage) + 1;
    }
    if (pageNum<=0) return "";

    for (let idx=1; idx<=pageNum; idx++) {
        if (idx==currentPage) {
            page += `${idx} `;
        } else {
            page += `<a href="#" class="sms-link" onclick="onPageChange('${type}', ${idx});">${idx}</a> `
        }
    }

    return page;
}

function messageItemToHtml(type, msg) {
    let itemHtml = "";
    if (type=="inbox") {
        itemHtml += `<b>From:</b> ${msg.from}`;
    } else if (type=="sent") {
        itemHtml += `<b>To:</b> ${msg.to}`;
    } else {
        itemHtml += `<b>From:</b> ${msg.from}`;
        itemHtml += `<br /><b>To:</b> ${msg.to}`;
    }
    itemHtml += `<br /><b>Time:</b> ${(new Date(msg.timestamp/10**6)).toLocaleString()}`;
    itemHtml += `<br /><b>Title:</b> ${msg.msgData.title}`;
    itemHtml += `<br /><b>Content:</b>`;
    itemHtml += `<div style="padding:5px">${standardHtmlData(msg.msgData.content)}</div>`;
    return itemHtml;
}

// Show sent messages on UI
function showSentMessages(sentMsgNum, sentMessages) {
    // Show number of items
    let fromPosition = (appInfo.sent.currentPage-1)*appInfo.itemPerPage + 1;
    let toPosition = fromPosition + sentMessages.length - 1;
    if (fromPosition<=toPosition) {
        document.querySelector('#bodyTitleInfo').innerText = `(${fromPosition}-${toPosition}/${sentMsgNum})`;
    } else {
        document.querySelector('#bodyTitleInfo').innerText = "";
    }

    // Show sent items
    let html = "";
    sortMessages(sentMessages);
    for (let idx=0; idx<sentMessages.length; idx++) {
        let msg = sentMessages[idx];
        let itemHtml = `<div id="sentMsg-${idx}" class="msgItem${idx%2}">`;
        itemHtml += messageItemToHtml('sent', msg);
        if (msg.prevMsgItem) {
            itemHtml += `<div class="seperatorInMessage"></div>`;
            itemHtml += "<div class='originMessage'>" + messageItemToHtml('all', msg.prevMsgItem) + "</div>";
        }
        if (msg.id>0) {
            itemHtml += `<div class="seperatorInMessage"></div>`;
            itemHtml += `<a href="#" onclick="replyMessage('sent', ${idx})" style="font-weight:bold;color:navy">Reply</a> &nbsp; <a href="#" onclick="forwardMessage('sent', ${idx})" style="font-weight:bold;color:navy">Forward</a>`;
        }
        itemHtml += "</div>";
        html += itemHtml;
    }
    if (sentMessages.length>0) {
        document.querySelector('#sentMessages').innerHTML = html;
    } else {
        document.querySelector('#sentMessages').innerHTML = "You haven't sent any message.<br />Do you want to send a message to someone? Please click <a href='#' onclick='onClickMenuItem(\"compose\");'>here</a> to start!!!";   
    }

    // Show page
    document.querySelector('#pagingInfo').innerHTML = getPageLinkStr("sent", sentMsgNum);
}

// Show inbox messages to UI
function showInboxMessages(inboxMsgNum, inboxMessages) {
    // Show number of items
    let fromPosition = (appInfo.inbox.currentPage-1)*appInfo.itemPerPage + 1;
    let toPosition = fromPosition + inboxMessages.length - 1;
    if (toPosition>=fromPosition) {
        document.querySelector('#bodyTitleInfo').innerText = `(${fromPosition}-${toPosition}/${inboxMsgNum})`;
    } else {
        document.querySelector('#bodyTitleInfo').innerText = "";
    }

    // Show inbox items
    let html = "";
    sortMessages(inboxMessages);
    for (let idx=0; idx<inboxMessages.length; idx++) {
        let msg = inboxMessages[idx];
        let itemHtml = `<div id="inboxMsg-${idx}" class="msgItem${idx%2}">`;
        itemHtml += messageItemToHtml('inbox', msg);
        if (msg.prevMsgItem) {
            itemHtml += `<div class="seperatorInMessage"></div>`;
            itemHtml += "<div class='originMessage'>" + messageItemToHtml('all', msg.prevMsgItem) + "</div>";
        }
        if (msg.id>0) {
            itemHtml += `<div class="seperatorInMessage"></div>`;
            itemHtml += `<a href="#" onclick="replyMessage('inbox', ${idx})" style="font-weight:bold;color:navy">Reply</a> &nbsp; <a href="#" onclick="forwardMessage('inbox', ${idx})" style="font-weight:bold;color:navy">Forward</a>`;
        }
        itemHtml += "</div>";
        html += itemHtml;
    }
    if (inboxMessages.length>0) {
        document.querySelector('#inboxMessages').innerHTML = html;
    } else {
        document.querySelector('#inboxMessages').innerHTML = "You have no message.<br />Do you want to send a message to someone? Please click <a href='#' onclick='onClickMenuItem(\"compose\");'>here</a> to start!!!";   
    }

    // Show page
    document.querySelector('#pagingInfo').innerHTML = getPageLinkStr("inbox", inboxMsgNum);
}

async function updateComposeUI(action, msgType, msgIndex) {
    // Show compose block and hide others
    document.querySelector('#inboxMessages').style.display = 'none';
    document.querySelector('#sentMessages').style.display = 'none';
    document.querySelector('#newMsgBoard').style.display = 'block';

    // Update title
    // console.log(msgType, msgIndex, appInfo[msgType])
    let msgItem = (msgType && msgIndex!=null && msgIndex>=0?appInfo[msgType].messages[msgIndex]:null);
    if (!msgItem) action = "none";
    document.querySelector('input#originMsgId').value = (msgItem?msgItem.id:0);
    if (action=="reply") {
        document.querySelector('#bodyTitle').innerText = "Reply the message";
        document.querySelector('input#toAccount').value = (msgType=="inbox"?msgItem.from:msgItem.to);
        document.querySelector('input#title').value = "Re: " + msgItem.msgData.title;
        document.querySelector('#originMessage').style.display = "block";
        document.querySelector('#originMessageContent').innerHTML = messageItemToHtml(msgType, msgItem);
    } else if (action=="forward") {
        document.querySelector('#bodyTitle').innerText = "Forward the message";
        document.querySelector('input#toAccount').value =  "";
        document.querySelector('input#title').value = "Fw: " + msgItem.msgData.title;
        document.querySelector('#originMessage').style.display = "block";
        document.querySelector('#originMessageContent').innerHTML = messageItemToHtml(msgType, msgItem);
    } else {
        document.querySelector('#bodyTitle').innerText = "Compose new message";
        document.querySelector('input#title').value = "";
        document.querySelector('input#toAccount').value = "";
        document.querySelector('#originMessage').style.display = "none";
    }
    document.querySelector('#bodyTitleInfo').innerText = "";
    document.querySelector('#pagingInfo').innerHTML = "";
    document.querySelector('textarea#content').value = "";

    // Update statics
    await updateStaticInfoUI();
}

async function updateStaticInfoUI() {
    // Get statics information
    let staticsInfo = await contract.getStatics();
    if (!staticsInfo) {
        staticsInfo = {
            messageNum: 0,
            sentAccountNum: 0,
            inboxAccountNum: 0,
            accountNum: 0,
        };
    }
    // console.log("staticsInfo", staticsInfo);

    // Update to UI
    document.querySelector('#staticsInfo').innerHTML = `<b>Statics</b>: ${staticsInfo.sentAccountNum} used accounts, ${staticsInfo.accountNum} total accounts and ${staticsInfo.messageNum} messages`;
}

// `nearInitPromise` gets called on page load
window.nearInitPromise = initContract()
    .then(() => {
        if (window.walletConnection.isSignedIn()) signedInFlow()
        else signedOutFlow()
    })
    .catch(console.error)
