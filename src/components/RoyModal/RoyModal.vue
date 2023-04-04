<!--
* @description 模态框
* @filename RoyModal.vue
* @author ROYIANS
* @date 2022/10/20 10:12
!-->
<template>
  <vxe-modal
    v-model="visibleIn"
    :height="height"
    :show-footer="showFooter"
    :title="title"
    :transfer="appendToBody"
    :width="width"
    remember
    resize
    show-zoom
    @close="close"
  >
    <slot></slot>
    <template v-slot:footer>
      <slot name="footer"></slot>
    </template>
  </vxe-modal>
</template>

<script>
export default {
  name: 'RoyModal',
  components: {},
  props: {
    appendToBody: {
      type: Boolean,
      default: true
    },
    show: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: '50%'
    },
    height: {
      type: String,
      default: '50%'
    },
    title: {
      type: String,
      default: '消息'
    },
    showFooter: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visibleIn: this.show
    }
  },
  methods: {
    initMounted() {},
    close() {
      this.$emit('close')
      this.$emit('update:show', false)
    }
  },
  created() {},
  mounted() {
    this.initMounted()
  },
  destroyed() {},
  watch: {
    show() {
      this.visibleIn = this.show
    }
  }
}
</script>

<style lang="scss"></style>
