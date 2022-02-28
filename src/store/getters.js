import * as types from '@/store/types'

export default {
	[types.ADMIN]: (state) => {
		return state.admin
	},
	[types.IMAGE_ADMIN]: (state) => {
		return state.imageAdmin
	},
}
