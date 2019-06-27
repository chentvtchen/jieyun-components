import { router } from 'assets/js/config'

import Vue from 'vue'

import filter from './filter'
import routes from './router'
import store from './store'
import App from './App.vue'
router.addRoutes(routes)

import { AlertPlugin, ToastPlugin } from 'vux'
Vue.use(AlertPlugin)
Vue.use(ToastPlugin)

window.router = router
window.store = store

const bus = new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
window.bus = bus