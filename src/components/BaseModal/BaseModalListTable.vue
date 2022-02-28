<template>
	<div class="base-modal-list-table">
		<div class="header">
			<h3 class="title">{{ title }}</h3>
			<b-icon
				icon="x"
				style="width:40px; height: 24px; cursor: pointer"
				@click="closeModal"
			/>
		</div>
		<div class="table-responsive-sm">
			<p>
				{{ totalData > 5 ? 5 : totalData }} Data Terbaru yang ditambahkan dari
				total {{ totalData }} data
			</p>
			<table class="table smil-table list-table">
				<thead class="smil-thead">
					<tr>
						<th
							v-for="(head, indexHds) in heads"
							:key="`header-list-table-${indexHds}`"
						>
							{{ head }}
						</th>
					</tr>
				</thead>
				<tbody class="smil-tbody">
					<tr v-if="contents.length === 0">
						<td :colspan="heads.length" class="text-center empty-table">
							<span class="empty-table-description">
								Tidak ada data yang dapat ditampilkan
							</span>
						</td>
					</tr>
					<tr
						v-else
						v-for="(rows, indexRow) in contents"
						:key="`content-table-${indexRow}`"
					>
						<td
							v-for="(content, indexContent) in rows"
							:key="`column-${content}${indexContent}`"
						>
							<template v-if="typeof content == 'string'">
								{{ content }}
							</template>
							<template v-else>
								<span class="smil-status" :class="content.background">
									{{ content.text }}
								</span>
							</template>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'base-modal-list-table',
		props: {
			title: String,
			heads: Array,
			contents: Array,
			totalData: Number,
			closeModal: Function,
		},
	}
</script>

<style lang="scss" scoped>
	.base-modal-list-table {
		.header {
			display: flex;
			justify-content: space-between;
			margin-bottom: 30px;
			.title {
				font-weight: 700;
			}
		}
	}
</style>
