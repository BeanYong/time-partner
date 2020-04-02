<template>
  <mu-container>
    <!-- TitleBar -->
    <mu-appbar style="width: 100%;position: fixed;top: 0;left: 0;" color="primary" title="时间卡片">
      <mu-button icon slot="left" @click="showSelectDate()">
        <mu-icon value="history"></mu-icon>
      </mu-button>
      <mu-button icon slot="right" @click="createTimeCard()">
        <mu-icon value="add"></mu-icon>
      </mu-button>
    </mu-appbar>
    <!-- Main Content -->
    <div style="width: 100%; background: #fff; padding: 72px 12px 12px;">
      <div class="card-header">
        <img src="https://now.beanyon.site/avatar/default-avatar.jpg">
        <div class="today-info-box">
          <span class="today-info-date">{{today.date}}</span>
          <span class="card-header-panel" :z-depth="0">
            {{today.minutesSum || 0}} min
          </span>
        </div>
        <p class="today-info-slogan">{{today.slogan}}</p>
      </div>
      <mu-card class="time-card" v-for="(timeCard, cardIndex) in timeCards" :key="cardIndex">
        <mu-icon value="clear" class="delete-time-card" @click="deleteTimeCard(cardIndex)"></mu-icon>
        <mu-card-text>
          <mu-form :model="timeCard" class="mu-demo-form">
            <mu-form-item prop="activity">
              <mu-text-field class="time-card-title" placeholder='请输入活动名称，如‘学习英语’' v-model="timeCard.activity" @change="updateCardActivity(cardIndex)"></mu-text-field>
            </mu-form-item>
            <mu-flex class="flex-wrapper" align-items="center" v-for="(timeSpan, spanIndex) in timeCard.timeSpanList" :key="spanIndex">
              <mu-flex class="flex-demo" justify-content="center" fill>
                <mu-date-input placeholder="开始时间" v-model="timeSpan.startTime" type="time" view-type="list" clock-type="24hr" @change="onDatePickerChange(cardIndex, spanIndex, 0)"></mu-date-input>
              </mu-flex>
              <mu-flex class="flex-demo" justify-content="center" fill>
                <mu-date-input placeholder="结束时间" v-model="timeSpan.endTime" type="time" view-type="list" clock-type="24hr" @change="onDatePickerChange(cardIndex, spanIndex, 1)"></mu-date-input>
              </mu-flex>
            </mu-flex>
            <mu-flex class="time-card-sum">
              小计： {{timeCard.timeCardSum || 0}} min
            </mu-flex>
            <mu-button full-width color="primary" @click="createTimeSpan(cardIndex)">
              <mu-icon value="add" left></mu-icon>
              添加时间段
            </mu-button>
          </mu-form>
        </mu-card-text>
      </mu-card>
    </div>
    <!-- 半透明mask -->
    <mu-container v-if="showDateSelecter" class="date-selector-mask">
    </mu-container>
    <mu-container v-if="showDateSelecter">
      <mu-flex justify-content="center" align-items="center" class="date-selector">
        <mu-paper :z-depth="1">
          <mu-date-picker :date.sync="date" :change="onDateChange(date)"></mu-date-picker>
        </mu-paper>
        <mu-button icon @click="hideSelectDate()" class="date-selector-closer">
          <mu-icon value="highlight_off"></mu-icon>
        </mu-button>
      </mu-flex>
    </mu-container>
  </mu-container>
</template>
<script>
export default {
  name: 'Home',
  data() {
    return {
      // 今日数据
      today: {
        date: '这里是今天的日期',
        slogan: '这是我们在一起的第几天',
        minutesSum: 0
      },
      // 时间卡片数组
      timeCards: [],
      // 显示日期选择对话框
      showDateSelecter: false,
      // 用户选择的日期
      date: undefined
    }
  },
  methods: {
    /**
     * 初始化
     */
    init() {
      this.today.date = new Date().format('yyyy-MM-dd')
      this.getTodayTimeCard()
      this.getUserLoginTimes()
    },

    /**
     * 获取用户登录过的天数
     */
    getUserLoginTimes() {
      this.$http.get(this.BASE_API + '/user/login-day-count').then(response => {
        if (response.body.result) {
          response.body.data = response.body.data == 0 ? 1 : response.body.data
          this.today.slogan = '这是我们在一起的第 ' + response.body.data + ' 天'
        }
      })
    },

    /**
     * 更新分钟和
     */
    updateMinutesSum() {
      let sum = 0
      for(let timeCard of this.timeCards) {
        // 时间卡片的总时间
        let timeCardSum = 0

        for(let timeSpan of timeCard.timeSpanList) {
          if(timeSpan.startTime && timeSpan.endTime) {
            let span = timeSpan.endTime - timeSpan.startTime
            let spanSum = span / 1000 / 60
            // 时间卡片的总时间
            timeCardSum += Math.ceil(spanSum)
            // 今日总时间
            sum += spanSum
          }
        }

        timeCard.timeCardSum = timeCardSum
      }
      this.today.minutesSum = Math.ceil(sum)
    },

    /**
     * 显示选择日期对话框
     */
    showSelectDate() {
      this.showDateSelecter = true
    },

    /**
     * 隐藏选择日期对话框
     */
    hideSelectDate() {
      this.showDateSelecter = false
    },

    /**
     * 日期改变回调事件
     */
    onDateChange(d) {
      if(d != undefined) {
        let day = this.date.getDate()
        let month = this.date.getMonth() + 1
        let year = this.date.getFullYear()

        month = month < 10 ? '0'+month : month
        day = day < 10 ? '0'+day : day

        let d = year + '-' + month + '-' + day
        // 向服务器请求对应日期的数据
        this.$http.get(this.BASE_API + '/time-card/list?&date=' + d).then(response => {
          if (response.body.result) {
            this.timeCards = response.body.data
            this.updateMinutesSum()
            this.showDateSelecter = false
            this.date = undefined
            this.today.date = d
          } else {
            this.$toast.warning(response.body.message)
          }
        })
      }
    },

    /**
     * 创建时间卡片
     */
    createTimeCard() {
      this.$http.post(this.BASE_API + '/time-card/create').then(response => {
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
      this.timeCards[cardIndex].timeSpanList.push({
        id: -1,
        startTime: 0,
        endTime: 0
      })
    },

    /**
     * 获取今天的时间卡片
     */
    getTodayTimeCard() {
      this.$http.get(this.BASE_API + '/time-card/list').then(response => {
        if (response.body.result) {
          this.timeCards = response.body.data
          this.updateMinutesSum()
        }
      })
    },

    /**
     * 事件选择器值发生变化的监听器，用于创建TimeCard的TimeSpan
     */
    onDatePickerChange(cardIndex, spanIndex, type) {
      let startTime = this.timeCards[cardIndex].timeSpanList[spanIndex].startTime
      let endTime = this.timeCards[cardIndex].timeSpanList[spanIndex].endTime
      let cardId = this.timeCards[cardIndex].id
      let spanId = this.timeCards[cardIndex].timeSpanList[spanIndex].id

      if(typeof startTime == 'object') {
        startTime = startTime.getTime()
      }

      if(typeof endTime == 'object') {
        endTime = endTime.getTime()
      }
      
      if(endTime && startTime && parseInt((endTime - startTime)/1000) <= 0) {
        this.$toast.error('开始时间必须小于结束时间，请重新输入')
        this.timeCards[cardIndex].timeSpanList[spanIndex].endTime = 0
        return
      }

      if(spanId == -1) {
        // 不存在，需要创建
        if(startTime) {
          // 使用开始时间创建
          this.$http.post(this.BASE_API + '/time-span/create', {'cardId': cardId, 'startTime': startTime}).then(response => {
            if (response.body.result) {
              // 更新时间段id
              this.timeCards[cardIndex].timeSpanList[spanIndex].id = response.body.data
              this.$toast.success(response.body.message)
            } else {
              this.$toast.error(response.body.message)
            }
          })
        } else {
          // 开始时间为空，无法创建
          this.$toast.error('请先输入开始时间')
          this.timeCards[cardIndex].timeSpanList[spanIndex].endTime = 0
          return
        }
      } else {
        // 已经存在，更新
        if(startTime && type == 0) {
          // 开始时间不空，并且不是string类型
          if(endTime == 0 || (endTime - startTime >= 0)) {
            // 结束时间大于开始时间，更新
            this.$http.post(this.BASE_API + '/time-span/update-start-time', {'spanId': spanId, 'startTime': startTime}).then(response => {
              if (response.body.result) {
                this.getTodayTimeCard()
                this.$toast.success(response.body.message)
              } else {
                this.$toast.error(response.body.message)
              }
            })
          } else {
            // 结束时间不大于开始时间，无法更新
            this.$toast.error('开始时间必须小于结束时间，请重新输入')
            this.timeCards[cardIndex].timeSpanList[spanIndex].startTime = 0
          }
        }
        
        if(endTime && type == 1) {
          // 结束时间不空，并且不是string类型
          if(endTime - startTime >= 0) {
            // 结束时间大于开始时间，更新
            this.$http.post(this.BASE_API + '/time-span/update-end-time', {'spanId': spanId, 'endTime': endTime}).then(response => {
              if (response.body.result) {
                this.updateMinutesSum()
                this.$toast.success(response.body.message)
              } else {
                this.$toast.error(response.body.message)
              }
            })
          } else {
            // 结束时间不大于开始时间，无法更新
            this.$toast.error('开始时间必须小于结束时间，请重新输入')
            this.timeCards[cardIndex].timeSpanList[spanIndex].endTime = 0
          }
        }
      }
    },

    /**
     * 更新TimeCard的activity
     */
    updateCardActivity(cardIndex) {
      let cardId = this.timeCards[cardIndex].id
      let activity = this.timeCards[cardIndex].activity.trim()

      if(activity.length > 0 && activity.length <= 20){
        this.$http.post(this.BASE_API + '/time-card/update-activity', {'cardId': cardId, 'activity': activity}).then(response => {
          if (response.body.result) {
            this.$toast.success(response.body.message)
          } else {
            this.$toast.error(response.body.message)
          }
        })
      } else {
        this.$toast.error("活动名称长度必须在1~20个字符之间")
      }
    },

    /**
     * 删除时间卡片
     */
    deleteTimeCard(cardIndex) {
      let cardId = this.timeCards[cardIndex].id

      this.$http.post(this.BASE_API + '/time-card/delete', {'cardId': cardId}).then(response => {
        if (response.body.result) {
          if (this.timeCards.length > 1){
            let newTimeCards = []

            for(let timeCard of this.timeCards) {
              if(timeCard.id != cardId){
                newTimeCards.push(timeCard)
              }
            }

            this.timeCards = newTimeCards
          } else {
            this.timeCards = []
            this.today.minutesSum = 0
          }
          this.$toast.success(response.body.message)
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
.card-header {
  width: 100%;
  height: 100px;
  box-shadow: 0px 1px 1px 2px #f0f0f0;
  border-radius: 4px;
  position: relative;
}
.card-header img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  position: absolute;
  top: 20px;
  left: 16px;
}
.today-info-box {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 100%;
  height: 30px;
  line-height: 30px;
  margin: 0;
  padding-left: 84px;
  text-align: right;
}
.today-info-date {
  font-size: 18px;
  color: #333;
  margin-right: 32px;
}
.card-header-panel {
  text-align: right;
  font-size: 16px;
  font-weight: 600;
  font-style: italic;
  font-size: 18px;
  color: #333;
}
.today-info-slogan {
  font-size: 16px;
  position: absolute;
  bottom: 20px;
  right: 20px;
  margin: 0;
  color: rgba(0,0,0,.54);
}
.time-card {
  position: relative;
  width: 100%;
  margin: 16px auto;
}
.time-card-title{
  font-size: 18px;
  color: #333;
  font-style: italic;
}
.time-card-sum {
  font-size: 18px;
  float: right;
  margin-bottom: 26px;
}
.delete-time-card {
  width: 26px;
  height: 26px;
  position: absolute;
  top: -8px;
  right: -13px;
  border: 1px solid #ccc;
  border-radius: 50%;
  background: #fff;
}
.flex-demo {
  width: 0px;
  text-align: center;
}
.date-selector-mask {
  position: fixed;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: #000;
  opacity: 0.7;
  z-index: 1;
}
.date-selector {
  position: fixed;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  display: flex;
  flex-direction: row;
}
.date-selector-closer {
  margin: 0 auto; 
  position: fixed; 
  bottom: 4vh;
  color: #fff;
  width: 72px;
  height: 72px;
}
.date-selector-closer i {
  font-size: 42px;
}
</style>
