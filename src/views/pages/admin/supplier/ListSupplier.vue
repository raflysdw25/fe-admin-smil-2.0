<template>
	<div class="list-supplier">
		<!-- START: BUTTON GROUP -->
		<div class="button-group d-flex">
			<button
				class="smil-btn smil-bg-primary"
				@click="$router.push({ name: 'TambahSupplier' })"
			>
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
								@filterAction="getListSupplier"
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
											Lihat Detail Supplier
										</b-dropdown-item>
										<b-dropdown-item @click="editRowData(indexRow)">
											Edit Supplier
										</b-dropdown-item>
										<b-dropdown-item @click="deleteNotif(indexRow)">
											<span class="smil-text-danger">
												Hapus Supplier
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
					@change="getListSupplier"
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

		<!-- START: MODAL FILTER DATA FOR MOBILE -->
		<b-modal
			ref="modal-popup"
			no-close-on-backdrop
			no-close-on-esc
			hide-header
			hide-footer
			centered
		>
			<form-filter-data
				v-if="baseModalType === 'filter-data'"
				title="Filter Data Alat"
				:closeModal="closePopup"
				:formInput="filterData"
				:form="formFilter"
				@submitFilter="submitFilterData"
			/>

			<base-modal-alert
				v-if="baseModalType === 'alert'"
				:isProcess="isProcess"
				:isSuccess="isSuccess"
				:message="message"
				:closeAlert="closePopup"
			/>
			<base-modal-detail
				v-if="baseModalType === 'detail'"
				title="Detail Supplier"
				:headsData="headsDetail"
				:valueData="detailData"
				:closeModal="closePopup"
			/>
		</b-modal>
		<!-- END: MODAL FILTER DATA FOR MOBILE -->
	</div>
</template>

<script>
	// Components
	import IconComponent from '@/components/IconComponent.vue'
	import FormFilterData from '@/components/FormFilterData.vue'
	import BaseFilter from '@/components/BaseFilter.vue'
	import BaseModalAlert from '@/components/BaseModal/BaseModalAlert.vue'
	import BaseModalDetail from '@/components/BaseModal/BaseModalDetail.vue'

	// Mixins
	import ModalMixins from '@/mixins/ModalMixins'
	import TableMixins from '@/mixins/TableMixins'
	import ErrorHandlerMixins from '@/mixins/ErrorHandlerMixins'

	// API
	import api from '@/api/admin_api'
	export default {
		name: 'list-supplier',
		components: {
			IconComponent,
			FormFilterData,
			BaseFilter,
			BaseModalAlert,
			BaseModalDetail,
		},
		mixins: [ModalMixins, TableMixins, ErrorHandlerMixins],
		data() {
			return {
				headsTable: [
					{
						label: 'Nama Supplier',
						filter_type: 'search',
						placeholder: 'Filter Nama Supplier',
						model: 'supplier_name',
						options: null,
					},
					{
						label: 'Alamat Supplier',
						filter_type: 'search',
						placeholder: 'Filter Alamat Supplier',
						model: 'supplier_address',
						options: null,
					},
					{
						label: 'Person In Charge',
						filter_type: 'search',
						placeholder: 'Filter Person In Charge',
						model: 'person_in_charge',
						options: null,
					},
					'',
				],
				filterData: {
					supplier_name: '',
					supplier_address: '',
					person_in_charge: '',
				},
				formFilter: [
					{
						label: 'Nama Supplier',
						type: 'text',
						model: 'supplier_name',
						description: '',
						placeholder: 'Filter Nama Supplier',
						isRequired: false,
					},
					{
						label: 'Alamat Supplier',
						type: 'text',
						model: 'supplier_address',
						description: '',
						placeholder: 'Filter Alamat Supplier',
						isRequired: false,
					},
					{
						label: 'Person In Charge',
						type: 'text',
						model: 'person_in_charge',
						description: '',
						placeholder: 'Filter Person In Charge',
						isRequired: false,
					},
				],
				headsDetail: [
					{
						label: 'Nama Supplier',
						key: 'supplier_name',
					},
					{
						label: 'Nomor Telephone Supplier',
						key: 'supplier_phone',
					},
					{
						label: 'Email Supplier',
						key: 'supplier_email',
					},
					{
						label: 'Person In Charge',
						key: 'person_in_charge',
					},
					{
						label: 'Alamat Supplier',
						key: 'supplier_address',
					},
				],
			}
		},
		computed: {
			listTable() {
				let listTable = []
				this.listData.forEach((list, indexList) => {
					let rowTable = [
						list.supplier_name, //Nama Supplier
						list.supplier_address === null ? '-' : list.supplier_address, //Alamat Supplier
						list.person_in_charge, //Person In Charge
						'',
					]

					listTable.push(rowTable)
				})

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
			detailData() {
				let row = this.selectedRowData
				if (Object.keys(this.selectedRowData).length > 0) {
					return {
						supplier_name: row.supplier_name,
						supplier_phone: row.supplier_phone,
						supplier_email: row.supplier_email,
						person_in_charge: row.person_in_charge,
						supplier_address: row.supplier_address,
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
					if (!this.loadingTable) {
						this.getListSupplier()
					}
				},
			},
		},
		async mounted() {
			if (this.isSuperAdmin) {
				this.$router.go(-1)
			}
			await this.getListSupplier()
			// this.showAlert(false, false, 'Alert Berhasil')
		},
		methods: {
			// Call API
			async getListSupplier() {
				this.loadingTable = true
				if (this.isFilterUse && this.tableInfo.pageNo > 1) {
					this.tableInfo.pageNo = 1
				}
				// Nembak API Get List Alat
				try {
					const response = await api.getFilterData(
						'supplier',
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
			async deleteSupplier(id) {
				this.showAlert(true)
				try {
					const response = await api.deleteData('supplier', id)
					if (response.data.response.code == 200) {
						this.showAlert(false, true, response.data.response.message)
						this.getListSupplier()
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
				}
			},
			submitFilterData(formInput) {
				this.filterData = formInput
				alert(this.filterData)
				// this.getListSupplier()
			},

			// Action Dropdown
			lihatDetail(indexData) {
				this.selectedRowData = this.listData[indexData]
				this.openPopup('detail')
			},
			editRowData(index) {
				let data = this.listData[index]
				this.$router.push({
					name: 'EditSupplier',
					params: { supplier_id: data.id },
				})
			},
			deleteNotif(index) {
				let supplier = this.listData[index]
				let confirm = window.confirm(
					`Apakah anda yakin ingin menghapus supplier ${supplier.supplier_name}`
				)
				if (confirm) {
					this.deleteSupplier(supplier.id)
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
