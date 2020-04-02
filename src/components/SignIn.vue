<template>
  <mu-container>
    <!-- TitleBar -->
    <mu-appbar style="width: 100%;" color="primary" title="登录">
      <mu-button icon slot="left" @click="back()">
        <mu-icon value="chevron_left"></mu-icon>
      </mu-button>

      <router-link to="/sign-up" slot="right" style="color: #fff;height: inherit;">
        <mu-button flat>注册</mu-button>
      </router-link>
    </mu-appbar>
    <!-- Main Content -->
    <mu-container>
      <mu-card style="width: 100%; margin: 18px auto;">
        <mu-card-header>
          <mu-avatar slot="avatar" size="100">
            <img src="https://now.beanyon.site/avatar/default-avatar.jpg">
          </mu-avatar>
        </mu-card-header>
        <mu-form ref="form" :model="user" class="mu-demo-form" label-position="left">
          <mu-form-item label="手机号码" prop="tel" :rules="telRules">
            <mu-text-field v-model="user.tel" prop="tel"></mu-text-field>
          </mu-form-item>
          <mu-form-item label="登录密码" prop="psw" :rules="pswRules">
              <mu-text-field type="password" v-model="user.psw" prop="psw"></mu-text-field>
          </mu-form-item>
        </mu-form>
      </mu-card>
    </mu-container>
    <mu-button full-width color="primary" @click="signIn()">
      登录
    </mu-button>
  </mu-container>
</template>
<script>
import { hex_md5 } from '../libs/md5.js'

export default {
  name: 'SignIn',
  data() {
    return {
      telRules: [
        { validate: (val) => !!val, message: '必须填写手机号码'},
        { validate: (val) => val.length == 11, message: '请填写11位手机号码'}
      ],
      pswRules: [
        { validate: (val) => !!val, message: '必须填写密码'},
        { validate: (val) => val.length >= 8 && val.length <= 16, message: '密码长度必须大于8小于16'}
      ],
      // 用户登录信息
      user: {
        tel: '',
        psw: ''
      }
    }
  },
  methods: {
    /**
     * 根据cookie中的数据，初始化账号密码
     */
    initData(){
      this.user.tel = this.$cookies.get("tel")
    },

    /**
     * 提交登录
     */
    signIn() {
      this.$refs.form.validate().then((result) => {
        if(result){
          let md5_psw = hex_md5(this.user.psw)
          this.login(this.user.tel, md5_psw, 'home')
        }
      });
    }
  },
  mounted() {
    this.initData()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.mu-demo-form {
  width: 100%;
  padding: 10px;
}
</style>
