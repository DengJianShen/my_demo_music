<template>
  <div id="app">
    <m-header></m-header>
    <Tab></Tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <!--全局播放组件-->
    <player></player>
  </div>
</template>

<script>
import MHeader from 'components/m-header/m-header'
import Player from 'components/player/player'
import Tab from 'components/tab/tab'
export default {
  components: {
    MHeader,
    Tab,
    Player
  }
}
</script>

<style lang="stylus">
@import "common/stylus/variable.styl"
#app
  color: $color-theme
</style>
