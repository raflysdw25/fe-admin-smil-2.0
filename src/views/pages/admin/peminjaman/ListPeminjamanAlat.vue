<template>
  <div class="list-peminjaman-alat">
    <!-- START: BUTTON GROUP -->
    <div class="button-group d-flex">
      <button
        class="smil-btn smil-bg-info d-lg-none d-sm-block"
        @click="openPopup('filter-data')"
      >
        Filter Data
      </button>
      <button
        class="smil-btn smil-bg-info ml-auto"
        @click="openPopup('ruangan')"
      >
        Ruangan Kampus
      </button>
    </div>
    <!-- END: BUTTON GROUP -->

    <!-- START: LIST DATA -->
    <div class="table-responsive-sm">
      <table class="table smil-table">
        <thead class="smil-thead">
          <tr>
            <th
              v-for="(head, indexHds) in headsTable"
              :key="`header-table-${indexHds}`"
            >
              {{ head.label }}
              <base-filter
                filter_class="d-none d-lg-block"
                @changeValue="changeFilterValue"
                @filterAction="getListPeminjaman"
                :filter_type="head.filter_type"
                :default_value="filterData[head.model]"
                :placeholder="head.placeholder"
                :options="head.options"
                :modelFilter="head.model"
              />
            </th>
          </tr>
        </thead>

        <tbody class="smil-tbody">
          <tr v-if="loadingTable">
            <td :colspan="headsTable.length" class="text-center empty-table">
              <b-spinner
                class="icon-table icon-size"
                variant="secondary"
                style=""
              ></b-spinner>
              <p class="empty-table-description">Sedang Memuat Data...</p>
            </td>
          </tr>
          <template v-else>
            <tr v-if="listData.length === 0">
              <td :colspan="headsTable.length" class="text-center empty-table">
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

            <tr
              v-else
              v-for="(rows, indexRow) in listTable"
              :key="`content-table-${indexRow}`"
            >
              <td
                v-for="(content, indexContent) in rows"
                :key="`column-${content}${indexContent}`"
                :width="indexContent === rows.length - 1 ? 10 : 200"
              >
                <template v-if="indexContent === rows.length - 1">
                  <b-dropdown
                    size="lg"
                    right
                    variant="smil-drop-dots"
                    toggle-class="text-decoration-none"
                    no-caret
                    class="drop-dropdown smil-dot"
                  >
                    <template v-slot:button-content>
                      <b-icon-three-dots-vertical></b-icon-three-dots-vertical>
                    </template>
                    <b-dropdown-item
                      @click="tindakPeminjaman(true, indexRow)"
                      v-if="listData[indexRow].pjm_status === 1 && isKaLab"
                    >
                      Approve Request
                    </b-dropdown-item>
                    <b-dropdown-item
                      @click="tindakPeminjaman(false, indexRow)"
                      v-if="listData[indexRow].pjm_status === 1 && isKaLab"
                    >
                      Reject Request
                    </b-dropdown-item>
                    <b-dropdown-item
                      v-if="listData[indexRow].pjm_status === 2 && !isMobile"
                      @click="registerAlat(indexRow)"
                    >
                      Daftar Alat Dipinjam
                    </b-dropdown-item>
                    <b-dropdown-item
                      @click="lihatDetail('peminjaman', indexRow)"
                    >
                      Detail Peminjaman
                    </b-dropdown-item>
                    <b-dropdown-item
                      @click="actionPeminjaman('pengembalian-alat', indexRow)"
                    >
                      Selesaikan Peminjaman
                    </b-dropdown-item>
                    <b-dropdown-item @click="deleteNotif(indexRow)">
                      <span class="smil-text-danger"> Hapus Peminjaman </span>
                    </b-dropdown-item>
                  </b-dropdown>
                </template>
                <template v-else-if="indexContent === rows.length - 2">
                  <span class="smil-status" :class="content.background">
                    {{ content.text }}
                  </span>
                </template>
                <template v-else>
                  {{ content }}
                </template>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <!-- END: LIST DATA -->

    <!-- START: PAGINATION INFO SECTION -->
    <div class="pagination-section">
      <div class="table-counter">
        {{ `${listData.length} dari ${tableInfo.listTotal} Data` }}
      </div>
      <div class="table-pagination">
        <ul v-if="listData.length > 0">
          <li>
            <span
              :style="tableInfo.pageNo === 1 ? '' : 'cursor: pointer'"
              @click="previousPage"
              v-if="tableInfo.totalPage > 1"
              :disabled="tableInfo.pageNo === 1"
            >
              <icon-component
                iconName="arrow-left"
                :size="24"
                :colorIcon="tableInfo.pageNo === 1 ? `#C5C5C5` : `#101939`"
              />
            </span>
          </li>
          <li :class="tableInfo.totalPage > 5 ? `page-limit` : ``">
            <a
              v-for="num in tableInfo.totalPage"
              :key="num"
              style="cursor: pointer"
              class="smil-link"
              @click="jumpPage(num)"
              :class="[num === tableInfo.pageNo ? 'active' : '']"
            >
              {{ num }}
            </a>
          </li>
          <li>
            <span
              :style="
                tableInfo.totalPage === tableInfo.pageNo
                  ? ''
                  : 'cursor: pointer'
              "
              @click="nextPage"
              v-if="tableInfo.totalPage > 1"
              :disabled="tableInfo.pageNo === tableInfo.totalPage"
            >
              <icon-component
                iconName="arrow-right"
                :size="24"
                :colorIcon="
                  tableInfo.pageNo === tableInfo.totalPage
                    ? `#C5C5C5`
                    : `#101939`
                "
              />
            </span>
          </li>
        </ul>
      </div>
      <div class="table-count">
        Tampilkan
        <select
          class="custom-select"
          v-model="tableInfo.listSize"
          @change="getListPeminjaman"
        >
          <option
            :value="count"
            v-for="count in tableCount"
            :key="`page-size-${count}`"
          >
            {{ count }}
          </option>
        </select>
      </div>
    </div>
    <!-- END: PAGINATION INFO SECTION -->

    <!-- START: MODAL POPUP -->
    <b-modal
      ref="modal-popup"
      hide-footer
      hide-header
      centered
      no-close-on-backdrop
      no-close-on-esc
      :size="baseModalType === 'ruangan' ? 'lg' : ''"
    >
      <base-modal-approve
        v-if="baseModalType === 'approval'"
        :isApprove="isApprove"
        :approveAction="approveAction"
        :closeModal="closePopup"
      />

      <form-filter-data
        v-if="baseModalType === 'filter-data'"
        title="Filter Data Peminjaman"
        :closeModal="closePopup"
        :formInput="filterData"
        :form="formFilter"
        :submitFunction="getListPeminjaman"
        :activeButton="mobileFilterActive"
      />

      <base-modal-list-support
        v-if="baseModalType === 'ruangan'"
        title="Ruangan Kampus"
        supportType="ruangan"
        :closeModal="closePopup"
      />

      <base-modal-detail
        v-if="baseModalType === 'detail'"
        :title="details.title"
        :headsData="details.heads"
        :valueData="details.value"
        :closeModal="closePopup"
      />

      <base-modal-register-alat
        v-if="baseModalType === 'register-alat'"
        :detailPeminjaman="selectedRowData.detail_peminjaman_model"
        :submitRegister="registerAlatDipinjam"
        :closeModal="closePopup"
      />
      <base-modal-list-table
        v-if="baseModalType == 'list-table'"
        title="Alat Dipinjam"
        :heads="alatDipinjam.heads"
        :contents="alatDipinjam.contents"
        :totalData="alatDipinjam.totalData"
        :closeModal="closePopup"
      />
    </b-modal>
    <!-- END: MODAL POPUP -->

    <!-- MODAL ALERT -->
    <b-modal
      ref="modal-alert"
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
    <!-- MODAL ALERT -->

    <!-- MODAL DETAIL PEMINJAMAN -->
    <b-modal
      v-model="openDetailPeminjaman"
      hide-header
      hide-footer
      centered
      size="xl"
    >
      <detail-peminjaman-modal
        :dataPeminjaman="selectedRowData"
        :actionPeminjaman="actionPeminjaman"
      />
    </b-modal>
    <!-- MODAL DETAIL PEMINJAMAN -->
  </div>
</template>

<script>
// Components
import IconComponent from "@/components/IconComponent.vue";
import FormFilterData from "@/components/FormFilterData.vue";
import BaseFilter from "@/components/BaseFilter.vue";
import BaseModalAlert from "@/components/BaseModal/BaseModalAlert.vue";
import BaseModalApprove from "@/components/BaseModal/BaseModalApprove.vue";
import BaseModalListSupport from "@/components/BaseModal/BaseModalListSupport.vue";
import BaseModalDetail from "@/components/BaseModal/BaseModalDetail.vue";
import BaseModalRegisterAlat from "@/components/BaseModal/BaseModalRegisterAlat.vue";
import BaseModalListTable from "@/components/BaseModal/BaseModalListTable.vue";

import DetailPeminjamanModal from "@/components/Peminjaman/DetailPeminjamanModal";

// Mixins
import ModalMixins from "@/mixins/ModalMixins";
import TableMixins from "@/mixins/TableMixins";
import FormInputMixins from "@/mixins/FormInputMixins";
import ErrorHandlerMixins from "@/mixins/ErrorHandlerMixins";
import AlertInfoMixin from "@/mixins/AlertInfoMixin";

// API
import api from "@/api/admin_api";
export default {
  name: "list-peminjaman-alat",
  mixins: [
    ModalMixins,
    TableMixins,
    FormInputMixins,
    ErrorHandlerMixins,
    AlertInfoMixin,
  ],
  components: {
    IconComponent,
    FormFilterData,
    BaseFilter,
    BaseModalAlert,
    BaseModalApprove,
    BaseModalListSupport,
    BaseModalDetail,
    BaseModalRegisterAlat,
    BaseModalListTable,
    DetailPeminjamanModal,
  },
  data() {
    return {
      headsTable: [
        {
          label: "Waktu Peminjaman",
          filter_type: "date",
          placeholder: "Filter Waktu Peminjaman",
          model: "created_date",
          options: null,
        },
        {
          label: "Waktu Pengembalian",
          filter_type: "date",
          placeholder: "Filter Waktu Pengembalian",
          model: "expected_return_date",
          options: null,
        },
        {
          label: "Nomor Induk Peminjam",
          filter_type: "search",
          placeholder: "Filter Nomor Induk Peminjam",
          model: "nomor_induk",
          options: null,
        },
        {
          label: "Status Peminjaman",
          filter_type: "select",
          placeholder: "Filter Status Peminjaman",
          model: "pjm_status",
          options: [
            {
              name: "All",
              value: null,
            },
            {
              name: "Butuh Persetujuan",
              value: 1,
            },
            {
              name: "Alat Belum Diambil",
              value: 2,
            },
            {
              name: "Ditolak",
              value: 3,
            },
            {
              name: "Belum Kembali",
              value: 4,
            },
            {
              name: "Selesai",
              value: 5,
            },
          ],
        },
        "",
      ],
      filterData: {
        created_date: "",
        expected_return_date: "",
        nomor_induk: "",
        pjm_status: null,
      },
      formFilter: [
        {
          label: "Tanggal Peminjaman Alat",
          type: "date",
          model: "created_date",
          description: "",
          placeholder: "Filter Tanggal Peminjaman Alat",
          isRequired: false,
        },
        {
          label: "Tanggal Pengembalian Alat",
          type: "date",
          model: "expected_return_date",
          description: "",
          placeholder: "Filter Tanggal Pengembalian Alat",
          isRequired: false,
        },
        {
          label: "Nomor Induk Peminjam",
          type: "text",
          model: "nomor_induk",
          description: "",
          placeholder: "Filter Nomor Induk Peminjam",
          isRequired: false,
        },
        {
          label: "Status Peminjaman",
          type: "select",
          model: "pjm_status",
          description: "",
          placeholder: "Filter Status Peminjaman",
          isRequired: false,
          options: [
            {
              name: "All",
              value: null,
            },
            {
              name: "Butuh Persetujuan",
              value: 1,
            },
            {
              name: "Alat Belum Diambil",
              value: 2,
            },
            {
              name: "Ditolak",
              value: 3,
            },
            {
              name: "Belum Kembali",
              value: 4,
            },
            {
              name: "Selesai",
              value: 5,
            },
          ],
        },
      ],
      isApprove: null,
      // Register Alat Dipinjam
      formAdd: [],
      // Detail Data
      typeDetail: "",
      // Modal Data
      openDetailPeminjaman: false,
    };
  },
  watch: {
    "tableInfo.pageNo": {
      deep: true,
      handler: function () {
        if (!this.loadingTable) {
          this.getListPeminjaman();
        }
      },
    },
    openDetailPeminjaman: {
      deep: true,
      handler: function (newVal) {
        if (!newVal) {
          this.selectedRowData = null;
        }
      },
    },
  },
  computed: {
    listTable() {
      let listTable = [];
      this.listData.forEach((list, indexList) => {
        let peminjam =
          list.nim_mahasiswa == null
            ? `${list.nip_staff} - ${list.staff_peminjam_model.staff_fullname}`
            : `${list.nim_mahasiswa} - ${list.mahasiswa_peminjam_model.mahasiswa_fullname}`;
        let rowTable = [
          this.formatDate(list.created_date, "DD MMMM YYYY"), //ID Lokasi
          this.formatDate(list.expected_return_date, "DD MMMM YYYY"), //Nama Lokasi
          peminjam, //kapasitas
          this.statusPeminjaman(list.pjm_status), //jenis
          "",
        ];

        listTable.push(rowTable);
      });

      return listTable;
    },
    filterPayload() {
      let tableInfo = this.tableInfo;

      return {
        page_size: tableInfo.listSize,
        sort_by: "created_at",
        sort_direction: "DESC",
        ...this.filterData,
      };
    },
    mobileFilterActive() {
      let filter = this.filterData;
      return (
        filter.created_date !== "" ||
        filter.expected_return_date !== "" ||
        filter.nomor_induk !== "" ||
        filter.pjm_status !== null
      );
    },
    details() {
      let detail = {
        title: "",
        heads: [],
        value: {},
      };
      let data = this.selectedRowData;

      if (this.typeDetail == "peminjaman") {
        detail.title = "Detail Peminjaman";
        detail.heads = [
          {
            label: "Waktu Peminjaman",
            key: "created_date",
          },
          {
            label: "Waktu Pengembalian",
            key: "expected_return_date",
          },
          {
            label: "Waktu Kembali",
            key: "real_return_date",
          },
          {
            label: "Status Peminjaman",
            key: "pjm_status",
          },
          {
            label: "Tujuan Peminjaman",
            key: "pjm_purpose",
          },
          {
            label: "Dosen Penanggung Jawab",
            key: "staff_in_charge_fullname",
          },
          {
            label: "Ruangan",
            key: "ruangan_name",
          },
        ];
        detail.value = {
          created_date: this.formatDate(data.created_date, "DD MMMM YYYY"),
          expected_return_date: this.formatDate(
            data.expected_return_date,
            "DD MMMM YYYY"
          ),
          real_return_date:
            data.real_return_date === ""
              ? ""
              : this.formatDate(data.real_return_date, "DD MMMM YYYY"),
          pjm_status: this.statusPeminjaman(data.pjm_status).text,
          pjm_purpose: data.pjm_purpose,
          staff_in_charge_fullname:
            data.nip_staff_in_charge == null
              ? ""
              : data.staff_in_charge_model.staff_fullname,
          ruangan_name:
            data.ruangan_id === null ? "" : data.ruangan_model.ruangan_name,
        };
      } else if (this.typeDetail == "peminjam") {
        detail.title = "Informasi Peminjam";
        detail.heads = [
          {
            label: "Nomor Induk",
            key: "nomor_induk",
          },
          {
            label: "Nama",
            key: "peminjam_name",
          },
          {
            label: "Nomor Telepon",
            key: "phone_number",
          },
          {
            label: "Email",
            key: "email",
          },
          {
            label: "Status Peminjam",
            key: "peminjam_status",
          },
        ];

        let statusPeminjam =
          data.nim_mahasiswa == null ? "Staff / Dosen Jurusan" : "Mahasiswa";
        let peminjam =
          data.nim_mahasiswa == null
            ? data.staff_peminjam_model
            : data.mahasiswa_peminjam_model;

        detail.value = {
          nomor_induk:
            data.nim_mahasiswa == null ? data.nip_staff : data.nim_mahasiswa,
          peminjam_name:
            data.nim_mahasiswa == null
              ? data.staff_peminjam_model.staff_fullname
              : data.mahasiswa_peminjam_model.mahasiswa_fullname,
          phone_number: peminjam.phone_number,
          email: peminjam.email,
          peminjam_status: statusPeminjam,
        };
      }

      return detail;
    },
    alatDipinjam() {
      let data = this.selectedRowData;
      if (Object.keys(data).length > 0) {
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
        let heads = ["Nama Alat", "Barcode Alat", "Kondisi Alat"];
        let contents = [];
        let totalData = data.detail_peminjaman_model.length;
        if (data.detail_peminjaman_model.length > 0) {
          let reverse = data.detail_peminjaman_model.reverse();

          let count = reverse.length > 5 ? 5 : reverse.length;
          for (let index = 0; index < count; index++) {
            let kondisi, barcode, alatName;

            alatName = reverse[index].barcode_alat_pinjam.alat_model.alat_name;
            kondisi = listKondisi.find(
              (list) =>
                list.id == reverse[index].barcode_alat_pinjam.condition_status
            );
            barcode = reverse[index].barcode_alat;
            let row = [alatName, barcode, kondisi];
            contents.push(row);
          }
        }

        return {
          heads: heads,
          contents: contents,
          totalData: totalData,
        };
      } else {
        return {
          heads: [],
          contents: [],
          totalData: 0,
        };
      }
    },
  },
  async mounted() {
    if (this.isSuperAdmin) {
      this.$router.go(-1);
    }
    await this.getListPeminjaman();
  },
  methods: {
    // Call API
    async getListPeminjaman() {
      this.loadingTable = true;
      if (this.isFilterUse && this.tableInfo.pageNo > 1) {
        this.tableInfo.pageNo = 1;
      }
      // Nembak API Get List Alat
      try {
        const response = await api.getFilterData(
          "peminjaman",
          this.tableInfo.pageNo,
          this.filterPayload
        );

        this.listData = response.data.result;
        let page = response.data.page;
        this.tableInfo.totalPage = page.total;
        this.tableInfo.listTotal = page.data_total;
        if (this.selectedRowData !== null) {
          this.getCurrentSelectedData();
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
        this.loadingTable = false;
      }
    },
    async approveAction(payload) {
      this.popupAlert(true);
      try {
        const response = await api.approveAction(
          this.selectedRowData.id,
          payload
        );
        if (response.data.response.code == 200) {
          this.popupAlert(false, true, response.data.response.message);
          setTimeout(() => {
            this.getListPeminjaman();
          }, 2000);
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

        this.popupAlert(false, false, e);
      }
    },
    async deletePeminjaman(peminjamanId) {
      this.popupAlert(true);
      try {
        const response = await api.deleteData("peminjaman", peminjamanId);
        if (response.data.response.code === 200) {
          this.popupAlert(false, true, response.data.response.message);
          setTimeout(() => {
            this.openDetailPeminjaman = false;
            this.getListPeminjaman();
          }, 2000);
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
    async registerAlatDipinjam(listDetailPeminjaman) {
      this.popupAlert(true);
      try {
        let list = [];
        listDetailPeminjaman.forEach((detail) => {
          let row = {
            id: detail.id,
            barcode_alat: detail.model,
          };
          list.push(row);
        });
        let payload = {
          list_detail_peminjaman: list,
        };
        const response = await api.registerAlatDipinjam(
          this.selectedRowData.id,
          payload
        );

        if (response.data.response.code === 200) {
          this.popupAlert(false, true, response.data.response.message);
          setTimeout(() => {
            this.getListPeminjaman();
          }, 2000);
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
    // Value Change
    statusPeminjaman(status_id) {
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

      return listStatus.find((status) => status.id === status_id);
    },
    // Modal Interaction
    actionPeminjaman(type, data = null) {
      // type: approval, register-alat, pengembalian-alat
      if (type === "approval") {
        this.tindakPeminjaman(data);
      } else if (type === "register-alat") {
        this.registerAlat();
      } else if (type === "delete") {
        this.deleteNotif();
      } else if (type === "pengembalian-alat") {
        if (data !== null) {
          this.selectedRowData = this.listData[data];
        }
        alert("Action Pengembalian Alat");
      } else {
        this.lihatDetail(type);
      }
    },
    // Action Dropdown
    lihatDetail(type, indexData = null) {
      if (indexData !== null) {
        this.selectedRowData = this.listData[indexData];
      }
      if (type === "peminjaman") {
        this.openDetailPeminjaman = true;
      } else {
        this.typeDetail = type;
        this.openPopup("detail");
      }
    },
    lihatListAlatDipinjam(indexData) {
      this.selectedRowData = this.listData[indexData];
      this.openPopup("list-table");
    },
    tindakPeminjaman(tindakan, row = null) {
      if (row !== null) {
        this.selectedRowData = this.listData[row];
      }
      this.isApprove = tindakan;
      this.openPopup("approval");
    },
    deleteNotif(index = null) {
      let data = null;
      if (index === null) {
        data = this.selectedRowData;
      } else {
        data = this.listData[index];
      }

      let confirmDelete = confirm(
        `Apakah anda yakin ingin menghapus peminjaman ini? Seluruh data yang berhubungan dengan peminjaman ini akan ikut terhapus`
      );
      if (confirmDelete) {
        this.deletePeminjaman(data.id);
      }
    },
    registerAlat(indexData = null) {
      if (indexData !== null) {
        this.selectedRowData = this.listData[indexData];
      }
      this.openPopup("register-alat");
    },
  },
};
</script>

<style lang="scss" scoped>
.button-group {
  margin-bottom: 40px;
  button {
    margin-right: 15px;
  }
}
</style>
