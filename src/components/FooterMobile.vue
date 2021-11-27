<template>
  <footer class="footer-mobile flex-sm is-hidden">
    <button class="btn-toggle-menu" @click="handleActiveMobileMenu">
      <img src="../../public/assets/images/toggle.svg" />
    </button>
    <div class="mail-left__menu d-flex align-center pl-20">
      <div @click="handleResetSelectedMailId()">
        <router-link
          to="/inbox"
          class="mail-left__menu-item d-flex align-center justify-between"
          :class="{ active: routePathInbox }"
        >
          <span class="d-flex align-center">
            <img
              src="../../public/assets/images/inbox.svg"
              class="flex-shrink-0"
            />
            <span class="ml-10 title">Inbox</span>
          </span>
          <span class="letter-spacing-5 pl-10">{{ inboxMsgNum }}</span>
        </router-link>
      </div>
      <div @click="handleResetSelectedMailId()">
        <router-link
          to="/sent"
          class="mail-left__menu-item d-flex align-center justify-center ml-4"
          :class="{ active: routePathSent }"
        >
          <span class="d-flex align-center">
            <img
              src="../../public/assets/images/sent.svg"
              class="flex-shrink-0"
            />
            <span class="ml-10 title">Sent</span>
          </span>
          <span class="letter-spacing-5 pl-10">{{ sentMsgNum }}</span>
        </router-link>
      </div>
    </div>

    <div class="mail-content__button">
      <div>
        <span
          class="mail-content__button-prev cursor-pointer mr-4 mr-sm-16"
          @click="page > 1 && prevPage()"
        ></span>
        <span
          class="mail-content__button-next cursor-pointer"
          @click="nextPage()"
        ></span>
      </div>
    </div>

    <button
      class="btn-mail btn-mail__sent btn-compose__footer cursor-pointer"
      @click="handleSendMessageModal"
    >
      <span class="btn-mail__wrap d-flex align-center justify-center">
        <img
          src="../../public/assets/images/compose.svg"
          class="logo-dark flex-shrink-0"
        />
        <img
          src="../../public/assets/images/compose-light.svg"
          class="logo-light flex-shrink-0"
        />
        <span
          class="title-16 f-700 letter-spacing-5 color-white ml-20 ml-sm-10"
        >
          COMPOSE</span
        >
      </span>
    </button>
  </footer>
</template>

<script>
export default {
  data() {
    return {
      isRoute: false,
    };
  },
  mounted() {},
  computed: {
    username() {
      return window.walletConnection.getAccountId();
    },
    sentMsgNum() {
      return this.$store.state.sentMsgNum;
    },
    inboxMsgNum() {
      return this.$store.state.inboxMsgNum;
    },
    routePathSent() {
      return this.$route.path === "/sent";
    },
    routePathInbox() {
      return this.$route.path === "/inbox" || this.$route.path === "/";
    },
    page() {
      return this.$store.state.page;
    },
  },
  methods: {
    handleActiveMobileMenu() {
      this.$store.commit("TOGGLE_ACTIVE_MOBILE_MENU");

      if (!this.$store.state.sendMessageModal.isShow) return;
      this.$store.commit("TOGGLE_SEND_MESSAGE_MODAL");
    },
    handleSendMessageModal() {
      this.$store.commit("TOGGLE_SEND_MESSAGE_MODAL");
    },
    handleResetSelectedMailId() {
      this.$store.commit("RESET_MESSAGE_CONVERSATION", null);
    },
    nextPage() {
      this.$store.commit("SET_PAGE", this.page + 1);
    },
    prevPage() {
      this.$store.commit("SET_PAGE", this.page - 1);
    },
  },
};
</script>

<style lang="scss" scoped></style>
