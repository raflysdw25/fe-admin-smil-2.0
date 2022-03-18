<template>
  <div class="icon-class text-center" v-if="loadingForm">
    <b-spinner
      variant="secondary"
      style="width: 140px; height: 140px; margin-bottom: 20px"
    ></b-spinner>
    <p class="empty-table-description">Sedang Memuat Data...</p>
  </div>
  <div v-else class="add-alat-lab">
    <!-- START: BUTTON GROUP -->
    <div class="button-group d-flex align-items-center justify-content-end">
      <button
        class="smil-btn smil-bg-danger mr-4"
        @click="
          alatId !== null
            ? $router.go(-1)
            : $router.push({ name: 'ListAlatLaboratorium' })
        "
      >
        Batal
      </button>
      <button
        class="smil-btn smil-bg-primary"
        :disabled="!formFilled"
        @click="sendNotif"
      >
        Simpan
      </button>
    </div>
    <!-- END: BUTTON GROUP -->

    <!-- FORM GROUP -->
    <section class="section-form-group">
      <!-- ALAT INFO SECTION -->
      <p class="attention-form">* Data Wajib Diisi</p>
      <div class="smil-row">
        <div
          class="form-group col-lg-6 col-12"
          v-for="(form, idxInput) in formGroupList"
          :key="`form-input-${idxInput}`"
        >
          <label class="form-label" :for="`input-${idxInput + 1}`">
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
            :disabled="!form.isRequired"
            @change="changeValue(idxInput)"
            @keypress="formConstraint($event, form.type)"
          />
          <!-- END: INPUT TAG -->

          <!-- START: SELECT TAG -->
          <select
            v-model="form.model"
            class="custom-select"
            v-if="form.type === 'select'"
            @change="changeValue(idxInput)"
            :disabled="form.disabled"
          >
            <option :value="null" :disabled="form.isRequired">
              Pilih {{ form.label }}
            </option>
            <option
              :value="ops.id"
              v-for="(ops, idxOps) in form.options"
              :key="`options-${idxOps}`"
            >
              {{ ops.name }}
            </option>
          </select>
          <!-- END: SELECT TAG -->

          <!-- RADIO Input -->
          <template v-if="form.type === 'radio'">
            <div
              class="custom-control custom-radio"
              v-for="(ops, idxOps) in form.options"
              :key="`form-radio-ops-${idxOps}`"
            >
              <input
                :name="`radio-${idxInput}-${idxOps}-${ops.id}`"
                type="radio"
                class="custom-control-input"
                :id="`radio-${idxInput}-${idxOps}-${ops.id}`"
                :value="ops.value"
                v-model="form.model"
              />
              <label
                class="custom-control-label"
                :for="`radio-${idxInput}-${idxOps}-${ops.id}`"
              >
                {{ ops.name }}
              </label>
            </div>
          </template>
          <!-- RADIO Input -->
        </div>
      </div>
      <!-- ALAT INFO SECTION -->
      <!-- START: SPESIFIKASI SECTION -->
      <div class="spesifikasi-section">
        <h5 class="label">Spesifikasi Alat</h5>
        <div class="smil-row">
          <template
            v-if="Object.keys(spesifikasi).length > 0 || spesifikasi === ''"
          >
            <div
              class="form-group col-lg-6 col-12"
              v-for="(spec, idxSpek) in Object.keys(spesifikasi)"
              :key="`spesifikasi-${idxSpek}`"
            >
              <label class="form-label" :for="`input-${idxSpek + 1}`">
                {{ spesifikasi[spec].label }}
              </label>
              <input
                type="text"
                class="form-control"
                @change="changeSpec($event, spec)"
                v-model="spesifikasi[spec].value"
                :placeholder="spesifikasi[spec].label"
              />
            </div>
          </template>
          <template v-else>
            <div class="form-group col-12">
              <h5 class="empty-desc">
                {{ emptySpecs }}
              </h5>
            </div>
          </template>
        </div>
      </div>
      <!-- END: SPESIFIKASI SECTION -->
    </section>
    <!-- FORM GROUP -->

    <!-- START: POPUP -->
    <b-modal
      ref="modal-alert"
      id="modal-alert"
      centered
      hide-footer
      hide-header
      no-close-on-backdrop
      no-close-on-esc
    >
      <base-modal-alert
        :isProcess="alertInfo.isProcess"
        :isSuccess="alertInfo.isSuccess"
        :message="alertInfo.message"
        :notes="alertInfo.notes"
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
  name: "add-alat-lab",
  components: { BaseModalAlert },
  mixins: [AlertInfoMixin, FormInputMixins, ErrorHandlerMixins],
  data() {
    return {
      formGroupList: [
        {
          label: "Nama Alat",
          type: "text",
          model: "",
          description: "",
          placeholder: "Nama Alat Baru",
          isRequired: true,
        },
        {
          label: "Asal Pengadaan Alat",
          type: "select",
          model: null,
          description: "",
          placeholder: "Pilih Asal Pengadaan Alat",
          isRequired: true,
          options: [],
          disabled: false,
        },
        {
          label: "Tahun Pengadaan Alat",
          type: "text",
          model: "",
          description: "",
          placeholder: "Tahun Pengadaan Alat",
          isRequired: true,
        },
        {
          label: "Supplier Alat",
          type: "select",
          model: null,
          description: "",
          placeholder: "Pilih Supplier Alat",
          isRequired: false,
          options: [],
          disabled: false,
        },
        {
          label: "Jumlah Alat",
          type: "number",
          model: "",
          description: "",
          placeholder: "Jumlah Alat Baru",
          isRequired: true,
        },
        {
          label: "Jenis Alat",
          type: "select",
          model: null,
          description: "",
          placeholder: "Pilih Jenis Alat",
          isRequired: true,
          options: [],
          disabled: false,
        },
        {
          label: "Lokasi Penyimpanan",
          type: "select",
          model: null,
          description: "",
          placeholder: "Pilih Lokasi Penyimpanan",
          isRequired: true,
          options: [],
          disabled: true,
        },
        {
          label: "Satuan Jumlah",
          type: "select",
          model: null,
          description: "",
          placeholder: "Pilih Satuan Jumlah",
          isRequired: true,
          options: [],
          disabled: false,
        },
        {
          label: "Alat Habis Pakai",
          type: "radio",
          model: null,
          description: "",
          placeholder: "",
          isRequired: true,
          options: [
            {
              id: 1,
              name: "Ya",
              value: true,
            },
            {
              id: 2,
              name: "Tidak",
              value: false,
            },
          ],
          disabled: false,
        },
        {
          label: "Alat Bisa Dipinjam",
          type: "radio",
          model: null,
          description: "",
          placeholder: "",
          isRequired: true,
          options: [
            {
              id: 1,
              name: "Ya",
              value: true,
            },
            {
              id: 2,
              name: "Tidak",
              value: false,
            },
          ],
          disabled: false,
        },
      ],
      spesifikasi: {},
    };
  },
  async mounted() {
    if (this.isSuperAdmin) {
      this.$router.go(-1);
    }
    this.loadingForm = true;
    await this.getJenisAlat();
    await this.supplierList();
    await this.getAsalAlat();
    await this.getSatuanJumlah();

    if (this.alatId !== null) {
      await this.getAlatDetail();
    }
    this.loadingForm = false;
  },
  watch: {
    spesifikasi: {
      immediate: true,
      deep: true,
      handler: function () {},
    },
  },
  computed: {
    formFilled() {
      return (
        this.submitRequest.alat_name !== null &&
        this.submitRequest.asal_pengadaan_id !== null &&
        this.submitRequest.alat_year !== "" &&
        this.submitRequest.alat_total !== null &&
        this.submitRequest.jenis_alat_id !== null &&
        this.submitRequest.lokasi_id !== null &&
        this.submitRequest.satuan_id !== null &&
        this.submitRequest.habis_pakai !== null
      );
    },
    submitRequest() {
      let form = this.formGroupList;
      if (this.alatId !== null) {
        return {
          alat_name: form[0].model,
          asal_pengadaan_id: form[1].model,
          alat_year: form[2].model,
          supplier_id: form[3].model,
          alat_total: form[4].model !== "" ? parseInt(form[4].model) : null,
          jenis_alat_id: form[5].model,
          alat_specs: null,
          satuan_id: form[6].model,
          habis_pakai: form[7].model,
          can_borrowed: form[8].model,
        };
      } else {
        return {
          alat_name: form[0].model,
          asal_pengadaan_id: form[1].model,
          alat_year: form[2].model,
          supplier_id: form[3].model,
          alat_total: form[4].model !== "" ? parseInt(form[4].model) : null,
          jenis_alat_id: form[5].model,
          alat_specs: null,
          lokasi_id: form[6].model,
          satuan_id: form[7].model,
          habis_pakai: form[8].model,
          can_borrowed: form[9].model,
        };
      }
    },
    alatId() {
      return this.$route.params.alat_id ? this.$route.params.alat_id : null;
    },
    emptySpecs() {
      let wording = "";
      wording =
        this.formGroupList[5].model !== null &&
        Object.keys(this.spesifikasi).length === 0
          ? "Tidak memerlukan spesifikasi"
          : "Jenis Alat belum ditentukan";
      return wording;
    },
  },
  methods: {
    // Call API
    async supplierList() {
      try {
        const response = await api.getPlainData("supplier");
        let supplier = response.data.data;

        if (response.data.response.code == 200) {
          let list = [];
          supplier.forEach((supp) => {
            let sp = {
              id: supp.id,
              name: supp.supplier_name,
            };

            list.push(sp);
          });
          this.formGroupList[3].options = list;
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
    async getJenisAlat() {
      // Akan memanggil API Jenis Alat
      try {
        const response = await api.getPlainData("jenis");
        let jenisAlat = response.data.data;

        if (response.data.response.code == 200) {
          let list = [];
          jenisAlat.forEach((jenis) => {
            let jn = {
              id: jenis.id,
              name: jenis.jenis_name,
              attr_spek: jenis.spec_attributes,
            };

            list.push(jn);
          });
          this.formGroupList[5].options = list;
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
    async getSatuanJumlah() {
      // Memanggil API Asal Alat
      try {
        const response = await api.getPlainData("satuan");
        let satuanJumlah = response.data.data;

        if (response.data.response.code == 200) {
          let list = [];
          satuanJumlah.forEach((satuan) => {
            let ap = {
              id: satuan.id,
              name: satuan.satuan_jumlah_name,
            };

            list.push(ap);
          });
          this.formGroupList[7].options = list;
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
    async getAsalAlat() {
      // Memanggil API Asal Alat
      try {
        const response = await api.getPlainData("asal");
        let asalPengadaan = response.data.data;

        if (response.data.response.code == 200) {
          let list = [];
          asalPengadaan.forEach((asal) => {
            let ap = {
              id: asal.id,
              name: asal.asal_pengadaan_name,
            };

            list.push(ap);
          });
          this.formGroupList[1].options = list;
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
    async getLokasiBaseOnTotalAlat(totalNeed) {
      // Panggil API Lokasi Alat

      try {
        const response = await api.getLokasiNeed(totalNeed);
        let lokasi = response.data.data;

        if (response.data.response.code == 200) {
          let list = [];
          lokasi.forEach((lok) => {
            let lk = {
              id: lok.id,
              name: lok.lokasi_name,
            };

            list.push(lk);
          });
          this.formGroupList[6].options = list;
          if (list.length > 0) {
            this.formGroupList[6].disabled = false;
          } else {
            this.formGroupList[6].disabled = true;
          }
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
    async getAlatDetail() {
      try {
        const response = await api.getPlainData("alat", this.alatId);
        let data = response.data.data;

        if (response.data.response.code === 200) {
          // this.formGroupList.pop()
          let form = this.formGroupList;
          form[0].model = data.alat_name;
          form[1].model = data.asal_pengadaan_id;
          form[2].model = data.alat_year;
          form[3].model = data.supplier_id !== null ? data.supplier_id : null;
          form[4].model = data.alat_total;
          form[4].isRequired = false;
          form[5].model = data.jenis_alat_id;
          form[7].model = data.satuan_id;
          form[8].model = data.habis_pakai;
          form[9].model = data.can_borrowed;

          this.spesifikasi =
            data.alat_specs !== "" && data.alat_specs !== null
              ? JSON.parse(data.alat_specs)
              : {};
          this.formGroupList.splice(6, 1);
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
    async sendAddAlat() {
      this.isCreate = true;
      this.submitRequest.alat_specs = JSON.stringify(this.spesifikasi);
      this.popupAlert(true);
      try {
        const response = await api.createNewData("alat", this.submitRequest);
        if (response.data.response.code === 201) {
          this.popupAlert(false, true, response.data.response.message);
          setTimeout(() => {
            this.$router.push({ name: "ListAlatLaboratorium" });
          }, 2000);
        }
      } catch (e) {
        this.isCreate = false;

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
    async sendUpdatedAlat() {
      this.isCreate = true;
      this.submitRequest.alat_specs = JSON.stringify(this.spesifikasi);
      this.popupAlert(true);
      try {
        const response = await api.editData(
          "alat",
          this.alatId,
          this.submitRequest
        );
        if (response.data.response.code === 200) {
          this.popupAlert(false, true, response.data.response.message);
          setTimeout(() => {
            this.$router.go(-1);
          }, 2000);
        }
      } catch (e) {
        this.isCreate = false;

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
    // Form Interaction
    async changeValue(index) {
      let form = this.formGroupList;
      let payload = this.submitRequest;
      // Ketika Jenis Alat Disi
      if (index == 4 || index == 5) {
        if (payload.jenis_alat_id !== null) {
          this.spesifikasi = {};
          let getJenisAlat = form[5].options.find(
            (jal) => jal.id === payload.jenis_alat_id
          );
          if (getJenisAlat.attr_spek !== "") {
            let splitSpek = getJenisAlat.attr_spek.split(", ");
            splitSpek.forEach((spek) => {
              let key = spek.replace(/\s/, "_").toLowerCase(); //Mengubah spek yg terdapat spasi dengan _
              this.spesifikasi[key] = {
                label: spek,
                value: "",
              };
            });
          }
        }

        // Total Alat
        if (payload.alat_total !== null && payload.alat_total > 0) {
          await this.getLokasiBaseOnTotalAlat(payload.alat_total);
        } else {
          this.formGroupList[6].options = [];
          this.formGroupList[6].disabled = true;
        }
      }
    },
    changeSpec(event, key) {
      if (Object.keys(this.spesifikasi).length > 0) {
        this.spesifikasi[key]["value"] = event.target.value;
      }
    },
    // Notif
    sendNotif() {
      let confirmSend = confirm(`Apakah anda yakin ingin menyimpan data ini?`);
      if (confirmSend) {
        if (this.alatId !== null) {
          this.sendUpdatedAlat();
        } else {
          this.sendAddAlat();
        }
      }
    },
  },
  beforeRouteLeave(to, from, next) {
    if (!this.isCreate) {
      let confirmCancel = confirm(
        `Apakah anda yakin ingin membatalkan ${
          this.alatId !== null ? "ubah" : "tambah"
        } data? Data tidak akan tersimpan`
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

<style lang="scss" scoped>
.add-alat-lab {
  .section-form-group {
    margin-top: 30px;
  }
  .spesifikasi-section {
    .label {
      font-size: 14px;
      font-weight: 700;
      padding-left: 15px;
      margin-top: 35px;
      margin-bottom: 20px;
    }
    .empty-desc {
      font-size: 14px;
      color: #696969;
    }
  }
}
</style>

<style lang="scss">
.add-alat-lab {
  @import "@/assets/css/global.scss";
}
</style>
