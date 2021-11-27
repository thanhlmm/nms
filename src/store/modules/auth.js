const state = {
  auth: {
    isLogin: window.walletConnection
      ? window.walletConnection.isSignedIn()
      : false,
  },
};

const getters = {};

const actions = {};

const mutations = {
  SET_AUTH(state, payload) {
    state.auth.isLogin = payload;
  },
};

export default { state, getters, actions, mutations };
