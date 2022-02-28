import * as types from '@/store/types'

export default {
	[types.MUTATE_ADMIN]: (state, payload) => {
		state.admin = payload
	},
	[types.MUTATE_IMAGE_ADMIN]: (state, payload) => {
		state.imageAdmin = payload
	},
}
