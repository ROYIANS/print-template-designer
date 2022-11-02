<!--
* @description 矩形组件
* @filename RoyCircle.vue
* @author ROYIANS
* @date 2022/11/2 11:01
!-->
<template>
  <div class="RoyCircle">
    <StyledCircle v-bind="style" />
  </div>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import { StyledCircle } from '@/components/PageComponents/style'

/**
 * 矩形组件
 */
export default {
  name: 'RoyCircle',
  mixins: [commonMixin],
  components: {
    StyledCircle
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
.RoyCircle {
  width: 100%;
  height: 100%;
}
</style>
