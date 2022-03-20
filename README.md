# NEAR Messaging Service (NMS)

NEAR MESSAGING SERVICE (NMS) is convenient service that makes it simple, easy, and secure for NEAR accounts to exchange messages with each other. The system is completely decentralized and takes advantage of the advantages and power of the NEAR Protocol. Please see detail at [NMS Official Website][[nms-website]].

# How to run the NMS locally

1. Prerequisites:
 - Make sure you've installed [Node.js] ≥ 14
 - And then install yarn: `npm install --global yarn`
 - On Ubuntu, you may need to install additional tools to build some libraries: `apt-get install build-essential`
 - On Window, you may need to install additional tools: Cygwin or MsBuild.
2. Clone the project from github and change directory to nms foler
3. Install dependencies: `yarn install`
4. Build contract: `yarn build:contract`
5. Deploy dev contract: `dev:deploy:contract`
   You will see the contract account in log.
   You can use near-cli command line to call to the contract.
6. Run the local development server
   Open the file .env and set value for key `VUE_APP_CONTRACT_NAME` by above contract account.
   And then run `yarn fe`
   Now you can view http://localhost:8080 have a local development environment!

Go ahead and play with the app and the code. As you make code changes, the app will automatically reload.

# How to deploy the NMS Contract
1. Connect to the NEAR account
  Install near-cli by command: `npm i -g near-cli`
  Run `near login` and connect to main NEAR account. The account we use is nearmessage.testnet
2. Create sub account from main NEAR account to receive fee from the app
  `near create-account fee.nearmessage.testnet --masterAccount nearmessage.testnet --initialBalance 0.01`
3. Create sub account from main NEAR account to deploy the contract
  `near create-account app.nearmessage.testnet --masterAccount nearmessage.testnet --initialBalance 100`
4. Build the contract
  `yarn build:contract`
5. Deploy the contract
  `near deploy --accountId app.nearmessage.testnet --wasmFile ./out/main.wasm`
6. Config the contract
   Run below commands to config the contract:
   `near call app.nearmessage.testnet setOwnerAddress '{"address": "nearmessage.testnet"}' --accountId nearmessage.testnet`
   `near call app.nearmessage.testnet setFeeAddress '{"address": "fee.nearmessage.testnet"}' --accountId nearmessage.testnet`

   And run below command to check:
   `near view app.nearmessage.testnet getStatics '{}' --accountId nearmessage.testnet`

# How to deploy the NMS Frontend
1. Config the file .env
   Open the file .env and set value for key `VUE_APP_CONTRACT_NAME` by the NMS contract: app.nearmessage.testnet
2. Build the NMS frontend
   Delete dist folder and run below command:
   `yarn build-fe`
   Now, you can upload all files in dist folder to your host. Sometimes you may need to configure more in your server, please see [Server Configurations][vuejs-example-server-configurations]

[nms-website]: https://nearmessage.com/
[vuejs-example-server-configurations] https://router.vuejs.org/guide/essentials/history-mode.html#example-server-configurations