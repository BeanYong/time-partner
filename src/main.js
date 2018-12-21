import Vue from 'vue'
import VueRouter from "vue-router";
import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';
import VueResource from 'vue-resource';
import Toast from 'muse-ui-toast';
import App from './App.vue'
import Home from '../src/components/Home.vue'
import SignUp from '../src/components/SignUp.vue'
import SignIn from '../src/components/SignIn.vue'

Vue.use(VueRouter)
Vue.use(MuseUI)
Vue.use(VueResource)
Vue.use(Toast);
Vue.config.productionTip = false

// 服务器api公共头
Vue.prototype.BASE_API = "https://time.beanyon.site"
Vue.prototype.userInfo = {
	id: 5
}

const routes = [
    { path: '/home', name: 'home', component: Home },
    { path: '/sign-up', name: 'sign-up', component: SignUp },
    { path: '/sign-in', name: 'sign-in', component: SignIn },
    // 重定向
    { path: '/', redirect: '/home' }
]

const router = new VueRouter({
    mode: 'history', // 去掉路由地址的#
    routes: routes
})

new Vue({
  router: router,
  render: h => h(App),
}).$mount('#app')
