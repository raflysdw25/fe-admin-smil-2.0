<template>
	<div v-if="isReload" class="d-flex flex-column align-items-center">
		<b-spinner
			variant="secondary"
			style="width: 150px; height: 150px; margin-bottom: 20px"
		></b-spinner>
		<p class="empty-table-description">
			Sedang Memuat Data...
		</p>
	</div>
	<div v-else class="list-civitas-jurusan">
		<button class="smil-btn smil-bg-info ml-auto" @click="openPopup('prodi')">
			Program Studi
		</button>
		<div class="tabs-menu">
			<template v-if="!isReload">
				<b-tabs content-class="mt-3" lazy>
					<b-tab
						:title="tab.title"
						v-for="(tab, idxTab) in tabs"
						:key="`tab-menu-${idxTab}`"
						:active="activeTab === tab.id"
						@click="setActiveTab(tab.id)"
					>
						<list-staff-jurusan v-if="activeTab === 1" :listProdi="listProdi" />
						<list-mahasiswa v-if="activeTab === 2" :listProdi="listProdi" />
					</b-tab>
				</b-tabs>
			</template>
		</div>

		<b-modal
			ref="modal-popup"
			hide-footer
			hide-header
			centered
			no-close-on-backdrop
			no-close-on-esc
			:size="baseModalType === 'prodi' ? 'lg' : ''"
		>
			<base-modal-list-support
				v-if="baseModalType === 'prodi'"
				title="Program Studi TIK"
				supportType="prodi"
				:closeModal="closeSupport"
			/>
		</b-modal>
	</div>
</template>

<script>
	// Components
	import ListStaffJurusan from '@/components/Admin/Civitas/ListStaffJurusan'
	import ListMahasiswa from '@/components/Admin/Civitas/ListMahasiswa'
	import BaseModalListSupport from '@/components/BaseModal/BaseModalListSupport.vue'

	// Mixin
	import ModalMixins from '@/mixins/ModalMixins'
	import ErrorHandlerMixins from '@/mixins/ErrorHandlerMixins'

	// API
	import api from '@/api/admin_api'

	export default {
		name: 'list-civitas-jurusan',
		components: { ListStaffJurusan, ListMahasiswa, BaseModalListSupport },
		mixins: [ModalMixins, ErrorHandlerMixins],
		data() {
			return {
				tabs: [
					{
						id: 1,
						title: 'Staff Jurusan',
					},
					{
						id: 2,
						title: 'Mahasiswa',
					},
				],
				activeTab: 1,
				listProdi: [],
				isReload: false,
			}
		},
		computed: {},
		async mounted() {
			await this.getProdi()
		},
		methods: {
			// Call API
			async getProdi() {
				// Hit API List Jabatan from Jabatan Table
				this.isReload = true
				try {
					const response = await api.getPlainData('prodi')
					let prodi = response.data.data
					let options = [
						{
							id: null,
							name: 'All',
							value: null,
							disabled: false,
						},
					]
					prodi.forEach((pd, indexJns) => {
						options.push({
							id: pd.id,
							name: pd.prodi_name,
							value: pd.id,
							disabled: false,
						})
					})

					this.listProdi = options
					this.isReload = false
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
			closeSupport() {
				this.getProdi()
				this.closePopup()
			},
			setActiveTab(id) {
				this.activeTab = id
			},
		},
	}
</script>

<style lang="scss" scoped>
	.list-civitas-jurusan {
		.tabs-menu {
			margin-top: 20px;
		}
	}
</style>
<style lang="scss">
	.list-civitas-jurusan {
		.nav-tabs {
			border-bottom: none;
			.nav-link {
				border: none;
				color: #696969;
				font-size: 20px;
				padding: 7px 0;
				margin-right: 14px;
				&.active {
					color: #101939;
					font-weight: 700;
					border-bottom: 2px solid;
					border-color: #101939;
				}
			}
		}

		.tab-content {
			padding: 60px 15px;
			padding-top: 60px;
			border: 1px solid #696969;
			max-height: 700px;
			overflow-y: scroll;
		}
	}
</style>
