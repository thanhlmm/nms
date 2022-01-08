<template>
  <div class="container">
    <div class="wrapper">
      <div class="content-area">
        <Sidebar />
        <MailContent />
      </div>
      <FooterMobile />
    </div>
    <SentMessageModal />
    <AlertModal />
    <KeyManagementModal />
    <ConfirmPasswordModal />
    <Overlay />
  </div>
</template>

<script>
import Sidebar from "./components/Sidebar.vue";
import MailContent from "./components/MailContent.vue";
import FooterMobile from "./components/FooterMobile.vue";
import SentMessageModal from "./components/SentMessageModal.vue";
import AlertModal from "./components/AlertModal.vue";
import KeyManagementModal from "./components/KeyManagementModal.vue";
import ConfirmPasswordModal from "./components/ConfirmPasswordModal.vue";
import Overlay from "./components/Overlay.vue";

export default {
  components: {
    Sidebar,
    MailContent,
    FooterMobile,
    SentMessageModal,
    AlertModal,
    KeyManagementModal,
    ConfirmPasswordModal,
    Overlay,
  },

  computed: {
    localPrivateKey() {
      return this.$store.state.localPrivateKey;
    },
  },

  mounted() {
    if (this.localPrivateKey) {
      this.$store.commit("TOGGLE_CONFIRM_PASSWORD_MODAL");
    }
  },
};
</script>

<style lang="scss" scoped>
.container {
  position: relative;
}
</style>
