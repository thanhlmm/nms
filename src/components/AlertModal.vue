<template>
  <transition name="slide" appear>
    <div class="modal" v-if="showModal">
      <h2>Whoa! Take it easy</h2>
      <div class="content">
        The account <span>{{ nameTo }}</span> is not existed.
        <div>Please enter the other account!</div>
      </div>
      <button
        class="
          btn-sent btn-confirm-sent
          cursor-pointer
          d-flex
          align-center
          flex-shrink-0
        "
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

  background: var(--background-modal);
  border: 1px solid var(--border-modal);
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-box-shadow: var(--body-box-shadow);
  -moz-box-shadow: var(--body-box-shadow);
  box-shadow: var(--body-box-shadow);
  -webkit-border-radius: 8px;
  -moz-border-radius: 8px;
  border-radius: 8px;

  @media (max-width: 767px) {
    width: 350px;
  }
  .content {
    margin-bottom: 15px;
    text-align: center;
    span {
      color: var(--color-title-mail-detail);
    }
  }
  .btn-confirm-sent {
    width: auto;
    span {
      width: 100%;
      text-align: center;
      margin-right: 20px;
    }
    @media (max-width: 767px) {
      width: 100%;
      span {
        font-size: 16px;
      }
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
