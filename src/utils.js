import { connect, Contract, keyStores, WalletConnection } from "near-api-js";
import getConfig from "./config";
import Big from "big.js";

const nearConfig = getConfig("development");

export const BOATLOAD_OF_GAS = (60 * 10 ** 12).toFixed();
export const NEAR_UNIT = 10 ** 24;

export const tranformUnit = (input) =>
  Big(input || "0")
    .times(10 ** 24)
    .toFixed();

let nearConnection = null;

export const convertUnit = (input) =>
  Big(input || "0")
    .div(10 ** 24)
    .toFixed(4);

// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect(
    Object.assign(
      { deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } },
      nearConfig
    )
  );
  nearConnection = near;

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near);

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId();

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(
    window.walletConnection.account(),
    nearConfig.contractName,
    {
      // View methods are read only. They don't modify the state, but usually return some value.
      viewMethods: [
        "getStaticsInfo",
        "getSentMsgNum",
        "getSentMessages",
        "getInboxMsgNum",
        "getInboxMessages",
        "getMessage",
        "getStatics",
        "getPublicKey",
      ],
      // Change methods can modify the state. But you don't receive the returned value when called.
      changeMethods: ["sendMessage", "updatePublicKey", "sendBack"],
    }
  );
}

export function logout() {
  window.walletConnection.signOut();
  // reload page
  window.location.replace(window.location.origin + window.location.pathname);
}

export function login() {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  window.walletConnection.requestSignIn(nearConfig.contractName);
}

export function getIndexInfo(messageNum, currentPage, itemPerPage) {
  let ret = {
    fromIndex: 0,
    toIndex: -1,
  };
  if (messageNum > 0) {
    if (messageNum < itemPerPage) {
      ret.fromIndex = 0;
      ret.toIndex = messageNum - 1;
    } else {
      // Page 1 corresponding the lastest messages
      ret.toIndex = messageNum - 1 - (currentPage - 1) * itemPerPage;
      ret.fromIndex = ret.toIndex - itemPerPage + 1;
      if (ret.fromIndex < 0) {
        ret.fromIndex = 0;
      }
    }
  }
  return ret;
}

export function getAvatar(accountId, callback) {
  try {
    const data = `{
          "contract": "alpha.neatar.testnet",
          "method": "avatar_of",
          "params": { "account_id": "${accountId}" },
          "rpc_node": "https://rpc.testnet.near.org"
      }`;
    const url = "https://rest.nearapi.org/view";
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        callback(xhr.responseText);
      }
    };
    xhr.send(data);
  } catch (ex) {
    console.error("Unable to get avatar", ex);
    callback(null);
  }
}

// https://docs.near.org/docs/concepts/transaction
export async function isAccountExist(accountId) {
  let ret = false;
  try {
    await nearConnection.connection.provider.query(`account/${accountId}`, "");
    ret = true;
  } catch (ex) {
    console.error(ex);
  }
  return ret;
}
