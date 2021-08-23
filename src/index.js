import 'regenerator-runtime/runtime'

import { initContract, login, logout, isAccountExist } from './utils';

import getConfig from './config';
// const { networkId } = getConfig(process.env.NODE_ENV || 'development');
const { networkId } = getConfig('development');

const submitButton = document.querySelector('form button');
let appInfo = {
    currentMenu: "INBOX",
    itemPerPage: 5,
    inbox: {
        currentPage: 1,
    },
    sent: {
        currentPage: 1
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

document.querySelector('form').onsubmit = async (event) => {
    event.preventDefault()

    // get elements from the form using their id attribute
    const { toAccount, title, content } = event.target.elements

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

    // disable the save button, since it now matches the persisted value
    submitButton.disabled = true

    // send message
    await sendMessage(toAccount.value, title.value, content.value);

    // reset message box
    resetNewMsgBox();

    // show notification
    document.querySelector('[data-behavior=notification]').style.display = 'block'

    // remove notification again after css animation completes
    // this allows it to be shown again next time the form is submitted
    setTimeout(() => {
        document.querySelector('[data-behavior=notification]').style.display = 'none'
    }, 11000);

    // update the messages in the UI
    await updateAppUI();
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

function removeScriptTag(text) {
    text = text.replace(/<script[^>]*>(?:(?!<\/script>)[^])*<\/script>/gi, "");
    text = text.replace(/<iframe[^>]*>(?:(?!<\/iframe>)[^])*<\/iframe>/gi, "");
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
    const accountLink = document.querySelector('[data-behavior=notification] a:nth-of-type(1)')
    accountLink.href = accountLink.href + window.accountId
    accountLink.innerText = '@' + window.accountId
    const contractLink = document.querySelector('[data-behavior=notification] a:nth-of-type(2)')
    contractLink.href = contractLink.href + window.contract.contractId
    contractLink.innerText = '@' + window.contract.contractId

    // update with selected networkId
    accountLink.href = accountLink.href.replace('testnet', networkId)
    contractLink.href = contractLink.href.replace('testnet', networkId)

    updateAppUI();
}

// Send new message
async function sendMessage(toAccount, title, content) {
    return await contract.sendMessage({
        to: toAccount,
        title: title,
        content: content
    });
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
    //console.log("Inbox:", inboxMsgNum, inboxMessages);
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
    
    // console.log("Sent:", sentMsgNum, sentMessages);
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
            page += `<a href="#" onclick="onPageChange('${type}', ${idx});">${idx}</a> `
        }
        
    }

    return page;
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
        itemHtml += `<b>To:</b> ${msg.to}`;
        itemHtml += `<br /><b>Time:</b> ${(new Date(msg.timestamp/10**6)).toLocaleString()}`;
        itemHtml += `<br /><b>Title:</b> ${msg.title}`;
        itemHtml += `<br /><b>Content:</b>`;
        itemHtml += `<br />${removeScriptTag(msg.content)}`;
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
        itemHtml += `<b>From:</b> ${msg.from}`;
        itemHtml += `<br /><b>Time:</b> ${(new Date(msg.timestamp/10**6)).toLocaleString()}`;
        itemHtml += `<br /><b>Title:</b> ${msg.title}`;
        itemHtml += `<br /><b>Content:</b>`;
        itemHtml += `<br />${removeScriptTag(msg.content)}`;
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

async function updateComposeUI() {
    // Show compose block and hide others
    document.querySelector('#inboxMessages').style.display = 'none';
    document.querySelector('#sentMessages').style.display = 'none';
    document.querySelector('#newMsgBoard').style.display = 'block';

    // Update title
    document.querySelector('#bodyTitle').innerText = "Compose new message";
    document.querySelector('#bodyTitleInfo').innerText = "";
    document.querySelector('#pagingInfo').innerHTML = "";

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
