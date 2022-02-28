// Components
import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import { store } from './store/store'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import VueCookies from 'vue-cookies'

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/index.css'

// Print HTML to Paper

// Cookies
Vue.use(VueCookies)

Vue.component('date-picker', DatePicker)
Vue.config.productionTip = false

new Vue({
	router,
	store,
	render: function(h) {
		return h(App)
	},
}).$mount('#app')
