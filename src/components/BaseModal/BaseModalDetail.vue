<template>
	<div class="base-modal-detail">
		<div class="header">
			<h3 class="title">{{ title }}</h3>
			<b-icon
				icon="x"
				style="width:40px; height: 24px; cursor: pointer"
				@click="closeModal"
			/>
		</div>
		<div class="table-responsive-sm">
			<table class="table table-borderless">
				<tr v-if="Object.keys(valueData).length === 0">
					<td :colspan="2" class="text-center">Tidak ada {{ title }}</td>
				</tr>
				<tr
					v-else
					v-for="(data, idxData) in headsData"
					:key="`row-data-${idxData}`"
				>
					<th>{{ data.label }}</th>
					<td>
						{{
							valueData[data.key] === '' || valueData[data.key] === null
								? '-'
								: valueData[data.key]
						}}
					</td>
				</tr>
			</table>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'base-modal-detail',
		props: {
			/* 
                heads : {
                    label: 'Nama Alat'
                    key: 'alat_name'
                }
            */
			headsData: Array,
			valueData: Object,
			title: String,
			closeModal: Function,
		},
	}
</script>

<style lang="scss" scoped>
	.header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 30px;
		.title {
			font-weight: 700;
		}
	}
</style>
<style lang="scss">
	.base-modal-detail {
		.table {
			th {
				padding-left: 0;
				padding-right: 5px;
			}
			td {
				padding-left: 0;
			}
		}
	}
</style>
