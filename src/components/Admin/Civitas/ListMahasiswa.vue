<template>
  <div class="list-mahasiswa">
    <!-- START: BUTTON GROUP -->
    <div class="button-group d-flex align-items-center">
      <h1 class="tab-title">Mahasiswa</h1>
    </div>
    <!-- END: BUTTON GROUP -->

    <!-- START: LIST DATA -->
    <div class="table-responsive-sm">
      <table class="table smil-table">
        <thead class="smil-thead">
          <tr>
            <th
              v-for="(head, indexHds) in headsTable"
              :key="`header-table-${head.id}-${indexHds}`"
            >
              {{ head.label }}
              <base-filter
                filter_class="d-none d-lg-block"
                @changeValue="changeFilterValue"
                @filterAction="getListMahasiswa"
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
                    <b-dropdown-item @click="lihatDetail(indexRow)">
                      Detail Mahasiswa
                    </b-dropdown-item>
                    <!-- <b-dropdown-item>
											Edit Data Mahasiswa
										</b-dropdown-item> -->

                    <b-dropdown-item @click="deleteNotif(indexRow)">
                      <span class="smil-text-danger">
                        Hapus Data Mahasiswa
                      </span>
                    </b-dropdown-item>
                  </b-dropdown>
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
          @change="getListMahasiswa"
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
      :size="baseModalType === 'detail' ? 'lg' : 'md'"
    >
      <form-filter-data
        v-if="baseModalType === 'filter'"
        title="Filter Data Alat"
        :closeModal="closePopup"
        :formInput="filterData"
        :form="formFilter"
        @submitFilter="getListMahasiswa"
      />
      <base-modal-detail
        v-if="baseModalType === 'detail'"
        title="Detail Mahasiswa"
        :headsData="headsDetail"
        :valueData="detailData"
        :closeModal="closePopup"
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
  </div>
</template>

<script>
// Components
import IconComponent from "@/components/IconComponent.vue";
import FormFilterData from "@/components/FormFilterData.vue";
import BaseFilter from "@/components/BaseFilter.vue";
import BaseModalAlert from "@/components/BaseModal/BaseModalAlert.vue";
import BaseModalDetail from "@/components/BaseModal/BaseModalDetail.vue";

// Mixins
import ModalMixins from "@/mixins/ModalMixins";
import TableMixins from "@/mixins/TableMixins";
import ErrorHandlerMixins from "@/mixins/ErrorHandlerMixins";
import AlertInfoMixin from "@/mixins/AlertInfoMixin";

// API
import api from "@/api/admin_api";

export default {
  name: "list-mahasiswa",
  mixins: [AlertInfoMixin, ModalMixins, TableMixins, ErrorHandlerMixins],
  components: {
    IconComponent,
    FormFilterData,
    BaseFilter,
    BaseModalAlert,
    BaseModalDetail,
  },
  props: {
    listProdi: Array,
  },
  data() {
    return {
      headsTable: [
        {
          label: "Nomor Induk Mahasiswa",
          filter_type: "search",
          placeholder: "Filter Nomor Induk Mahasiswa",
          model: "nim",
          options: null,
        },
        {
          label: "Nama Mahasiswa",
          filter_type: "search",
          placeholder: "Filter Nama Mahasiswa",
          model: "mahasiswa_fullname",
          options: null,
        },
        {
          label: "Program Studi",
          filter_type: "select",
          placeholder: "Filter Program Studi",
          model: "prodi_id",
          options: [],
        },
        {
          label: "Email",
          filter_type: "search",
          placeholder: "Filter Email",
          model: "email",
          options: null,
        },
        "",
      ],
      headsDetail: [
        {
          label: "Nomor Induk Mahasiswa",
          key: "nim",
        },
        {
          label: "Nama Lengkap",
          key: "mahasiswa_fullname",
        },
        {
          label: "Email",
          key: "email",
        },
        {
          label: "Nomor Telepon",
          key: "phone_number",
        },
        {
          label: "Alamat Tempat Tinggal",
          key: "address",
        },
        {
          label: "Program Studi",
          key: "prodi_name",
        },
      ],
      filterData: {
        nim: "",
        mahasiswa_fullname: "",
        prodi_id: null,
        email: "",
      },
      formFilter: [
        {
          label: "Nomor Induk Mahasiswa",
          type: "text",
          model: "nim",
          description: "",
          placeholder: "Filter Nomor Induk Mahasiswa",
          isRequired: false,
        },
        {
          label: "Nama Mahasiswa",
          type: "text",
          model: "mahasiswa_fullname",
          description: "",
          placeholder: "Filter Nama Mahasiswa",
          isRequired: false,
        },
        {
          label: "Program Studi",
          type: "select",
          model: "prodi_id",
          description: "",
          placeholder: "Filter Program Studi",
          isRequired: false,
          options: [],
        },
      ],
      // Data Add Jenis Alat
    };
  },
  computed: {
    listTable() {
      let listTable = [];
      this.listData.forEach((list, indexList) => {
        let rowTable = [
          list.nim, //NIM
          list.mahasiswa_fullname, //Nama Mahasiswa
          list.prodi_id == null ? "-" : list.prodi_model.prodi_name, //Program Studi
          list.email, //Email
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
        sort_direction: "ASC",
        ...this.filterData,
      };
    },
    detailData() {
      if (Object.keys(this.selectedRowData).length > 0) {
        let data = this.selectedRowData;
        return {
          nim: data.nim,
          mahasiswa_fullname: data.mahasiswa_fullname,
          email: data.email,
          phone_number: data.phone_number,
          address: data.address,
          prodi_name:
            data.prodi_model !== null ? data.prodi_model.prodi_name : "-",
        };
      }
    },
  },
  watch: {
    "tableInfo.pageNo": {
      deep: true,
      handler: function () {
        if (!this.loadingTable) {
          this.getListMahasiswa();
        }
      },
    },
  },
  async mounted() {
    await this.getListMahasiswa();
    this.getProdi();
  },
  methods: {
    // Call API
    async getListMahasiswa() {
      this.loadingTable = true;
      if (this.isFilterUse && this.tableInfo.pageNo > 1) {
        this.tableInfo.pageNo = 1;
      }
      // Nembak API Get List Alat
      try {
        const response = await api.getFilterData(
          "mahasiswa",
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
    getProdi() {
      this.headsTable[2].options = this.listProdi;
      this.formFilter[2].options = this.listProdi;
    },
    async deleteMahasiswa(nim) {
      this.popupAlert(true);
      try {
        const response = await api.deleteData("mahasiswa", nim);
        if (response.data.response.code == 200) {
          this.popupAlert(false, true, response.data.response.message);
          this.getListMahasiswa();
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
    lihatDetail(indexData) {
      this.selectedRowData = this.listData[indexData];
      this.openPopup("detail");
    },
    deleteNotif(index) {
      let mahasiswa = this.listData[index];
      let confirm = window.confirm(
        `Apakah anda yakin ingin menghapus mahasiswa ${mahasiswa.mahasiswa_fullname}`
      );
      if (confirm) {
        this.deleteMahasiswa(mahasiswa.nim);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.button-group {
  margin-bottom: 40px;
  .tab-title {
    font-size: 32px;
    color: #101939;
    font-weight: 700;
    margin-bottom: 0;
  }
  button {
    margin-right: 15px;
  }
}
</style>
