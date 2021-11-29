<template>
  <div
    :class="[
      'modal-sent',
      { 'is-hidden': !showModal },
      { 'modal-expand': expandModal },
      { 'modal-minimize': minimizeModal },
    ]"
  >
    <header
      class="
        modal-sent__header
        d-flex
        align-center
        justify-between
        mb-30 mb-sm-0
      "
    >
      <div class="title title-20 f-700 d-flex align-center">
        <img
          src="../../public/assets/images/logo.svg"
          style="width: 29px"
          class="is-hidden block-sm mr-10"
        />
        New message
      </div>
      <div class="action hidden-sm">
        <span
          class="btn-minimize cursor-pointer"
          @click="handleMinimizeSendMessageModal"
        >
          <svg
            width="20"
            height="4"
            viewBox="0 0 20 4"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="1.5"
              y1="1.64258"
              x2="18.5"
              y2="1.64258"
              stroke="#888A90"
              stroke-width="3"
              stroke-linecap="round"
            />
          </svg>
        </span>
        <span
          class="btn-expand cursor-pointer ml-20 mr-20"
          @click="handleExpandSendMessageModal"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 14.1426L5.57678 12.6483L1.49429 8.5658L0 14.1426ZM14.1421 0.000442743L8.56536 1.49473L12.6478 5.57722L14.1421 0.000442743ZM3.53553 11.3142L11.3137 3.53598L10.6066 2.82887L2.82843 10.607L3.53553 11.3142Z"
              fill="#888A90"
            />
          </svg>
        </span>
        <span
          class="btn-close cursor-pointer"
          @click="handleCloseSendMessageModal"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.14209 16.1426L16.2842 2.00044"
              stroke="#888A90"
              stroke-width="3"
              stroke-linecap="round"
            />
            <path
              d="M2.14209 2L16.2842 16.1421"
              stroke="#888A90"
              stroke-width="3"
              stroke-linecap="round"
            />
          </svg>
        </span>
      </div>
    </header>
    <div class="f-8 is-hidden block-sm mb-20">
      Message conversation history.
    </div>
    <section class="modal-sent__body">
      <div class="form-input d-flex pb-10 mb-20">
        <span>To: </span>
        <input placeholder="Enter the email here" v-model="to" />
      </div>
      <div class="form-input d-flex pb-10 mb-20">
        <span>Subject: </span>
        <input placeholder="Enter the subject here" v-model="title" />
      </div>
      <div class="form-textarea mb-20">
        <textarea
          placeholder="Enter the content here"
          v-model="data"
        ></textarea>
      </div>
      <div class="f-500 mb-16">Select NEAR to send:</div>

      <div class="d-flex align-center justify-between">
        <div class="near__value-list d-flex">
          <div
            class="near__value-item cursor-pointer"
            v-bind:class="{
              active: amount === 0.1,
            }"
            @click="amount = 0.1"
          >
            0.1 NEAR
          </div>
          <div
            class="near__value-item cursor-pointer"
            v-bind:class="{
              active: amount === 0.2,
            }"
            @click="amount = 0.2"
          >
            0.2 NEAR
          </div>
          <div
            class="near__value-item cursor-pointer"
            v-bind:class="{
              active: amount === 1,
            }"
            @click="amount = 1"
          >
            1 NEAR
          </div>
        </div>

        <div class="btnModalContainer">
          <button
            class="btn-sent cursor-pointer d-flex align-center flex-shrink-0"
            @click="handleSendMessageModal"
          >
            <img src="../../public/assets/images/sent.svg" />
            <span>Sent</span>
          </button>
          <button
            class="
              btn-sent btn-cancel
              cursor-pointer
              d-flex
              align-center
              flex-shrink-0
            "
            @click="handleCloseSendMessageModal"
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { BOATLOAD_OF_GAS, tranformUnit } from "../utils";
import message from "../message";

export default {
  data() {
    return {
      to: "",
      title: "",
      data: "",
      amount: 0.1,
    };
  },
  computed: {
    showModal() {
      return this.$store.state.sendMessageModal.isShow;
    },
    expandModal() {
      return this.$store.state.sendMessageModal.isExpand;
    },
    minimizeModal() {
      return this.$store.state.sendMessageModal.isMinimize;
    },
  },
  methods: {
    async handleSendMessageModal() {
      let msg = {
        title: this.title,
        content: this.data,
        attachmentFiles: {},
      };

      try {
        console.log("start send", msg, tranformUnit(this.amount));
        const resp = await message.packMessage(msg);

        if (resp.code !== 0) {
          throw new Error("Error when packing messsage" + resp);
        }

        if (this.amount) {
          window.contract
            .sendMessage(
              {
                to: this.to,
                title: resp.title,
                data: resp.data,
                baseSite: window.location.origin,
                prevMsgId: 0,
                expiredTime: "0",
              },
              BOATLOAD_OF_GAS,
              tranformUnit(this.amount)
            )
            .then(console.log);
        } else {
          window.contract
            .sendMessage({
              to: this.to,
              title: resp.title,
              data: resp.data,
              baseSite: window.location.origin,
              prevMsgId: 0,
              expiredTime: "0",
            })
            .then(console.log);
        }
      } catch (error) {
        console.log(error);
      }
    },
    handleCloseSendMessageModal() {
      this.$store.commit("TOGGLE_SEND_MESSAGE_MODAL");
    },
    handleExpandSendMessageModal() {
      this.$store.commit("TOGGLE_SEND_MESSAGE_MODAL_EXPAND");
    },
    handleMinimizeSendMessageModal() {
      this.$store.commit("TOGGLE_SEND_MESSAGE_MODAL_MINIMIZE");
    },
  },
};
</script>

<style lang="scss" scoped></style>
