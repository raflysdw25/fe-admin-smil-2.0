<template>
	<div class="list-staff-laboratorium">
		<!-- START: BUTTON GROUP -->
		<div class="button-group d-flex">
			<button
				class="smil-btn smil-bg-primary"
				@click="$router.push({ name: 'TambahStaffLaboratorium' })"
			>
				Tambah Data
			</button>
			<button
				class="smil-btn smil-bg-info d-lg-none d-sm-block"
				@click="openPopup('filter-data')"
			>
				Filter Data
			</button>
			<button
				class="smil-btn smil-bg-secondary ml-auto"
				@click="openPopup('jabatan')"
			>
				Struktural Lab
			</button>
		</div>
		<!-- END: BUTTON GROUP -->

		<!-- START: LIST DATA -->
		<div class="table-responsive-sm">
			<table class="table smil-table">
				<thead class="smil-thead">
					<tr>
						<th
							v-for="(head, indexHds) in headsTable"
							:key="`header-table-${indexHds}`"
						>
							{{ head.label }}
							<base-filter
								filter_class="d-none d-lg-block"
								@changeValue="changeFilterValue"
								@filterAction="getListStaffLab"
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
											Detail Staff Laboratorium
										</b-dropdown-item>
										<b-dropdown-item
											@click="
												$router.push({
													name: 'EditJabatanStaffLaboratorium',
													params: { user_id: listData[indexRow].id },
												})
											"
										>
											Edit Data Jabatan
										</b-dropdown-item>
										<b-dropdown-item @click="deleteNotif(indexRow)">
											<span class="smil-text-danger">
												Hapus Data Staff
											</span>
										</b-dropdown-item>
									</b-dropdown>
								</template>
								<template v-else-if="indexContent === rows.length - 2">
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
		<!-- END: LIST DATA -->

		<!-- START: PAGINATION INFO SECTION -->
		<div class="pagination-section">
			<div class="table-counter">
				{{ `${listData.length} dari ${listData.length} Data` }}
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
					@change="getListStaffLab"
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
			:size="baseModalType === 'jabatan' ? 'lg' : ''"
		>
			<base-modal-list-support
				v-if="baseModalType === 'jabatan'"
				title="Struktural Laboratorium"
				supportType="jabatan"
				:closeModal="closePopup"
			/>

			<base-modal-alert
				v-if="baseModalType === 'alert'"
				:isProcess="isProcess"
				:isSuccess="isSuccess"
				:message="message"
				:closeAlert="closePopup"
			/>

			<form-filter-data
				v-if="baseModalType === 'filter-data'"
				title="Filter Data Staff Laboratorium"
				:closeModal="closePopup"
				:formInput="filterData"
				:form="formFilter"
				@submitFilter="getListStaffLab"
				:activeButton="filterActive"
			/>

			<base-modal-detail
				v-if="baseModalType === 'detail'"
				title="Detail Staff Laboratorium"
				:headsData="headsDetail"
				:valueData="detailData"
				:closeModal="closePopup"
			/>
		</b-modal>
		<!-- END: MODAL POPUP -->
	</div>
</template>

<script>
	// Components
	import IconComponent from '@/components/IconComponent.vue'
	import FormFilterData from '@/components/FormFilterData.vue'
	import BaseFilter from '@/components/BaseFilter.vue'
	import BaseModalAdd from '@/components/BaseModal/BaseModalAdd.vue'
	import BaseModalListSupport from '@/components/BaseModal/BaseModalListSupport.vue'
	import BaseModalAlert from '@/components/BaseModal/BaseModalAlert.vue'
	import BaseModalDetail from '@/components/BaseModal/BaseModalDetail.vue'

	// Mixins
	import ModalMixins from '@/mixins/ModalMixins'
	import FormInputMixins from '@/mixins/FormInputMixins'
	import TableMixins from '@/mixins/TableMixins'
	import ErroHandlerMixins from '@/mixins/ErrorHandlerMixins'

	// API
	import api from '@/api/admin_api'
	export default {
		name: 'list-staff-laboratorium',
		mixins: [ModalMixins, FormInputMixins, TableMixins, ErroHandlerMixins],
		components: {
			IconComponent,
			FormFilterData,
			BaseFilter,
			BaseModalAdd,
			BaseModalListSupport,
			BaseModalAlert,
			BaseModalDetail,
		},
		data() {
			return {
				headsTable: [
					{
						label: 'Nomor Induk Pegawai',
						filter_type: 'search',
						placeholder: 'Filter Nomor Induk Pegawai',
						model: 'nip',
						options: null,
					},
					{
						label: 'Jabatan Staff',
						filter_type: 'select',
						placeholder: 'Filter Jabatan Staff',
						model: 'jabatan_id',
						options: [],
					},
					{
						label: 'Hak Akses Admin',
						filter_type: 'select',
						placeholder: 'Filter Hak Akses Admin',
						model: 'hak_akses',
						options: [
							{
								name: 'All',
								value: null,
							},
							{
								name: 'Punya Akses',
								value: 1,
							},
							{
								name: 'Kadaluarsa',
								value: 2,
							},
							{
								name: 'Belum Ubah Password',
								value: 3,
							},
							{
								name: 'Belum Verifikasi Email',
								value: 4,
							},
						],
					},
					'',
				],
				headsDetail: [
					{
						label: 'Nama Staff',
						key: 'staff_fullname',
					},
					{
						label: 'Jabatan',
						key: 'jabatan_name',
					},
					{
						label: 'Waktu Mulai Jabatan',
						key: 'active_period',
					},
					{
						label: 'Waktu Akhir Jabatan',
						key: 'expire_period',
					},
				],
				filterData: {
					nip: '',
					jabatan_id: null,
					hak_akses: null,
				},
				formFilter: [
					{
						label: 'Nomor Induk Pegawai',
						type: 'text',
						model: 'nip',
						description: '',
						placeholder: 'Filter Nomor Induk Pegawai',
						isRequired: false,
					},
					{
						label: 'Jabatan Staff',
						type: 'select',
						model: 'jabatan_id',
						description: '',
						placeholder: 'Pilih Jabatan Staff',
						isRequired: false,
						options: [
							{
								id: null,
								name: 'All',
								value: null,
								disabled: false,
							},
						],
					},
					{
						label: 'Hak Akses Admin',
						type: 'select',
						model: 'hak_akses',
						description: '',
						placeholder: 'Filter Hak Akses Admin',
						isRequired: false,
						options: [
							{
								name: 'All',
								value: null,
							},
							{
								name: 'Punya Akses',
								value: 1,
							},
							{
								name: 'Kadaluarsa',
								value: 2,
							},
							{
								name: 'Belum Ubah Password',
								value: 3,
							},
							{
								name: 'Belum Verifikasi Email',
								value: 4,
							},
						],
					},
				],
				buttonActive: false,
			}
		},
		computed: {
			listTable() {
				let listTable = []
				if (this.listData.length > 0) {
					this.listData.forEach((list, indexList) => {
						let rowTable = [
							`${list.nip} - ${list.staff_model.staff_fullname}`, //Nip Peminjam Alat
							list.jabatan_model.jabatan_name, //kapasitas
							this.statusAkunStaff(list), //jenis
							'',
						]

						listTable.push(rowTable)
					})
				}

				return listTable
			},
			filterActive() {
				let filter = this.filterPayload
				return (
					filter.nip !== '' ||
					filter.jabatan_id !== null ||
					filter.hak_akses !== null
				)
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
			detailData() {
				let data = this.selectedRowData
				if (data !== null) {
					return {
						staff_fullname: data.staff_model.staff_fullname,
						jabatan_name: data.jabatan_model.jabatan_name,
						active_period: this.formatDate(data.active_period, 'DD MMMM YYYY'),
						expire_period: this.formatDate(data.expire_period, 'DD MMMM YYYY'),
					}
				} else {
					return {}
				}
			},
		},
		watch: {
			'tableInfo.pageNo': {
				deep: true,
				handler: function() {
					if (!this.loadingTable) this.getListStaffLab()
				},
			},
		},
		async mounted() {
			if (!this.isKaLab && !this.isSuperAdmin) {
				this.$router.go(-1)
			}
			await this.getListStaffLab()
			await this.getListJabatan()
			// this.showAlert(false, false, 'Alert Berhasil')
		},
		methods: {
			// Call API
			async getListStaffLab() {
				this.loadingTable = true
				if (this.isFilterUse && this.tableInfo.pageNo > 1) {
					this.tableInfo.pageNo = 1
				}
				// Nembak API Get List Alat
				try {
					const response = await api.getFilterData(
						'user',
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
				} finally {
					this.loadingTable = false
				}
			},
			async getListJabatan() {
				// Hit API List Jabatan from Jabatan Table
				let jabatanStaff = [
					{
						id: null,
						name: 'All',
						value: null,
						disabled: false,
					},
				]
				try {
					const response = await api.getPlainData('jabatan')
					let listJabatan = response.data.data
					listJabatan.forEach((jabatan) => {
						let jb = {
							id: jabatan.id,
							name: jabatan.jabatan_name,
							value: jabatan.id,
						}
						jabatanStaff.push(jb)
					})
					this.headsTable[1].options = jabatanStaff
					this.formFilter[1].options = jabatanStaff
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
			async deleteStaffLab(userId) {
				this.showAlert(true)
				try {
					const response = await api.deleteData('user', userId)
					if (response.data.response.code == 200) {
						this.showAlert(false, true, response.data.response.message)
						this.getListStaffLab()
					} else {
						this.showAlert(false, false, response.data.response.message)
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
			// Value Change
			statusAkunStaff(staffObject) {
				// list.expire_period, list.first_login
				let { expire_period, first_login, is_verified } = staffObject
				// Menentukan status dari akun berdasarkan active_period akun
				let currentDate = this.formatDate(new Date(), 'YYYY-MM-DD')
				let rangeDate = this.dateRange(
					currentDate,
					this.formatDate(expire_period, 'YYYY-MM-DD')
				)

				let status_id = null
				if (rangeDate > 0) {
					// status_id = first_login ? 3 : !is_verified ? 4 : 1
					if (!is_verified) {
						status_id = 4
					} else if (first_login) {
						status_id = 3
					} else {
						status_id = 1
					}
				} else {
					status_id = 2
				}

				let listStatus = [
					{
						id: 1,
						text: 'Punya Akses',
						background: 'smil-bg-success',
					},
					{
						id: 2,
						text: 'Kadaluarsa',
						background: 'smil-bg-danger',
					},
					{
						id: 3,
						text: 'Belum Ubah Password',
						background: 'smil-bg-pending',
					},
					{
						id: 4,
						text: 'Belum Verifikasi Email',
						background: 'smil-bg-warning',
					},
				]

				return listStatus.find((status) => status.id === status_id)
			},

			// Action Dropdown
			lihatDetail(indexData) {
				this.selectedRowData = this.listData[indexData]
				this.openPopup('detail')
			},
			deleteNotif(index) {
				let staff_lab = this.listData[index]
				let confirm = window.confirm(
					`Apakah anda yakin ingin menghapus Staff Laboratorium ${staff_lab.staff_model.staff_fullname}`
				)
				if (confirm) {
					this.deleteStaffLab(staff_lab.id)
				}
			},
		},
	}
</script>

<style lang="scss" scoped>
	.button-group {
		margin-bottom: 40px;
		button {
			margin-right: 15px;
		}
	}
</style>
