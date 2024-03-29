<template>
  <div :class="rwClassName" :style="rwStyle">
    <CanvasRuler
      :canvasConfigs="canvasConfigs"
      :height="height"
      :scale="scale"
      :selectLength="selectLength"
      :selectStart="selectStart"
      :start="start"
      :vertical="vertical"
      :width="width"
      @onAddLine="handleNewLine"
      @onIndicatorHide="handleIndicatorHide"
      @onIndicatorMove="handleIndicatorMove"
      @onIndicatorShow="handleIndicatorShow"
    >
    </CanvasRuler>
    <div v-show="isShowReferLine" class="lines">
      <LineRuler
        v-for="(v, i) in lines"
        :key="v + i"
        :index="i"
        :isShowReferLine="isShowReferLine"
        :palette="palette"
        :scale="scale"
        :start="start"
        :thick="thick"
        :value="v >> 0"
        :vertical="vertical"
        @onMouseDown="handleLineDown"
        @onRelease="handleLineRelease"
        @onRemove="handleLineRemove"
      >
      </LineRuler>
    </div>
    <div v-show="showIndicator" :style="indicatorStyle" class="indicator">
      <div class="value">{{ value }}</div>
    </div>
  </div>
</template>

<script>
import LineRuler from './line.vue'
import CanvasRuler from './canvasRuler/canvasRuler.vue'

export default {
  name: 'RulerWrapper',
  components: {
    CanvasRuler,
    LineRuler
  },
  props: {
    vertical: Boolean,
    scale: Number,
    width: Number,
    thick: Number,
    height: Number,
    start: Number,
    lines: Array,
    selectStart: Number,
    selectLength: Number,
    canvasConfigs: Object,
    palette: Object,
    isShowReferLine: Boolean,
    onShowRightMenu: Function,
    handleShowReferLine: Function
  },
  data() {
    return {
      isDraggingLine: false,
      showIndicator: false,
      value: 0
    }
  },
  computed: {
    rwClassName() {
      return this.vertical ? 'v-container' : 'h-container'
    },
    rwStyle() {
      const hContainer = {
        width: `calc(100% - ${this.thick}px)`,
        height: `${this.thick + 1}px`,
        left: `${this.thick}` + 'px'
      }
      const vContainer = {
        width: `${this.thick + 1}px`,
        height: `calc(100% - ${this.thick}px)`,
        top: `${this.thick}` + 'px'
      }
      return this.vertical ? vContainer : hContainer
    },
    lineStyle() {
      return {
        borderTop: `1px solid ${this.palette.lineColor}`,
        cursor: this.isShowReferLine ? 'ns-resize' : 'none'
      }
    },
    indicatorStyle() {
      const indicatorOffset = (this.value - this.start) * this.scale
      let positionKey = 'top'
      let boderKey = 'borderLeft'
      positionKey = this.vertical ? 'top' : 'left'
      boderKey = this.vertical ? 'borderBottom' : 'borderLeft'
      return {
        [positionKey]: indicatorOffset + 'px',
        [boderKey]: `1px solid ${this.palette.lineColor}`
      }
    }
  },
  methods: {
    handleNewLine(value) {
      // eslint-disable-next-line vue/no-mutating-props
      this.lines.push(value)
      this.$emit('onLineChange', this.lines, this.vertical)
      // !isShowReferLine && handleShowReferLine()
    },
    handleIndicatorShow(value) {
      if (!this.isDraggingLine) {
        this.showIndicator = true
        this.value = value
      }
    },
    handleIndicatorMove(value) {
      if (this.showIndicator) {
        this.value = value
      }
    },
    handleIndicatorHide() {
      this.showIndicator = false
    },
    handleLineDown() {
      this.isDraggingLine = true
    },
    handleLineRelease(value, index) {
      this.isDraggingLine = false
      // 左右或上下超出时, 删除该条对齐线
      const offset = value - this.start
      const maxOffset = (this.vertical ? this.height : this.width) / this.scale

      if (offset < 0 || offset > maxOffset) {
        this.handleLineRemove(index)
      } else {
        // eslint-disable-next-line vue/no-mutating-props
        this.lines[index] = value
        this.$emit('onLineChange', this.lines, this.vertical)
      }
    },
    handleLineRemove(index) {
      // eslint-disable-next-line vue/no-mutating-props
      this.lines.splice(index, 1)
      this.$emit('onLineChange', this.lines, this.vertical)
    }
  }
}
</script>

<style lang="scss" scoped>
.line {
  position: absolute;
}

.h-container,
.v-container {
  position: absolute;

  .lines {
    pointer-events: none;
  }

  &:hover .lines {
    pointer-events: auto;
  }
}

.h-container {
  top: 0;

  .line {
    height: 100vh;
    top: 0;
    padding-left: 5px;

    .action {
      transform: translateX(-24px);

      .value {
        margin-left: 4px;
      }
    }
  }

  .indicator {
    top: 0;
    height: 100vw;

    .value {
      padding: 0 2px;
      width: auto;
      margin-left: 4px;
      margin-top: 4px;
    }
  }
}

.v-container {
  left: 0;

  .line {
    width: 100vw;
    left: 0;
    padding-top: 5px;

    .action {
      transform: translateY(-24px);
      flex-direction: column;

      .value {
        margin-top: 4px;
      }
    }
  }

  .indicator {
    width: 100vw;

    .value {
      padding: 0 2px;
      width: auto;
      left: 0;
      margin-left: 2px;
      margin-top: -5px;
      transform-origin: 0 0;
      transform: rotate(-90deg);
    }
  }
}
</style>
