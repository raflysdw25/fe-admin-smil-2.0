<template>
	<div class="base-modal-qrcode">
		<div class="printable-qrcode" id="printable-qrcode" ref="printable-qrcode">
			<div class="banner">
				<img src="@/assets/images/Logo_PNJ.png" class="img-barcode" alt="" />
				<h4 class="text">
					Laboratorium <br />
					Teknik Informatika dan Komputer <br />
					Politeknik Negeri Jakarta
				</h4>
			</div>
			<qrcode-vue
				:value="qrcodeData.path_url"
				:size="300"
				level="L"
				class="qrcode"
			/>
			<p class="qrcode-display">{{ qrcodeData.name }}</p>
			<p v-if="qrcodeData.desc && qrcodeData.desc !== ''">
				{{ qrcodeData.desc }}
			</p>
		</div>
	</div>
</template>

<script>
	// Package
	import QrcodeVue from 'qrcode.vue'

	export default {
		name: 'base-modal-qrcode',
		components: { QrcodeVue },
		data() {
			return {}
		},
		props: {
			qrcodeData: Object,
		},
		async mounted() {},
		methods: {},
		computed: {
			environment() {
				return process.env.NODE_ENV
			},
		},
	}
</script>

<style lang="scss" scoped>
	.base-modal-qrcode {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}
</style>
<style lang="scss">
	.base-modal-qrcode {
		@import '@/assets/css/barcode.scss';
	}
</style>
