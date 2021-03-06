<template>
    <Scroll class="listview" 
            :data="data" 
            :listenScroll="listenScroll" 
            :probeType="probeType" 
            @scroll="scroll" 
            ref="listview">
        <ul>
            <li v-for="group in data" class="list-group" ref="listGroup">
                <h2 class="list-group-title">{{group.title}}</h2>
                <ul>
                    <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item">
                        <img class="avatar" v-lazy="item.avatar">
                        <span class="name">{{item.name}}</span>
                    </li>
                </ul>
            </li>
        </ul>
        <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
            <ul>
                <li v-for="(item,index) in shortcutList" class="item" :class="{'current':currentIndex==index}" :data-index="index">{{item}}</li>
            </ul>
        </div>
        <div class="list-fixed" ref="fixed" v-show="fixedTitle">
            <div class="fixed-title">{{fixedTitle}} </div>
        </div>
    </Scroll>
</template>

<script>
import Scroll from 'base/scroll/scroll'
import { getData } from 'common/js/dom'

const TITLE_HEIGHT = 30
const ANCHOR_HEIGHT = 18

export default {
    props: {
        data: {
            type: Array,
            default: []
        }
    },
    data() {
        return {
            // 当前列表的 scrollY
            scrollY: -1,
            // 当前列表所在的对应索引
            currentIndex: 0,
            diff: -1
        }
    },
    // 定义不被监控的 data
    created() {
        // 当前所选中的歌手信息
        this.touch = {}
        // 是否监听滚动
        this.listenScroll = true
        // 列表对应的滚动高度数组
        this.listHeight = []
        // better-scroll 参数 除了实时派发scroll事件，在swipe的情况下仍然能实时派发scroll事件
        this.probeType = 3
    },
    computed: {
        // 右侧栏的文字
        shortcutList() {
            // map 与 forEach 类似，区别在于有 map 能 return 值
            return this.data.map((group) => {
                // substr(0, 1) 提取第一个字符
                return group.title.substr(0, 1)
            })
        },
        // fixed栏的文字
        fixedTitle() {
            // 向上滑到顶部 0 以上时显示空
            if (this.scrollY > 0) {
                return ''
            }
            return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
        }
    },
    methods: {
        // 点击右侧栏滚动到对应的 title
        onShortcutTouchStart(e) {
            // 获取所点击的索引
            let anchorIndex = getData(e.target, 'index')
            let firstTouch = e.touches[0]
            // 设置要滚动到的索引
            this.touch.anchorIndex = anchorIndex
            // 设置 y1 为浏览器顶部到该触摸的 Y 轴距离
            this.touch.y1 = firstTouch.pageY
            this._scrollTo(anchorIndex);
        },
        // 移动右侧栏滚动到对应的title
        onShortcutTouchMove(e) {
            let firstTouch = e.touches[0]
            // 设置 y2 为浏览器顶部到该触摸的新的 Y 轴距离
            this.touch.y2 = firstTouch.pageY
            // (touchmove获得的值 - touchstart获得的值)/每个索引的高度 = 偏移索引
            let delta = Math.floor((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT)
            // touchstart的索引 + 偏移索引 = 结果索引
            let anchorIndex = parseInt(this.touch.anchorIndex) + delta
            this._scrollTo(anchorIndex);
        },
        _scrollTo(index) {
            // 索引不存在或者索引为0的时候 return 不操作
            if (!index && index != 0) {
                return
            }
            // 索引小于 0 时 默认为 0
            if (index < 0) {
                index = 0
            } else if (index > this.listHeight.length - 2) {
                index = this.listHeight.length - 2
            }
            // 跳转到指定索引的位置
            this.scrollY = -this.listHeight[index]
            this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
        },
        // 滚动时改变
        scroll(pos) {
            this.scrollY = pos.y
        },
        // 计算各个滚动高度 push 进数组
        _calculateHeight() {
            this.listHeight = []
            const list = this.$refs.listGroup
            let height = 0
            this.listHeight.push(height)
            for (let i = 0; i < list.length; i++) {
                let item = list[i]
                height += item.clientHeight
                this.listHeight.push(height)
            }
        },
        selectItem(item) {
            this.$emit('select', item)
        }
    },
    watch: {
        data() {
            setTimeout(() => {
                this._calculateHeight()
            }, 20)
        },
        scrollY(newY) {
            const listHeight = this.listHeight
            // 当滚动到顶部或更多时，索引是 0
            if (newY > 0) {
                this.currentIndex = 0
                return
            }
            // 在中间部分滚动，索引是 i
            for (let i = 0; i < listHeight.length - 1; i++) {
                let height1 = listHeight[i]
                let height2 = listHeight[i + 1]
                if (-newY >= height1 && -newY < height2) {
                    this.currentIndex = i
                    this.diff = height2 + newY
                    return
                }
            }
            // 当滚动到底部，且-newY大于最后一个元素的上限
            this.currentIndex = listHeight.length - 2
        },
        diff(newVal) {
            let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
            if (this.fixedTop == fixedTop) {
                return
            }
            this.fixedTop = fixedTop
            this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
        }
    },
    components: {
        Scroll
    }
}
</script>

<style scoped lang="stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>

