<template>
  <div class="dashboard-admin">
    <div
      class="d-flex align-items-center flex-column"
      style="margin-top: 100px"
      v-if="loadingPage"
    >
      <b-spinner
        variant="secondary"
        style="width: 150px; height: 150px; margin-bottom: 20px"
      ></b-spinner>
      <p style="font-size: 14px; color: #696969">Sedang Memuat Data...</p>
    </div>
    <template v-else>
      <!-- START: SECTION STATISTIC -->
      <section class="section-statistic">
        <div class="title-section d-flex">
          <div class="flex-column">
            <h4 class="title">Statistik Laboratorium</h4>
            <p class="title-description">Per {{ currentDate }}</p>
          </div>
          <div class="ml-auto">
            <h4 class="title">{{ statistic.total_alat }}</h4>
            <p class="title-description">Alat Terdaftar</p>
          </div>
        </div>
        <div class="statistic-section">
          <div
            class="statistic-card"
            :class="stc.class"
            v-for="(stc, indexStc) in statisticCount"
            :key="`statistic-${indexStc}-card-${stc.id}`"
          >
            <div class="statistic-body">
              <div class="statistic-info">
                <p class="statistic-count">{{ statistic[stc.modelCount] }}</p>
                <p class="statistic-description">
                  {{ stc.text }}
                </p>
              </div>
              <b-icon :icon="stc.icon" class="ml-auto icon-size"></b-icon>
            </div>
            <div class="statistic-footer" v-if="!isSuperAdmin">
              <p @click="listAlatDashboard(stc.conditionCode)">Lihat Detail</p>
            </div>
          </div>
        </div>
      </section>
      <!-- END: SECTION STATISTIC -->

      <!-- START: SECTION NEW ACTIVITY -->
      <section class="section-new-activity">
        <div class="title-section">
          <h6 class="sub-title">Aktivitas Terbaru</h6>
        </div>
        <div class="tabs-menu">
          <b-tabs>
            <b-tab
              v-for="(tab, idxTab) in tabNewActivity"
              :key="`tab-menu-${idxTab}`"
              :title="tab.tabTitle"
              lazy
              :active="activeTab == tab.id"
              @click="setActiveTab(tab.id)"
            >
              <div class="title-section d-flex align-items-start">
                <div class="flex-column">
                  <h4 class="title">Update Data</h4>
                  <p class="title-description">Per {{ currentDate }}</p>
                </div>
                <button
                  v-if="!isSuperAdmin"
                  class="smil-btn smil-bg-primary ml-auto"
                  @click="$router.push({ name: tab.routeDetail })"
                >
                  Selengkapnya
                </button>
              </div>
              <div class="table-responsive-lg">
                <table class="table smil-table">
                  <thead class="smil-thead">
                    <tr>
                      <th
                        v-for="(head, indexHds) in tableData.head"
                        :key="`header-table-${head}-${indexHds}`"
                      >
                        {{ head }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="smil-tbody" v-if="tableData.body.length === 0">
                    <tr>
                      <td
                        :colspan="tableData.head.length"
                        class="text-center empty-table"
                      >
                        <icon-component
                          iconName="empty-files"
                          :size="64"
                          colorIcon="#c5c5c5"
                          iconClass="icon-table"
                        />
                        <span class="empty-table-description">
                          Tidak ada data yang dapat ditampilkan
                        </span>
                      </td>
                    </tr>
                  </tbody>
                  <tbody class="smil-tbody" v-else>
                    <tr
                      v-for="(row, indexRow) in tableData.body"
                      :key="`body-table-peminjaman-${indexRow}`"
                    >
                      <td
                        v-for="(content, idxContent) in row"
                        :key="`column-peminjaman-${idxContent}`"
                      >
                        <template v-if="idxContent === row.length - 1">
                          <span class="smil-status" :class="content.background">
                            {{ content.text }}
                          </span>
                        </template>
                        <template v-else>
                          {{ content === null ? "-" : content }}
                        </template>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </b-tab>
          </b-tabs>
        </div>
      </section>
      <!-- END: SECTION NEW ACTIVITY -->

      <!-- START: SECTION PEMINJAMAN TABLE SUMMARY -->
      <!-- <section class="section-peminjaman-summary">
				<div class="title-section d-flex align-items-start">
					<div class="flex-column">
						<h4 class="title">Peminjaman Alat Terbaru</h4>
						<p class="title-description">Per {{ currentDate }}</p>
					</div>
					<button
						v-if="!isSuperAdmin"
						class="smil-btn smil-bg-primary ml-auto"
						@click="$router.push({ name: 'ListPeminjamanAlat' })"
					>
						Selengkapnya
					</button>
				</div>

				<div class="table-responsive-lg">
					<table class="table smil-table">
						<thead class="smil-thead">
							<tr>
								<th
									v-for="(head, indexHds) in headsPeminjaman"
									:key="`header-table-${head}-${indexHds}`"
								>
									{{ head }}
								</th>
							</tr>
						</thead>
						<tbody class="smil-tbody" v-if="bodysPeminjaman.length === 0">
							<tr>
								<td
									:colspan="headsPeminjaman.length"
									class="text-center empty-table"
								>
									<icon-component
										iconName="empty-files"
										:size="64"
										colorIcon="#c5c5c5"
										iconClass="icon-table"
									/>
									<span class="empty-table-description">
										Tidak ada data yang dapat ditampilkan
									</span>
								</td>
							</tr>
						</tbody>
						<tbody class="smil-tbody" v-else>
							<tr
								v-for="(row, indexRow) in bodysPeminjaman"
								:key="`body-table-peminjaman-${indexRow}`"
							>
								<td
									v-for="(content, idxContent) in row"
									:key="`column-peminjaman-${idxContent}`"
								>
									<template v-if="idxContent === 3">
										<span class="smil-status" :class="content.background">
											{{ content.text }}
										</span>
									</template>
									<template v-else>
										{{ content }}
									</template>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section> -->
      <!-- END: SECTION PEMINJAMAN TABLE SUMMARY -->

      <!-- START: SECTION KERUSAKAN ALAT TABLE SUMMARY -->
      <!-- <section class="section-laporan-kerusakan-summary">
				<div class="title-section d-flex align-items-start">
					<div class="flex-column">
						<h4 class="title">Laporan Kerusakan Alat Terbaru</h4>
						<p class="title-description">Per {{ currentDate }}</p>
					</div>
					<button
						v-if="!isSuperAdmin"
						class="smil-btn smil-bg-primary ml-auto"
						@click="$router.push({ name: 'LaporanKerusakanAlat' })"
					>
						Selengkapnya
					</button>
				</div>

				<div class="table-responsive-lg">
					<table class="table smil-table">
						<thead class="smil-thead">
							<tr>
								<th
									v-for="(head, indexHds) in headKerusakan"
									:key="`header-table-${head}-${indexHds}`"
								>
									{{ head }}
								</th>
							</tr>
						</thead>
						<tbody class="smil-tbody" v-if="bodysKerusakan.length === 0">
							<tr>
								<td
									:colspan="headKerusakan.length"
									class="text-center empty-table"
								>
									<icon-component
										iconName="empty-files"
										:size="64"
										colorIcon="#c5c5c5"
										iconClass="icon-table"
									/>
									<span class="empty-table-description">
										Tidak ada data yang dapat ditampilkan
									</span>
								</td>
							</tr>
						</tbody>
						<tbody class="smil-tbody" v-else>
							<tr
								v-for="(row, indexRow) in bodysKerusakan"
								:key="`body-table-${indexRow}`"
							>
								<td
									v-for="(content, indexContent) in row"
									:key="`column-kerusakan-${indexContent}`"
								>
									<template v-if="indexContent === 4">
										<span class="smil-status" :class="content.background">
											{{ content.text }}
										</span>
									</template>
									<template v-else>
										{{ content }}
									</template>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section> -->
      <!-- END: SECTION KERUSAKAN ALAT TABLE SUMMARY -->
    </template>

    <!-- START: MODAL POPUP -->
    <b-modal
      v-model="openPopupDetail"
      hide-footer
      hide-header
      centered
      no-close-on-backdrop
      no-close-on-esc
      size="lg"
    >
      <base-modal-dashboard-alat
        :conditionCode="statistic.selected_condition"
        :closeModal="closePopupDetail"
      />
    </b-modal>
    <!-- END: MODAL POPUP -->
    <!-- START: MODAL POPUP -->
    <b-modal
      ref="modal-alert"
      hide-footer
      hide-header
      centered
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
    <!-- END: MODAL POPUP -->
  </div>
</template>

<script>
// Components
import IconComponent from "@/components/IconComponent.vue";
import BaseModalAlert from "@/components/BaseModal/BaseModalAlert";
import BaseModalDashboardAlat from "@/components/BaseModal/BaseModalDashboardAlat";

// Mixins
import AlertInfoMixin from "@/mixins/AlertInfoMixin";
import ErrorHandlerMixins from "@/mixins/ErrorHandlerMixins";

// API
import api from "@/api/admin_api";

// Library
let moment = require("moment");

export default {
  name: "dashboard-admin",
  components: { IconComponent, BaseModalAlert, BaseModalDashboardAlat },
  mixins: [ErrorHandlerMixins, AlertInfoMixin],
  data() {
    return {
      loadingPage: false,
      openPopupDetail: false,
      months: [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ],
      statisticCount: [
        {
          id: 1,
          text: "Unit Kondisi Baik",
          class: "smil-bg-success",
          modelCount: "count_good",
          icon: "check-circle-fill",
          conditionCode: 2,
        },
        {
          id: 2,
          text: "Unit Kondisi Rusak",
          class: "smil-bg-danger",
          modelCount: "count_damaged",
          icon: "x-circle-fill",
          conditionCode: 3,
        },
        {
          id: 3,
          text: "Unit Diperbaiki",
          class: "smil-bg-info",
          modelCount: "count_fix",
          icon: "tools",
          conditionCode: 5,
        },
        {
          id: 4,
          text: "Unit Habis",
          class: "smil-bg-warning",
          modelCount: "count_empty",
          icon: "bag-x",
          conditionCode: 4,
        },
      ],
      statistic: {
        total_alat: 0,
        count_good: 0,
        count_damaged: 0,
        count_fix: 0,
        count_empty: 0,
        selected_condition: null,
      },
      // Tabs
      activeTab: 1,
      tabNewActivity: [
        {
          id: 1,
          tabTitle: "Booking Pengembalian",
          tabKey: "booking-pengembalian",
          routeDetail: "ListPeminjamanAlat",
        },
        {
          id: 2,
          tabTitle: "Peminjaman",
          tabKey: "peminjaman",
          routeDetail: "ListPeminjamanAlat",
        },
        {
          id: 3,
          tabTitle: "Laporan Kerusakan",
          tabKey: "laporan-kerusakan",
          routeDetail: "LaporanKerusakanAlat",
        },
      ],
      // Table
      headsTable: {
        "booking-pengembalian": [
          "Tanggal Pengembalian",
          "Nama Peminjam",
          "Petugas",
          "Status Booking",
        ],
        peminjaman: [
          "Waktu Peminjaman",
          "Waktu Pengembalian",
          "Nama Peminjam",
          "Status Peminjaman",
        ],
        "laporan-kerusakan": [
          "Tanggal Lapor",
          "Nama Pelapor",
          "Barcode Alat",
          "Kronologi Kerusakan",
          "Status Laporan",
        ],
      },
      listPeminjaman: [],
      listKerusakan: [],
      listBookingPengembalian: [],
    };
  },
  async mounted() {
    await this.dashboardData();
  },
  computed: {
    currentDate() {
      let today = new Date();
      let day = String(today.getDate()).padStart(2, "0");
      let month = today.getMonth();
      let year = today.getFullYear();

      return `${day} ${this.months[month]} ${year}`;
    },
    tableData() {
      let header = [];
      let body = [];
      let tab = this.tabNewActivity.find((tab) => tab.id === this.activeTab);
      // Header
      if (tab) {
        header = this.headsTable[tab.tabKey];
      } else {
        header = [];
      }

      // Body
      if (tab.tabKey === "peminjaman") {
        body = this.bodysPeminjaman;
      } else if (tab.tabKey === "laporan-kerusakan") {
        body = this.bodysKerusakan;
      } else {
        body = this.bodysBooking;
      }

      return {
        head: header,
        body: body,
      };
    },
    bodysPeminjaman() {
      let table = [];
      if (this.listPeminjaman && this.listPeminjaman.length > 0) {
        this.listPeminjaman.forEach((list, idxList) => {
          let peminjam =
            list.nim_mahasiswa !== null
              ? list.mahasiswa_peminjam_model.mahasiswa_fullname
              : list.staff_peminjam_model.staff_fullname;
          let row = [
            this.formatDate(list.created_date),
            this.formatDate(list.expected_return_date),
            peminjam,
            this.statusPeminjaman(list.pjm_status),
          ];

          table.push(row);
        });
      }
      return table;
    },
    bodysKerusakan() {
      let table = [];
      if (this.listKerusakan && this.listKerusakan.length > 0) {
        this.listKerusakan.forEach((list) => {
          let pelapor =
            list.nim_mahasiswa !== ""
              ? list.mahasiswa_lapor_model.mahasiswa_fullname
              : list.staff_lapor_model.staff_fullname;
          let row = [
            this.formatDate(list.created_at),
            pelapor,
            list.barcode_alat,
            list.chronology,
            this.statusLaporan(list.report_status),
          ];

          table.push(row);
        });
      }
      return table;
    },
    bodysBooking() {
      let table = [];
      if (
        this.listBookingPengembalian &&
        this.listBookingPengembalian.length > 0
      ) {
        this.listBookingPengembalian.forEach((list) => {
          let peminjam =
            list.nim_mahasiswa !== "" && list.nim_mahasiswa !== null
              ? list.booking_by_mahasiswa.mahasiswa_fullname
              : list.booking_by_staff.staff_fullname;
          let row = [
            this.formatDate(list.appointment_date),
            peminjam,
            list.process_by,
            this.statusBooking(list.is_booking_cancel),
          ];

          table.push(row);
        });
      }
      return table;
    },
  },
  methods: {
    // CALL API
    async dashboardData() {
      this.loadingPage = true;
      try {
        const response = await api.dashboardAdmin();
        let dashboard = response.data.data;
        if (response.data.response.code === 200) {
          Object.keys(this.statistic).forEach((key) => {
            this.statistic[key] = dashboard[key];
          });
          this.listPeminjaman = dashboard.recent_peminjaman;
          this.listKerusakan = dashboard.recent_report;
          this.listBookingPengembalian = dashboard.recent_booking;
          this.loadingPage = false;
        }
      } catch (e) {
        this.loadingPage = false;

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
    // Value Change
    statusPeminjaman(status_id) {
      let listStatus = [
        {
          id: 1,
          text: "Butuh Persetujuan",
          background: " smil-bg-warning",
        },
        {
          id: 2,
          text: "Berhasil",
          background: " smil-bg-info",
        },
        {
          id: 3,
          text: "Ditolak",
          background: " smil-bg-danger",
        },
        {
          id: 4,
          text: "Belum Kembali",
          background: " smil-bg-warning",
        },
        {
          id: 5,
          text: "Selesai",
          background: "smil-bg-success",
        },
      ];

      return listStatus.find((status) => status.id === status_id);
    },
    statusLaporan(status_id) {
      let listStatusLaporan = [
        {
          id: 1,
          text: "Menunggu Tindakan",
          background: " smil-bg-pending",
        },
        {
          id: 2,
          text: "Diperbaiki",
          background: " smil-bg-success",
        },
        {
          id: 3,
          text: "Tidak Diperbaiki",
          background: " smil-bg-danger",
        },
      ];

      return listStatusLaporan.find((status) => status.id === status_id);
    },
    statusBooking(status_id) {
      let listStatusBooking = [
        {
          id: null,
          text: "Belum di Proses",
          background: "smil-bg-pending",
        },
        {
          id: true,
          text: "Batal",
          background: "smil-bg-danger",
        },
        {
          id: false,
          text: "Selesai",
          background: "smil-bg-success",
        },
      ];
      return listStatusBooking.find((status) => status.id === status_id);
    },
    formatDate(date, format = "DD-MM-YYYY") {
      return moment(date).format(format);
    },
    listAlatDashboard(conditionCode) {
      this.statistic.selected_condition = conditionCode;
      this.openPopupDetail = true;
    },
    closePopupDetail() {
      this.openPopupDetail = false;
    },
    setActiveTab(tabId) {
      this.activeTab = tabId;
    },
  },
};
</script>

<style lang="scss" scoped>
.title-section {
  .title {
    font-size: 24px;
    font-weight: 700;
  }

  .title-description {
    font-size: 16px;
    color: #c5c5c5;
  }
  .sub-title {
    font-size: 20px;
    font-weight: 700;
  }
}

.statistic-section {
  display: flex;
  flex-flow: row;
  .statistic-card {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    display: flex;
    flex-flow: column;
    justify-content: space-between;
    padding: 15px 30px;
    margin-right: 34px;
    &:last-child {
      margin-right: 0;
    }

    .statistic-body {
      display: flex;
      align-items: center;
      .statistic-info {
        p {
          margin-bottom: 0;
        }
        .statistic-count {
          font-size: 40px;
          font-weight: bold;
        }
        .statistic-description {
          font-size: 20px;
        }
      }
      .icon-size {
        width: 64px;
        height: 64px;
      }
    }
    .statistic-footer {
      p {
        margin-bottom: 0;
        font-size: 12px;
        &:hover {
          font-weight: bold;
          cursor: pointer;
          text-decoration: underline;
        }
      }
    }
  }
}

.section-new-activity {
  .tabs-menu {
    margin-top: 40px;
  }
}

section {
  margin-bottom: 40px;
}

@media screen and (max-width: 992px) {
  .statistic-section {
    flex-flow: column;
    .statistic-card {
      margin-bottom: 20px;
    }
  }
}
</style>

<style lang="scss">
.dashboard-admin {
  .nav-tabs {
    border-bottom: none;
    .nav-link {
      border: none;
      color: #696969;
      font-size: 16px;
      padding: 7 21px;
      padding-left: 0;
      &.active {
        color: #101939;
        font-weight: 700;
        border-bottom: 2px solid;
        border-color: #101939;
      }
    }
  }

  .tab-content {
    margin-top: 40px;
    min-height: 100%;
  }
}
</style>
