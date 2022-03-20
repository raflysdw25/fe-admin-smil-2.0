<template>
  <div class="layout-portal-admin">
    <!-- START: Menu Navigation -->
    <menu-navigation
      :listMenu="menus"
      type="sidebar"
      :sidebarShown="toggleSideBar"
      @actionSidebar="actionSidebar"
    />
    <!-- END: Menu Navigation -->

    <!-- START: CONTENT VIEW -->
    <div class="content-view">
      <!-- Navbar Admin -->
      <div class="navbar-admin">
        <span
          class="smil-menu"
          @click="toggleSideBar ? closeSidebar() : showSidebar()"
        >
          <b-icon
            v-if="toggleSideBar"
            icon="arrow-left"
            style="width: 24px; height: 24px"
          ></b-icon>
          <icon-component
            v-else
            iconName="menu-toggle"
            :size="24"
            colorIcon="#000"
          />
        </span>

        <h2 class="page-title" :class="isMobile">{{ pageName }}</h2>
        <div class="staff-info">
          <button
            v-if="$route.name !== 'PengembalianAlat'"
            class="smil-btn smil-bg-primary btn-return d-lg-block d-none"
            @click="$router.push({ name: 'PengembalianAlat' })"
          >
            Pengembalian Alat
          </button>
          <b-dropdown
            right
            size="sm"
            variant="smil-drop"
            toggle-class="text-decoration-none"
            no-caret
            no-flip
          >
            <template v-slot:button-content>
              <div class="identity">
                <div class="identity-info">
                  <span class="identity-name">{{
                    adminData.staff_model.staff_fullname
                  }}</span>
                  <span class="identity-job">{{
                    adminData.jabatan_model.jabatan_name
                  }}</span>
                </div>
                <div class="identity-icon" v-if="!isMobile">
                  <icon-component iconName="user" :size="30" colorIcon="#000" />
                </div>
              </div>
            </template>
            <b-dropdown-item @click="openProfile = true">
              Profile
            </b-dropdown-item>
            <b-dropdown-item
              class="d-lg-none d-block"
              @click="$router.push({ name: 'PengembalianAlat' })"
            >
              Pengembalian Alat
            </b-dropdown-item>
            <b-dropdown-item @click="openChangePassword = true">
              Ganti Password
            </b-dropdown-item>
            <b-dropdown-item @click="logoutAdmin"> Keluar </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
      <!-- Navbar Admin -->

      <!-- Content Admin -->
      <div class="content-admin">
        <router-view />
      </div>
      <!-- Content Admin -->

      <!-- START: FOOTER -->
      <footer-layout
        :newClass="toggleSideBar ? `open-sidebar` : `close-sidebar`"
      />
      <!-- END: FOOTER -->
    </div>
    <!-- END: CONTENT VIEW -->

    <b-modal
      ref="modal-alert"
      no-close-on-backdrop
      no-close-on-esc
      hide-header
      hide-footer
      centered
    >
      <base-modal-alert
        :isProcess="alertInfo.isProcess"
        :isSuccess="alertInfo.isSuccess"
        :message="alertInfo.message"
        :notes="alertInfo.notes"
        :closeAlert="closeAlert"
      />
    </b-modal>
    <b-modal v-model="openProfile" hide-header hide-footer centered size="xl">
      <base-modal-profile :popupAlert="popupAlert" />
    </b-modal>
    <!-- MODAL CHANGE PASSWORD -->
    <b-modal v-model="openChangePassword" hide-header hide-footer centered>
      <base-modal-change-password
        :popupAlert="popupAlert"
        :closePopup="closeChangePassword"
      />
    </b-modal>
    <!-- MODAL CHANGE PASSWORD -->
  </div>
</template>

<script>
// Components
import MenuNavigation from "@/components/MenuNavigation.vue";
import IconComponent from "@/components/IconComponent.vue";
import FooterLayout from "@/components/FooterLayout.vue";
import BaseModalAlert from "@/components/BaseModal/BaseModalAlert";
import BaseModalProfile from "@/components/BaseModal/BaseModalProfile";
import BaseModalChangePassword from "@/components/BaseModal/BaseModalChangePassword";

// Mixins

import AlertInfoMixin from "@/mixins/AlertInfoMixin";

// Vuex
import * as types from "@/store/types.js";

// API
import api from "@/api/admin_api";
export default {
  name: "layout-portal-admin",
  components: {
    MenuNavigation,
    IconComponent,
    FooterLayout,
    BaseModalAlert,
    BaseModalProfile,
    BaseModalChangePassword,
  },
  mixins: [AlertInfoMixin],
  data() {
    return {
      toggleSideBar: false,
      firstAccess: true,
      openProfile: false,
      openChangePassword: false,
    };
  },
  watch: {
    toggleSidebar: {
      immediate: true,
      handler: function (newVal) {
        this.toggleSideBar = newVal;
      },
    },
  },
  async mounted() {
    if (this.adminData.first_login && !this.adminData.skipChangePassword) {
      this.$router.push({ name: "FirstLoginAdmin" });
    }
    await this.getAdminImage();
  },
  computed: {
    isKaLab() {
      return this.adminData.jabatan_id === 2;
    },
    isSuperAdmin() {
      return this.adminData.jabatan_id === 1;
    },
    isMobile() {
      const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i,
      ];

      return toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
      });
    },
    menus() {
      let regular = null;

      if (this.isSuperAdmin) {
        regular = [
          {
            id: 1,
            text: "Dashboard",
            to: "DashboardAdmin",
            icon: {
              iconName: "pie-chart",
              size: 32,
              color: "#fff",
            },
            activeMenu: "",
          },
          {
            id: 6,
            text: "Civitas Jurusan",
            to: "ListCivitasJurusan",
            icon: { iconName: "graduated", size: 32, color: "#fff" },
            activeMenu: "jurusan",
          },
          {
            id: 7,
            text: "Staff Laboratorium",
            to: "ListStaffLaboratorium",
            icon: { iconName: "users", size: 32, color: "#fff" },
            activeMenu: "staff",
          },
        ];
      } else if (this.isKaLab) {
        regular = [
          {
            id: 1,
            text: "Dashboard",
            to: "DashboardAdmin",
            icon: {
              iconName: "pie-chart",
              size: 32,
              color: "#fff",
            },
            activeMenu: "",
          },
          {
            id: 2,
            text: "Alat Laboratorium",
            icon: {
              iconName: "boxes",
              size: 32,
              color: "#fff",
            },
            child: [
              {
                id: 1,
                text: "List Alat Laboratorium",
                to: "ListAlatLaboratorium",
                activeMenu: "list",
              },
              {
                id: 2,
                text: "Jenis Alat Laboratoirum",
                to: "JenisAlatLaboratorium",
                activeMenu: "jenis",
              },
              {
                id: 3,
                text: "Laporan Kerusakan Alat",
                to: "LaporanKerusakanAlat",
                activeMenu: "kerusakan",
              },
            ],
            activeMenu: "alatlab",
          },
          {
            id: 3,
            text: "Supplier",
            to: "ListSupplier",
            icon: { iconName: "truck", size: 32, color: "#fff" },
            activeMenu: "supplier",
          },
          {
            id: 4,
            text: "Peminjaman Alat",
            icon: { iconName: "scanner", size: 32, color: "#fff" },
            child: [
              {
                id: 1,
                text: "List Peminjaman Alat",
                to: "ListPeminjamanAlat",
                activeMenu: "list",
              },
              {
                id: 2,
                text: "List Booking Pengembalian",
                to: "ListBookingPengembalian",
                activeMenu: "booking-pengembalian",
              },
            ],
            activeMenu: "peminjaman",
          },
          {
            id: 5,
            text: "Lokasi Penyimpanan",
            to: "ListLokasiPenyimpanan",
            icon: { iconName: "location", size: 32, color: "#fff" },
            activeMenu: "penyimpanan",
          },
          {
            id: 6,
            text: "Civitas Jurusan",
            to: "ListCivitasJurusan",
            icon: { iconName: "graduated", size: 32, color: "#fff" },
            activeMenu: "jurusan",
          },
          {
            id: 7,
            text: "Staff Laboratorium",
            to: "ListStaffLaboratorium",
            icon: { iconName: "users", size: 32, color: "#fff" },
            activeMenu: "staff",
          },
        ];
      } else {
        regular = [
          {
            id: 1,
            text: "Dashboard",
            to: "DashboardAdmin",
            icon: {
              iconName: "pie-chart",
              size: 32,
              color: "#fff",
            },
            activeMenu: "",
          },
          {
            id: 2,
            text: "Alat Laboratorium",
            icon: {
              iconName: "boxes",
              size: 32,
              color: "#fff",
            },
            child: [
              {
                id: 1,
                text: "List Alat Laboratorium",
                to: "ListAlatLaboratorium",
                activeMenu: "list",
              },
              {
                id: 2,
                text: "Jenis Alat Laboratoirum",
                to: "JenisAlatLaboratorium",
                activeMenu: "jenis",
              },
              {
                id: 3,
                text: "Laporan Kerusakan Alat",
                to: "LaporanKerusakanAlat",
                activeMenu: "kerusakan",
              },
            ],
            activeMenu: "alatlab",
          },
          {
            id: 3,
            text: "Supplier",
            to: "ListSupplier",
            icon: { iconName: "truck", size: 32, color: "#fff" },
            activeMenu: "supplier",
          },
          {
            id: 4,
            text: "Peminjaman Alat",
            icon: { iconName: "scanner", size: 32, color: "#fff" },
            child: [
              {
                id: 1,
                text: "List Peminjaman Alat",
                to: "ListPeminjamanAlat",
                activeMenu: "list",
              },
              {
                id: 2,
                text: "List Booking Pengembalian",
                to: "ListBookingPengembalian",
                activeMenu: "booking-pengembalian",
              },
            ],
            activeMenu: "peminjaman",
          },
          {
            id: 5,
            text: "Lokasi Penyimpanan",
            to: "ListLokasiPenyimpanan",
            icon: { iconName: "location", size: 32, color: "#fff" },
            activeMenu: "penyimpanan",
          },
          {
            id: 6,
            text: "Civitas Jurusan",
            to: "ListCivitasJurusan",
            icon: { iconName: "graduated", size: 32, color: "#fff" },
            activeMenu: "jurusan",
          },
        ];
      }

      return regular;
    },
    adminData() {
      return this.$store.getters[types.ADMIN];
    },
    pageName() {
      let page = this.$route.name;
      return page.split(/(?=[A-Z])/).join(" ");
    },
  },
  methods: {
    // Authorize
    async logoutAdmin() {
      this.popupAlert(true);
      try {
        const response = await api.logoutAdmin();
        if (response.data.response.code == 200) {
          // localStorage.removeItem('access_token')
          $cookies.remove("smilAdminAuth");
          $cookies.remove("smilAccessToken");
          this.popupAlert(false, true, response.data.response.message);
          setTimeout(() => {
            this.$router.push({ name: "LoginAdmin" });
            this.$store.dispatch(types.UPDATE_ADMIN, null);
          }, 2000);
        }
      } catch (e) {
        this.popupAlert(false, false, e.response.data.message);
      }
    },
    async getAdminImage() {
      try {
        const response = await api.getUserImage(this.adminData.id);
        if (response.status === 200) {
          let imageData = response.data.data.image_data;
          this.$store.dispatch(types.UPDATE_IMAGE_ADMIN, imageData);
        }
      } catch (error) {
        this.popupAlert(false, false, error.message);
      }
    },
    // Modal Admin
    actionSidebar(action) {
      if (action) {
        this.showSidebar();
      } else {
        this.closeSidebar();
      }
    },
    showSidebar() {
      this.toggleSideBar = true;
    },
    closeSidebar() {
      this.toggleSideBar = false;
    },
    closeChangePassword() {
      this.openChangePassword = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.layout-portal-admin {
  .content-view {
    display: grid;
    grid-template-rows: auto 1fr auto;

    .navbar-admin {
      display: flex;
      align-items: center;
      margin-top: 35px;
      .page-title {
        font-weight: bold;
        margin-left: 10px;
        margin-bottom: 0;
      }
      .staff-info {
        display: flex;
        margin-left: auto;
        .btn-return {
          margin-right: 60px;
        }
        .identity {
          display: flex;
          flex-flow: row;
          overflow-y: hidden;
          .identity-info {
            text-align: right;
            display: flex;
            flex-flow: column;
            margin-right: 10px;
            .identity-name {
              font-size: 14px;
              color: #000;
              font-weight: bold;
            }
            .identity-job {
              font-size: 12px;
              color: #696969;
            }
          }
        }
      }
    }

    .content-admin {
      overflow-y: auto !important;
      margin: 45px 0;
      padding: 0 20px 0 20px;
      min-height: 100vh;
    }
    .footer-layout {
      padding-left: 10px;
    }
  }
}

@media screen and (max-width: 992px) {
  .content-view {
    .navbar-admin {
      .page-title {
        font-size: 18px;
      }
      .staff-info {
        .identity {
          .identity-info {
            .identity-name {
              font-size: 10px;
            }
            .identity-job {
              font-size: 8px;
            }
          }
        }
      }
    }
    .content-admin {
      padding: 0 10px 0 10px !important;
    }
  }
}
</style>

<style lang="scss">
.layout-portal-admin {
  .custom-select {
    background: url(../../assets/images/Dropdown_Icon_Active.png) no-repeat
      white;
    background-position: calc(100% - 10px) 10px;
    -webkit-appearance: none;
    -moz-appearance: none;
  }
  .table-count {
    .custom-select {
      background-position: calc(100%) 3px;
    }
  }
  .smil-thead {
    .custom-select {
      background-position: calc(100%) 5px;
    }
  }
  // Custom Scrollbar
  /* width */
  ::-webkit-scrollbar {
    width: 7px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #f3f3f3;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #e1e1e1;
    border-radius: 5px;
    height: 94px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
}
</style>
