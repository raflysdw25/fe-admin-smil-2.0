let moment = require("moment");
export default {
  data() {
    return {
      inputType: ["number", "text", "password", "email", "tel", "text-barcode"],
      isCreate: false,
      loadingForm: false,
    };
  },
  methods: {
    formInputType(type) {
      if (this.inputType.includes(type)) {
        return "input";
      } else {
        return type;
      }
    },
    formConstraint(e, type) {
      if (type === "tel") {
        let char = String.fromCharCode(e.keyCode); // Get the character
        if (/^[0-9]+$/.test(char)) return true;
        // Match with regex
        else e.preventDefault(); // If not match, don't add to input text
      } else if (type === "barcode-input") {
        if (this.environment === "development") {
          return true;
        }
        let timer = 0;
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (e.target.value.length < 2) {
            e.target.value = "";
          }
        }, 66);
      } else if (type === "number") {
        if (e.target.value < 0) {
          e.target.value = 0;
        }
      } else {
        return true;
      }
    },
    emailValidate(email) {
      if (email === "") {
        return null;
      } else {
        const EMAIL_REGEX = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        if (EMAIL_REGEX.test(email)) {
          return true;
        }
        return false;
      }
    },
    formPasteConstraint(e, type) {
      if (type === "barcode-input") {
        if (this.environment === "development") {
          return true;
        }
        e.preventDefault();
      } else {
        return true;
      }
    },
    formatDate(date, format = "DD-MM-YYYY") {
      return moment(date).format(format);
    },
    notBeforeToday(date) {
      return date < new Date().setHours(0, 0, 0, 0);
    },
    dateRange(start, end) {
      if (end !== null) {
        let startDate = moment(start);
        let endDate = moment(end);
        return endDate.diff(startDate, "days");
      } else {
        return null;
      }
    },
  },
  computed: {
    environment() {
      return process.env.VUE_APP_DEVELOPMENT === "true"
        ? "development"
        : "production";
    },
  },
};
