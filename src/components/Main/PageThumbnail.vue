<!--
* @description 缩略图
* @filename PageThumbnail.vue
* @author ROYIANS
* @date 2022/9/26 11:15
!-->
<template>
  <div
    ref="thumbnail"
    style="
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    "
  ></div>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'

/**
 * 缩略图
 */
export default {
  name: 'PageThumbnail',
  mixins: [commonMixin],
  components: {},
  props: {
    element: {
      type: HTMLElement,
      default: null
    }
  },
  data() {
    return {}
  },
  methods: {
    initMounted() {
      if (this.element !== null) {
        this.$refs.thumbnail.appendChild(this.element)
      }
    }
  },
  created() {},
  mounted() {
    this.initMounted()
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
.PageThumbnail {
  height: 100%;
  padding: 6px;
}
</style>
