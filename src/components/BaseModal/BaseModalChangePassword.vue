<template>
  <div class="base-modal-change-password">
    <h4 class="font-weight-bold mb-4">Ubah Password Akun Anda</h4>
    <div class="form-section">
      <div
        v-for="(form, indexInput) in formGroupList"
        :key="`form-input-${indexInput}-${form.id}`"
      >
        <b-form-group :label-for="`input-${indexInput + 1}`">
          <template slot="label">
            {{ form.label }}
            <span
              v-if="form.isRequired"
              style="color: #dc3545; font-size: 14px"
            >
              *
            </span>
          </template>
          <b-input-group>
            <b-form-input
              :id="`input-${indexInput + 1}`"
              :type="form.type"
              class="form-control"
              v-model="formInput[form.model]"
              :placeholder="form.placeholder"
              :required="form.isRequired"
              @keypress.enter="loginPeminjam"
              :state="
                form.type === 'email'
                  ? emailValidate(formInput[form.model])
                  : null
              "
            />
            <template #append>
              <b-input-group-text
                class="password-visible"
                @click="changePasswordType(form)"
              >
                <b-icon
                  :icon="form.type === 'password' ? 'eye-slash' : 'eye'"
                  class="trigger-input-password"
                ></b-icon>
              </b-input-group-text>
            </template>
          </b-input-group>
        </b-form-group>
      </div>
      <div class="button-group">
        <button
          class="smil-btn smil-bg-primary"
          :disabled="!formFilled"
          @click="changePassword"
        >
          Simpan
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// API
import api from "@/api/admin_api";

export default {
  name: "base-modal-change-password",
  props: {
    popupAlert: Function,
    closePopup: Function,
  },
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
      this.popupAlert(true);
      try {
        const response = await api.changePassword(
          this.userData.id,
          this.formInput
        );

        let peminjam = response.data;
        if (peminjam.response.code === 200) {
          this.popupAlert(false, true, peminjam.response.message);
          setTimeout(() => {
            this.closePopup();
          }, 2000);
        }
      } catch (e) {
        let errorMessage = e.response
          ? e.response.data.response.message
          : e.message;
        this.popupAlert(false, false, errorMessage);
        this.resetPasswordPeminjam();
      }
    },
    resetPasswordPeminjam() {
      this.formInput.password = "";
      this.formInput.password_confirmation = "";
    },
    changePasswordType(form) {
      form.type = form.type === "password" ? "text" : "password";
    },
  },
};
</script>

<style lang="scss" scoped>
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
</style>
