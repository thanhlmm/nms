<template>
  <div
    class="mail-content__col mail-right"
    :class="{ 'd-block': windowWidth <= 1024 && msgInboxId }"
  >
    <header class="mail-right__header">
      <div class="mail-right__header-title f-700 mb-4 d-flex align-center">
        <img
          src="../../public/assets/images/logo.svg"
          style="max-width: 29px"
          class="is-hidden block-sm mr-sm-10"
        />
        Message conversation
      </div>
      <div class="f-500">Message conversation history.</div>
    </header>
    <section :class="[{ 'is-hidden': !userLogin }, 'mail-right__body']">
      <div :class="[{ 'is-hidden': msgInboxId }, 'mail-right__no-selected']">
        No conversations selected.
      </div>

      <div
        :class="[
          { 'is-hidden': !msgInboxId },
          'mail-right__selected scrollbar',
        ]"
      >
        <MessageDetail
          v-for="dataMsg in dataMsgConversation"
          :from="dataMsg.from"
          :key="dataMsg.id"
          :dataMsg="dataMsg"
        />
      </div>
    </section>
  </div>
</template>

<script>
import MessageDetail from "./MessageDetail.vue";
import message from "../message";

export default {
  components: {
    MessageDetail,
  },
  data() {
    return {
      windowWidth: window.innerWidth,
      dataMsgConversation: [],
    };
  },
  created() {
    window.addEventListener("resize", this.myEventHandler);
  },
  destroyed() {
    window.removeEventListener("resize", this.myEventHandler);
  },
  computed: {
    userLogin() {
      return this.$store.state.auth.auth.isLogin;
    },
    msgInboxId() {
      return this.$store.state.messageConversation.msgInboxId;
    },
    routePathSent() {
      return this.$route.path === "/sent";
    },
  },
  watch: {
    msgInboxId: function () {
      this.dataMsgConversation = [];
      this.getMessages(this.msgInboxId);
    },
  },
  methods: {
    myEventHandler() {
      this.windowWidth = window.innerWidth;
    },
    getMessages(id) {
      if (id === null) return;

      const opts = {
        isLoadFromIpfs: message.clientConfig.isSupportIpfs,
        isInboxMsg: !this.routePathSent,
        privateKey: localStorage.getItem(`nms_privatekey`),
      };

      const cacheMsg = window.localStorage.getItem(`msg-${id}`);
      if (cacheMsg) {
        this.updateDataMessage(JSON.parse(cacheMsg), opts);
        return;
      }
      window.contract.getMessage({ msgId: id }).then((data) => {
        window.localStorage.setItem(`msg-${id}`, JSON.stringify(data));
        this.updateDataMessage(data, opts);
      });
    },
    async updateDataMessage(msg, opts) {
      const msgInbox = await message.depackMessage(msg, opts);

      if (msgInbox.prevMsgId === 0) {
        this.dataMsgConversation.push(msgInbox);
        this.dataMsgConversation.reverse();
      } else {
        this.getMessages(msgInbox.prevMsgId);
        const newData = [...this.dataMsgConversation];
        newData.push(msgInbox);
        this.dataMsgConversation = newData;
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
