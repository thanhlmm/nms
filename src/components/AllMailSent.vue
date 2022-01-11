<template>
  <div class="mail-content__list scrollbar">
    <div v-if="sentMsgNum === 0">
      You haven't sent any message.<br />
      Do you want to send a message to someone? Please click
      <span class="link f-700" @click="handleSendMessageModal">here</span> to
      start!!!
    </div>
    <article
      v-else
      v-for="message in dataMsgSent"
      :key="message.id"
      class="mail-content__item d-flex"
      @click="handleSelectedMail(message.id)"
    >
      <Avatar :accountId="message.from" size="40" />

      <div class="content pl-20 pl-md-10 flex-grow-1">
        <header
          class="d-flex justify-between mb-10 mb-sm-0 mail-content__item-header"
        >
          <div class="flex-grow-1 mail-content__item-header__top pr-20">
            <div class="name title-16 f-700">{{ message.from }}</div>
            <div :class="{ isPrivate: message.isPrivate }">
              <div v-if="message.isPrivate">
                <img
                  src="../../public/assets/images/privateMsg.svg"
                  class="private-message"
                />
              </div>
              <div class="title f-500">Title: {{ message.title }}</div>
            </div>
          </div>
          <div class="text-right f-500">
            <div class="date-time no-wrap">{{ message.timestamp }}</div>
          </div>
        </header>
      </div>
    </article>
    <div class="is-hidden">{{ reRender }}</div>
  </div>
</template>

<script>
import { getIndexInfo } from "../utils";
import message from "../message";
import Avatar from "./Avatar";
import { decryptPrivateKeyWithPasswordConfirm } from "../message";

export default {
  components: {
    Avatar,
  },

  data() {
    return {
      dataMsgSent: [],
      readMailId: [],
      accountId: null,
      reRender: null,
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
      this.getSentMsg();
    },
    page() {
      this.getSentMsg();
    },
    sentMsgNum() {
      this.getSentMsg();
    },
    localPrivateKey() {
      this.getSentMsg();
    },
    routePathSent() {
      this.getInboxMsg();
    },
  },

  methods: {
    handleSelectedMail(id) {
      this.$store.commit("MESSAGE_CONVERSATION", id);
    },

    handleSendMessageModal() {
      if (this.$store.state.sendMessageModal.isShow) return;
      this.$store.commit("TOGGLE_SEND_MESSAGE_MODAL");
    },

    getAccountId() {
      this.accountId = window.walletConnection.getAccountId();
    },

    getSentMsg() {
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

      const indexInfo = getIndexInfo(this.sentMsgNum, this.page, 20);
      if (indexInfo.fromIndex === 0) {
        this.$store.commit("SET_PREVENT_PAGINATION", true);
      } else {
        this.$store.commit("SET_PREVENT_PAGINATION", false);
      }

      window.contract
        .getSentMessages({
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
              isPrivate: item.data.includes("DIRECT-PRI") ? true : false,
            };
          });
          const structEachData = eachData.map((item) => {
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
  },
};
</script>

<style lang="scss" scoped>
.isPrivate {
  display: flex;
  gap: 0.5rem;
}
.private-message {
  width: 16px;
}
</style>
