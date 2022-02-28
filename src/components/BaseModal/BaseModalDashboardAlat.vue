<template>
	<div class="base-modal-dashboard-alat">
		<!-- START: HEADER -->
		<div class="header">
			<h3 class="header-title">
				List Alat Laboratorium Kondisi : {{ conditionText }}
			</h3>
			<b-icon
				icon="x"
				style="width:40px; height: 24px; cursor: pointer"
				@click="closeModal"
			/>
		</div>
		<!-- END: HEADER -->

		<!-- START: TABLE LIST -->
		<div class="table-responsive-sm">
			<table class="table smil-table">
				<thead class="smil-thead">
					<tr>
						<th
							v-for="(head, indexHds) in headsTable"
							:key="`header-table-${indexHds}`"
						>
							{{ head.label }}
							<!-- <template v-if="head !== ''">
								<base-filter
									filter_class="d-none d-lg-block mt-2"
									@changeValue="changeFilterValue"
									@filterAction="getListDashboardAlat"
									:filter_type="head.filter_type"
									:default_value="filterData[head.model]"
									:placeholder="head.placeholder"
									:options="head.options"
									:modelFilter="head.model"
								/>
							</template> -->
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
							>
								{{ content }}
							</td>
						</tr>
					</template>
				</tbody>
			</table>
		</div>
		<!-- END: TABLE LIST -->

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
					@change="getListDashboardAlat"
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
	</div>
</template>

<script>
	// Components
	import BaseFilter from '@/components/BaseFilter.vue'
	import IconComponent from '@/components/IconComponent.vue'
	// Mixins
	import TableMixins from '@/mixins/TableMixins'
	import ErrorHandlerMixins from '@/mixins/ErrorHandlerMixins'
	// API
	import api from '@/api/admin_api'
	export default {
		name: 'base-modal-dashboard-alat',
		props: {
			conditionCode: Number,
			closeModal: Function,
		},
		mixins: [TableMixins, ErrorHandlerMixins],
		components: { BaseFilter, IconComponent },
		data() {
			return {
				// Overwrite Variables from Table Mixin
				headsTable: [
					{
						label: 'Nama Alat',
						filter_type: 'search',
						placeholder: 'Filter Nama Alat',
						model: 'alat_name',
						options: null,
					},
					{
						label: 'Jenis Alat',
						filter_type: 'select',
						placeholder: 'Filter Jenis Alat',
						model: 'jenis_alat_id',
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
						label: 'Jumlah Unit',
						filter_type: 'search-number',
						placeholder: 'Filter Jumlah Alat',
						model: 'jumlah_alat',
						options: null,
					},
				],
				filterData: {
					alat_name: '',
					jenis_alat_id: null,
					jumlah_alat: null,
				},
				// Variables
			}
		},
		async mounted() {
			await this.getListDashboardAlat()
		},
		watch: {
			'tableInfo.pageNo': {
				deep: true,
				handler: function() {
					if (!this.loadingTable) {
						this.getListDashboardAlat()
					}
				},
			},
		},
		methods: {
			async getListDashboardAlat() {
				this.loadingTable = true
				if (this.isFilterUse && this.tableInfo.pageNo > 1) {
					this.tableInfo.pageNo = 1
				}
				try {
					const response = await api.listAlatForDashboard(
						this.tableInfo.pageNo,
						this.filterPayload
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
		},
		computed: {
			conditionText() {
				let text = ''
				switch (this.conditionCode) {
					case 1:
						text = 'PENDING'
						break
					case 2:
						text = 'BAIK'
						break
					case 3:
						text = 'RUSAK'
						break
					case 4:
						text = 'HABIS'
						break
					case 5:
						text = 'DIPERBAIKI'
						break
					case 6:
						text = 'APKIR'
						break

					default:
						break
				}

				return text
			},
			filterPayload() {
				let tableInfo = this.tableInfo
				return {
					page_size: tableInfo.listSize,
					sort_by: 'id',
					sort_direction: 'ASC',
					kondisi_alat: this.conditionCode,
					...this.filterData,
				}
			},
			listTable() {
				let listTable = []
				this.listData.forEach((list, indexList) => {
					let rowTable = [
						list.alat_name,
						list.jenis_alat_model.jenis_name,
						list.details_count,
					]

					listTable.push(rowTable)
				})

				return listTable
			},
		},
	}
</script>

<style lang="scss" scoped>
	.base-modal-dashboard-alat {
		.header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 20px;
			.header-title {
				font-size: 20px;
				margin-bottom: 0;
				font-weight: 700;
			}
		}

		.pagination-section {
			.table-pagination {
				ul {
					padding: 0 30px;
				}
			}
		}
	}
</style>
