<template>
  <div class="first-login-admin">
    <section class="first-login-form-section">
      <h4 class="font-weight-bold text-center">
        Selamat,
        {{ userData.staff_model ? userData.staff_model.staff_fullname : "-" }}
      </h4>
      <h6 class="text-center">
        Password pada akun anda masih password default, Silahkan atur password
        terlebih dahulu sebelum melanjutkan
      </h6>
      <div class="form-section">
        <div
          class="form-group"
          v-for="(form, indexInput) in formGroupList"
          :key="`form-input-${indexInput}-${form.id}`"
        >
          <label :for="`input-${indexInput + 1}`">
            {{ form.label }}
            <span
              v-if="form.isRequired"
              style="color: #dc3545; font-size: 14px"
            >
              *
            </span>
          </label>
          <!-- START: INPUT TAG -->
          <input
            :type="form.type"
            class="form-control"
            v-model="formInput[form.model]"
            :placeholder="form.placeholder"
            :required="form.isRequired"
          />
          <!-- END: INPUT TAG -->
        </div>
        <div class="button-group">
          <button
            class="smil-btn smil-bg-primary"
            :disabled="!formFilled"
            @click="changePassword"
          >
            Ganti Password
          </button>
          <p @click="skip">Lewati Langkah Ini</p>
        </div>
      </div>
    </section>

    <b-modal
      ref="modal-popup"
      no-close-on-backdrop
      no-close-on-esc
      hide-header
      hide-footer
      centered
    >
      <base-modal-alert
        v-if="baseModalType === 'alert'"
        :isProcess="isProcess"
        :isSuccess="isSuccess"
        :message="message"
        :closeAlert="closePopup"
      />
    </b-modal>
  </div>
</template>

<script>
// API
import api from "@/api/admin_api";
import CryptoJs from "crypto-js";
// Componenets
import BaseModalAlert from "@/components/BaseModal/BaseModalAlert";

// Mixins
import ModalMixins from "@/mixins/ModalMixins";
import ErrorHandlerMixins from "@/mixins/ErrorHandlerMixins";

// Vuex
import * as types from "@/store/types";
export default {
  name: "first-login-admin",
  components: { BaseModalAlert },
  mixins: [ModalMixins, ErrorHandlerMixins],
  data() {
    return {
      formGroupList: [
        {
          id: 1,
          label: "Password Baru",
          type: "password",
          model: "password",
          description: "",
          placeholder: "Password Baru",
          isRequired: true,
        },
        {
          id: 2,
          label: "Konfirmasi Password Baru",
          type: "password",
          model: "password_confirmation",
          description: "",
          placeholder: "Konfirmasi Password Baru",
          isRequired: true,
        },
      ],

      formInput: {
        password: "",
        password_confirmation: "",
      },
      buttonActive: false,
    };
  },
  mounted() {
    // this.showAlert(false, false, 'Alert Berhasil')
  },
  watch: {},
  computed: {
    formFilled() {
      return (
        this.formInput.password !== "" &&
        this.formInput.password_confirmation !== "" &&
        this.formInput.password === this.formInput.password_confirmation
      );
    },
    userData() {
      return this.$store.state.admin ? this.$store.state.admin : null;
    },
  },
  methods: {
    async changePassword() {
      // Request Login via API
      this.showAlert(true);
      try {
        const response = await api.changePassword(
          this.userData.id,
          this.formInput
        );

        let admin = response.data;
        if (admin.response.code === 200) {
          this.action();
          this.showAlert(false, true, admin.response.message);
          setTimeout(() => {
            this.$router.push({ name: "DashboardAdmin" });
          }, 1500);
        }
      } catch (e) {
        let errorMessage = this.getErrorMessage(e, "modal");
        this.showAlert(false, false, errorMessage);
        this.resetLoginAdmin();
      }
    },
    action() {
      this.userData.first_login = false;
      this.userData.skipChangePassword = true;
      let cipherData = CryptoJs.AES.encrypt(
        JSON.stringify(this.userData),
        process.env.VUE_APP_KEY
      ).toString();
      let e64 = CryptoJs.enc.Base64.parse(cipherData);
      let eHex = e64.toString(CryptoJs.enc.Hex);
      $cookies.set("smilAdminAuth", eHex, "12h");
    },
    skip() {
      this.action();
      this.$router.push({ name: "DashboardAdmin" });
    },
    resetLoginAdmin() {
      this.formInput.password = "";
      this.formInput.password_confirmation = "";
    },
  },
};
</script>

<style lang="scss" scoped>
.first-login-admin {
  display: flex;
  height: 100vh;
  // background-color: #c5c5c5;
  font-family: Arial, Helvetica, sans-serif;
  .first-login-form-section {
    width: 550px;
    margin: auto;
    display: flex;
    align-items: center;
    flex-flow: column;

    .form-section {
      margin-top: 30px;
      width: 360px;
      .button-group {
        display: flex;
        flex-flow: column;
        button {
          width: 100%;
          margin-bottom: 10px;
        }
        p {
          text-align: center;
          color: #c5c5c5;
          &:hover {
            color: #101939;
            cursor: pointer;
            font-weight: bold;
          }
        }
      }
    }
  }
}
@media screen and (max-width: 992px) {
  .first-login-admin {
    overflow-x: hidden;
    align-items: center;
    .first-login-form-section {
      .banner-jurusan {
        width: 350px;

        .banner-title {
          font-size: 14px;
        }
        img {
          width: 70px;
          height: 70px;
        }
      }
      h4 {
        font-size: 18px;
      }
    }
  }
}
</style>

<style lang="scss">
.first-login-admin {
  @import "@/assets/css/global.scss";
}
</style>
