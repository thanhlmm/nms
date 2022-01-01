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
            <div class="title f-500">Title: {{ message.title }}</div>
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
      localPrivateKey: null,
    };
  },

  mounted() {
    this.getAccountId();
    this.getLocalPrivateKey();
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
    checkPrivateKeyLocal() {
      return this.$store.state.checkPrivateKeyLocal;
    },
  },

  watch: {
    page() {
      this.getSentMsg();
    },
    sentMsgNum() {
      this.getSentMsg();
    },
    checkPrivateKeyLocal() {
      this.getLocalPrivateKey();
      this.getSentMsg();
    },
    routePathSent() {
      this.getLocalPrivateKey();
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

    getLocalPrivateKey() {
      const privateKey = localStorage.getItem(`nms_privatekey`);
      if (privateKey === null) {
        this.$toast.error(
          "Empty private key. Please import or generate new key",
          {
            timeout: 2000,
          }
        );
      } else {
        this.localPrivateKey = privateKey;
      }
    },

    getSentMsg() {
      if (this.sentMsgNum === 0) {
        return;
      }

      const opts = {
        isLoadFromIpfs: message.clientConfig.isSupportIpfs,
        isInboxMsg: !this.routePathSent,
        privateKey: this.localPrivateKey,
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

<style lang="scss" scoped></style>
