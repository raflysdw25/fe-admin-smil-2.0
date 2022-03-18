<template>
  <div class="process-pengembalian">
    <div class="header-process">
      <h1 class="title-header-process">Informasi Peminjaman Alat</h1>
      <div class="button-group">
        <button
          class="smil-btn smil-bg-danger mr-2"
          @click="cancelPengembalian"
        >
          Batal
        </button>
        <button
          class="smil-btn smil-bg-primary"
          :disabled="
            !listAlatDipinjam.every((list) => list.isVerified === true)
          "
          @click="returnPeminjaman"
        >
          Simpan
        </button>
      </div>
    </div>
    <div class="content-process">
      <!-- START: Data Diri -->
      <b-row v-if="Object.keys(selectedData).length !== 0">
        <b-col lg="6">
          <table class="table table-borderless smil-table info-table">
            <tr>
              <th class="info-peminjam">Nama Peminjam</th>
              <td>
                {{
                  selectedData.nim_mahasiswa !== null
                    ? selectedData.mahasiswa_peminjam_model.mahasiswa_fullname
                    : selectedData.staff_peminjam_model.staff_fullname
                }}
              </td>
            </tr>
            <tr>
              <th class="info-peminjam">Waktu Peminjaman</th>
              <td>
                {{ formatDate(selectedData.created_date, "DD MMMM YYYY") }}
              </td>
            </tr>
            <tr>
              <th class="info-peminjam">Keperluan</th>
              <td>
                {{ selectedData.pjm_purpose }}
              </td>
            </tr>
          </table>
        </b-col>
        <b-col lg="6">
          <table class="table table-borderless smil-table info-table">
            <tr>
              <th class="info-peminjam">Ruang Pemakaian</th>
              <td>
                {{
                  selectedData.ruangan_id !== null
                    ? selectedData.ruangan_model.ruangan_name
                    : "-"
                }}
              </td>
            </tr>
            <tr>
              <th class="info-peminjam">Waktu Pengembalian</th>
              <td>
                {{
                  formatDate(selectedData.expected_return_date, "DD MMMM YYYY")
                }}
              </td>
            </tr>
            <tr>
              <th class="info-peminjam">Dosen Penanggung Jawab</th>
              <td>
                {{
                  selectedData.nip_staff_in_charge !== null
                    ? selectedData.staff_in_charge_model.staff_fullname
                    : "-"
                }}
              </td>
            </tr>
          </table>
        </b-col>
      </b-row>
      <!-- END: Data Diri -->

      <!-- START: Table Alat Dipinjam -->
      <b-row v-if="Object.keys(selectedData).length !== 0">
        <b-col lg="12">
          <div
            class="title-section d-flex align-align-items-start justify-content-between"
          >
            <h4 class="title-content-process">Daftar Alat yang Dipinjam</h4>
          </div>
          <div class="table-responsive-lg mt-4">
            <table class="table smil-table">
              <thead class="smil-thead">
                <tr>
                  <th
                    v-for="(head, idxHead) in headsTable"
                    :key="`table-head-${idxHead}`"
                  >
                    {{ head }}
                  </th>
                </tr>
              </thead>
              <tbody class="smil-tbody">
                <tr v-if="listAlatDipinjam.length === 0">
                  <td
                    :colspan="headsTable.length"
                    class="empty-table text-center"
                  >
                    <span class="empty-table-description">
                      Tidak ada alat yang dapat ditampilkan
                    </span>
                  </td>
                </tr>
                <tr
                  v-else
                  v-for="(data, indexData) in listAlatDipinjam"
                  :key="`row-alat-dipinjam-${indexData}`"
                >
                  <td>
                    {{ data.barcode_alat }}
                  </td>
                  <td>
                    {{ data.barcode_alat_pinjam.alat_model.alat_name }}
                  </td>
                  <td>
                    <div @click="verifyAlat(indexData)" v-if="!data.isVerified">
                      <icon-component
                        v-b-tooltip.hover
                        title="Verifikasi Alat"
                        iconClass="scanner-class"
                        iconName="scanner"
                        :size="42"
                        colorIcon="#101939"
                      />
                    </div>
                    <div v-else>
                      <b-icon
                        icon="check-circle-fill"
                        style="width: 42px; height: 42px"
                        variant="success"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </b-col>
      </b-row>
      <!-- END: Table Alat Dipinjam -->
    </div>

    <b-modal v-model="openCheckBarcode" hide-header hide-footer>
      <check-barcode
        :barcodeToCheck="selectedAlatDipinjam.barcode_alat"
        :submitCheck="isAlatVerify"
        :closeModal="closeCheckBarcode"
      />
    </b-modal>
  </div>
</template>

<script>
// API
import api from "@/api/admin_api";

// Components
import IconComponent from "@/components/IconComponent";
import CheckBarcode from "@/components/Pengembalian/CheckBarcode";

// Mixins
import ErrorHandlerMixins from "@/mixins/ErrorHandlerMixins";
let moment = require("moment");
export default {
  name: "process-pengembalian",
  components: { IconComponent, CheckBarcode },
  mixins: [ErrorHandlerMixins],
  props: {
    selectedData: Object,
    popupAlert: Function,
    cancelPengembalian: Function,
  },
  data() {
    return {
      headsTable: ["Barcode", "Nama Alat", "Verifikasi Alat"],
      openCheckBarcode: false,
      selectedRowAlat: null,
      selectedAlatDipinjam: {},
      isSetupData: false,
    };
  },

  mounted() {
    this.isSetupData = true;
    setTimeout(() => {
      this.isSetupData = false;
    }, 500);
  },
  computed: {
    allAlatVerified() {
      return this.listAlatDipinjam.every((list) => list.isVerified === true);
    },
    listAlatDipinjam() {
      if (this.selectedData.detail_peminjaman_model) {
        let dataAlatDipinjam = this.selectedData.detail_peminjaman_model;
        if (this.isSetupData) {
          dataAlatDipinjam.forEach((detail) => {
            let verifiedAlat = false;
            let detailAlat = detail.barcode_alat_pinjam;
            if (
              detailAlat.condition_status !== 2 ||
              detailAlat.alat_model.habis_pakai
            ) {
              verifiedAlat = true;
            }

            detail.isVerified = verifiedAlat;
          });
        }
        return dataAlatDipinjam;
      } else {
        return [];
      }
    },
  },
  methods: {
    async returnPeminjaman() {
      this.popupAlert(true);
      try {
        const response = await api.returnPeminjaman(this.selectedData.id);
        if (response.data.response.code === 200) {
          this.popupAlert(false, true, response.data.response.message);
          setTimeout(() => {
            this.$router.push({ name: "ListPeminjamanAlat" });
          }, 2000);
        }
      } catch (e) {
        this.isCreate = false;
        if (this.environment == "development") {
          console.log(e);
        }
        let message = this.getErrorMessage(e);
        if (typeof message == "object" && message.length > 0) {
          this.popupAlert(false, false, "Terjadi Kesalahan", message);
        } else {
          this.popupAlert(false, false, message);
        }
      }
    },
    formatDate(date, format = "DD/MM/YYYY") {
      return moment(date).format(format);
    },
    verifyAlat(indexDataAlat) {
      this.selectedRowAlat = indexDataAlat;
      this.selectedAlatDipinjam = this.listAlatDipinjam[indexDataAlat];
      this.openCheckBarcode = true;
    },
    isAlatVerify(isVerify) {
      let data = this.listAlatDipinjam[this.selectedRowAlat];
      console.log("Data Alat: ", data);
      if (data && isVerify) {
        data.isVerified = true;
      }
    },
    // Popup Methods
    closeCheckBarcode() {
      this.openCheckBarcode = false;
      this.selectedRowAlat = null;
      this.selectedAlatDipinjam = {};
    },
  },
};
</script>

<style lang="scss" scoped>
.process-pengembalian {
  padding: 20px;
  .header-process {
    display: flex;
    align-items: center;
    .title-header-process {
      font-weight: bold;
      font-size: 32px;
    }
    .button-group {
      display: flex;
      margin-left: auto;
    }
  }
  .content-process {
    margin-top: 50px;
    .title-section {
      margin-top: 50px;
      .title-content-process {
        font-size: 20px;
        margin-bottom: 0;
        font-weight: 700;
      }
    }
    .smil-table {
      &.info-table {
        th {
          &.info-peminjam {
            width: 210px;
          }
        }
        th,
        td {
          padding: 15px 10.5px;
        }
      }
    }
    .scanner-class {
      width: max-content;
      &:hover {
        cursor: pointer;
      }
    }
  }
}
</style>
