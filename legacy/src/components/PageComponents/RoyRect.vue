<!--
* @description 矩形组件
* @filename RoyRect.vue
* @author ROYIANS
* @date 2022/11/2 11:01
!-->
<template>
  <div class="RoyRect">
    <StyledRect v-bind="style" />
  </div>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import { StyledRect } from '@/components/PageComponents/style'

/**
 * 矩形组件
 */
export default {
  name: 'RoyRect',
  mixins: [commonMixin],
  components: {
    StyledRect
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
.RoyRect {
  width: 100%;
  height: 100%;
}
</style>
