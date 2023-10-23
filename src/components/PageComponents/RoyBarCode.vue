<!--
* @description 线组件
* @filename RoyLine.vue
* @author ROYIANS
* @date 2022/11/2 11:01
!-->
<template>
  <div class="RoyBarCode">
    <StyledBarCode v-bind="style">
      <div style="width: 100%; height: 100%" ref="barCode" />
      <div v-if="element.includeText" class="RoyBarCode__text" :style="textStyle">
        {{ element.text }}
      </div>
    </StyledBarCode>
  </div>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import { StyledBarCode } from '@/components/PageComponents/style'
import bwipjs from 'bwip-js'

/**
 * 条形码组件
 */
export default {
  name: 'RoyBarCode',
  mixins: [commonMixin],
  components: {
    StyledBarCode
  },
  props: {
    element: {
      type: Object,
      default: () => {}
    },
    propValue: {
      type: String,
      default: ''
    }
  },
  computed: {
    style() {
      return this.element.style || {}
    },
    textStyle() {
      return {
        color: this.element.colorDark,
        background: this.style.background
      }
    },
    drawerConfig() {
      return {
        bcid: this.element.bcid,
        scale: 2,
        width: this.element.style.width,
        height: this.element.style.height,
        text: this.element.text,
        barcolor: this.element.colorDark
      }
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
  watch: {
    drawerConfig: {
      handler() {
        this.$nextTick(() => {
          this.$refs.barCode.innerHTML = ''
          const c = document.createElement('canvas')
          let canvas = bwipjs.toCanvas(c, this.drawerConfig)
          this.$refs.barCode.appendChild(canvas)
          const dataURL = canvas.toDataURL('img/png')
          this.$store.commit('printTemplateModule/setPropValue', {
            id: this.element.id,
            propValue: dataURL
          })
        })
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss">
.RoyBarCode {
  height: 100%;
  width: 100%;
  position: relative;
  canvas,
  img {
    width: 100%;
    height: 100%;
  }
  .RoyBarCode__text {
    width: 100%;
    height: 14px;
    font-size: 12px;
    position: absolute;
    bottom: 0;
    left: 0;
    text-align: center;
  }
}
</style>
