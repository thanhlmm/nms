import 'regenerator-runtime/runtime'

import { initContract, login, logout } from './utils'

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

const submitButton = document.querySelector('form button')

document.querySelector('form').onsubmit = async (event) => {
    event.preventDefault()

    // get elements from the form using their id attribute
    const { toAccount, title, content } = event.target.elements

    // disable the save button, since it now matches the persisted value
    submitButton.disabled = true

    // send message
    await sendMessage(toAccount.value, title.value, content.value);

    // update the messages in the UI
    await fetchMessages();

    // show notification
    document.querySelector('[data-behavior=notification]').style.display = 'block'

    // remove notification again after css animation completes
    // this allows it to be shown again next time the form is submitted
    setTimeout(() => {
        document.querySelector('[data-behavior=notification]').style.display = 'none'
    }, 11000)
}

document.querySelector('input#toAccount').oninput = (event) => { checkSubmitButton(); }
document.querySelector('input#title').oninput = (event) => { checkSubmitButton(); }
document.querySelector('input#content').oninput = (event) => { checkSubmitButton(); }

document.querySelector('#sign-in-button').onclick = login;
document.querySelector('#sign-out-button').onclick = logout;
document.querySelector('#btnShowHideNewMsg').onclick = showHideNewMsg;

function checkSubmitButton() {
    let value1 = document.querySelector('input#toAccount').value;
    let value2 = document.querySelector('input#title').value;
    let value3 = document.querySelector('input#content').value;

    if (value1 && value2 && value3) {
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
    }
}

function showHideNewMsg() {
    let obj = document.querySelector('#btnShowHideNewMsg');
    let msgBoard = document.querySelector('#newMsgBoard');
    if (msgBoard.style.display=="none") {
        msgBoard.style.display = "block";
        obj.innerHTML = "&#9195;";
    } else {
        msgBoard.style.display = "none";
        obj.innerHTML = "&#9196;";
    }
}

// Display the signed-out-flow container
function signedOutFlow() {
    document.querySelector('#signed-out-flow').style.display = 'block'
}

// Displaying the signed in flow container and fill in account-specific data
function signedInFlow() {
    document.querySelector('#signed-in-flow').style.display = 'block'

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

    fetchMessages()
}

async function sendMessage(toAccount, title, content) {
    await contract.sendMessage({
        to: toAccount,
        title: title,
        content: content
    });
}

async function fetchMessages() {
    let viewMsgNum = 5;
    let sentMsgNum = await contract.getSentMsgNum({
        accountId: window.accountId
    });
    let sentMessages = await contract.getSentMessages({
        accountId: window.accountId,
        fromIndex: sentMsgNum - viewMsgNum,
        toIndex: sentMsgNum - 1
    });
    // console.log("Sent:", sentMsgNum, sentMessages);
    showSentMessages(sentMsgNum, sentMessages);

    let inboxMsgNum = await contract.getInboxMsgNum({
        accountId: window.accountId
    });
    let inboxMessages = await contract.getInboxMessages({
        accountId: window.accountId,
        fromIndex: inboxMsgNum - viewMsgNum,
        toIndex: inboxMsgNum - 1
    });
    // console.log("Inbox:", inboxMsgNum, inboxMessages);
    showInboxMessages(inboxMsgNum, inboxMessages);
}

function sortMessages(messages) {
    if (!messages) return;

    messages.sort(function(item1, item2) {
        return item2.timestamp - item1.timestamp;
    });
}

function showSentMessages(sentMsgNum, sentMessages) {
    document.querySelector('#sentInfo').innerHTML = `(${sentMessages.length}/${sentMsgNum})`;
    let html = "";
    sortMessages(sentMessages);
    for (let idx=0; idx<sentMessages.length; idx++) {
        let msg = sentMessages[idx];
        let itemHtml = `<div id="sentMsg-${idx}" class="msgItem${idx%2}">`;
        itemHtml += `<b>To:</b> ${msg.to}`;
        itemHtml += `<br /><b>Time:</b> ${(new Date(msg.timestamp/10**6)).toLocaleString()}`;
        itemHtml += `<br /><b>Title:</b> ${msg.title}`;
        itemHtml += `<br /><b>Content:</b>`;
        itemHtml += `<br />${msg.content}`;
        itemHtml += "</div>";
        html += itemHtml;
    }
    document.querySelector('#sentMessages').innerHTML = html;
}

function showInboxMessages(inboxMsgNum, inboxMessages) {
    document.querySelector('#inboxInfo').innerHTML = `(${inboxMessages.length}/${inboxMsgNum})`;
    let html = "";
    sortMessages(inboxMessages);
    for (let idx=0; idx<inboxMessages.length; idx++) {
        let msg = inboxMessages[idx];
        let itemHtml = `<div id="inboxMsg-${idx}" class="msgItem${idx%2}">`;
        itemHtml += `<b>From:</b> ${msg.from}`;
        itemHtml += `<br /><b>Time:</b> ${(new Date(msg.timestamp/10**6)).toLocaleString()}`;
        itemHtml += `<br /><b>Title:</b> ${msg.title}`;
        itemHtml += `<br /><b>Content:</b>`;
        itemHtml += `<br />${msg.content}`;
        itemHtml += "</div>";
        html += itemHtml;
    }
    document.querySelector('#inboxMessages').innerHTML = html;
}

// `nearInitPromise` gets called on page load
window.nearInitPromise = initContract()
    .then(() => {
        if (window.walletConnection.isSignedIn()) signedInFlow()
        else signedOutFlow()
    })
    .catch(console.error)
