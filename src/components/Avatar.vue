<template>
  <div class="logo avatar">
    <img
      :src="url"
      :style="[
        windowWidth < 768 ? { height: '40px' } : { height: `${size} + px` },
        `width: ${size} + px`,
      ]"
    />
  </div>
</template>

<script>
import { getAvatar } from "../utils";

export default {
  props: ["accountId", "size"],
  data() {
    return {
      windowWidth: window.innerWidth,
      url: require("../../public/assets/images/icon.svg"),
    };
  },

  mounted() {
    this.getAvatarUrl(this.accountId);
  },

  created() {
    window.addEventListener("resize", this.myEventHandler);
  },

  destroyed() {
    window.removeEventListener("resize", this.myEventHandler);
  },

  methods: {
    myEventHandler() {
      this.windowWidth = window.innerWidth;
    },

    getAvatarUrl(accountId) {
      const avatarUrlCache = localStorage.getItem(`user-avatar-${accountId}`);
      if (avatarUrlCache) {
        this.url = avatarUrlCache;
        return;
      }

      getAvatar(accountId, (value) => {
        if (value) {
          this.url = value;
          localStorage.setItem(`user-avatar-${accountId}`, value);
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
