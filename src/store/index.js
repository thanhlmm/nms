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

    messageConversation: {
      msgInboxId: null,
    },

    inboxMsgNum: 0,
    sentMsgNum: 0,

    page: 1,

    inboxSearchKeyword: "",
    sentSearchKeyword: "",
  },
  mutations: {
    TOGGLE_DARK_MODE(state) {
      state.darkMode = !state.darkMode;
      localStorage.setItem("darkMode", JSON.stringify(state.darkMode));
    },

    TOGGLE_ACTIVE_MOBILE_MENU(state) {
      state.activeMobileMenu = !state.activeMobileMenu;
    },

    TOGGLE_SEND_MESSAGE_MODAL(state) {
      state.sendMessageModal.isShow = !state.sendMessageModal.isShow;
    },
    TOGGLE_SEND_MESSAGE_MODAL_EXPAND(state) {
      state.sendMessageModal.isExpand = !state.sendMessageModal.isExpand;
    },
    TOGGLE_SEND_MESSAGE_MODAL_MINIMIZE(state) {
      state.sendMessageModal.isMinimize = !state.sendMessageModal.isMinimize;
    },

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
