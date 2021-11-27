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
      :class="!checkUnread(message.id) ? 'unread' : ''"
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
            <div class="status-read">
              <span v-if="!checkUnread(message.id)">Unread</span>
            </div>
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
  },
  watch: {
    page() {
      this.getSentMsg();
    },
    sentMsgNum() {
      this.getSentMsg();
    },
  },
  methods: {
    handleSelectedMail(id) {
      this.$store.commit("MESSAGE_CONVERSATION", id);

      this.reRender = id;

      const accountIdSentLocalStorage = JSON.parse(
        localStorage.getItem(this.accountId + " " + "sent")
      );

      if (accountIdSentLocalStorage) {
        const selectedMailReadID = [...accountIdSentLocalStorage];
        selectedMailReadID.push(id);
        const removeDuplicateItem = Array.from(new Set(selectedMailReadID));
        this.readMailId = removeDuplicateItem;
      }

      const selectedMailReadID = [...this.readMailId];
      selectedMailReadID.push(id);
      const removeDuplicateItem = Array.from(new Set(selectedMailReadID));
      this.readMailId = removeDuplicateItem;

      if (accountIdSentLocalStorage && accountIdSentLocalStorage.includes(id))
        return;

      localStorage.setItem(
        this.accountId + " " + "sent",
        JSON.stringify(this.readMailId)
      );
    },

    checkUnread(id) {
      const localStorageId = JSON.parse(
        localStorage.getItem(this.accountId + " " + "sent")
      );
      if (localStorageId) {
        return localStorageId.includes(id);
      }
      return false;
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
      const indexInfo = getIndexInfo(this.sentMsgNum, this.page, 20);
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
            return this.updateDataMessage(item);
          });
          return Promise.all(structEachData);
        })
        .then((res) => {
          this.dataMsgSent = res;
        });
    },
    async updateDataMessage(msg) {
      return await message.depackMessage(msg);
    },
  },
};
</script>

<style lang="scss" scoped></style>
