<template>
	<div class="login-admin">
		<section class="login-form-section">
			<div class="banner-jurusan">
				<img src="@/assets/images/Logo_PNJ.png" alt="" srcset="" />
				<p class="banner-title">
					Laboratorium Jurusan Teknik Informatika dan Komputer
				</p>
			</div>
			<h4>Silahkan Login untuk Memulai Sesi Anda</h4>
			<div class="form-section">
				<div
					class="form-group"
					v-for="(form, indexInput) in formGroupList"
					:key="`form-input-${indexInput}-${form.id}`"
				>
					<label :for="`input-${indexInput + 1}`">
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
						class="form-control"
						v-model="formInput[form.model]"
						:placeholder="form.placeholder"
						:required="form.isRequired"
						@keypress.enter="loginAdmin"
					/>
					<!-- END: INPUT TAG -->
				</div>
				<div class="button-group" v-if="btnGroup">
					<button
						class="smil-btn smil-bg-primary"
						:disabled="!formFilled"
						@click="loginAdmin"
					>
						Masuk
					</button>
				</div>
			</div>
		</section>

		<b-modal
			ref="modal-popup"
			no-close-on-backdrop
			no-close-on-esc
			hide-header
			hide-footer
			centered
		>
			<base-modal-alert
				v-if="baseModalType === 'alert'"
				:isProcess="isProcess"
				:isSuccess="isSuccess"
				:message="message"
				:closeAlert="closePopup"
			/>
		</b-modal>
	</div>
</template>

<script>
	// API
	import api from '@/api/admin_api'
	import CryptoJs from 'crypto-js'
	// Componenets
	import BaseModalAlert from '@/components/BaseModal/BaseModalAlert'

	// Mixins
	import ModalMixins from '@/mixins/ModalMixins'
	import ErrorHandlerMixins from '@/mixins/ErrorHandlerMixins'

	// Vuex
	import * as types from '@/store/types'
	export default {
		name: 'login-admin',
		components: { BaseModalAlert },
		mixins: [ModalMixins, ErrorHandlerMixins],
		data() {
			return {
				formGroupList: [
					{
						id: 1,
						label: 'Nomor Induk Pegawai',
						type: 'text',
						model: 'nip',
						description: '',
						placeholder: 'Nomor Induk Pegawai',
						isRequired: true,
					},
					{
						id: 2,
						label: 'Password',
						type: 'password',
						model: 'password',
						description: '',
						placeholder: 'Password',
						isRequired: true,
					},
				],
				btnGroup: [
					{
						id: 1,
						text: 'Submit',
						type: 'submit',
						class: 'smil-bg-primary',
						size: '',
					},
				],
				formInput: {
					nip: '',
					password: '',
				},
				buttonActive: false,
			}
		},
		mounted() {
			// this.showAlert(false, false, 'Alert Berhasil')
		},
		watch: {},
		computed: {
			formFilled() {
				return this.formInput.nip !== '' && this.formInput.password !== ''
			},
		},
		methods: {
			async loginAdmin() {
				if (!this.formFilled) {
					return false
				}
				// Request Login via API
				this.showAlert(true)
				try {
					const response = await api.loginAdmin(this.formInput)

					// Get Data Admin via API
					let admin = response.data
					if (admin.response.code === 200 && admin.data !== null) {
						let adminData = {
							id: admin.data.id,
							staff_model: admin.data.staff_model,
							mahasiswa_model: admin.data.mahasiswa_model,
							nomor_induk: admin.data.is_mahasiswa
								? admin.data.mahasiswa_model.nim
								: admin.data.staff_model.nip,
							jabatan_id: admin.data.jabatan_model.id,
							jabatan_model: admin.data.jabatan_model,
							active_period: admin.data.user_active_period,
							expire_period: admin.data.user_expire_period,
							first_login: admin.data.first_login,
							is_mahasiswa: admin.data.is_mahasiswa,
							// image_data: admin.data.image_data,
						}

						if (adminData.first_login) {
							admin.skipChangePassword = false
						} else {
							admin.skipChangePassword = true
						}

						// // Save User Data and Token into Local Storage or Cookies
						let cipherData = CryptoJs.AES.encrypt(
							JSON.stringify(adminData),
							process.env.VUE_APP_KEY
						).toString()
						let e64 = CryptoJs.enc.Base64.parse(cipherData)
						let eHex = e64.toString(CryptoJs.enc.Hex)
						$cookies.set('smilAdminAuth', eHex, '12h')
						$cookies.set('smilAccessToken', admin.data.access_token, '12h')

						// Save data admin into Vuex
						this.showAlert(false, true, admin.response.message)

						setTimeout(() => {
							this.$router.go({ name: 'DashboardAdmin' })
						}, 1500)
					} else {
						this.showAlert(false, false, admin.response.message)
					}
				} catch (e) {
					let errorMessage = this.getErrorMessage(e, 'modal')
					this.showAlert(false, false, errorMessage)
					this.resetLoginAdmin()
				}
			},
			resetLoginAdmin() {
				// this.formInput.nip = ''
				this.formInput.password = ''
			},
		},
	}
</script>

<style lang="scss" scoped>
	.login-admin {
		display: flex;
		height: 100vh;
		// background-color: #c5c5c5;
		font-family: Arial, Helvetica, sans-serif;
		.login-form-section {
			width: 550px;
			margin: auto;
			display: flex;
			align-items: center;
			flex-flow: column;
			.banner-jurusan {
				width: 450px;
				display: flex;
				align-items: center;
				margin-bottom: 28px;
				img {
					width: 110px;
					height: 110px;
				}
				.banner-title {
					font-size: 18px;
					font-weight: bolder;
					text-transform: uppercase;
					font-style: italic;
					margin-bottom: 0;
					margin-left: 10px;
				}
			}

			.form-section {
				margin-top: 30px;
				width: 360px;
				.button-group {
					display: flex;
					button {
						width: 100%;
					}
				}
			}
		}
	}
	@media screen and (max-width: 992px) {
		.login-admin {
			overflow-x: hidden;
			align-items: center;
			.login-form-section {
				.banner-jurusan {
					width: 350px;

					.banner-title {
						font-size: 14px;
					}
					img {
						width: 70px;
						height: 70px;
					}
				}
				h4 {
					font-size: 18px;
				}
			}
		}
	}
</style>

<style lang="scss">
	.login-admin {
		@import '@/assets/css/global.scss';
	}
</style>
