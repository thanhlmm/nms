<template>
  <div id="root">
    <Convert />
    <ConfirmPasswordModal
      :showModalConfirm="showModalPassword"
      @toggleConfirmPasswordModal="toggleConfirmPasswordModal($event)"
      :onPasswordConfirm="onPasswordConfirm"
    />
  </div>
</template>

<script>
import "./global.css";
import getConfig from "./config";
import Convert from "./Convert.vue";
import ConfirmPasswordModal from "./components/ConfirmPasswordModal.vue";
import { decryptPrivateKeyWithPasswordConfirm } from "./message";

const nearConfig = getConfig(process.env.NODE_ENV || "development");
console.log(
  `networkId:${nearConfig.networkId} CONTRACT_NAME:${nearConfig.contractName}`
);
window.networkId = nearConfig.networkId;

export default {
  created() {
    document.title = "NEAR Messaging Service";
  },
  name: "App",
  components: {
    Convert,
    ConfirmPasswordModal,
  },

  data() {
    return {
      showModalPassword: false,
      onPasswordConfirm: () => {},
    };
  },

  computed: {
    isSignedIn() {
      return window.walletConnection.isSignedIn();
    },
    darkMode() {
      return this.$store.state.darkMode;
    },
    showAlertModal() {
      return this.$store.state.alertModal.isShow;
    },
    showKeyModal() {
      return this.$store.state.keyModal;
    },
    showConfirmPasswordModal() {
      return this.$store.state.confirmPasswordModal;
    },
    localPrivateKey() {
      return this.$store.state.localPrivateKey;
    },
  },

  methods: {
    toggleConfirmPasswordModal(e) {
      this.showModalPassword = e;
    },
    handleOverflow(checkState) {
      if (checkState) {
        document.querySelector("body").style.overflow = "hidden";
      } else {
        document.querySelector("body").style.overflow = "visible";
      }
    },
  },

  watch: {
    darkMode: {
      immediate: true,
      handler: function () {
        if (this.darkMode) {
          document.querySelector("html").setAttribute("data-theme", "light");
        } else {
          document.querySelector("html").setAttribute("data-theme", "dark");
        }
      },
    },
    showAlertModal: {
      immediate: true,
      handler: function () {
        this.handleOverflow(this.showAlertModal);
        // if (this.showAlertModal) {
        //   document.querySelector("body").style.overflow = "hidden";
        // } else {
        //   document.querySelector("body").style.overflow = "visible";
        // }
      },
    },
    showKeyModal: {
      immediate: true,
      handler: function () {
        this.handleOverflow(this.showKeyModal);
        // if (this.showKeyModal) {
        //   document.querySelector("body").style.overflow = "hidden";
        // } else {
        //   document.querySelector("body").style.overflow = "visible";
        // }
      },
    },
    showConfirmPasswordModal: {
      immediate: true,
      handler: function () {
        this.handleOverflow(this.showConfirmPasswordModal);
        // if (this.showConfirmPasswordModal) {
        //   document.querySelector("body").style.overflow = "hidden";
        // } else {
        //   document.querySelector("body").style.overflow = "visible";
        // }
      },
    },
    isSignedIn: {
      immediate: true,
      handler: function () {
        this.$store.commit("SET_AUTH", this.isSignedIn);
      },
    },
  },

  mounted() {
    if (this.localPrivateKey !== null && this.$store.state.auth.auth.isLogin) {
      this.$toast.warning("Please confirm password to read private message", {
        timeout: 3000,
      });
      this.showModalPassword = true;
      this.onPasswordConfirm = (password) => {
        const privateKeyDecrypt = decryptPrivateKeyWithPasswordConfirm(
          password,
          this.localPrivateKey
        );
        if (privateKeyDecrypt.includes("TEST")) {
          this.$store.commit("PASSWORD_CONFIRM", password);
          this.$toast.success("Password is correct");
        } else {
          this.$toast.error(
            "Your Confirmation Password is incorrect. Refresh to retry"
          );
        }
      };
    }
    if (this.localPrivateKey === null && this.$store.state.auth.auth.isLogin) {
      this.$toast.warning("Please generate or import key to use this app", {
        timeout: 3000,
      });
    }
  },
};
</script>
