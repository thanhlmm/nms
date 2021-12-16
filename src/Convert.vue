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
    <Overlay />
  </div>
</template>

<script>
import Sidebar from "./components/Sidebar.vue";
import MailContent from "./components/MailContent.vue";
import FooterMobile from "./components/FooterMobile.vue";
import SentMessageModal from "./components/SentMessageModal.vue";
import AlertModal from "./components/AlertModal.vue";
import Overlay from "./components/Overlay.vue";

export default {
  components: {
    Sidebar,
    MailContent,
    FooterMobile,
    SentMessageModal,
    AlertModal,
    Overlay,
  },
};
</script>

<style lang="scss" scoped>
.container {
  position: relative;
}
</style>
