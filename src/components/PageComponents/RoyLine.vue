<!--
* @description 线组件
* @filename RoyLine.vue
* @author ROYIANS
* @date 2022/11/2 11:01
!-->
<template>
  <div class="RoyLine">
    <StyledLine v-bind="style" />
  </div>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import { StyledLine } from '@/components/PageComponents/style'

/**
 * 矩形组件
 */
export default {
  name: 'RoyLine',
  mixins: [commonMixin],
  components: {
    StyledLine
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
.RoyLine {
  height: 100%;
  width: 100%;
}
</style>
