<template>
  <div class="list-booking-pengembalian">
    <!-- START: BUTTON GROUP -->
    <div class="button-group d-flex">
      <button
        class="smil-btn smil-bg-info d-lg-none d-sm-block"
        @click="openPopup('filter-data')"
      >
        Filter Data
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
                @filterAction="getListBookingPengembalian"
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
            <!-- EMPTY DATA -->
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
            <!-- END: EMPTY DATA -->

            <!-- LISTED DATA -->
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
                      v-if="listData[indexRow].is_booking_cancel === null"
                      @click="processBooking('done', indexRow)"
                    >
                      Selesaikan Booking
                    </b-dropdown-item>
                    <b-dropdown-item
                      v-if="listData[indexRow].is_booking_cancel === null"
                      @click="processBooking('cancel', indexRow)"
                    >
                      Batalkan Booking
                    </b-dropdown-item>
                    <b-dropdown-item @click="deleteNotif(indexRow)">
                      <span class="smil-text-danger"> Hapus Data Booking </span>
                    </b-dropdown-item>
                  </b-dropdown>
                </template>
                <template v-else-if="indexContent === 2">
                  <span class="smil-status" :class="content.background">
                    {{ content.text }}
                  </span>
                </template>
                <template v-else>
                  {{ content }}
                </template>
              </td>
            </tr>
            <!-- END: LISTED DATA -->
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
          @change="getListBookingPengembalian"
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
      :no-close-on-backdrop="baseModalType !== 'qrcode'"
      :no-close-on-esc="baseModalType !== 'qrcode'"
    >
      <form-filter-data
        v-if="baseModalType === 'filter-data'"
        title="Filter Data Alat"
        :closeModal="closePopup"
        :formInput="filterData"
        :form="formFilter"
        @submitFilter="getListBookingPengembalian"
      />
    </b-modal>
    <!-- END: MODAL POPUP -->

    <!-- MODAL ALERT -->
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
        :closeAlert="closeAlert"
      />
    </b-modal>
    <!-- MODAL ALERT -->

    <!-- MODAL Booking -->
    <b-modal
      v-model="openBookingModal"
      hide-footer
      hide-header
      centered
      no-close-on-backdrop
      no-close-on-esc
    >
      <booking-process-modal
        :bookingData="selectedRowData"
        :processType="processType"
        :popupAlert="popupAlert"
        :closeModal="closeBookingAction"
        :submitProcess="editBookingPengembalian"
      />
    </b-modal>
    <!-- MODAL Booking -->
  </div>
</template>

<script>
// Components
import IconComponent from "@/components/IconComponent.vue";
import FormFilterData from "@/components/FormFilterData.vue";
import BaseFilter from "@/components/BaseFilter.vue";
import BaseModalAlert from "@/components/BaseModal/BaseModalAlert.vue";
import BookingProcessModal from "@/components/Peminjaman/BookingProcessModal.vue";

// Mixins
import ModalMixins from "@/mixins/ModalMixins";
import AlertInfoMixin from "@/mixins/AlertInfoMixin";
import TableMixins from "@/mixins/TableMixins";
import FormInputMixins from "@/mixins/FormInputMixins";
import ErrorHandlerMixins from "@/mixins/ErrorHandlerMixins";

// API
import api from "@/api/admin_api";

export default {
  name: "list-booking-pengembalian",
  mixins: [
    ModalMixins,
    TableMixins,
    ErrorHandlerMixins,
    FormInputMixins,
    AlertInfoMixin,
  ],
  components: {
    IconComponent,
    FormFilterData,
    BaseFilter,
    BaseModalAlert,
    BookingProcessModal,
  },
  data() {
    return {
      headsTable: [
        {
          label: "Tanggal Pengembalian",
          filter_type: "date",
          placeholder: "Filter Tanggal Pengembalian",
          model: "appointment_date",
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
          label: "Status Booking",
          filter_type: "select",
          placeholder: "Filter Status Booking",
          model: "is_booking_cancel",
          options: [
            {
              name: "All",
              value: "",
            },
            {
              name: "Belum di Proses",
              value: 0,
            },
            {
              name: "Booking Selesai",
              value: 1,
            },
            {
              name: "Booking Batal",
              value: 2,
            },
          ],
        },
        {
          label: "Petugas",
          filter_type: "search",
          placeholder: "Filter Petugas",
          model: "process_by",
          options: null,
        },
        "",
      ],
      filterData: {
        appointment_date: null,
        nomor_induk: "",
        is_booking_cancel: "",
        process_by: "",
      },
      formFilter: [
        {
          label: "Tanggal Pengembalian",
          type: "date",
          model: "appointment_date",
          description: "",
          placeholder: "Filter Tanggal Pengembalian",
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
          label: "Status Booking",
          type: "select",
          model: "is_booking_cancel",
          description: "",
          placeholder: "Filter Status Booking",
          isRequired: false,
          options: [
            {
              name: "All",
              value: "",
            },
            {
              name: "Belum di Proses",
              value: null,
            },
            {
              name: "Booking Selesai",
              value: false,
            },
            {
              name: "Booking Batal",
              value: true,
            },
          ],
        },
        {
          label: "Petugas",
          type: "text",
          model: "process_by",
          description: "",
          placeholder: "Filter Petugas",
          isRequired: false,
        },
      ],
      openBookingModal: false,
      processType: "",
    };
  },
  watch: {
    "tableInfo.pageNo": {
      deep: true,
      handler: function () {
        if (!this.loadingTable) {
          this.getListBookingPengembalian();
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
            ? `${list.nip_staff} - ${list.booking_by_staff.staff_fullname}`
            : `${list.nim_mahasiswa} - ${list.booking_by_mahasiswa.mahasiswa_fullname}`;
        let rowTable = [
          this.formatDate(list.appointment_date, "DD/MM/YYYY"),
          peminjam,
          this.statusBooking(list.is_booking_cancel),
          list.process_by === null || list.process_by === ""
            ? "-"
            : list.process_by,
          "",
        ];

        listTable.push(rowTable);
      });

      return listTable;
    },
    filterPayload() {
      let tableInfo = this.tableInfo;
      let filter = this.filterData;

      return {
        page_size: tableInfo.listSize,
        sort_by: "id",
        sort_direction: "ASC",
        appointment_date: filter.appointment_date,
        nomor_induk: filter.nomor_induk,
        is_booking_cancel: filter.is_booking_cancel,
        process_by: filter.process_by,
        booking_notes: "",
      };
    },
  },
  async mounted() {
    if (this.isSuperAdmin) {
      this.$router.go(-1);
    }
    await this.getListBookingPengembalian();
  },
  methods: {
    // Call API
    async getListBookingPengembalian() {
      this.loadingTable = true;
      if (this.isFilterUse && this.tableInfo.pageNo > 1) {
        this.tableInfo.pageNo = 1;
      }
      // Nembak API Get List Alat
      try {
        const response = await api.getFilterData(
          "booking-pengembalian",
          this.tableInfo.pageNo,
          this.filterPayload
        );

        this.listData = response.data.result;
        let page = response.data.page;
        this.tableInfo.totalPage = page.total;
        this.tableInfo.listTotal = page.data_total;
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
    async deleteBookingPengembalian(id) {
      this.popupAlert(true);
      try {
        const response = await api.deleteData("booking-pengembalian", id);
        if (response.data.response.code == 200) {
          this.popupAlert(false, true, response.data.response.message);
          await this.getListBookingPengembalian();
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
    async editBookingPengembalian(submitRequest) {
      this.popupAlert(true);
      try {
        const response = await api.editData(
          "booking-pengembalian",
          this.selectedRowId,
          submitRequest
        );
        if (response.data.response.code === 200) {
          this.popupAlert(
            false,
            true,
            "Edit Booking Pengembalian berhasil dilakukan"
          );
          await this.getListBookingPengembalian();
          this.closeBookingAction();
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
    // Action Dropdown
    processBooking(type, indexData) {
      this.processType = type; //cancel, done
      this.selectedRowData = this.listData[indexData];
      this.selectedRowId = this.listData[indexData].id;
      this.openBookingModal = true;
    },

    // Edit Data

    // Notification
    deleteNotif(index) {
      let bookingPengembalian = this.listData[index];
      let confirm = window.confirm(
        `Apakah anda yakin ingin menghapus booking pengembalian ini?`
      );
      if (confirm) {
        this.deleteBookingPengembalian(bookingPengembalian.id);
      }
    },
    // Modal Custom

    closeBookingAction() {
      this.openBookingModal = false;
      this.processType = "";
      if (this.selectedRowId !== null) {
        this.selectedRowId = null;
        this.selectedRowData = {};
      }
    },
    // Change Value
    statusBooking(isBookingCancel) {
      let listStatus = [
        {
          value: null,
          text: "Belum diproses",
          background: "smil-bg-pending",
        },
        {
          value: false,
          text: "Booking Selesai",
          background: "smil-bg-success",
        },
        {
          value: true,
          text: "Booking Batal",
          background: "smil-bg-danger",
        },
      ];

      return listStatus.find((status) => status.value === isBookingCancel);
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
<style lang="scss">
@import "@/assets/css/barcode.scss";
</style>
