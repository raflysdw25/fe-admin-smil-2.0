<template>
  <div class="booking-process-modal">
    <h5 class="title-process">{{ wordingProcess.title }}</h5>
    <p class="note-process">
      {{ wordingProcess.message }}
    </p>
    <div class="form-group" v-if="processType === 'cancel'">
      <label for="booking-notes" class="form-label"
        >Alasan Batalkan Janji</label
      >
      <textarea
        id="booking-notes"
        v-model="bookingNotes"
        class="form-control"
        cols="30"
        rows="10"
      ></textarea>
    </div>
    <div class="button-group">
      <button class="smil-btn smil-bg-danger" @click="closeModal">Batal</button>
      <button class="smil-btn smil-bg-primary ml-2" @click="submit">
        Submit
      </button>
    </div>
  </div>
</template>
<script>
let moment = require("moment");
export default {
  name: "booking-process-modal",
  props: {
    popupAlert: Function,
    closeModal: Function,
    bookingData: Object,
    processType: String, //cancel, done
    submitProcess: Function,
  },
  data() {
    return {
      bookingNotes: "",
    };
  },
  computed: {
    wordingProcess() {
      let wording = {
        title: "",
        message: "",
      };
      if (this.processType === "cancel") {
        wording.title = "Batal Janji Pengembalian Alat";
        wording.message = `Apakah anda yakin ingin membatalkan janji pada tanggal ${this.formatDate(
          this.bookingData.appointment_date,
          "DD MMMM YYYY"
        )}? Peminjam perlu membuat janji baru jika ingin melakukan janji pengembalian alat`;
      } else if (this.processType === "done") {
        wording.title = "Selesai Janji Pengembalian Alat";
        wording.message = "Apakah anda yakin ingin menyelesaikan janji ini?";
      }

      return wording;
    },
    submitRequest() {
      let bd = this.bookingData;
      let userData = this.$store.state.admin;
      return {
        appointment_date: bd.appointment_date,
        nim_mahasiswa: bd.nim_mahasiswa,
        nip_staff: bd.nip_staff,
        peminjaman_id: bd.peminjaman_id,
        is_booking_cancel: this.processType === "cancel" ? true : false,
        booking_notes: this.bookingNotes,
        process_by: `${userData.staff_model.staff_fullname} (${userData.jabatan_model.jabatan_name})`,
      };
    },
  },
  methods: {
    async submit() {
      await this.submitProcess(this.submitRequest);
    },
    formatDate(date, format = "DD/MM/YYYY") {
      return moment(date).format(format);
    },
  },
};
</script>
<style lang="scss" scoped>
.booking-process-modal {
  .title-process {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 12px;
  }
  .note-process {
    margin-bottom: 0;
    color: #696969;
  }

  .form-group {
    margin-top: 20px;
    margin-bottom: 0;
  }
  .button-group {
    margin-top: 28px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
