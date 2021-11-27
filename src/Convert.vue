<template>
  <div>
    <div class="wrapper">
      <div class="content-area">
        <Sidebar />
        <MailContent />
      </div>
      <FooterMobile />
    </div>
    <SentMessageModal />
  </div>
</template>

<script>
import Sidebar from "./components/Sidebar.vue";
import MailContent from "./components/MailContent.vue";
import FooterMobile from "./components/FooterMobile.vue";
import SentMessageModal from "./components/SentMessageModal.vue";

export default {
  components: {
    Sidebar,
    MailContent,
    FooterMobile,
    SentMessageModal,
  },
};
</script>

<style lang="scss" scoped>
</style>