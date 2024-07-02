import './assets/style/base.css'
import './assets/style/main.css'
import './assets/style/layout.css'
import './assets/style/text.css'
import '@cyhnkckali/vue3-color-picker/dist/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import VueApexCharts from 'vue3-apexcharts'
import PhosphorIcons from '@phosphor-icons/vue'
import router from './router'

const app = createApp(App)
app.use(VueApexCharts)
app.use(PhosphorIcons)

app.use(createPinia())
app.use(router)
app.mount('#app')
