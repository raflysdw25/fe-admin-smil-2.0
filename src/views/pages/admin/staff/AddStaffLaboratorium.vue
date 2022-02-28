<template>
	<div class="text-center" v-if="loadingForm">
		<b-spinner style="width: 120px; height: 120px"></b-spinner>
	</div>
	<div class="add-staff-laboratorium" v-else>
		<!-- START: BUTTON GROUP -->
		<div class="button-group d-flex align-items-center justify-content-end">
			<button
				class="smil-btn smil-bg-danger mr-4"
				@click="$router.push({ name: 'ListStaffLaboratorium' })"
			>
				Batal
			</button>
			<button
				class="smil-btn smil-bg-primary"
				:disabled="!formFilled"
				@click="submitNotif"
			>
				Simpan
			</button>
		</div>
		<!-- END: BUTTON GROUP -->
		<section class="section-form-group">
			<p class="attention-form">* Data Wajib Diisi</p>
			<div class="smil-row">
				<div
					class="form-group"
					:class="formStyle"
					v-for="(form, indexInput) in formGroupList"
					:key="`form-input-${indexInput}-${form.id}`"
				>
					<label class="form-label" :for="`input-${indexInput + 1}`">
						{{ form.label }}
						<span
							v-if="form.isRequired"
							style="color: #dc3545; font-size: 14px"
						>
							*
						</span>
					</label>
					<!-- START: INPUT TAG -->
					<input
						:type="form.type"
						v-if="formInputType(form.type) === 'input'"
						class="form-control"
						v-model="form.model"
						:placeholder="form.placeholder"
						:required="form.isRequired"
						:disabled="form.disabled"
						@keypress="formConstraint($event, form.type)"
						@change="changeValue(indexInput)"
					/>
					<!-- END: INPUT TAG -->

					<!-- START: Text Area -->
					<textarea
						class="form-control"
						v-if="form.type === 'text-area'"
						v-model="form.model"
						cols="30"
						rows="10"
						:placeholder="form.placeholder"
					></textarea>
					<!-- END: Text Area -->

					<!-- START: SELECT DATALIST -->
					<b-form-input
						v-if="form.type === 'select-datalist'"
						:list="`input-list-${indexInput}`"
						v-model="form.model"
						:placeholder="form.placeholder"
						@change="changeValue(indexInput)"
					></b-form-input>
					<b-form-datalist
						:id="`input-list-${indexInput}`"
						:options="form.options"
					></b-form-datalist>
					<!-- END: SELECT DATALIST -->

					<!-- START: SELECT -->
					<select
						v-model="form.model"
						class="custom-select"
						v-if="form.type === 'select'"
						@change="changeValue(indexInput)"
						:disabled="form.disabled"
					>
						<option :value="null" :disabled="form.isRequired">
							Pilih {{ form.label }}
						</option>
						<option
							:value="ops.value"
							v-for="(ops, idxOps) in form.options"
							:key="`options-${idxOps}`"
						>
							{{ ops.text }}
						</option>
					</select>
					<!-- START: SELECT -->

					<!-- Datepicker -->
					<date-picker
						v-if="form.type === 'date'"
						format="YYYY-MM-DD"
						value-type="format"
						v-model="form.model"
						:disabled="form.disabled"
						@closed="setNullString(form.model)"
						:placeholder="form.placeholder"
						@change="changeValue(indexInput)"
						:disabled-date="notBeforeToday"
					>
						<template slot="icon-clear">
							<b-icon-x-circle-fill></b-icon-x-circle-fill>
						</template>
						<template slot="icon-calendar">
							<b-icon icon="calendar-month-fill"></b-icon>
						</template>
					</date-picker>
					<!-- Datepicker -->
				</div>
			</div>
		</section>

		<!-- START: POPUP -->
		<b-modal
			ref="modal-popup"
			hide-footer
			hide-header
			centered
			no-close-on-backdrop
			no-close-on-esc
		>
			<base-modal-alert
				v-if="baseModalType === 'alert'"
				:isProcess="isProcess"
				:isSuccess="isSuccess"
				:message="message"
				:notes="notes"
				:closeAlert="closePopup"
			/>
		</b-modal>
		<!-- END: POPUP -->
	</div>
</template>

<script>
	// Components
	import BaseModalAlert from '@/components/BaseModal/BaseModalAlert'
	// Mixins
	import FormInputMixins from '@/mixins/FormInputMixins'
	import ModalMixins from '@/mixins/ModalMixins'
	import ErrorHandlerMixins from '@/mixins/ErrorHandlerMixins'

	// API
	import api from '@/api/admin_api'
	export default {
		name: 'add-staff-laboratorium',
		mixins: [FormInputMixins, ModalMixins, ErrorHandlerMixins],
		components: { BaseModalAlert },
		data() {
			return {
				formAddStaff: [
					{
						id: 2,
						label: 'Nama Pegawai',
						type: 'select',
						model: null,
						description: '',
						placeholder: 'Nama Pegawai',
						isRequired: true,
						disabled: false,
						options: [],
					},

					{
						id: 3,
						label: 'Email',
						type: 'email',
						model: '',
						description: '',
						placeholder: 'Email',
						isRequired: true,
						disabled: true,
					},
					{
						id: 4,
						label: 'Jabatan',
						type: 'select',
						model: null,
						description: '',
						placeholder: 'Jabatan',
						isRequired: true,
						disabled: false,
						options: [],
					},
					{
						id: 5,
						label: 'Waktu Mulai Jabatan',
						type: 'date',
						model: this.formatDate(new Date(), 'YYYY-MM-DD'),
						description: '',
						placeholder: 'Waktu Mulai Jabatan',
						isRequired: true,
						disabled: false,
					},
					{
						id: 6,
						label: 'Waktu Selesai Jabatan',
						type: 'date',
						model: null,
						description: '',
						placeholder: 'Waktu Selesai Jabatan',
						isRequired: false,
						disabled: false,
					},
				],
				formEditJabatan: [
					{
						id: 1,
						label: 'Nama Staff',
						type: 'text',
						model: null,
						description: '',
						placeholder: 'Nama Staff',
						isRequired: true,
						disabled: true,
					},
					{
						id: 2,
						label: 'Waktu Mulai Jabatan',
						type: 'date',
						model: null,
						description: '',
						placeholder: 'Waktu Mulai Jabatan',
						isRequired: true,
						disabled: false,
					},
					{
						id: 3,
						label: 'Waktu Selesai Jabatan',
						type: 'date',
						model: null,
						description: '',
						placeholder: 'Waktu Selesai Jabatan',
						isRequired: true,
						disabled: false,
					},
					{
						id: 4,
						label: 'Jabatan',
						type: 'select',
						model: null,
						description: '',
						placeholder: 'Jabatan',
						isRequired: true,
						disabled: false,
						options: [],
					},
				],
			}
		},
		computed: {
			// Form List
			formGroupList() {
				if (this.userId !== null) {
					return this.formEditJabatan
				} else {
					return this.formAddStaff
				}
			},
			formStyle() {
				if (this.userId !== null) {
					return 'mt-4 col-lg-6 offset-lg-3'
				} else {
					return 'col-lg-6 col-12'
				}
			},
			// Add New Staff Laboratorium
			formFilled() {
				if (this.userId !== null) {
					let form = this.submitEditJabatanRequest
					return (
						form.start_active_period !== null &&
						form.end_active_period !== null &&
						form.jabatan_id !== null
					)
				} else {
					let form = this.submitAddRequest

					return (
						form.nip !== '' &&
						form.jabatan_id !== null &&
						form.start_active_period !== null &&
						form.end_active_period !== null
					)
				}
			},
			submitAddRequest() {
				let form = this.formAddStaff

				// return {
				// 	nip: form[0].model,
				// 	staff_fullname: form[1].model,
				// 	email: form[2].model,
				// 	jabatan_id: form[3].model,
				// 	start_active_period: form[4].model,
				// 	end_active_period: form[5].model,
				// }

				return {
					id: form[0].model,
					email: form[1].model,
					start_active_period: form[3].model,
					end_active_period: form[4].model,
					jabatan_id: form[2].model,
				}
			},
			submitEditJabatanRequest() {
				let form = this.formEditJabatan
				return {
					start_active_period: form[1].model,
					end_active_period: form[2].model,
					jabatan_id: form[3].model,
				}
			},
			// Edit Jabatan Staff Laboratorium
			userId() {
				return this.$route.params.user_id ? this.$route.params.user_id : null
			},
		},

		async mounted() {
			this.loadingForm = true
			if (!this.isKaLab && !this.isSuperAdmin) {
				this.$router.go(-1)
			}
			await this.getListJabatanAdmin()
			if (this.userId !== null) {
				await this.getDataUser()
			} else {
				await this.getListStaffJurusan()
			}
			this.loadingForm = false
			// this.showAlert(false, false, 'Alert Berhasil')
		},
		watch: {},
		methods: {
			// Call API
			async getDataUser() {
				try {
					const response = await api.getPlainData('user', this.userId)

					if (response.data.response.code === 200) {
						let data = response.data.data
						let form = this.formEditJabatan
						form[0].model = data.staff_model.staff_fullname
						form[1].model = data.active_period
						form[2].model = data.expire_period
						form[3].model = data.jabatan_id
					}
				} catch (e) {
					let message = this.getErrorMessage(e)
					if (typeof message == 'object' && message.length > 0) {
						setTimeout(() => {
							this.showAlert(false, false, 'Terjadi Kesalahan', message)
						}, 500)
					} else {
						this.showAlert(false, false, message)
					}
				}
			},
			async getListStaffJurusan() {
				try {
					// const response = await api.getPlainData('staff')
					const response = await api.getUnregisterStaff()
					if (response.data.response.code === 200) {
						let listStaff = response.data.data
						if (listStaff.length === 0) {
							// this.showAlert(
							// 	false,
							// 	false,
							// 	'Tidak ada staff jurusan yang dapat didaftarkan'
							// )
							alert('Tidak ada staff jurusan yang dapat didaftarkan')
							this.isCreate = true
							this.$router.push({ name: 'ListStaffLaboratorium' })
						}
						let list = []
						listStaff.forEach((staff) => {
							let st = {
								text: `${staff.staff_user.staff_fullname}`,
								value: staff.id,
								email: staff.email,
							}

							list.push(st)
						})
						this.formAddStaff[0].options = list
					}
				} catch (e) {
					let message = this.getErrorMessage(e)
					if (typeof message == 'object' && message.length > 0) {
						setTimeout(() => {
							this.showAlert(false, false, 'Terjadi Kesalahan', message)
						}, 500)
					} else {
						this.showAlert(false, false, message)
					}
				}
			},
			async getListJabatanAdmin() {
				try {
					const response = await api.getJabatanStaffLab()
					if (response.data.response.code === 200) {
						let listJabatan = response.data.data
						let list = []
						listJabatan.forEach((jabatan) => {
							let jb = {
								id: jabatan.id,
								text: jabatan.jabatan_name,
								value: jabatan.id,
							}

							list.push(jb)
						})

						this.formAddStaff[2].options = list
						this.formEditJabatan[3].options = list
					}
				} catch (e) {
					let message = this.getErrorMessage(e)
					if (typeof message == 'object' && message.length > 0) {
						setTimeout(() => {
							this.showAlert(false, false, 'Terjadi Kesalahan', message)
						}, 500)
					} else {
						this.showAlert(false, false, message)
					}
				}
			},
			async sendAddRequest() {
				this.showAlert(true)
				this.isCreate = true
				try {
					const response = await api.createNewData(
						'user',
						this.submitAddRequest
					)
					if (response.data.response.code === 201) {
						this.showAlert(false, true, response.data.response.message)
						setTimeout(() => {
							this.$router.push({ name: 'ListStaffLaboratorium' })
						}, 2000)
					}
				} catch (e) {
					this.isCreate = false

					let message = this.getErrorMessage(e)
					if (typeof message == 'object' && message.length > 0) {
						setTimeout(() => {
							this.showAlert(false, false, 'Terjadi Kesalahan', message)
						}, 500)
					} else {
						this.showAlert(false, false, message)
					}
				}
			},
			async editJabatanStaff() {
				this.showAlert(true)
				this.isCreate = true
				try {
					const response = await api.editJabatanStaffLab(
						this.userId,
						this.submitEditJabatanRequest
					)
					if (response.data.response.code === 200) {
						this.showAlert(
							false,
							true,
							`Jabatan Staff ${this.formEditJabatan[0].model} berhasil diubah`
						)
						setTimeout(() => {
							this.$router.go(-1)
						}, 2000)
					}
				} catch (e) {
					this.isCreate = false

					let message = this.getErrorMessage(e)
					if (typeof message == 'object' && message.length > 0) {
						setTimeout(() => {
							this.showAlert(false, false, 'Terjadi Kesalahan', message)
						}, 500)
					} else {
						this.showAlert(false, false, message)
					}
				}
			},
			// Form Interactions
			changeValue(index) {
				if (this.userId == null) {
					let form = this.formAddStaff
					// Ketika pilih user
					if (index === 0 && form[index].model !== null) {
						let staff = form[0]['options'].find(
							(st) => st.value === form[0].model
						)

						// form[1].model = staff.staff_fullname
						// form[2].model = staff.email
						form[1].model = staff.email
					}
				}
			},
			setNullString(form) {
				form.model = ''
			},
			// Notif
			submitNotif() {
				let confirmSubmit = confirm(
					'Apakah anda yakin ingin menyimpan data ini?'
				)
				if (confirmSubmit) {
					if (this.userId !== null) {
						this.editJabatanStaff()
					} else {
						this.sendAddRequest()
					}
				}
			},
		},
		beforeRouteLeave(to, from, next) {
			if (!this.isCreate) {
				let message =
					this.userId !== null
						? `Apakah anda yakin ingin membatalkan perubahan jabatan staff ${this.formEditJabatan[0].model}?`
						: 'Apakah anda yakin ingin membatalkan tambah staff laboratorium?'
				let confirmCancel = confirm(message)
				if (confirmCancel) {
					next()
				}
			} else {
				next()
			}
		},
	}
</script>

<style lang="scss" scoped>
	.add-staff-laboratorium {
		.mx-datepicker {
			width: 100%;
		}
		.button-group {
			margin-bottom: 30px;
		}
	}
</style>
<style lang="scss">
	.add-staff-laboratorium {
		input.form-control,
		.custom-select {
			color: #000;
			background-color: #fff;
			border-color: #c5c5c5;
			border-radius: 5px;
			font-size: 12px;
			&:focus {
				box-shadow: 0 0 0 5px #c5c5c5;
			}
			&:disabled {
				background-color: #c5c5c5;
				border-color: #696969;
			}

			height: 50px;
		}
		.mx-input {
			height: 50px;
		}
	}
</style>
