<template>
  <div id="root">
    <Convert />
  </div>
</template>

<script>
import "./global.css";
import getConfig from "./config";
import Convert from "./Convert.vue";
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

  watch: {
    darkMode: {
      immediate: true,
      handler: function () {
        if (this.$store.state.darkMode) {
          document.querySelector("html").setAttribute("data-theme", "light");
        } else
          document.querySelector("html").setAttribute("data-theme", "dark");
      },
    },
    showAlertModal: {
      immediate: true,
      handler: function () {
        if (this.$store.state.alertModal.isShow) {
          document.querySelector("body").style.overflow = "hidden";
        } else document.querySelector("body").style.overflow = "visible";
      },
    },
    showKeyModal: {
      immediate: true,
      handler: function () {
        if (this.$store.state.keyModal) {
          document.querySelector("body").style.overflow = "hidden";
        } else document.querySelector("body").style.overflow = "visible";
      },
    },
    showConfirmPasswordModal: {
      immediate: true,
      handler: function () {
        if (this.$store.state.confirmPasswordModal) {
          document.querySelector("body").style.overflow = "hidden";
        } else document.querySelector("body").style.overflow = "visible";
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
      this.$store.commit("TOGGLE_CONFIRM_PASSWORD_MODAL", true);
      this.$toast.warning("Please confirm password to read private message", {
        timeout: 3000,
      });
    }
    if (this.localPrivateKey === null && this.$store.state.auth.auth.isLogin) {
      this.$toast.warning("Please generate or import key to use this app", {
        timeout: 3000,
      });
    }
  },
};
</script>
