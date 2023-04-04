<!--
* @description
* @filename RoyContainer.vue
* @author ROYIANS
* @date 2023/4/3 10:22
!-->
<template>
  <section :class="{ 'is-vertical': isVertical }" class="roy-container">
    <slot></slot>
  </section>
</template>

<script>
/**
 *  容器组件
 */
export default {
  name: 'RoyContainer',
  componentName: 'RoyContainer',
  components: {},
  props: {
    direction: String
  },
  data() {
    return {}
  },
  computed: {
    isVertical() {
      if (this.direction === 'vertical') {
        return true
      } else if (this.direction === 'horizontal') {
        return false
      }
      return this.$slots && this.$slots.default
        ? this.$slots.default.some((vnode) => {
            const tag = vnode.componentOptions && vnode.componentOptions.tag
            return tag === 'roy-header' || tag === 'roy-footer'
          })
        : false
    }
  },
  methods: {},
  created() {},
  mounted() {},
  watch: {}
}
</script>
