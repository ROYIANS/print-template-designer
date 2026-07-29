<template>
  <li class="v-contextmenu-group">
    <ul :style="menusStyle" class="v-contextmenu-group__menus">
      <slot></slot>
    </ul>
  </li>
</template>

<script>
export default {
  name: 'ContextGroup',

  props: {
    maxWidth: {
      type: [Number, String],
      default: undefined
    }
  },

  computed: {
    menusStyle() {
      if (!this.maxWidth) {
        return null
      }

      return {
        'max-width': typeof this.maxWidth === 'number' ? `${this.maxWidth}px` : this.maxWidth,
        'overflow-x': 'auto'
      }
    }
  }
}
</script>
