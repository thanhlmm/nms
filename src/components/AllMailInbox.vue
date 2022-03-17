<template>
  <div class="mail-content__list scrollbar">
    <div v-if="inboxMsgNum === 0">
      You have no message.<br />
      Do you want to send a message to someone? Please click
      <span class="link f-700" @click="handleSendMessageModal">here</span> to
      start!!!
    </div>
    <MailInbox
      v-else
      v-for="message in dataMsgInbox"
      :message="message"
      :key="message.id"
    />
  </div>
</template>

<script>
import message from "../message";
import { getIndexInfo } from "../utils";
import { decryptPrivateKeyWithPasswordConfirm } from "../message";
import MailInbox from "./MailInbox.vue";

export default {
  components: {
    MailInbox,
  },

  data() {
    return {
      dataMsgInbox: [],
      accountId: null,
    };
  },

  mounted() {
    this.getAccountId();
    this.getInboxMsg();
  },

  computed: {
    inboxMsgNum() {
      return this.$store.state.inboxMsgNum;
    },
    page() {
      return this.$store.state.page;
    },
    routePathInbox() {
      return this.$route.path === "/inbox";
    },
    localPrivateKey() {
      return this.$store.state.localPrivateKey;
    },
    passwordConfirm() {
      return this.$store.state.passwordConfirm;
    },
  },

  watch: {
    passwordConfirm() {
      this.getInboxMsg();
    },
    page() {
      this.getInboxMsg();
    },
    inboxMsgNum() {
      this.getInboxMsg();
      this.recallInboxMsgNumApi();
    },
    localPrivateKey() {
      this.getInboxMsg();
    },
    routePathInbox() {
      this.getInboxMsg();
    },
  },

  methods: {
    handleSendMessageModal() {
      if (this.$store.state.sendMessageModal.isShow) return;
      this.$store.commit("TOGGLE_SEND_MESSAGE_MODAL");
    },

    getAccountId() {
      this.accountId = window.walletConnection.getAccountId();
    },

    getInboxMsg() {
      if (this.inboxMsgNum === 0) {
        return;
      }

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

      const indexInfo = getIndexInfo(this.inboxMsgNum, this.page, 20);
      if (indexInfo.fromIndex === 0) {
        this.$store.commit("SET_PREVENT_PAGINATION", true);
      } else {
        this.$store.commit("SET_PREVENT_PAGINATION", false);
      }

      window.contract
        .getInboxMessages({
          accountId: this.accountId,
          fromIndex: indexInfo.fromIndex,
          toIndex: indexInfo.toIndex,
        })
        .then((data) => {
          let eachData = data.map((item) => {
            return {
              baseSite: item.baseSite,
              expiredTime: item.expiredTime,
              from: item.from,
              to: item.to,
              timestamp: item.timestamp,
              id: item.id,
              prevMsgId: item.prevMsgId,
              title: item.title,
              data: item.data,
              isPrivate: ["DIRECT-PRI", "#IPFS-PRI"].some((condition) =>
                item.data.includes(condition)
              ),
            };
          });
          const structEachData = eachData.map((item) => {
            return this.updateDataMessage(item, opts);
          });
          return Promise.all(structEachData);
        })
        .then((res) => {
          const dataInbox = [...res];
          dataInbox.reverse();
          this.dataMsgInbox = dataInbox;
        });
    },

    async updateDataMessage(msg, opts) {
      return await message.depackMessage(msg, opts);
    },

    recallInboxMsgNumApi() {
      if (this.inboxMsgNum > this.dataMsgInbox.length) {
        this.getInboxMsg();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.isPrivate {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.private-message {
  width: 16px;
}
</style>
