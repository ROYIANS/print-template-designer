<!--
* @description
* @filename RoyGroup.vue.vue
* @author ROYIANS
* @date 2022/10/19 15:58
!-->
<template>
  <div class="roy-group">
    <div>
      <component
        :is="item.component"
        v-for="item in propValue"
        :id="'roy-component-' + item.id"
        :key="item.id"
        class="roy-group-component"
        :style="item.groupStyle"
        :prop-value="item.propValue"
        :element="item"
        :request="item.request"
      />
    </div>
  </div>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import RoyText from '@/components/PageComponents/RoyText'
import RoyRect from '@/components/PageComponents/RoyRect'

/**
 * roy-group
 */
export default {
  name: 'RoyGroup',
  mixins: [commonMixin],
  components: {
    RoyText,
    RoyRect
  },
  props: {
    propValue: {
      type: Array,
      default: () => []
    },
    element: {
      type: Object,
      default: () => {}
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

<style lang="scss" scoped>
.roy-group {
  & > div {
    position: relative;
    width: 100%;
    height: 100%;

    .roy-group-component {
      position: absolute;
    }
  }
}
</style>
