<template>
  <div class="dashboard-pengembalian-peminjaman">
    <get-peminjaman
      v-if="isSelectPeminjaman"
      :popupAlert="popupAlert"
      :processPeminjaman="processPeminjaman"
    />
    <process-pengembalian
      v-else
      :popupAlert="popupAlert"
      :selectedData="selectedPeminjaman"
      :cancelPengembalian="cancelPengembalian"
    />

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
  </div>
</template>

<script>
// Components
import BaseModalAlert from "@/components/BaseModal/BaseModalAlert";
import GetPeminjaman from "@/components/Pengembalian/GetPeminjaman";
import ProcessPengembalian from "@/components/Pengembalian/ProcessPengembalian";

// Mixin
import AlertInfoMixin from "@/mixins/AlertInfoMixin";

export default {
  name: "dashboard-pengembalian-peminjaman",
  components: { BaseModalAlert, GetPeminjaman, ProcessPengembalian },
  mixins: [AlertInfoMixin],
  data() {
    return {
      isSelectPeminjaman: false,
      selectedPeminjaman: {},
    };
  },
  async mounted() {
    let routeParams = this.$route.params;
    if (routeParams.peminjamanData) {
      this.isSelectPeminjaman = false;
      this.selectedPeminjaman = routeParams.peminjamanData;
    } else {
      this.isSelectPeminjaman = true;
    }
  },
  methods: {
    // Action Methods
    processPeminjaman(data) {
      this.selectedPeminjaman = data;
      this.isSelectPeminjaman = false;
    },
    cancelPengembalian() {
      if (this.$route.params.peminjamanData) {
        this.$router.push({ name: "ListPeminjamanAlat" });
      } else {
        this.selectedPeminjaman = {};
        this.isSelectPeminjaman = true;
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
