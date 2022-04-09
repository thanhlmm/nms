<template>
  <div
    class="mail-content__col mail-right"
    :class="{ 'd-block': windowWidth <= 1024 && msgInboxId }"
  >
    <header class="mail-right__header">
      <div class="mb-4 mail-right__header-title f-700 d-flex align-center">
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
import { decryptPrivateKeyWithPasswordConfirm } from "../message";

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
    username() {
      return window.walletConnection.getAccountId();
    },
    userLogin() {
      return this.$store.state.auth.auth.isLogin;
    },
    msgInboxId() {
      return this.$store.state.messageConversation.msgInboxId;
    },
    routePathSent() {
      return this.$route.path === "/sent";
    },
    localPrivateKey() {
      return this.$store.state.localPrivateKey;
    },
    passwordConfirm() {
      return this.$store.state.passwordConfirm;
    },
  },

  watch: {
    msgInboxId() {
      this.dataMsgConversation = [];
      this.getMessages(this.msgInboxId);
    },
    localPrivateKey() {
      this.dataMsgConversation = [];
      this.getMessages(this.msgInboxId);
    },
    routePathSent() {
      this.dataMsgConversation = [];
      this.getMessages(this.msgInboxId);
    },
    passwordConfirm() {
      this.dataMsgConversation = [];
    },
  },

  methods: {
    myEventHandler() {
      this.windowWidth = window.innerWidth;
    },

    getMessages(id) {
      if (id === null) return;

      let privateKeyDecrypt = null;
      if (this.passwordConfirm && this.localPrivateKey) {
        privateKeyDecrypt = decryptPrivateKeyWithPasswordConfirm(
          this.passwordConfirm,
          this.localPrivateKey
        );
      }

      const opts = {
        isLoadFromIpfs: message.clientConfig.isSupportIpfs,
        isInboxMsg: !this.routePathSent,
        privateKey:
          privateKeyDecrypt !== null ? privateKeyDecrypt.slice(5) : null,
      };

      const cacheMsg = window.localStorage.getItem(
        `${this.username}-msg-${id}`
      );
      if (cacheMsg) {
        this.updateDataMessage(JSON.parse(cacheMsg), opts);
        return;
      }

      window.contract.getMessage({ msgId: id }).then((data) => {
        window.localStorage.setItem(
          `${this.username}-msg-${id}`,
          JSON.stringify(data)
        );
        this.updateDataMessage(data, opts);
      });
    },

    async updateDataMessage(msg, opts) {
      const structMsg = {
        baseSite: msg.baseSite,
        data: msg.data,
        expiredTime: msg.expiredTime,
        from: msg.from,
        id: msg.id,
        prevMsgId: msg.prevMsgId,
        timestamp: msg.timestamp,
        title: msg.title,
        to: msg.to,
        moneyInfo: msg.moneyInfo,
        isPrivate: ["#DIRECT-PRI", "#IPFS-PRI"].some((condition) =>
          msg.data.includes(condition)
        ),
      };
      const eachMsg = await message.depackMessage(structMsg, opts);

      if (eachMsg.prevMsgId === 0) {
        this.dataMsgConversation.push(eachMsg);
        this.dataMsgConversation.reverse();
      } else {
        this.getMessages(eachMsg.prevMsgId);
        const newData = [...this.dataMsgConversation];
        newData.push(eachMsg);
        this.dataMsgConversation = newData;
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
