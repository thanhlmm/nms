beforeAll(async function () {
    // NOTE: nearlib and nearConfig are made available by near-cli/test_environment
    const near = await nearlib.connect(nearConfig);
    window.accountId = nearConfig.contractName;
    window.contract = await near.loadContract(nearConfig.contractName, {
        viewMethods: ['getSentMessages', 'getInboxMessages', 'getSentMsgNum', 'getInboxMsgNum', 'getStatics', 'getMessage'],
        changeMethods: ['sendMessage'],
        sender: window.accountId
    })
    console.log("nearConfig.contractName:", nearConfig.contractName);
})

test('Send Message', async () => {
    let fromAccount = window.accountId;
    let toAccount = 'abc.testnet';
    console.log("fromAccount:", fromAccount);
    let ret = await window.contract.sendMessage({
        to: toAccount,
        title: "Test",
        data: 'QmcT7Jwz5Ckt7dfnMdcNsvRiYEf3H5xn8No5JkqoKPP3uy',
        prevMsgId: 0,
        baseSite: 'https://nms.kiemtienonline360.com'
    });
    console.log("Send message return:", ret);
    console.log(`sentMsgNum of ${fromAccount}: ${await window.contract.getSentMsgNum({accountId: fromAccount})}`);
    console.log(`inboxMsgNum of ${toAccount}: ${await window.contract.getInboxMsgNum({accountId: toAccount})}`);
    console.log("Sent Message", await window.contract.getSentMessages({
        accountId: fromAccount,
        fromIndex: 0,
        toIndex: 0
    }));
    console.log("Inbox Message", await window.contract.getInboxMessages({
        accountId: toAccount,
        fromIndex: 0,
        toIndex: 0
    }));
    console.log("Message[0]", await window.contract.getMessage({
        msgId: 1
    }));
    console.log("Statics", await window.contract.getStatics());
})