<!--
* @description 模态框
* @filename RoyModal.vue
* @author ROYIANS
* @date 2022/10/20 10:12
!-->
<template>
  <div
    ref="modal"
    class="roy-modal-container"
    :class="show ? 'roy-modal-sketch' : 'roy-modal-out'"
  >
    <div class="roy-modal-modal-background">
      <div class="roy-modal-modal">
        <svg
          class="roy-modal-modal-svg"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
        >
          <rect
            x="0"
            y="0"
            fill="none"
            width="100%"
            height="100%"
            rx="3"
            ry="3"
          ></rect>
        </svg>
        <slot></slot>
        <div class="roy-modal-close" @click="close">
          <i class="ri-close-circle-fill"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoyModal',
  components: {},
  props: {
    appendToBody: {
      type: Boolean,
      default: true
    },
    show: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: '50%'
    },
    height: {
      type: String,
      default: '50%'
    }
  },
  data() {
    return {}
  },
  methods: {
    initMounted() {
      if (this.show) {
        if (this.appendToBody) {
          document.body.appendChild(this.$el)
        }
      }
    },
    close() {
      this.$emit('close')
      this.$emit('update:show', false)
    }
  },
  created() {},
  mounted() {
    this.initMounted()
  },
  destroyed() {
    // if appendToBody is true, remove DOM node after destroy
    if (this.appendToBody && this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        if (this.appendToBody) {
          document.body.appendChild(this.$el)
        }
      }
    }
  }
}
</script>

<style lang="scss">
.roy-modal-container {
  position: fixed;
  display: table;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  transform: scale(0);
  background: rgba(0, 0, 0, 0.7);
  z-index: 99999;
  &.roy-modal-sketch {
    transform: scale(1);
    .roy-modal-modal-background {
      background: rgba(0, 0, 0, 0);
      animation: fadeIn 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
      .roy-modal-modal {
        background-color: transparent;
        animation: modalFadeIn 0.5s 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)
          forwards;
        width: v-bind(width);
        height: v-bind(height);
        .roy-modal-modal-svg {
          rect {
            animation: sketchIn 0.5s 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)
              forwards;
          }
        }
      }
    }
    &.roy-modal-out {
      animation: quickScaleDown 0s 0.5s linear forwards;
      .roy-modal-modal-background {
        animation: fadeOut 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        .roy-modal-modal {
          animation: modalFadeOut 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)
            forwards;
          .roy-modal-modal-svg {
            rect {
              animation: sketchOut 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)
                forwards;
            }
          }
        }
      }
    }
  }

  .roy-modal-modal-background {
    display: flex;
    background: rgba(0, 0, 0, 0.8);
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    .roy-modal-modal {
      background: white;
      padding: 10px;
      display: inline-block;
      border-radius: 3px;
      font-weight: 300;
      position: relative;
      .roy-modal-modal-svg {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        border-radius: 3px;
        z-index: 0;
        rect {
          stroke: #fff;
          stroke-width: 2px;
          stroke-dasharray: 778;
          stroke-dashoffset: 778;
        }
      }
    }
  }

  .roy-modal-close {
    width: 20px;
    height: 20px;
    margin: 5px;
    position: absolute;
    top: -30px;
    right: 0;
    i {
      color: #ffffff;
      cursor: pointer;
      font-size: 20px;
      &:hover {
        color: #cccccc;
      }
    }
  }

  @keyframes fadeIn {
    0% {
      background: rgba(0, 0, 0, 0);
    }
    100% {
      background: rgba(0, 0, 0, 0.7);
    }
  }

  @keyframes fadeOut {
    0% {
      background: rgba(0, 0, 0, 0.7);
    }
    100% {
      background: rgba(0, 0, 0, 0);
    }
  }

  @keyframes scaleDown {
    0% {
      transform: scale(1) translateY(0px);
      opacity: 1;
    }
    100% {
      transform: scale(0.8) translateY(1000px);
      opacity: 0;
    }
  }

  @keyframes quickScaleDown {
    0% {
      transform: scale(1);
    }
    99.9% {
      transform: scale(1);
    }
    100% {
      transform: scale(0);
    }
  }

  @keyframes sketchIn {
    0% {
      stroke-dashoffset: 778;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }

  @keyframes sketchOut {
    0% {
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dashoffset: 778;
    }
  }

  @keyframes modalFadeIn {
    0% {
      background-color: transparent;
    }
    100% {
      background-color: white;
    }
  }

  @keyframes modalFadeOut {
    0% {
      background-color: white;
    }
    100% {
      background-color: transparent;
    }
  }

  @keyframes modalContentFadeIn {
    0% {
      opacity: 0;
      top: -20px;
    }
    100% {
      opacity: 1;
      top: 0;
    }
  }

  @keyframes modalContentFadeOut {
    0% {
      opacity: 1;
      top: 0;
    }
    100% {
      opacity: 0;
      top: -20px;
    }
  }
}
</style>
