import Vue from 'vue'
import VueRouter from "vue-router";
import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';
import VueResource from 'vue-resource';
import Toast from 'muse-ui-toast';
import VueCookies from 'vue-cookies'
import App from './App.vue'
import Home from '../src/components/Home.vue'
import SignUp from '../src/components/SignUp.vue'
import SignIn from '../src/components/SignIn.vue'

Vue.use(VueRouter)
Vue.use(MuseUI)
Vue.use(VueResource)
Vue.use(Toast);
Vue.use(VueCookies)
Vue.config.productionTip = false

// 服务器api公共头
Vue.prototype.BASE_API = "https://time.beanyon.site"
// 全局back函数
Vue.prototype.back = function() {
  history.back()
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

// http请求拦截器
// Vue.http.interceptors.push((request, next) => {
//     // 请求前
//     if (request.method == 'POST') {
//         // 为POST请求添加access_token和check_key
//         request.body['access_token'] = localStorage.getItem('access_token');
//         request.body['check_key'] = localStorage.getItem('check_key');
//     }

//     if (request.method == 'GET') {
//         // 为GET请求添加access_token和check_key
//         if (request.url.indexOf('?') != -1) {
//             request.url += '&access_token=' + localStorage.getItem('access_token') + '&check_key=' + localStorage.getItem('check_key');
//         } else {
//             request.url += '?access_token=' + localStorage.getItem('access_token') + '&check_key=' + localStorage.getItem('check_key');
//         }
//     }

//     // 请求后
//     next((response) => {
//         // 截获登录超时，更新access_token和check_key
//         if (response.body.access_token && response.body.check_key) {
//             localStorage.setItem('access_token', response.body.access_token);
//             localStorage.setItem('check_key', response.body.check_key);
//         }

//         if (response.body.message == '登录已经失效，请重新登录') {
//             Vue.prototype.$message({
//                 type: 'info',
//                 message: response.body.message
//             });
//             localStorage.removeItem('access_token');
//             localStorage.removeItem('check_key');
//             localStorage.removeItem('name');
//             localStorage.removeItem('user_role');
//             localStorage.removeItem('user_role_type');
//             localStorage.removeItem('messagesCount');
//             localStorage.removeItem('id');
//             router.push({ name: 'login' });
//         }
//     });
// });

// 对Date的扩展，将 Date 转化为指定格式的String   
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
// 例子：   
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
Date.prototype.format = function(fmt)   
{ //author: meizz   
  var o = {   
    "M+" : this.getMonth()+1,                 //月份   
    "d+" : this.getDate(),                    //日   
    "h+" : this.getHours(),                   //小时   
    "m+" : this.getMinutes(),                 //分   
    "s+" : this.getSeconds(),                 //秒   
    "q+" : Math.floor((this.getMonth()+3)/3), //季度   
    "S"  : this.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
}

/**
 * 登录逻辑
 */
Vue.prototype.login = function(tel, password, route) {
  this.$http.get(this.BASE_API + '/sign-in?tel=' + tel + '&psw=' + password).then(response => {
    if (response.body.result) {
      // 将用户信息存入cookie，15天过期
      let expire = 60 * 60 * 24 * 15
      this.$cookies.set('tel', response.body.data.tel, expire)
      this.$cookies.set('password', password, expire)
      this.$cookies.set('id', response.body.data.id, expire)
      this.$cookies.set('name', response.body.data.name, expire)
      this.$cookies.set('gender', response.body.data.gender, expire)
      this.$cookies.set('age', response.body.data.age, expire)
      this.$cookies.set('createdAt', response.body.data.createdAt, expire)

      this.$toast.success(response.body.message)
      this.$router.push({ name: route });
    } else {
      this.$toast.error(response.body.message)
    }
  });
}

new Vue({
  router: router,
  render: h => h(App),
}).$mount('#app')
