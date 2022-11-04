<template>
  <div class="roy-mark-line">
    <div
      v-for="line in lines"
      v-show="lineStatus[line] || false"
      :key="line"
      :ref="line"
      class="roy-mark-line__line"
      :class="
        line.includes('x') ? 'roy-mark-line--xline' : 'roy-mark-line--yline'
      "
    ></div>
  </div>
</template>

<script>
import eventBus from '@/utils/eventBus'
import { mapState } from 'vuex'
import { getComponentRotatedStyle } from '@/utils/style-util.js'

export default {
  name: 'EditorLine',
  data() {
    return {
      lines: ['xt', 'xc', 'xb', 'yl', 'yc', 'yr'], // 分别对应三条横线和三条竖线
      diff: 3, // 相距 dff 像素将自动吸附
      lineStatus: {
        xt: false,
        xc: false,
        xb: false,
        yl: false,
        yc: false,
        yr: false
      }
    }
  },
  computed: {
    ...mapState({
      componentData: (state) => state.printTemplateModule.componentData,
      curComponent: (state) => state.printTemplateModule.curComponent
    })
  },
  mounted() {
    // 监听元素移动和不移动的事件
    eventBus.$on('move', (isDownward, isRightward) => {
      this.showLine(isDownward, isRightward)
    })

    eventBus.$on('unmove', () => {
      this.hideLine()
    })
  },
  methods: {
    hideLine() {
      Object.keys(this.lineStatus).forEach((line) => {
        this.lineStatus[line] = false
      })
    },

    showLine(isDownward, isRightward) {
      const lines = this.$refs
      const components = this.componentData || []
      const curComponentStyle = getComponentRotatedStyle(
        this.curComponent?.style || {}
      )
      const curComponentHalfWidth = curComponentStyle.width / 2
      const curComponentHalfHeight = curComponentStyle.height / 2

      this.hideLine()
      components.forEach((component) => {
        if (component === this.curComponent) return
        const componentStyle = getComponentRotatedStyle(component.style)
        const { top, left, bottom, right } = componentStyle
        const componentHalfWidth = componentStyle.width / 2
        const componentHalfHeight = componentStyle.height / 2

        const conditions = {
          top: [
            {
              isNearly: this.isNearly(curComponentStyle.top, top),
              lineNode: lines.xt[0], // xt
              line: 'xt',
              dragShift: top,
              lineShift: top
            },
            {
              isNearly: this.isNearly(curComponentStyle.bottom, top),
              lineNode: lines.xt[0], // xt
              line: 'xt',
              dragShift: top - curComponentStyle.height,
              lineShift: top
            },
            {
              // 组件与拖拽节点的中间是否对齐
              isNearly: this.isNearly(
                curComponentStyle.top + curComponentHalfHeight,
                top + componentHalfHeight
              ),
              lineNode: lines.xc[0], // xc
              line: 'xc',
              dragShift: top + componentHalfHeight - curComponentHalfHeight,
              lineShift: top + componentHalfHeight
            },
            {
              isNearly: this.isNearly(curComponentStyle.top, bottom),
              lineNode: lines.xb[0], // xb
              line: 'xb',
              dragShift: bottom,
              lineShift: bottom
            },
            {
              isNearly: this.isNearly(curComponentStyle.bottom, bottom),
              lineNode: lines.xb[0], // xb
              line: 'xb',
              dragShift: bottom - curComponentStyle.height,
              lineShift: bottom
            }
          ],
          left: [
            {
              isNearly: this.isNearly(curComponentStyle.left, left),
              lineNode: lines.yl[0], // yl
              line: 'yl',
              dragShift: left,
              lineShift: left
            },
            {
              isNearly: this.isNearly(curComponentStyle.right, left),
              lineNode: lines.yl[0], // yl
              line: 'yl',
              dragShift: left - curComponentStyle.width,
              lineShift: left
            },
            {
              // 组件与拖拽节点的中间是否对齐
              isNearly: this.isNearly(
                curComponentStyle.left + curComponentHalfWidth,
                left + componentHalfWidth
              ),
              lineNode: lines.yc[0], // yc
              line: 'yc',
              dragShift: left + componentHalfWidth - curComponentHalfWidth,
              lineShift: left + componentHalfWidth
            },
            {
              isNearly: this.isNearly(curComponentStyle.left, right),
              lineNode: lines.yr[0], // yr
              line: 'yr',
              dragShift: right,
              lineShift: right
            },
            {
              isNearly: this.isNearly(curComponentStyle.right, right),
              lineNode: lines.yr[0], // yr
              line: 'yr',
              dragShift: right - curComponentStyle.width,
              lineShift: right
            }
          ]
        }

        const needToShow = []
        const { rotate } = this.curComponent.style
        Object.keys(conditions).forEach((key) => {
          // 遍历符合的条件并处理
          conditions[key].forEach((condition) => {
            if (!condition.isNearly) return
            // 修改当前组件位移
            this.$store.commit('printTemplateModule/setShapeSingleStyle', {
              key,
              value:
                rotate !== 0
                  ? this.translatecurComponentShift(
                      key,
                      condition,
                      curComponentStyle
                    )
                  : condition.dragShift
            })

            condition.lineNode.style[key] = `${condition.lineShift}px`
            needToShow.push(condition.line)
          })
        })

        // 同一方向上同时显示三条线可能不太美观，因此才有了这个解决方案
        // 同一方向上的线只显示一条，例如多条横条只显示一条横线
        if (needToShow.length) {
          this.chooseTheTureLine(needToShow, isDownward, isRightward)
        }
      })
    },

    translatecurComponentShift(key, condition, curComponentStyle) {
      const { width, height } = this.curComponent.style
      if (key === 'top') {
        return Math.round(
          condition.dragShift - (height - curComponentStyle.height) / 2
        )
      }

      return Math.round(
        condition.dragShift - (width - curComponentStyle.width) / 2
      )
    },

    chooseTheTureLine(needToShow, isDownward, isRightward) {
      // 如果鼠标向右移动 则按从右到左的顺序显示竖线 否则按相反顺序显示
      // 如果鼠标向下移动 则按从下到上的顺序显示横线 否则按相反顺序显示
      if (isRightward) {
        if (needToShow.includes('yr')) {
          this.lineStatus.yr = true
        } else if (needToShow.includes('yc')) {
          this.lineStatus.yc = true
        } else if (needToShow.includes('yl')) {
          this.lineStatus.yl = true
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (needToShow.includes('yl')) {
          this.lineStatus.yl = true
        } else if (needToShow.includes('yc')) {
          this.lineStatus.yc = true
        } else if (needToShow.includes('yr')) {
          this.lineStatus.yr = true
        }
      }

      if (isDownward) {
        if (needToShow.includes('xb')) {
          this.lineStatus.xb = true
        } else if (needToShow.includes('xc')) {
          this.lineStatus.xc = true
        } else if (needToShow.includes('xt')) {
          this.lineStatus.xt = true
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (needToShow.includes('xt')) {
          this.lineStatus.xt = true
        } else if (needToShow.includes('xc')) {
          this.lineStatus.xc = true
        } else if (needToShow.includes('xb')) {
          this.lineStatus.xb = true
        }
      }
    },

    isNearly(dragValue, targetValue) {
      return Math.abs(dragValue - targetValue) <= this.diff
    }
  }
}
</script>

<style lang="scss" scoped>
.roy-mark-line {
  height: 100%;
}

.roy-mark-line__line {
  background: var(--roy-color-primary);
  position: absolute;
  z-index: 1000;
}

.roy-mark-line--xline {
  width: 100%;
  height: 0.5px;
}

.roy-mark-line--yline {
  width: 0.5px;
  height: 100%;
}
</style>