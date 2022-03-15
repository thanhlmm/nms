import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

// import modules
import auth from "./modules/auth";

const storeData = {
  modules: {
    auth,
  },

  state: {
    darkMode: JSON.parse(localStorage.getItem("darkMode")),

    activeMobileMenu: false,

    sendMessageModal: {
      isShow: false,
      isExpand: false,
      isMinimize: false,
    },

    alertModal: {
      isShow: false,
      name: "",
    },

    keyModal: false,
    localPrivateKey: null,
    passwordConfirm: null,

    messageConversation: {
      msgInboxId: null,
    },

    inboxMsgNum: 0,
    sentMsgNum: 0,

    page: 1,
    preventPagination: false,

    inboxSearchKeyword: "",
    sentSearchKeyword: "",

    realTime: null,
  },

  mutations: {
    // GET REAL TIME
    SAVE_REAL_TIME(state, payload) {
      state.realTime = payload;
    },

    // ACTIVE DARK MODE MUTATION
    TOGGLE_DARK_MODE(state) {
      state.darkMode = !state.darkMode;
      localStorage.setItem("darkMode", JSON.stringify(state.darkMode));
    },

    // ACTIVE MOBILE HAMBURGER MUTATION
    TOGGLE_ACTIVE_MOBILE_MENU(state) {
      state.activeMobileMenu = !state.activeMobileMenu;
    },

    // SEND MESSAGE MODAL MUTATION
    TOGGLE_SEND_MESSAGE_MODAL(state) {
      state.sendMessageModal.isShow = !state.sendMessageModal.isShow;
    },
    TOGGLE_SEND_MESSAGE_MODAL_EXPAND(state) {
      state.sendMessageModal.isExpand = !state.sendMessageModal.isExpand;
    },
    TOGGLE_SEND_MESSAGE_MODAL_MINIMIZE(state) {
      state.sendMessageModal.isMinimize = !state.sendMessageModal.isMinimize;
    },

    // ALERT MODAL MUTATION
    TOGGLE_ALERT_MODAL(state, payload) {
      state.alertModal.isShow = !state.alertModal.isShow;
      state.alertModal.name = payload;
    },

    // KEY PRIVATE MANAGEMENT MUTATION
    TOGGLE_KEY_MODAL(state) {
      state.keyModal = !state.keyModal;
    },
    PASSWORD_CONFIRM(state, payload) {
      state.passwordConfirm = payload;
    },
    TOGGLE_PRIVATEKEY_LOCAL(state, { key, userName }) {
      state.localPrivateKey = key;
      localStorage.setItem(`${process.env.VUE_APP_CONTRACT_NAME}_${userName}_privatekey`, key);
    },

    // HANDLE MESSAGE MUTATION
    MESSAGE_CONVERSATION(state, msgId) {
      state.messageConversation.msgInboxId = msgId;
    },
    RESET_MESSAGE_CONVERSATION(state, id) {
      state.messageConversation.msgInboxId = id;
    },
    SET_INBOX_MSG_NUM(state, payload) {
      state.inboxMsgNum = payload;
    },
    SET_SENT_MSG_NUM(state, payload) {
      state.sentMsgNum = payload;
    },
    SET_PAGE(state, payload) {
      state.page = payload;
    },
    SET_PREVENT_PAGINATION(state, payload) {
      state.preventPagination = payload;
    },

    // SEARCH MUTATION
    SET_INBOX_SEARCH(state, payload) {
      state.inboxSearchKeyword = payload;
    },
    SET_SENT_SEARCH(state, payload) {
      state.sentSearchKeyword = payload;
    },
  },
};

const store = new Vuex.Store(storeData);

export default store;
