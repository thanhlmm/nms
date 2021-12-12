<template>
  <div id="root">
    <Convert />
  </div>
</template>

<script>
import "./global.css";
import getConfig from "./config";
import Convert from "./Convert.vue";

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
    isSignedIn: {
      immediate: true,
      handler: function () {
        this.$store.commit("SET_AUTH", this.isSignedIn);
      },
    },
  },
};
</script>
