<template>
  <article class="mail-right__item">
    <header class="mail-right__item-header d-flex">
      <Avatar :accountId="from" size="60" />
      <div
        class="
          info
          pl-30 pl-xl-16 pl-md-16 pl-sm-10
          flex-grow-1
          d-flex
          justify-between
        "
      >
        <div>
          <div class="name title-20 mb-10 f-700">{{ dataMsg.from }}</div>
          <div class="to f-500">To: {{ dataMsg.to }}</div>
        </div>
        <div class="text-right">
          <div class="action mb-10 mb-sm-4 d-flex">
            <div
              class="
                action-sent
                reply
                cursor-pointer
                d-flex
                align-center
                mr-40 mr-xl-20
                md-md-20 md-sm-20
              "
              @click="handleShowReply"
            >
              <svg
                class="mr-10"
                width="28"
                height="20"
                viewBox="0 0 28 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M28 20C28 20 25.3167 5.55556 11.6667 5.55556V0L0 10L11.6667 19.3333V12.9236C19.075 12.9236 24.1354 13.5417 28 20Z"
                  fill="#3B4551"
                />
              </svg>
              Reply
            </div>
            <div
              class="action-sent forward cursor-pointer d-flex align-center"
              @click="handleShowForward"
            >
              Forward
              <svg
                class="ml-10"
                width="28"
                height="20"
                viewBox="0 0 28 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 20C0 20 2.68333 5.55556 16.3333 5.55556V0L28 10L16.3333 19.3333V12.9236C8.925 12.9236 3.86458 13.5417 0 20Z"
                  fill="#3B4551"
                />
              </svg>
            </div>
          </div>
          <div class="f-500 date">{{ dataMsg.timestamp }}</div>
        </div>
      </div>
    </header>

    <section class="mail-right__item-body">
      <div class="title cursor-pointer" @click="showDetail = !showDetail">
        Title: {{ dataMsg.title }}
      </div>
      <div class="description f-500">
        <div class="content">
          <TipTap :modelValue="dataMsg.content" :isDetail="true" />
        </div>
      </div>
      <ReplyMessage
        :class="{ 'is-hidden': !showReply }"
        :id="dataMsg.id"
        :title="dataMsg.title"
        :to="dataMsg.from"
        :from="dataMsg.to"
        :showReply="showReply"
        @cancelReplay="cancelReplay"
      />
      <ForwardMessage
        :class="{ 'is-hidden': !showForward }"
        :id="dataMsg.id"
        :title="dataMsg.title"
        :to="dataMsg.to"
        :from="dataMsg.from"
        :showForward="showForward"
        @cancelForward="cancelForward"
      />
    </section>
  </article>
</template>

<script>
import ReplyMessage from "./ReplyMessage.vue";
import ForwardMessage from "./ForwardMessage.vue";
import Avatar from "./Avatar";
import TipTap from "../components/TipTap.vue";

export default {
  props: ["dataMsg", "from"],

  components: {
    ReplyMessage,
    ForwardMessage,
    Avatar,
    TipTap,
  },

  data() {
    return {
      showDetail:
        this.dataMsg.id === this.$store.state.messageConversation.msgInboxId,
      showReply: false,
      showForward: false,
    };
  },

  methods: {
    handleShowReply() {
      if (this.showForward) return;
      this.showReply = !this.showReply;
    },
    handleShowForward() {
      if (this.showReply) return;
      this.showForward = !this.showForward;
    },
    cancelReplay(e) {
      this.showReply = e;
    },
    cancelForward(e) {
      this.showForward = e;
    },
  },
};
</script>

<style lang="scss" scoped></style>
