<!--
* @description 坐标
* @filename EditorCoordinate.vue
* @author ROYIANS
* @date 2022/10/21 16:44
!-->
<template>
  <div
    v-show="showCoordinate"
    class="roy-editor-coordinate"
    :style="coordinateStyle"
  >
    {{ left }},{{ top }}
  </div>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import eventBus from '@/utils/eventBus'
import { mapState } from 'vuex'
import Big from 'big.js'

/**
 * 坐标
 */
export default {
  name: 'EditorCoordinate',
  mixins: [commonMixin],
  components: {},
  props: {},
  computed: {
    ...mapState({
      curComponent: (state) => state.printTemplateModule.curComponent
    }),
    coordinateStyle() {
      return `left: ${this.x + 10}px; top: ${this.y + 10}px`
    }
  },
  data() {
    return {
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      showCoordinate: false
    }
  },
  methods: {
    initMounted() {
      // 监听元素移动和不移动的事件
      eventBus.$on('move', (isDownward, isRightward, curX, curY) => {
        this.showCoordinate = true
        this.x = curX
        this.y = curY
        this.left = new Big(this.curComponent.style.left)
          .div(new Big(5))
          .toNumber()
        this.top = new Big(this.curComponent.style.top)
          .div(new Big(5))
          .toNumber()
      })

      eventBus.$on('unmove', () => {
        this.showCoordinate = false
      })
    }
  },
  created() {},
  mounted() {
    this.initMounted()
  },
  watch: {}
}
</script>

<style lang="scss">
.roy-editor-coordinate {
  height: 14px;
  font-size: 10px;
  line-height: 14px;
  text-align: center;
  padding: 3px 6px;
  background: var(--roy-color-primary);
  color: #ffffff;
  position: fixed;
  border-radius: 2px;
  transform: scale(0.9);
}
</style>
