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
    confirmReGenKeyModal: false,
    confirmReGenKey: false,
    confirmPasswordModal: false,
    checkClickReGen: false,
    checkClickReImport: false,

    messageConversation: {
      msgInboxId: null,
    },

    inboxMsgNum: 0,
    sentMsgNum: 0,

    page: 1,
    preventPagination: false,

    inboxSearchKeyword: "",
    sentSearchKeyword: "",
  },

  mutations: {
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
    TOGGLE_CONFIRM_PASSWORD_MODAL(state) {
      state.confirmPasswordModal = !state.confirmPasswordModal;
    },
    TOGGLE_CONFIRM_RE_GEN_KEY_MODAL(state, payload) {
      state.confirmReGenKeyModal = !state.confirmReGenKeyModal;
      if (payload === true) {
        state.confirmReGenKey = payload;
      } else state.confirmReGenKey = false;
    },
    TOGGLE_CHECK_CLICK_RE_GEN(state, payload) {
      state.checkClickReGen = payload;
    },
    TOGGLE_CHECK_CLICK_RE_IMPORT(state, payload) {
      state.checkClickReImport = payload;
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
