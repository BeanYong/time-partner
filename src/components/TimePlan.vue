<template>
  <mu-container>
    <!-- TitleBar -->
    <mu-appbar style="width: 100%;position: fixed;top: 0;left: 0;" color="primary" title="时间计划">
      <mu-button icon slot="left" @click="back()">
        <mu-icon value="keyboard_arrow_left"></mu-icon>
      </mu-button>
      <mu-button icon slot="right">
      </mu-button>
    </mu-appbar>
    <mu-paper class="tips" :z-depth="4">
      小提示：您可以为自己定制时间计划，时间计划会在每日的0点0分，自动添加到您当日的时间卡片中。对于暂时不需要的时间计划，您可以将其关闭。
    </mu-paper>
    <!-- 已经添加的时间计划列表 -->
    <mu-card class="time-plan-list">
      <mu-list>
        <mu-list-item class="list-item" v-for="(timePlan, timePlanIndex) in everydayTimePlanList" :key="timePlanIndex">
          <mu-list-item-title>{{timePlan.activity}}</mu-list-item-title>
          <mu-switch class="time-plan-switch" v-model="timePlan.status == 1" @click="updateTimePlanStatus(timePlanIndex)"></mu-switch>
          <mu-list-item-action>
            <mu-icon value="clear" @click="showDeleteDialog=true;willDeleteTimePlanIndex=timePlanIndex"></mu-icon>
          </mu-list-item-action>
        </mu-list-item>
      </mu-list>
      <div v-if="everydayTimePlanList.length == 0" class="empty">
        空空如也！
      </div>
    </mu-card>
    <!-- 添加时间计划的按钮 -->
    <div class="add-time-plan-btn">
      <mu-button full-width round color="primary" @click="showCreateDialog = true;focusOnFirstInput()">添加时间计划</mu-button>
    </div>
    <!-- 添加时间计划的对话框 -->
    <mu-dialog title="添加时间计划" width="360" :open.sync="showCreateDialog">
      <mu-text-field class="activity-input" placeholder='请输入活动名称，如‘学习英语’' v-model="newActivity"></mu-text-field>
      <mu-button slot="actions" flat color="primary" @click="showCreateDialog = false">取消</mu-button>
      <mu-button slot="actions" flat color="primary" @click="addTimePlan()">确定</mu-button>
    </mu-dialog>
    <!-- 删除时间计划的对话框 -->
    <mu-dialog title="删除时间计划" width="360" :open.sync="showDeleteDialog">
      是否确定删除此时间计划？
      <mu-button slot="actions" flat color="primary" @click="showDeleteDialog = false">取消</mu-button>
      <mu-button slot="actions" flat color="primary" @click="deleteTimePlan()">确定</mu-button>
    </mu-dialog>
  </mu-container>
</template>
<script>
export default {
  name: 'TimePlan',
  data() {
    return {
      // 每日时间计划列表
      everydayTimePlanList: [],
      // 是否显示添加时间计划的对话框
      showCreateDialog: false,
      // 是否显示删除时间计划的对话框
      showDeleteDialog: false,
      // 要添加的新时间计划的活动名称
      newActivity: "",
      // 将要删除的时间计划在数组中的索引
      willDeleteTimePlanIndex: -1
    }
  },
  methods: {
    /**
     * 初始化
     */
    init() {
      // 从服务器获取时间计划
      this.getTimePlan()
    },

    /**
     * 获取时间计划
     */
    getTimePlan() {
      this.$http.get(this.BASE_API + "/time-plan/list").then(response => {
        if(response.body.result) {
          this.everydayTimePlanList = response.body.data
        } else {
          this.$toast.error(response.body.message)
        }
      })
    },

    /**
     * 添加时间计划
     */
    addTimePlan() {
      if(this.newActivity.trim() == ""){
        this.$toast.warning("请输入活动名称！")
        return;
      }

      // 检查每日计划是否重复
      for(let i = 0; i < this.everydayTimePlanList.length; i++){
        // 要添加的Activity已经存在
        if(this.everydayTimePlanList[i].activity == this.newActivity){
          this.$toast.warning("此活动已经存在，请重新输入！")
          return;
        }
      }

      this.$http.post(this.BASE_API + "/time-plan/create", {"activity": this.newActivity}).then(response => {
        if(response.body.result) {
          this.showCreateDialog = false
          this.everydayTimePlanList.push({"id": response.body.data, "activity": this.newActivity, "status": 1})
          this.newActivity = ""
          this.$toast.success(response.body.message)
        } else {
          this.$toast.error(response.body.message)
        }
      })
    },

    /**
     * 删除时间计划
     */
    deleteTimePlan() {
      this.showDeleteDialog = false

      // 删除每日计划
      this.$http.post(this.BASE_API + "/time-plan/delete", {"id": this.everydayTimePlanList[this.willDeleteTimePlanIndex].id}).then(response => {
        if(response.body.result) {
          // 从数组中删除对应元素
          this.everydayTimePlanList.splice(this.willDeleteTimePlanIndex, 1)
          this.$toast.success(response.body.message)
        } else {
          this.$toast.error(response.body.message)
        }
      })
    },

    /**
     * 更新时间计划状态
     */
    updateTimePlanStatus(timePlanIndex) {
      let timePlan = this.everydayTimePlanList[timePlanIndex]

      // 更新时间计划状态
      this.$http.post(this.BASE_API + "/time-plan/update/status", {"id": timePlan.id}).then(response => {
        if(response.body.result) {
          this.everydayTimePlanList[timePlanIndex].status = this.everydayTimePlanList[timePlanIndex].status == 1 ? 0 : 1
        } else {
          this.$toast.error(response.body.message)
        }
      })
    }
  },
  mounted() {
    this.init()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.mu-item-action {
  min-width: 0px!important;
}
.tips {
  margin: 72px 6px 10px 6px;
  font-size: 16px;
  text-align:justify;
  padding: 12px 16px 2px 16px;
  line-height: 26px;
  letter-spacing: 1px;
}
.time-plan-list {
  margin: 0 6px 122px;
}
.list-item {
  margin: 0 20px;
  border-bottom: 1px solid #ccc;
}
.list-item:last-child {
  border: none;
}
.time-plan-switch {
  margin-right: 16px;
}
.add-time-plan-btn {
  position: fixed;
  bottom: 56px;
  left: 0;
  width: 100%;
  height: 66px;
  line-height: 66px;
  background-color: #fff;
  padding: 0 24px;
}
.activity-input {
  width: 100%;
}
.empty {
  width: 100%;
  height: 120px;
  line-height: 120px;
  text-align: center;
  font-size: 18px;
  letter-spacing: 4px;
}
</style>
