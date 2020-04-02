<template>
  <mu-container>
    <!-- TitleBar -->
    <mu-appbar style="width: 100%; position: fixed; top: 0; left: 0;" color="primary" title="数据分析">
    </mu-appbar>

    <!-- Main Content -->
    <mu-container>
      <mu-card class="abstract">
        <!-- 时间选择区域 -->
        <mu-flex class="flex-wrapper" align-items="center">
          <mu-flex class="time-input" justify-content="center" fill>
            <mu-date-input placeholder="开始日期" v-model="startDate" type="date" container="dialog" @change="onDatePickerChange()"></mu-date-input>
          </mu-flex>
          至
          <mu-flex class="time-input" justify-content="center" fill>
            <mu-date-input placeholder="结束日期" v-model="endDate" type="date" container="dialog" @change="onDatePickerChange()"></mu-date-input>
          </mu-flex>
        </mu-flex>
        <div class="abstract-item"><p class="orange">{{abstract.numActivity}}</p>工作数（项）</div>
        <div class="abstract-item"><p class="red">{{abstract.sumMinutes}}</p>总耗时（分钟）</div>
      </mu-card>
      <div class="charts">
        <h2 class="chart-title-proportion">工作类型占比</h2>
        <div id="proportion" :style="{width: '100%', height: '300px'}"></div>
      </div>
      <div class="charts">
        <h2 class="chart-title-trendency">每日工时走势</h2>
        <div id="trendency" :style="{width: '100%', height: '300px'}"></div>
      </div>
    </mu-container>
  </mu-container>
</template>
<script>

export default {
  name: 'Analysis',
  data() {
    return {
      // 要查询的起始时间
      startDate: "",
      // 要查询的结束时间
      endDate: "",
      abstract: {
        'title': '数据总览',
        'numActivity': 0,
        'sumMinutes': 0
      },
      // 阶段时间卡片按任务统计
      timeCardSumsByActivity: [],
      // 阶段时间卡片按日期统计
      timeCardSumsByDate: []
    }
  },
  methods: {
    /**
     * 获取数据
     */
    getData() {
      // 开始日期或结束日期为空，默认获取七天内数据
      if(!this.startDate || !this.endDate){
        let endTime = new Date()
        let startTime = new Date()
        startTime.setDate(endTime.getDate()-7)

        this.startDate = this.getDateStr(startTime)
        this.endDate = this.getDateStr(endTime)
      }

      this.$http.post(this.BASE_API + '/analysis/data', {"startDate": this.startDate, "endDate": this.endDate}).then(response => {
        if (response.body.result) {
          this.init()
          this.calcMinutesSum(response.body.data)
          this.initTrendencyChart()
          this.initProportionChart()
        } else {
          this.$toast.error(response.body.message)
        }
      })
    },

    /**
     * 重置所有数据
     */
    init() {
      this.timeCardSumsByActivity = []
      this.timeCardSumsByDate = []
      this.abstract = {
        'title': '数据总览',
        'numActivity': 0,
        'sumMinutes': 0
      }
      this.showFilter = false
    },

    /**
     * 计算每天的分钟和
     *
     * @param timeCards 获取到的时间卡片
     */
    calcMinutesSum(timeCards) {
      for(let timeCard of timeCards) {
        // 时间卡片的总时间
        let timeCardSum = 0

        // 计算每张时间卡片的总时间
        for(let timeSpan of timeCard.timeSpanList) {
          if(timeSpan.startTime && timeSpan.endTime) {
            let span = timeSpan.endTime - timeSpan.startTime
            let spanSum = span / 1000 / 60
            // 时间卡片的总时间
            timeCardSum += Math.ceil(spanSum)
          }
        }
        timeCard.timeCardSum = timeCardSum
        // 计算总的分钟数
        this.abstract.sumMinutes += timeCardSum

        // 计算同种任务在阶段内的总时间
        if(this.timeCardSumsByActivity.length == 0) {
          this.timeCardSumsByActivity.push(timeCard)
        } else {
          let exist = false
          for(let timeCardRes of this.timeCardSumsByActivity) {
            if(timeCardRes.activity == timeCard.activity) {
              exist = true
              timeCardRes.timeCardSum += timeCard.timeCardSum
            }
          }

          if(!exist) {
            this.timeCardSumsByActivity.push(timeCard)
          }
        }
        this.abstract.numActivity = this.timeCardSumsByActivity.length

        // 每一天的总时间
        let todaySum = 0
        timeCard.todaySum = todaySum

        // 计算每一天的总时间
        if(this.timeCardSumsByDate.length == 0) {
          let date = new Date(timeCard.createdAt)
          let daySum = {
            'date': (date.getMonth()+1) + "-" + date.getDate(),
            'minutes': timeCard.timeCardSum
          }
          this.timeCardSumsByDate.push(daySum)
        } else {
          let exist = false
          for(let timeCardRes of this.timeCardSumsByDate) {
            let dates = timeCardRes.date.split("-")
            let dateAnalysisMonth = dates[0]
            let dateAnalysisDay = dates[1]
            let dateCard = new Date(timeCard.createdAt)
            if(parseInt(dateAnalysisMonth)-1 == dateCard.getMonth() && parseInt(dateAnalysisDay) == dateCard.getDate()){
              exist = true
              timeCardRes.minutes += timeCard.timeCardSum
            }
          }

          if(!exist) {
            let date = new Date(timeCard.createdAt)
            let daySum = {
              'date': (date.getMonth()+1) + "-" + date.getDate(),
              'minutes': timeCard.timeCardSum
            }
            this.timeCardSumsByDate.push(daySum)
          }
        }
      }
    },

    /**
     * 初始化趋势折线图
     */
    initTrendencyChart() {
      // 抽取要显示的数据
      let dates = []
      let lineData = []

      for(let timeCard of this.timeCardSumsByDate) {
        dates.push(timeCard.date)
        lineData.push(timeCard.minutes)
      }

      // 基于准备好的dom，初始化echarts实例
      var trendencyChart = this.echarts.init(document.getElementById('trendency'));
      var trendencyOption = {
        xAxis: {
            type: 'category',
            data: dates
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: lineData,
            type: 'line'
        }]
      };

      // 绘制图表
      trendencyChart.setOption(trendencyOption);
    },

    /**
     * 初始化饼图
     */
    initProportionChart() {
      // 抽取要显示的数据
      let activities = []
      let pieData = []
      for(let timeCard of this.timeCardSumsByActivity) {
        activities.push(timeCard.activity)
        pieData.push({'value': timeCard.timeCardSum, 'name': timeCard.activity})
      }

      // 基于准备好的dom，初始化echarts实例
      var trendencyChart = this.echarts.init(document.getElementById('proportion'));

      let trendencyOption = {
          tooltip: {
              trigger: 'item',
              formatter: "{a} <br/>{b}: {c} ({d}%)"
          },
          legend: {
              orient: 'vertical',
              x: 'left',
              data: activities
          },
          series: [
              {
                  name:'时间卡片（分钟）',
                  type:'pie',
                  radius: ['50%', '70%'],
                  avoidLabelOverlap: false,
                  label: {
                      normal: {
                          show: false,
                          position: 'center'
                      },
                      emphasis: {
                          show: true,
                          textStyle: {
                              fontSize: '30',
                              fontWeight: 'bold'
                          }
                      }
                  },
                  labelLine: {
                      normal: {
                          show: false
                      }
                  },
                  data: pieData
              }
          ]
      };

      // 绘制图表
      trendencyChart.setOption(trendencyOption);
    },

    /**
     * 事件选择器值发生变化的监听器，用于确定筛选日期
     */
    onDatePickerChange() {
      if(typeof this.startDate == 'object') {
        this.startDate = this.getDateStr(this.startDate)
      }

      if(typeof this.endDate == 'object') {
        this.endDate = this.getDateStr(this.endDate)
      }

      if(this.startDate && this.endDate && this.getDateObj(this.startDate).getTime() < this.getDateObj(this.endDate).getTime()) {
        // 按照给定日期区间获取数据
        this.getData()
      } else {
        this.$toast.error('开始日期必须小于结束日期，请重新输入')
      }
    },

    /**
     * 根据日期字符串获取Date对象
     */
    getDateObj(dateStr) {
      let datePartArr = dateStr.split("-")
      return new Date(datePartArr[0], datePartArr[1], datePartArr[2])
    },

    /**
     * 根据Date对象获取yyyy-MM-dd格式字符串
     */
    getDateStr(date) {
      let year = date.getFullYear()
      let month = date.getMonth() + 1
      let day = date.getDate()

      month = month < 10 ? "0"+month : month
      day = day < 10 ? "0"+day : day

      return year + "-" + month + "-" + day
    },

    /**
     * 将开始时间和结束时间的input居中显示
     */
    centerInputs(){
      let timeInputs = document.getElementsByTagName("input")
      timeInputs[0].style.textAlign="center"
      timeInputs[1].style.textAlign="center"
    }
  },
  mounted() {
    this.centerInputs()
    this.getData()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.mu-transition-row {
  width: 100%;
  margin: 10px 0;
  overflow: hidden;
}

.mu-transition-box {
  width: 100%;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.flex-wrapper{
  width: 90%;
  margin: 0 auto;
}

input {
  text-align: center;
}

.abstract {
  width: 100%;
  margin-top: 72px;
}

.abstract-item {
  width: 50%;
  display: inline-block;
  margin-bottom: 20px;
  font-size: 16px;
  line-height: 14px;
  letter-spacing: 2px;
}

.abstract-item p {
  font-size: 32px;
  font-weight: bold;
  margin: 24px 0;
}

.charts:nth-child(1) {
  margin-top: 30px;
}

.chart-title-proportion {
  margin: 40px;
}

.chart-title-trendency {
  margin: 0;
}

.mu-input {
  width: auto;
  margin: 0;
  font-size: 18px;
  height: 60px;
}

</style>
