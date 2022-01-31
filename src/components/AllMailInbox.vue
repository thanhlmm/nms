<template>
  <div class="mail-content__list scrollbar">
    <div v-if="inboxMsgNum === 0">
      You have no message.<br />
      Do you want to send a message to someone? Please click
      <span class="link f-700" @click="handleSendMessageModal">here</span> to
      start!!!
    </div>
    <article
      v-else
      v-for="message in dataMsgInbox"
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
            <div :class="{ isPrivate: message.isPrivate }">
              <img
                v-if="message.isPrivate"
                src="../../public/assets/images/privateMsg.svg"
                class="private-message"
              />
              <div class="title f-500">Title: {{ message.title }}</div>
            </div>
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
    <div class="is-hidden">{{ selectedId }}</div>
  </div>
</template>

<script>
import message from "../message";
import Avatar from "./Avatar";
import { getIndexInfo } from "../utils";
import { decryptPrivateKeyWithPasswordConfirm } from "../message";

export default {
  components: {
    Avatar,
  },

  data() {
    return {
      dataMsgInbox: [],
      readMailId: [],
      accountId: null,
      selectedId: null,
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

    handleSelectedMail(id) {
      this.$store.commit("MESSAGE_CONVERSATION", id);
      this.selectedId = id;

      const accountIdInboxLocalStorage = JSON.parse(
        localStorage.getItem(this.accountId + " " + "inbox")
      );

      if (accountIdInboxLocalStorage) {
        const selectedMailReadID = [...accountIdInboxLocalStorage];
        selectedMailReadID.push(id);
        const removeDuplicateItem = Array.from(new Set(selectedMailReadID));
        this.readMailId = removeDuplicateItem;
      }

      const selectedMailReadID = [...this.readMailId];
      selectedMailReadID.push(id);
      const removeDuplicateItem = Array.from(new Set(selectedMailReadID));
      this.readMailId = removeDuplicateItem;

      if (accountIdInboxLocalStorage && accountIdInboxLocalStorage.includes(id))
        return;

      localStorage.setItem(
        this.accountId + " " + "inbox",
        JSON.stringify(this.readMailId)
      );
    },

    checkUnread(id) {
      const localStorageId = JSON.parse(
        localStorage.getItem(this.accountId + " " + "inbox")
      );
      if (localStorageId) {
        return localStorageId.includes(id);
      }
      return false;
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
      // console.log("this.passwordConfirm INBOX: ", this.passwordConfirm);
      // console.log("this.localPrivateKey INBOX: ", this.localPrivateKey);
      // console.log("privateKeyDecrypt INBOX: ", privateKeyDecrypt);

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
              isPrivate: item.data.includes("DIRECT-PRI"),
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
