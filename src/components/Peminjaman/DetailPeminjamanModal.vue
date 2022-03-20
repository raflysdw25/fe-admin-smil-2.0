<template>
  <div class="detail-peminjaman-modal">
    <div class="header-detail">
      <h5 class="title-detail">Detail Peminjaman Alat</h5>
      <span
        v-if="dataPeminjaman"
        class="smil-status"
        :class="statusPeminjaman.background"
      >
        {{ statusPeminjaman.text }}
      </span>
    </div>
    <div class="smil-row info-peminjaman" v-if="dataPeminjaman">
      <div class="col-lg-6 col-12">
        <div class="group-info">
          <label for="" class="label-peminjaman">Nama Peminjam</label>
          <p class="content-peminjaman">
            {{ infoPeminjam.namaPeminjam }}
          </p>
        </div>
        <div class="group-info">
          <label for="" class="label-peminjaman">Waktu Peminjaman</label>
          <p class="content-peminjaman">
            {{ infoPeminjam.waktuPeminjaman }}
          </p>
        </div>
        <div class="group-info">
          <label for="" class="label-peminjaman">Keperluan Peminjaman</label>
          <p class="content-peminjaman">
            {{ infoPeminjam.keperluanPeminjaman }}
          </p>
        </div>
      </div>
      <div class="col-lg-6 col-12">
        <div class="group-info">
          <label for="" class="label-peminjaman">Ruangan</label>
          <p class="content-peminjaman">
            {{ infoPeminjam.ruanganName }}
          </p>
        </div>
        <div class="group-info">
          <label for="" class="label-peminjaman">Waktu Pengembalian</label>
          <p class="content-peminjaman">
            {{ infoPeminjam.waktuPengembalian }}
          </p>
        </div>
        <div class="group-info">
          <label for="" class="label-peminjaman">Dosen Penanggung Jawab</label>
          <p class="content-peminjaman">
            {{ infoPeminjam.staffInCharge }}
          </p>
        </div>
      </div>
    </div>
    <div class="smil-row" v-if="dataPeminjaman">
      <div class="col-lg-6 col-12">
        <h5 class="title-detail">Daftar Alat Dipinjam</h5>
        <div class="table-responsive-lg mb-4 pr-2">
          <table class="table smil-table">
            <thead class="smil-thead">
              <tr>
                <th
                  v-for="(head, idxHead) in headTable"
                  :key="`table-head-${idxHead}`"
                >
                  {{ head }}
                </th>
              </tr>
            </thead>
            <tbody class="smil-tbody">
              <tr
                v-for="(
                  data, indexData
                ) in dataPeminjaman.detail_peminjaman_model"
                :key="`row-added-alat-${indexData}`"
              >
                <td>
                  {{ data.alat_pinjam.alat_name }}
                </td>
                <td>
                  {{ data.barcode_alat !== null ? data.barcode_alat : "-" }}
                </td>
                <td>
                  <span
                    v-if="data.barcode_alat !== null"
                    class="smil-status"
                    :class="
                      getKondisiAlat(data.barcode_alat_pinjam.condition_status)
                        .background
                    "
                  >
                    {{
                      getKondisiAlat(data.barcode_alat_pinjam.condition_status)
                        .text
                    }}
                  </span>
                  <template v-else> - </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="col-lg-6 col-12">
        <h5 class="title-detail">Riwayat Peminjaman</h5>
        <div
          class="list-riwayat pl-2"
          :class="dataPeminjaman.log_peminjaman.length > 3 ? 'scroll' : ''"
        >
          <div
            class="riwayat"
            v-for="(log, idxLog) in dataPeminjaman.log_peminjaman"
            :key="`list-log-${idxLog}`"
          >
            <div class="datetime-riwayat">
              {{ `${formatDate(log.created_at, "DD MMMM YYYY, HH:MM:SS A")}` }}
            </div>
            <div class="action-riwayat">
              {{ getLogPeminjaman(log) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="button-group" v-if="dataPeminjaman">
      <button
        class="smil-btn smil-bg-danger"
        @click="actionPeminjaman('delete')"
      >
        Hapus Peminjaman
      </button>
      <button
        class="smil-btn smil-bg-info"
        @click="actionPeminjaman('peminjam')"
      >
        Informasi Peminjam
      </button>
      <template v-if="dataPeminjaman.pjm_status === 1">
        <button
          class="smil-btn smil-bg-danger"
          @click="actionPeminjaman('approval', false)"
        >
          Reject Request
        </button>
        <button
          class="smil-btn smil-bg-primary"
          @click="actionPeminjaman('approval', true)"
        >
          Approve <br />
          Request
        </button>
      </template>
      <template v-if="dataPeminjaman.pjm_status === 2">
        <button
          class="smil-btn smil-bg-primary"
          @click="actionPeminjaman('register-alat')"
        >
          Daftar Alat Dipinjam
        </button>
      </template>
      <template v-if="dataPeminjaman.pjm_status === 4">
        <button
          class="smil-btn smil-bg-primary"
          @click="actionPeminjaman('pengembalian-alat')"
        >
          Selesaikan Peminjaman
        </button>
      </template>
    </div>
  </div>
</template>

<script>
let moment = require("moment");
export default {
  name: "detail-peminjaman-modal",
  props: {
    dataPeminjaman: Object,
    actionPeminjaman: Function, //reject = false, approve = true
  },
  data() {
    return {
      headTable: ["Nama Alat", "Barcode Alat", "Kondisi Alat"],
    };
  },
  computed: {
    infoPeminjam() {
      let data = this.dataPeminjaman;
      let waktuPeminjaman = this.formatDate(data.created_date, "DD MMMM YYYY");
      let waktuPengembalian = this.formatDate(
        data.expected_return_date,
        "DD MMMM YYYY"
      );
      let info = {
        namaPeminjam:
          data.nip_staff === null
            ? data.mahasiswa_peminjam_model.mahasiswa_fullname
            : data.staff_peminjam_model.staff_fullname,
        waktuPeminjaman: waktuPeminjaman,
        keperluanPeminjaman: data.pjm_purpose,
        ruanganName:
          data.ruangan_id !== null ? data.ruangan_model.ruangan_name : "-",
        waktuPengembalian: waktuPengembalian,
        staffInCharge:
          data.nip_staff_in_charge == "" || data.nip_staff_in_charge == null
            ? "-"
            : data.staff_in_charge_model.staff_fullname,
      };

      return info;
    },
    statusPeminjaman() {
      if (this.dataPeminjaman) {
        let listStatus = [
          {
            id: 1,
            text: "Butuh Persetujuan",
            background: "smil-bg-warning",
          },
          {
            id: 2,
            text: "Alat belum diambil",
            background: "smil-bg-info",
          },
          {
            id: 3,
            text: "Ditolak",
            background: "smil-bg-danger",
          },
          {
            id: 4,
            text: "Belum Kembali",
            background: "smil-bg-warning",
          },
          {
            id: 5,
            text: "Selesai",
            background: "smil-bg-success",
          },
        ];

        return listStatus.find(
          (status) => status.id === this.dataPeminjaman.pjm_status
        );
      }
    },
  },
  methods: {
    formatDate(date, format = "DD/MM/YYYY") {
      return moment(date).format(format);
    },
    getKondisiAlat(conditionStatus) {
      let listKondisi = [
        {
          id: 1,
          text: "Pending",
          background: "smil-bg-pending",
        },
        {
          id: 2,
          text: "Baik",
          background: "smil-bg-success",
        },
        {
          id: 3,
          text: "Rusak",
          background: "smil-bg-danger",
        },
        {
          id: 4,
          text: "Habis",
          background: "smil-bg-warning",
        },
        {
          id: 5,
          text: "Diperbaiki",
          background: "smil-bg-info",
        },
        {
          id: 6,
          text: "Apkir",
          background: "smil-bg-danger",
        },
      ];

      return listKondisi.find((kondisi) => kondisi.id === conditionStatus);
    },
    getLogPeminjaman(log) {
      let listAction = {
        CREATED: "membuat permintaan peminjaman alat",
        REGISTER: "mendaftarkan alat yang dipinjam",
        ACCEPTED: "menyetujui permintaan peminjaman alat",
        REJECTED: "menolak permintaan peminjaman alat",
        RETURN: "menyelesaikan peminjaman alat",
      };
      let logWording = `${log.created_by} ${listAction[log.action]}`;
      return logWording;
    },
  },
};
</script>

<style lang="scss" scoped>
.detail-peminjaman-modal {
  padding: 20px;
  .header-detail {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;
    .title-detail {
      margin-right: 12px;
      margin-bottom: 0;
    }
    .smil-status {
      width: 100px;
    }
  }
  .title-detail {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 30px;
    text-decoration: underline;
  }
  .smil-row {
    .col-lg-6 {
      padding-left: 0;
      padding-right: 0;
    }
  }

  .info-peminjaman {
    margin-bottom: 30px;
    .group-info {
      display: flex;
      margin-bottom: 20px;
      .label-peminjaman {
        width: 350px;
        margin-right: 20px;
        font-size: 16px;
        font-weight: bold;
      }
      .content-peminjaman {
        width: 100%;
        font-size: 16px;
        margin-bottom: 0;
      }
    }
  }

  .list-riwayat {
    &.scroll {
      overflow-y: scroll;
    }
    .riwayat {
      display: flex;
      margin-bottom: 10px;
      &:last-child {
        margin-bottom: 0;
      }
      .datetime-riwayat {
        width: 100%;
        font-weight: bold;
      }
      .action-riwayat {
        width: 100%;
        color: #696969;
      }
    }
  }
  .button-group {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 70px;
    button {
      &.smil-btn {
        margin: 0 8px;
        &:last-child {
          margin-right: 0;
        }
        &:first-child {
          margin-left: 0;
        }
      }
    }
  }
}
</style>
