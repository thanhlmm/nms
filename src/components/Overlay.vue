<template>
  <transition name="fade" appear>
    <div
      class="modalOverlay"
      v-if="alertModal || keyModal || confirmPasswordModal"
    ></div>
  </transition>
</template>

<script>
export default {
  computed: {
    alertModal() {
      return this.$store.state.alertModal.isShow;
    },
    keyModal() {
      return this.$store.state.keyModal;
    },
    confirmPasswordModal() {
      return this.$store.state.confirmPasswordModal;
    },
  },
};
</script>

<style lang="scss" scoped>
.modalOverlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9998;
  background-color: rgba(0, 0, 0, 0.3);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
