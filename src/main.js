// 为了完整使用 ES6 的 API 使用 babel-polyfill
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
// 优化移动端触摸的延迟体验
import fastclick from 'fastclick'
// 懒加载图片优化体验
import VueLazyload from 'vue-lazyload'

import 'common/stylus/index.styl'

fastclick.attach(document.body)

Vue.use(VueLazyload, {
  loading: require('common/image/default.png')
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
