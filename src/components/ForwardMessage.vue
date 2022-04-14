<template>
  <div class="mail-right__sent">
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
          <div class="name title-20 mb-10 f-700">{{ from }}</div>
          <div class="to f-500">To: {{ to }}</div>
        </div>
        <div class="btnModalForwardReplayContainer">
          <div class="text-right">
            <button
              class="btn-sent text-btn-sent cursor-pointer d-flex align-center"
              @click="handleForward"
            >
              <img src="../../public/assets/images/sent.svg" />
              <span>Send</span>
            </button>
          </div>
          <button
            class="
              btn-cancelForwardReply btn-sent
              cursor-pointer
              d-flex
              align-center
              flex-shrink-0
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
            <div>[FWD]</div>
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
      </div>

      <div class="mb-16">
        <div class="f-500 mb-16">Select message type:</div>
        <div class="near__value-list d-flex">
          <div
            class="near__value-item cursor-pointer"
            v-bind:class="{
              active: type === 'PUBLIC',
            }"
            @click="type = 'PUBLIC'"
          >
            Public
          </div>
          <div
            class="near__value-item cursor-pointer"
            v-bind:class="{
              active: type === 'PRIVATE',
            }"
            @click="type = 'PRIVATE'"
          >
            Private
          </div>
        </div>
      </div>

      <div>
        <div class="f-500">Select NEAR to send:</div>
        <div class="near__value-list d-flex">
          <div
            class="near__value-item cursor-pointer"
            v-bind:class="{
              active: amount === 0.05,
            }"
            @click="amount = 0.05"
          >
            0.05 NEAR
          </div>
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
      amount: 0.05,
      type: "PUBLIC",
      senderKey: null,
    };
  },

  computed: {
    username() {
      return window.walletConnection.getAccountId();
    },
    privateKeyLocal() {
      return this.$store.state.localPrivateKey;
    },
  },

  watch: {
    type: {
      immediate: true,
      handler: function () {
        if (this.type === "PRIVATE") {
          window.contract
            .getPublicKey({ accountId: this.username })
            .then((data) => {
              if (data) {
                this.senderKey = data;
              }
            });
        }
      },
    },
  },

  methods: {
    updateModelValue(e) {
      this.data = e;
    },

    async packMassage(msgForward) {
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
            .then(() => {
              this.$toast.success(
                "Your message have been sent with" +
                  tranformUnit(this.amount) +
                  " !",
                {
                  timeout: 2000,
                }
              );
            });
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
            .then(() => {
              this.$toast.success("Your message have been sent!", {
                timeout: 2000,
              });
            });
        }
      } catch (error) {
        console.error(error);
        this.$toast.error("Your message can not be send!", {
          timeout: 2000,
        });
      }
    },

    async handleForward() {
      if (!this.titleData.length) {
        this.$toast.error("Please enter the field 'Title'!", {
          timeout: 2000,
        });
        return;
      }
      if (this.type === "PRIVATE") {
        window.contract.getPublicKey({ accountId: this.to }).then((data) => {
          if (data) {
            if (this.privateKeyLocal) {
              window.contract
                .getPublicKey({ accountId: this.username })
                .then((publicKey) => {
                  this.packMassage({
                    title: this.title,
                    content: this.data,
                    attachmentFiles: {},
                    type: this.type,
                    keys: {
                      sender: publicKey,
                      receiver: data,
                    },
                  });
                });
            }
            this.packMassage({
              title: this.titleData,
              content: this.data,
              attachmentFiles: {},
              type: this.type,
              keys: {
                sender: this.senderKey,
                receiver: data,
              },
            });
          } else {
            this.$toast.error("Receiver doesn't have public key!", {
              timeout: 2000,
            });
            return;
          }
        });
      }
      if (this.type === "PUBLIC") {
        this.packMassage({
          title: this.titleData,
          content: this.data,
          attachmentFiles: {},
          type: this.type,
          keys: {
            sender: null,
            receiver: null,
          },
        });
      }
    },

    handleCancelForward() {
      this.data = "";
      this.titleData = this.title;
      this.amount = 0.05;
      this.type = "PUBLIC";
      this.$emit("cancelForward", !this.showForward);
    },
  },
};
</script>

<style lang="scss" scoped>
.text-btn-sent {
  background: #fcb641;
}
.text-btn-sent span {
  font-weight: 500;
  color: #353739;
}
</style>
