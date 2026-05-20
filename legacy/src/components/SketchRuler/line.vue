<template>
  <div v-show="showLine" :style="[offset, borderCursor]" class="line" @mousedown="handleDown">
    <div :style="actionStyle" class="action">
      <span class="del" @click="this.handleRemove">&times;</span>
      <span class="value">{{ startValue }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'LineRuler',
  data() {
    return {
      startValue: 0
    }
  },
  props: {
    index: Number,
    start: Number,
    vertical: Boolean,
    scale: Number,
    value: Number,
    palette: Object,
    isShowReferLine: Boolean,
    thick: Number
  },
  computed: {
    offset() {
      const offset = (this.startValue - this.start) * this.scale
      const positionValue = offset + 'px'
      return this.vertical ? { top: positionValue } : { left: positionValue }
    },
    showLine() {
      const offset = (this.startValue - this.start) * this.scale
      return offset >= 0
    },
    borderCursor() {
      const borderValue = `1px solid ${this.palette.lineColor}`
      const border = this.vertical ? { borderTop: borderValue } : { borderLeft: borderValue }

      const cursorValue = this.isShowReferLine
        ? this.vertical
          ? 'ns-resize'
          : 'ew-resize'
        : 'none'
      return {
        cursor: cursorValue,
        ...border
      }
    },
    actionStyle() {
      return this.vertical ? { left: this.thick + 'px' } : { top: this.thick + 'px' }
    }
  },
  methods: {
    handleDown(e) {
      const startD = this.vertical ? e.clientY : e.clientX
      const initValue = this.startValue
      this.$emit('onMouseDown')
      const onMove = (e) => {
        const currentD = this.vertical ? e.clientY : e.clientX
        this.startValue = Math.round(initValue + (currentD - startD) / this.scale)
      }
      const onEnd = () => {
        this.$emit('onRelease', this.startValue, this.index)
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onEnd)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onEnd)
    },
    handleRemove() {
      this.$emit('onRemove', this.index)
    },
    initStartValue() {
      this.startValue = this.value
    }
  },
  mounted() {
    this.initStartValue()
  }
}
</script>

<style lang="scss" scoped>
.line {
  position: absolute;

  .action {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .value {
    pointer-events: none;
    transform: scale(0.83);
  }

  .del {
    cursor: pointer;
    padding: 3px 5px;
    visibility: hidden;
  }

  &:hover .del {
    visibility: visible;
  }
}

.h-container {
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
}

.v-container {
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
}
</style>
