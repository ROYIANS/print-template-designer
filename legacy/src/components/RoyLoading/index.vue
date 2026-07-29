<!--
* @description 加载界面
* @filename index.vue
* @author ROYIANS
* @date 2022/11/21 10:03
!-->
<template>
  <div class="roy-loading">
    <div v-if="loading" class="roy-loading-wrapper">
      <div class="generate-load centered" style="display: block">
        <div class="sm-gear"><i></i><i></i><i></i><i></i></div>
        <div class="sm-gear"><i></i><i></i><i></i><i></i></div>
        <div class="sm-gear"><i></i><i></i><i></i><i></i></div>
        <span class="load-status">{{ loadingText }}</span>
      </div>
    </div>
    <div class="roy-loading-slot">
      <slot></slot>
    </div>
  </div>
</template>

<script>
/**
 * 加载界面
 */
export default {
  name: 'RoyLoading',
  components: {},
  props: {
    loading: {
      type: Boolean,
      default: true
    },
    loadingText: {
      type: String,
      default: '加载中...'
    }
  },
  data() {
    return {}
  },
  methods: {
    initMounted() {}
  },
  created() {},
  mounted() {
    this.initMounted()
  },
  watch: {}
}
</script>

<style lang="scss">
.roy-loading {
  left: 0;
  top: 0;
  position: relative;
  width: 100%;
  height: 100%;
  background: #ffffff;

  .roy-loading-slot {
    z-index: 0;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }

  .roy-loading-wrapper {
    background: #ffffff;
    width: 100%;
    height: 100%;
    z-index: 100;
    position: absolute;
    left: 0;
    top: 0;
  }

  .generate-load {
    display: none;
    position: relative;
    height: 90px;
    width: auto;
    border-radius: 8px;
    transform: translateY(-10%);
  }

  .generate-load > .load-status {
    padding-left: 55px;
    font-size: 1.2em;
  }

  .generate-load.centered {
    display: block;
    position: absolute;
    height: 25px;
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
  }

  .generate-load.centered:after {
    content: '';
    display: block;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    height: 50px;
    width: calc(100% + 5%);
    z-index: -1;
  }

  .sm-gear {
    display: inline-block;
    position: absolute;
    height: 15px;
    width: 15px;
    background: transparent;
    border: #2b3139 4px solid;
    border-radius: 50%;
    box-sizing: border-box;
    transition: all 0.8s ease;
    margin: 10px;
    transform: translate(-50%, -50%);
    transform-origin: 50% 50%;
  }

  .sm-gear > i {
    display: block;
    position: absolute;
    left: 50%;
    top: 50%;
    transform-origin: 50% 50%;
    transform: translate(-50%, -50%);
    height: 100%;
    width: 100%;
  }

  .sm-gear > i:after {
    content: '';
    display: block;
    height: 3px;
    width: 4px;
    position: absolute;
    background: #2b3139;
    left: 50%;
    top: -4px;
    transform: translate(-50%, -80%);
    clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
  }

  .sm-gear > i:before {
    content: '';
    display: block;
    height: 3px;
    width: 4px;
    position: absolute;
    background: #2b3139;
    left: 50%;
    top: calc(100% + 4px);
    transform: translate(-50%, -20%);
    clip-path: polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%);
  }

  .sm-gear > i:nth-child(1) {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  .sm-gear > i:nth-child(2) {
    transform: translate(-50%, -50%) rotate(45deg);
  }

  .sm-gear > i:nth-child(3) {
    transform: translate(-50%, -50%) rotate(90deg);
  }

  .sm-gear > i:nth-child(4) {
    transform: translate(-50%, -50%) rotate(135deg);
  }

  .generate-load > .sm-gear:nth-child(1) {
    left: 0;
    top: 0;
  }

  .generate-load > .sm-gear:nth-child(3) {
    left: 24px;
    top: 0;
  }

  .generate-load > .sm-gear:nth-child(2) {
    left: 12px;
    top: 13px;
    transform: translate(-50%, -50%) rotate(20deg);
  }

  @keyframes roll_l {
    0% {
      transform: translate(-50%, -50%) rotate(0);
    }

    100% {
      transform: translate(-50%, -50%) rotate(-360deg);
    }
  }

  @keyframes roll_r {
    0% {
      transform: translate(-50%, -50%) rotate(20deg);
    }

    100% {
      transform: translate(-50%, -50%) rotate(380deg);
    }
  }

  .generate-load > .sm-gear:nth-child(1) {
    animation: roll_l 3s infinite linear;
  }

  .generate-load > .sm-gear:nth-child(3) {
    animation: roll_l 3s infinite linear;
  }

  .generate-load > .sm-gear:nth-child(2) {
    animation: roll_r 3s infinite linear;
  }

  @media only screen and (min-width: 370px) and (max-width: 667px) {
    .generate-load {
      display: none;
      position: relative;
      height: 15px;
      width: auto;
      transform: translateY(-10%);
    }

    .generate-load > .load-status {
      padding-left: 35px;
      font-size: 0.7em;
    }

    .sm-gear {
      display: inline-block;
      position: absolute;
      height: 10px;
      width: 10px;
      background: transparent;
      border: #2b3139 2px solid;
      border-radius: 50%;
      box-sizing: border-box;
      transition: all 0.8s ease;
      margin: 5px;
      transform: translate(-50%, -50%);
      transform-origin: 50% 50%;
    }

    .sm-gear > i:after {
      content: '';
      display: block;
      height: 3px;
      width: 3px;
      position: absolute;
      background: #2b3139;
      left: 50%;
      top: -4px;
      transform: translate(-50%, -30%);
      clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
      -webkit-clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
    }

    .sm-gear > i:before {
      content: '';
      display: block;
      height: 3px;
      width: 3px;
      position: absolute;
      background: #2b3139;
      left: 50%;
      top: calc(100% + 4px);
      transform: translate(-50%, -70%);
      clip-path: polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%);
      -webkit-clip-path: polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%);
    }

    .generate-load > .sm-gear:nth-child(1) {
      left: 0;
      top: 0;
    }

    .generate-load > .sm-gear:nth-child(3) {
      left: 20px;
      top: 0;
    }

    .generate-load > .sm-gear:nth-child(2) {
      left: 10px;
      top: 10px;
      transform: translate(-50%, -50%) rotate(20deg);
    }
  }
}
</style>
