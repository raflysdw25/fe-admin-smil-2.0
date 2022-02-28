<template>
	<div class="list-jenis-alat-lab">
		<!-- START: BUTTON GROUP -->
		<div class="button-group d-flex">
			<button class="smil-btn smil-bg-primary" @click="openPopup('add')">
				Tambah Data
			</button>
			<button
				class="smil-btn smil-bg-info d-lg-none d-sm-block"
				@click="openPopup('filter-data')"
			>
				Filter Data
			</button>
		</div>
		<!-- END: BUTTON GROUP -->

		<!-- START: LIST DATA -->
		<div class="table-responsive-sm">
			<table class="table smil-table">
				<!-- START: HEAD -->
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
								@filterAction="getListJenisAlat"
								:filter_type="head.filter_type"
								:default_value="filterData[head.model]"
								:placeholder="head.placeholder"
								:options="head.options"
								:modelFilter="head.model"
							/>
						</th>
					</tr>
				</thead>
				<!-- END: HEAD -->

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
						<!-- START: EMPTY TABLE -->
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
						<!-- END: EMPTY TABLE -->

						<!-- START: FILLED TABLE -->
						<tr
							v-else
							v-for="(rows, indexRow) in listTable"
							:key="`content-table-${indexRow}`"
						>
							<td
								v-for="(content, indexContent) in rows"
								:key="`column-${content}${indexContent}`"
								:width="indexContent === rows.length - 1 ? 10 : null"
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
										<b-dropdown-item @click="editRowData(indexRow)">
											Edit Jenis Alat
										</b-dropdown-item>
										<b-dropdown-item>
											<span
												class="smil-text-danger"
												@click="deleteNotif(indexRow)"
											>
												Hapus Jenis Alat
											</span>
										</b-dropdown-item>
									</b-dropdown>
								</template>
								<template v-else>
									{{ content }}
								</template>
							</td>
						</tr>
					</template>
					<!-- END: FILLED TABLE -->
				</tbody>
			</table>
		</div>
		<!-- END: LIST DATA -->

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
					@change="getListJenisAlat"
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

		<!-- START: MODAL POPUP -->
		<b-modal
			ref="modal-popup"
			hide-footer
			hide-header
			centered
			no-close-on-backdrop
			no-close-on-esc
		>
			<base-modal-add
				v-if="baseModalType === 'add' || baseModalType === 'edit'"
				:modalTitle="
					`${baseModalType === 'edit' ? 'Edit' : 'Tambah'} Jenis Alat`
				"
				:formList="formAdd"
				:formFilled="buttonActive"
				:submitFunction="sendAddJenisAlat"
				:closeFunction="closePopup"
				:editFunction="editJenisAlat"
				:isEdit="isEditRow"
				@reset="isEditRow = false"
			/>
			<base-modal-alert
				v-if="baseModalType === 'alert'"
				:isProcess="isProcess"
				:isSuccess="isSuccess"
				:message="message"
				:notes="notes"
				:closeAlert="closePopup"
			/>

			<form-filter-data
				v-if="baseModalType === 'filter-data'"
				title="Filter Data Jenis Alat"
				:closeModal="closePopup"
				:form="formFilter"
				:formInput="filterData"
				:submitFunction="getListJenisAlat"
				:activeButton="activeFilter"
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
	import BaseModalAlert from '@/components/BaseModal/BaseModalAlert.vue'

	// Mixins
	import ModalMixins from '@/mixins/ModalMixins'
	import TableMixins from '@/mixins/TableMixins'
	import ErrorHandlerMixins from '@/mixins/ErrorHandlerMixins'

	// API
	import api from '@/api/admin_api'

	export default {
		name: 'list-jenis-alat-lab',
		components: {
			IconComponent,
			FormFilterData,
			BaseFilter,
			BaseModalAdd,
			BaseModalAlert,
		},
		mixins: [ModalMixins, TableMixins, ErrorHandlerMixins],
		data() {
			return {
				headsTable: [
					{
						label: 'Nama Jenis Alat',
						filter_type: 'search',
						placeholder: 'Filter Nama Jenis Alat',
						model: 'jenis_name',
						options: null,
					},
					{
						label: 'Attribut Spesifikasi',
						filter_type: 'search',
						placeholder: 'Filter Attribut Spesifikasi',
						model: 'spec_attributes',
						options: null,
					},
					'',
				],
				filterData: {
					jenis_name: '',
					spec_attributes: '',
				},
				formFilter: [
					{
						label: 'Nama Jenis Alat',
						type: 'text',
						model: 'jenis_name',
						description: '',
						placeholder: 'Filter Nama Jenis Alat',
						isRequired: false,
					},
					{
						label: 'Attribut Spesifikasi',
						type: 'text',
						model: 'spec_attributes',
						description: '',
						placeholder: 'Filter Attribut Spesifikasi',
						isRequired: false,
					},
				],
				baseModalType: '',
				// Data Add Jenis Alat
				formAdd: [
					{
						id: 1,
						label: 'Nama Jenis Alat',
						type: 'text',
						disabled: false,
						model: '',
						canAddValue: false,
						isRequired: true,
					},
					{
						id: 2,
						label: 'Attribut Spesifikasi Alat',
						type: 'text',
						model: [{ id: 1, value: '', disabled: false }],
						canAddValue: true,
						isRequired: false,
					},
				],
				buttonActive: false,
			}
		},
		watch: {
			formAdd: {
				deep: true,
				handler: function() {
					this.buttonActive =
						this.formAdd[0].model !== '' &&
						this.formAdd[1].model.every((attr) => attr.value !== '')

					if (this.formAdd[1].model.length === 0) {
						this.formAdd[1].model = [{ id: 1, value: '', disabled: false }]
					}
				},
			},
			'tableInfo.pageNo': {
				deep: true,
				handler: function() {
					if (!this.loadingTable) {
						this.getListJenisAlat()
					}
				},
			},
		},
		computed: {
			listTable() {
				let listTable = []
				this.listData.forEach((list, indexList) => {
					let rowTable = [
						list.jenis_name, //Nama Jenis Alat
						list.spec_attributes === '' ? '-' : list.spec_attributes, // Attribute Spesifikasi
						indexList,
					]

					listTable.push(rowTable)
				})

				return listTable
			},
			activeFilter() {
				return (
					this.filterPayload.jenis_name !== '' ||
					this.filterPayload.spec_attributes !== ''
				)
			},
			filterPayload() {
				let tableInfo = this.tableInfo
				let filterData = this.filterData
				return {
					page_size: tableInfo.listSize,
					sort_by: 'id',
					sort_direction: 'ASC',
					jenis_name: filterData.jenis_name,
					spec_attributes: filterData.spec_attributes,
				}
			},
			submitRequest() {
				// Untuk Tambah Data baru
				let spec_attr = ''
				this.formAdd[1].model.forEach((attr, idxAttr) => {
					if (attr.value !== '') {
						if (idxAttr !== this.formAdd[1].model.length - 1) {
							spec_attr += `${attr.value}, `
						} else {
							spec_attr += `${attr.value}`
						}
					}
				})
				return {
					jenis_name: this.formAdd[0].model,
					spec_attributes: spec_attr,
				}
			},
		},
		async mounted() {
			if (this.isSuperAdmin) {
				this.$router.go(-1)
			}
			await this.getListJenisAlat()
		},
		methods: {
			// Call API
			async getListJenisAlat() {
				this.loadingTable = true
				if (this.isFilterUse && this.tableInfo.pageNo > 1) {
					this.tableInfo.pageNo = 1
				}
				// Nembak API Get List Alat
				try {
					const response = await api.getFilterData(
						'jenis',
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
			async sendAddJenisAlat() {
				this.showAlert(true)
				try {
					const response = await api.createNewData('jenis', this.submitRequest)
					if (response.data.response.code === 201) {
						setTimeout(() => {
							this.showAlert(false, true, 'Tambah Jenis Alat Berhasil')
						}, 500)
						setTimeout(() => {
							this.getListJenisAlat()
						}, 2000)
					}
				} catch (e) {
					let message = this.getErrorMessage(e)

					if (typeof message === 'object' && message.length > 0) {
						setTimeout(() => {
							this.showAlert(false, false, 'Terjadi Kesalahan', message)
						}, 500)
					} else {
						this.showAlert(false, false, message)
					}
				}
			},
			async deleteJenisAlat(id) {
				this.showAlert(true)
				try {
					const response = await api.deleteData('jenis', id)
					if (response.data.response.code == 200) {
						this.showAlert(false, true, response.data.response.message)
						this.getListJenisAlat()
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
			async editJenisAlat() {
				this.closePopup()
				this.showAlert(true)
				try {
					const response = await api.editData(
						'jenis',
						this.selectedRowId,
						this.submitRequest
					)
					if (response.data.response.code === 200) {
						setTimeout(() => {
							this.showAlert(false, true, 'Edit Jenis Alat berhasil dilakukan')
							this.getListJenisAlat()
						}, 500)
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
				} finally {
					this.selectedRowId = null
				}
			},
			// Edit Data
			editRowData(index) {
				this.isEditRow = true
				let data = this.listData[index]
				this.selectedRowId = data.id

				let form = this.formAdd
				form[0].model = data.jenis_name
				form[1].model = []
				let spekArray = data.spec_attributes.split(', ')

				spekArray.forEach((spek, idx) => {
					let object = {
						id: null,
						value: '',
						disabled: false,
					}
					object.id = idx + 1
					object.value = spek
					form[1].model.push(object)
				})

				this.openPopup('edit')
			},
			// Notification
			deleteNotif(index) {
				let jenis = this.listData[index]
				let confirm = window.confirm(
					`Apakah anda yakin ingin menghapus jenis alat ${jenis.jenis_name}`
				)
				if (confirm) {
					this.deleteJenisAlat(jenis.id)
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
