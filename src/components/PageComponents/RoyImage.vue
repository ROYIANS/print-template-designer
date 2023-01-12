<!--
* @description 图片组件
* @filename RoyImage.vue
* @author ROYIANS
* @date 2022/12/6 14:49
!-->
<template>
  <div class="RoyImage">
    <StyledImage v-bind="style">
      <img :alt="element.title || 'RoyImage'" :src="element.src" />
    </StyledImage>
  </div>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import { StyledImage } from '@/components/PageComponents/style'

/**
 * 图片组件
 */
export default {
  name: 'RoyImage',
  mixins: [commonMixin],
  components: {
    StyledImage
  },
  props: {
    element: {
      type: Object,
      default: () => {}
    },
    propValue: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  computed: {
    style() {
      return this.element.style || {}
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
.RoyImage {
  height: 100%;
  padding: 0;
}
</style>
