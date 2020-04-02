<template>
  <mu-container>
    <!-- TitleBar -->
    <mu-appbar style="width: 100%;position: fixed;top: 0;left: 0;" color="primary" title="个人中心">
    </mu-appbar>
    <!-- User Info -->
    <div style="width: 100%; background: #fff; padding: 72px 12px 12px;">
      <div class="user-header">
        <img src="https://now.beanyon.site/avatar/default-avatar.jpg">
        <div class="name-box">
          <div class="username">{{user.name}}</div>
          <router-link to="/edit-user-info">
            <mu-icon class="username-edit" value="edit"></mu-icon>
          </router-link>
        </div>
      </div>
    </div>
    <!-- Time Info -->
    <mu-card class="time-info">
      <div class="time-info-box">
        <p class="time-info-box-num orange">{{activities.length}}</p>
        <p class="time-info-box-label">工作数（项）</p>
      </div>
      <div class="time-info-box">
        <p class="time-info-box-num red">{{parseInt(minutesSum / 60)}}</p>
        <p class="time-info-box-label">总耗时（小时）</p>
      </div>
    </mu-card>
    <!-- Time List -->
    <div style="width: 100%; background: #fff;">
      <mu-list textline="three-line">
        <mu-list-item v-for="(activity, index) in activities" :key="index" style="border-top: 1px solid #eee;">
          <mu-list-item-content>
            <mu-list-item-title>{{activity.name}}</mu-list-item-title>
            <mu-list-item-sub-title>
              <span v-if="parseInt(activity.spentTimeMinutes / 60) != 0">{{parseInt(activity.spentTimeMinutes / 60)}} h </span>
              <span>{{activity.spentTimeMinutes % 60}} min </span>
              <mu-linear-progress class="progress-bar" mode="determinate" :min="0" :max="minutesSum" :value="activity.spentTimeMinutes"></mu-linear-progress>
            </mu-list-item-sub-title>
          </mu-list-item-content>
          <mu-list-item-action >
            <mu-list-item-after-text>{{activity.ratio}}</mu-list-item-after-text>
          </mu-list-item-action>
          <div class="list-divider"></div>
        </mu-list-item>
      </mu-list>
    </div>
  </mu-container>
</template>
<script>
export default {
  name: 'Mine',
  data() {
    return {
      user: {},
      // 总耗时（分钟）
      minutesSum: 0,
      // 工作数组
      activities: []
    }
  },
  methods: {
    /**
     * 初始化
     */
    init() {
      // 从cookies中读取用户数据
      this.user = this.getUserInfoFromCookies()
      // 获取全部活动数据
      this.getActivities()
    },

    /**
     * 获取全部活动数据
     */
    getActivities() {
      this.$http.get(this.BASE_API + '/analysis/get-all-activities').then(response => {
        if (response.body.result) {
          this.minutesSum = response.body.data.totalMinuteSum
          this.activities = response.body.data.activityList
        }
      })
    }
  },
  created() {
    this.init()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.user-header {
  position: relative;
  width: 100%;
  height: 120px;
  box-shadow: 0px 1px 1px 2px #f0f0f0;
  border-radius: 4px;
  padding: 12px 0 0 0;
}
.user-header img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}
.name-box {
  font-size: 18px;
  margin-top: 6px;
  color: #333;
}
.username-edit {
  position: absolute;
  top: 12px;
  right: 16px;
}
p {
  margin: 0;
}
.time-info {
  float: left;
  width: 100%;
  box-shadow: 0px 0px 2px #ccc;
  padding: 16px 0;
  margin-bottom: 4px;
}
.time-info-box {
  width: 50%;
  float: left;
}
.time-info-box:nth-child(1) {
  border-right: 1px solid #ccc;
}
.time-info-box-num {
  font-size: 42px;
  font-weight: 600;
}
.time-info-box-label {
  color: #606266;
  font-size: 14px;
}
.progress-bar {
  margin: 8px 0;
}
.mu-item-title {
  font-size: 18px;
}
.mu-item-after-text {
  font-size: 14px;
}
</style>
