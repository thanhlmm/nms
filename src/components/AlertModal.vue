<template>
  <transition name="slide" appear>
    <div class="modal" v-if="showModal">
      <h2>Whoa! Take it easy</h2>
      <div class="content">
        The account <span>{{ nameTo }}</span> is not existed.
        <div>Please enter the other account!</div>
      </div>

      <button
        class="btn-sent cursor-pointer d-flex align-center flex-shrink-0"
        @click="handleCloseModal"
      >
        <span>Got it!</span>
      </button>
    </div>
  </transition>
</template>

<script>
export default {
  computed: {
    showModal() {
      return this.$store.state.alertModal.isShow;
    },
    nameTo() {
      return this.$store.state.alertModal.name;
    },
  },
  methods: {
    handleCloseModal() {
      this.$store.commit("TOGGLE_ALERT_MODAL", "");
    },
  },
};
</script>

<style lang="scss" scoped>
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;

  width: 100%;
  max-width: 450px;
  background: var(--background-modal);
  border-radius: 16px;

  padding: 25px;
  color: var(--color-menu);

  display: flex;
  flex-direction: column;
  align-items: center;

  .content {
    margin-bottom: 15px;
    text-align: center;
    span {
      color: var(--color-title-mail-detail);
    }
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s ease, opacity 0.2s ease-in-out;
}

.slide-enter {
  transform: translateX(-50%) translateY(-25px);
  opacity: 1;
}
.slide-leave-to {
  transform: translateX(-50%) translateY(0px);
  opacity: 0;
}
</style>
