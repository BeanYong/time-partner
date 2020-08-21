import Vue from 'vue'
import VueRouter from "vue-router"
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import 'muse-ui-loading/dist/muse-ui-loading.css'; // load css
import Loading from 'muse-ui-loading';
import VueResource from 'vue-resource'
import Toast from 'muse-ui-toast'
import VueCookies from 'vue-cookies'
import Echarts from 'echarts'
import App from './App.vue'
import Home from '../src/components/Home.vue'
import SignUp from '../src/components/SignUp.vue'
import SignIn from '../src/components/SignIn.vue'
import Analysis from '../src/components/Analysis.vue'
import Mine from '../src/components/Mine.vue'
import EditUserInfo from '../src/components/EditUserInfo.vue'
import TimePlan from '../src/components/TimePlan.vue'

Vue.use(VueRouter)
Vue.use(MuseUI)
Vue.use(Loading);
Vue.use(VueResource)
Vue.use(Toast);
Vue.use(VueCookies)
Vue.use(Echarts)

Vue.config.productionTip = false

// Echarts模块
Vue.prototype.echarts = Echarts

// 服务器api公共头
Vue.prototype.BASE_API = "https://time.beanyon.site"
// Vue.prototype.BASE_API = "http://localhost:8082"

const routes = [
    { path: '/home', name: 'home', component: Home },
    { path: '/sign-up', name: 'sign-up', component: SignUp },
    { path: '/sign-in', name: 'sign-in', component: SignIn },
    { path: '/analysis', name: 'analysis', component: Analysis },
    { path: '/mine', name: 'mine', component: Mine },
    { path: '/edit-user-info', name: 'edit-user-info', component: EditUserInfo },
    { path: '/time-plan', name: 'time-plan', component: TimePlan },
    // 重定向
    { path: '/', redirect: '/home' }
]

const router = new VueRouter({
    mode: 'history', // 去掉路由地址的#
    routes: routes
})

// cookies过期时间
Vue.prototype.expire = 60 * 60 * 24 * 15

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
 * 显示加载中动画
 */
Vue.prototype.showLoading = function() {
  return this.$loading()
}

// 全局back函数
Vue.prototype.back = function() {
  history.back()
}

/**
 * 聚焦第一个输入框
 */
Vue.prototype.focusOnFirstInput = function() {
  setTimeout(function(){
    document.getElementsByTagName("input")[0].focus()
  }, 20)
},

/**
 * 从cookies中读取用户信息
 */
Vue.prototype.getUserInfoFromCookies = function() {
  let user = {
    "name": "",
    "tel": "",
    "gender": "",
    "birthday": "",
    "createdAt": ""
  }

  user.tel = this.$cookies.get("tel")
  user.name = this.$cookies.get("name")
  user.gender = this.$cookies.get("gender")
  user.createdAt = this.$cookies.get("createdAt")
  user.birthday = this.$cookies.get("birthday") == "null" ? "" : this.$cookies.get("birthday")

  return user
}

/**
 * 登录逻辑
 */
Vue.prototype.login = function(tel, password, route) {
  this.$http.post(this.BASE_API + '/user/sign-in', {'tel': tel, 'psw': password}).then(response => {
    if (response.body.result) {
      // 将用户信息存入cookie，15天过期
      let expire = Vue.prototype.expire
      this.$cookies.set('tel', response.body.data.tel, expire)
      this.$cookies.set('password', password, expire)
      this.$cookies.set('id', response.body.data.id, expire)
      this.$cookies.set('name', response.body.data.name, expire)
      this.$cookies.set('gender', response.body.data.gender, expire)
      this.$cookies.set('createdAt', response.body.data.createdAt, expire)
      this.$cookies.set('birthday', response.body.data.birthday, expire)
      this.$cookies.set('sessionId', response.body.data.sessionId, expire)
      this.$cookies.set('status', response.body.data.status, expire)

      this.$toast.success(response.body.message)
      this.$router.push({ name: route })
    } else {
      this.$toast.error(response.body.message)
    }
  });
}

// http请求拦截器
Vue.http.interceptors.push(function(request, next) {
    // 显示加载中动画
    let loading = Vue.prototype.showLoading()

    // 请求前
    request.headers.set("Authorization", Vue.prototype.$cookies.get("sessionId"))

    // 请求后
    next((response) => {
        // 尚未登录
        if (response.body.code == 2001) {
            this.$toast.error(response.body.message)
            this.$cookies.remove('sessionId')
            router.push({ name: 'sign-in' });
        }

        // 隐藏加载中动画
        if(loading){
          loading.close()
        }
    });
});

new Vue({
  router: router,
  render: h => h(App),
}).$mount('#app')