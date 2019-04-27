<template>
  <mu-container>
    <!-- TitleBar -->
    <mu-appbar style="width: 100%;" color="primary" title="数据分析">
      <mu-button icon slot="left" @click="back()">
        <mu-icon value="chevron_left"></mu-icon>
      </mu-button>
      <router-link to="/sign-in" slot="right" style="color: #fff;height: inherit;">
        <mu-button flat>筛选</mu-button>
      </router-link>
    </mu-appbar>
    <!-- Main Content -->
    <mu-container>
      <mu-card class="abstract">
        <mu-card-title :title="abstract.title" :sub-title="abstract.subTitle"></mu-card-title>
        <div class="abstract-item"><p>{{abstract.numActivity}}</p>工作数</div>
        <div class="abstract-item"><p>{{abstract.sumMinutes}}</p>时长(min)</div>
      </mu-card>
      <div class="charts">
        <h2 class="chart-title-proportion">7日内工作占比</h2>
        <div id="proportion" :style="{width: '100%', height: '300px'}"></div>
      </div>
      <div class="charts">
        <h2 class="chart-title-trendency">7日内每日走势</h2>
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
      // 要获取的数据类型:1 日报，2 周报，3 月报
      type: 1,
      abstract: {
        'type': 1,
        'title': '数据总览',
        'subTitle': '7日数据',
        'numActivity': 0,
        'sumMinutes': 0
      },
      // 阶段时间卡片按任务统计
      timeCardSumsByActivity: [],
      // 阶段时间卡片按日期统计
      timeCardSumsByDate: [],
      // 阶段总的分钟数
      minutesSum: 0
    }
  },
  methods: {
    /**
     * 获取数据
     */
    getData() {
      this.$http.get(this.BASE_API + '/get-analysis-data?type=' + this.abstract.type).then(response => {
        if (response.body.result) {
          this.calcMinutesSum(response.body.data)
          this.initTrendencyChart()
          this.initProportionChart()
        } else {
          this.$toast.error(response.body.message)
        }
      })
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
        for(let timeSpan of timeCard.timeSpans) {
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
      let dates = []
      let pieData = []
      for(let timeCard of this.timeCardSumsByActivity) {
        activities.push(timeCard.activity)
        dates.push(timeCard.createdAt)
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
    }
  },
  mounted() {
    this.getData()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.abstract {
  width: 100%;
  margin: 18px 0;
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
  color: #e6a23c;
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

</style>
