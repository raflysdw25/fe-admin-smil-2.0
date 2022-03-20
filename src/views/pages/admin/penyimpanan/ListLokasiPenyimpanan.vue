<template>
  <div class="list-lokasi-penyimpanan">
    <!-- START: BUTTON GROUP -->
    <div class="button-group d-flex">
      <button class="smil-btn smil-bg-primary" @click="openPopup('add')">
        Tambah Data
      </button>
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
                @filterAction="getListLokasi"
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
                    <b-dropdown-item @click="seeQrCode(indexRow)">
                      Lihat QR Code
                    </b-dropdown-item>
                    <b-dropdown-item
                      v-if="!isMobile"
                      @click="printQRCode(indexRow)"
                    >
                      Cetak QR Code
                    </b-dropdown-item>
                    <b-dropdown-item @click="lihatAlatTersimpan(indexRow)">
                      List Alat Tersimpan
                    </b-dropdown-item>
                    <b-dropdown-item @click="editRowData(indexRow)">
                      Edit Data Lokasi
                    </b-dropdown-item>
                    <b-dropdown-item @click="deleteNotif(indexRow)">
                      <span class="smil-text-danger"> Hapus Data Lokasi </span>
                    </b-dropdown-item>
                  </b-dropdown>
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
          @change="getListLokasi"
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
      <base-modal-add
        v-if="baseModalType === 'add' || baseModalType === 'edit'"
        :modalTitle="`${isEditRow ? 'Edit' : 'Tambah'} Lokasi Penyimpanan`"
        :formList="formAdd"
        :formFilled="formAddFilled"
        :submitFunction="sendAddLokasi"
        :closeFunction="closeLokasiAction"
        :editFunction="editLokasi"
        :isEdit="isEditRow"
        @reset="isEditRow = false"
        @changeValueAdd="changeValueLokasi"
      />

      <form-filter-data
        v-if="baseModalType === 'filter-data'"
        title="Filter Data Alat"
        :closeModal="closePopup"
        :formInput="filterData"
        :form="formFilter"
        @submitFilter="getListLokasi"
      />
      <base-modal-list-table
        v-if="baseModalType == 'list-table'"
        :title="`Alat Tersimpan: ${tersimpan.lokasi}`"
        :heads="tersimpan.heads"
        :contents="tersimpan.contents"
        :totalData="tersimpan.totalData"
        :closeModal="closePopup"
      />
      <base-modal-qrcode
        v-if="baseModalType === 'qrcode'"
        :qrcodeData="selectedRowData"
      />
    </b-modal>
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
    <!-- END: MODAL POPUP -->
    <template v-if="getQRCode">
      <div class="printable-qrcode print" ref="printable-qrcode">
        <div class="banner">
          <img src="@/assets/images/Logo_PNJ.png" class="img-barcode" alt="" />
          <h4 class="text">
            Laboratorium <br />
            Teknik Informatika dan <br />
            Komputer <br />
            Politeknik Negeri Jakarta
          </h4>
        </div>
        <qrcode-vue
          :value="selectedRowData.path_url"
          :size="125"
          level="L"
          class="qrcode"
        />
        <p class="qrcode-display">{{ selectedRowData.name }}</p>
      </div>
    </template>
  </div>
</template>

<script>
// Components
import IconComponent from "@/components/IconComponent.vue";
import FormFilterData from "@/components/FormFilterData.vue";
import BaseFilter from "@/components/BaseFilter.vue";
import BaseModalAdd from "@/components/BaseModal/BaseModalAdd.vue";
import BaseModalAlert from "@/components/BaseModal/BaseModalAlert.vue";
import BaseModalListTable from "@/components/BaseModal/BaseModalListTable.vue";
import BaseModalQrcode from "@/components/BaseModal/BaseModalQrcode.vue";
import QrcodeVue from "qrcode.vue";

// Mixins
import ModalMixins from "@/mixins/ModalMixins";
import TableMixins from "@/mixins/TableMixins";
import ErrorHandlerMixins from "@/mixins/ErrorHandlerMixins";
import AlertInfoMixin from "@/mixins/AlertInfoMixin";

// API
import api from "@/api/admin_api";

// Import Library
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default {
  name: "list-lokasi-penyimpanan",
  mixins: [AlertInfoMixin, ModalMixins, TableMixins, ErrorHandlerMixins],
  components: {
    IconComponent,
    FormFilterData,
    BaseFilter,
    BaseModalAdd,
    BaseModalAlert,
    BaseModalListTable,
    BaseModalQrcode,
    QrcodeVue,
  },
  data() {
    return {
      headsTable: [
        {
          label: "Nama Lokasi",
          filter_type: "search",
          placeholder: "Filter Nama Lokasi",
          model: "lokasi_name",
          options: null,
        },
        {
          label: "Kapasitas Total",
          filter_type: "search-number",
          placeholder: "Filter Kapasitas Total",
          model: "total_capacity",
          options: null,
        },
        {
          label: "Kapasitas Tersedia",
          filter_type: "search-number",
          placeholder: "Filter Kapasitas Tersedia",
          model: "available_capacity",
          options: null,
        },

        "",
      ],
      filterData: {
        lokasi_name: "",
        total_capacity: "",
        available_capacity: "",
      },
      formFilter: [
        {
          label: "Nama Lokasi",
          type: "text",
          model: "lokasi_name",
          description: "",
          placeholder: "Filter Nama Lokasi",
          isRequired: false,
        },
        {
          label: "Kapasistas Total",
          type: "number",
          model: "total_capacity",
          description: "",
          placeholder: "Filter Kapasistas Total",
          isRequired: false,
        },
        {
          label: "Kapasistas Tersedia",
          type: "number",
          model: "available_capacity",
          description: "",
          placeholder: "Filter Kapasistas Tersedia",
          isRequired: false,
        },
      ],
      formAdd: [
        {
          id: 1,
          label: "Nama Lokasi Penyimpanan",
          type: "text",
          disabled: false,
          model: "",
          canAddValue: false,
          isRequired: true,
        },
        {
          id: 2,
          label: "Kapasitas Total Lokasi Penyimpanan",
          type: "number",
          disabled: false,
          model: 0,
          canAddValue: false,
          isRequired: true,
        },
        {
          id: 3,
          label: "Kapasitas Tersedia",
          type: "number",
          disabled: false,
          model: 0,
          canAddValue: false,
          isRequired: false,
        },
        {
          id: 4,
          label: "Kapasitas Terpakai",
          type: "number",
          disabled: false,
          model: 0,
          canAddValue: false,
          isRequired: false,
        },
      ],
      getQRCode: false,
    };
  },
  watch: {
    "tableInfo.pageNo": {
      deep: true,
      handler: function () {
        if (!this.loadingTable) {
          this.getListLokasi();
        }
      },
    },
  },
  computed: {
    listTable() {
      let listTable = [];
      this.listData.forEach((list, indexList) => {
        let rowTable = [
          list.lokasi_name, //Nama Lokasi
          list.total_capacity, //kapasitas
          list.available_capacity, //Kapasitas tersedia
          "",
        ];

        listTable.push(rowTable);
      });

      return listTable;
    },
    submitRequest() {
      let form = this.formAdd;
      return {
        lokasi_name: form[0].model,
        total_capacity: form[1].model,
        available_capacity: form[2].model,
        stored_capacity: form[3].model,
      };
    },
    formAddFilled() {
      let submit = this.submitRequest;
      return submit.lokasi_name !== "" && submit.total_capacity !== 0;
    },
    filterPayload() {
      let tableInfo = this.tableInfo;
      let filter = this.filterData;
      let total =
        filter.total_capacity === "" ? null : parseInt(filter.total_capacity);
      let available =
        filter.available_capacity === ""
          ? null
          : parseInt(filter.available_capacity);
      return {
        page_size: tableInfo.listSize,
        sort_by: "id",
        sort_direction: "ASC",
        lokasi_name: filter.lokasi_name,
        total_capacity: total,
        available_capacity: available,
      };
    },
    tersimpan() {
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
        let heads = ["Nama Alat", "QRCode Key", "Kondisi Alat"];
        let contents = [];
        let alatTersimpan = data.lokasi_detail_alat.filter(
          (lks) => lks.condition_status !== 4
        );

        let totalData = alatTersimpan.length;
        if (alatTersimpan.length > 0) {
          let reverse = alatTersimpan.reverse();
          for (let index = 0; index < 5; index++) {
            let kondisi = listKondisi.find(
              (list) => list.id == reverse[index].condition_status
            );
            let row = [
              reverse[index].alat_model.alat_name,
              reverse[index].barcode_alat,
              kondisi,
            ];
            contents.push(row);
          }
        }

        return {
          lokasi: data.lokasi_name,
          heads: heads,
          contents: contents,
          totalData: totalData,
        };
      } else {
        return {
          lokasi: "",
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
    await this.getListLokasi();
  },
  methods: {
    // Call API
    async getListLokasi() {
      this.loadingTable = true;
      if (this.isFilterUse && this.tableInfo.pageNo > 1) {
        this.tableInfo.pageNo = 1;
      }
      // Nembak API Get List Alat
      try {
        const response = await api.getFilterData(
          "lokasi",
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
    async sendAddLokasi() {
      this.popupAlert(true);
      try {
        const response = await api.createNewData("lokasi", this.submitRequest);
        this.closePopup();
        if (response.data.response.code === 201) {
          setTimeout(() => {
            this.popupAlert(false, true, "Tambah Lokasi Penyimpanan Berhasil");
            this.getListLokasi();
          }, 500);
        } else {
          this.popupAlert(false, false, response.data.response.message);
        }
      } catch (e) {
        this.closePopup();
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
    async deleteLokasi(id) {
      this.popupAlert(true);
      try {
        const response = await api.deleteData("lokasi", id);
        if (response.data.response.code == 200) {
          this.popupAlert(false, true, response.data.response.message);
          this.getListLokasi();
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
      }
    },
    async editLokasi() {
      this.popupAlert(true);
      try {
        const response = await api.editData(
          "lokasi",
          this.selectedRowId,
          this.submitRequest
        );
        if (response.data.response.code === 200) {
          this.closePopup();

          this.popupAlert(
            false,
            true,
            "Edit Lokasi Penyimpanan berhasil dilakukan"
          );
          await this.getListLokasi();
        } else {
          this.popupAlert(false, false, response.data.response.message);
        }
      } catch (e) {
        this.closePopup();
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
        this.selectedRowData = {};
      }
    },
    // Action Dropdown
    lihatAlatTersimpan(indexData) {
      this.selectedRowData = this.listData[indexData];
      this.openPopup("list-table");
    },
    seeQrCode(indexData) {
      let data = this.listData[indexData];
      this.selectedRowData = {
        path_url: `${process.env.VUE_APP_BASE_SMIL}public-access/lokasi/${data.id}`,
        name: data.lokasi_name,
        desc: `Kapasitas Tersedia: ${data.available_capacity}`,
      };
      this.openPopup("qrcode");
    },
    printQRCode(indexData) {
      let data = this.listData[indexData];
      this.selectedRowData = {
        path_url: `${process.env.VUE_APP_BASE_SMIL}public-access/lokasi/${data.id}`,
        name: data.lokasi_name,
        desc: "",
      };
      this.getQRCode = true;

      this.$nextTick(() => {
        let element = this.$refs["printable-qrcode"];
        this.getQRCode = false;
        this.downloadBarcode(element);
      });
    },
    async downloadBarcode(element) {
      this.popupAlert(true);
      const pdf = new jsPDF({
        orientation: "p",
        unit: "px",
        format: "a4",
        hotfixes: ["px_scaling"],
        compress: false,
      });
      html2canvas(element, {
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
      }).then((canvas) => {
        this.popupAlert(false, true, "QR Code siap diprint");
        let imgData = canvas.toDataURL("image/png", 1.0);

        pdf.addImage(imgData, "PNG", 0, 20, canvas.width, canvas.height);
        pdf.setProperties({
          title: `${this.selectedRowData.name}`,
        });
        window.open(pdf.output("bloburl"));
      });
    },
    // Edit Data
    editRowData(index) {
      this.isEditRow = true;
      this.selectedRowData = this.listData[index];
      this.selectedRowId = this.selectedRowData.id;

      let form = this.formAdd;
      form[0].model = this.selectedRowData.lokasi_name;
      form[1].model = this.selectedRowData.total_capacity;
      form[2].model = this.selectedRowData.available_capacity;
      form[3].model = this.selectedRowData.stored_capacity;

      this.openPopup("edit");
    },
    changeValueLokasi(index) {
      let form = this.formAdd[index];
      if (index !== 0) {
        form.model = form.model !== "" ? parseInt(form.model) : 0;
        if (index == 1) {
          if (this.selectedRowId !== null) {
            // Jika Edit Data Lokasi
            this.formAdd[2].model =
              this.selectedRowData.available_capacity +
              (form.model - this.selectedRowData.total_capacity); //Sinkron untuk Edit Lokasi
          } else {
            if (this.formAdd[2].model !== "") {
              this.formAdd[3].model = 0;
            }

            this.formAdd[2].model = form.model;
          }
        } else if (index == 2) {
          if (form.model > this.formAdd[1].model) {
            form.model = this.formAdd[1].model;
            this.formAdd[3].model = 0;
          } else if (
            form.model >= this.formAdd[1].model &&
            this.formAdd[3].model !== ""
          ) {
            this.formAdd[1].model = form.model + this.formAdd[3].model;
          } else if (
            form.model >= this.formAdd[1].model &&
            this.formAdd[3].model == ""
          ) {
            this.formAdd[1].model = form.model;
          }
        } else if (index == 3) {
          this.formAdd[2].model = this.formAdd[1].model - form.model;
        }
      }
    },
    // Notification
    deleteNotif(index) {
      let lokasi = this.listData[index];
      let confirm = window.confirm(
        `Apakah anda yakin ingin menghapus lokasi penyimpanan ${lokasi.lokasi_name}`
      );
      if (confirm) {
        this.deleteLokasi(lokasi.id);
      }
    },
    // Modal Custom
    closeLokasiAction() {
      if (this.selectedRowId !== null) {
        this.selectedRowId = null;
        this.selectedRowData = {};
      }
      this.closePopup();
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
