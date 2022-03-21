# NEAR Messaging Service (NMS)

NEAR MESSAGING SERVICE (NMS) is convenient service that makes it simple, easy, and secure for NEAR accounts to exchange messages with each other. The system is completely decentralized and takes advantage of the advantages and power of the NEAR Protocol. Please see detail at [NMS Official Website](https://nearmessage.com/).

# How to run the NMS locally

1. Prerequisites:
<br />Make sure you've installed [Node.js] ≥ 14
<br />And then install yarn: `npm install --global yarn`
<br />On Ubuntu, you may need to install additional tools to build some libraries: `apt-get install build-essential`
<br />On Window, you may need to install additional tools: Cygwin or MsBuild.
2. Clone the project from github and change directory to nms foler
3. Install dependencies: `yarn install`
4. Build contract: `yarn build:contract`
5. Deploy dev contract: `dev:deploy:contract`
<br />You will see the contract account in log.
<br />You can use near-cli command line to call to the contract.
6. Run the local development server
<br />Open the file .env and set value for key `VUE_APP_CONTRACT_NAME` by above contract account.
<br />And then run `yarn fe`
<br />Now you can view http://localhost:8080 have a local development environment!
<br /><br />Go ahead and play with the app and the code. As you make code changes, the app will automatically reload.

# How to deploy the NMS Contract
1. Connect to the NEAR account
<br />Install near-cli by command: `npm i -g near-cli`
<br />Run `near login` and connect to main NEAR account. The account we use is nearmessage.testnet
2. Create sub account from main NEAR account to receive fee from the app
<br />`near create-account fee.nearmessage.testnet --masterAccount nearmessage.testnet --initialBalance 0.01`
3. Create sub account from main NEAR account to deploy the contract
<br />`near create-account app.nearmessage.testnet --masterAccount nearmessage.testnet --initialBalance 100`
4. Build the contract
<br />`yarn build:contract`
5. Deploy the contract
<br />`near deploy --accountId app.nearmessage.testnet --wasmFile ./out/main.wasm`
6. Config the contract
<br />Run below commands to config the contract:
<br />`near call app.nearmessage.testnet setOwnerAddress '{"address": "nearmessage.testnet"}' --accountId nearmessage.testnet`
<br />`near call app.nearmessage.testnet setFeeAddress '{"address": "fee.nearmessage.testnet"}' --accountId nearmessage.testnet`
<br /><br />And run below command to check:
<br />`near view app.nearmessage.testnet getStatics '{}' --accountId nearmessage.testnet`

# How to deploy the NMS Frontend
1. Config the file .env
<br />Open the file .env and set value for key `VUE_APP_CONTRACT_NAME` by the NMS contract: `app.nearmessage.testnet`
2. Build the NMS frontend
<br />Delete dist folder and run below command:
<br />`yarn build-fe`
3. Upload to your host
<br />Now, you can upload all files in dist folder to your host.
<br />Sometimes you may need to configure more in your server, please see [Server Configurations](https://router.vuejs.org/guide/essentials/history-mode.html#example-server-configurations)
