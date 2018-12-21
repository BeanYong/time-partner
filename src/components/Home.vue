<template>
  <mu-container>
    <!-- TitleBar -->
    <mu-appbar style="width: 100%;" color="primary">
      <mu-button icon slot="left">
        <mu-icon value="menu"></mu-icon>
      </mu-button>
      时间卡片
      <mu-button icon slot="right" @click="createTimeCard()">
        <mu-icon value="add"></mu-icon>
      </mu-button>
    </mu-appbar>
    <!-- Main Content -->
    <div style="width: 100%; background: #fff; padding: 18px;">
      <mu-card class="time-card" v-for="(timeCard, cardIndex) in timeCards" :key="cardIndex">
        <mu-button icon class="delete-time-card" @click="deleteTimeCard(cardIndex)">
          <mu-icon value="clear"></mu-icon>
        </mu-button>
        <mu-card-text>
          <mu-form :model="timeCard" class="mu-demo-form">
            <mu-form-item prop="activity">
              <mu-text-field placeholder='请输入活动名称，如‘学习英语’' v-model="timeCard.activity" @change="updateCardActivity(cardIndex)"></mu-text-field>
            </mu-form-item>
            <mu-flex class="flex-wrapper" align-items="center" v-for="(timeSpan, spanIndex) in timeCard.timeSpans" :key="spanIndex">
              <mu-flex class="flex-demo" justify-content="center" fill>
                <mu-date-input placeholder="开始时间" v-model="timeSpan.startTime" type="time" view-type="list" clock-type="24hr" @change="onDatePickerChange(cardIndex, spanIndex, 'start')"></mu-date-input>
              </mu-flex>
              <mu-flex class="flex-demo" justify-content="center" fill>
                <mu-date-input placeholder="结束时间" v-model="timeSpan.endTime" type="time" view-type="list" clock-type="24hr" @change="onDatePickerChange(cardIndex, spanIndex, 'end')"></mu-date-input>
              </mu-flex>
            </mu-flex>
            <mu-button full-width color="primary" @click="createTimeSpan(cardIndex)">
              添加时间段
              <mu-icon value="add_circle_outline" right></mu-icon>
            </mu-button>
          </mu-form>
        </mu-card-text>
      </mu-card>
    </div>
    <!-- <router-link to="/sign-up">
      <mu-button full-width color="primary">
        <mu-icon value="add" left></mu-icon>
        注册
      </mu-button>
    </router-link> -->
  </mu-container>
</template>
<script>
export default {
  name: 'Home',
  data() {
    return {
      // 时间卡片数组
      timeCards: []
    }
  },
  methods: {
    /**
     * 创建时间卡片
     */
    createTimeCard() {
      this.$http.get(this.BASE_API + '/create-time-card?user_id=' + this.userInfo.id).then(response => {
        if (response.body.result) {
          this.getTodayTimeCard()
          this.$toast.success(response.body.message)
        } else {
          this.$toast.error(response.body.message)
        }
      })
    },

    /**
     * 为时间卡片添加时间段
     */
    createTimeSpan(cardIndex) {
      this.timeCards[cardIndex].timeSpans.push({
        id: -1,
        startTime: 0,
        endTime: 0
      })
    },

    /**
     * 获取今天的时间卡片
     */
    getTodayTimeCard() {
      this.$http.get(this.BASE_API + '/get-today-time-card?user_id=' + this.userInfo.id).then(response => {
        if (response.body.result) {
          this.timeCards = response.body.data
        }
      })
    },

    /**
     * 事件选择器值发生变化的监听器，用于创建TimeCard的TimeSpan
     */
    onDatePickerChange(cardIndex, spanIndex, type) {
      let startTime = this.timeCards[cardIndex].timeSpans[spanIndex].startTime
      let endTime = this.timeCards[cardIndex].timeSpans[spanIndex].endTime
      let cardId = this.timeCards[cardIndex].id
      let spanId = this.timeCards[cardIndex].timeSpans[spanIndex].id

      if(startTime != 0 && endTime != 0) {
        if(endTime - startTime > 0) {
          if(spanId == -1) {
            // 创建
            this.$http.get(this.BASE_API + '/create-time-span?card_id=' + cardId + '&start_time=' + startTime.getTime() + '&end_time=' + endTime.getTime()).then(response => {
              if (response.body.result) {
                this.getTodayTimeCard()
                this.$toast.success(response.body.message)
              } else {
                this.$toast.error(response.body.message)
              }
            })
          } else {
            //更新
            this.$http.get(this.BASE_API + '/update-time-span?card_id=' + cardId + '&span_id=' + spanId + '&start_time=' + startTime.getTime() + '&end_time=' + endTime.getTime()).then(response => {
              if (response.body.result) {
                this.getTodayTimeCard()
                this.$toast.success(response.body.message)
              } else {
                this.$toast.error(response.body.message)
              }
            })
          }
          
        } else {
          this.$toast.error('结束时间不能小于开始时间，请重新输入')
        }
      }
    },

    /**
     * 更新TimeCard的activity
     */
    updateCardActivity(cardIndex) {
      let cardId = this.timeCards[cardIndex].id
      let activity = this.timeCards[cardIndex].activity.trim()

      if(activity.length > 0){
        this.$http.get(this.BASE_API + '/update-card-activity?card_id=' + cardId + '&activity=' + activity).then(response => {
          if (response.body.result) {
            this.$toast.success(response.body.message)
          } else {
            this.$toast.error(response.body.message)
          }
        })
      }
    },

    /**
     * 删除时间卡片
     */
    deleteTimeCard(cardIndex) {
      let cardId = this.timeCards[cardIndex].id

      this.$http.get(this.BASE_API + '/delete-time-card?card_id=' + cardId).then(response => {
        if (response.body.result) {
          this.getTodayTimeCard()
          this.$toast.success(response.body.message)
        } else {
          this.$toast.error(response.body.message)
        }
      })
    }
  },
  mounted() {
    this.getTodayTimeCard()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.flex-demo {
  width: 0px;
  text-align: center;
}
.time-card {
  position: relative;
  width: 100%;
  margin: 24px auto;
}
.delete-time-card {
  width: 28px;
  height: 28px;
  position: absolute;
  top: -14px;
  right: -14px;
  border: 1px solid #ccc;
  background: #fff;
}
</style>
