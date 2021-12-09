<template>
  <div class="mail-right__sent">
    <header class="mail-right__item-header d-flex">
      <Avatar :accountId="from" size="60" />
      <div class="info pl-30 flex-grow-1 d-flex justify-between">
        <div>
          <div class="name title-20 mb-10 f-700">{{ from }}</div>
          <div class="to f-500">To: {{ to }}</div>
        </div>
        <div class="btnModalForwardReplayContainer">
          <div class="text-right">
            <button
              class="btn-sent cursor-pointer d-flex align-center"
              @click="handleForward"
            >
              <img src="../../public/assets/images/sent.svg" />
              <span>Sent</span>
            </button>
          </div>
          <button
            class="
              btn-cancelForwardReply btn-sent
              cursor-pointer
              d-flex
              align-center
            "
            @click="handleCancelForward"
          >
            Cancel
          </button>
        </div>
      </div>
    </header>
    <section>
      <div class="content">
        <div class="title title-20 f-700 mb-10">
          <div class="textInput-ForwardAndReply">
            <div>Fw:</div>
            <input v-model="titleData" />
          </div>
        </div>
        <div class="description mb-10">
          <TipTap
            :modelValue="data"
            :isDetail="false"
            @updateModelValue="updateModelValue"
          />
        </div>
        <!-- <div class="description f-500 mb-10">
          <div class="textArea-ForwardAndReply">
            <textarea
              placeholder="Enter the content here"
              v-model="data"
            ></textarea>
          </div>
        </div> -->
      </div>

      <div>
        <div class="f-500">Select NEAR to send:</div>
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
      </div>
    </section>
  </div>
</template>

<script>
import { BOATLOAD_OF_GAS, tranformUnit, isAccountExist } from "../utils";
import message from "../message";
import Avatar from "./Avatar";
import TipTap from "../components/TipTap.vue";

export default {
  components: {
    Avatar,
    TipTap,
  },
  props: ["id", "title", "to", "from", "showForward"],
  data() {
    return {
      data: "",
      titleData: this.title,
      amount: 0.1,
    };
  },
  methods: {
    updateModelValue(e) {
      this.data = e;
    },

    async handleForward() {
      let msgForward = {
        title: this.titleData,
        content: this.data,
        attachmentFiles: {},
      };

      if (!this.titleData.length) {
        alert("Please enter the field 'Title'!");
        return;
      }

      if (!await isAccountExist(this.to)) {
          alert(`The account '${this.to}' is not existed. Please enter the other account!`);
          return;
      }

      try {
        console.log("start send", msgForward, tranformUnit(this.amount));
        const resp = await message.packMessage(msgForward);

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
                prevMsgId: this.id,
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

    handleCancelForward() {
      this.$emit("cancelForward", !this.showForward);
    },
  },
};
</script>

<style lang="scss" scoped></style>
