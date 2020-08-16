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

import axios from 'axios'
// 配置请求的的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'
// axios请求拦截器 添加token
axios.interceptors.request.use(config => {
  // 为请求头对象 添加token验证的 Authorization 字段
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')

  // 必须 return config
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
