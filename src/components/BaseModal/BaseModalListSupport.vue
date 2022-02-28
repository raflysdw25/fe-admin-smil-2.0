<template>
	<div class="base-modal-struktural">
		<div class="header">
			<h3 class="header-title">{{ title }}</h3>
			<b-icon
				icon="x"
				style="width:40px; height: 24px; cursor: pointer"
				@click="closeModal"
			/>
		</div>
		<div class="add-data">
			<template v-if="!inputActive">
				<button
					class="smil-btn smil-bg-primary smil-btn-small"
					@click="addInput"
				>
					Tambah Data
				</button>
			</template>
			<template v-else>
				<div class="add-form">
					<input type="text" class="form-control mr-2" v-model="inputValue" />
					<button
						class="smil-btn smil-bg-primary smil-btn-small mr-2"
						:disabled="inputValue === ''"
						@click="actionSubmit()"
					>
						<b-spinner v-if="isCreate" style="color: #fff"></b-spinner>
						<span v-else>
							{{ this.selectedRowId !== null ? 'Ubah' : 'Simpan' }}
						</span>
					</button>
					<b-icon
						icon="x-circle-fill"
						style="color: #dc3545; width: 18px; height: 18px; cursor: pointer"
						@click="closeInput"
					/>
				</div>
			</template>
		</div>
		<!-- LIST DATA -->
		<div class="table-section table-responsive-sm">
			<table class="table smil-table">
				<thead class="smil-thead">
					<tr>
						<th
							v-for="(head, indexHds) in headsTable"
							:key="`header-table-${head.id}-${indexHds}`"
						>
							{{ head.label }}
							<base-filter
								filter_class="d-none d-lg-block"
								@changeValue="changeFilterValue"
								@filterAction="getSupportData"
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

										<b-dropdown-item @click="editData(indexRow)">
											Edit Data
										</b-dropdown-item>

										<b-dropdown-item @click="deleteNotif(indexRow)">
											<span class="smil-text-danger">
												Hapus Data
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
		<!-- LIST DATA -->

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
					@change="getSupportData"
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
	</div>
</template>

<script>
	// Components
	import BaseFilter from '@/components/BaseFilter'
	import IconComponent from '@/components/IconComponent.vue'
	// API
	import api from '@/api/admin_api'

	// Mixins
	import TableMixins from '@/mixins/TableMixins'
	import ErrorHandlerMixins from '@/mixins/ErrorHandlerMixins'

	export default {
		name: 'base-modal-list-support',
		props: {
			title: {
				type: String,
				default: 'List Data Support',
			},
			closeModal: Function,
			supportType: {
				required: true,
				type: String,
				/*
					Asal Pengadaan : asal,
					Program Studi: prodi,
					Jabatan Lab: jabatan,
					Ruangan : ruangan,
					Satuan: satuan,
				*/
			},
		},
		components: { BaseFilter, IconComponent },
		mixins: [TableMixins, ErrorHandlerMixins],
		data() {
			return {
				inputActive: false,
				inputValue: '',
				filterData: {
					id: null,
				},
				isCreate: false,
			}
		},
		watch: {
			tableInfo: {
				deep: true,
				handler: function() {
					if (!this.loadingTable) {
						this.getSupportData()
					}
				},
			},
		},
		async mounted() {
			await this.getSupportData()
			this.setHeaderTable()
		},
		methods: {
			async getSupportData() {
				this.loadingTable = true
				if (this.isFilterUse && this.tableInfo.pageNo > 1) {
					this.tableInfo.pageNo = 1
				}
				let fitlerPayload = {
					page_size: this.tableInfo.listSize,
					sort_by: 'id',
					sort_direction: 'ASC',
					...this.filterData,
				}
				// Nembak API Get List Alat
				try {
					const response = await api.getFilterData(
						this.supportType,
						this.tableInfo.pageNo,
						fitlerPayload
					)

					this.listData = response.data.result
					let page = response.data.page
					this.tableInfo.totalPage = page.total
					this.tableInfo.listTotal = page.data_total
				} catch (e) {
					let output = this.getErrorMessage(e, 'alert')
					alert(output)
				} finally {
					this.loadingTable = false
				}
			},
			async saveSupportData() {
				this.isCreate = true
				try {
					const response = await api.createNewData(
						this.supportType,
						this.submitRequest
					)
					this.isCreate = false
					this.closeInput()
					setTimeout(() => {
						this.getSupportData()
					}, 500)
				} catch (e) {
					this.isCreate = false

					let output = this.getErrorMessage(e, 'alert')
					alert(output)
				}
			},
			async editSupport() {
				this.isCreate = true
				try {
					const response = await api.editData(
						this.supportType,
						this.selectedRowId,
						this.submitRequest
					)
					if (response.data.response.code === 200) {
						this.selectedRowId = null
						this.isCreate = false
						this.closeInput()
						setTimeout(() => {
							this.getSupportData()
						}, 500)
					}
				} catch (e) {
					this.isCreate = false

					let output = this.getErrorMessage(e, 'alert')
					alert(output)
				}
			},
			async deleteSupport(id) {
				try {
					const response = await api.deleteData(this.supportType, id)
					if (response.data.response.code == 200) {
						this.getSupportData()
					} else {
						alert(response.data.response.message)
					}
				} catch (e) {
					let output = this.getErrorMessage(e, 'alert')
					alert(output)
				}
			},
			actionSubmit() {
				if (this.selectedRowId !== null) {
					this.editSupport()
				} else {
					this.saveSupportData()
				}
			},
			addInput() {
				this.inputActive = true
			},
			editData(index) {
				let support = this.listData[index]
				this.selectedRowId = support.id
				this.inputValue = support[this.attribute.name]
				this.inputActive = true
			},
			closeInput() {
				this.inputValue = ''
				this.inputActive = false
			},
			deleteNotif(index) {
				let support = this.listData[index]
				let confirm = window.confirm(
					`Apakah anda yakin ingin menghapus ${this.attribute.header} ${
						support[this.attribute.name]
					}`
				)
				if (confirm) {
					this.deleteSupport(support.id)
				}
			},
			// Table
			setHeaderTable() {
				let header = [
					{
						label: `ID ${this.attribute.header}`,
						filter_type: 'search-number',
						placeholder: `Filter ID ${this.attribute.header}`,
						model: 'id',
					},
					{
						label: `Nama ${this.attribute.header}`,
						filter_type: 'search',
						placeholder: `Filter Nama ${this.attribute.header}`,
						model: `${this.attribute.name}`,
					},
					'',
				]
				this.headsTable = header
			},
		},
		computed: {
			attribute() {
				let attribute = null
				if (this.supportType == 'asal') {
					attribute = { name: 'asal_pengadaan_name', header: 'Asal Pengadaan' }
				} else if (this.supportType == 'prodi') {
					attribute = { name: 'prodi_name', header: 'Program Studi' }
				} else if (this.supportType == 'jabatan') {
					attribute = { name: 'jabatan_name', header: 'Jabatan' }
				} else if (this.supportType == 'ruangan') {
					attribute = { name: 'ruangan_name', header: 'Ruangan' }
				} else if (this.supportType == 'satuan') {
					attribute = { name: 'satuan_jumlah_name', header: 'Satuan' }
				}

				this.filterData[attribute.name] = ''
				return attribute
			},
			listTable() {
				let listTable = []
				this.listData.forEach((list, indexList) => {
					let rowTable = [list.id, list[this.attribute.name], '']

					listTable.push(rowTable)
				})

				return listTable
			},
			submitRequest() {
				let request = {}
				request[this.attribute.name] = this.inputValue
				return request
			},
		},
	}
</script>

<style lang="scss" scoped>
	.base-modal-struktural {
		.header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			.header-title {
				font-size: 20px;
				margin-bottom: 0;
				font-weight: 700;
			}
		}

		.add-data {
			margin-top: 24px;
			.add-form {
				display: flex;
				align-items: center;
			}
		}

		.table-section {
			margin-top: 24px;
		}

		.pagination-section {
			.table-counter {
				padding: 10px;
			}
		}

		.form-control {
			width: 180px;
		}
	}
</style>
