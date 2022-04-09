<template>
  <transition name="slide" appear>
    <div class="modal" v-if="showModalConfirm">
      <div class="header d-flex align-center justify-between mb-20">
        <div class="title title-20 f-700 d-flex align-center">
          Enter password for private message
        </div>
        <div class="action">
          <span class="btn-close cursor-pointer" @click="handleCloseModal">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.14209 16.1426L16.2842 2.00044"
                stroke="#888A90"
                stroke-width="3"
                stroke-linecap="round"
              />
              <path
                d="M2.14209 2L16.2842 16.1421"
                stroke="#888A90"
                stroke-width="3"
                stroke-linecap="round"
              />
            </svg>
          </span>
        </div>
      </div>

      <div class="container">
        <div class="form-input d-flex pb-10 mb-20">
          <span :class="[{ isEmptyText: checkPasswordInput }]">Password:</span>
          <input
            placeholder="Enter your password"
            type="password"
            v-model="password"
            @keydown="handleCheckEnter"
          />
          <div class="line" :class="[{ isEmpty: checkPasswordInput }]"></div>
        </div>

        <button
          class="
            btn-sent btn-sent-key
            cursor-pointer
            d-flex
            align-center
            justify-center
            flex-shrink-0
          "
          @click="handleConfirm"
        >
          <img src="../../public/assets/images/sent.svg" />
          <span>Confirm</span>
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    showModalConfirm: {
      type: Boolean,
    },
    onPasswordConfirm: {
      type: Function,
    },
  },
  data() {
    return {
      password: "",
      checkPasswordInput: false,
    };
  },
  methods: {
    handleCloseModal() {
      this.$emit("toggleConfirmPasswordModal", false);
      this.password = "";
    },

    handleCheckEnter(e) {
      if (e.keyCode === 13) {
        this.handleConfirm();
      }
    },

    handleConfirm() {
      if (this.password === "") {
        this.checkPasswordInput = true;
      } else {
        this.checkPasswordInput = false;
        if (this.onPasswordConfirm) {
          this.onPasswordConfirm(this.password);
        }
        this.handleCloseModal();
      }
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
  max-width: 480px;
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
  .header {
    width: 100%;
    .title {
      color: var(--color-title-mail-detail);
    }
  }
  .container {
    width: 100%;
    .btn-sent-key {
      width: auto;
      span {
        width: auto;
        text-align: left;
      }
      @media (max-width: 767px) {
        width: 100%;
        span {
          width: 30%;
          font-size: 16px;
        }
      }
    }
    .form-input {
      font-size: 16px;
      line-height: 22px;
      position: relative;
    }
    .form-input .line {
      content: " ";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 1px;
      background: var(--main-color);
      -webkit-transform: scaleY(0.5);
      -moz-transform: scaleY(0.5);
      -ms-transform: scaleY(0.5);
      -o-transform: scaleY(0.5);
      transform: scaleY(0.5);
    }
    .form-input span {
      color: var(--color-mail-item);
    }
    .form-input input {
      background: transparent;
      width: 60%;
      border: 0;
      color: var(--color-menu);
      padding-left: 20px;
      font-size: 16px;
      line-height: 22px;
      font-weight: 700;
    }
    .form-input input::-webkit-input-placeholder {
      font-weight: 500;
    }
    .form-input input:-moz-placeholder {
      font-weight: 500;
    }
    .form-input input::-moz-placeholder {
      font-weight: 500;
    }
    .form-input input:-ms-input-placeholder {
      font-weight: 500;
    }
    .form-input input::-ms-input-placeholder {
      font-weight: 500;
    }
    .form-input input::placeholder {
      font-weight: 500;
    }
    .form-input input:focus {
      outline: none;
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
.isEmpty {
  background: red !important;
}
.isEmptyText {
  color: red !important;
}
</style>
