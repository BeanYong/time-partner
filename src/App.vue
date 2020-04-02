<template>
  <div id="app">
    <!-- 路由匹配到的组件将渲染在这里 -->
    <router-view class="router-views"></router-view>
    <mu-bottom-nav class="bottom-nav-bar">
      <mu-bottom-nav-item title="时间卡片" icon="alarm_on" to="/home"></mu-bottom-nav-item>
      <mu-bottom-nav-item title="统计分析" icon="show_chart" to="/analysis"></mu-bottom-nav-item>
      <mu-bottom-nav-item title="个人中心" icon="person_outline" to="/mine"></mu-bottom-nav-item>
    </mu-bottom-nav>
  </div>
</template>

<script>
  
export default {
  name: 'app',
  components: {
  }
}
</script>

<style>

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.router-views {
  margin-bottom: 60px;
}

.bottom-nav-bar {
  width: 100%;
  position: fixed;
  bottom: 0;
}

.orange {
  color: #e6a23c;
}
.red {
  color: #f56c6c;
}

</style>
