<template>
	<div class="base-modal-register-alat">
		<h4 class="font-weight-bold">Daftar Alat Dipinjam</h4>
		<p>
			Arahkan kursor kolom input sesuai nama alat yang ingin didaftarkan
			barcodenya
		</p>
		<div class="form-content">
			<div
				class="form-group"
				v-for="(form, idxForm) in formRegister"
				:key="`form-register-${idxForm}`"
			>
				<label :for="`form-register-${idxForm}`">{{ form.alat_name }}</label>
				<input
					:id="`form-register-${idxForm}`"
					type="text"
					class="form-control"
					:class="form.isValid ? 'valid-input' : ''"
					v-model="form.model"
					@keydown="formConstraint($event, 'barcode-input')"
					@paste="formPasteConstraint($event, 'barcode-input')"
					@change="confirmAlat(idxForm)"
					:disabled="form.isValid"
					autocomplete="off"
				/>
				<p v-if="form.isValid" class="pt-2" style="font-size:12px">
					Alat Tersedia
					<i
						>(<a class="change" @click="changeBarcode(idxForm)">Klik Disini</a>
						untuk mengganti barcode alat)</i
					>
				</p>
			</div>
		</div>
		<div class="button-group">
			<button
				class="smil-btn smil-btn-small smil-bg-secondary"
				@click="closeModal"
			>
				Batal
			</button>
			<button
				class="smil-btn smil-btn-small smil-bg-primary ml-2"
				:disabled="!registerValid"
				@click="register"
			>
				Register
			</button>
		</div>
	</div>
</template>

<script>
	// Mixins
	import FormInputMixins from '@/mixins/FormInputMixins'
	import ErrorHandlerMixins from '@/mixins/ErrorHandlerMixins'
	// API
	import api from '@/api/admin_api'
	export default {
		name: 'base-modal-register-alat',
		props: {
			detailPeminjaman: Array,
			submitRegister: Function,
			closeModal: Function,
		},
		mixins: [FormInputMixins, ErrorHandlerMixins],
		data() {
			return {
				formRegister: [],
				barcodeRegister: [],
			}
		},
		computed: {
			registerValid() {
				if (this.formRegister.length > 0) {
					return this.formRegister.every((alat) => alat.isValid == true)
				} else {
					return false
				}
			},
		},
		mounted() {
			this.setFormRegister()
		},
		methods: {
			// Call API
			async confirmAlat(indexData) {
				let form = this.formRegister[indexData]
				if (this.barcodeRegister.includes(form.model)) {
					form.isValid = false
					form.model = ''
				} else {
					let payload = {
						barcode_alat: form.model,
						alat_id: form.alat_id,
					}
					try {
						const response = await api.confirmBarcodeAlat(payload)
						if (response.data.response.code === 200) {
							let data = response.data.data
							if (data.barcode_valid) {
								form.isValid = true
								this.barcodeRegister.push(form.model)
							} else {
								form.model = ''
								form.isValid = false
								alert(response.data.response.message)
							}
						}
					} catch (e) {
						let output = this.getErrorMessage(e, 'alert')
						form.model = ''
						form.isValid = false
						alert(output)
					}
				}
			},
			// Data Change
			setFormRegister() {
				this.detailPeminjaman.forEach((peminjaman) => {
					let detail = {
						alat_id: peminjaman.alat_id,
						model: '', //Untuk nyimpen barcode
						alat_name: peminjaman.alat_pinjam.alat_name,
						id: peminjaman.id,
						isValid: false,
					}
					this.formRegister.push(detail)
				})
			},
			changeBarcode(indexData) {
				let form = this.formRegister[indexData]
				let indexRegisterBarcde = this.barcodeRegister.findIndex(
					(barcode) => barcode == form.model
				)

				this.barcodeRegister.splice(indexRegisterBarcde, 1)
				form.isValid = false
				form.model = ''
			},
			register() {
				this.submitRegister(this.formRegister)
				// this.$emit('submitRegister', this.formRegister)
				this.closeModal()
			},
		},
	}
</script>

<style lang="scss" scoped>
	.base-modal-register-alat {
		.form-content {
			margin-top: 20px;
			a {
				&.change {
					&:hover {
						cursor: pointer;
						text-decoration: underline;
					}
				}
			}
		}
		.button-group {
			display: flex;
			justify-content: flex-end;
		}
	}
</style>
<style lang="scss">
	.base-modal-register-alat {
		.form-control {
			&.valid-input {
				border-color: #28a745;
			}
		}
	}
</style>
