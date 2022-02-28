<template>
	<div class="base-modal-approve">
		<h4>Permintaan {{ word.title }}</h4>
		<p>{{ word.message }}</p>
		<textarea
			class="form-control"
			v-model="requestNotes"
			placeholder="Catatan Peminjaman"
			rows="10"
			cols="10"
		></textarea>
		<div class="button-group mt-4 d-flex justify-content-end">
			<button
				class="smil-btn smil-btn-small smil-bg-secondary mr-2"
				@click="closeModal"
			>
				Batal
			</button>
			<button
				class="smil-btn smil-btn-small smil-bg-primary"
				@click="sendApprovalRequest"
			>
				Submit
			</button>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'base-modal-approve',
		props: {
			isApprove: Boolean,
			approveAction: Function,
			closeModal: Function,
		},
		data() {
			return {
				requestNotes: '',
			}
		},
		computed: {
			word() {
				if (this.isApprove) {
					return {
						title: 'Disetujui',
						message:
							'Apakah anda yakin ingin menyetujui permintaan peminjaman ini? Berikan catatan peminjaman jika perlu',
					}
				} else {
					return {
						title: 'Ditolak',
						message:
							'Apakah anda yakin ingin menolak permintaan peminjaman ini? Berikan catatan peminjaman jika perlu',
					}
				}
			},
			submitApprovalRequest() {
				return {
					is_approved: this.isApprove,
					pjm_notes: this.requestNotes,
				}
			},
		},
		methods: {
			// Call API
			sendApprovalRequest() {
				this.approveAction(this.submitApprovalRequest)
				this.requestNotes = ''
				this.closeModal()
			},
		},
	}
</script>

<style lang="scss" scoped>
	.base-modal-approve {
		h4 {
			font-size: 20px;
			font-weight: 700;
			margin-bottom: 12px;
		}

		p {
			font-size: 14px;
			margin-bottom: 10px;
		}
	}
</style>
