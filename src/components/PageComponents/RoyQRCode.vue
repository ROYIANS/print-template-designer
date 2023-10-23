<!--
* @description 线组件
* @filename RoyLine.vue
* @author ROYIANS
* @date 2022/11/2 11:01
!-->
<template>
  <div class="RoyQRCode">
    <StyledQRCode v-bind="style" ref="qrCode" />
  </div>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import { StyledQRCode } from '@/components/PageComponents/style'
import QRCode from 'easyqrcodejs'

/**
 * 二维码组件
 */
export default {
  name: 'RoyQRCode',
  mixins: [commonMixin],
  components: {
    StyledQRCode
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
    drawerConfig() {
      return {
        width: this.element.style.width,
        height: this.element.style.height,
        text: this.element.text,
        colorDark: this.element.colorDark,
        colorLight: this.element.colorLight,
        correctLevel: this.element.correctLevel,
        onRenderingEnd: (_, dataURL) => {
          this.$store.commit('printTemplateModule/setPropValue', {
            id: this.element.id,
            propValue: dataURL
          })
        }
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
          this.$refs.qrCode.$el.innerHTML = ''
          new QRCode(this.$refs.qrCode.$el, this.drawerConfig)
        })
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss">
.RoyQRCode {
  height: 100%;
  width: 100%;
  canvas,
  img {
    width: 100%;
    height: 100%;
  }
}
</style>
