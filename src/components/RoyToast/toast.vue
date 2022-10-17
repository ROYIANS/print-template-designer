<!--
* @description 提示
* @filename toast.vue
* @author ROYIANS
* @date 2022/4/21 10:57
!-->
<template>
  <div
    v-if="visible"
    class="roy-toast roy-toast--center"
    :class="`roy-toast__status--${status} ${
      isPaused ? 'roy-toast--hover-tab' : ''
    }`"
    style="width: auto; opacity: 1"
    :style="positionStyle"
    @mouseenter="doPause"
    @mouseleave="doContinue"
  >
    <div></div>
    <div class="roy-toast__main">
      <i :class="icon"></i>
      <span
        v-if="dangerouslyUseHTMLString"
        class="roy-toast__message"
        v-html="message"
      ></span>
      <span v-else class="roy-toast__message">{{ message }}</span>
    </div>
    <i class="roy-toast__close ri-close-fill" @click="close"></i>
  </div>
</template>

<script>
/**
 * 提示
 */
export default {
  name: "RoyToast",
  components: {},
  props: {},
  data() {
    return {
      visible: false,
      dangerouslyUseHTMLString: false,
      message: "",
      status: "",
      duration: 5000,
      copiedDuration: 0,
      onClose: null,
      verticalOffset: 0,
      timer: null,
      pauseTimer: null,
      isPaused: false,
      tikDownInterval: null,
    };
  },
  computed: {
    icon() {
      switch (this.status) {
        case "info":
          return "ri-information-line";
        case "success":
          return "ri-checkbox-circle-line";
        case "warning":
          return "ri-error-warning-line";
        case "error":
          return "ri-close-circle-line";
        default:
          return "";
      }
    },
    positionStyle() {
      return {
        top: `${this.verticalOffset}px`,
        "--duration": `${Math.floor(this.duration / 1000)}s`,
      };
    },
  },
  methods: {
    close() {
      this.visible = false;
      this.onClose(this);
      this.$destroy();
      this.$el.parentNode.removeChild(this.$el);
    },
    clearTimer() {
      if (this.timer !== null) {
        clearTimeout(this.timer);
      }
      if (this.pauseTimer !== null) {
        clearTimeout(this.pauseTimer);
      }
      if (this.tikDownInterval !== null) {
        clearInterval(this.tikDownInterval);
      }
    },
    doPause() {
      this.pauseTimer = setTimeout(() => {
        this.doRestart(true);
      }, 2000);
    },
    doContinue() {
      if (this.timer !== null) {
        clearTimeout(this.pauseTimer);
      }
      this.doRestart(false);
      this.pauseTimer = null;
    },
    doRestart(isIn) {
      if (isIn) {
        this.clearTimer();
        this.isPaused = true;
      } else {
        if (this.isPaused) {
          this.startTimer();
          this.isPaused = false;
        }
      }
    },
    startTimer() {
      if (this.copiedDuration === 0) {
        this.copiedDuration = this.duration;
      }
      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          this.close();
        }, this.copiedDuration);
        this.tikDownInterval = setInterval(() => {
          if (this.copiedDuration > 1000) {
            this.copiedDuration -= 1000;
          }
        }, 1000);
      }
    },
  },
  created() {},
  mounted() {
    this.startTimer();
  },
  beforeDestroy() {
    this.clearTimer();
    this.timer = null;
    this.pauseTimer = null;
  },
  watch: {},
};
</script>

<style lang="scss">
.roy-toast {
  background: #4579e1;
  color: #fff;
  border-radius: 0;
  display: flex;
  justify-content: space-between;
  max-width: none;
  min-width: 100%;
  margin: 0;
  left: 0;
  transform: none;
  transition: all 0.5s ease;
  transition-property: top, right, bottom, left, opacity;
  font-size: 14px;
  min-height: 30px;
  max-height: 100px;
  position: fixed;
  align-items: center;
  padding: 5px 24px;
  bottom: -100px;
  top: -100px;
  opacity: 0;
  z-index: 9999;
  &.roy-toast--center {
    left: 50%;
    transform: translate(-50%, 0);
    bottom: auto;
    top: 0;
  }
  &.roy-toast__status--warning {
    color: #ffffff;
    background: #ffa522;
  }
  &.roy-toast__status--error {
    color: #fff;
    background: #ff4843;
  }
  &.roy-toast__status--success {
    color: #fff;
    background: #009688;
  }
  .roy-toast__main {
    width: 70%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .roy-toast__message {
    max-height: 80px;
    max-width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    word-break: break-all;
    height: 100%;
    line-height: 30px;
    padding: 0;
  }
  span {
    margin: 0;
    padding: 0;
    line-height: 1em;
  }
  i {
    padding-right: 8px;
  }
  &::after {
    position: absolute;
    width: 0;
    height: 100%;
    left: 0;
    top: 0;
    background: #fff;
    opacity: 0.1;
    content: "";
    animation: roy-toast__snackbar-progress var(--duration) linear forwards;
    pointer-events: none;
  }
  &.roy-toast--hover-tab {
    &::after {
      animation-play-state: paused;
    }
  }
  .roy-toast__close {
    font-weight: bold;
    border-radius: 2px;
    padding: 0 5px;
    margin-right: 15px;
    cursor: pointer;
    &:hover {
      background: rgba(#fff, 0.4);
    }
  }
  @keyframes roy-toast__snackbar-progress {
    from {
      width: 0;
    }

    to {
      width: 100%;
    }
  }
}
</style>
