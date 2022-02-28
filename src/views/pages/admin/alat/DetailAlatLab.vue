<template>
	<div class="detail-alat-lab">
		<div class="mt-4 icon-class text-center" v-if="refreshData">
			<b-spinner
				variant="secondary"
				style="width: 140px; height: 140px; margin-bottom: 20px"
			></b-spinner>
			<p class="empty-table-description">
				Sedang Memuat Data...
			</p>
		</div>
		<template v-else>
			<!-- START: HEADER -->
			<div class="header">
				<span
					class="smil-link mr-4"
					@click="$router.push({ name: 'ListAlatLaboratorium' })"
				>
					<b-icon icon="caret-left-fill" /> Back
				</span>
				<div class="header-title">
					<h1>{{ alatDetail.alat_name }}</h1>
					<p class="last-action">
						{{
							alatDetail.updated_at === alatDetail.created_at
								? `Ditambahkan pada ${formatDate(
										alatDetail.created_at,
										'DD MMMM YYYY'
								  )}`
								: `Diubah pada ${alatDetail.updated_at}`
						}}
					</p>
				</div>
				<div class="button-group">
					<button class="smil-btn smil-bg-danger" @click="deleteNotif('alat')">
						Hapus Data
					</button>
					<button
						class="smil-btn smil-bg-secondary"
						@click="
							$router.push({
								name: 'EditAlatLab',
								params: { alat_id: alatDetail.id },
							})
						"
					>
						Edit Data
					</button>
					<button
						v-if="alatDetail.images && alatDetail.images.length < 3"
						class="smil-btn smil-bg-primary"
						@click="
							$router.push({
								name: 'UploadFotoAlat',
								params: { alat_id: alatId },
								meta: { previousPage: 'DetailAlat' },
							})
						"
					>
						Upload Foto
					</button>
				</div>
			</div>
			<!-- END: HEADER -->

			<!-- START: CONTENT DETAIL -->
			<div class="content smil-row">
				<div class="col-lg-5 alat-info">
					<table class="table table-borderless">
						<tr>
							<th>Jenis Alat</th>
							<td>
								{{
									alatDetail.jenis_alat_model
										? alatDetail.jenis_alat_model.jenis_name
										: ''
								}}
							</td>
						</tr>
						<tr>
							<th>Asal Pengadaan</th>
							<td>
								{{
									alatDetail.asal_pengadaan_model
										? alatDetail.asal_pengadaan_model.asal_pengadaan_name
										: ''
								}}
							</td>
						</tr>
						<tr>
							<th>Tahun Pengadaan</th>
							<td>{{ alatDetail.alat_year }}</td>
						</tr>
						<tr>
							<th>Supplier Alat</th>
							<td>
								{{
									alatDetail.supplier_model && alatDetail.supplier_id !== null
										? alatDetail.supplier_model.supplier_name
										: '-'
								}}
							</td>
						</tr>
						<tr>
							<th>Jumlah Unit Alat Terdaftar</th>
							<td>
								{{
									`${alatDetail.alat_total} ${
										alatDetail.satuan_jumlah_model
											? alatDetail.satuan_jumlah_model.satuan_jumlah_name
											: ''
									}`
								}}
							</td>
						</tr>
						<tr>
							<th>Spesifikasi</th>
							<td>
								<button
									class="smil-btn smil-bg-info"
									@click="openPopup('detail')"
								>
									Lihat Spesifikasi
								</button>
							</td>
						</tr>
					</table>
				</div>
				<div class="col-lg-7 image-display">
					<h4>Foto Alat</h4>
					<template v-if="alatDetail.images">
						<div class="empty-image" v-if="alatDetail.images.length === 0">
							<p>Belum menggunggah foto untuk alat ini</p>
						</div>
						<b-row class="mt-4" v-else>
							<b-col
								lg="4"
								md="6"
								v-for="(img, idxImg) in alatDetail.images"
								:key="`gambar-alat-${idxImg}`"
							>
								<b-card overlay :img-src="img.image_data" class="mb-3">
									<b-icon
										class="icon-trash"
										icon="trash-fill"
										@click="deleteImageNotif(img.id)"
									/>
								</b-card>
							</b-col>
						</b-row>
					</template>
				</div>
			</div>
			<!-- END: CONTENT DETAIL -->

			<!-- START: TABEL DETAIL ALAT -->
			<div class="table-detail-content table-responsive-sm">
				<div class="table-title d-flex align-items-center">
					<h4>List Unit Alat Terdaftar</h4>
					<button
						class="smil-btn smil-bg-primary ml-auto"
						@click="openPopup('add')"
					>
						Tambah Unit
					</button>
				</div>
				<table class="table smil-table">
					<thead class="smil-thead">
						<tr>
							<th
								v-for="(head, indexHds) in headsTable"
								:key="`header-table-${head.id}-${indexHds}`"
							>
								{{ head.label }}
								<base-filter
									filter_class="d-none d-lg-block mt-2"
									@changeValue="changeFilterValue"
									@filterAction="getListDetailAlat"
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
								<p class="empty-table-description">
									Sedang Memuat Data...
								</p>
							</td>
						</tr>
						<template v-else>
							<tr v-if="listData.length === 0">
								<td
									:colspan="headsTable.length"
									class="text-center empty-table"
								>
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
									:key="`column-table-${indexContent}`"
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
											<b-dropdown-item @click="seeBarcode(indexRow)">
												Lihat QR Code Alat
											</b-dropdown-item>
											<b-dropdown-item
												@click="printBarcode(indexRow)"
												v-if="!isMobile"
											>
												Cetak QR Code Unit
											</b-dropdown-item>
											<b-dropdown-item @click="changeCondition(indexRow)">
												Ubah Kondisi Unit
											</b-dropdown-item>
											<b-dropdown-item @click="deleteNotif('detail', indexRow)">
												<span class="smil-text-danger">
													Hapus Unit
												</span>
											</b-dropdown-item>
										</b-dropdown>
									</template>
									<template v-else-if="indexContent == 1 || indexContent == 2">
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
			<!-- END: TABEL DETAIL ALAT -->

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
								style="cursor: pointer;"
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
						@change="getListDetailAlat"
					>
						<option
							:value="count"
							v-for="count in tableCount"
							:key="`page-size-${count}`"
							>{{ count }}</option
						>
					</select>
				</div>
			</div>
			<!-- END: PAGINATION INFO SECTION -->
		</template>

		<!-- START: MODAL POPUP -->
		<b-modal
			ref="modal-popup"
			hide-footer
			hide-header
			centered
			:no-close-on-backdrop="
				baseModalType !== 'barcode' && baseModalType !== 'qrcode'
			"
			:no-close-on-esc="
				baseModalType !== 'barcode' && baseModalType !== 'qrcode'
			"
		>
			<base-modal-add
				v-if="baseModalType === 'add' || baseModalType === 'condition'"
				:modalTitle="formList.title"
				:formList="formList.list"
				:submitFunction="submitAction"
				:closeFunction="closeAction"
				:formFilled="formListFilled"
				@reset="setPageAlatDetail"
			/>

			<base-modal-detail
				v-if="baseModalType === 'detail'"
				title="Informasi Spesifikasi Alat"
				:headsData="headSpecs"
				:valueData="valueSpecs"
				:closeModal="closePopup"
			/>

			<base-modal-alert
				v-if="baseModalType === 'alert'"
				:isProcess="isProcess"
				:isSuccess="isSuccess"
				:message="message"
				:closeAlert="closePopup"
			/>
			<base-modal-barcode
				v-if="baseModalType === 'barcode'"
				:barcodeValue="selectedRowData.barcode_alat"
				:displayText="selectedRowData.alat_model.alat_name"
			/>
			<base-modal-qrcode
				v-if="baseModalType === 'qrcode'"
				:qrcodeData="selectedRowData"
			/>
		</b-modal>
		<!-- END: MODAL POPUP -->

		<!-- Barcode -->
		<template v-if="getBarcode">
			<div class="printable-qrcode print" ref="printable-qrcode">
				<div class="banner">
					<img src="@/assets/images/Logo_PNJ.png" class="img-barcode" alt="" />
					<h4 class="text">
						Laboratorium <br />
						Teknik Informatika dan <br />
						Komputer <br />
						Politeknik Negeri Jakarta
					</h4>
				</div>
				<qrcode-vue
					:value="selectedRowData.path_url"
					:size="125"
					level="L"
					class="qrcode"
				/>
				<p class="qrcode-display">{{ selectedRowData.name }}</p>
			</div>
		</template>
		<!-- Barcode -->
	</div>
</template>

<script>
	// Components
	import IconComponent from '@/components/IconComponent.vue'
	import BaseFilter from '@/components/BaseFilter.vue'
	import BaseModalAdd from '@/components/BaseModal/BaseModalAdd.vue'
	import BaseModalAlert from '@/components/BaseModal/BaseModalAlert.vue'
	import BaseModalQrcode from '@/components/BaseModal/BaseModalQrcode.vue'
	import BaseModalDetail from '@/components/BaseModal/BaseModalDetail.vue'

	import QrcodeVue from 'qrcode.vue'
	// Mixins
	import FormInputMixins from '@/mixins/FormInputMixins'
	import TableMixins from '@/mixins/TableMixins'
	import ModalMixins from '@/mixins/ModalMixins'
	import ErrorHandlerMixins from '@/mixins/ErrorHandlerMixins'

	// API
	import api from '@/api/admin_api'

	// Import Library
	import html2canvas from 'html2canvas'
	import jsPDF from 'jspdf'

	export default {
		name: 'detail-alat-lab',
		components: {
			IconComponent,
			BaseFilter,
			BaseModalAdd,
			BaseModalAlert,
			BaseModalQrcode,
			BaseModalDetail,
			QrcodeVue,
		},
		mixins: [FormInputMixins, TableMixins, ModalMixins, ErrorHandlerMixins],
		data() {
			return {
				alatDetail: {},
				// Detail Alat Tabel
				headsTable: [
					{
						id: 1,
						label: 'QR Code Key Unit',
						filter_type: 'search',
						placeholder: 'Filter QR Code Key Unit',
						model: 'barcode_alat',
						options: null,
					},
					{
						id: 2,
						label: 'Kondisi Unit',
						filter_type: 'select',
						placeholder: 'Filter Kondisi Unit',
						model: 'condition_status',
						options: [
							{
								id: null,
								name: 'All',
								value: null,
								disabled: false,
							},
							{
								id: 1,
								name: 'Pending',
								value: 1,
								disabled: false,
							},
							{
								id: 2,
								name: 'Baik',
								value: 2,
								disabled: false,
							},
							{
								id: 3,
								name: 'Rusak',
								value: 3,
								disabled: false,
							},
							{
								id: 4,
								name: 'Habis',
								value: 4,
								disabled: false,
							},
							{
								id: 5,
								name: 'Diperbaiki',
								value: 5,
								disabled: false,
							},
							{
								id: 6,
								name: 'Apkir',
								value: 6,
								disabled: false,
							},
						],
					},
					{
						id: 3,
						label: 'Ketersediaan Unit',
						filter_type: 'select',
						model: 'available_status',
						options: [
							{
								id: null,
								name: 'All',
								value: null,
								disabled: false,
							},
							{
								id: 1,
								name: 'Pending',
								value: 1,
								disabled: false,
							},
							{
								id: 2,
								name: 'Tersedia',
								value: 2,
								disabled: false,
							},
							{
								id: 3,
								name: 'Tidak Tersedia',
								value: 3,
								disabled: false,
							},
						],
					},
					{
						id: 4,
						label: 'Lokasi Penyimpanan',
						filter_type: 'select',
						model: 'lokasi_id',
						options: [],
					},

					'',
				],
				filterData: {
					barcode_alat: '',
					condition_status: null,
					available_status: null,
					lokasi_id: null,
				},
				// Popup Interaction
				formAddDetailAlat: [
					{
						id: 1,
						label: 'Jumlah Alat',
						type: 'number',
						disabled: false,
						model: '',
						canAddValue: false,
					},

					{
						id: 2,
						label: 'Lokasi Penyimpanan',
						type: 'select',
						options: [],
						model: null,
						disabled: true,
						canAddValue: false,
					},
				],
				formChangeCondition: [
					{
						id: 1,
						label: 'Barcode Alat',
						type: 'text',
						disabled: true,
						model: '',
						canAddValue: false,
					},
					{
						id: 2,
						label: 'Kondisi Alat',
						type: 'select',
						options: [
							{
								id: null,
								name: 'Pilih Kondisi Alat Saat Ini',
								value: null,
								disabled: true,
							},
							{
								id: 1,
								name: 'Pending',
								value: 1,
								disable: false,
							},
							{
								id: 2,
								name: 'Baik',
								value: 2,
								disable: false,
							},
							{
								id: 3,
								name: 'Rusak',
								value: 3,
								disable: false,
							},
							{
								id: 4,
								name: 'Habis',
								value: 4,
								disable: false,
							},
							{
								id: 5,
								name: 'Diperbaiki',
								value: 5,
								disable: false,
							},
							{
								id: 6,
								name: 'Apkir',
								value: 6,
								disable: false,
							},
						],
						model: null,
						canAddValue: false,
					},
				],
				buttonActive: false,
				refreshData: false,
				// Cetak Barcode
				alreadyGetLokasi: false,
				getBarcode: false,
				barcodePrintable: {
					value: '',
					text: '',
				},
			}
		},
		async mounted() {
			await this.setPageAlatDetail()
		},
		watch: {
			'tableInfo.pageNo': {
				deep: true,
				handler: function() {
					if (!this.loadingTable) {
						this.getListDetailAlat()
					}
				},
			},
			formAddDetailAlat: {
				deep: true,
				handler: function() {
					let payload = this.submitDetailAlat
					if (payload.total_alat !== null) {
						if (!this.alreadyGetLokasi) {
							this.getLokasiBaseOnTotalAlat(payload.total_alat)
						} else {
							this.formAddDetailAlat[1].disabled = false
						}
					} else {
						this.alreadyGetLokasi = false
						this.formAddDetailAlat[1].disabled = true
					}
				},
			},
		},
		methods: {
			// API
			async getAlatDetail() {
				// Nembak API Get List Alat
				try {
					const response = await api.getPlainData('alat', this.alatId)
					this.alatDetail = response.data.data
					this.alatDetail.alat_specs =
						this.alatDetail.alat_specs !== ''
							? JSON.parse(this.alatDetail.alat_specs)
							: ''
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
			async getListDetailAlat() {
				this.loadingTable = true
				if (this.isFilterUse && this.tableInfo.pageNo > 1) {
					this.tableInfo.pageNo = 1
				}
				// Nembak API Get List Alat
				try {
					const response = await api.getFilterDetailAlat(
						this.alatId,
						this.tableInfo.pageNo,
						this.filterPayload
					)

					this.listData = response.data.result
					let page = response.data.page
					this.tableInfo.totalPage = page.total
					this.tableInfo.listTotal = page.data_total
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
				this.loadingTable = false
			},
			async getListLokasi() {
				try {
					const response = await api.getPlainData('lokasi')
					let lokasi = response.data.data
					let list = [
						{
							id: null,
							name: 'All',
							value: null,
							disabled: false,
						},
					]
					lokasi.forEach((lk) => {
						let data = {
							id: lk.id,
							name: lk.lokasi_name,
							value: lk.id,
						}
						list.push(data)
					})
					this.headsTable[3].options = list
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
			async getLokasiBaseOnTotalAlat(totalNeed) {
				// Panggil API Lokasi Alat

				try {
					const response = await api.getLokasiNeed(totalNeed)
					let lokasi = response.data.data
					let listAdd = [
						{
							id: null,
							name: 'Pilih Lokasi Penyimpanan',
							value: null,
							disabled: true,
						},
					]
					if (response.data.response.code == 200) {
						if (lokasi.length > 0) {
							lokasi.forEach((lok) => {
								let lk = {
									id: lok.id,
									name: lok.lokasi_name,
									value: lok.id,
									disabled: false,
								}

								listAdd.push(lk)
							})

							this.formAddDetailAlat[1].options = listAdd
						} else {
							alert(
								'Tidak ada lokasi yang dapat menampung jumlah alat tersebut'
							)
						}
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
				} finally {
					this.alreadyGetLokasi = true
				}
			},
			async deleteAlatDetail(alatId) {
				this.showAlert(true)
				try {
					const response = await api.deleteData('alat', alatId)
					if (response.data.response.code === 200) {
						this.showAlert(false, true, response.data.response.message)
						setTimeout(() => {
							this.$router.push({ name: 'ListAlatLaboratorium' })
						}, 2000)
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
			async deleteDetailAlat(detailAlatId) {
				this.showAlert(true)
				try {
					const response = await api.deleteData('detail-alat', detailAlatId)
					if (response.data.response.code === 200) {
						this.showAlert(false, true, response.data.response.message)
						this.setPageAlatDetail()
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
			async deleteImageAlat(imageId) {
				this.showAlert(true)
				try {
					const response = await api.deleteData('image-alat', imageId)
					if (response.data.response.code === 200) {
						this.showAlert(false, true, response.data.response.message)
						this.setPageAlatDetail()
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
			async createDetailAlat() {
				this.showAlert(true)
				try {
					const response = await api.createNewData(
						'detail-alat',
						this.submitDetailAlat
					)
					if (response.data.response.code === 201) {
						this.showAlert(false, true, response.data.response.message)
						this.setPageAlatDetail()
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
			async changeConditionDetailAlat() {
				this.showAlert(true)
				try {
					let payload = {
						condition_status: this.formChangeCondition[1].model,
					}
					const response = await api.changeStatusDetailAlat(
						'condition',
						this.selectedRowData.id,
						payload
					)
					if (response.data.response.code === 200) {
						this.showAlert(
							false,
							true,
							`Kondisi alat dengan barcode ${this.selectedRowData.barcode_alat} berhasil diubah`
						)
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
			async setPageAlatDetail() {
				this.refreshData = true
				await this.getAlatDetail()
				await this.getListDetailAlat()
				await this.getListLokasi()
				this.alreadyGetLokasi = false
				if (this.alatDetail.habis_pakai) {
					this.formChangeCondition[1].options[4].disabled = false
				} else {
					this.formChangeCondition[1].options[4].disabled = true
				}
				this.refreshData = false
			},
			// Value Change
			getKondisiAlat(conditionStatus) {
				let listKondisi = [
					{
						id: 1,
						text: 'Pending',
						background: 'smil-bg-pending',
					},
					{
						id: 2,
						text: 'Baik',
						background: 'smil-bg-success',
					},
					{
						id: 3,
						text: 'Rusak',
						background: 'smil-bg-danger',
					},
					{
						id: 4,
						text: 'Habis',
						background: 'smil-bg-warning',
					},
					{
						id: 5,
						text: 'Diperbaiki',
						background: 'smil-bg-info',
					},
					{
						id: 6,
						text: 'Apkir',
						background: 'smil-bg-danger',
					},
				]

				return listKondisi.find((kondisi) => kondisi.id === conditionStatus)
			},
			getKetersediaanAlat(availableStatus) {
				let listKetersediaan = [
					{
						id: 1,
						text: 'Pending',
						background: 'smil-bg-pending',
					},
					{
						id: 2,
						text: 'Tersedia',
						background: 'smil-bg-info',
					},
					{
						id: 3,
						text: 'Tidak Tersedia',
						background: 'smil-bg-danger',
					},
				]

				return listKetersediaan.find(
					(available) => available.id === availableStatus
				)
			},
			deleteImageNotif(imageId) {
				let message = 'Apakah anda yakin ingin menghapus gambar ini?'
				let confirmDelete = confirm(message)
				if (confirmDelete) {
					this.deleteImageAlat(imageId)
				}
			},
			deleteNotif(type, index = null) {
				let data = index !== null ? this.listData[index] : this.alatDetail
				let message = {
					alat: `Apakah anda yakin ingin menghapus alat ${data.alat_name} ? Seluruh data yang berhubungan dengan alat ini akan ikut terhapus`,
					detail: `Apakah anda yakin ingin menghapus alat dengan barcode ${data.barcode_alat}`,
				}
				let confirmDelete = confirm(message[type])
				if (confirmDelete) {
					if (type == 'alat') {
						this.deleteAlatDetail(data.id)
					} else {
						this.deleteDetailAlat(data.id)
					}
				}
			},
			changeCondition(indexData) {
				this.selectedRowData = this.listData[indexData]
				this.formChangeCondition[0].model = this.selectedRowData.barcode_alat
				this.openPopup('condition')
			},
			printBarcode(indexData) {
				let data = this.listData[indexData]
				this.selectedRowData.path_url = data.barcode_alat
				this.selectedRowData.name = `${data.barcode_alat} - ${data.alat_model.jenis_alat_model.jenis_name}`
				this.getBarcode = true

				this.$nextTick(() => {
					let element = this.$refs['printable-qrcode']
					this.getBarcode = false
					this.downloadBarcode(element)
				})
			},
			async downloadBarcode(element) {
				this.showAlert(true)
				const pdf = new jsPDF({
					orientation: 'p',
					unit: 'px',
					format: 'a4',
					hotfixes: ['px_scaling'],
					compress: false,
				})
				html2canvas(element, {
					useCORS: true,
					scrollX: 0,
					scrollY: -window.scrollY,
				}).then((canvas) => {
					this.showAlert(false, true, 'QR Code Alat Berhasil di Unduh')
					let imgData = canvas.toDataURL('image/png', 1.0)
					pdf.addImage(imgData, 'PNG', 0, 20, canvas.width, canvas.height)
					pdf.setProperties({
						title: `${this.selectedRowData.name}_${this.selectedRowData.path_url}`,
					})
					window.open(pdf.output('bloburl'))
				})
			},
			seeBarcode(indexData) {
				// this.selectedRowData = this.listData[indexData]
				let data = this.listData[indexData]
				this.selectedRowData = {
					path_url: data.barcode_alat,
					name: `${data.barcode_alat} - ${data.alat_model.jenis_alat_model.jenis_name}`,
					desc: '',
				}
				this.openPopup('qrcode')
			},
			capitalizeFirstLetter(string) {
				return string.charAt(0).toUpperCase() + string.slice(1)
			},
			// Modal
			submitAction() {
				if (this.baseModalType === 'add') {
					this.createDetailAlat()
				} else if (this.baseModalType === 'condition') {
					this.changeConditionDetailAlat()
				}
			},
			closeAction() {
				if (this.baseModalType === 'add') {
					this.alreadyGetLokasi = false
					this.formAddDetailAlat[1].options = []
				}
				this.closePopup()
			},
		},
		computed: {
			alatId() {
				return this.$route.params.alat_id
					? parseInt(this.$route.params.alat_id)
					: null
			},
			listTable() {
				let listTable = []
				if (this.listData.length > 0) {
					this.listData.forEach((list, indexList) => {
						let rowTable = [
							list.barcode_alat, //Barcode Alat
							this.getKondisiAlat(list.condition_status), //Kondisi
							this.getKetersediaanAlat(list.available_status), //Ketersediaan,
							list.lokasi_id !== null ? list.lokasi_model.lokasi_name : '-',
							indexList, //Index Data
						]

						listTable.push(rowTable)
					})
				}

				return listTable
			},
			filterPayload() {
				let tableInfo = this.tableInfo
				return {
					page_size: tableInfo.listSize,
					sort_by: 'id',
					sort_direction: 'ASC',
					...this.filterData,
				}
			},
			submitDetailAlat() {
				let form = this.formAddDetailAlat
				return {
					alat_id: this.alatId,
					total_alat: form[0].model !== '' ? parseInt(form[0].model) : null,
					lokasi_id: form[1].model,
				}
			},
			formList() {
				if (this.baseModalType === 'add') {
					return {
						title: 'Tambah Alat Baru',
						list: this.formAddDetailAlat,
					}
				} else if (this.baseModalType === 'condition') {
					return {
						title: 'Ubah Kondisi Alat',
						list: this.formChangeCondition,
					}
				} else {
					return []
				}
			},
			formListFilled() {
				if (this.baseModalType === 'add') {
					let payload = this.submitDetailAlat
					if (payload.total_alat !== null && payload.lokasi_id !== null) {
						return true
					} else {
						return false
					}
				} else if (this.baseModalType === 'condition') {
					return this.formChangeCondition[1].model !== null
				}
			},
			headSpecs() {
				let specs = this.alatDetail.alat_specs
				let heads = []
				if (specs !== null) {
					Object.keys(specs).forEach((key) => {
						let setLabel = key.replace('_', ' ').split(' ')
						setLabel.forEach((label, index) => {
							setLabel[index] = this.capitalizeFirstLetter(label)
						})

						let head = {
							label: setLabel.join(' '),
							key: key,
						}
						heads.push(head)
					})
				}
				return heads
			},
			valueSpecs() {
				let specs = this.alatDetail.alat_specs
				let value = {}
				if (specs !== null) {
					Object.keys(specs).forEach((key) => {
						value[key] = specs[key].value
					})
				}
				return value
			},
		},
	}
</script>

<style lang="scss" scoped>
	.detail-alat-lab {
		// height: 100vh;
		.header {
			display: flex;
			align-items: center;
			.header-title {
				h1 {
					font-size: 24px;
					font-weight: 700;
				}
				.last-action {
					font-size: 14px;
					color: #c5c5c5;
				}
			}
			.button-group {
				margin-left: auto;
				display: flex;
				flex-flow: row;
				button {
					margin-left: 12px;
				}
			}
		}

		.content {
			margin-top: 40px;
			.image-display {
				h4 {
					font-weight: 700;
					font-size: 16px;
					margin-bottom: 0;
				}
				.empty-image {
					font-size: 16px;
					color: #c5c5c5;
					margin-top: 15px;
				}
			}
			.alat-info {
				th,
				td {
					font-size: 16px;
				}
			}
		}

		.table-detail-content {
			margin-top: 60px;
			.table-title {
				margin-bottom: 40px;
			}
			h4 {
				font-size: 16px;
				font-weight: 700;
			}
		}
	}
	@media screen and (max-width: 992px) {
		.detail-alat-lab {
			.header {
				align-items: flex-start;
				flex-direction: column;
				.button-group {
					margin-left: 0;
					button {
						margin-left: 0;
						margin-right: 12px;
					}
				}
			}
		}
	}
</style>

<style lang="scss">
	@import '@/assets/css/barcode.scss';
	.detail-alat-lab {
		.col-lg-12,
		.col-lg-5,
		.col-lg-7 {
			padding-left: 0;
		}

		.alat-info {
			.table {
				th,
				td {
					padding-left: 0;
					padding-top: 15px;
					padding-bottom: 15px;
				}

				tr {
					&:first-child {
						th,
						td {
							padding-top: 0;
						}
					}
				}
			}
		}
		.card {
			.card-body {
				opacity: 0;
				display: flex;
				text-align: center;
				flex-direction: column;
				transition: all 0.3s ease-in;
				.icon-trash {
					align-items: center;
					margin: auto;
					width: 64px;
					height: 64px;
					color: #fff;
					&:hover {
						cursor: pointer;
						color: #dc3545;
					}
				}

				&:hover {
					opacity: 1;
					background: rgba(0, 0, 0, 0.6);

					.card-title {
						color: #fff;
					}
				}
			}
		}
	}
</style>
