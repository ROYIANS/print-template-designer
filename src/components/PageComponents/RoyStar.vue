<!--
* @description 五角星
* @filename RoyStar.vue
* @author ROYIANS
* @date 2022/11/3 10:14
!-->
<template>
  <div class="RoyStar">
    <StyledStar v-bind="style">
      <span :class="style.icon" class="iconfont roy-star-icon"></span>
    </StyledStar>
  </div>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import { StyledStar } from '@/components/PageComponents/style'

/**
 * 五角星
 */
export default {
  name: 'RoyStar',
  mixins: [commonMixin],
  components: {
    StyledStar
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
.RoyStar {
  width: 100%;
  height: 100%;
}
</style>
