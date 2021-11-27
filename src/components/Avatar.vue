<template>
  <div class="logo avatar">
    <img :src="url" :width="size" :height="size" />
  </div>
</template>

<script>
import { getAvatar } from "../utils";

export default {
  props: ["accountId", "size"],
  data() {
    return {
      url: "../../public/assets/images/icon.svg",
    };
  },
  mounted() {
    this.getAvatarUrl(this.accountId);
  },
  methods: {
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

<style></style>
