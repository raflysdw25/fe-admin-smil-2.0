<template>
  <div class="add-staff-jurusan">
    <!-- START: BUTTON GROUP -->
    <div class="button-group d-flex align-items-center justify-content-end">
      <button
        class="smil-btn smil-bg-danger mr-4"
        @click="$router.push({ name: 'ListCivitasJurusan' })"
      >
        Batal
      </button>
      <button
        class="smil-btn smil-bg-primary"
        :disabled="!formFilled"
        @click="confirmNotif"
      >
        Simpan
      </button>
    </div>
    <!-- END: BUTTON GROUP -->
    <section class="section-form-group">
      <p class="attention-form">* Data Wajib Diisi</p>
      <div class="smil-row">
        <div class="icon-class text-center" v-if="loadingForm">
          <b-spinner
            variant="secondary"
            style="width: 140px; height: 140px; margin-bottom: 20px"
          ></b-spinner>
          <p class="empty-table-description">Sedang Memuat Data...</p>
        </div>
        <div
          v-else
          class="form-group col-lg-6 col-12"
          v-for="(form, indexInput) in formGroupList"
          :key="`form-input-${indexInput}`"
        >
          <label class="form-label" :for="`input-${indexInput + 1}`">
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
            v-if="formInputType(form.type) === 'input'"
            class="form-control"
            v-model="form.model"
            :placeholder="form.placeholder"
            :required="form.isRequired"
            :disabled="form.disabled"
            @keypress="formConstraint($event, form.type)"
          />
          <!-- END: INPUT TAG -->

          <!-- START: Text Area -->
          <textarea
            class="form-control"
            v-if="form.type === 'text-area'"
            v-model="form.model"
            cols="30"
            rows="10"
            :placeholder="form.placeholder"
          ></textarea>
          <!-- END: Text Area -->

          <!-- START: SELECT TAG -->
          <select
            v-if="form.type === 'select'"
            class="custom-select"
            v-model="form.model"
            :required="form.isRequired"
          >
            <option :value="null" :disabled="form.isRequired">
              Pilih Program Studi
            </option>
            <option
              v-for="(ops, indexOps) in form.options"
              :key="`option-${form.model}-${indexOps}-${ops.id}`"
              :disabled="ops.disabled"
              :value="ops.value"
            >
              {{ ops.name }}
            </option>
          </select>
          <!-- END: SELECT TAG -->
        </div>
      </div>
    </section>

    <!-- START: POPUP -->
    <b-modal
      ref="modal-alert"
      hide-header
      hide-footer
      no-close-on-backdrop
      no-close-on-esc
      centered
    >
      <base-modal-alert
        :isProcess="alertInfo.isProcess"
        :isSuccess="alertInfo.isSuccess"
        :message="alertInfo.message"
        :closeAlert="closeAlert"
      />
    </b-modal>
    <!-- END: POPUP -->
  </div>
</template>

<script>
// Components
import BaseModalAlert from "@/components/BaseModal/BaseModalAlert";

// Mixins
import FormInputMixins from "@/mixins/FormInputMixins";
import ErrorHandlerMixins from "@/mixins/ErrorHandlerMixins";
import AlertInfoMixin from "@/mixins/AlertInfoMixin";

// API
import api from "@/api/admin_api";
export default {
  name: "add-staff-jurusan",
  mixins: [AlertInfoMixin, FormInputMixins, ErrorHandlerMixins],
  components: { BaseModalAlert },
  computed: {
    formFilled() {
      let submit = this.submitRequest;
      return (
        submit.nip !== "" &&
        submit.staff_fullname !== "" &&
        submit.email !== "" &&
        this.emailValidate(submit.email) &&
        submit.phone_number !== ""
      );
    },
    submitRequest() {
      let form = this.formGroupList;
      let prodi = this.formGroupList[3].options.find(
        (ops) => ops.text === this.formGroupList[3].model
      );
      return {
        nip: form[0].model,
        staff_fullname: form[1].model,
        email: form[2].model,
        phone_number: form[4].model,
        address: form[5].model,
        prodi_id: form[3].model,
      };
    },
    staffNip() {
      return this.$route.params.staff_nip ? this.$route.params.staff_nip : null;
    },
  },
  data() {
    return {
      formGroupList: [
        {
          label: "Nomor Induk Pegawai",
          type: "text",
          model: "",
          description: "",
          placeholder: "Nomor Induk Pegawai",
          isRequired: true,
          disabled: false,
        },
        {
          label: "Nama Pegawai",
          type: "text",
          model: "",
          description: "",
          placeholder: "Nama Pegawai",
          isRequired: true,
          disabled: false,
        },
        {
          label: "Email",
          type: "email",
          model: "",
          description: "",
          placeholder: "Email",
          isRequired: true,
          disabled: false,
        },
        {
          label: "Program Studi",
          type: "select",
          model: null,
          description: "",
          placeholder: "Program Studi",
          isRequired: false,
          disabled: false,
          options: [],
        },
        {
          label: "Nomor Telepon",
          type: "tel",
          model: "",
          description: "",
          placeholder: "Nomor Telepon",
          isRequired: true,
          disabled: false,
        },
        {
          label: "Alamat",
          type: "text-area",
          model: "",
          description: "",
          placeholder: "Alamat Staff",
          isRequired: false,
          disabled: false,
        },
      ],
    };
  },
  async mounted() {
    await this.getListProdi();
    if (this.staffNip !== null) {
      await this.getStaffJurusan();
    }
  },
  watch: {},
  methods: {
    // Call API
    async getStaffJurusan() {
      this.loadingForm = true;
      try {
        const response = await api.getDetailData("staff", this.staffNip);
        if (response.data.response.code === 200) {
          let stf = response.data.data;
          let form = this.formGroupList;
          form[0].disabled = true;
          form[0].model = stf.nip;
          form[1].model = stf.staff_fullname;
          form[2].model = stf.email;
          form[3].model = stf.prodi_id;
          form[4].model = stf.phone_number;
          form[5].model = stf.address;
        } else {
          this.popupAlert(false, false, response.data.response.message);
        }
      } catch (e) {
        let message = this.getErrorMessage(e);
        if (typeof message == "object" && message.length > 0) {
          setTimeout(() => {
            this.popupAlert(false, false, "Terjadi Kesalahan", message);
          }, 500);
        } else {
          this.popupAlert(false, false, message);
        }
      } finally {
        this.loadingForm = false;
      }
    },
    async getListProdi() {
      try {
        const response = await api.getPlainData("prodi");
        let prodi = response.data.data;
        prodi.forEach((pd) => {
          let option = {
            id: pd.id,
            name: pd.prodi_name,
            value: pd.id,
          };
          this.formGroupList[3].options.push(option);
        });
      } catch (e) {
        let message = this.getErrorMessage(e);
        if (typeof message == "object" && message.length > 0) {
          setTimeout(() => {
            this.popupAlert(false, false, "Terjadi Kesalahan", message);
          }, 500);
        } else {
          this.popupAlert(false, false, message);
        }
      }
    },
    async sendAddStaffJurusan() {
      this.isCreate = true;
      this.popupAlert(true);
      try {
        const response = await api.createNewData("staff", this.submitRequest);
        if (response.data.response.code === 201) {
          this.popupAlert(false, true, "Tambah Staff Berhasil");
          setTimeout(() => {
            this.$router.push({ name: "ListCivitasJurusan" });
          }, 2000);
        } else {
          this.popupAlert(false, false, response.data.response.message);
        }
      } catch (e) {
        let message = this.getErrorMessage(e);
        if (typeof message == "object" && message.length > 0) {
          setTimeout(() => {
            this.popupAlert(false, false, "Terjadi Kesalahan", message);
          }, 500);
        } else {
          this.popupAlert(false, false, message);
        }
      }
    },
    async editStaffJurusan() {
      this.isCreate = true;
      this.popupAlert(true);
      try {
        const response = await api.editData(
          "staff",
          this.staffNip,
          this.submitRequest
        );
        if (response.data.response.code === 200) {
          this.popupAlert(false, true, "Edit Staff berhasil dilakukan");
          setTimeout(() => {
            this.$router.push({ name: "ListCivitasJurusan" });
          }, 2000);
        } else {
          this.popupAlert(false, false, response.data.response.message);
        }
      } catch (e) {
        let message = this.getErrorMessage(e);
        if (typeof message == "object" && message.length > 0) {
          setTimeout(() => {
            this.popupAlert(false, false, "Terjadi Kesalahan", message);
          }, 500);
        } else {
          this.popupAlert(false, false, message);
        }
      } finally {
        this.selectedRowId = null;
      }
    },
    // Notif
    confirmNotif() {
      let confirmAction = confirm(
        "Apakah anda yakin ingin menyimpan data staff jurusan?"
      );
      if (confirmAction) {
        if (this.staffNip === null) {
          this.sendAddStaffJurusan();
        } else {
          this.editStaffJurusan();
        }
      }
    },
  },
  beforeRouteLeave(to, from, next) {
    if (!this.isCreate) {
      let confirmCancel = confirm(
        `Apakah anda yakin ingin membatalkan ${
          this.staffNip !== null ? "edit data" : "tambah data"
        } staff jurusan?`
      );
      if (confirmCancel) {
        next();
      }
    } else {
      next();
    }
  },
};
</script>

<style lang="scss" scoped></style>
<style lang="scss">
.add-staff-jurusan {
  input.form-control,
  .custom-select {
    color: #000;
    background-color: #fff;
    border-color: #c5c5c5;
    border-radius: 5px;
    font-size: 12px;
    &:focus {
      box-shadow: 0 0 0 5px #c5c5c5;
    }
    &:disabled {
      background-color: #c5c5c5;
      border-color: #696969;
    }

    height: 40px;
  }
}
</style>
