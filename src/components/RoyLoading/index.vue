<!--
* @description 加载界面
* @filename index.vue
* @author ROYIANS
* @date 2022/11/21 10:03
!-->
<template>
  <div class="roy-loading">
    <div v-if="loading" class="roy-loading-loading">
      <div class="roy-loading__container">
        <div class="roy-loading__gearbox">
          <div class="roy-loading__overlay"></div>
          <div class="roy-loading__gear roy-loading__one">
            <div class="roy-loading__gear-inner">
              <div class="roy-loading__bar"></div>
              <div class="roy-loading__bar"></div>
              <div class="roy-loading__bar"></div>
            </div>
          </div>
          <div class="roy-loading__gear roy-loading__two">
            <div class="roy-loading__gear-inner">
              <div class="roy-loading__bar"></div>
              <div class="roy-loading__bar"></div>
              <div class="roy-loading__bar"></div>
            </div>
          </div>
          <div class="roy-loading__gear roy-loading__three">
            <div class="roy-loading__gear-inner">
              <div class="roy-loading__bar"></div>
              <div class="roy-loading__bar"></div>
              <div class="roy-loading__bar"></div>
            </div>
          </div>
          <div class="roy-loading__gear roy-loading__four roy-loading__large">
            <div class="roy-loading__gear-inner">
              <div class="roy-loading__bar"></div>
              <div class="roy-loading__bar"></div>
              <div class="roy-loading__bar"></div>
              <div class="roy-loading__bar"></div>
              <div class="roy-loading__bar"></div>
              <div class="roy-loading__bar"></div>
            </div>
          </div>
        </div>
        <h1>{{ loadingText }}</h1>
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
.roy-loading,
.roy-loading-slot,
.roy-loading-loading {
  width: 100%;
  height: 100%;
}

.roy-loading-loading {
  background: #333333;
  z-index: 99999;
  position: absolute;
  left: 0;
  top: 0;
  @keyframes roy-loading__clockwise {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes roy-loading__counter-clockwise {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(-360deg);
    }
  }

  .roy-loading__container {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -100px;
    height: 150px;
    width: 200px;
    margin-top: -75px;
  }

  .roy-loading__gearbox {
    background: #111;
    height: 150px;
    width: 200px;
    position: relative;
    border: none;
    overflow: hidden;
    border-radius: 6px;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  .roy-loading__gearbox .roy-loading__overlay {
    border-radius: 6px;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    box-shadow: inset 0px 0px 20px black;
    transition: background 0.2s;
  }

  .roy-loading__gearbox.turn .roy-loading__overlay {
    background: transparent;
  }

  .roy-loading__gear {
    position: absolute;
    height: 60px;
    width: 60px;
    box-shadow: 0px -1px 0px 0px #888888, 0px 1px 0px 0px black;
    border-radius: 30px;
  }

  .roy-loading__gear.roy-loading__large {
    height: 120px;
    width: 120px;
    border-radius: 60px;
  }

  .roy-loading__gear.roy-loading__large:after {
    height: 96px;
    width: 96px;
    border-radius: 48px;
    margin-left: -48px;
    margin-top: -48px;
  }

  .roy-loading__gear.roy-loading__one {
    top: 12px;
    left: 10px;
  }

  .roy-loading__gear.roy-loading__two {
    top: 61px;
    left: 60px;
  }

  .roy-loading__gear.roy-loading__three {
    top: 110px;
    left: 10px;
  }

  .roy-loading__gear.roy-loading__four {
    top: 13px;
    left: 128px;
  }

  .roy-loading__gear:after {
    content: '';
    position: absolute;
    height: 36px;
    width: 36px;
    -moz-border-radius: 36px;
    -webkit-border-radius: 36px;
    border-radius: 36px;
    background: #111;
    top: 50%;
    left: 50%;
    margin-left: -18px;
    margin-top: -18px;
    z-index: 3;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.1), inset 0 0 10px rgba(0, 0, 0, 0.1),
      inset 0 2px 0 0 #090909, inset 0px -1px 0px 0px #888888;
  }

  .roy-loading__gear-inner {
    position: relative;
    height: 100%;
    width: 100%;
    background: #555;
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .roy-loading__large .roy-loading__gear-inner {
    border-radius: 60px;
  }

  .roy-loading__gear.roy-loading__one .roy-loading__gear-inner {
    animation: roy-loading__counter-clockwise 3s infinite linear;
  }

  .roy-loading__gear.roy-loading__two .roy-loading__gear-inner {
    animation: roy-loading__clockwise 3s infinite linear;
  }

  .roy-loading__gear.roy-loading__three .roy-loading__gear-inner {
    animation: roy-loading__counter-clockwise 3s infinite linear;
  }

  .roy-loading__gear.roy-loading__four .roy-loading__gear-inner {
    animation: roy-loading__counter-clockwise 6s infinite linear;
  }

  .roy-loading__gear-inner .roy-loading__bar {
    background: #555;
    height: 16px;
    width: 76px;
    position: absolute;
    left: 50%;
    margin-left: -38px;
    top: 50%;
    margin-top: -8px;
    border-radius: 2px;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }

  .roy-loading__large .roy-loading__gear-inner .roy-loading__bar {
    margin-left: -68px;
    width: 136px;
  }

  .roy-loading__gear-inner .roy-loading__bar:nth-child(2) {
    transform: rotate(60deg);
  }

  .roy-loading__gear-inner .roy-loading__bar:nth-child(3) {
    transform: rotate(120deg);
  }

  .roy-loading__gear-inner .roy-loading__bar:nth-child(4) {
    transform: rotate(90deg);
  }

  .roy-loading__gear-inner .roy-loading__bar:nth-child(5) {
    transform: rotate(30deg);
  }

  .roy-loading__gear-inner .roy-loading__bar:nth-child(6) {
    transform: rotate(150deg);
  }

  h1 {
    font-family: 'Helvetica', serif;
    text-align: center;
    text-transform: uppercase;
    color: #888;
    font-size: 19px;
    padding-top: 10px;
  }
}
</style>
