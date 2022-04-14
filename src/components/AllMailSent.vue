<template>
  <div class="mail-content__list scrollbar">
    <div v-if="sentMsgNum === 0">
      You haven't sent any message.<br />
      Do you want to send a message to someone? Please click
      <span class="link f-700" @click="handleSendMessageModal">here</span> to
      start!!!
    </div>
    <MailSent
      v-else
      v-for="message in dataMsgSent"
      :message="message"
      :key="message.id"
    />
  </div>
</template>

<script>
import { getIndexInfo } from "../utils";
import message from "../message";
import { decryptPrivateKeyWithPasswordConfirm } from "../message";
import MailSent from "./MailSent.vue";
import { ITEM_PER_PAGE } from "../constant";

export default {
  components: {
    MailSent,
  },

  data() {
    return {
      dataMsgSent: [],
      readMailId: [],
      accountId: null,
      msgRaw: [],
    };
  },

  mounted() {
    this.getAccountId();
    this.getSentMsg();
  },

  computed: {
    sentMsgNum() {
      return this.$store.state.sentMsgNum;
    },
    page() {
      return this.$store.state.page;
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
    passwordConfirm() {
      this.processMessage();
    },
    page() {
      this.getSentMsg();
    },
    sentMsgNum() {
      this.getSentMsg();
    },
    localPrivateKey() {
      this.processMessage();
    },
    routePathSent() {
      this.processMessage();
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

    getSentMsg() {
      const indexInfo = getIndexInfo(this.sentMsgNum, this.page, ITEM_PER_PAGE);
      window.contract
        .getSentMessages({
          accountId: this.accountId,
          fromIndex: indexInfo.fromIndex,
          toIndex: indexInfo.toIndex,
        })
        .then((data) => {
          this.msgRaw = data.map((item) => {
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
              moneyInfo: item.moneyInfo,
              isPrivate: ["#DIRECT-PRI", "#IPFS-PRI"].some((condition) =>
                item.data.includes(condition)
              ),
            };
          });
        })
        .then(() => {
          this.processMessage();
        });
    },

    processMessage() {
      if (this.sentMsgNum === 0) {
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

      const indexInfo = getIndexInfo(this.sentMsgNum, this.page, 10);
      if (indexInfo.fromIndex === 0) {
        this.$store.commit("SET_PREVENT_PAGINATION", true);
      } else {
        this.$store.commit("SET_PREVENT_PAGINATION", false);
      }

      Promise.resolve(true)
        .then(() => {
          const structEachData = this.msgRaw.map((item) => {
            return this.updateDataMessage(item, opts);
          });
          return Promise.all(structEachData);
        })
        .then((res) => {
          const dataSent = [...res];
          dataSent.reverse();
          this.dataMsgSent = dataSent;
        });
    },

    async updateDataMessage(msg, opts) {
      return await message.depackMessage(msg, opts);
    },

    recallSentMsgNumApi() {
      if (this.sentMsgNum > this.dataMsgSent.length) {
        this.getSentMsg();
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
