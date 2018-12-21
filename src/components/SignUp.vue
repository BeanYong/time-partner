<template>
  <mu-container>
    <!-- TitleBar -->
    <mu-appbar style="width: 100%;" color="primary" title="注册用户">
      <mu-button icon slot="left">
        <mu-icon value="chevron_left"></mu-icon>
      </mu-button>

      <router-link to="/sign-in" slot="right" style="color: #fff;height: inherit;">
        <mu-button flat>登录</mu-button>
      </router-link>
    </mu-appbar>
    <!-- Main Content -->
    <mu-container>
      <mu-card style="width: 100%; margin: 18px auto;">
        <mu-card-header>
          <mu-avatar slot="avatar" size="100">
            <img src="https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=300533062,3547534330&fm=27&gp=0.jpg">
          </mu-avatar>
        </mu-card-header>
        <mu-form ref="form" :model="user" class="mu-demo-form" label-position="left">
          <mu-form-item label="手机号码" help-text="请输入11位手机号码" prop="tel" :rules="telRules">
            <mu-text-field v-model="user.tel" prop="tel"></mu-text-field>
          </mu-form-item>
          <mu-form-item label="登录密码" prop="psw" :rules="pswRules">
              <mu-text-field type="password" v-model="user.psw" prop="psw"></mu-text-field>
          </mu-form-item>
          <mu-form-item label="确认密码" prop="pswConfirm" :rules="pswConfirmRules">
              <mu-text-field type="password" v-model="user.pswConfirm" prop="pswConfirm"></mu-text-field>
          </mu-form-item>
          <mu-form-item prop="isAgree" :rules="argeeRules">
            <mu-checkbox label="同意用户协议" v-model="user.isAgree"></mu-checkbox>
          </mu-form-item>
        </mu-form>
      </mu-card>
    </mu-container>
    <mu-button full-width color="primary" @click="signUp()">
      注册
    </mu-button>
  </mu-container>
</template>
<script>
export default {
  name: 'Home',
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
      pswConfirmRules: [
        { validate: (val) => !!val, message: '必须填写确认密码'},
        { validate: (val) => val == this.user.psw, message: '两次填写的密码不一致'}
      ],
      argeeRules: [{ validate: (val) => !!val, message: '必须同意用户协议'}],
      // 用户注册信息
      user: {
        tel: '',
        psw: '',
        pswConfirm: '',
        isAgree: false
      }
    }
  },
  methods: {
    /**
     * 提交注册
     */
    signUp() {
      this.$refs.form.validate().then((result) => {
        if(result){
          this.$http.get(this.BASE_API + '/sign-up?tel=' + this.user.tel + '&psw=' + this.user.psw).then(response => {
            // get body data
            if (response.body.result) {
            }
          });
        }
      });
    }
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
