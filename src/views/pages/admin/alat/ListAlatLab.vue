<template>
  <div class="list-alat-lab">
    <!-- START: BUTTON GROUP -->
    <div class="button-group d-flex align-items-center">
      <button
        class="smil-btn smil-bg-primary"
        @click="$router.push({ name: 'TambahAlatLab' })"
      >
        Tambah Data
      </button>
      <button
        class="smil-btn smil-bg-info d-lg-none d-sm-block"
        @click="openPopup('filter-data')"
      >
        Filter Data
      </button>
      <button class="smil-btn smil-bg-info ml-auto" @click="openPopup('asal')">
        Asal Pengadaan
      </button>
      <button class="smil-btn smil-bg-info" @click="openPopup('satuan')">
        Satuan Jumlah
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
              <template v-if="head !== ''">
                <base-filter
                  filter_class="d-none d-lg-block mt-2"
                  @changeValue="changeFilterValue"
                  @filterAction="getListAlat"
                  :filter_type="head.filter_type"
                  :default_value="filterData[head.model]"
                  :placeholder="head.placeholder"
                  :options="head.options"
                  :modelFilter="head.model"
                />
              </template>
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
                :width="indexContent === rows.length - 1 ? 10 : null"
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
                      @click="
                        $router.push({
                          name: 'DetailAlat',
                          params: { alat_id: listData[indexRow].id },
                        })
                      "
                    >
                      Lihat Detail Alat
                    </b-dropdown-item>
                    <b-dropdown-item
                      v-if="listData[indexRow].image_counts < 3"
                      @click="
                        $router.push({
                          name: 'UploadFotoAlat',
                          params: { alat_id: listData[indexRow].id },
                        })
                      "
                    >
                      Upload Foto Alat
                    </b-dropdown-item>
                    <b-dropdown-item
                      @click="
                        $router.push({
                          name: 'EditAlatLab',
                          params: { alat_id: listData[indexRow].id },
                        })
                      "
                    >
                      Edit Data Alat
                    </b-dropdown-item>
                    <b-dropdown-item @click="deleteNotif(indexRow)">
                      <span class="smil-text-danger"> Hapus Data Alat </span>
                    </b-dropdown-item>
                  </b-dropdown>
                </template>
                <template v-else-if="typeof content === 'object'">
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
          @change="getListAlat"
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

    <!-- START: MODAL FILTER DATA FOR MOBILE -->
    <b-modal
      ref="modal-popup"
      no-close-on-backdrop
      no-close-on-esc
      hide-header
      hide-footer
      centered
      :size="baseModalType === 'asal' || baseModalType === 'satuan' ? 'lg' : ''"
    >
      <form-filter-data
        v-if="baseModalType === 'filter-data'"
        title="Filter Data Alat"
        :closeModal="closePopup"
        :form="formFilter"
        :formInput="filterData"
        :submitFunction="getListAlat"
        :activeButton="mobileFilterActive"
      />

      <base-modal-alert
        v-if="baseModalType === 'alert'"
        :isProcess="isProcess"
        :isSuccess="isSuccess"
        :message="message"
        :notes="notes"
        :closeAlert="closePopup"
      />

      <base-modal-list-support
        v-if="baseModalType === 'asal' || baseModalType === 'satuan'"
        :title="
          baseModalType === 'asal' ? 'Asal Pengadaan Alat' : 'Satuan Jumlah'
        "
        :supportType="baseModalType"
        :closeModal="closeSupport"
      />
    </b-modal>
    <!-- END: MODAL FILTER DATA FOR MOBILE -->
  </div>
</template>

<script>
// Components
import IconComponent from "@/components/IconComponent.vue";
import FormFilterData from "@/components/FormFilterData.vue";
import BaseFilter from "@/components/BaseFilter.vue";
import BaseModalAlert from "@/components/BaseModal/BaseModalAlert.vue";
import BaseModalListSupport from "@/components/BaseModal/BaseModalListSupport.vue";

// Mixins
import ModalMixins from "@/mixins/ModalMixins";
import TableMixins from "@/mixins/TableMixins";
import ErrorHandlerMixins from "@/mixins/ErrorHandlerMixins";

// API
import api from "@/api/admin_api";

export default {
  name: "list-alat-lab",
  components: {
    IconComponent,
    FormFilterData,
    BaseFilter,
    BaseModalAlert,
    BaseModalListSupport,
  },
  mixins: [ModalMixins, TableMixins, ErrorHandlerMixins],
  data() {
    return {
      headsTable: [
        {
          label: "Nama Alat",
          filter_type: "search",
          placeholder: "Filter Nama Alat",
          model: "alat_name",
          options: null,
        },
        {
          label: "Jenis Alat",
          filter_type: "select",
          model: "jenis_alat_id",
          options: [
            {
              id: null,
              name: "All",
              value: null,
              disabled: false,
            },
          ],
        },
        {
          label: "Asal Pengadaan",
          filter_type: "select",
          model: "asal_pengadaan_id",
          options: [],
        },
        {
          label: "Tahun Pengadaan",
          filter_type: "search",
          placeholder: "Filter Tahun Pengadaan",
          model: "alat_year",
          options: null,
        },
        {
          label: "Alat Dapat Dipinjam",
          filter_type: "select",
          model: "can_borrowed",
          options: [
            {
              id: null,
              name: "All",
              value: null,
              disabled: false,
            },
            {
              id: 1,
              name: "Bisa Dipinjam",
              value: 1,
              disabled: false,
            },
            {
              id: 2,
              name: "Tidak Bisa Dipinjam",
              value: 2,
              disabled: false,
            },
          ],
        },
        {
          label: "Alat Habis Pakai",
          filter_type: "select",
          model: "habis_pakai",
          options: [
            {
              id: null,
              name: "All",
              value: null,
              disabled: false,
            },
            {
              id: 1,
              name: "Habis Pakai",
              value: 1,
              disabled: false,
            },
            {
              id: 2,
              name: "Tidak Habis Pakai",
              value: 2,
              disabled: false,
            },
          ],
        },
        "",
      ],
      filterData: {
        alat_name: "",
        jenis_alat_id: null,
        asal_pengadaan_id: null,
        alat_year: "",
        can_borrowed: null,
        habis_pakai: null,
      },
      formFilter: [
        {
          label: "Nama Alat",
          type: "text",
          model: "alat_name",
          description: "",
          placeholder: "Filter Nama Alat",
          isRequired: false,
        },
        {
          label: "Jenis Alat",
          type: "select",
          model: "jenis_alat_id",
          description: "",
          placeholder: "All",
          isRequired: false,
          options: [
            {
              id: null,
              name: "All",
              value: null,
              disabled: true,
            },
          ],
        },
        {
          label: "Asal Pengadaan Alat",
          type: "select",
          model: "asal_pengadaan_id",
          description: "",
          placeholder: "All",
          isRequired: false,
          options: [],
        },
        {
          label: "Tahun Pengadaan Alat",
          type: "text",
          model: "alat_year",
          description: "",
          placeholder: "Filter Tahun Alat",
          isRequired: false,
        },
        {
          label: "Alat Dapat Dipinjam",
          filter_type: "select",
          model: "can_borrowed",
          options: [
            {
              id: null,
              name: "All",
              value: null,
              disabled: false,
            },
            {
              id: 1,
              name: "Bisa Dipinjam",
              value: 1,
              disabled: false,
            },
            {
              id: 2,
              name: "Tidak Bisa Dipinjam",
              value: 2,
              disabled: false,
            },
          ],
        },
        {
          label: "Alat Habis Pakai",
          filter_type: "select",
          model: "habis_pakai",
          options: [
            {
              id: null,
              name: "All",
              value: null,
              disabled: false,
            },
            {
              id: 1,
              name: "Habis Pakai",
              value: 1,
              disabled: false,
            },
            {
              id: 2,
              name: "Tidak Habis Pakai",
              value: 2,
              disabled: false,
            },
          ],
        },
      ],
      listAsalPengadaanAlat: [],
      listJenisAlat: [],
    };
  },
  watch: {
    "tableInfo.pageNo": {
      deep: true,
      handler: function () {
        if (!this.loadingTable) {
          this.getListAlat();
        }
      },
    },
  },
  computed: {
    listTable() {
      let listTable = [];
      if (this.listData.length > 0) {
        this.listData.forEach((list, indexList) => {
          let alatCanBorrowed =
            list.can_borrowed === true
              ? { text: "Bisa Dipinjam", background: "smil-bg-success" }
              : { text: "Tidak Bisa Dipinjam", background: "smil-bg-danger" };
          let alatHabisPakai =
            list.habis_pakai === true
              ? { text: "Habis Pakai", background: "smil-bg-info" }
              : { text: "Tidak Habis Pakai", background: "smil-bg-info" };
          let rowTable = [
            list.alat_name, //Nama Alat
            list.jenis_alat_model.jenis_name, // Nama Jenis
            list.asal_pengadaan_model.asal_pengadaan_name, //Asal Pengadaan
            list.alat_year,
            alatCanBorrowed,
            alatHabisPakai,
            indexList, //Index Data
          ];

          listTable.push(rowTable);
        });
      }

      return listTable;
    },
    mobileFilterActive() {
      let value = this.filterPayload;
      return (
        value.alat_name !== "" ||
        value.jenis_id !== null ||
        value.asal_pengadaan_id !== null ||
        value.tahun_alat !== ""
      );
    },
    filterPayload() {
      let tableInfo = this.tableInfo;
      return {
        page_size: tableInfo.listSize,
        sort_by: "id",
        sort_direction: "ASC",
        ...this.filterData,
      };
    },
  },
  async mounted() {
    if (this.isSuperAdmin) {
      this.$router.go(-1);
    }
    await this.getListAlat();
    await this.getAsalPengadaanAlat();
    await this.getListJenisAlat();
  },
  methods: {
    // Call API
    async getListAlat() {
      this.loadingTable = true;
      if (this.isFilterUse && this.tableInfo.pageNo > 1) {
        this.tableInfo.pageNo = 1;
      }
      // Nembak API Get List Alat
      try {
        const response = await api.getFilterData(
          "alat",
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
            this.showAlert(false, false, "Terjadi Kesalahan", message);
          }, 500);
        } else {
          this.showAlert(false, false, message);
        }
      }
      this.loadingTable = false;
    },
    async getListJenisAlat() {
      // Nembak API
      try {
        const response = await api.getPlainData("jenis");

        let jenisAlat = response.data.data;

        // Set to Variable

        let headsJenisAlat = this.headsTable[1];
        let filterJenisAlat = this.formFilter[1];
        jenisAlat.forEach((jenis) => {
          let ja = {
            id: jenis.id,
            name: jenis.jenis_name,
            value: jenis.id,
            disabled: false,
          };
          headsJenisAlat.options.push(ja);
          filterJenisAlat.options.push(ja);
        });
      } catch (e) {
        let message = this.getErrorMessage(e);
        if (typeof message == "object" && message.length > 0) {
          setTimeout(() => {
            this.showAlert(false, false, "Terjadi Kesalahan", message);
          }, 500);
        } else {
          this.showAlert(false, false, message);
        }
      }
    },
    async getAsalPengadaanAlat() {
      try {
        const response = await api.getPlainData("asal");
        let asalPengadaan = response.data.data;
        // Set to Variable
        // Simpan sebagai Options
        let options = [
          {
            id: null,
            name: "All",
            value: null,
            disabled: false,
          },
        ];
        let headsAsalPengadaan = this.headsTable[2];
        let filterAsalPengadaan = this.formFilter[2];
        asalPengadaan.forEach((asal, indexJns) => {
          let ap = {
            id: asal.id,
            name: asal.asal_pengadaan_name,
            value: asal.id,
            disabled: false,
          };
          options.push(ap);
        });
        headsAsalPengadaan.options = options;
        filterAsalPengadaan.options = options;
      } catch (e) {
        let message = this.getErrorMessage(e);
        if (typeof message == "object" && message.length > 0) {
          setTimeout(() => {
            this.showAlert(false, false, "Terjadi Kesalahan", message);
          }, 500);
        } else {
          this.showAlert(false, false, message);
        }
      }
    },
    async deleteAlat(alatId) {
      this.showAlert(true);
      try {
        const response = await api.deleteData("alat", alatId);
        if (response.data.response.code === 200) {
          this.showAlert(false, true, response.data.response.message);
          setTimeout(() => {
            this.getListAlat();
          }, 2000);
        }
      } catch (e) {
        let message = this.getErrorMessage(e);
        if (typeof message == "object" && message.length > 0) {
          setTimeout(() => {
            this.showAlert(false, false, "Terjadi Kesalahan", message);
          }, 500);
        } else {
          this.showAlert(false, false, message);
        }
      }
    },
    // Modal
    closeSupport() {
      this.getAsalPengadaanAlat();
      this.closePopup();
    },

    // Action Dropdown

    deleteNotif(index) {
      let data = this.listData[index];
      let confirmDelete = confirm(
        `Apakah anda yakin ingin menghapus alat ${data.alat_name} ? Seluruh data yang berhubungan dengan alat ini akan ikut terhapus`
      );
      if (confirmDelete) {
        this.deleteAlat(data.id);
      }
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
