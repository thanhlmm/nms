<template>
  <div>
    <transition name="slide" appear>
      <div class="modal" v-if="showModal">
        <div class="header d-flex align-center justify-between mb-20">
          <div class="title title-20 f-700 d-flex align-center">
            Key Management
          </div>
          <div class="action">
            <span class="btn-close cursor-pointer" @click="handleCloseModal">
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
        </div>
        <div class="container">
          <div class="form-input d-flex pb-10 mb-20">
            <span>Public Key: </span>
            <input placeholder="*****" v-model="publicKey" disabled />
            <div class="line"></div>
          </div>
          <div class="form-input d-flex pb-10 mb-20">
            <span>Private Key: </span>
            <input placeholder="*****" v-model="privateKey" disabled />
            <div class="line"></div>
          </div>
          <div class="d-flex flex-col-sm" style="gap: 1rem">
            <button
              class="
                btn-sent btn-sent-key
                cursor-pointer
                d-flex
                align-center
                justify-center
                flex-shrink-0
              "
              @click="genKeys"
            >
              <img src="../../public/assets/images/sent.svg" />
              <span>Generate</span>
            </button>
            <label
              class="
                btn-sent btn-sent-key
                cursor-pointer
                d-flex
                align-center
                justify-center
                flex-shrink-0
              "
            >
              <img src="../../public/assets/images/sent.svg" />
              <span>Import</span>
              <input type="file" ref="doc" @change="importKeys()" />
            </label>
            <button
              class="
                btn-sent btn-sent-key
                cursor-pointer
                d-flex
                align-center
                justify-center
                flex-shrink-0
              "
              @click="exportKeys"
            >
              <img src="../../public/assets/images/sent.svg" />
              <span>Export</span>
            </button>
            <!-- <div @click="handleConfirmPassword">Confirm Pass</div> -->
          </div>
        </div>
      </div>
    </transition>
    <ConfirmModal
      :showModalReGen="showModalReGen"
      @closeConfirmModal="closeConfirmModal($event)"
      @toggleClickReGen="toggleClickReGen($event)"
      @toggleClickReImport="toggleClickReImport($event)"
      @confirmGen="confirmGen($event)"
    />
    <ConfirmPasswordModal />
  </div>
</template>

<script>
import {
  generateRSAKey,
  privateKeyToPublicKey,
  encryptPrivateKeyWithPasswordConfirm,
} from "../message";
import ConfirmModal from "../components/ConfirmModal.vue";
// import ConfirmPasswordModal from "../components/ConfirmPasswordModal.vue";

export default {
  components: {
    ConfirmModal,
    // ConfirmPasswordModal,
  },
  data() {
    return {
      publicKey: null,
      privateKey: null,
      privateKeyExport: null,
      file: null,

      checkClickReGenBtn: false,
      checkClickReImportBtn: false,
      showModalReGen: false,
      confirm: false,
    };
  },

  computed: {
    showModal() {
      return this.$store.state.keyModal;
    },
    passwordConfirm() {
      return this.$store.state.passwordConfirm;
    },
    username() {
      return this.$store.state.username;
    },
  },

  mounted() {
    this.hiddenPublicKey(localStorage.getItem("nms_publickey"));
    this.hiddenPrivateKey(localStorage.getItem("nms_privatekey"));
  },

  watch: {
    confirm: {
      immediate: true,
      handler: function () {
        if (this.confirm === true && this.checkClickReGenBtn === true) {
          const generateKeys = generateRSAKey();

          const encryptPrivateKey = encryptPrivateKeyWithPasswordConfirm(
            this.passwordConfirm,
            generateKeys.privateKey
          );
          this.privateKeyExport = generateKeys.privateKey;
          localStorage.setItem("nms_publickey", generateKeys.publicKey);
          localStorage.setItem("nms_privatekey", encryptPrivateKey);
          this.hiddenPublicKey(generateKeys.publicKey);
          this.hiddenPrivateKey(encryptPrivateKey);

          this.$store.commit("TOGGLE_PRIVATEKEY_LOCAL", encryptPrivateKey);
          this.updateKeysApi(generateKeys.publicKey);

          this.$toast.success("Success Generate New Keys!", {
            timeout: 2000,
          });

          this.checkClickReGenBtn = false;
          this.confirm = false;
        }
        if (this.confirm === true && this.checkClickReImportBtn === true) {
          this.file = this.$refs.doc.files[0];
          const reader = new FileReader();
          if (this.file.name.includes(".pem")) {
            reader.onload = (res) => {
              const privateKeyImport = res.target.result;
              const encryptPrivateKey = encryptPrivateKeyWithPasswordConfirm(
                this.passwordConfirm,
                privateKeyImport
              );
              this.hiddenPrivateKey(encryptPrivateKey);
              this.privateKeyExport = privateKeyImport;

              const publicKey = privateKeyToPublicKey(privateKeyImport);
              this.hiddenPublicKey(publicKey);

              localStorage.setItem("nms_publickey", publicKey);
              localStorage.setItem("nms_privatekey", encryptPrivateKey);

              this.$store.commit("TOGGLE_PRIVATEKEY_LOCAL", encryptPrivateKey);
              this.updateKeysApi(publicKey);

              this.$toast.success("Success Import Keys!", {
                timeout: 2000,
              });

              this.checkClickReImportBtn = false;
              this.confirm = false;
            };
            reader.onerror = (err) => console.log(err);
            reader.readAsText(this.file);
          } else {
            this.$toast.error("Invalid Private Key!", {
              timeout: 2000,
            });
            reader.onerror = (err) => console.log(err);
            reader.readAsText(this.file);
          }
        }
      },
    },
  },

  methods: {
    handleCloseModal() {
      this.$store.commit("TOGGLE_KEY_MODAL");
    },
    // handleConfirmPassword() {
    //   this.$store.commit("TOGGLE_CONFIRM_PASSWORD_MODAL");
    // },

    closeConfirmModal(e) {
      this.showModalReGen = e;
    },
    toggleClickReGen(e) {
      this.checkClickReGenBtn = e;
    },
    toggleClickReImport(e) {
      this.checkClickReImportBtn = e;
    },
    confirmGen(e) {
      this.confirm = e;
    },

    hiddenPublicKey(key) {
      this.publicKey =
        key.slice(0, 10) + "********************" + key.substr(-10);
    },
    hiddenPrivateKey(key) {
      this.privateKey =
        key.slice(0, 10) + "********************" + key.substr(-10);
    },

    updateKeysApi(key) {
      window.contract.updatePublicKey({ publicKey: key }).then((data) => {
        if (data) {
          this.$toast.success("Success Save Keys!", {
            timeout: 2000,
          });
        }
      });
    },

    genKeys() {
      this.checkClickReGenBtn = true;

      const publicKeyCache = localStorage.getItem("nms_publickey");
      const privateKeyCache = localStorage.getItem("nms_privatekey");

      if (publicKeyCache && privateKeyCache) {
        this.showModalReGen = true;
      } else {
        const generateKeys = generateRSAKey();
        const encryptPrivateKey = encryptPrivateKeyWithPasswordConfirm(
          this.passwordConfirm,
          generateKeys.privateKey
        );
        this.privateKeyExport = generateKeys.privateKey;
        localStorage.setItem("nms_publickey", generateKeys.publicKey);
        localStorage.setItem("nms_privatekey", encryptPrivateKey);
        this.hiddenPublicKey(generateKeys.publicKey);
        this.hiddenPrivateKey(encryptPrivateKey);

        this.$store.commit("TOGGLE_PRIVATEKEY_LOCAL", encryptPrivateKey);
        this.updateKeysApi(generateKeys.publicKey);

        this.$toast.success("Success Generate New Keys!", {
          timeout: 2000,
        });
      }
    },

    importKeys() {
      this.checkClickReImportBtn = true;

      const publicKeyCache = localStorage.getItem("nms_publickey");
      const privateKeyCache = localStorage.getItem("nms_privatekey");

      if (publicKeyCache && privateKeyCache) {
        this.showModalReGen = true;
      } else {
        this.file = this.$refs.doc.files[0];
        const reader = new FileReader();
        if (this.file.name.includes(".pem")) {
          reader.onload = (res) => {
            const privateKeyImport = res.target.result;
            const encryptPrivateKey = encryptPrivateKeyWithPasswordConfirm(
              this.passwordConfirm,
              privateKeyImport
            );
            this.hiddenPrivateKey(encryptPrivateKey);
            this.privateKeyExport = privateKeyImport;

            const publicKey = privateKeyToPublicKey(privateKeyImport);
            this.hiddenPublicKey(publicKey);

            localStorage.setItem("nms_publickey", publicKey);
            localStorage.setItem("nms_privatekey", encryptPrivateKey);

            this.$store.commit("TOGGLE_PRIVATEKEY_LOCAL", encryptPrivateKey);
            this.updateKeysApi(publicKey);

            this.$toast.success("Success Import Keys!", {
              timeout: 2000,
            });
          };
          reader.onerror = (err) => console.log(err);
          reader.readAsText(this.file);
        } else {
          this.$toast.error("Invalid Private Key!", {
            timeout: 2000,
          });
          reader.onerror = (err) => console.log(err);
          reader.readAsText(this.file);
        }
      }
    },

    exportKeys() {
      if (this.privateKeyExport) {
        const file = new Blob([this.privateKeyExport], { type: "text/plain" });
        if (window.navigator.msSaveOrOpenBlob)
          // IE10+
          window.navigator.msSaveOrOpenBlob(file, "PrivateKeys.pem");
        else {
          // Others
          var a = document.createElement("a"),
            url = URL.createObjectURL(file);
          a.href = url;
          a.download = "PrivateKeys.pem";
          document.body.appendChild(a);
          a.click();
          setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 0);
        }
        this.$toast.success("Success Export Private Key!", {
          timeout: 2000,
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;

  width: 100%;
  max-width: 550px;
  background: var(--background-modal);
  border-radius: 16px;

  padding: 25px;
  color: var(--color-menu);

  display: flex;
  flex-direction: column;
  align-items: center;

  background: var(--background-modal);
  border: 1px solid var(--border-modal);
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-box-shadow: var(--body-box-shadow);
  -moz-box-shadow: var(--body-box-shadow);
  box-shadow: var(--body-box-shadow);
  -webkit-border-radius: 8px;
  -moz-border-radius: 8px;
  border-radius: 8px;

  @media (max-width: 767px) {
    width: 350px;
  }
  .header {
    width: 100%;
    .title {
      color: var(--color-title-mail-detail);
    }
  }
  .container {
    width: 100%;
    .btn-sent-key {
      width: auto;
      span {
        width: auto;
        text-align: left;
      }
      input[type="file"] {
        display: none;
      }
      @media (max-width: 767px) {
        span {
          width: 30%;
          font-size: 16px;
        }
      }
    }
    .form-input {
      font-size: 16px;
      line-height: 22px;
      position: relative;
      display: flex;
    }
    .form-input .line {
      content: " ";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 1px;
      background: var(--main-color);
      -webkit-transform: scaleY(0.5);
      -moz-transform: scaleY(0.5);
      -ms-transform: scaleY(0.5);
      -o-transform: scaleY(0.5);
      transform: scaleY(0.5);
    }
    .form-input span {
      color: var(--color-mail-item);
      flex: 0.25;
      @media (max-width: 767px) {
        flex: 0.5;
      }
    }
    .form-input input {
      flex: 1;
      background: transparent;
      width: 100%;
      border: 0;
      color: var(--color-menu);
      padding-left: 0px;
      font-size: 16px;
      line-height: 22px;
      font-weight: 700;
    }
    .form-input input::-webkit-input-placeholder {
      font-weight: 500;
    }
    .form-input input:-moz-placeholder {
      font-weight: 500;
    }
    .form-input input::-moz-placeholder {
      font-weight: 500;
    }
    .form-input input:-ms-input-placeholder {
      font-weight: 500;
    }
    .form-input input::-ms-input-placeholder {
      font-weight: 500;
    }
    .form-input input::placeholder {
      font-weight: 500;
    }
    .form-input input:focus {
      outline: none;
    }
  }
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s ease, opacity 0.2s ease-in-out;
}
.slide-enter {
  transform: translateX(-50%) translateY(-25px);
  opacity: 1;
}
.slide-leave-to {
  transform: translateX(-50%) translateY(0px);
  opacity: 0;
}
</style>
