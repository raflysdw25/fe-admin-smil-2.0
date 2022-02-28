export default {
	data() {
		return {
			alertInfo: {
				isProcess: false,
				isSuccess: false,
				message: '',
				notes: [],
				countError: 0,
			},
		}
	},
	methods: {
		openAlert() {
			this.$refs['modal-alert'].show()
		},
		closeAlert() {
			this.$refs['modal-alert'].hide()
			this.setEmptyNotes()
		},
		popupAlert(isProcess, isSuccess = false, message = '', notes = []) {
			this.alertInfo.isProcess = isProcess
			this.alertInfo.isSuccess = isSuccess
			this.alertInfo.message = message
			this.alertInfo.notes = notes
			this.openAlert()
		},
		setEmptyNotes() {
			this.alertInfo.notes = []
			this.alertInfo.countError = 0
		},
	},
}
