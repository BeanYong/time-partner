<template>
  <mu-container>
    <!-- TitleBar -->
    <mu-appbar style="width: 100%;position: fixed;top: 0;left: 0;" color="primary" title="编辑用户信息">
      <mu-button icon slot="left" @click="back()">
        <mu-icon value="keyboard_arrow_left"></mu-icon>
      </mu-button>
      <mu-button icon slot="right" @click="save()">
        <mu-icon value="done"></mu-icon>
      </mu-button>
    </mu-appbar>
    <mu-list style="margin-top: 72px;">
      <mu-form :model="user" class="mu-demo-form" label-position="left" label-width="100">
        <mu-form-item prop="input" label="用户名">
          <mu-text-field v-model="user.name"></mu-text-field>
        </mu-form-item>
        <mu-form-item prop="date" label="出生日期">
          <mu-date-input v-model="user.birthday" type="date" container="dialog"></mu-date-input>
        </mu-form-item>
        <mu-form-item prop="radio" label="性别">
          <mu-radio v-model="user.gender" value="1" label="男"></mu-radio>
          <mu-radio v-model="user.gender" value="0" label="女"></mu-radio>
        </mu-form-item>
      </mu-form>
    </mu-list>
  </mu-container>
</template>
<script>
export default {
  name: 'EditUserInfo',
  data() {
    return {
      // 用户信息
      user: {},
      // 原始用户信息，用于判断信息是否进行了修改
      originUser: {}
    }
  },
  methods: {
    /**
     * 初始化
     */
    init() {
      // 从cookies中读取用户数据
      this.user = this.getUserInfoFromCookies()
      // 备份用户信息
      this.bakUserInfo()
    },

    /**
     * 保存用户信息
     */
    save() {
      // 判断用户信息是否被修改过
      if(this.userInfoChanged()) {
        // 格式化生日
        this.user.birthday = new Date(this.user.birthday).format("yyyy-MM-dd")

        // 发起修改请求
        this.$http.post(this.BASE_API + "/user/update-info", this.user).then(response => {
          if(response.body.result){
            // 同步用户信息
            this.bakUserInfo()
            this.$cookies.set('name', this.user.name, this.expire)
            this.$cookies.set('gender', this.user.gender, this.expire)
            this.$cookies.set('birthday', this.user.birthday, this.expire)
            this.$toast.success(response.body.message)
          } else {
            this.$toast.error(response.body.message)
          }
        })
      } else {
        // 用户信息没有修改过，无需保存
        this.$toast.warning("用户信息没有修改过，无需保存")
      }
    },

    /**
     * 备份用户信息
     */
    bakUserInfo() {
      this.originUser.name = this.user.name
      this.originUser.birthday = this.user.birthday
      this.originUser.gender = this.user.gender
    },

    /**
     * 判断用户信息是否修改过
     */
    userInfoChanged() {
      return this.user.name != this.originUser.name || this.user.birthday != this.originUser.birthday || this.user.gender != this.originUser.gender
    }
  },
  mounted() {
    this.init()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
