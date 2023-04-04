<!--
* @description 顶部工具栏
* @filename ToolBar.vue
* @author ROYIANS
* @date 2022/9/16 10:40
!-->
<template>
  <roy-header :height="'45px'" class="roy-designer-main__toolbar">
    <section class="roy-designer-main__toolbar_left">
      <div
        v-for="(tool, index) in toolbarLeftConfig"
        :key="index"
        :class="tool.disabled ? `roy-designer-main__toolbar__item--disabled` : ``"
        :title="tool.name"
        class="roy-designer-main__toolbar__item"
        @click="tool.event"
      >
        <i :class="tool.icon"></i>
      </div>
    </section>
    <section>
      <slot name="roy-designer-toolbar-slot"></slot>
    </section>
    <section class="roy-designer-main__toolbar_right">
      <div class="roy-designer-main__toolbar__setting">
        <span>{{ rectWidth }}/{{ rectHeight }}</span>
      </div>
      <div class="roy-designer-main__toolbar__zoom">
        <div class="roy-designer-main__toolbar__item" @click.stop.prevent="smallerScale">
          <i class="ri-zoom-out-line"></i>
        </div>
        <span>{{ scale100 }}%</span>
        <div class="roy-designer-main__toolbar__item" @click.stop.prevent="biggerScale">
          <i class="ri-zoom-in-line"></i>
        </div>
      </div>
    </section>
  </roy-header>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import { mapActions, mapState } from 'vuex'
import Big from 'big.js'

/**
 * 顶部工具栏
 */
export default {
  name: 'ToolBar',
  mixins: [commonMixin],
  components: {},
  props: {},
  data() {
    return {}
  },
  computed: {
    ...mapState({
      scale: (state) => state.printTemplateModule.rulerThings.scale,
      rectWidth: (state) => state.printTemplateModule.rulerThings.rectWidth,
      rectHeight: (state) => state.printTemplateModule.rulerThings.rectHeight,
      curComponent: (state) => state.printTemplateModule.curComponent,
      areaData: (state) => state.printTemplateModule.areaData
    }),
    scale100() {
      let currentScale = new Big(this.scale).div(new Big(5))
      let num100 = new Big(100)
      return currentScale.mul(num100).toNumber()
    },
    toolbarLeftConfig() {
      return [
        // {
        //   name: '撤销',
        //   icon: 'ri-arrow-go-back-fill',
        //   event: () => {
        //     this.$store.commit('printTemplateModule/undo')
        //   }
        // },
        // {
        //   name: '恢复',
        //   icon: 'ri-arrow-go-forward-fill',
        //   event: () => {
        //     this.$store.commit('printTemplateModule/redo')
        //   }
        // },
        {
          name: '显示/隐藏标尺',
          icon: 'ri-ruler-2-line',
          event: () => {
            this.toggleRuler()
          }
        },
        // {
        //   name: this.curComponent && this.curComponent.isLock ? '解锁' : '锁定',
        //   icon:
        //     this.curComponent && this.curComponent.isLock
        //       ? 'ri-lock-unlock-line'
        //       : 'ri-lock-2-line',
        //   disabled: !this.curComponent,
        //   event: () => {
        //     if (this.curComponent.isLock) {
        //       this.$store.commit('printTemplateModule/unlock')
        //     } else {
        //       this.$store.commit('printTemplateModule/lock')
        //     }
        //   }
        // },
        // {
        //   name: this.areaData.components.length ? '组合' : '拆分',
        //   icon: this.areaData.components.length
        //     ? 'ri-merge-cells-horizontal'
        //     : 'ri-split-cells-horizontal',
        //   disabled:
        //     (!this.curComponent ||
        //       this.curComponent.isLock ||
        //       this.curComponent.component !== 'RoyGroup') &&
        //     !this.areaData.components.length,
        //   event: () => {
        //     if (this.areaData.components.length) {
        //       // 组合
        //       this.$store.commit('printTemplateModule/compose')
        //       this.$store.commit('printTemplateModule/recordSnapshot')
        //     } else {
        //       // 拆分
        //       this.$store.commit('printTemplateModule/decompose')
        //       this.$store.commit('printTemplateModule/recordSnapshot')
        //     }
        //   }
        // },
        {
          name: '切换纸张方向',
          icon: 'iconfont icon-zhizhangfangxiang bold',
          event: () => {
            this.rotatePage()
          }
        }
      ]
    }
  },
  methods: {
    ...mapActions({
      setBiggerScale: 'printTemplateModule/rulerThings/setBiggerScale',
      setSmallerScale: 'printTemplateModule/rulerThings/setSmallerScale',
      reDrawRuler: 'printTemplateModule/rulerThings/reDrawRuler',
      setRect: 'printTemplateModule/rulerThings/setRect',
      rotateRect: 'printTemplateModule/rulerThings/rotateRect',
      toggleRuler: 'printTemplateModule/rulerThings/toggleRuler'
    }),
    smallerScale() {
      this.setSmallerScale()
      this.reDrawRuler()
    },
    biggerScale() {
      this.setBiggerScale()
      this.reDrawRuler()
    },
    rotatePage() {
      this.$store.commit('printTemplateModule/togglePageDirection')
      this.rotateRect()
      this.reDrawRuler()
    },
    initMounted() {}
  },
  created() {},
  mounted() {
    this.initMounted()
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
.roy-designer-main__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .roy-designer-main__toolbar_left {
    display: flex;
    justify-content: flex-start;

    .roy-designer-main__toolbar__divide {
      width: 1px;
      height: 18px;
      padding: 0 2px;
      border-right: 1px solid var(--roy-border-color-dark);
    }
  }

  .roy-designer-main__toolbar_right {
    display: flex;
    justify-content: flex-end;

    .roy-designer-main__toolbar__zoom,
    .roy-designer-main__toolbar__setting {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      position: relative;

      span {
        padding: 0 10px;
      }
    }
  }

  .roy-designer-main__toolbar__item {
    cursor: pointer;
    background: var(--roy-bg-color);
    display: grid;
    width: 18px;
    height: 18px;
    font-size: 10px;
    line-height: 18px;
    box-shadow: rgba(99, 99, 99, 0.2) 0 2px 8px 0;
    padding: 4px;
    text-align: center;
    border-radius: 4px;

    &.roy-designer-main__toolbar__item--disabled {
      opacity: 0.8;
      cursor: not-allowed;
      pointer-events: none;
    }

    & + .roy-designer-main__toolbar__item {
      margin-left: 5px;
    }

    &:hover {
      background: var(--roy-bg-color-page);
    }

    &:active {
      color: var(--roy-color-primary);
      box-shadow: rgba(99, 99, 99, 0.4) 0 2px 8px 0;
    }

    i {
      padding: 0;
      margin: 0;
      font-size: 14px;
    }
  }
}
</style>
