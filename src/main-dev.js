import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 引入全局css
import './assets/css/global.css'
// 引入字体图标
import './assets/fonts/iconfont.css'
// 引入树状表格插件
import TreeTable from 'vue-table-with-tree-grid'

// 进度条 NProgress
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import axios from 'axios'

// 配置请求的的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'
// axios请求拦截器 添加token
// 在request拦截器展示进度条 NProgress.start()
axios.interceptors.request.use(config => {
  NProgress.start()
  // 为请求头对象 添加token验证的 Authorization 字段
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')

  // 必须 return config
  return config
})
// 在response拦截器中隐藏进度条  NProgress.done()
axios.interceptors.response.use((config) => {
  NProgress.done()
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

// 日期过滤器
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')

  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
