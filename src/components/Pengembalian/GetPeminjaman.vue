<template>
  <div class="get-peminjaman">
    <template v-if="loading">
      <div class="d-flex flex-column align-items-center justify-content-center">
        <b-spinner
          class="icon-table icon-size"
          variant="secondary"
          style=""
        ></b-spinner>
        <p class="empty-table-description mt-4">Sedang Memuat Data...</p>
      </div>
    </template>
    <template v-else>
      <div class="search-by-peminjam" v-if="listPengembalian.length === 0">
        <div class="box-search">
          <h1 class="title-get-peminjaman">PENGEMBALIAN ALAT</h1>
          <h5 class="note-get-peminjaman">
            Silahkan masukkan Nomor Induk dari Peminjam (NIM untuk Mahasiswa dan
            NIP untuk Staff / Dosen) <br />
            untuk melanjutkan proses pengembalian alat
          </h5>
          <input
            type="text"
            v-model="nomorIndukPeminjam"
            class="form-control nomor-induk-input"
          />
          <button
            class="smil-btn smil-btn-large smil-bg-primary"
            :disabled="!enableGetList"
            @click="getListPengembalian"
          >
            Ambil Data Peminjaman
          </button>
        </div>
      </div>
      <div class="section-list-pengembalian" v-else>
        <div id="header-section" class="d-flex flex-column text-center">
          <h1 class="title-get-peminjaman">PEMINJAMAN YANG BELUM SELESAI</h1>
          <template v-if="getPeminjam !== null">
            <h5 class="note-get-peminjaman">
              {{ getPeminjam.fullname }}
            </h5>
            <p class="text-muted">{{ getPeminjam.status }}</p>
          </template>
        </div>
        <div class="smil-row w-100 justify-content-center">
          <div
            class="col-lg-3 col-md-6 col-12"
            v-for="(data, idxPengembalian) in listPengembalian"
            :key="`data-pengembalian-peminjaman-${idxPengembalian}`"
          >
            <b-card body-class="card-peminjaman">
              <b-card-title>
                <div class="d-flex align-items-center">
                  <h4 class="font-weight-bold">#{{ data.id }}</h4>
                </div>
              </b-card-title>
              <div class="content-peminjaman">
                <label>Durasi Peminjaman</label>
                <p class="data-peminjaman">
                  {{
                    `${formatDate(
                      data.created_date,
                      "DD MMMM YYYY"
                    )} - ${formatDate(
                      data.expected_return_date,
                      "DD MMMM YYYY"
                    )}`
                  }}
                </p>
              </div>
              <div class="content-peminjaman">
                <label>Tujuan Peminjaman</label>
                <p class="data-peminjaman">
                  {{ data.pjm_purpose }}
                </p>
              </div>
              <div class="content-peminjaman">
                <label>Catatan Peminjaman</label>
                <p class="data-peminjaman">
                  {{ data.pjm_notes === null ? "-" : data.pjm_notes }}
                </p>
              </div>
              <div class="button-group">
                <button
                  class="smil-btn smil-bg-primary"
                  @click="processPeminjaman(data)"
                >
                  Proses
                </button>
              </div>
            </b-card>
          </div>
        </div>
        <button
          class="smil-btn smil-bg-danger"
          style="margin-top: 30px"
          @click="cancelProses"
        >
          Batal Proses
        </button>
      </div>
    </template>
  </div>
</template>

<script>
// API
import api from "@/api/admin_api";

// Mixins
import ErrorHandlerMixins from "@/mixins/ErrorHandlerMixins";

let moment = require("moment");
export default {
  name: "get-peminjaman",
  mixins: [ErrorHandlerMixins],
  props: {
    popupAlert: Function,
    processPeminjaman: Function,
  },
  async mounted() {},
  data() {
    return {
      loading: false,
      nomorIndukPeminjam: "",
      listPengembalian: [],
    };
  },
  computed: {
    enableGetList() {
      return this.nomorIndukPeminjam !== "";
    },
    getPeminjam() {
      let listPengembalian = this.listPengembalian;
      let peminjam = { fullname: "", status: "" };
      if (listPengembalian.length === 0) {
        return null;
      }
      let pengembalian = listPengembalian[0];
      if (pengembalian.nip_staff !== null) {
        peminjam = {
          fullname: `${pengembalian.nip_staff} - ${pengembalian.staff_peminjam_model.staff_fullname}`,
          status: "STAFF/DOSEN",
        };
      } else {
        peminjam = {
          fullname: `${pengembalian.nim_mahasiswa} - ${pengembalian.mahasiswa_peminjam_model.mahasiswa_fullname}`,
          status: "MAHASISWA",
        };
      }

      return peminjam;
    },
  },
  methods: {
    async getListPengembalian() {
      this.loading = true;
      try {
        let payload = {
          nomor_induk: this.nomorIndukPeminjam,
        };
        const response = await api.getReturnedPeminjaman(payload);
        if (response.status === 200) {
          this.loading = false;
          let listRaw = response.data.data;
          if (listRaw === null) {
            this.popupAlert(false, false, response.data.response.message);
          } else if (listRaw.length === 1) {
            this.processPeminjaman(listRaw[0]);
          } else {
            this.listPengembalian = listRaw;
          }
        }
      } catch (error) {
        this.loading = false;
        let message = this.getErrorMessage(error);
        if (typeof message == "object" && message.length > 0) {
          setTimeout(() => {
            this.popupAlert(false, false, "Terjadi Kesalahan", message);
          }, 500);
        } else {
          this.popupAlert(false, false, message);
        }
      }
    },
    // Action
    cancelProses() {
      this.listPengembalian = [];
      this.nomorIndukPeminjam = "";
    },
    // Format Value
    formatDate(date, format = "DD/MM/YYYY") {
      return moment(date).format(format);
    },
  },
};
</script>

<style lang="scss" scoped>
.get-peminjaman {
  .search-by-peminjam {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    .box-search {
      text-align: center;
      .title-get-peminjaman {
        margin-bottom: 50px;
      }
      .note-get-peminjaman {
        margin-bottom: 60px;
      }
      .nomor-induk-input {
        height: 50px;
        margin-bottom: 50px;
      }
      .smil-btn {
        width: 100%;
      }
    }
  }
  .section-list-pengembalian {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    #header-section {
      margin-bottom: 30px;
      .note-get-peminjaman {
        margin-top: 20px;
        font-weight: bold;
      }
    }
    .card-peminjaman {
      display: flex;
      flex-direction: column;
      min-height: 350px;
      .content-peminjaman {
        margin-bottom: 10px;
        height: 80px;
        &:last-child {
          margin-bottom: 0;
        }
        label {
          font-weight: bold;
          color: #101939;
          text-decoration: underline;
          margin-bottom: 10px;
        }
        p {
          &.data-peminjaman {
            color: #696969;
            margin-bottom: 0;
          }
        }
      }
    }
  }
  .title-get-peminjaman {
    font-weight: bold;
    font-size: 32px;
  }
}
</style>
